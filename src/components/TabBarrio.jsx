import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp, Timestamp } from 'firebase/firestore'
import { Icon, Avatar } from './ui'
import { MOCK_LOST, MOCK_ADOPTION, MOCK_RANKING } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { db } from '../lib/firebase'

const POST_CATS = [
  { key: 'momento',   label: 'Momento positivo', emoji: '✨' },
  { key: 'dato',      label: 'Dato útil',         emoji: '💡' },
  { key: 'recom',     label: 'Recomendación',     emoji: '👍' },
  { key: 'problema',  label: 'Problema entorno',  emoji: '🔧' },
  { key: 'propuesta', label: 'Propuesta',          emoji: '🌱' },
  { key: 'perdido',   label: 'Mascota perdida',   emoji: '🔴' },
  { key: 'encontrado',label: 'Mascota encontrada',emoji: '🟢' },
  { key: 'avistamiento', label: 'Avistamiento',   emoji: '👁️' },
]

export default function TabBarrio({ onMessage, sharedWalk, onClearShared }) {
  const { user, pet, uid } = useApp()
  const [sub, setSub]               = useState('feed')
  const [feed, setFeed]             = useState([])
  const [lostFilter, setLostFilter] = useState('todos')
  const [selectedLost, setSelectedLost] = useState(null)
  const [showInfo, setShowInfo]     = useState(() => !localStorage.getItem('seen_barrio'))
  const [showCompose, setShowCompose]   = useState(false)
  const [newPostCat, setNewPostCat]     = useState('momento')
  const [newPostText, setNewPostText]   = useState('')
  const [posting, setPosting]           = useState(false)
  const [postError, setPostError]       = useState('')

  // Feed en tiempo real desde Firestore — solo cuando auth está listo
  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
    const unsub = onSnapshot(q, snap => {
      setFeed(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        liked: (d.data().likedBy || []).includes(uid),
      })))
    }, (err) => { console.warn('Feed snapshot error:', err) })
    return unsub
  }, [uid])

  // Compartir paseo
  useEffect(() => {
    if (!sharedWalk || !uid) return
    addDoc(collection(db, 'posts'), {
      authorUid: uid,
      user:      user?.name || 'Tú',
      avatar:    user?.photoUrl || null,
      img:       null,
      caption:   `¡Acabo de terminar un paseo con ${pet?.name || 'mi mascota'}! 🐾 ${sharedWalk.duration} · ${sharedWalk.distance} · ${sharedWalk.waste} desechos recogidos.`,
      category:  'momento',
      loc:       'Mi barrio',
      createdAt: Timestamp.fromDate(new Date()),
      likedBy:   [],
    }).catch(() => {})
    onClearShared()
  }, [sharedWalk])

  async function submitPost() {
    const text = newPostText.trim()
    if (!text || !uid) return
    setPosting(true)
    setPostError('')
    try {
      await addDoc(collection(db, 'posts'), {
        authorUid: uid,
        user:      user?.name || 'Tú',
        avatar:    user?.photoUrl || null,
        img:       null,
        caption:   text,
        category:  newPostCat,
        loc:       'Mi barrio',
        createdAt: Timestamp.fromDate(new Date()),
        likedBy:   [],
      })
      // Solo cerrar el modal si la escritura fue exitosa
      setNewPostText('')
      setNewPostCat('momento')
      setShowCompose(false)
    } catch (err) {
      console.error('Error publicando:', err)
      setPostError('No se pudo publicar. Verifica tu conexión e inténtalo de nuevo.')
    } finally {
      setPosting(false)
    }
  }

  async function toggleLike(postId) {
    if (!uid) return
    const post = feed.find(p => p.id === postId)
    if (!post) return
    await updateDoc(doc(db, 'posts', postId), {
      likedBy: post.liked ? arrayRemove(uid) : arrayUnion(uid),
    }).catch(() => {})
  }

  const SUB_TABS = [
    { key: 'feed',    icon: 'dynamic_feed', label: 'Todo'      },
    { key: 'alertas', icon: 'search',        label: 'Alertas'   },
    { key: 'adopt',   icon: 'favorite',      label: 'Adopción'  },
    { key: 'ranking', icon: 'emoji_events',  label: 'Ranking'   },
  ]

  // Early return DESPUÉS de todos los hooks — auth aún no disponible
  if (!uid) return (
    <div className="flex items-center justify-center h-full bg-bg-light dark:bg-bg-dark">
      <p className="text-sm text-text-sec font-medium">Cargando...</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark relative">

      {/* Modal: Publicar en Mi barrio */}
      {showCompose && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-end">
          <div className="w-full bg-white dark:bg-surface-dark rounded-t-3xl p-6 pb-10 slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Publicar en Mi barrio</h3>
              <button onClick={() => setShowCompose(false)}>
                <Icon name="close" className="text-text-sec text-xl" />
              </button>
            </div>
            <select
              value={newPostCat}
              onChange={e => setNewPostCat(e.target.value)}
              className="input-base mb-3"
            >
              {POST_CATS.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
            </select>
            <textarea
              value={newPostText}
              onChange={e => setNewPostText(e.target.value)}
              className="input-base mb-4 resize-none"
              rows={4}
              placeholder="Comparte un dato útil, una recomendación, una alerta o una mejora para empezar…"
            />
            {postError && (
              <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Icon name="error" filled className="text-red-500 text-base flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400 font-semibold">{postError}</p>
              </div>
            )}
            <button
              onClick={submitPost}
              disabled={!newPostText.trim() || posting}
              className="w-full bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 transition-transform"
            >
              {posting ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      <div className="px-5 pt-10 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Mi barrio</h1>
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-1.5 bg-primary text-gray-900 font-extrabold px-4 py-2 rounded-full text-xs shadow-sm active:scale-95 transition-transform"
          >
            <Icon name="add" className="text-sm" /> Publicar
          </button>
        </div>

        {/* Tarjeta de bienvenida — primera vez */}
        {showInfo && (
          <div className="mb-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3">
            <span className="text-2xl flex-shrink-0">🏘️</span>
            <div className="flex-1">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white">Bienvenido / Bienvenida a</p>
              <p className="font-extrabold text-sm text-primary">Mi barrio</p>
              <p className="text-xs text-text-sec font-medium mt-1 leading-relaxed">Aquí ves información útil de tu entorno, compartes datos, reportas problemas y ayudas a convivir mejor.</p>
            </div>
            <button onClick={() => { localStorage.setItem('seen_barrio', '1'); setShowInfo(false) }} className="flex-shrink-0 text-text-sec">
              <Icon name="close" className="text-lg" />
            </button>
          </div>
        )}

        {/* Tabs: scroll horizontal con chips de tamaño fijo */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-1" style={{ width: 'max-content' }}>
            {SUB_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setSub(t.key)}
                className={`flex items-center gap-1 px-4 py-2.5 rounded-2xl text-[11px] font-extrabold whitespace-nowrap transition-all ${sub === t.key ? 'bg-primary text-gray-900' : 'bg-white dark:bg-surface-dark text-text-sec border border-gray-200 dark:border-border-dark'}`}
              >
                <Icon name={t.icon} className="text-sm" />{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {sub === 'feed'    && <FeedView feed={feed} onLike={toggleLike} onMessage={onMessage} onCompose={() => setShowCompose(true)} />}
        {sub === 'alertas' && <AlertasView filter={lostFilter} setFilter={setLostFilter} selected={selectedLost} setSelected={setSelectedLost} />}
        {sub === 'adopt'   && <AdoptView />}
        {sub === 'ranking' && <RankingView user={user} />}
      </div>
    </div>
  )
}

function FeedView({ feed, onLike, onMessage, onCompose }) {
  const { user } = useApp()
  const [openComment, setOpenComment]   = useState(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [comments, setComments]         = useState({})

  function submitComment(postId) {
    const text = commentDraft.trim()
    if (!text) return
    setComments(c => ({ ...c, [postId]: [...(c[postId] || []), { id: Date.now(), author: user?.name || 'Tú', text }] }))
    setCommentDraft('')
    setOpenComment(null)
  }

  const getCatEmoji = key => POST_CATS.find(c => c.key === key)?.emoji || ''
  const getCatLabel = key => POST_CATS.find(c => c.key === key)?.label || ''

  if (feed.length === 0) return (
    <div className="text-center pt-16 px-8">
      <span className="text-5xl">🏘️</span>
      <p className="text-gray-700 dark:text-gray-200 font-extrabold text-base mt-4">Aún no hay publicaciones</p>
      <p className="text-text-sec text-sm font-medium mt-2 mb-5 leading-relaxed">
        Comparte un dato útil, una recomendación, una alerta o una mejora para empezar.
      </p>
      <button
        onClick={onCompose}
        className="bg-primary text-gray-900 font-extrabold py-3 px-6 rounded-2xl text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform"
      >
        Publicar algo en Mi barrio
      </button>
    </div>
  )

  return (
    <div className="space-y-4 px-5">
      {feed.map(post => {
        const postComments = comments[post.id] || []
        const likeCount    = (post.likedBy || []).length
        const catEmoji     = getCatEmoji(post.category)
        const catLabel     = getCatLabel(post.category)
        const dateStr      = post.createdAt?.toDate
          ? new Date(post.createdAt.toDate()).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
          : 'ahora'
        return (
          <div key={post.id} className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden fade-in">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <Avatar src={post.avatar} size={9} ring />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">{post.user}</p>
                <p className="text-xs text-text-sec">{post.loc} · {dateStr}</p>
              </div>
              <button onClick={() => onMessage(post.user)} className="px-3 py-1.5 rounded-full border border-primary/30 text-primary text-xs font-bold flex-shrink-0">
                Mensaje
              </button>
            </div>
            {post.img && <img src={post.img} className="w-full aspect-square object-cover" alt="" />}
            <div className="px-4 py-3">
              {catLabel && (
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-text-sec bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mb-2">
                  {catEmoji} {catLabel}
                </span>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{post.caption}</p>
              <div className="flex items-center gap-4 mt-3">
                <button onClick={() => onLike(post.id)} className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${post.liked ? 'text-red-500' : 'text-text-sec'}`}>
                  <Icon name={post.liked ? 'favorite' : 'favorite_border'} className="text-base" />{likeCount}
                </button>
                <button onClick={() => setOpenComment(openComment === post.id ? null : post.id)} className="flex items-center gap-1.5 text-sm font-bold text-text-sec">
                  <Icon name="chat_bubble_outline" className="text-base" />
                  Comentar{postComments.length > 0 && ` (${postComments.length})`}
                </button>
              </div>
              {postComments.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-gray-50 dark:border-border-dark pt-3">
                  {postComments.map(c => (
                    <p key={c.id} className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-extrabold">{c.author}: </span>{c.text}
                    </p>
                  ))}
                </div>
              )}
              {openComment === post.id && (
                <div className="mt-3 flex gap-2">
                  <input className="flex-1 input-base py-2 text-sm" placeholder="Escribe un comentario..." value={commentDraft} onChange={e => setCommentDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment(post.id)} autoFocus />
                  <button onClick={() => submitComment(post.id)} disabled={!commentDraft.trim()} className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40">
                    <Icon name="send" filled className="text-gray-900 text-base" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AlertasView({ filter, setFilter, selected, setSelected }) {
  const filters = ['todos', 'perdido', 'encontrado', 'avistamiento']
  const filterMap = { todos: null, perdido: 'perdido', encontrado: 'encontrado', avistamiento: 'avistamiento' }
  const visible = filter === 'todos' ? MOCK_LOST : MOCK_LOST.filter(d => d.status === filterMap[filter])

  if (selected) return (
    <div className="px-5 slide-up">
      <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-bold text-text-sec mb-4">
        <Icon name="arrow_back" className="text-base" /> Volver
      </button>
      <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm">
        <img src={selected.img} className="w-full aspect-video object-cover" alt=""
          onError={e => { e.currentTarget.style.display = 'none' }} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{selected.name}</h2>
              <p className="text-sm text-text-sec font-medium">{selected.breed} · {selected.color} · {selected.age}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${selected.status === 'perdido' ? 'bg-red-100 text-red-600' : selected.status === 'avistamiento' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-700'}`}>{selected.status === 'avistamiento' ? 'Avistada' : selected.status}</span>
          </div>
          <div className="space-y-2 text-sm mb-5">
            <p><span className="font-extrabold text-gray-700 dark:text-gray-300">Zona:</span> <span className="text-text-sec">{selected.zone}</span></p>
            <p><span className="font-extrabold text-gray-700 dark:text-gray-300">Último avistamiento:</span> <span className="text-text-sec">{selected.lastSeen}</span></p>
            <p><span className="font-extrabold text-gray-700 dark:text-gray-300">Fecha:</span> <span className="text-text-sec">{selected.date}</span></p>
            {selected.reward === 'Sí' && <p><span className="font-extrabold text-gray-700 dark:text-gray-300">Recompensa:</span> <span className="text-primary font-bold">Sí</span></p>}
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-xs text-amber-700 dark:text-amber-400 font-semibold">
            Solo se muestra la zona aproximada. Los datos privados del dueño/a no son públicos.
          </div>
          <a href={`tel:${selected.phone}`} className="w-full bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Icon name="call" filled className="text-xl" /> Contactar
          </a>
        </div>
      </div>
    </div>
  )

  const FILTER_LABELS = { todos: 'Todos', perdido: 'Perdida', encontrado: 'Encontrada', avistamiento: 'Avistada' }

  return (
    <div className="px-5">
      <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-4 flex gap-3 items-start">
        <span className="text-lg flex-shrink-0 mt-0.5">🔍</span>
        <div>
          <p className="text-xs text-gray-700 dark:text-gray-300 font-extrabold mb-1">¿Perdiste, encontraste o avistaste una mascota?</p>
          <p className="text-xs text-text-sec font-medium leading-relaxed">
            Toca la tarjeta para ver los detalles y contactar al dueño/a. Solo se muestra la zona aproximada.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto no-scrollbar mb-4 pb-1">
        <div className="flex gap-2" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${filter === f ? 'bg-primary text-gray-900' : 'bg-white dark:bg-surface-dark text-text-sec border border-gray-200 dark:border-border-dark'}`}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="text-center text-sm text-text-sec font-medium pt-8">No hay alertas con ese filtro.</p>
      ) : (
        <div className="space-y-3">
          {visible.map(dog => (
            <button key={dog.id} onClick={() => setSelected(dog)} className="w-full bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden flex text-left">
              <img src={dog.img} className="w-24 h-24 object-cover flex-shrink-0" alt=""
                onError={e => { e.currentTarget.style.display = 'none' }} />
              <div className="p-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white">{dog.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${dog.status === 'perdido' ? 'bg-red-100 text-red-600' : dog.status === 'avistamiento' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-700'}`}>{dog.status === 'avistamiento' ? 'Avistada' : dog.status}</span>
                </div>
                <p className="text-xs text-text-sec font-medium">{dog.breed}</p>
                <p className="text-xs text-text-sec font-medium">{dog.zone} · {dog.date}</p>
                {dog.reward === 'Sí' && <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full mt-1 inline-block">Recompensa</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AdoptView() {
  const [selected, setSelected] = useState(null)

  if (selected) return (
    <div className="px-5 slide-up">
      <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-bold text-text-sec mb-4">
        <Icon name="arrow_back" className="text-base" /> Volver
      </button>
      <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm">
        <img src={selected.img} className="w-full aspect-video object-cover" alt=""
          onError={e => { e.currentTarget.style.display = 'none' }} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{selected.name}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${selected.status === 'disponible' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{selected.status}</span>
          </div>
          <p className="text-sm text-text-sec font-medium mb-3">{selected.breed} · {selected.age} · {selected.sex}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{selected.desc}</p>
          <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-4">Organización: {selected.org}</p>
          <button
            onClick={() => {
              const msg = encodeURIComponent(`Hola, vi a ${selected.name} en Firulais y me interesa adoptarlo/a. ¿Me pueden dar más información?`)
              window.open(`https://wa.me/${selected.phone}?text=${msg}`, '_blank')
            }}
            className="w-full bg-[#25D366] text-white font-extrabold py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Icon name="chat" filled className="text-xl" /> Contactar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="px-5">
      <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-4 flex gap-3 items-start">
        <span className="text-lg flex-shrink-0 mt-0.5">🐾</span>
        <div>
          <p className="text-xs text-gray-700 dark:text-gray-300 font-extrabold mb-1">Adopción responsable</p>
          <p className="text-xs text-text-sec font-medium leading-relaxed">
            Toca la tarjeta para ver más info y contactar. Para publicar una mascota en adopción, escríbenos a través de Mi barrio.
          </p>
        </div>
      </div>
      <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-4">Mascotas en adopción</p>
      <div className="grid grid-cols-2 gap-3">
        {MOCK_ADOPTION.map(dog => (
          <button key={dog.id} onClick={() => setSelected(dog)} className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden text-left">
            <div className="relative">
              <img src={dog.img} className="w-full aspect-square object-cover" alt="" />
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-extrabold ${dog.status === 'disponible' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>{dog.status}</span>
            </div>
            <div className="p-3">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white">{dog.name}</p>
              <p className="text-xs text-text-sec font-medium">{dog.breed}</p>
              <p className="text-xs text-text-sec">{dog.age} · {dog.sex}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function RankingView({ user }) {
  const myRank = MOCK_RANKING.findIndex(r => r.user === user?.name) + 1
  return (
    <div className="px-5">
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-5 flex items-center gap-3">
        <span className="text-3xl">🏆</span>
        <div>
          <p className="font-extrabold text-sm text-gray-900 dark:text-white">Ranking mensual · Mar 2026</p>
          <p className="text-xs text-text-sec font-medium">
            {myRank > 0 ? `Ocupas el puesto #${myRank} · ¡Sigue así!` : 'Suma paseos responsables para aparecer en el ranking.'}
          </p>
        </div>
      </div>
      <p className="text-xs text-text-sec font-medium mb-3 leading-relaxed">
        Premia paseos responsables y disposición adecuada de desechos. No es solo quién pasea más, sino cómo.
      </p>
      <div className="space-y-2">
        {MOCK_RANKING.map((r, i) => (
          <div key={r.user} className={`bg-white dark:bg-surface-dark rounded-2xl p-4 flex items-center gap-3 shadow-sm ${r.user === user?.name ? 'ring-2 ring-primary' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-text-sec'}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : r.rank}
            </div>
            <Avatar src={r.avatar} size={9} />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate">{r.user}</p>
              <p className="text-xs text-text-sec font-medium">{r.zone} · {r.walks} paseos · {r.waste} desechos</p>
            </div>
            <span className="text-sm font-extrabold text-primary flex-shrink-0">{r.points.toLocaleString('es-CL')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
