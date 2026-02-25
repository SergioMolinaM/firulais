import { useState, useRef, useEffect } from 'react'
import { Icon, Avatar } from './ui'

export default function TabManada({ user, convs, setConvs, target, setTarget }) {
  const [active, setActive] = useState(target || null)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (target) setActive(target)
  }, [target])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active, convs])

  function openConv(userId) {
    // Mark as read
    setConvs(cs => cs.map(c => c.id === userId ? { ...c, unread: 0 } : c))
    setActive(userId)
  }

  function sendMsg() {
    const text = draft.trim()
    if (!text || !active) return
    setDraft('')
    const msg = { id: Date.now().toString(), from: 'me', text, ts: Date.now() }
    setConvs(cs => cs.map(c => c.id === active
      ? { ...c, messages: [...c.messages, msg], lastMsg: text, time: 'ahora' }
      : c
    ))
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() }
  }

  const conv = convs.find(c => c.id === active)

  if (active && conv) return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark">
      <div className="flex items-center gap-3 px-5 pt-10 pb-4 flex-shrink-0">
        <button
          onClick={() => { setActive(null); setTarget(null) }}
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
        {conv.messages.map(m => (
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

  const totalUnread = convs.reduce((s, c) => s + c.unread, 0)

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark">
      <div className="px-5 pt-10 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Mi Manada</h1>
          {totalUnread > 0 && (
            <span className="bg-primary text-gray-900 text-xs font-extrabold px-2.5 py-1 rounded-full">{totalUnread} nuevos</span>
          )}
        </div>
        <p className="text-sm text-text-sec font-medium mt-1">Mensajes con tu comunidad</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-2">
        {convs.length === 0 && (
          <div className="text-center pt-16">
            <span className="text-5xl">💬</span>
            <p className="text-text-sec font-semibold text-sm mt-3">Aún no tienes mensajes</p>
            <p className="text-text-sec text-xs mt-1">Conéctate con dueños en la comunidad</p>
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
