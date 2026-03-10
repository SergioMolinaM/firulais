# Archivo — componentes y datos obsoletos

Esta carpeta guarda versiones anteriores de archivos reemplazados durante la
reorganización según la definición de producto de Firulais (mar 2026).
**No importar desde aquí.** Solo referencia histórica.

## Contenido

| Archivo             | Reemplazado por         | Motivo                                                        |
|---------------------|-------------------------|---------------------------------------------------------------|
| TabComunidad.jsx    | TabBarrio.jsx           | Renombrado y reestructurado. SOS integrado como sub-sección. |

## Pendiente de revisión / marcar como futuro

- `MOCK_FEED` en `mockData.js` — ya no se usa (feed viene de Firestore)
- `MOCK_VET_ENTRIES` en `mockData.js` — VetDiary usa mock; mover a Firestore en siguiente fase
- Recordatorios (vacunas, baño, etc.) — UI lista, lógica de fechas pendiente
- Foto de perfil de usuario — campo `photoUrl` existe, subida de imagen pendiente
- Foto de perfil de mascota — campo `photoUrl` existe, subida de imagen pendiente
- Microchip — campo guardado en Firestore, edición inline pendiente
- Mi manada Firestore — mensajes aún son locales (state), persistencia pendiente
- Eliminar cuenta — UI presente en settings, lógica Firestore/Auth pendiente
- VetDiary multi-mascota — actualmente usa `pet` (pets[0]), selector multi-mascota pendiente
