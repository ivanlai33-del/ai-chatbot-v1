import fetch from 'node-fetch';

async function send() {
  const payload = {
    events: [
      {
        type: 'message',
        message: { type: 'text', id: '123', text: '你好' },
        source: { userId: 'U123456789' },
        replyToken: 'dummy_token'
      }
    ]
  };

  try {
    const res = await fetch('http://localhost:3000/api/webhook/testbot123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error("Error:", e);
  }
}
send();
