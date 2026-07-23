import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { BookingService } from '@/lib/services/booking/BookingService';

/**
 * GET /api/bot/[botId]/booking?date=YYYY-MM-DD
 * 極速查詢該門市指定日期之剩餘空位與預約清單
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { botId: string } }
) {
    try {
        const botId = params.botId;
        const dateStr = req.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];

        // 1. 查詢空位矩陣
        const availability = await BookingService.queryAvailableSlots(botId, dateStr);

        // 2. 查詢該門市完整對帳單列表 (供老闆後台 Dashboard 檢視)
        const { data: allBookings } = await supabase
            .from('bookings')
            .select('*')
            .eq('bot_id', botId)
            .order('booking_date', { ascending: true })
            .order('start_time', { ascending: true });

        // 3. 查詢服務項目清單
        const { data: services } = await supabase
            .from('booking_services')
            .select('*')
            .eq('bot_id', botId)
            .eq('is_active', true);

        return NextResponse.json({
            success: true,
            availability,
            bookings: allBookings || [],
            services: services || []
        });

    } catch (err: any) {
        console.error('[Booking API GET Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * POST /api/bot/[botId]/booking
 * 0.1 秒極速預約鎖定 (顧客預約下單)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { botId: string } }
) {
    try {
        const botId = params.botId;
        const body = await req.json();

        // 情境 A：切換預約功能總開關 (Master Enable Toggle)
        if (body.action === 'TOGGLE_MASTER_BOOKING') {
            const { isBookingEnabled } = body;
            await supabase
                .from('booking_settings')
                .upsert({
                    bot_id: botId,
                    owner_line_id: body.ownerLineId || 'OWNER_DEFAULT',
                    is_enabled: isBookingEnabled,
                    updated_at: new Date().toISOString()
                });

            return NextResponse.json({
                success: true,
                isBookingEnabled
            });
        }

        const {
            serviceId,
            serviceName = '標準預約服務',
            bookingDate,
            startTime,
            endTime = '18:00',
            lineUserId,
            customerName,
            customerPhone,
            note
        } = body;

        if (!bookingDate || !startTime || !lineUserId || !customerName || !customerPhone) {
            return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
        }

        const result = await BookingService.createBookingLock({
            botId,
            serviceId,
            serviceName,
            bookingDate,
            startTime,
            endTime,
            lineUserId,
            customerName,
            customerPhone,
            note
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            booking: result.booking
        });

    } catch (err: any) {
        console.error('[Booking API POST Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
