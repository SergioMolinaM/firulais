const SYSTEM_TEXT = "Eres un asistente de orientación básica sobre mascotas para la app Firulais. Respondes preguntas generales sobre salud, alimentación, comportamiento y cuidados de mascotas domésticas. Siempre recuerdas al usuario que tus respuestas son orientaciones generales y no reemplazan la consulta con un veterinario profesional. Respondes en español, de forma breve y clara. Si la pregunta requiere atención urgente, indícalo explícitamente."

export async function askGemini(messages) {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_TEXT }] },
        contents: messages,
      }),
    })
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch {
    return null
  }
}
