import { useState } from 'react'
import { Icon } from './ui'

const BREEDS = ['Quiltro (Mezcla)', 'Pastor Alemán', 'Golden Retriever', 'Labrador', 'Poodle', 'Bulldog Francés', 'Chihuahua', 'Boxer', 'Border Collie', 'Dachshund', 'Schnauzer', 'Husky Siberiano']

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', petName: '', breed: 'Quiltro (Mezcla)', birthYear: new Date().getFullYear() - 3 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function next() {
    if (step === 1 && !form.name.trim()) return
    if (step === 2 && !form.petName.trim()) return
    if (step < 3) { setStep(s => s + 1); return }
    const user = { name: form.name, email: form.email, photoUrl: `https://i.pravatar.cc/100?u=${form.name}`, points: 100, joinDate: new Date().toISOString() }
    const pet = { id: Date.now().toString(), name: form.petName, breed: form.breed, birthYear: form.birthYear, ownerName: form.name, photoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300' }
    localStorage.setItem('firulais_user', JSON.stringify(user))
    localStorage.setItem('firulais_pet', JSON.stringify(pet))
    onDone(user, pet)
  }

  return (
    <div className="flex flex-col h-full onboarding-bg text-white">
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
          {step === 2 && <>Tu<br /><span className="text-primary">compañero</span></>}
          {step === 3 && <><span className="text-primary">¡Todo</span><br />listo!</>}
        </h1>
        <p className="text-white/50 text-sm font-medium mt-2">
          {step === 1 && 'Tu barrio más limpio. Tu perro, más feliz.'}
          {step === 2 && 'Cuéntanos sobre tu perro para personalizar la experiencia.'}
          {step === 3 && '100 puntos de bienvenida te esperan.'}
        </p>
      </div>

      <div className="flex-1 bg-bg-light dark:bg-bg-dark rounded-t-[32px] flex flex-col px-6 pt-7 pb-8 overflow-y-auto no-scrollbar">
        {step === 1 && (
          <div className="space-y-4 flex-1">
            <Field label="Tu nombre"><input className="input-base" placeholder="¿Cómo te llamas?" value={form.name} onChange={e => set('name', e.target.value)} autoFocus /></Field>
            <Field label="Email (opcional)"><input type="email" className="input-base" placeholder="tu@email.cl" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3">
              <span className="text-xl mt-0.5">🏆</span>
              <div><p className="font-extrabold text-sm text-gray-900 dark:text-white">+100 puntos al registrarte</p><p className="text-xs text-text-sec font-medium mt-0.5">Canjéalos en la Tienda por descuentos en veterinarias y alimento.</p></div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4 flex-1">
            <Field label="Nombre del perro"><input className="input-base" placeholder="Ej: Firulais, Coco, Max..." value={form.petName} onChange={e => set('petName', e.target.value)} autoFocus /></Field>
            <Field label="Raza">
              <select className="input-base" value={form.breed} onChange={e => set('breed', e.target.value)}>
                {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Año de nacimiento"><input type="number" className="input-base" value={form.birthYear} min={2010} max={2026} onChange={e => set('birthYear', parseInt(e.target.value))} /></Field>
          </div>
        )}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center gap-5 pt-4">
            <div className="w-28 h-28 rounded-3xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center shadow-xl"><span className="text-5xl">🐾</span></div>
            <div className="text-center">
              <p className="font-extrabold text-xl text-gray-900 dark:text-white">{form.name}</p>
              <p className="text-text-sec text-sm font-medium mt-0.5">& {form.petName}, {form.breed}</p>
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
        <button onClick={next} className="w-full mt-6 bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform flex-shrink-0">
          {step < 3 ? 'Continuar →' : '¡Empezar!'}
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

// Tailwind class helper — declared here so Tailwind picks it up
// input-base is defined in index.css via @layer components or inline:
