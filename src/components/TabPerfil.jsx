import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Icon, Avatar } from './ui'
import { MOCK_RANKING } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { storage } from '../lib/firebase'

const BREEDS = ['Quiltro (Mezcla)', 'Pastor Alemán', 'Golden Retriever', 'Labrador', 'Poodle', 'Bulldog Francés', 'Chihuahua', 'Boxer', 'Border Collie', 'Dachshund', 'Schnauzer', 'Husky Siberiano']

export default function TabPerfil({ onLogout }) {
  const { user, pets, uid, addPet, updateUserPhoto, updatePetPhoto, updateUser, updatePet, deleteAccount } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const view = pathname.endsWith('/settings') ? 'settings' : pathname.endsWith('/addpet') ? 'addpet' : 'main'
  const [newPet,       setNewPet]       = useState({ name: '', breed: 'Quiltro (Mezcla)', birthYear: new Date().getFullYear() - 3, microchip: '' })
  const [saving,       setSaving]       = useState(false)
  const [darkMode,     setDarkMode]     = useState(() => document.documentElement.classList.contains('dark'))
  const [copied,       setCopied]       = useState(false)
  const [uploadingUid, setUploadingUid] = useState(null)
  const userPhotoRef  = useRef(null)
  const petPhotoRefs  = useRef({})
  // Edit user modal
  const [showEditUser, setShowEditUser] = useState(false)
  const [editUserForm, setEditUserForm] = useState({})
  const [userSaving,   setUserSaving]   = useState(false)
  // Edit pet modal
  const [showEditPet, setShowEditPet] = useState(false)
  const [editPetId,   setEditPetId]   = useState(null)
  const [editPetForm, setEditPetForm] = useState({})
  const [petSaving,   setPetSaving]   = useState(false)
  // Delete account
  const [deleteError, setDeleteError] = useState('')
  const [deleting,    setDeleting]    = useState(false)

  const myRankData = MOCK_RANKING.find(r => r.user === user?.name)

  function openEditUser() {
    setEditUserForm({ name: user?.name || '', email: user?.email || '' })
    setShowEditUser(true)
  }
  async function saveEditUser() {
    if (!editUserForm.name?.trim()) return
    setUserSaving(true)
    await updateUser({ name: editUserForm.name.trim(), email: editUserForm.email || '' })
    setUserSaving(false)
    setShowEditUser(false)
  }

  function openEditPet(pet) {
    setEditPetId(pet.id)
    setEditPetForm({ name: pet.name, breed: pet.breed, birthYear: pet.birthYear, microchip: pet.microchip || '' })
    setShowEditPet(true)
  }
  async function saveEditPet() {
    if (!editPetForm.name?.trim() || !editPetId) return
    setPetSaving(true)
    await updatePet(editPetId, { name: editPetForm.name.trim(), breed: editPetForm.breed, birthYear: Number(editPetForm.birthYear), microchip: editPetForm.microchip || null })
    setPetSaving(false)
    setShowEditPet(false)
  }

  async function handleDeleteAccount() {
    if (!window.confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount()
    } catch (err) {
      setDeleteError(err.code === 'auth/requires-recent-login'
        ? 'Por seguridad, cierra sesión y vuelve a entrar antes de eliminar tu cuenta.'
        : 'No se pudo eliminar la cuenta. Intenta de nuevo.')
    } finally {
      setDeleting(false)
    }
  }

  async function handlePhotoUpload(file, type, petId) {
    if (!file || !uid) return
    setUploadingUid(type === 'user' ? 'user' : petId)
    try {
      const path = type === 'user'
        ? `photos/${uid}/profile`
        : `photos/${uid}/pets/${petId}`
      const sRef = storageRef(storage, path)
      const snap = await uploadBytes(sRef, file)
      const url  = await getDownloadURL(snap.ref)
      if (type === 'user') await updateUserPhoto(url)
      else await updatePetPhoto(petId, url)
    } catch { /* ignore */ }
    setUploadingUid(null)
  }

  function toggleDark() {
    const d = !darkMode
    setDarkMode(d)
    document.documentElement.classList.toggle('dark', d)
  }

  function shareApp() {
    const data = { title: 'Firulais', text: 'Tu barrio más limpio. Tu perro, más feliz. 🐾', url: window.location.href }
    if (navigator.share) {
      navigator.share(data).catch(() => {})
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  async function saveNewPet() {
    if (!newPet.name.trim()) return
    setSaving(true)
    const p = { id: Date.now().toString(), name: newPet.name, breed: newPet.breed, birthYear: newPet.birthYear, ownerName: user?.name, photoUrl: null, microchip: newPet.microchip || null, reminders: [] }
    await addPet(p)
    setNewPet({ name: '', breed: 'Quiltro (Mezcla)', birthYear: new Date().getFullYear() - 3 })
    setSaving(false)
    navigate('/perfil')
  }

  if (view === 'addpet') return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar slide-up">
      <div className="flex items-center gap-3 px-5 pt-10 pb-4">
        <button onClick={() => navigate('/perfil')} className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm">
          <Icon name="arrow_back" className="text-gray-700 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Agregar mascota</h2>
      </div>
      <div className="px-5 space-y-4">
        <div>
          <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Nombre</label>
          <input className="input-base" placeholder="Ej: Luna, Coco, Thor..." value={newPet.name} onChange={e => setNewPet(p => ({ ...p, name: e.target.value }))} autoFocus />
        </div>
        <div>
          <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Raza</label>
          <select className="input-base" value={newPet.breed} onChange={e => setNewPet(p => ({ ...p, breed: e.target.value }))}>
            {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Año de nacimiento</label>
          <input type="number" className="input-base" value={newPet.birthYear} min={2010} max={2026} onChange={e => setNewPet(p => ({ ...p, birthYear: parseInt(e.target.value) }))} />
        </div>
        <div>
          <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block flex items-center gap-2">
            Microchip <span className="text-[10px] font-semibold text-text-sec normal-case tracking-normal">(privado, solo visible para ti)</span>
          </label>
          <input className="input-base" placeholder="Número de microchip (opcional)" value={newPet.microchip} onChange={e => setNewPet(p => ({ ...p, microchip: e.target.value }))} />
          <p className="text-xs text-text-sec font-medium mt-1">El microchip ayuda a identificar a tu mascota en caso de pérdida. No se muestra públicamente.</p>
        </div>
        <button onClick={saveNewPet} disabled={saving || !newPet.name.trim()} className="w-full bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-70 mt-2">
          {saving ? 'Guardando...' : 'Agregar mascota'}
        </button>
      </div>
    </div>
  )

  if (view === 'settings') return (
    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar slide-up">
      <div className="flex items-center gap-3 px-5 pt-10 pb-4">
        <button onClick={() => navigate('/perfil')} className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm">
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

        <Section label="Cuenta">
          <Row icon="notifications" label="Notificaciones de paseos">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Próximamente</span>
          </Row>
          <button onClick={shareApp} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-border-dark">
            <Icon name="share" className="text-text-sec text-xl flex-shrink-0" />
            <p className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300 text-left">Compartir Firulais</p>
            <span className="text-xs font-semibold text-primary">{copied ? '¡Enlace copiado!' : ''}</span>
            <Icon name="chevron_right" className="text-text-sec" />
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-border-dark text-red-500"
          >
            <Icon name="logout" className="text-lg text-red-500" />
            <span className="text-sm font-extrabold">Cerrar sesión</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 disabled:opacity-60"
          >
            <Icon name="delete_forever" className="text-lg text-red-400" />
            <span className="text-sm font-semibold">{deleting ? 'Eliminando...' : 'Eliminar mi cuenta'}</span>
          </button>
          {deleteError && (
            <div className="mx-4 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-4 py-2.5">
              <p className="text-xs text-red-700 dark:text-red-400 font-semibold">{deleteError}</p>
            </div>
          )}
        </Section>

        <div className="pt-4 pb-2 text-center space-y-1">
          <p className="text-xs text-text-sec font-medium">Firulais v0.1.0 · Hecho con 🐾 en Chile</p>
          <p className="text-xs text-text-sec font-medium">© 2026 Tercera Letra SpA · Todos los derechos reservados</p>
          <p className="text-xs text-text-sec font-medium">Tu información personal es privada y nunca se comparte sin tu consentimiento.</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
    {/* Modal: Editar usuario */}
    {showEditUser && (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end">
        <div className="w-full bg-white dark:bg-surface-dark rounded-t-3xl px-6 pt-6 pb-10 slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Editar perfil</h3>
            <button onClick={() => setShowEditUser(false)}><Icon name="close" className="text-text-sec text-xl" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Nombre</label>
              <input className="input-base" value={editUserForm.name || ''} onChange={e => setEditUserForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Email (opcional)</label>
              <input type="email" className="input-base" value={editUserForm.email || ''} onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button onClick={saveEditUser} disabled={userSaving || !editUserForm.name?.trim()}
              className="w-full bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 transition-transform">
              {userSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button onClick={() => setShowEditUser(false)}
              className="w-full bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 font-extrabold py-3 rounded-2xl text-sm border border-gray-200 dark:border-border-dark active:scale-95 transition-transform">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal: Editar mascota */}
    {showEditPet && (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end">
        <div className="w-full bg-white dark:bg-surface-dark rounded-t-3xl px-6 pt-6 pb-10 max-h-[80vh] overflow-y-auto no-scrollbar slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Editar mascota</h3>
            <button onClick={() => setShowEditPet(false)}><Icon name="close" className="text-text-sec text-xl" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Nombre</label>
              <input className="input-base" value={editPetForm.name || ''} onChange={e => setEditPetForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Raza</label>
              <select className="input-base" value={editPetForm.breed || ''} onChange={e => setEditPetForm(f => ({ ...f, breed: e.target.value }))}>
                {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Año de nacimiento</label>
              <input type="number" className="input-base" value={editPetForm.birthYear || ''} min={2010} max={2026} onChange={e => setEditPetForm(f => ({ ...f, birthYear: parseInt(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2 block">Microchip <span className="text-[10px] normal-case tracking-normal">(privado)</span></label>
              <input className="input-base" placeholder="Número de microchip (opcional)" value={editPetForm.microchip || ''} onChange={e => setEditPetForm(f => ({ ...f, microchip: e.target.value }))} />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button onClick={saveEditPet} disabled={petSaving || !editPetForm.name?.trim()}
              className="w-full bg-primary text-gray-900 font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 transition-transform">
              {petSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button onClick={() => setShowEditPet(false)}
              className="w-full bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 font-extrabold py-3 rounded-2xl text-sm border border-gray-200 dark:border-border-dark active:scale-95 transition-transform">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="flex flex-col h-full bg-bg-light dark:bg-bg-dark overflow-y-auto no-scrollbar">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Perfil</h1>
        <button onClick={() => navigate('/perfil/settings')} className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm">
          <Icon name="settings" className="text-gray-600 dark:text-gray-300 text-xl" />
        </button>
      </div>

      <div className="px-5 mb-5">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <Avatar src={user?.photoUrl} size={16} ring />
              <button
                onClick={() => userPhotoRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow border-2 border-white dark:border-surface-dark"
              >
                {uploadingUid === 'user'
                  ? <span className="w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  : <Icon name="photo_camera" className="text-gray-900 text-sm" />}
              </button>
              <input
                ref={userPhotoRef}
                type="file" accept="image/*" className="hidden"
                onChange={e => handlePhotoUpload(e.target.files[0], 'user')}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-extrabold text-xl text-gray-900 dark:text-white">{user?.name}</p>
                <button onClick={openEditUser} className="flex-shrink-0 flex items-center gap-1 text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <Icon name="edit" className="text-sm" /> Editar
                </button>
              </div>
              <p className="text-sm text-text-sec font-medium">{user?.email || 'Sin email'}</p>
              <p className="text-xs text-text-sec font-medium mt-0.5">Miembro desde {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }) : 'hoy'}</p>
              {!user?.photoUrl && (
                <button onClick={() => userPhotoRef.current?.click()} className="text-xs text-primary font-extrabold mt-1.5 flex items-center gap-1">
                  <Icon name="photo_camera" className="text-sm" /> Agregar foto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest">Mis mascotas</p>
          <button onClick={() => navigate('/perfil/addpet')} className="text-xs font-extrabold text-gray-900 bg-primary px-3 py-1.5 rounded-full">
            + Agregar
          </button>
        </div>
        {pets.length === 0 && (
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm text-center">
            <span className="text-4xl block mb-2">🐾</span>
            <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">Completa tu perfil</p>
            <p className="text-xs text-text-sec font-medium mb-3">Registra una o más mascotas para llevar su historial, vacunas y recordatorios.</p>
            <button onClick={() => navigate('/perfil/addpet')} className="bg-primary text-gray-900 font-extrabold py-2.5 px-5 rounded-xl text-sm active:scale-95 transition-transform">
              Agregar primera mascota
            </button>
          </div>
        )}
        <div className="space-y-3">
          {pets.map(p => (
            <div key={p.id} className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden">
              {/* Foto o avatar predeterminado + botón cámara */}
              <div className="relative">
                {p.photoUrl
                  ? <img src={p.photoUrl} className="w-full aspect-square object-cover object-center" alt="" />
                  : <div className="w-full aspect-square bg-primary/10 flex items-center justify-center"><span className="text-5xl">🐾</span></div>
                }
                <button
                  onClick={() => { petPhotoRefs.current[p.id] = petPhotoRefs.current[p.id] || document.createElement('input'); const inp = petPhotoRefs.current[p.id]; inp.type='file'; inp.accept='image/*'; inp.onchange=e=>handlePhotoUpload(e.target.files[0],'pet',p.id); inp.click() }}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-primary/90 backdrop-blur rounded-full flex items-center justify-center shadow"
                >
                  {uploadingUid === p.id
                    ? <span className="w-3.5 h-3.5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    : <Icon name="photo_camera" className="text-gray-900 text-base" />}
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-lg text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-sm text-text-sec font-medium">{p.breed}</p>
                    <p className="text-xs text-text-sec font-medium">{new Date().getFullYear() - p.birthYear} años · Nacido/a en {p.birthYear}</p>
                  </div>
                  <button onClick={() => openEditPet(p)} className="flex-shrink-0 flex items-center gap-1 text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    <Icon name="edit" className="text-sm" /> Editar
                  </button>
                </div>
                {p.microchip && (
                  <div className="flex items-center gap-2 mb-3 bg-gray-50 dark:bg-bg-dark rounded-xl px-3 py-2">
                    <Icon name="lock" className="text-text-sec text-sm" />
                    <p className="text-xs text-text-sec font-semibold">Microchip: {p.microchip}</p>
                    <span className="ml-auto text-[10px] text-text-sec font-medium">Solo tú</span>
                  </div>
                )}
                {/* Recordatorios */}
                <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-2">Recordatorios</p>
                <div className="grid grid-cols-2 gap-2">
                  {[['vaccines', 'Vacunas', '💉'], ['bath', 'Baño', '🛁'], ['deworming', 'Desparasitación', '🌿'], ['checkup', 'Control general', '🩺']].map(([key, label, emoji]) => (
                    <div key={key} className="bg-gray-50 dark:bg-bg-dark rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <span className="text-base">{emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-gray-700 dark:text-gray-300 truncate">{label}</p>
                        <p className="text-[10px] text-text-sec font-medium">Próximamente</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8">
        <p className="text-xs font-extrabold text-text-sec uppercase tracking-widest mb-3">Puntos y beneficios</p>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-extrabold text-base text-gray-900 dark:text-white">Tienes {user?.points || 0} puntos</p>
              <p className="text-xs text-text-sec font-medium">Canjéalos en descuentos y beneficios</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tienda')}
            className="w-full bg-primary text-gray-900 font-extrabold py-3 rounded-xl text-sm active:scale-95 transition-transform"
          >
            Ver beneficios disponibles
          </button>
        </div>
      </div>
    </div>
    </>
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
