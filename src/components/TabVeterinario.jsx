import { useState, useRef, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
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

const CHATVET_ENABLED = false

export default function TabVeterinario() {
  const { pet } = useApp()
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
        {sub === 'chat'    && (CHATVET_ENABLED
          ? <VetBot pet={pet} />
          : <VetBotDisabled onDiary={() => setSub('diary')} onGuide={() => setSub('etology')} />
        )}
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
        Pronto podrás consultar dudas básicas sobre tu mascota directamente aquí.
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

    // Omitir el saludo inicial (rol model, índice 0) — Gemini requiere que contents empiece con user
    const geminiMsgs = newMsgs
      .slice(1)
      .map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] }))
    const reply = await askGemini(geminiMsgs)
    setMsgs(m => [...m, { role: 'model', text: reply || 'Hubo un problema al conectar. Verifica tu conexión e intenta de nuevo.' }])
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

const TYPE_LABELS = { vacuna: 'Vacuna', desparasitacion: 'Desparasitación', control: 'Control general' }
const TYPE_ICONS  = { vacuna: { icon: 'vaccines', color: 'bg-blue-100 text-blue-700' }, desparasitacion: { icon: 'medication', color: 'bg-amber-100 text-amber-700' }, control: { icon: 'monitor_heart', color: 'bg-green-100 text-green-700' } }

function realToCard(r) {
  const meta = TYPE_ICONS[r.type] ?? TYPE_ICONS.control
  if (r.type === 'vacuna')         return { id: r.id, title: r.vaccineType || 'Vacuna',         type: 'Vacuna',          date: r.date, vet: r.vet,   notes: r.notes,        nextDue: r.nextDue  || '', ...meta }
  if (r.type === 'desparasitacion') return { id: r.id, title: r.product     || 'Desparasitación', type: 'Desparasitación',  date: r.date, vet: r.place, notes: r.notes,        nextDue: r.nextDue  || '', ...meta }
  return                                   { id: r.id, title: 'Control general',                  type: 'Control',          date: r.date, vet: r.vet,   notes: r.observations, nextDue: r.nextVisit|| '', ...meta }
}

