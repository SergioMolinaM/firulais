import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { Icon } from './ui'
import WalkMap from './WalkMap'
import { useApp } from '../context/AppContext'
import { db } from '../lib/firebase'

const SEEN_KEY = 'seen_paseo'

export default function TabPaseo({ onShareWalk }) {
  const { pet, uid, addPoints: onAddPoints } = useApp()
  const [walking,        setWalking]        = useState(false)
  const [seconds,        setSeconds]        = useState(0)
  const [wasteCount,     setWasteCount]     = useState(0)
  const [realDistance,   setRealDistance]   = useState(0)
  const [view,           setView]           = useState('home')
  const [lastWalk,       setLastWalk]       = useState(null)
  const [history,        setHistory]        = useState([])
  // ── Estos hooks DEBEN estar aquí arriba (Rules of Hooks) ──
  const [seenPaseo,      setSeenPaseo]      = useState(() => !!localStorage.getItem(SEEN_KEY))
  const [showWasteCheck, setShowWasteCheck] = useState(false)
  const [showWasteInfo,  setShowWasteInfo]  = useState(false)
  const interval = useRef(null)

  function dismissPaseoCard() {
    localStorage.setItem(SEEN_KEY, '1')
    setSeenPaseo(true)
  }

  // Load walk history from Firestore when uid is available
  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'users', uid, 'walks'), orderBy('createdAt', 'desc'))
    getDocs(q)
      .then(snap => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => { /* offline — keep empty */ })
  }, [uid])

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
    setRealDistance(0)
    setShowWasteCheck(false)
    setWalking(true)
    setView('active')
  }

  function registerWaste() {
    setWasteCount(c => c + 1)
  }

  // Si no registraron desechos, pregunta antes de cerrar
  function handleEndWalk() {
    if (wasteCount === 0) {
      setShowWasteCheck(true)
    } else {
      finishWalk(wasteCount)
    }
  }

  function answerWaste(picked) {
    setShowWasteCheck(false)
    finishWalk(picked ? 1 : 0)
  }

  function finishWalk(wc) {
    setWalking(false)
    setWasteCount(wc)
    const pts = 10 + wc * 10
    const dist = realDistance > 0
      ? (realDistance / 1000).toFixed(1)
      : ((seconds / 60) * 0.065).toFixed(1)
    const walk = {
      id: `w${Date.now()}`,
      date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
      duration: `${Math.floor(seconds / 60)} min`,
      distance: `${dist} km`,
      waste: wc,
      points: pts,
      shared: false,
    }
    setLastWalk(walk)
    setHistory(h => [walk, ...h])
    onAddPoints(pts)
    if (uid) {
      addDoc(collection(db, 'users', uid, 'walks'), { ...walk, createdAt: serverTimestamp() }).catch(() => {})
    }
    setView('summary')
  }

  function shareWalk() {
    if (!lastWalk) return
    onShareWalk(lastWalk)
    setLastWalk(w => ({ ...w, shared: true }))
    setHistory(h => h.map(w => w.id === lastWalk.id ? { ...w, shared: true } : w))
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const displayKm = realDistance > 0
    ? (realDistance / 1000).toFixed(2)
    : ((seconds / 60) * 0.065).toFixed(1)

  if (view === 'active') return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark slide-up relative">

      {/* Modal: ¿Recogiste los desechos? */}
      {showWasteCheck && (
        <div className="absolute inset-0 z-50 bg-gray-900/70 flex items-end">
          <div className="w-full bg-white dark:bg-surface-dark rounded-t-3xl p-6 pb-10 slide-up max-h-full overflow-y-auto">
            <div className="text-center mb-5">
              <span className="text-4xl block mb-3">🗑️</span>
              <p className="font-extrabold text-lg text-gray-900 dark:text-white">¿Recogiste los desechos de tu mascota?</p>
              <p className="text-sm text-text-sec font-medium mt-2 leading-relaxed">
                Registrar que dispusiste de forma adecuada y responsable los desechos de tu mascota suma puntos y ayuda a cuidar tu barrio.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => answerWaste(false)}
                className="flex-1 bg-white dark:bg-bg-dark border-2 border-gray-200 dark:border-border-dark text-gray-700 dark:text-gray-300 font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform"
              >
                No
              </button>
              <button
                onClick={() => answerWaste(true)}
                className="flex-1 bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                Sí · +10 pts ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: ¿Por qué importa? */}
      {showWasteInfo && (
        <div className="absolute inset-0 z-50 bg-gray-900/70 flex items-end">
          <div className="w-full bg-white dark:bg-surface-dark rounded-t-3xl p-6 pb-10 slide-up max-h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-extrabold text-base text-gray-900 dark:text-white">¿Por qué importa?</p>
              <button onClick={() => setShowWasteInfo(false)}>
                <Icon name="close" className="text-text-sec text-xl" />
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
              Registrar que dispusiste de forma adecuada y responsable los desechos de tu mascota suma puntos y ayuda a cuidar tu barrio.
            </p>
            <p className="text-xs text-text-sec font-medium mt-3 leading-relaxed italic">
              Los contenidos educativos sobre normativa local y disposición responsable se publicarán próximamente con fuentes oficiales y gubernamentales.
            </p>
            <button
              onClick={() => setShowWasteInfo(false)}
              className="w-full bg-primary text-gray-900 font-extrabold py-3.5 rounded-2xl text-base mt-5 active:scale-95 transition-transform"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Header compacto */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="min-w-0 flex-1 mr-3">
          <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest">Paseo activo</p>
          <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5 truncate">{pet?.name || 'tu mascota'}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white tabular-nums">
            {fmt(seconds)}
          </span>
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-pulse">
            <span className="w-2.5 h-2.5 bg-primary rounded-full block" />
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 mx-4 rounded-2xl overflow-hidden shadow-lg min-h-0 relative">
        <WalkMap walking={walking} onDistanceUpdate={setRealDistance} />

        {/* FAB: Registrar desecho */}
        <button
          onClick={registerWaste}
          className="absolute bottom-4 right-4 z-[1000] w-16 h-16 rounded-full bg-primary border-2 border-white shadow-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
        >
          <span className="text-xl">🗑️</span>
          {wasteCount > 0 && (
            <span className="text-xs font-extrabold text-gray-900 leading-none">{wasteCount}</span>
          )}
        </button>
      </div>

      {/* Stats + botón terminar */}
      <div className="px-5 pt-3 pb-6 flex-shrink-0 space-y-3">
        <div className="flex gap-3">
          {[
            { icon: 'delete', label: 'Desechos', val: wasteCount, info: true },
            { icon: 'emoji_events', label: 'Puntos', val: `+${10 + wasteCount * 10}` },
            { icon: 'route', label: 'Distancia', val: `${displayKm} km` },
          ].map(({ icon, label, val, info }) => (
            <button
              key={label}
              onClick={() => info && setShowWasteInfo(true)}
              className="flex-1 bg-white dark:bg-surface-dark rounded-2xl py-3 text-center shadow-sm relative"
            >
              <p className="text-base font-extrabold text-primary">{val}</p>
              <p className="text-[10px] text-text-sec font-semibold mt-0.5">{label}</p>
              {info && <span className="absolute top-1.5 right-1.5 text-[9px] text-text-sec font-bold">?</span>}
            </button>
          ))}
        </div>
        <button
          onClick={handleEndWalk}
          className="w-full bg-red-500 text-white font-extrabold py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-transform"
        >
          Terminar paseo
        </button>
      </div>
    </div>
  )

  if (view === 'summary') return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar slide-up">
      <div className="px-6 pt-10 pb-8">
        <div className="text-center mb-5">
          <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🐾</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">¡Buen paseo!</h2>
          <p className="text-text-sec text-sm font-medium mt-1">
            Ganaste <span className="text-primary font-extrabold">+{lastWalk?.points} pts</span>
          </p>
          <p className="text-xs text-text-sec font-medium mt-0.5">
            {(lastWalk?.waste ?? 0) > 0
              ? `+10 pts paseo · +${(lastWalk?.waste ?? 0) * 10} pts desechos`
              : '+10 pts paseo'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: 'timer',  label: 'Duración',  val: lastWalk?.duration },
            { icon: 'route',  label: 'Distancia', val: lastWalk?.distance },
            { icon: 'delete', label: 'Desechos',  val: lastWalk?.waste ?? 0 },
          ].map(({ icon, label, val }) => (
            <div key={label} className="bg-white dark:bg-surface-dark rounded-2xl p-4 text-center shadow-sm">
              <Icon name={icon} filled className="text-primary text-2xl mb-1" />
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">{val}</p>
              <p className="text-xs text-text-sec font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Sección desechos — siempre visible */}
        <div className={`mb-5 rounded-2xl px-4 py-3 flex items-start gap-3 ${(lastWalk?.waste ?? 0) > 0 ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark'}`}>
          <span className="text-xl flex-shrink-0 mt-0.5">🗑️</span>
          <div>
            <p className="text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-0.5">
              {(lastWalk?.waste ?? 0) > 0
                ? `${lastWalk.waste} desecho${lastWalk.waste !== 1 ? 's' : ''} registrado${lastWalk.waste !== 1 ? 's' : ''} · ¡Gracias!`
                : 'Sin desechos registrados en este paseo'}
            </p>
            <p className="text-xs text-text-sec font-medium leading-relaxed">
              Registrar que dispusiste de forma adecuada y responsable los desechos de tu mascota suma puntos y ayuda a cuidar tu barrio.
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
        {!lastWalk?.shared ? (
          <button
            onClick={shareWalk}
            className="w-full bg-primary text-gray-900 font-extrabold py-3.5 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Icon name="share" className="text-xl" /> Compartir en Mi barrio
          </button>
        ) : (
          <div className="w-full bg-primary/10 border border-primary/20 text-primary font-extrabold py-3.5 rounded-2xl text-base text-center">
            ✓ Compartido en Mi barrio
          </div>
        )}
        <button
          onClick={() => setView('home')}
          className="w-full bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 font-extrabold py-3.5 rounded-2xl text-base border border-gray-200 dark:border-border-dark active:scale-95 transition-transform"
        >
          Volver al inicio
        </button>
      </div>
      </div>{/* /px-6 */}
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
  const totalPts   = history.reduce((s, w) => s + w.points, 0)
  const totalWalks = history.length
  const totalWaste = history.reduce((s, w) => s + w.waste, 0)

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar">
      <div className="px-6 pt-10 pb-6">
        <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-1">Listo para salir</p>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white truncate">
          {pet?.name ? `Paseo con ${pet.name}` : 'Paseo'}
        </h1>
      </div>

      {!seenPaseo && (
        <div className="mx-6 mb-5 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3">
          <span className="text-2xl flex-shrink-0">🐾</span>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">¡Bienvenido/a a Paseo!</p>
            <p className="text-xs text-text-sec font-medium leading-relaxed">Aquí registras salidas con tus mascotas, acumulas puntos y llevas un historial. Cada desecho recogido suma puntos extra.</p>
          </div>
          <button onClick={dismissPaseoCard} className="text-text-sec flex-shrink-0 mt-0.5">
            <Icon name="close" className="text-base" />
          </button>
        </div>
      )}

      <div className="px-6 mb-2">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'directions_run', label: 'Paseos', val: totalWalks },
            { icon: 'delete', label: 'Desechos dispuestos adecuadamente', val: totalWaste },
            { icon: 'emoji_events', label: 'Puntos acumulados', val: totalPts },
          ].map(({ icon, label, val }) => (
            <div key={label} className="bg-white dark:bg-surface-dark rounded-2xl p-4 text-center shadow-sm">
              <Icon name={icon} filled className="text-primary text-xl mb-1" />
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">{val}</p>
              <p className="text-[10px] text-text-sec font-medium leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-text-sec font-medium mt-2 text-center leading-relaxed">
          Incluye puntos por paseo y por acciones responsables.
        </p>
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
        {history.length > 0 && (
          <button onClick={() => setView('history')} className="text-xs font-bold text-primary">Ver todo</button>
        )}
      </div>

      <div className="px-6 pb-8 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl block mb-3">🏁</span>
            <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200">Aún no registras paseos</p>
            <p className="text-xs text-text-sec font-medium mt-1">Pulsa "Iniciar paseo" para empezar.</p>
          </div>
        ) : (
          history.slice(0, 3).map(w => (
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
          ))
        )}
      </div>
    </div>
  )
}
