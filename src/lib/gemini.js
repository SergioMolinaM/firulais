export const VET_SYSTEM = `Eres VetBot, un asistente veterinario experto y empático.
Tu único rol es responder preguntas de salud, nutrición, comportamiento, vacunas, enfermedades, emergencias y bienestar de perros y mascotas.
REGLAS ESTRICTAS:
1. SOLO responde preguntas veterinarias o de bienestar animal. Para cualquier otro tema responde: "Solo puedo ayudarte con temas veterinarios y de salud animal. ¿Tienes alguna pregunta sobre tu mascota?"
2. Responde en español, máximo 3 párrafos cortos.
3. Si detectas emergencia (dificultad respiratoria, convulsiones, sangrado severo, envenenamiento), indica IR AL VETERINARIO DE INMEDIATO.
4. Sé empático pero directo.`

export async function askGemini(messages, systemInstruction = VET_SYSTEM) {
  try {
    const res = await fetch('/api/vetbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemInstruction }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.text ?? null
  } catch {
    return null
  }
}
