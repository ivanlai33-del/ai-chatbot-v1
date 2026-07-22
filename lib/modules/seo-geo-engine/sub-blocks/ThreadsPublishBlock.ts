export class ThreadsPublishBlock {
    /**
     * 發布 Threads 爆款貼文
     */
    static async publishPost(
        accessToken: string,
        text: string
    ): Promise<{ success: boolean; postId?: string; error?: string }> {
        try {
            console.log(`[ThreadsPublishBlock] Publishing post to Threads API...`);

            if (!accessToken) {
                return {
                    success: false,
                    error: 'Threads Access Token 未設定或授權已到期'
                };
            }

            // 1. 建立 Media Container
            const containerRes = await fetch(`https://graph.threads.net/v1.0/me/threads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    media_type: 'TEXT',
                    text,
                    access_token: accessToken
                })
            });

            const containerData = await containerRes.json();
            if (!containerRes.ok || !containerData.id) {
                return {
                    success: false,
                    error: containerData.error?.message || 'Failed to create Threads container'
                };
            }

            // 2. 正式發布
            const publishRes = await fetch(`https://graph.threads.net/v1.0/me/threads_publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creation_id: containerData.id,
                    access_token: accessToken
                })
            });

            const publishData = await publishRes.json();
            if (!publishRes.ok || !publishData.id) {
                return {
                    success: false,
                    error: publishData.error?.message || 'Failed to publish Threads container'
                };
            }

            console.log(`[ThreadsPublishBlock] Post published successfully! Post ID: ${publishData.id}`);
            return {
                success: true,
                postId: publishData.id
            };
        } catch (error: any) {
            console.error('[ThreadsPublishBlock] Error:', error);
            return {
                success: false,
                error: error.message || 'Threads API error'
            };
        }
    }

    /**
     * 自動回覆 Threads 貼文留言
     */
    static async replyToComment(
        accessToken: string,
        replyToId: string,
        replyText: string
    ): Promise<{ success: boolean; replyId?: string; error?: string }> {
        try {
            console.log(`[ThreadsPublishBlock] Replying to comment ID ${replyToId}...`);

            const containerRes = await fetch(`https://graph.threads.net/v1.0/me/threads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    media_type: 'TEXT',
                    text: replyText,
                    reply_to_id: replyToId,
                    access_token: accessToken
                })
            });

            const containerData = await containerRes.json();
            if (!containerRes.ok || !containerData.id) {
                return { success: false, error: containerData.error?.message };
            }

            const publishRes = await fetch(`https://graph.threads.net/v1.0/me/threads_publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creation_id: containerData.id,
                    access_token: accessToken
                })
            });

            const publishData = await publishRes.json();
            return { success: publishRes.ok, replyId: publishData.id };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}
