import { useState } from 'react'
import { Icon, Stars } from './ui'
import { MOCK_MARKET } from '../data/mockData'
import { useApp } from '../context/AppContext'

export default function TabTienda() {
  const { user } = useApp()
  const [cat, setCat] = useState('Todos')
  const [selected, setSelected] = useState(null)
  const [seenTienda, setSeenTienda] = useState(() => !!localStorage.getItem('seen_tienda'))

  const items = cat === 'Todos' ? MOCK_MARKET.items : MOCK_MARKET.items.filter(i => i.cat === cat)

  function callBusiness(phone) {
    window.location.href = `tel:${phone}`
  }
  function whatsappBusiness(phone, name) {
    const msg = encodeURIComponent(`Hola, vi tu negocio en Firulais y me interesa más información sobre ${name}.`)
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  if (selected) return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar slide-up">
      <div className="flex items-center gap-3 px-5 pt-10 pb-4">
        <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm">
          <Icon name="arrow_back" className="text-gray-700 dark:text-gray-300" />
        </button>
        <p className="font-extrabold text-lg text-gray-900 dark:text-white truncate">{selected.name}</p>
      </div>
      <img src={selected.img} className="w-full aspect-video object-cover" alt="" />
      <div className="px-5 pt-5 pb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{selected.name}</h2>
            <p className="text-sm text-text-sec font-medium mt-0.5">{selected.cat}</p>
          </div>
          {selected.badge && (
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${selected.sponsored ? 'badge-sponsored' : 'bg-primary/10 text-primary'}`}>{selected.badge}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Stars n={selected.rating} />
          <span className="text-xs text-text-sec font-medium">{selected.reviews} reseñas</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-2">{selected.desc}</p>
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{selected.price}</p>
        <p className="text-xs text-text-sec font-medium mb-6">{selected.priceTag}</p>

        <div className="space-y-3">
          <button
            onClick={() => whatsappBusiness(selected.phone, selected.name)}
            className="w-full bg-[#25D366] text-white font-extrabold py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Icon name="chat" filled className="text-xl" /> Contactar por WhatsApp
          </button>
          <button
            onClick={() => callBusiness(selected.phone)}
            className="w-full bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 font-extrabold py-4 rounded-2xl text-base border border-gray-200 dark:border-border-dark active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm"
          >
            <Icon name="call" filled className="text-xl text-primary" /> Llamar
          </button>
        </div>

        {selected.sponsored && (
          <p className="text-center text-xs text-text-sec font-medium mt-4">Publicidad · Patrocinado en Firulais</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar">
      <div className="px-5 pt-10 pb-3">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Tienda</h1>
        <p className="text-sm text-text-sec font-medium mb-4">Beneficios y servicios para ti y tus mascotas</p>

        {!seenTienda && (
          <div className="mb-3 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3">
            <span className="text-2xl flex-shrink-0">🏪</span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">Beneficios y servicios para ti y tus mascotas</p>
              <p className="text-xs text-text-sec font-medium leading-relaxed">Veterinarias, alimentos, paseadores, estadías y más. Contacta directamente.</p>
            </div>
            <button onClick={() => { localStorage.setItem('seen_tienda', '1'); setSeenTienda(true) }} className="text-text-sec flex-shrink-0 mt-0.5">
              <Icon name="close" className="text-base" />
            </button>
          </div>
        )}

        {/* Explicación de puntos */}
        <div className="mb-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark rounded-2xl p-4 flex gap-3 shadow-sm">
          <span className="text-2xl flex-shrink-0">🏆</span>
          <div>
            <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-0.5">¿Cómo ganar puntos?</p>
            <p className="text-xs text-text-sec font-medium leading-relaxed">
              Se obtienen al registrar paseos responsables, disponer adecuadamente los desechos de tu mascota y participar en acciones útiles para tu barrio.
            </p>
          </div>
        </div>

        {/* Sponsored Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-5 shadow-lg">
          <img src={MOCK_MARKET.banner.img} className="w-full aspect-[2/1] object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <span className="badge-sponsored text-xs font-extrabold px-2.5 py-1 rounded-full mb-2 inline-block">Destacado</span>
            <p className="font-extrabold text-white text-base leading-tight">{MOCK_MARKET.banner.title}</p>
            <p className="text-white/70 text-xs font-medium">{MOCK_MARKET.banner.subtitle} · {MOCK_MARKET.banner.sponsor}</p>
          </div>
        </div>

        {/* Category filters — scroll wrapper separado del flex para iOS Safari */}
        <div className="overflow-x-auto no-scrollbar -mx-5">
          <div className="flex gap-2 px-5 pb-1">
            {MOCK_MARKET.cats.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${cat === c ? 'bg-primary text-gray-900' : 'bg-white dark:bg-surface-dark text-text-sec border border-gray-200 dark:border-border-dark'}`}
              >
                {c}
              </button>
            ))}
            <div className="flex-shrink-0 w-5" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 space-y-3">
        {items.map(item => (
          <button key={item.id} onClick={() => setSelected(item)} className="w-full bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden flex text-left">
            <img src={item.img} className="w-24 h-24 object-cover flex-shrink-0" alt="" />
            <div className="p-3 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">{item.name}</p>
                {item.badge && (
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-extrabold ${item.sponsored ? 'badge-sponsored' : 'bg-primary/10 text-primary'}`}>{item.badge}</span>
                )}
              </div>
              <p className="text-xs text-text-sec font-medium leading-relaxed mb-2">{item.desc}</p>
              <div className="flex items-center justify-between">
                <Stars n={item.rating} />
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">{item.price}</span>
              </div>
            </div>
          </button>
        ))}

        {/* Advertise CTA */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 mt-2">
          <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">¿Tienes un negocio pet-friendly?</p>
          <p className="text-xs text-text-sec font-medium mb-3">Llega a dueños de mascotas en tu barrio. Escríbenos y te contamos cómo.</p>
          <button
            onClick={() => {
              const msg = encodeURIComponent('Hola, quiero anunciar mi negocio pet-friendly en Firulais. ¿Me pueden dar más información?')
              window.open(`https://wa.me/56981369445?text=${msg}`, '_blank')
            }}
            className="bg-primary text-gray-900 font-extrabold py-2.5 px-5 rounded-xl text-sm active:scale-95 transition-transform flex items-center gap-2"
          >
            <Icon name="chat" filled className="text-lg" /> Anunciar mi negocio →
          </button>
        </div>
      </div>
    </div>
  )
}
