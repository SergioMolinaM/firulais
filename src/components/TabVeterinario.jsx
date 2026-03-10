import { useState, useRef, useEffect } from 'react'
import { Icon } from './ui'
import { MOCK_VET_ENTRIES, ETOLOGY_TIPS } from '../data/mockData'
import { askGemini } from '../lib/gemini'
import { useApp } from '../context/AppContext'

const QUICK_TOPICS = [
  { icon: '💉', label: 'Vacunas', prompt: '¿Cuáles son las vacunas obligatorias para perros en Chile y cada cuánto tiempo se aplican?' },
  { icon: '🥩', label: 'Alimentación', prompt: '¿Cuánto alimento debo darle a mi perro al día según su peso?' },
  { icon: '🌿', label: 'Desparasitación', prompt: '¿Cada cuánto debo desparasitar a mi perro y qué productos recomiendas?' },
  { icon: '🧠', label: 'Comportamiento', prompt: '¿Qué puedo hacer si mi perro muerde objetos de la casa o tiene ansiedad de separación?' },
  { icon: '🚨', label: '¿Cuándo ir al vet?', prompt: '¿Cuáles son las señales de emergencia que indican que debo llevar a mi perro al veterinario de inmediato?' },
]

export default function TabVeterinario() {
  const { pet } = useApp()
  // VetBot desactivado: el endpoint /api/vetbot no está disponible aún.
  // Tab por defecto: Diario.
  const [sub, setSub] = useState('diary')

  const SUB_TABS = [
    { key: 'chat',    icon: 'smart_toy', label: 'ChatVet'  },
    { key: 'diary',   icon: 'book_2',    label: 'Diario'   },
    { key: 'etology', icon: 'pets',      label: 'Guía'     },
  ]

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark">
      <div className="px-5 pt-10 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Vet</h1>
        <p className="text-xs text-text-sec font-semibold mb-4">Orientaciones básicas para tus mascotas. No reemplazan la atención profesional.</p>
        <div className="flex gap-2">
          {SUB_TABS.map(t => (
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
        {sub === 'chat'    && <VetBotDisabled onDiary={() => setSub('diary')} onGuide={() => setSub('etology')} />}
        {sub === 'diary'   && <VetDiary pet={pet} />}
        {sub === 'etology' && <EtologyGuide />}
      </div>
    </div>
  )
}

// VetBot desactivado hasta que el servicio esté disponible
function VetBotDisabled({ onDiary, onGuide }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center pb-10">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-5">
        <Icon name="smart_toy" className="text-gray-400 text-4xl" />
      </div>
      <p className="font-extrabold text-lg text-gray-900 dark:text-white mb-2">ChatVet · Próximamente</p>
      <p className="text-sm text-text-sec font-medium leading-relaxed mb-6">
        El asistente veterinario está en desarrollo. Por ahora no responde. Usa la Guía de bienestar o consulta directamente con un profesional.
      </p>
      <div className="w-full space-y-3">
        <button
          onClick={onDiary}
          className="w-full bg-primary text-gray-900 font-extrabold py-3.5 rounded-2xl text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Icon name="book_2" className="text-base" /> Ir al Diario de salud
        </button>
        <button
          onClick={onGuide}
          className="w-full bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 font-extrabold py-3.5 rounded-2xl text-sm border border-gray-200 dark:border-border-dark active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Icon name="pets" className="text-base" /> Ir a la Guía de bienestar
        </button>
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
  const bottomRef = useRef(null)
  const onlyGreeting = msgs.length === 1

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  async function send(text) {
    const t = (text ?? input).trim()
    if (!t || loading) return
    setInput('')
    const userMsg = { role: 'user', text: t }
    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs)
    setLoading(true)

    const geminiMsgs = newMsgs.map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] }))
    const reply = await askGemini(geminiMsgs)
    setMsgs(m => [...m, { role: 'model', text: reply || 'Lo siento, ocurrió un error. Intenta de nuevo.' }])
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mx-5 mb-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2 flex items-center gap-2 flex-shrink-0">
        <Icon name="warning" filled className="text-amber-500 text-sm flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Solo temas veterinarios. No reemplaza consulta profesional.</p>
      </div>
      {onlyGreeting && (
        <div className="px-5 mb-2 flex-shrink-0">
          <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2">Consultas frecuentes</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK_TOPICS.map(t => (
              <button
                key={t.label}
                onClick={() => send(t.prompt)}
                className="flex-shrink-0 flex items-center gap-1.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-full px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 active:scale-95 transition-transform"
              >
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      )}
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
          placeholder="Escribe tu consulta sobre tu mascota…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button
          onClick={() => send()}
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
  const [showAddToast, setShowAddToast] = useState(false)

  function handleAddEntry() {
    setShowAddToast(true)
    setTimeout(() => setShowAddToast(false), 3000)
  }

  const upcoming = entries.filter(e => {
    if (!e.nextDue) return false
    const diff = (new Date(e.nextDue) - new Date()) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff > 0
  })

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 relative">
      {showAddToast && (
        <div className="sticky top-0 z-10 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2">
          <Icon name="info" filled className="text-primary text-base flex-shrink-0" />
          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Registro manual próximamente. Por ahora los datos son de ejemplo.</p>
        </div>
      )}
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
        <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest">Historial de {pet?.name || 'tu mascota'}</p>
        <button
          onClick={handleAddEntry}
          title="Próximamente"
          className="flex items-center gap-1.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark px-3 py-1.5 rounded-full text-xs font-extrabold text-text-sec shadow-sm active:scale-95 transition-transform"
        >
          <Icon name="add" className="text-sm" /> Agregar
        </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-2.5 mb-3 flex gap-2 items-start">
        <Icon name="info" className="text-amber-500 text-sm flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
          Datos de ejemplo. Aquí podrás registrar controles, desparasitación y otros cuidados de una o más mascotas.
        </p>
      </div>

      <div className="space-y-3">
        {entries.map(e => (
          <div key={e.id} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm flex gap-3 relative">
            <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-text-sec px-2 py-0.5 rounded-full">Demo</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${e.color}`}>
              <Icon name={e.icon} filled className="text-xl" />
            </div>
            <div className="flex-1 min-w-0 pr-10">
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
  const allCats = ['Todos', ...Array.from(new Set(ETOLOGY_TIPS.map(t => t.cat)))]
  const [cat, setCat] = useState('Todos')
  const filtered = cat === 'Todos' ? ETOLOGY_TIPS : ETOLOGY_TIPS.filter(t => t.cat === cat)

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
      <div className="px-5">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-2.5 mb-3 flex gap-2 items-start">
          <Icon name="info" className="text-amber-500 text-sm flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
            Orientaciones generales. Los artículos completos con fuentes oficiales se publicarán próximamente.
          </p>
        </div>
        <div className="overflow-x-auto no-scrollbar mb-4 pb-1">
          <div className="flex gap-2" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
            {allCats.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-extrabold transition-all ${cat === c ? 'bg-primary text-gray-900' : 'bg-white dark:bg-surface-dark text-text-sec border border-gray-200 dark:border-border-dark'}`}
              >
                {c}
              </button>
            ))}
            <div className="flex-shrink-0 w-1" />
          </div>
        </div>
      </div>
      <div className="px-5 space-y-3">
        {filtered.map((tip, i) => (
          <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm flex gap-3">
            <span className="text-3xl flex-shrink-0">{tip.icon}</span>
            <div>
              <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{tip.title}</p>
              <p className="text-xs text-text-sec font-medium leading-relaxed">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
