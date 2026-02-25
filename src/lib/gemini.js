const getKey = () => localStorage.getItem('firulais_gemini_key')

export const VET_SYSTEM = `Eres VetBot, un asistente veterinario experto y empático.
Tu único rol es responder preguntas de salud, nutrición, comportamiento, vacunas, enfermedades, emergencias y bienestar de perros y mascotas.
REGLAS ESTRICTAS:
1. SOLO responde preguntas veterinarias o de bienestar animal. Para cualquier otro tema responde: "Solo puedo ayudarte con temas veterinarios y de salud animal. ¿Tienes alguna pregunta sobre tu mascota?"
2. Responde en español, máximo 3 párrafos cortos.
3. Si detectas emergencia (dificultad respiratoria, convulsiones, sangrado severo, envenenamiento), indica IR AL VETERINARIO DE INMEDIATO.
4. Sé empático pero directo.`

export async function askGemini(messages, systemInstruction = VET_SYSTEM) {
  const key = getKey()
  if (!key) return null
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: messages,
          generationConfig: { maxOutputTokens: 400 },
        }),
      }
    )
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch {
    return null
  }
}
