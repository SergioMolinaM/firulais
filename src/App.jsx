import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { collection, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { Icon } from './components/ui'
import Onboarding from './components/Onboarding'
import TabPaseo from './components/TabPaseo'
import TabBarrio from './components/TabBarrio'
import TabManada from './components/TabManada'
import TabTienda from './components/TabTienda'
import TabVeterinario from './components/TabVeterinario'
import TabPerfil from './components/TabPerfil'
import { useApp } from './context/AppContext'
import { db } from './lib/firebase'
import { MOCK_CONVS } from './data/mockData'

const NAV_TABS = [
  { path: '/paseo',  icon: 'directions_run', label: 'Paseo'  },
  { path: '/barrio', icon: 'location_city',  label: 'Barrio' },
  { path: '/manada', icon: 'chat_bubble',    label: 'Manada' },
  { path: '/vet',    icon: 'local_hospital', label: 'Vet'    },
  { path: '/tienda', icon: 'storefront',     label: 'Tienda' },
  { path: '/perfil', icon: 'person',         label: 'Perfil' },
]

export default function App() {
  const { user, pets, loading, handleOnboarded } = useApp()

  if (loading) return <Splash />
  if (!user) return <Onboarding onDone={handleOnboarded} />
  if (user.hasPets && pets.length === 0) return <Onboarding onDone={handleOnboarded} />

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/paseo" replace />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  )
}

function Splash() {
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-bg-dark gap-4">
      <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30 animate-pulse">
        <span className="text-3xl">🐾</span>
      </div>
      <span className="text-xl font-extrabold text-white tracking-tight">Firulais</span>
    </div>
  )
}

function AppLayout() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { logout, uid } = useApp()
  const [convs, setConvs]           = useState([])
  const [sharedWalk, setSharedWalk] = useState(null)

  // Cargar convs desde Firestore con onSnapshot
  useEffect(() => {
    if (!uid) return
    let seeded = false
    const unsub = onSnapshot(collection(db, 'users', uid, 'convs'), snap => {
      if (snap.empty && !seeded) {
        seeded = true
        MOCK_CONVS.forEach(c => setDoc(doc(db, 'users', uid, 'convs', c.id), c))
        return
      }
      setConvs(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.time || '').localeCompare(a.time || '')))
    }, () => { setConvs(MOCK_CONVS) })
    return unsub
  }, [uid])

  const path        = location.pathname
  const totalUnread = convs.reduce((s, c) => s + (c.unread || 0), 0)

  async function handleMessage(userId) {
    if (!uid) return
    const id = userId.toLowerCase().replace(/\s/g, '_')
    const existing = convs.find(c => c.id === id)
    if (!existing) {
      await setDoc(doc(db, 'users', uid, 'convs', id), {
        id, user: userId,
        photo: `https://i.pravatar.cc/80?u=${userId}`,
        lastMsg: '', time: 'ahora', unread: 0, messages: [],
      })
    }
    navigate('/manada')
  }

  function handleLogout() {
    logout()
    navigate('/paseo', { replace: true })
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-[430px] mx-auto bg-white dark:bg-bg-dark overflow-hidden">

      <div className="flex-1 overflow-hidden">
        {/* Paseo siempre montado para preservar estado GPS/timer */}
        <div className={path === '/paseo' ? 'h-full' : 'hidden'}>
          <TabPaseo onShareWalk={walk => setSharedWalk(walk)} />
        </div>

        <Routes>
          <Route path="/barrio"   element={<TabBarrio onMessage={handleMessage} sharedWalk={sharedWalk} onClearShared={() => setSharedWalk(null)} />} />
          <Route path="/manada"   element={<TabManada convs={convs} uid={uid} />} />
          <Route path="/vet"      element={<TabVeterinario />} />
          <Route path="/tienda"   element={<TabTienda />} />
          <Route path="/perfil/*" element={<TabPerfil onLogout={handleLogout} />} />
        </Routes>
      </div>

      {/* Bottom nav — 6 tabs */}
      <nav className="flex-shrink-0 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-border-dark flex items-center px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {NAV_TABS.map(t => {
          const active = path === t.path || path.startsWith(t.path + '/')
          const badge  = t.path === '/manada' ? totalUnread : 0
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${active ? 'text-primary' : 'text-gray-400'}`}
            >
              <div className="relative">
                <Icon name={t.icon} filled={active} className={`text-[22px] transition-transform ${active ? 'scale-110' : ''}`} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-extrabold text-gray-900">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold tracking-wide leading-none">{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
