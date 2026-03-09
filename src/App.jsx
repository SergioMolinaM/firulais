import { useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './components/ui'
import Onboarding from './components/Onboarding'
import TabPaseo from './components/TabPaseo'
import TabComunidad from './components/TabComunidad'
import TabManada from './components/TabManada'
import TabTienda from './components/TabTienda'
import TabVeterinario from './components/TabVeterinario'
import TabPerfil from './components/TabPerfil'
import { useApp } from './context/AppContext'
import { MOCK_CONVS } from './data/mockData'

const NAV_TABS = [
  { path: '/paseo',       icon: 'directions_run', label: 'Paseo'     },
  { path: '/comunidad',   icon: 'people',         label: 'Comunidad' },
  { path: '/tienda',      icon: 'storefront',     label: 'Tienda'    },
  { path: '/veterinario', icon: 'local_hospital', label: 'Vet'       },
  { path: '/perfil',      icon: 'person',         label: 'Perfil'    },
]

export default function App() {
  const { user, pet, loading, handleOnboarded } = useApp()

  if (loading) return <Splash />
  if (!user || !pet) return <Onboarding onDone={handleOnboarded} />

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
  const { logout } = useApp()
  const [convs, setConvs]               = useState(MOCK_CONVS)
  const [manadaTarget, setManadaTarget] = useState(null)
  const [sharedWalk, setSharedWalk]     = useState(null)

  const path = location.pathname

  function handleMessage(userId) {
    const existing = convs.find(c => c.user === userId)
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
    navigate('/manada')
  }

  function handleLogout() {
    logout()
    navigate('/paseo', { replace: true })
  }

  const totalUnread = convs.reduce((s, c) => s + c.unread, 0)

  return (
    <div className="flex flex-col h-[100dvh] max-w-[430px] mx-auto bg-white dark:bg-bg-dark overflow-hidden relative">

      {/* Content area */}
      <div className="flex-1 overflow-hidden">

        {/* TabPaseo siempre montado para preservar paseo activo */}
        <div className={path === '/paseo' ? 'h-full' : 'hidden'}>
          <TabPaseo onShareWalk={walk => setSharedWalk(walk)} />
        </div>

        <Routes>
          <Route path="/comunidad"   element={<TabComunidad onMessage={handleMessage} sharedWalk={sharedWalk} onClearShared={() => setSharedWalk(null)} />} />
          <Route path="/tienda"      element={<TabTienda />} />
          <Route path="/veterinario" element={<TabVeterinario />} />
          <Route path="/perfil/*"    element={<TabPerfil onLogout={handleLogout} />} />
        </Routes>

        {/* Manada overlay */}
        {path === '/manada' && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-bg-dark">
            <TabManada
              convs={convs}
              setConvs={setConvs}
              target={manadaTarget}
              setTarget={setManadaTarget}
            />
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="flex-shrink-0 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-border-dark flex items-center px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {NAV_TABS.map(t => {
          const active = path === t.path || path.startsWith(t.path + '/')
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active ? 'text-primary' : 'text-gray-400'}`}
            >
              <Icon name={t.icon} filled={active} className={`text-2xl transition-transform ${active ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-extrabold tracking-wide">{t.label}</span>
            </button>
          )
        })}

        {/* Manada */}
        <button
          onClick={() => navigate('/manada')}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors relative ${path === '/manada' ? 'text-primary' : 'text-gray-400'}`}
        >
          {totalUnread > 0 && (
            <span className="absolute top-1.5 right-4 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-extrabold text-gray-900">
              {totalUnread}
            </span>
          )}
          <Icon name="chat_bubble" filled={path === '/manada'} className={`text-2xl transition-transform ${path === '/manada' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-extrabold tracking-wide">Manada</span>
        </button>
      </nav>
    </div>
  )
}
