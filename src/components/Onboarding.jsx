import { useState } from 'react'
import { Icon } from './ui'

const BREEDS = ['Quiltro (Mezcla)', 'Pastor Alemán', 'Golden Retriever', 'Labrador', 'Poodle', 'Bulldog Francés', 'Chihuahua', 'Boxer', 'Border Collie', 'Dachshund', 'Schnauzer', 'Husky Siberiano']
const EMPTY_PET = () => ({ name: '', breed: 'Quiltro (Mezcla)', birthYear: new Date().getFullYear() - 3 })

export default function Onboarding({ onDone, onComplete, className = '' }) {
  const [step,   setStep]   = useState(1)
  const [saving, setSaving] = useState(false)
  const [name,   setName]   = useState('')
  const [email,  setEmail]  = useState('')
  const [pets,   setPets]   = useState([EMPTY_PET()])

  function updatePet(i, k, v) {
    setPets(ps => ps.map((p, idx) => idx === i ? { ...p, [k]: v } : p))
  }

  function addPet() {
    setPets(ps => [...ps, EMPTY_PET()])
  }

  function removePet(i) {
    setPets(ps => ps.filter((_, idx) => idx !== i))
  }

  async function next() {
    if (step === 1 && !name.trim()) return
    if (step === 2 && !pets[0].name.trim()) return
    if (step < 3) { setStep(s => s + 1); return }

    setSaving(true)
    const user     = { name, email, photoUrl: `https://i.pravatar.cc/100?u=${name}`, points: 100, joinDate: new Date().toISOString() }
    const petsData = pets
      .filter(p => p.name.trim())
      .map((p, i) => ({ id: `${Date.now()}_${i}`, name: p.name, breed: p.breed, birthYear: p.birthYear, ownerName: name, photoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300' }))
    try {
      if (onDone)     await onDone(user, petsData)
      if (onComplete) await onComplete({ user, pets: petsData })
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className={`flex flex-col h-full onboarding-bg text-white ${className}`}>
      <div className="px-7 pt-14 pb-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-xl">🐾</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Firulais</span>
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
          {step === 1 && <><span className="text-primary">Bienvenido</span><br />a Firulais</>}
          {step === 2 && <>Tu<br /><span className="text-primary">compañero/a</span></>}
          {step === 3 && <><span className="text-primary">¡Todo</span><br />listo!</>}
        </h1>
        <p className="text-white/50 text-sm font-medium mt-2">
          {step === 1 && 'Tu barrio más limpio. Tu perro, más feliz.'}
          {step === 2 && 'Cuéntanos sobre tu o tus mascotas para personalizar la experiencia.'}
          {step === 3 && '100 puntos de bienvenida te esperan.'}
        </p>
      </div>

      <div className="flex-1 bg-bg-light dark:bg-bg-dark rounded-t-[32px] flex flex-col px-6 pt-7 pb-8 overflow-y-auto no-scrollbar">
        {step === 1 && (
          <div className="space-y-4 flex-1">
            <Field label="Tu nombre"><input className="input-base" placeholder="¿Cómo te llamas?" value={name} onChange={e => setName(e.target.value)} autoFocus /></Field>
            <Field label="Email (opcional)"><input type="email" className="input-base" placeholder="tu@email.cl" value={email} onChange={e => setEmail(e.target.value)} /></Field>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3">
              <span className="text-xl mt-0.5">🏆</span>
              <div><p className="font-extrabold text-sm text-gray-900 dark:text-white">+100 puntos al registrarte</p><p className="text-xs text-text-sec font-medium mt-0.5">Canjéalos en la Tienda por descuentos en veterinarias y alimento.</p></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 space-y-6">
            {pets.map((pet, i) => (
              <div key={i} className="space-y-4">
                {pets.length > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest">Mascota {i + 1}</p>
                    {i > 0 && (
                      <button onClick={() => removePet(i)} className="text-xs font-bold text-red-400">Eliminar</button>
                    )}
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

        {step === 3 && (
          <div className="flex-1 flex flex-col items-center gap-5 pt-4">
            <div className="w-28 h-28 rounded-3xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center shadow-xl"><span className="text-5xl">🐾</span></div>
            <div className="text-center">
              <p className="font-extrabold text-xl text-gray-900 dark:text-white">{name}</p>
              <p className="text-text-sec text-sm font-medium mt-0.5">
                {pets.filter(p => p.name.trim()).map(p => p.name).join(', ')}
              </p>
            </div>
            <div className="w-full space-y-2">
              {[['directions_run', 'Registra paseos y gana puntos'], ['recycling', '+10 pts por cada desecho registrado'], ['storefront', 'Canjea puntos en la Tienda'], ['local_hospital', 'VetBot IA para consultas veterinarias']].map(([icon, text], i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-surface-dark rounded-xl px-4 py-3 shadow-sm">
                  <Icon name={icon} filled className="text-primary text-xl" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={next} disabled={saving} className="w-full mt-6 bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform flex-shrink-0 disabled:opacity-70">
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
