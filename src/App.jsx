import { useState, useEffect } from 'react'
import { Icon, Avatar } from './components/ui'
import Onboarding from './components/Onboarding'
import TabPaseo from './components/TabPaseo'
import TabComunidad from './components/TabComunidad'
import TabManada from './components/TabManada'
import TabTienda from './components/TabTienda'
import TabVeterinario from './components/TabVeterinario'
import TabPerfil from './components/TabPerfil'
import { MOCK_CONVS } from './data/mockData'

const TABS = [
  { key: 'paseo', icon: 'directions_run', label: 'Paseo' },
  { key: 'comunidad', icon: 'people', label: 'Comunidad' },
  { key: 'tienda', icon: 'storefront', label: 'Tienda' },
  { key: 'veterinario', icon: 'local_hospital', label: 'Vet' },
  { key: 'perfil', icon: 'person', label: 'Perfil' },
]

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('firulais_user')) } catch { return null }
  })
  const [pet, setPet] = useState(() => {
    try { return JSON.parse(localStorage.getItem('firulais_pet')) } catch { return null }
  })
  const [tab, setTab] = useState('paseo')
  const [convs, setConvs] = useState(MOCK_CONVS)
  const [manadaTarget, setManadaTarget] = useState(null)
  const [sharedWalk, setSharedWalk] = useState(null)

  const totalUnread = convs.reduce((s, c) => s + c.unread, 0)

  function handleOnboarded(u, p) {
    setUser(u)
    setPet(p)
  }

  function addPoints(pts) {
    if (!user) return
    const updated = { ...user, points: (user.points || 0) + pts }
    setUser(updated)
    localStorage.setItem('firulais_user', JSON.stringify(updated))
  }

  function handleMessage(userId) {
    // Find or create conversation
    const existing = convs.find(c => c.user === userId || c.id === userId)
    if (existing) {
      setManadaTarget(existing.id)
    } else {
      const newConv = {
        id: userId.toLowerCase().replace(/\s/g, '_'),
        user: userId,
        photo: `https://i.pravatar.cc/80?u=${userId}`,
        lastMsg: '',
        time: 'ahora',
        unread: 0,
        messages: [],
      }
      setConvs(cs => [...cs, newConv])
      setManadaTarget(newConv.id)
    }
    setTab('manada')
  }

  function handleShareWalk(walk) {
    setSharedWalk(walk)
  }

  function logout() {
    localStorage.removeItem('firulais_user')
    localStorage.removeItem('firulais_pet')
    setUser(null)
    setPet(null)
    setTab('paseo')
  }

  if (!user || !pet) return <Onboarding onDone={handleOnboarded} />

  return (
    <div className="flex flex-col h-[100dvh] max-w-[430px] mx-auto bg-bg-light dark:bg-bg-dark overflow-hidden relative">
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'paseo' && <TabPaseo user={user} pet={pet} onAddPoints={addPoints} onShareWalk={handleShareWalk} />}
        {tab === 'comunidad' && <TabComunidad user={user} pet={pet} onMessage={handleMessage} sharedWalk={sharedWalk} onClearShared={() => setSharedWalk(null)} />}
        {tab === 'tienda' && <TabTienda user={user} />}
        {tab === 'veterinario' && <TabVeterinario pet={pet} />}
        {tab === 'perfil' && <TabPerfil user={user} pet={pet} onLogout={logout} />}
      </div>

      {/* Manada overlay */}
      {tab === 'manada' && (
        <div className="absolute inset-0 z-50 bg-bg-light dark:bg-bg-dark">
          <TabManada
            user={user}
            convs={convs}
            setConvs={setConvs}
            target={manadaTarget}
            setTarget={setManadaTarget}
          />
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="flex-shrink-0 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-border-dark flex items-center px-1 pb-safe">
        {TABS.map(t => {
          const isActive = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${isActive ? 'text-primary' : 'text-text-sec'}`}
            >
              <Icon name={t.icon} filled={isActive} className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
              <span className="text-[10px] font-extrabold tracking-wide">{t.label}</span>
            </button>
          )
        })}

        {/* Mi Manada button */}
        <button
          onClick={() => setTab('manada')}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors relative ${tab === 'manada' ? 'text-primary' : 'text-text-sec'}`}
        >
          {totalUnread > 0 && (
            <span className="absolute top-1.5 right-4 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-extrabold text-gray-900">
              {totalUnread}
            </span>
          )}
          <Icon name="chat_bubble" filled={tab === 'manada'} className={`text-2xl transition-transform ${tab === 'manada' ? 'scale-110' : 'scale-100'}`} />
          <span className="text-[10px] font-extrabold tracking-wide">Manada</span>
        </button>
      </nav>
    </div>
  )
}
