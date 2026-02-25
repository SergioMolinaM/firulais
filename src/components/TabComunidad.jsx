import { useState } from 'react'
import { Icon, Avatar, Badge } from './ui'
import { MOCK_FEED, MOCK_LOST, MOCK_ADOPTION, MOCK_RANKING } from '../data/mockData'

export default function TabComunidad({ user, pet, onMessage, sharedWalk, onClearShared }) {
  const [sub, setSub] = useState('feed')
  const [feed, setFeed] = useState(sharedWalk
    ? [{ id: Date.now(), user: user?.name || 'Tú', avatar: user?.photoUrl, img: null, caption: `¡Acabo de terminar un paseo con ${pet?.name}! 🐾 ${sharedWalk.duration} · ${sharedWalk.distance} · ${sharedWalk.waste} desechos recogidos.`, loc: 'Mi barrio', time: 'ahora', likes: 0, liked: false }, ...MOCK_FEED]
    : MOCK_FEED
  )
  const [lostFilter, setLostFilter] = useState('todos')
  const [selectedLost, setSelectedLost] = useState(null)

  function toggleLike(id) {
    setFeed(f => f.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p))
  }

  const TABS = [
    { key: 'feed', icon: 'dynamic_feed', label: 'Feed' },
    { key: 'sos', icon: 'search', label: 'SOS' },
    { key: 'adopt', icon: 'favorite', label: 'Adóptame' },
    { key: 'ranking', icon: 'emoji_events', label: 'Ranking' },
  ]

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark">
      <div className="px-5 pt-10 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">Comunidad</h1>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setSub(t.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${sub === t.key ? 'bg-primary text-gray-900' : 'bg-white dark:bg-surface-dark text-text-sec border border-gray-200 dark:border-border-dark'}`}
            >
              <Icon name={t.icon} className="text-sm" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {sub === 'feed' && <FeedView feed={feed} onLike={toggleLike} onMessage={onMessage} />}
        {sub === 'sos' && <SOSView filter={lostFilter} setFilter={setLostFilter} selected={selectedLost} setSelected={setSelectedLost} />}
        {sub === 'adopt' && <AdoptView />}
        {sub === 'ranking' && <RankingView user={user} />}
      </div>
    </div>
  )
}

function FeedView({ feed, onLike, onMessage }) {
  return (
    <div className="space-y-4 px-5">
      {feed.map(post => (
        <div key={post.id} className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden fade-in">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <Avatar src={post.avatar} size={9} ring />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white">{post.user}</p>
              <p className="text-xs text-text-sec">{post.loc} · {post.time}</p>
            </div>
            <button onClick={() => onMessage(post.user)} className="px-3 py-1.5 rounded-full border border-primary/30 text-primary text-xs font-bold">
              Mensaje
            </button>
          </div>
          {post.img && <img src={post.img} className="w-full aspect-square object-cover" alt="" />}
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{post.caption}</p>
            <div className="flex items-center gap-4 mt-3">
              <button onClick={() => onLike(post.id)} className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${post.liked ? 'text-red-500' : 'text-text-sec'}`}>
                <Icon name={post.liked ? 'favorite' : 'favorite_border'} className="text-base" />{post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-sm font-bold text-text-sec">
                <Icon name="chat_bubble_outline" className="text-base" /> Comentar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SOSView({ filter, setFilter, selected, setSelected }) {
  const filters = ['todos', 'perdido', 'encontrado']
  const visible = filter === 'todos' ? MOCK_LOST : MOCK_LOST.filter(d => d.status === filter)

  if (selected) return (
    <div className="px-5 slide-up">
      <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-bold text-text-sec mb-4">
        <Icon name="arrow_back" className="text-base" /> Volver
      </button>
      <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm">
        <img src={selected.img} className="w-full aspect-video object-cover" alt="" />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{selected.name}</h2>
              <p className="text-sm text-text-sec font-medium">{selected.breed} · {selected.color} · {selected.age}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${selected.status === 'perdido' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
              {selected.status}
            </span>
          </div>
          <div className="space-y-2 text-sm mb-5">
            <p><span className="font-extrabold text-gray-700 dark:text-gray-300">Zona:</span> <span className="text-text-sec">{selected.zone}</span></p>
            <p><span className="font-extrabold text-gray-700 dark:text-gray-300">Último avistamiento:</span> <span className="text-text-sec">{selected.lastSeen}</span></p>
            <p><span className="font-extrabold text-gray-700 dark:text-gray-300">Fecha:</span> <span className="text-text-sec">{selected.date}</span></p>
            <p><span className="font-extrabold text-gray-700 dark:text-gray-300">Recompensa:</span> <span className="text-text-sec">{selected.reward}</span></p>
          </div>
          <a href={`tel:${selected.phone}`} className="w-full bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Icon name="call" filled className="text-xl" /> Llamar al dueño
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="px-5">
      <div className="flex gap-2 mb-4">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold capitalize transition-all ${filter === f ? 'bg-primary text-gray-900' : 'bg-white dark:bg-surface-dark text-text-sec border border-gray-200 dark:border-border-dark'}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {visible.map(dog => (
          <button key={dog.id} onClick={() => setSelected(dog)} className="w-full bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden flex text-left">
            <img src={dog.img} className="w-24 h-24 object-cover flex-shrink-0" alt="" />
            <div className="p-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">{dog.name}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${dog.status === 'perdido' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{dog.status}</span>
              </div>
              <p className="text-xs text-text-sec font-medium">{dog.breed}</p>
              <p className="text-xs text-text-sec font-medium">{dog.zone} · {dog.date}</p>
              {dog.reward === 'Sí' && <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full mt-1 inline-block">Recompensa</span>}
            </div>
          </button>
        ))}
      </div>
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
        <img src={selected.img} className="w-full aspect-video object-cover" alt="" />
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{selected.name}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${selected.status === 'disponible' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{selected.status}</span>
          </div>
          <p className="text-sm text-text-sec font-medium mb-3">{selected.breed} · {selected.age} · {selected.sex}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{selected.desc}</p>
          <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-4">Organización: {selected.org}</p>
          <button className="w-full bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            Me interesa adoptarlo
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="px-5">
      <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-4">Perros en adopción</p>
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
          <p className="font-extrabold text-sm text-gray-900 dark:text-white">Ranking mensual · Feb 2026</p>
          <p className="text-xs text-text-sec font-medium">
            {myRank > 0 ? `Ocupas el puesto #${myRank}` : 'Pasea más para aparecer en el ranking'}
          </p>
        </div>
      </div>

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
