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

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error('❌  GROQ_API_KEY not set in .env')
      return new Response(
        JSON.stringify({ reply: '⚠️ API key not configured. Add GROQ_API_KEY to your .env file.' }),
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
      const err = await res.text()
      console.error('Groq error:', err)
      return new Response(JSON.stringify({ reply: 'Something went wrong. Please try again.' }), {
        status: 502, headers: { 'content-type': 'application/json', ...cors },
      })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? 'No response received.'
    console.log('→ CHP AI replied', reply.slice(0, 60) + '...')

    return new Response(JSON.stringify({ reply }), {
      headers: { 'content-type': 'application/json', ...cors },
    })
  },
})

console.log(`✅  CHP AI dev server running at http://localhost:${server.port}/api/chat`)
