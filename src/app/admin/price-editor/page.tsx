"use client";

import { useState } from 'react';

export default function PriceEditor() {
  const [endpoint, setEndpoint] = useState('');
  const [payload, setPayload] = useState('{ "example": true }');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/deepseek/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, payload: JSON.parse(payload) }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: String(err) });
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>DeepSeek — اختبار API وتحديث السعر</h2>
      <p>ضع هنا عنوان الـ DeepSeek أو اتركه فارغاً لو ضبطته في متغير `DEEPSEEK_API_URL`.</p>
      <div>
        <label>Endpoint</label>
        <input style={{ width: '100%' }} value={endpoint} onChange={e => setEndpoint(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Payload (JSON)</label>
        <textarea style={{ width: '100%', minHeight: 120 }} value={payload} onChange={e => setPayload(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={send} disabled={loading}>Send</button>
      </div>
      <pre style={{ marginTop: 12, background: '#f5f5f5', padding: 10 }}>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
