import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { messagingApi } from '@line/bot-sdk';

function addCorsHeaders(res: NextResponse) {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
}

export async function POST(req: NextRequest) {
    console.log('[Sync] --- API START ---');
    try {
        const body = await req.json();
        const { channelId, channelSecret, channelAccessToken, botBasicId, setupToken, channelName, channelIcon } = body;
        
        console.log('[Sync] Request Body Keys:', Object.keys(body));
        console.log('[Sync] Received setupToken:', `"${setupToken}"`);

        const hasAnyData = !!channelId || !!channelSecret || !!channelAccessToken || !!botBasicId;
        if (!setupToken || !hasAnyData) {
            return addCorsHeaders(NextResponse.json({ error: '缺少權杖或同步資料' }, { status: 400 }));
        }

        // 1. Find the USER by setupToken first to ensure this is an authorized request
        const { data: initialConfig, error: findError } = await supabase
            .from('line_channel_configs')
            .select('*')
            .eq('setup_token', setupToken.trim())
            .maybeSingle();

        if (findError) {
            return addCorsHeaders(NextResponse.json({ error: '資料庫查詢失敗：' + findError.message }, { status: 500 }));
        }

        if (!initialConfig) {
            return addCorsHeaders(NextResponse.json({ error: '無效或已過期的同步權杖。請回到儀表板重新取得書籤！' }, { status: 401 }));
        }
        
        const userId = initialConfig.user_id;
        let configToUpdate = initialConfig;

        // 2. SMART MATCH: If channelId is provided, try to find a matching config for this user
        // This allows one bookmarklet to be used for multiple bots!
        if (channelId && channelId !== 'HIDDEN') {
            console.log('[Sync] Attempting to match channelId:', channelId);
            const { data: matchedConfig } = await supabase
                .from('line_channel_configs')
                .select('*')
                .eq('user_id', userId)
                .eq('channel_id', channelId)
                .maybeSingle();
            
            if (matchedConfig) {
                console.log('[Sync] Pattern matched! Targeted Bot ID:', matchedConfig.id);
                configToUpdate = matchedConfig;
            } else {
                // FALLBACK: If current slot is already taken by another bot, 
                // look for an empty slot for this user to avoid overwriting.
                if (initialConfig.channel_id && initialConfig.channel_id !== channelId) {
                    console.log('[Sync] Primary slot taken. Searching for an empty slot for user:', userId);
                    const { data: emptySlot } = await supabase
                        .from('line_channel_configs')
                        .select('*')
                        .eq('user_id', userId)
                        .is('channel_id', null)
                        .order('created_at', { ascending: true })
                        .limit(1)
                        .maybeSingle();
                    
                    if (emptySlot) {
                        console.log('[Sync] Found empty slot for shared bookmarklet:', emptySlot.id);
                        configToUpdate = emptySlot;
                    } else {
                        console.log('[Sync] No empty slots found. Will update primary slot (Overwrite risk).');
                    }
                } else {
                    console.log('[Sync] Using current setup slot (either empty or same ID).');
                }
            }
        }

        // 3. Prepare update data
        const updateData: any = {
            last_validated_at: new Date().toISOString()
        };
        if (channelId && channelId !== 'HIDDEN') updateData.channel_id = channelId;
        if (channelSecret && channelSecret !== 'HIDDEN') updateData.channel_secret = channelSecret;
        if (botBasicId && botBasicId !== 'HIDDEN') updateData.bot_basic_id = botBasicId;
        if (channelName) updateData.channel_name = channelName;
        if (channelIcon) updateData.channel_icon = channelIcon;
        
        const isAutomated = body.isAutomated === true;
        if (isAutomated && configToUpdate.status !== 'active') {
            updateData.status = 'automated';
        }

        if (channelAccessToken && channelAccessToken !== 'HIDDEN') {
            updateData.channel_access_token = channelAccessToken;
        }

        // 4. Verify if complete
        const finalChannelId = channelId || configToUpdate.channel_id;
        const finalSecret = channelSecret || configToUpdate.channel_secret;
        const finalBotId = botBasicId || configToUpdate.bot_basic_id;
        const finalToken = (channelAccessToken && channelAccessToken !== 'HIDDEN') ? channelAccessToken : configToUpdate.channel_access_token;

        const isFullyCaptured = finalChannelId && finalSecret && finalBotId && finalToken;

        if (isFullyCaptured) {
            try {
                const client = new messagingApi.MessagingApiClient({
                    channelAccessToken: finalToken
                });
                const botInfo = await client.getBotInfo();
                
                if (!updateData.channel_name && botInfo.displayName) {
                    updateData.channel_name = botInfo.displayName;
                }
                if (!updateData.channel_icon && botInfo.pictureUrl) {
                    updateData.channel_icon = botInfo.pictureUrl;
                }

                updateData.status = 'active';
                // Only clear setup_token if we are updating the record it was originally tied to
                if (configToUpdate.id === initialConfig.id) {
                    updateData.setup_token = null; 
                }
            } catch (lineErr: any) {
                console.warn('[Sync] LINE Verification Failed:', lineErr.message);
                // Keep automated status if it was set
            }
        }

        // 5. Update the record
        const { error: updateErr } = await supabase
            .from('line_channel_configs')
            .update(updateData)
            .eq('id', configToUpdate.id);

        if (updateErr) {
            console.error('[Sync] Final Update Error:', updateErr);
            return addCorsHeaders(NextResponse.json({ error: '同步失敗：' + updateErr.message }, { status: 500 }));
        }

        // 6. Return response with unique Webhook URL
        const domain = req.nextUrl.origin;
        const webhookUrl = `${domain}/api/line/webhook/${configToUpdate.id}`;

        return addCorsHeaders(NextResponse.json({ 
            success: true, 
            isComplete: updateData.status === 'active',
            channelName: updateData.channel_name || configToUpdate.channel_name,
            webhookUrl, // Unique to each bot!
            collected: {
                id: !!finalChannelId,
                sec: !!finalSecret,
                bot: !!finalBotId,
                tok: !!finalToken
            }
        }));
    } catch (error: any) {
        console.error('[Sync] Fatal Error:', error);
        return addCorsHeaders(NextResponse.json({ error: '系統異常：' + error.message }, { status: 500 }));
    }
}

export async function OPTIONS() {
    return addCorsHeaders(new NextResponse(null, { status: 204 }));
}
