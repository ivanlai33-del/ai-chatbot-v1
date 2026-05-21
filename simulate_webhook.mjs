import fetch from 'node-fetch'; // Next.js polyfills this globally, but we can just use native fetch in node 20+

async function send() {
  const payload = {
    events: [
      {
        type: 'message',
        message: { type: 'text', text: '你是什麼模型？' },
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
