import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { logger } from 'firebase-functions'

const geminiKey = defineSecret('GEMINI_API_KEY')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const vetbot = onRequest({ secrets: [geminiKey] }, async (req, res) => {
  // Handle CORS preflight (needed for local dev with emulator)
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.set(k, v))
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { messages, systemInstruction } = req.body ?? {}

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages must be a non-empty array' })
    return
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.value()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction ?? '' }] },
          contents: messages,
          generationConfig: { maxOutputTokens: 400 },
        }),
      }
    )

    const data = await geminiRes.json()

    if (!geminiRes.ok) {
      logger.error('Gemini API error', data)
      res.status(502).json({ error: 'Upstream error' })
      return
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
    res.json({ text })
  } catch (err) {
    logger.error('vetbot error', err)
    res.status(500).json({ error: 'Internal error' })
  }
})
