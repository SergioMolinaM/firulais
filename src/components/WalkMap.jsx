import { useEffect, useRef } from 'react'
import L from 'leaflet'
// leaflet.css ya cargado vía CDN en index.html

// Fix Leaflet marker icons broken by Vite's asset bundling
const MARKER_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const SANTIAGO_CENTER = [-33.4489, -70.6693]

export default function WalkMap({ walking, onDistanceUpdate }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markerRef    = useRef(null)
  const polylineRef  = useRef(null)
  const coordsRef    = useRef([])
  const watchIdRef   = useRef(null)

  // ── Initialize map once ────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return

    const map = L.map(containerRef.current, {
      center: SANTIAGO_CENTER,
      zoom: 16,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OSM</a>',
      maxZoom: 19,
    }).addTo(map)

    polylineRef.current = L.polyline([], {
      color: '#13ec37',
      weight: 5,
      opacity: 0.9,
    }).addTo(map)

    mapRef.current = map

    // Try to center on real position
    navigator.geolocation?.getCurrentPosition(pos => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 16)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ── Start / stop GPS tracking ──────────────────────────
  useEffect(() => {
    if (!mapRef.current) return

    if (walking) {
      coordsRef.current = []
      polylineRef.current?.setLatLngs([])

      watchIdRef.current = navigator.geolocation?.watchPosition(
        pos => {
          const latlng = [pos.coords.latitude, pos.coords.longitude]
          coordsRef.current.push(latlng)

          if (markerRef.current) {
            markerRef.current.setLatLng(latlng)
          } else {
            markerRef.current = L.marker(latlng, { icon: MARKER_ICON }).addTo(mapRef.current)
          }

          polylineRef.current?.setLatLngs(coordsRef.current)
          mapRef.current.panTo(latlng, { animate: true, duration: 0.5 })

          if (coordsRef.current.length > 1) {
            const meters = coordsRef.current.reduce((sum, coord, i) => {
              if (i === 0) return sum
              return sum + mapRef.current.distance(coordsRef.current[i - 1], coord)
            }, 0)
            onDistanceUpdate?.(meters)
          }
        },
        err => console.warn('GPS:', err.message),
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      )
    } else {
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [walking])

  return <div ref={containerRef} className="w-full h-full" />
}
