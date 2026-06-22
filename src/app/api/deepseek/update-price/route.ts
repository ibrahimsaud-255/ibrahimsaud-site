import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const endpoint = process.env.DEEPSEEK_API_URL || body.endpoint;

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing DeepSeek endpoint (set DEEPSEEK_API_URL or provide `endpoint` in body)' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server not configured with DEEPSEEK_API_KEY' }, { status: 500 });
    }

    const res = await fetch(endpoint, {
      method: body.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: body.payload ? JSON.stringify(body.payload) : undefined,
    });

    const data = await res.text();
    let json: any = data;
    try { json = JSON.parse(data); } catch (e) { /* keep text */ }

    return NextResponse.json({ status: res.status, data: json }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
