import { useState, useRef, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { Icon, Avatar } from './ui'
import { db } from '../lib/firebase'

export default function TabManada({ convs, uid }) {
  const [active, setActive] = useState(null)
  const [draft, setDraft]   = useState('')
  const bottomRef = useRef(null)
  const [seenManada, setSeenManada] = useState(() => !!localStorage.getItem('seen_manada'))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active, convs])

  async function openConv(convId) {
    setActive(convId)
    const conv = convs.find(c => c.id === convId)
    if (conv?.unread > 0 && uid) {
      await updateDoc(doc(db, 'users', uid, 'convs', convId), { unread: 0 }).catch(() => {})
    }
  }

  async function sendMsg() {
    const text = draft.trim()
    if (!text || !active || !uid) return
    setDraft('')
    const conv = convs.find(c => c.id === active)
    if (!conv) return
    const msg = { id: Date.now().toString(), from: 'me', text, ts: Date.now() }
    const newMessages = [...(conv.messages || []), msg]
    await updateDoc(doc(db, 'users', uid, 'convs', active), {
      messages: newMessages,
      lastMsg:  text,
      time:     'ahora',
    }).catch(() => {})
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() }
  }

  const conv = convs.find(c => c.id === active)

  if (active && conv) return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark">
      <div className="flex items-center gap-3 px-5 pt-10 pb-4 flex-shrink-0">
        <button
          onClick={() => setActive(null)}
          className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm"
        >
          <Icon name="arrow_back" className="text-gray-700 dark:text-gray-300" />
        </button>
        <Avatar src={conv.photo} size={9} ring />
        <div>
          <p className="font-extrabold text-sm text-gray-900 dark:text-white">{conv.user}</p>
          <p className="text-xs text-text-sec font-medium">Miembro de tu manada</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-2 space-y-3">
        {(conv.messages || []).map(m => (
          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] px-4 py-2.5 text-sm font-medium ${m.from === 'me' ? 'chat-u' : 'chat-b'}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 px-5 pb-8 pt-3 flex items-center gap-3">
        <input
          className="flex-1 input-base py-3"
          placeholder="Escribe un mensaje..."
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          onClick={sendMsg}
          disabled={!draft.trim()}
          className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-40"
        >
          <Icon name="send" filled className="text-gray-900 text-xl" />
        </button>
      </div>
    </div>
  )

  const totalUnread = convs.reduce((s, c) => s + (c.unread || 0), 0)

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark">
      <div className="px-5 pt-10 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Mi manada</h1>
          {totalUnread > 0 && (
            <span className="bg-primary text-gray-900 text-xs font-extrabold px-2.5 py-1 rounded-full">{totalUnread} nuevos</span>
          )}
        </div>
        <p className="text-sm text-text-sec font-medium mt-1">Tu red cercana de confianza</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-2">
        {!seenManada && (
          <div className="mb-2 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3">
            <span className="text-2xl flex-shrink-0">💬</span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">¿Cómo funciona Mi manada?</p>
              <p className="text-xs text-text-sec font-medium leading-relaxed">
                Conéctate con personas cercanas, crea un grupo o inicia una conversación para coordinar paseos, pedir ayuda o cuidar a tus mascotas.
              </p>
              <p className="text-xs text-text-sec font-medium leading-relaxed mt-1.5">
                Por ahora puedes iniciar conversaciones desde las publicaciones en Mi barrio. La creación de grupos está en desarrollo.
              </p>
            </div>
            <button onClick={() => { localStorage.setItem('seen_manada', '1'); setSeenManada(true) }} className="text-text-sec flex-shrink-0 mt-0.5">
              <Icon name="close" className="text-base" />
            </button>
          </div>
        )}
        {convs.length === 0 && (
          <div className="text-center pt-10 px-4">
            <span className="text-5xl">💬</span>
            <p className="text-gray-700 dark:text-gray-200 font-extrabold text-base mt-4">Sin conversaciones activas</p>
            <p className="text-text-sec text-sm font-medium mt-2 leading-relaxed">
              Aún no tienes conversaciones. Puedes iniciar una desde una publicación en Mi barrio.
            </p>
            <p className="text-xs text-text-sec font-medium mt-3 leading-relaxed italic">
              La creación de grupos propios estará disponible próximamente.
            </p>
          </div>
        )}
        {convs.map(c => (
          <button key={c.id} onClick={() => openConv(c.id)} className="w-full bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left">
            <div className="relative flex-shrink-0">
              <Avatar src={c.photo} size={11} ring={c.unread > 0} />
              {c.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-extrabold text-gray-900">
                  {c.unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className={`text-sm font-extrabold truncate ${c.unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.user}</p>
                <p className="text-xs text-text-sec flex-shrink-0 ml-2">{c.time}</p>
              </div>
              <p className={`text-xs truncate ${c.unread > 0 ? 'text-gray-700 dark:text-gray-300 font-semibold' : 'text-text-sec font-medium'}`}>{c.lastMsg}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
