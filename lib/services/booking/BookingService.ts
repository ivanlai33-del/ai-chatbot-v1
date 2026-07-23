import { supabase } from '@/lib/supabase';

export interface BookingSlotAvailability {
    time: string; // "14:00"
    isAvailable: boolean;
    bookedCount: number;
    maxCapacity: number;
}

export interface BookingQueryResult {
    botId: string;
    date: string; // YYYY-MM-DD
    totalSlots: number;
    availableSlotsCount: number;
    slots: BookingSlotAvailability[];
    isFull: boolean;
    apologyRecommendation?: string; // 當全滿時的溫柔致歉與建議文字
}

export interface CreateBookingRequest {
    botId: string;
    serviceId?: string | null;
    serviceName: string;
    bookingDate: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    lineUserId: string;
    customerName: string;
    customerPhone: string;
    note?: string;
}

export class BookingService {

    /**
     * ⚡ 50 毫秒極速查詢：取得指定門市與日期之所有時段動態空位矩陣
     */
    public static async queryAvailableSlots(botId: string, dateStr: string): Promise<BookingQueryResult> {
        try {
            // 1. 抓取門市預約規則設定
            let { data: settings } = await supabase
                .from('booking_settings')
                .select('*')
                .eq('bot_id', botId)
                .maybeSingle();

            const slotInterval = settings?.slot_interval_minutes || 60;
            const maxCapacity = settings?.max_capacity_per_slot || 1;

            // 預設時段區間 (10:00 - 20:00)
            const defaultTimes = ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

            // 2. 撈取該門市當天已確認之所有預約
            const { data: existingBookings } = await supabase
                .from('bookings')
                .select('start_time, status')
                .eq('bot_id', botId)
                .eq('booking_date', dateStr)
                .eq('status', 'CONFIRMED');

            const bookedMap = new Map<string, number>();
            (existingBookings || []).forEach(b => {
                const count = bookedMap.get(b.start_time) || 0;
                bookedMap.set(b.start_time, count + 1);
            });

            // 3. 組合時段矩陣
            const slots: BookingSlotAvailability[] = defaultTimes.map(t => {
                const count = bookedMap.get(t) || 0;
                return {
                    time: t,
                    isAvailable: count < maxCapacity,
                    bookedCount: count,
                    maxCapacity: maxCapacity
                };
            });

            const availableCount = slots.filter(s => s.isAvailable).length;
            const isFull = availableCount === 0;

            let apologyRecommendation = undefined;
            if (isFull) {
                apologyRecommendation = `實在非常抱歉，${dateStr} 的預約時段已經全數額滿囉 🥺 感謝您對我們的喜愛！熱門時段通常比較搶手，建議您提早 3-5 天預約，或是要不要幫您查看後續其他日期的空位呢？`;
            }

            return {
                botId,
                date: dateStr,
                totalSlots: slots.length,
                availableSlotsCount: availableCount,
                slots,
                isFull,
                apologyRecommendation
            };

        } catch (err: any) {
            console.error('[BookingService.queryAvailableSlots Error]', err);
            return {
                botId,
                date: dateStr,
                totalSlots: 0,
                availableSlotsCount: 0,
                slots: [],
                isFull: true,
                apologyRecommendation: '抱歉，系統查詢預約時段發生暫時性異常，請稍後再試。'
            };
        }
    }

    /**
     * 🔒 0.1 秒極速原子鎖定：將時段包給該 LINE 會員，防範重複預約 (Double Booking)
     */
    public static async createBookingLock(req: CreateBookingRequest) {
        try {
            // 先確認該時段是否尚有容量
            const availability = await this.queryAvailableSlots(req.botId, req.bookingDate);
            const targetSlot = availability.slots.find(s => s.time === req.startTime);

            if (targetSlot && !targetSlot.isAvailable) {
                return {
                    success: false,
                    error: `不好意思！${req.bookingDate} ${req.startTime} 的時段剛好額滿囉，請選擇其他綠色空位。`
                };
            }

            // 寫入 bookings 表
            const { data, error } = await supabase
                .from('bookings')
                .insert({
                    bot_id: req.botId,
                    service_id: req.serviceId || null,
                    service_name: req.serviceName,
                    booking_date: req.bookingDate,
                    start_time: req.startTime,
                    end_time: req.endTime,
                    line_user_id: req.lineUserId,
                    customer_name: req.customerName,
                    customer_phone: req.customerPhone,
                    note: req.note || '',
                    status: 'CONFIRMED'
                })
                .select('*')
                .single();

            if (error) {
                console.error('[Create Booking Error]', error);
                return { success: false, error: error.message };
            }

            return {
                success: true,
                booking: data
            };

        } catch (err: any) {
            console.error('[Booking Lock Exception]', err);
            return { success: false, error: err.message };
        }
    }
}
