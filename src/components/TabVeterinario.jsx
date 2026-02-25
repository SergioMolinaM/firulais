import { useState, useRef, useEffect } from 'react'
import { Icon } from './ui'
import { MOCK_VET_ENTRIES, ETOLOGY_TIPS } from '../data/mockData'
import { askGemini } from '../lib/gemini'

export default function TabVeterinario({ pet }) {
  const [sub, setSub] = useState('chat')

  const TABS = [
    { key: 'chat', icon: 'smart_toy', label: 'VetBot' },
    { key: 'diary', icon: 'book_2', label: 'Diario' },
    { key: 'etology', icon: 'pets', label: 'Guía' },
  ]

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark">
      <div className="px-5 pt-10 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">Veterinario</h1>
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setSub(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${sub === t.key ? 'bg-primary text-gray-900' : 'bg-white dark:bg-surface-dark text-text-sec border border-gray-200 dark:border-border-dark'}`}
            >
              <Icon name={t.icon} className="text-sm" />{t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {sub === 'chat' && <VetBot pet={pet} />}
        {sub === 'diary' && <VetDiary pet={pet} />}
        {sub === 'etology' && <EtologyGuide />}
      </div>
    </div>
  )
}

function VetBot({ pet }) {
  const [msgs, setMsgs] = useState([
    { role: 'model', text: `Hola 👋 Soy VetBot, tu asistente veterinario para ${pet?.name || 'tu mascota'}. Puedo ayudarte con dudas de salud, nutrición, comportamiento y vacunas. ¿En qué puedo ayudarte hoy?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasKey, setHasKey] = useState(!!localStorage.getItem('firulais_gemini_key'))
  const [keyDraft, setKeyDraft] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg = { role: 'user', text }
    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs)
    setLoading(true)

    const geminiMsgs = newMsgs.map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] }))
    const reply = await askGemini(geminiMsgs)
    setMsgs(m => [...m, { role: 'model', text: reply || 'Lo siento, ocurrió un error. Intenta de nuevo.' }])
    setLoading(false)
  }

  function saveKey() {
    if (!keyDraft.trim()) return
    localStorage.setItem('firulais_gemini_key', keyDraft.trim())
    setHasKey(true)
  }

  if (!hasKey) return (
    <div className="flex flex-col h-full px-5 pt-4 pb-8 items-center justify-center gap-5">
      <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center">
        <Icon name="smart_toy" filled className="text-primary text-3xl" />
      </div>
      <div className="text-center">
        <p className="font-extrabold text-base text-gray-900 dark:text-white mb-1">Activa VetBot IA</p>
        <p className="text-xs text-text-sec font-medium leading-relaxed">Ingresa tu API Key de Google Gemini para activar el asistente veterinario. Es gratis en la capa básica.</p>
      </div>
      <div className="w-full space-y-3">
        <input
          className="input-base"
          placeholder="AIza..."
          type="password"
          value={keyDraft}
          onChange={e => setKeyDraft(e.target.value)}
        />
        <button onClick={saveKey} className="w-full bg-primary text-gray-900 font-extrabold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform">
          Activar VetBot
        </button>
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-semibold text-primary">
          Obtener API Key gratis →
        </a>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="mx-5 mb-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2 flex items-center gap-2 flex-shrink-0">
        <Icon name="warning" filled className="text-amber-500 text-sm flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Solo temas veterinarios. No reemplaza consulta profesional.</p>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-2 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'model' && (
              <div className="w-7 h-7 bg-primary/15 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <Icon name="smart_toy" filled className="text-primary text-sm" />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 text-sm font-medium leading-relaxed ${m.role === 'user' ? 'chat-u' : 'chat-b'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-7 h-7 bg-primary/15 rounded-full flex items-center justify-center">
              <Icon name="smart_toy" filled className="text-primary text-sm" />
            </div>
            <div className="chat-b px-4 py-3 flex gap-1.5">
              <span className="dot-walk" /><span className="dot-walk" /><span className="dot-walk" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex-shrink-0 px-5 pb-8 pt-3 flex items-center gap-3">
        <input
          className="flex-1 input-base py-3"
          placeholder="¿Cómo le doy la pastilla a mi perro?"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-40"
        >
          <Icon name="send" filled className="text-gray-900 text-xl" />
        </button>
      </div>
    </div>
  )
}

function VetDiary({ pet }) {
  const [entries, setEntries] = useState(MOCK_VET_ENTRIES)

  const upcoming = entries.filter(e => {
    if (!e.nextDue) return false
    const diff = (new Date(e.nextDue) - new Date()) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff > 0
  })

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
      {upcoming.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2">Próximas citas</p>
          {upcoming.map(e => {
            const days = Math.ceil((new Date(e.nextDue) - new Date()) / (1000 * 60 * 60 * 24))
            return (
              <div key={e.id} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 flex items-center gap-3 mb-2">
                <Icon name="notifications_active" filled className="text-amber-500 text-xl flex-shrink-0" />
                <div>
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white">{e.title}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">En {days} día{days !== 1 ? 's' : ''} · {e.nextDue}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest">Historial de {pet?.name || 'tu perro'}</p>
        <button className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform">
          <Icon name="add" filled className="text-gray-900 text-lg" />
        </button>
      </div>

      <div className="space-y-3">
        {entries.map(e => (
          <div key={e.id} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm flex gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${e.color}`}>
              <Icon name={e.icon} filled className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">{e.title}</p>
                <span className="text-xs text-text-sec font-medium">{e.date}</span>
              </div>
              <p className="text-xs font-semibold text-primary mb-1">{e.type}</p>
              <p className="text-xs text-text-sec font-medium">{e.vet}</p>
              {e.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{e.notes}</p>}
              {e.nextDue && <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Próximo: {e.nextDue}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EtologyGuide() {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-3">
      <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2">Guía de etología y nutrición</p>
      {ETOLOGY_TIPS.map((tip, i) => (
        <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm flex gap-3">
          <span className="text-3xl flex-shrink-0">{tip.icon}</span>
          <div>
            <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{tip.title}</p>
            <p className="text-xs text-text-sec font-medium leading-relaxed">{tip.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
