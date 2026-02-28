# SaaS Partner API Integration Guide

This guide describes how to programmatically provision AI Chatbots for your customers using our Backend-to-Backend (B2B) API. This is specifically designed for partners like **StockRadar** to fully automate bot creation upon successful user subscription.

## Authentication
All API requests must be authenticated using your unique SaaS Partner API Key. Include this key in the `Authorization` header as a Bearer token.

**Your API Key (StockRadar-main)**: `13cdff30-6ecc-410c-b2d9-99bdc77d77cf`

---

## 1. Endpoint: Provision Bot
Creates a new AI Chatbot instance and automatically deducts one slot from your purchased quota (if applicable).

- **URL**: `POST https://ai-chatbot-v1-phi.vercel.app/api/partner/provision`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <API_KEY>`

### Request Body
```json
{
  "store_name": "Required. The display name of the bot (e.g., 'StockRadar Assistant - User123')",
  "system_prompt": "Optional. The core instructions/personality for the AI. If omitted, a generic polite assistant prompt is used."
}
```

### Success Response (HTTP 201)
```json
{
  "success": true,
  "bot_id": "1b9498a4-62c0-4f9f-994a-74664a1a4d16",
  "mgmt_token": "f2cc9eb1-a649-49c8-adcd-0248bbf4b012",
  "store_name": "StockRadar Assistant - User123",
  "message": "Bot provisioned successfully. Please direct the user to their LINE Bot to bind their owner account."
}
```

---

## 2. Endpoint: Multicast Proactive Push
Sends a notification message to multiple LINE users simultaneously. This is highly optimized using LINE's Multicast API to prevent rate limits and handle massive concurrent alerts.

- **URL**: `POST https://ai-chatbot-v1-phi.vercel.app/api/partner/multicast`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <API_KEY>`

### Request Body
```json
{
  "bot_ids": [
    "1b9498a4-62c0-4f9f-994a-74664a1a4d16",
    "another-bot-id"
  ],
  "messages": [
    {
      "type": "text",
      "text": "🚨【StockRadar 緊急警報】🚨\n\n您追蹤的「台積電 (2330)」出現大量買單，已經突破前高！請立即查看您的投資組合。"
    }
  ]
}
```
**Constraints**:
- `bot_ids`: Array of strings. Max 5000 IDs per request. Our system will automatically resolve these back to their mapped LINE User IDs and chunk them for LINE API dispatching.
- `messages`: Standard LINE Messaging API Array (Max 5 message objects).

### Success Response (HTTP 200)
```json
{
  "success": true,
  "message": "Multicast operation completed.",
  "stats": {
    "requested_bots": 2,
    "resolved_active_line_ids": 2,
    "successfully_sent": 2,
    "failed": 0
  }
}
```

---

## 3. Endpoint: Server-To-Server Account Binding
Programmatically binds a specific LINE User ID to a provisioned bot. Use this to skip the manual `@我是店長` or `#綁定` text commands if you already have the user's LINE ID captured via LINE Login (LIFF or Web Login) on your platform.

- **URL**: `POST https://ai-chatbot-v1-phi.vercel.app/api/partner/bind`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <API_KEY>`

### Request Body
```json
{
  "bot_id": "1b9498a4-62c0-4f9f-994a-74664a1a4d16",
  "line_user_id": "U1234567890abcdef1234567890abcdef"
}
```

### Success Response (HTTP 200)
```json
{
  "success": true,
  "bot_id": "1b9498a4-62c0-4f9f-994a-74664a1a4d16",
  "line_user_id": "U1234567890abcdef1234567890abcdef",
  "store_name": "StockRadar Assistant - User123",
  "message": "Account successfully bound."
}
```

---

## Suggested Application Workflow

1. **User Subscribes**: A user pays for the StockRadar Premium plan on your platform.
2. **API Call**: Your backend immediately calls our `/api/partner/provision` endpoint.
   - You can inject a highly specific `system_prompt` tailored to that user's stock preferences.
3. **Store the ID**: Save the returned `bot_id` in your database linked to that user's account.
4. **User Engagement**: Direct the user to add the central LINE Official Account.
5. **Binding**: Instruct the user to type `@我是店長` into the LINE chat. Our system will automatically recognize the first person to do this as the owner of that newly provisioned bot session.
6. **Trigger Alerts**: When an alert condition is met in your system, aggregate all affected users' `bot_id`s and call our `/api/partner/multicast` endpoint once to send the notification out simultaneously.
