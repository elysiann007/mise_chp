import { SYSTEM_PROMPT } from './_prompt.js'

export const config = { runtime: 'edge' }

declare const process: { env: Record<string, string | undefined> }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
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

    // Gemini uses 'user' / 'model' roles — map 'assistant' → 'model'
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            maxOutputTokens: 1536,
            temperature: 0.7,
            topP: 0.95,
            thinkingConfig: { thinkingBudget: 512 },
          },
        }),
      },
    )

    if (!res.ok) {
      return new Response(JSON.stringify({ reply: 'Something went wrong. Please try again.' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      })
    }

    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    // Skip "thought" parts so we only return the visible answer text.
    const reply = (parts.find((p: { text?: string; thought?: boolean }) => p.text && !p.thought)?.text) ?? 'No response received.'

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
