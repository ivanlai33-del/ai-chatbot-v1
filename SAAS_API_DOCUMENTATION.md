# SaaS Partner API Integration Guide

This guide describes how to programmatically provision AI Chatbots for your customers using our Backend-to-Backend (B2B) API. This is specifically designed for partners like **StockRadar** to fully automate bot creation upon successful user subscription.

## Authentication
All API requests must be authenticated using your unique SaaS Partner API Key. Include this key in the `Authorization` header as a Bearer token.

**Your API Key (StockRadar-main)**: `13cdff30-6ecc-410c-b2d9-99bdc77d77cf`

---

## Endpoint: Provision Bot
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
**Important:** The `bot_id` returned is the unique identifier for this bot. You should associate this `bot_id` with the corresponding user in your own database.

### Error Responses
- **401 Unauthorized**: Missing or invalid Bearer token.
- **400 Bad Request**: Missing required payload fields (e.g., `store_name`).
- **403 Forbidden**: Your partner account has exhausted its purchased slots.

---

## Suggested Application Workflow

1. **User Subscribes**: A user pays for the StockRadar Premium plan on your platform.
2. **API Call**: Your backend immediately calls our `/api/partner/provision` endpoint.
   - You can inject a highly specific `system_prompt` tailored to that user's stock preferences.
3. **Store the ID**: Save the returned `bot_id` in your database linked to that user's account.
4. **User Engagement**: Direct the user to add the central LINE Official Account.
5. **Binding**: Instruct the user to type `@我是店長` into the LINE chat. Our system will automatically recognize the first person to do this as the owner of that newly provisioned bot session.
