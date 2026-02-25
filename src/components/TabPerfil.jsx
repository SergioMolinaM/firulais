import { useState } from 'react'
import { Icon, Avatar } from './ui'
import { MOCK_RANKING } from '../data/mockData'

export default function TabPerfil({ user, pet, onLogout }) {
  const [view, setView] = useState('main') // 'main' | 'settings'
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'))
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('firulais_gemini_key') || '')
  const [saved, setSaved] = useState(false)

  const myRankData = MOCK_RANKING.find(r => r.user === user?.name)

  function toggleDark() {
    const d = !darkMode
    setDarkMode(d)
    document.documentElement.classList.toggle('dark', d)
  }

  function saveKey() {
    localStorage.setItem('firulais_gemini_key', geminiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (view === 'settings') return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar slide-up">
      <div className="flex items-center gap-3 px-5 pt-10 pb-4">
        <button onClick={() => setView('main')} className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm">
          <Icon name="arrow_back" className="text-gray-700 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Configuración</h2>
      </div>

      <div className="px-5 pb-8 space-y-3">
        <Section label="Apariencia">
          <Row icon="dark_mode" label="Modo oscuro">
            <button onClick={toggleDark} className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'} relative`}>
              <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </Row>
        </Section>

        <Section label="VetBot IA">
          <div className="p-4">
            <p className="text-xs text-text-sec font-medium mb-3 leading-relaxed">
              Ingresa tu API Key de Google Gemini para activar el asistente veterinario. Consíguela gratis en{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary font-bold">aistudio.google.com</a>.
            </p>
            <input
              className="input-base mb-3"
              type="password"
              placeholder="AIza..."
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
            />
            <button
              onClick={saveKey}
              className="w-full bg-primary text-gray-900 font-extrabold py-3 rounded-xl text-sm active:scale-95 transition-transform"
            >
              {saved ? '✓ Guardado' : 'Guardar API Key'}
            </button>
          </div>
        </Section>

        <Section label="Cuenta">
          <Row icon="notifications" label="Notificaciones de paseos">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Próximamente</span>
          </Row>
          <Row icon="share" label="Compartir Firulais">
            <Icon name="chevron_right" className="text-text-sec" />
          </Row>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 border-t border-gray-100 dark:border-border-dark"
          >
            <Icon name="logout" className="text-lg text-red-500" />
            <span className="text-sm font-extrabold">Cerrar sesión</span>
          </button>
        </Section>

        <p className="text-center text-xs text-text-sec font-medium pt-2">Firulais v0.1.0 · Hecho con 🐾 en Chile</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Perfil</h1>
        <button onClick={() => setView('settings')} className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm">
          <Icon name="settings" className="text-gray-600 dark:text-gray-300 text-xl" />
        </button>
      </div>

      <div className="px-5 mb-5">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <Avatar src={user?.photoUrl} size={16} ring />
            <div>
              <p className="font-extrabold text-xl text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-text-sec font-medium">{user?.email || 'Sin email'}</p>
              <p className="text-xs text-text-sec font-medium mt-0.5">Miembro desde {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }) : 'hoy'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-primary/10 rounded-xl py-3 text-center">
              <p className="text-xl font-extrabold text-primary">{user?.points || 0}</p>
              <p className="text-xs text-text-sec font-semibold">Puntos</p>
            </div>
            {myRankData && (
              <>
                <div className="flex-1 bg-gray-50 dark:bg-bg-dark rounded-xl py-3 text-center">
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">{myRankData.walks}</p>
                  <p className="text-xs text-text-sec font-semibold">Paseos</p>
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-bg-dark rounded-xl py-3 text-center">
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">{myRankData.waste}</p>
                  <p className="text-xs text-text-sec font-semibold">Desechos</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {pet && (
        <div className="px-5 mb-5">
          <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-3">Mi perro</p>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden">
            <img src={pet.photoUrl} className="w-full aspect-[3/1] object-cover object-top" alt="" />
            <div className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-extrabold text-lg text-gray-900 dark:text-white">{pet.name}</p>
                <p className="text-sm text-text-sec font-medium">{pet.breed}</p>
                <p className="text-xs text-text-sec font-medium">{new Date().getFullYear() - pet.birthYear} años · Nacido en {pet.birthYear}</p>
              </div>
              <span className="text-4xl">🐾</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pb-8">
        <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-3">Canjear puntos</p>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-extrabold text-base text-gray-900 dark:text-white">Tienes {user?.points || 0} puntos</p>
              <p className="text-xs text-text-sec font-medium">Canjéalos en descuentos y beneficios</p>
            </div>
          </div>
          <button className="w-full bg-primary text-gray-900 font-extrabold py-3 rounded-xl text-sm active:scale-95 transition-transform">
            Ver beneficios disponibles
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden">
      <p className="px-4 pt-3 pb-1 text-xs font-extrabold text-text-sec uppercase tracking-widest">{label}</p>
      {children}
    </div>
  )
}

function Row({ icon, label, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-border-dark last:border-0">
      <Icon name={icon} className="text-text-sec text-xl flex-shrink-0" />
      <p className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      {children}
    </div>
  )
}
