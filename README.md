# Firulais 🐾

App cívica para dueños de mascotas en Chile. Paseos con puntos, comunidad, registro de desechos, VetBot IA y tienda pet-friendly.

## Stack

- Vite + React 18
- Tailwind CSS
- Leaflet (mapas)
- Google Gemini 1.5 Flash (VetBot IA)

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Variables de entorno

La API Key de Gemini se guarda en `localStorage` directamente desde la app (Perfil → Configuración → VetBot IA). No requiere `.env`.

## Build

```bash
npm run build
```

El output queda en `/dist`, listo para desplegarse en Vercel, Netlify o Firebase Hosting.

## Roadmap

- [ ] Firebase Auth + Firestore (migración desde localStorage)
- [ ] Push notifications (paseos y vacunas)
- [ ] PWA manifest + service worker
- [ ] Capacitor (App Store / Play Store)
