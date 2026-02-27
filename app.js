// SIMRACING Pro League I — Web oficial (Front)

const WIN_POINTS = 25;
const FAST_LAP_POINTS = 2;

// ⚠️ Se rellenan antes de desplegar (o con variables de entorno en tu build)
const SUPABASE_URL = "https://gbhzidxeteaohdquyokz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_D4KhRhZfQhGo4B05GjmTnA_NixE7Jk1";

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

function toast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.innerHTML = msg;
  el.style.display = "block";
  clearTimeout(window.__t);
  window.__t = setTimeout(()=> el.style.display="none", 2600);
}

function esc(s){
  return String(s??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function computeStandings(teams, rounds){
  const map = new Map();
  (teams||[]).forEach(t=> map.set(t.id, {id:t.id, name:t.name, points:0, wins:0, fl:0}));
  for(const r of (rounds||[])){
    if(r.winner_team_id && map.has(r.winner_team_id)){
      const t = map.get(r.winner_team_id);
      t.points += WIN_POINTS;
      t.wins += 1;
    }
    if(r.fastest_team_id && map.has(r.fastest_team_id)){
      const t = map.get(r.fastest_team_id);
      t.points += FAST_LAP_POINTS;
      t.fl += 1;
    }
  }
  const arr = [...map.values()];
  arr.sort((a,b)=> b.points-a.points || b.wins-a.wins || b.fl-a.fl || a.name.localeCompare(b.name));
  return arr;
}

function winnerName(teamsById, id){ return teamsById.get(id)?.name || "—"; }

async function initSupabase(){
  if(!SUPABASE_URL || SUPABASE_URL.includes("__SUPABASE_URL__")) throw new Error("Missing SUPABASE_URL");
  if(!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes("__SUPABASE_ANON_KEY__")) throw new Error("Missing SUPABASE_ANON_KEY");
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

(function registerSW(){
  if("serviceWorker" in navigator){
    window.addEventListener("load", ()=> navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
  }
})();

// --- Datos estáticos (dossier SPL) ---
const ROUNDS_INFO = [
  {
    number: 1,
    title: "Brands Hatch Grand Prix",
    country: "Reino Unido",
    desc: "Circuito técnico y exigente, donde la precisión y la constancia marcan la diferencia. No perdona errores.",
    laps: 18, tires: "x2", fuel: "100%",
    img: "./assets/rounds/r01.png"
  },
  {
    number: 2,
    title: "Red Bull Ring",
    country: "Austria",
    desc: "Circuito de alta velocidad, castiga duramente el neumático trasero en cada subida y bajada.",
    laps: 16, tires: "x3", fuel: "100%",
    img: "./assets/rounds/r02.png"
  },
  {
    number: 3,
    title: "Kyoto Driving Park – Yamagiwa",
    country: "Japón",
    desc: "Circuito fluido y técnico, donde mantener el ritmo vuelta tras vuelta y no cometer errores es vital.",
    laps: 18, tires: "x2", fuel: "100%",
    img: "./assets/rounds/r03.png"
  },
  {
    number: 4,
    title: "Suzuka Circuit",
    country: "Japón",
    desc: "Histórico circuito FIA y muy técnico, donde se requiere adaptar el estilo de conducción y gestionar bien los neumáticos.",
    laps: 18, tires: "x3", fuel: "100%",
    img: "./assets/rounds/r04.png"
  },
  {
    number: 5,
    title: "Mount Panorama (Bathurst)",
    country: "Australia",
    desc: "Circuito legendario y muy exigente, donde la constancia, control y gestión de neumáticos son cruciales.",
    laps: 15, tires: "x4", fuel: "100%",
    img: "./assets/rounds/r05.png"
  },
  {
    number: 6,
    title: "Deep Forest Raceway",
    country: "Suiza",
    desc: "Ubicado en un denso bosque, donde la precisión y los adelantamientos son tan importantes como la velocidad.",
    laps: 20, tires: "x3", fuel: "100%",
    img: "./assets/rounds/r06.png"
  },
  {
    number: 7,
    title: "WeatherTech Raceway Laguna Seca",
    country: "EE.UU.",
    desc: "Circuito clásico y desafiante, donde es esencial gestionar bien los neumáticos y abordar el \"sacacorchos\".",
    laps: 20, tires: "x2", fuel: "100%",
    img: "./assets/rounds/r07.png"
  },
  {
    number: 8,
    title: "Lago Maggiore – GP",
    country: "Italia",
    desc: "Circuito ficticio; combina zonas rápidas y técnicas, forzando a los pilotos a mantener un buen ritmo de principio a fin.",
    laps: 18, tires: "x2", fuel: "100%",
    img: "./assets/rounds/r08.png"
  },
  {
    number: 9,
    title: "Nürburgring GP",
    country: "Alemania",
    desc: "Configuración GP del mítico Nürburgring: circuito técnico donde batallar de cerca y gestionar las ruedas es clave.",
    laps: 18, tires: "x2", fuel: "100%",
    img: "./assets/rounds/r09.png"
  },
  {
    number: 10,
    title: "Spa-Francorchamps",
    country: "Bélgica",
    desc: "Desenlace final en el legendario Spa, donde el dominio total del coche y de los neumáticos será crucial.",
    laps: 20, tires: "x4", fuel: "100%",
    img: "./assets/rounds/r10.png"
  },
];

const TEAM_LOGOS = {
  "ADP Racing": "./assets/logos/adp-racing.jpg",
  "J. A. S. Simracing": "./assets/logos/jas-simracing.jpg",
  "J. A. S. Simracing ": "./assets/logos/jas-simracing.jpg",
  "J.A.S. Simracing": "./assets/logos/jas-simracing.jpg",
  "J.A.S. SIMRACING": "./assets/logos/jas-simracing.jpg",
};

let supa = null;

async function fetchCore(){
  supa = supa || await initSupabase();
  const [{data:teams, error:te},{data:rounds, error:re}] = await Promise.all([
    supa.from("teams").select("id,name").order("name"),
    supa.from("rounds").select("id,number,circuit,date,winner_team_id,fastest_team_id").order("number")
  ]);
  if(te) throw te;
  if(re) throw re;
  return {teams: teams||[], rounds: rounds||[]};
}

function renderStandings({teams, rounds}){
  const table = $("#standings tbody");
  if(!table) return;

  const standings = computeStandings(teams, rounds);
  const roundsDone = rounds.filter(r=> r.winner_team_id || r.fastest_team_id).length;

  const leaderNameEl = $("#leaderName");
  if(leaderNameEl) leaderNameEl.textContent = standings[0]?.name || "—";

  const roundCountEl = $("#roundCount");
  if(roundCountEl) roundCountEl.textContent = `${roundsDone} / ${rounds.length} rondas disputadas`;

  table.innerHTML = "";
  standings.forEach((t, idx)=>{
    const tr = document.createElement("tr");
    if(idx===0) tr.classList.add("leaderRow");
    tr.innerHTML = `<td class="pos">${idx+1}</td><td>${esc(t.name)}</td><td class="num"><strong>${t.points}</strong></td><td class="num">${t.wins}</td><td class="num">${t.fl}</td>`;
    table.appendChild(tr);
  });

  const roundsList = $("#roundsList");
  if(roundsList){
    const teamsById = new Map(teams.map(t=>[t.id,t]));
    roundsList.innerHTML = "";
    for(const r of rounds){
      const done = (r.winner_team_id || r.fastest_team_id);
      const div = document.createElement("div");
      div.className="round";
      div.innerHTML = `
        <div class="row"><div class="title">Ronda ${r.number}</div><div class="muted">${esc(r.circuit||"—")}</div></div>
        <div class="row" style="margin-top:8px">
          <div><span class="muted">Ganador:</span> <strong>${esc(winnerName(teamsById, r.winner_team_id))}</strong></div>
          <div><span class="muted">VR:</span> <strong>${esc(winnerName(teamsById, r.fastest_team_id))}</strong></div>
        </div>
        <div class="muted small" style="margin-top:8px">${done ? "✅ Disputada" : "⏳ Pendiente"}</div>
      `;
      roundsList.appendChild(div);
    }
  }
}

function renderHome({teams, rounds}){
  const homeLeader = $("#homeLeader");
  const homeRounds = $("#homeRounds");
  const homeLast = $("#homeLast");
  if(!homeLeader && !homeRounds && !homeLast) return;

  const standings = computeStandings(teams, rounds);
  const done = rounds.filter(r=> r.winner_team_id || r.fastest_team_id);
  const last = done[done.length-1];

  if(homeLeader) homeLeader.textContent = standings[0]?.name || "—";
  if(homeRounds) homeRounds.textContent = `${done.length} / ${rounds.length}`;

  if(homeLast){
    if(!last){
      homeLast.textContent = "Aún no hay rondas disputadas";
    }else{
      const teamsById = new Map(teams.map(t=>[t.id,t]));
      homeLast.innerHTML = `Ronda ${last.number}: <strong>${esc(winnerName(teamsById, last.winner_team_id))}</strong> • VR: <strong>${esc(winnerName(teamsById, last.fastest_team_id))}</strong>`;
    }
  }
}

function renderRoundsStatic(){
  const mount = document.getElementById("roundCards");
  if(!mount) return;

  mount.innerHTML = "";
  for(const r of ROUNDS_INFO){
    const el = document.createElement("article");
    el.className = "card roundCard";
    el.innerHTML = `
      <div class="roundCardMedia"><img src="${esc(r.img)}" alt="Ronda ${r.number} • ${esc(r.title)}" loading="lazy"></div>
      <div class="body">
        <div class="roundCardTop">
          <div class="pill">Ronda ${r.number}</div>
          <div class="pill">${esc(r.country)}</div>
        </div>
        <h3 class="roundCardTitle">${esc(r.title)}</h3>
        <p class="muted" style="margin:8px 0 0">${esc(r.desc)}</p>
        <div class="pills" style="margin-top:12px">
          <span class="pill">Vueltas: <strong>${r.laps}</strong></span>
          <span class="pill">Neumáticos: <strong>${esc(r.tires)}</strong></span>
          <span class="pill">Combustible: <strong>${esc(r.fuel)}</strong></span>
        </div>
      </div>
    `;
    mount.appendChild(el);
  }
}

function renderTeams({teams}){
  const grid = document.getElementById("teamsGrid");
  if(!grid) return;

  const count = document.getElementById("teamCount");
  if(count) count.textContent = `${teams.length} equipo(s)`;

  grid.innerHTML = "";
  for(const t of teams){
    const logo = TEAM_LOGOS[t.name] || "./assets/logos/league-logo.png";
    const card = document.createElement("article");
    card.className = "card teamCard";
    card.innerHTML = `
      <div class="teamHead">
        <img class="teamLogo" src="${esc(logo)}" alt="${esc(t.name)}" loading="lazy">
        <div>
          <div class="pill">Equipo</div>
          <h3 class="teamName">${esc(t.name)}</h3>
          <div class="muted small">SPL I • GT7</div>
        </div>
      </div>
      <div class="body">
        <div class="muted">Perfil del equipo (puedes ampliarlo con pilotos, coche y colores).</div>
      </div>
    `;
    grid.appendChild(card);
  }
}

async function renderMedia(){
  const grid = document.getElementById("mediaGrid");
  if(!grid) return;

  const count = document.getElementById("mediaCount");

  try{
    supa = supa || await initSupabase();

    // Intentamos leer una tabla opcional "media".
    const {data, error} = await supa
      .from("media")
      .select("id,title,type,url,round_number,created_at")
      .order("created_at", {ascending:false});

    if(error){
      grid.innerHTML = `
        <div class="muted">
          <strong>No hay galería aún.</strong><br>
          Crea una tabla <span class="pill">media</span> (id, title, type, url, round_number, created_at) o dime y te la preparo.
        </div>
      `;
      if(count) count.textContent = "0";
      return;
    }

    const items = data || [];
    if(count) count.textContent = `${items.length} elemento(s)`;

    grid.innerHTML = "";
    for(const m of items){
      const type = (m.type || "link").toLowerCase();
      const title = m.title || "Multimedia";
      const url = m.url || "";
      const rn = m.round_number ? `Ronda ${m.round_number}` : "";

      const card = document.createElement("div");
      card.className = "mediaItem";

      // vídeo embebido si es YouTube
      let embed = "";
      if(type === "youtube" && url.includes("youtube")){
        const id = (url.match(/[?&]v=([^&]+)/)?.[1]) || url.split("/").pop();
        embed = `<iframe class="mediaFrame" src="https://www.youtube-nocookie.com/embed/${esc(id)}" title="${esc(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }else if(type === "image"){
        embed = `<img class="mediaImg" src="${esc(url)}" alt="${esc(title)}" loading="lazy">`;
      }else{
        embed = `<div class="mediaLink"><a class="btn" href="${esc(url)}" target="_blank" rel="noopener">Abrir enlace</a></div>`;
      }

      card.innerHTML = `
        <div class="mediaTop">
          <div class="pill">${esc(type.toUpperCase())}</div>
          ${rn ? `<div class="pill">${esc(rn)}</div>` : ""}
        </div>
        <div class="mediaTitle">${esc(title)}</div>
        <div class="mediaBody">${embed}</div>
      `;
      grid.appendChild(card);
    }
  }catch(e){
    console.error(e);
    grid.innerHTML = `<div class="muted">No puedo cargar multimedia. Revisa SUPABASE_URL/KEY.</div>`;
    if(count) count.textContent = "—";
  }
}

async function loadAndRenderAll(){
  try{
    const refreshBtn = document.getElementById("btnRefresh");
    if(refreshBtn) refreshBtn.disabled = true;

    toast("Cargando datos…");
    const core = await fetchCore();

    renderHome(core);
    renderStandings(core);
    renderTeams(core);
    renderRoundsStatic();
    await renderMedia();

    toast("Actualizado ✅");
    if(refreshBtn) refreshBtn.disabled = false;
  }catch(e){
    console.error(e);
    toast("No puedo cargar. Revisa SUPABASE_URL/KEY.");
    const refreshBtn = document.getElementById("btnRefresh");
    if(refreshBtn) refreshBtn.disabled = false;
  }
}

const btnRefresh = document.getElementById("btnRefresh");
if(btnRefresh){
  btnRefresh.addEventListener("click", loadAndRenderAll);
}

// Carga inicial + refresco suave
loadAndRenderAll();
setInterval(loadAndRenderAll, 60000);
