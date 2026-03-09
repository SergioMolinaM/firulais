import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [pets,    setPets]    = useState([])   // array de mascotas
  const [uid,     setUid]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (!firebaseUser) {
        try { await signInAnonymously(auth) } catch { setLoading(false) }
        return
      }

      setUid(firebaseUser.uid)

      try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snap.exists()) {
          const d = snap.data()
          setUser({ name: d.name, email: d.email, photoUrl: d.photoUrl, points: d.points, joinDate: d.joinDate })
          setPets(d.pets ?? (d.pet ? [d.pet] : []))  // migración: pet antiguo → array
        }
      } catch { /* offline or permission error — continue */ }

      setLoading(false)
    })
    return unsub
  }, [])

  async function handleOnboarded(u, petsData) {
    const petsArray = Array.isArray(petsData) ? petsData : [petsData]
    setUser(u)
    setPets(petsArray)
    const currentUid = auth.currentUser?.uid
    if (!currentUid) return
    await setDoc(doc(db, 'users', currentUid), {
      name:     u.name,
      email:    u.email,
      photoUrl: u.photoUrl,
      points:   u.points,
      joinDate: u.joinDate,
      pets:     petsArray,
    })
  }

  async function addPet(p) {
    const newPets = [...pets, p]
    setPets(newPets)
    const currentUid = auth.currentUser?.uid
    if (!currentUid) return
    try { await updateDoc(doc(db, 'users', currentUid), { pets: newPets }) } catch { /* ignore */ }
  }

  async function addPoints(pts) {
    if (!user) return
    const newPoints = (user.points || 0) + pts
    setUser(u => ({ ...u, points: newPoints }))
    const currentUid = auth.currentUser?.uid
    if (!currentUid) return
    try { await updateDoc(doc(db, 'users', currentUid), { points: newPoints }) } catch { /* ignore */ }
  }

  async function logout() {
    setLoading(true)
    setUser(null)
    setPets([])
    setUid(null)
    try { await auth.signOut() } catch { /* ignore */ }
    // onAuthStateChanged fires null → signInAnonymously → fresh session → Onboarding
  }

  return (
    <AppContext.Provider value={{ user, pets, pet: pets[0] ?? null, uid, loading, handleOnboarded, addPet, addPoints, logout }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
