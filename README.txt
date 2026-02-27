SIMRACING Pro League I — Web oficial (Supabase + Hosting gratuito)

✅ Qué incluye
- Web pública: clasificación + rondas (lectura pública)
- Admin: login (Supabase Auth) y edición de resultados
- PWA (instalable)
- Diseño eSports (fondo simracing)

PASO A: Pegar credenciales Supabase
1) En Supabase: Project Settings → API
2) Copia:
   - Project URL  -> SUPABASE_URL
   - anon public key -> SUPABASE_ANON_KEY
3) Abre app.js y admin.js y cambia:
   const SUPABASE_URL = "__SUPABASE_URL__";
   const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";

PASO B: Crear usuario admin
1) Supabase → Authentication → Users → Add user
2) Pon tu email y contraseña (los que usarás en admin.html)

PASO C: Activar permisos (RLS) para editar rondas (solo usuarios logueados)
En Supabase → SQL Editor ejecuta:

create policy "Admin write rounds"
on rounds for update
to authenticated
using (true)
with check (true);

create policy "Admin write rounds insert"
on rounds for insert
to authenticated
with check (true);

create policy "Admin write rounds delete"
on rounds for delete
to authenticated
using (true);

PASO D: Hosting gratuito (Vercel, recomendado)
1) Ve a vercel.com → Add New → Project
2) Import → Deploy without Git (arrastra la carpeta)
3) Publica y listo

Alternativa: GitHub Pages
- Sube estos archivos al repo y activa Pages /root.

Rutas
- index.html  (pública)
- admin.html  (login)