function VetDiary({ pet }) {
  const { uid } = useApp()
  const [realRecords, setRealRecords] = useState([])
  const [showModal,   setShowModal]   = useState(false)
  const [modalType,   setModalType]   = useState('vacuna')
  const [modalFixed,  setModalFixed]  = useState(false)
  const [formData,    setFormData]    = useState({})
  const [saving,      setSaving]      = useState(false)

  // Cargar registros reales del usuario desde Firestore
  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'users', uid, 'vetRecords'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setRealRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => {})
    return unsub
  }, [uid])

  function openFromExample(e) {
    let type, data
    if (e.type === 'Vacuna') {
      type = 'vacuna'
      data = { vaccineType: e.title, date: e.date, vet: e.vet, nextDue: e.nextDue || '', notes: e.notes || '' }
    } else if (e.type === 'Desparasitación') {
      type = 'desparasitacion'
      data = { product: e.title, date: e.date, nextDue: e.nextDue || '', place: e.vet, notes: e.notes || '' }
    } else {
      type = 'control'
      data = { date: e.date, vet: e.vet, weight: '', observations: e.notes || '', nextVisit: '' }
    }
    setModalType(type); setFormData(data); setModalFixed(true); setShowModal(true)
  }

  function openNew() {
    setModalType('vacuna'); setFormData({}); setModalFixed(false); setShowModal(true)
  }

  function field(k, v) { setFormData(f => ({ ...f, [k]: v })) }

  async function saveRecord() {
    if (!uid) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'users', uid, 'vetRecords'), {
        type: modalType, petId: pet?.id || null,
        createdAt: Timestamp.fromDate(new Date()),
        ...formData,
      })
      setShowModal(false)
    } catch (err) { console.error('Error guardando:', err) }
    finally { setSaving(false) }
  }

  const allCards    = [...realRecords.map(realToCard), ...MOCK_VET_ENTRIES.map(e => ({ ...e, isMock: true }))]
  const upcoming    = allCards.filter(e => {
    if (!e.nextDue) return false
    const diff = (new Date(e.nextDue) - new Date()) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff > 0
  })

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 relative">

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end">
          <div className="w-full bg-white dark:bg-surface-dark rounded-t-3xl px-6 pt-6 pb-10 max-h-[85vh] overflow-y-auto no-scrollbar slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Registrar {TYPE_LABELS[modalType]}</h3>
              <button onClick={() => setShowModal(false)}><Icon name="close" className="text-text-sec text-xl" /></button>
            </div>

            {/* Selector de tipo — solo cuando se abre con "+ Agregar" */}
            {!modalFixed && (
              <div className="mb-5">
                <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Tipo de registro</label>
                <div className="flex gap-2">
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <button key={k} onClick={() => { setModalType(k); setFormData({}) }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${modalType === k ? 'bg-primary text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-text-sec'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {modalType === 'vacuna' && <>
                <MF label="Tipo de vacuna"><input className="input-base" placeholder="Ej: Antirrábica + Polivalente" value={formData.vaccineType||''} onChange={e=>field('vaccineType',e.target.value)} /></MF>
                <MF label="Fecha de aplicación"><input type="date" className="input-base" value={formData.date||''} onChange={e=>field('date',e.target.value)} /></MF>
                <MF label="Veterinario"><input className="input-base" placeholder="Nombre del veterinario o clínica" value={formData.vet||''} onChange={e=>field('vet',e.target.value)} /></MF>
                <MF label="Próximo refuerzo"><input type="date" className="input-base" value={formData.nextDue||''} onChange={e=>field('nextDue',e.target.value)} /></MF>
                <MF label="Notas (opcional)"><textarea className="input-base resize-none" rows={3} placeholder="Observaciones..." value={formData.notes||''} onChange={e=>field('notes',e.target.value)} /></MF>
              </>}
              {modalType === 'desparasitacion' && <>
                <MF label="Producto"><input className="input-base" placeholder="Ej: Bravecto 20-40kg" value={formData.product||''} onChange={e=>field('product',e.target.value)} /></MF>
                <MF label="Fecha"><input type="date" className="input-base" value={formData.date||''} onChange={e=>field('date',e.target.value)} /></MF>
                <MF label="Próxima dosis"><input type="date" className="input-base" value={formData.nextDue||''} onChange={e=>field('nextDue',e.target.value)} /></MF>
                <MF label="Lugar (farmacia o clínica)"><input className="input-base" placeholder="Ej: FarmaPets" value={formData.place||''} onChange={e=>field('place',e.target.value)} /></MF>
                <MF label="Notas (opcional)"><textarea className="input-base resize-none" rows={3} placeholder="Observaciones..." value={formData.notes||''} onChange={e=>field('notes',e.target.value)} /></MF>
              </>}
              {modalType === 'control' && <>
                <MF label="Fecha"><input type="date" className="input-base" value={formData.date||''} onChange={e=>field('date',e.target.value)} /></MF>
                <MF label="Veterinario"><input className="input-base" placeholder="Nombre del veterinario o clínica" value={formData.vet||''} onChange={e=>field('vet',e.target.value)} /></MF>
                <MF label="Peso (kg)"><input type="number" className="input-base" placeholder="Ej: 28" value={formData.weight||''} onChange={e=>field('weight',e.target.value)} /></MF>
                <MF label="Observaciones"><textarea className="input-base resize-none" rows={3} placeholder="Notas del control..." value={formData.observations||''} onChange={e=>field('observations',e.target.value)} /></MF>
                <MF label="Próxima visita (opcional)"><input type="date" className="input-base" value={formData.nextVisit||''} onChange={e=>field('nextVisit',e.target.value)} /></MF>
              </>}
            </div>

            <div className="mt-6 space-y-3">
              <button onClick={saveRecord} disabled={saving}
                className="w-full bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 transition-transform">
                {saving ? 'Guardando...' : 'Guardar registro'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="w-full bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 font-extrabold py-3 rounded-2xl text-sm border border-gray-200 dark:border-border-dark active:scale-95 transition-transform">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Próximas citas */}
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
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">En {days} día{days!==1?'s':''} · {e.nextDue}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest">Historial de {pet?.name || 'tu mascota'}</p>
        <button onClick={openNew}
          className="flex items-center gap-1.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark px-3 py-1.5 rounded-full text-xs font-extrabold text-text-sec shadow-sm active:scale-95 transition-transform">
          <Icon name="add" className="text-sm" /> Agregar
        </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-2.5 mb-3 flex gap-2 items-start">
        <Icon name="info" className="text-amber-500 text-sm flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
          Las cards con badge «Ejemplo» son de muestra. Tócalas para registrar tus propios datos.
        </p>
      </div>

      <div className="space-y-3">
        {/* Registros reales del usuario — sin badge */}
        {realRecords.map(r => {
          const c = realToCard(r)
          return (
            <div key={c.id} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm flex gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                <Icon name={c.icon} filled className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white">{c.title}</p>
                  <span className="text-xs text-text-sec font-medium">{c.date}</span>
                </div>
                <p className="text-xs font-semibold text-primary mb-1">{c.type}</p>
                <p className="text-xs text-text-sec font-medium">{c.vet}</p>
                {c.notes   && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{c.notes}</p>}
                {c.nextDue && <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Próximo: {c.nextDue}</p>}
              </div>
            </div>
          )
        })}

        {/* Ejemplos — con badge ámbar, clicables */}
        {MOCK_VET_ENTRIES.map(e => (
          <button key={e.id} onClick={() => openFromExample(e)}
            className="w-full bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm flex gap-3 text-left relative active:scale-[0.98] transition-transform">
            <span className="absolute top-3 right-3 text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Ejemplo</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${e.color}`}>
              <Icon name={e.icon} filled className="text-xl" />
            </div>
            <div className="flex-1 min-w-0 pr-16">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">{e.title}</p>
                <span className="text-xs text-text-sec font-medium">{e.date}</span>
              </div>
              <p className="text-xs font-semibold text-primary mb-1">{e.type}</p>
              <p className="text-xs text-text-sec font-medium">{e.vet}</p>
              {e.notes   && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{e.notes}</p>}
              {e.nextDue && <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Próximo: {e.nextDue}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MF({ label, children }) {
  return (
    <div>
      <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">{label}</label>
      {children}
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
          <div className="flex gap-2" style={{ width: 'max-content', paddingLeft: '20px', paddingRight: '20px' }}>
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
