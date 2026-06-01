import { SYSTEM_PROMPT } from './_prompt.js'

export const config = { runtime: 'edge' }

declare const process: { env: Record<string, string | undefined> }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const apiKey = process.env.GROQ_API_KEY?.trim()
    if (!apiKey) {
      return new Response(JSON.stringify({ reply: 'Service temporarily unavailable.' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      })
    }

    let messages: { role: string; content: string }[]
    try {
      const body = await req.json()
      messages = body.messages
    } catch {
      return new Response(JSON.stringify({ reply: 'Invalid request.' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 512,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ reply: 'Something went wrong. Please try again.' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? 'No response received.'

    return new Response(JSON.stringify({ reply }), {
      headers: { 'content-type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ reply: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
