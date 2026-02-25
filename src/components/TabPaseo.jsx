import { useState, useEffect, useRef } from 'react'
import { Icon } from './ui'

const WALK_HISTORY = [
  { id: 'w1', date: '24 feb 2026', duration: '28 min', distance: '2.1 km', waste: 2, points: 40, shared: false },
  { id: 'w2', date: '22 feb 2026', duration: '35 min', distance: '2.8 km', waste: 1, points: 30, shared: true },
  { id: 'w3', date: '21 feb 2026', duration: '20 min', distance: '1.4 km', waste: 0, points: 10, shared: false },
  { id: 'w4', date: '18 feb 2026', duration: '42 min', distance: '3.2 km', waste: 3, points: 60, shared: true },
]

export default function TabPaseo({ user, pet, onAddPoints, onShareWalk }) {
  const [walking, setWalking] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [wasteCount, setWasteCount] = useState(0)
  const [view, setView] = useState('home') // 'home' | 'active' | 'summary' | 'history'
  const [lastWalk, setLastWalk] = useState(null)
  const [history, setHistory] = useState(WALK_HISTORY)
  const interval = useRef(null)

  useEffect(() => {
    if (walking) {
      interval.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(interval.current)
    }
    return () => clearInterval(interval.current)
  }, [walking])

  function startWalk() {
    setSeconds(0)
    setWasteCount(0)
    setWalking(true)
    setView('active')
  }

  function registerWaste() {
    setWasteCount(c => c + 1)
  }

  function endWalk() {
    setWalking(false)
    const pts = 10 + wasteCount * 10
    const dist = ((seconds / 60) * 0.065).toFixed(1)
    const walk = {
      id: `w${Date.now()}`,
      date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
      duration: `${Math.floor(seconds / 60)} min`,
      distance: `${dist} km`,
      waste: wasteCount,
      points: pts,
      shared: false,
    }
    setLastWalk(walk)
    setHistory(h => [walk, ...h])
    onAddPoints(pts)
    setView('summary')
  }

  function openGoogleMaps() {
    const q = encodeURIComponent('parques para perros Santiago')
    window.open(`https://maps.google.com/?q=${q}`, '_blank')
  }

  function shareWalk() {
    if (!lastWalk) return
    onShareWalk(lastWalk)
    setLastWalk(w => ({ ...w, shared: true }))
    setHistory(h => h.map(w => w.id === lastWalk.id ? { ...w, shared: true } : w))
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (view === 'active') return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark px-6 pt-10 pb-8 slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest">Paseo activo</p>
          <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">{pet?.name || 'tu perro'}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-pulse">
          <span className="w-3 h-3 bg-primary rounded-full block" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white tabular-nums">
          {fmt(seconds)}
        </div>
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-2xl font-extrabold text-primary">{wasteCount}</p>
            <p className="text-xs text-text-sec font-semibold mt-0.5">desechos</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-primary">+{10 + wasteCount * 10}</p>
            <p className="text-xs text-text-sec font-semibold mt-0.5">puntos</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-primary">{((seconds / 60) * 0.065).toFixed(1)}</p>
            <p className="text-xs text-text-sec font-semibold mt-0.5">km</p>
          </div>
        </div>

        <button
          onClick={registerWaste}
          className="w-36 h-36 rounded-full bg-primary/10 border-4 border-primary flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform shadow-xl shadow-primary/20"
        >
          <span className="text-3xl">🗑️</span>
          <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Registrar</span>
          <span className="text-xs text-text-sec">desecho</span>
        </button>

        <button onClick={openGoogleMaps} className="flex items-center gap-2 text-sm font-semibold text-text-sec py-2">
          <Icon name="map" className="text-base" /> Ver mapa en Google Maps
        </button>
      </div>

      <button
        onClick={endWalk}
        className="w-full bg-red-500 text-white font-extrabold py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-transform"
      >
        Terminar paseo
      </button>
    </div>
  )

  if (view === 'summary') return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark px-6 pt-10 pb-8 slide-up">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🐾</span>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">¡Buen paseo!</h2>
        <p className="text-text-sec text-sm font-medium mt-1">Ganaste <span className="text-primary font-extrabold">+{lastWalk?.points} pts</span></p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: 'timer', label: 'Duración', val: lastWalk?.duration },
          { icon: 'route', label: 'Distancia', val: lastWalk?.distance },
          { icon: 'delete', label: 'Desechos', val: lastWalk?.waste },
        ].map(({ icon, label, val }) => (
          <div key={label} className="bg-white dark:bg-surface-dark rounded-2xl p-4 text-center shadow-sm">
            <Icon name={icon} filled className="text-primary text-2xl mb-1" />
            <p className="text-lg font-extrabold text-gray-900 dark:text-white">{val}</p>
            <p className="text-xs text-text-sec font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        {!lastWalk?.shared ? (
          <button
            onClick={shareWalk}
            className="w-full bg-primary text-gray-900 font-extrabold py-3.5 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Icon name="share" className="text-xl" /> Compartir en comunidad
          </button>
        ) : (
          <div className="w-full bg-primary/10 border border-primary/20 text-primary font-extrabold py-3.5 rounded-2xl text-base text-center">
            ✓ Compartido en comunidad
          </div>
        )}
        <button
          onClick={() => setView('home')}
          className="w-full bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 font-extrabold py-3.5 rounded-2xl text-base border border-gray-200 dark:border-border-dark active:scale-95 transition-transform"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )

  if (view === 'history') return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark slide-up">
      <div className="px-6 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => setView('home')} className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm">
          <Icon name="arrow_back" className="text-gray-700 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Historial de paseos</h2>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-8 space-y-3">
        {history.map(w => (
          <div key={w.id} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white">{w.date}</p>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">+{w.points} pts</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-text-sec font-medium flex items-center gap-1"><Icon name="timer" className="text-base" />{w.duration}</span>
              <span className="text-text-sec font-medium flex items-center gap-1"><Icon name="route" className="text-base" />{w.distance}</span>
              <span className="text-text-sec font-medium flex items-center gap-1"><Icon name="delete" className="text-base" />{w.waste}</span>
              {w.shared && <span className="text-primary font-semibold text-xs flex items-center gap-1"><Icon name="check_circle" className="text-sm" />Compartido</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Home view
  const totalPts = history.reduce((s, w) => s + w.points, 0)
  const totalWalks = history.length
  const totalWaste = history.reduce((s, w) => s + w.waste, 0)

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar">
      <div className="px-6 pt-10 pb-6">
        <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-1">Listo para salir</p>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Paseo con {pet?.name || 'tu perro'}</h1>
      </div>

      <div className="px-6 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'directions_run', label: 'Paseos', val: totalWalks },
            { icon: 'delete', label: 'Desechos', val: totalWaste },
            { icon: 'emoji_events', label: 'Pts ganados', val: totalPts },
          ].map(({ icon, label, val }) => (
            <div key={label} className="bg-white dark:bg-surface-dark rounded-2xl p-4 text-center shadow-sm">
              <Icon name={icon} filled className="text-primary text-xl mb-1" />
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">{val}</p>
              <p className="text-xs text-text-sec font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 mb-5">
        <button
          onClick={startWalk}
          className="w-full bg-primary text-gray-900 font-extrabold py-5 rounded-2xl text-lg shadow-xl shadow-primary/25 active:scale-95 transition-transform flex items-center justify-center gap-3"
        >
          <Icon name="directions_run" filled className="text-2xl" />
          Iniciar paseo
        </button>
      </div>

      <div className="px-6 mb-3 flex items-center justify-between">
        <p className="text-sm font-extrabold text-gray-900 dark:text-white">Paseos recientes</p>
        <button onClick={() => setView('history')} className="text-xs font-bold text-primary">Ver todo</button>
      </div>

      <div className="px-6 pb-8 space-y-3">
        {history.slice(0, 3).map(w => (
          <div key={w.id} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="directions_run" filled className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white">{w.date}</p>
              <p className="text-xs text-text-sec font-medium">{w.duration} · {w.distance} · {w.waste} desechos</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">+{w.points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
