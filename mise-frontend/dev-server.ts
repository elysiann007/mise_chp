// Local dev API server — mirrors api/chat.ts for use with `bun run dev:api`
// Bun automatically loads .env so GEMINI_API_KEY is available via process.env
import { SYSTEM_PROMPT } from './api/_prompt'

const PORT = 3001

const server = Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    }

    if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

    const url = new URL(req.url)
    if (url.pathname !== '/api/chat' || req.method !== 'POST') {
      return new Response('Not found', { status: 404 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('❌  GEMINI_API_KEY not set in .env')
      return new Response(
        JSON.stringify({ reply: '⚠️ API key not configured. Add GEMINI_API_KEY to your .env file.' }),
        { status: 503, headers: { 'content-type': 'application/json', ...cors } }
      )
    }

    let messages: { role: string; content: string }[]
    try {
      const body = await req.json()
      messages = body.messages
    } catch {
      return new Response(JSON.stringify({ reply: 'Invalid request.' }), {
        status: 400, headers: { 'content-type': 'application/json', ...cors },
      })
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
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
      const err = await res.text()
      console.error('Gemini error:', err)
      return new Response(JSON.stringify({ reply: 'Something went wrong. Please try again.' }), {
        status: 502, headers: { 'content-type': 'application/json', ...cors },
      })
    }

    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    // Skip "thought" parts so we only return the visible answer text.
    const reply = (parts.find((p: { text?: string; thought?: boolean }) => p.text && !p.thought)?.text) ?? 'No response received.'
    console.log('→ Gemini replied', reply.slice(0, 60) + '...')

    return new Response(JSON.stringify({ reply }), {
      headers: { 'content-type': 'application/json', ...cors },
    })
  },
})

console.log(`✅  CHP AI dev server running at http://localhost:${server.port}/api/chat`)
