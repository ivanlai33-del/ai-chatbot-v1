import fetch from 'node-fetch';

async function testNewebPay() {
  console.log("Testing NewebPay Checkout API endpoint...");
  try {
    const res = await fetch('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: 'solo',
        cycle: 'monthly',
        isPartner: false
      })
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test Error:", err.message);
  }
}

testNewebPay();
