import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { Icon } from './ui'

const BREEDS = ['Quiltro (Mezcla)', 'Pastor Alemán', 'Golden Retriever', 'Labrador', 'Poodle', 'Bulldog Francés', 'Chihuahua', 'Boxer', 'Border Collie', 'Dachshund', 'Schnauzer', 'Husky Siberiano']
const EMPTY_PET = () => ({ name: '', breed: 'Quiltro (Mezcla)', birthYear: new Date().getFullYear() - 3 })

export default function Onboarding({ onDone, onComplete, className = '' }) {
  const [step,           setStep]          = useState(1)
  const [saving,         setSaving]        = useState(false)
  const [googleLoading,  setGoogleLoading] = useState(false)
  const [googlePhotoUrl, setGooglePhotoUrl] = useState(null)
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [hasPets, setHasPets] = useState(null) // null | true | false
  const [pets,    setPets]    = useState([EMPTY_PET()])

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider())
      const fUser  = result.user
      const snap   = await getDoc(doc(db, 'users', fUser.uid))
      if (snap.exists()) {
        // Usuario existente — cargar datos y entrar a la app
        const d = snap.data()
        const u = { name: d.name, email: d.email, hasPets: d.hasPets, photoUrl: d.photoUrl, points: d.points, joinDate: d.joinDate }
        const p = d.pets ?? (d.pet ? [d.pet] : [])
        if (onDone)     await onDone(u, p)
        if (onComplete) await onComplete({ user: u, pets: p })
      } else {
        // Usuario nuevo — pre-rellenar el formulario y continuar onboarding
        setName(fUser.displayName || '')
        setEmail(fUser.email || '')
        setGooglePhotoUrl(fUser.photoURL || null)
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') console.error('Google login error:', err)
    } finally {
      setGoogleLoading(false)
    }
  }

  function updatePet(i, k, v) {
    setPets(ps => ps.map((p, idx) => idx === i ? { ...p, [k]: v } : p))
  }
  function addPet()      { setPets(ps => [...ps, EMPTY_PET()]) }
  function removePet(i)  { setPets(ps => ps.filter((_, idx) => idx !== i)) }

  async function next() {
    if (step === 1 && !name.trim()) return
    if (step === 1 && hasPets === null) return        // debe elegir
    if (step === 1 && !hasPets) { setStep(3); return } // salta paso de mascotas
    if (step === 2 && !pets[0].name.trim()) return
    if (step < 3) { setStep(s => s + 1); return }

    setSaving(true)
    const user     = { name, email, hasPets: hasPets ?? false, photoUrl: googlePhotoUrl || null, points: 100, joinDate: new Date().toISOString() }
    const petsData = hasPets
      ? pets.filter(p => p.name.trim()).map((p, i) => ({
          id: `${Date.now()}_${i}`, name: p.name, breed: p.breed,
          birthYear: p.birthYear, ownerName: name,
          photoUrl: null,
        }))
      : []
    try {
      if (onDone)     await onDone(user, petsData)
      if (onComplete) await onComplete({ user, pets: petsData })
    } catch { setSaving(false) }
  }

  const TITLES = {
    1: <>Bienvenido / Bienvenida a<br /><span className="text-primary">Firulais</span></>,
    2: <>Tu<br /><span className="text-primary">compañero/a</span></>,
    3: <><span className="text-primary">¡Todo</span><br />listo!</>,
  }
  const SUBTITLES = {
    1: 'Firulais te ayuda a vivir mejor con tus mascotas en la ciudad.',
    2: 'Cuéntanos sobre tu o tus mascotas para personalizar la experiencia.',
    3: hasPets
      ? 'Registra paseos, fortalece hábitos responsables y cuida mejor a una o más mascotas.'
      : 'Conecta con tu barrio, encuentra apoyo y accede a beneficios útiles.',
  }
  const totalSteps = hasPets === false ? 2 : 3

  return (
    <div className={`flex flex-col h-full onboarding-bg text-white ${className}`}>
      <div className="px-7 pt-14 pb-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-xl">🐾</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Firulais</span>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(i => {
            const visible = hasPets === false ? i !== 2 : true
            if (!visible) return null
            const active = step >= i || (hasPets === false && i === 3 && step >= 2)
            return <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${active ? 'bg-primary' : 'bg-white/10'}`} />
          })}
        </div>

        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{TITLES[step]}</h1>
        <p className="text-white/50 text-sm font-medium mt-2">{SUBTITLES[step]}</p>
      </div>

      <div className="flex-1 bg-bg-light dark:bg-bg-dark rounded-t-[32px] flex flex-col px-6 pt-7 pb-8 overflow-y-auto no-scrollbar">

        {/* Paso 1: datos personales + elección */}
        {step === 1 && (
          <div className="space-y-4 flex-1">

            {/* Botón Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 dark:border-border-dark dark:bg-surface-dark rounded-2xl py-3.5 font-extrabold text-gray-700 dark:text-gray-200 text-sm shadow-sm active:scale-95 transition-transform disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'Conectando...' : 'Continuar con Google'}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-border-dark" />
              <span className="text-xs text-text-sec font-medium">o</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-border-dark" />
            </div>

            <Field label="Tu nombre">
              <input className="input-base" placeholder="¿Cómo te llamas?" value={name} onChange={e => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="Email (opcional)">
              <input type="email" className="input-base" placeholder="tu@email.cl" value={email} onChange={e => setEmail(e.target.value)} />
            </Field>

            <Field label="¿Cómo quieres participar?">
              <div className="space-y-2">
                <button
                  onClick={() => setHasPets(true)}
                  className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all ${hasPets === true ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark'}`}
                >
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white">🐾 Vivo con mascotas</p>
                  <p className="text-xs text-text-sec font-medium mt-0.5">Registro mis mascotas y sus cuidados</p>
                </button>
                <button
                  onClick={() => setHasPets(false)}
                  className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all ${hasPets === false ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark'}`}
                >
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white">🏘️ No vivo con mascotas</p>
                  <p className="text-xs text-text-sec font-medium mt-0.5">Sin mascotas, pero quiero participar en mi barrio</p>
                </button>
              </div>
            </Field>

            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3">
              <span className="text-xl mt-0.5">🏆</span>
              <div>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">+100 puntos al registrarte</p>
                <p className="text-xs text-text-sec font-medium mt-0.5">Canjéalos en la Tienda por beneficios y servicios.</p>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: mascotas */}
        {step === 2 && (
          <div className="flex-1 space-y-6">
            {pets.map((pet, i) => (
              <div key={i} className="space-y-4">
                {pets.length > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest">Mascota {i + 1}</p>
                    {i > 0 && <button onClick={() => removePet(i)} className="text-xs font-bold text-red-400">Eliminar</button>}
                  </div>
                )}
                <Field label="Nombre de tu mascota">
                  <input className="input-base" placeholder="Ej: Firulais, Coco, Max..." value={pet.name} onChange={e => updatePet(i, 'name', e.target.value)} autoFocus={i === 0} />
                </Field>
                <Field label="Raza">
                  <select className="input-base" value={pet.breed} onChange={e => updatePet(i, 'breed', e.target.value)}>
                    {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Año de nacimiento">
                  <input type="number" className="input-base" value={pet.birthYear} min={2010} max={2026} onChange={e => updatePet(i, 'birthYear', parseInt(e.target.value))} />
                </Field>
              </div>
            ))}
            <button onClick={addPet} className="w-full border-2 border-dashed border-primary/40 rounded-2xl py-3 text-sm font-extrabold text-primary">
              ¿Tienes otra mascota? + Agregar
            </button>
          </div>
        )}

        {/* Paso 3: resumen */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center shadow-lg">
              <span className="text-4xl">{hasPets ? '🐾' : '🏘️'}</span>
            </div>
            <div className="text-center">
              <p className="font-extrabold text-xl text-gray-900 dark:text-white">{name}</p>
              {hasPets && pets.filter(p => p.name.trim()).length > 0 && (
                <p className="text-text-sec text-sm font-medium mt-0.5">
                  & {pets.filter(p => p.name.trim()).map(p => p.name).join(', ')}
                </p>
              )}
              {!hasPets && <p className="text-text-sec text-sm font-medium mt-0.5">Participante del barrio</p>}
            </div>
            <div className="w-full space-y-2">
              {[
                ['directions_run', hasPets ? 'Registra paseos y gana puntos' : 'Sigue el barrio y gana puntos'],
                ['location_city',  'Mi barrio: información útil y comunidad'],
                ['storefront',     'Canjea puntos en la Tienda'],
                ['local_hospital', 'Orientaciones básicas sobre bienestar animal'],
              ].map(([icon, text], i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-surface-dark rounded-xl px-4 py-2.5 shadow-sm">
                  <Icon name={icon} filled className="text-primary text-xl" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={next}
          disabled={saving || (step === 1 && hasPets === null)}
          className="w-full mt-4 bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform flex-shrink-0 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : step < 3 ? 'Continuar →' : '¡Empezar!'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">{label}</label>
      {children}
    </div>
  )
}
