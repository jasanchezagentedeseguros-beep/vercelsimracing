SIMRACING Pro League I — Web oficial (multi-página)

✅ Home corporativa: index.html
✅ Clasificación: clasificacion.html
✅ Reglamento: reglamento.html
✅ Rondas (con imágenes del dossier): rondas.html
✅ Equipos: equipos.html
✅ Multimedia: multimedia.html (opcional, tabla media)
✅ Admin (solo tú): admin.html

---
1) Pega tus claves de Supabase

Abre y edita (solo 2 archivos):
- app.js
- admin.js

Sustituye:
  const SUPABASE_URL = "__SUPABASE_URL__";
  const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";

Por tu Project URL y tu anon public key.

---
2) Subir a GitHub + desplegar en Vercel

- Crea un repositorio (por ejemplo: simracing-pro-league)
- Sube TODO el contenido del ZIP a la raíz del repo
- En Vercel: New Project -> Import Git Repository -> Deploy

Build Command: (vacío)
Output Directory: (vacío)
Framework Preset: Other

---
3) Tablas mínimas en Supabase

teams:
- id (uuid)
- name (text)

rounds:
- id (uuid)
- number (int)
- circuit (text)
- date (date)
- winner_team_id (uuid)
- fastest_team_id (uuid)

(La web puede funcionar aunque falten columnas adicionales.)

Opcional multimedia:
media:
- id (uuid)
- title (text)
- type (text: image | youtube | link)
- url (text)
- round_number (int)
- created_at (timestamp)

