
const WIN_POINTS = 25;
const FAST_LAP_POINTS = 2;

const SUPABASE_URL = "https://gbhzidxeteaohdquyokz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_D4KhRhZfQhGo4B05GjmTnA_NixE7Jk1";

function toast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.innerHTML = msg;
  el.style.display = "block";
  clearTimeout(window.__t);
  window.__t = setTimeout(()=> el.style.display="none", 2600);
}
function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}

function computeStandings(teams, rounds){
  const map = new Map();
  teams.forEach(t=> map.set(t.id, {id:t.id, name:t.name, points:0, wins:0, fl:0}));
  for(const r of rounds){
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

async function initSupabase(){
  if(!SUPABASE_URL || SUPABASE_URL.includes("__SUPABASE_URL__")) throw new Error("Missing SUPABASE_URL");
  if(!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes("__SUPABASE_ANON_KEY__")) throw new Error("Missing SUPABASE_ANON_KEY");
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function winnerName(teamsById, id){ return teamsById.get(id)?.name || "—"; }

(function(){
  if("serviceWorker" in navigator){
    window.addEventListener("load", ()=> navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
  }
})();

let supa = null;
let TEAMS = [];
let ROUNDS = [];
let pending = new Map(); // roundId -> {winner_team_id, fastest_team_id}

function optionList(){
  return ['<option value="">—</option>'].concat((TEAMS||[]).map(t=>`<option value="${t.id}">${esc(t.name)}</option>`)).join("");
}

function renderRounds(){
  const wrap = document.getElementById("adminRounds");
  wrap.innerHTML = "";
  const opts = optionList();

  for(const r of (ROUNDS||[])){
    const div = document.createElement("div");
    div.className = "round";
    const p = pending.get(r.id) || {};
    const w = (p.winner_team_id !== undefined) ? p.winner_team_id : (r.winner_team_id || "");
    const f = (p.fastest_team_id !== undefined) ? p.fastest_team_id : (r.fastest_team_id || "");

    div.innerHTML = `
      <div class="row"><div class="title">Ronda ${r.number}</div><div class="muted">${esc(r.circuit)}</div></div>
      <div class="row" style="margin-top:10px">
        <div style="flex:1;min-width:220px">
          <label>Ganador</label>
          <select data-round="${r.id}" data-field="winner_team_id">${opts}</select>
        </div>
        <div style="flex:1;min-width:220px">
          <label>Vuelta rápida</label>
          <select data-round="${r.id}" data-field="fastest_team_id">${opts}</select>
        </div>
      </div>
      <div class="muted small" style="margin-top:8px">Cambios pendientes: ${pending.has(r.id) ? "<strong>sí</strong>" : "no"}</div>
    `;
    wrap.appendChild(div);

    const selW = div.querySelector('select[data-field="winner_team_id"]');
    const selF = div.querySelector('select[data-field="fastest_team_id"]');
    selW.value = w;
    selF.value = f;

    const onChange = (ev)=>{
      const rid = ev.target.getAttribute("data-round");
      const field = ev.target.getAttribute("data-field");
      const val = ev.target.value || null;
      const cur = pending.get(rid) || {};
      cur[field] = val;
      pending.set(rid, cur);
      toast("Cambio pendiente… (pulsa Guardar)");
      renderRounds(); // refresh badges
    };
    selW.addEventListener("change", onChange);
    selF.addEventListener("change", onChange);
  }
}

async function loadAll(){
  supa = supa || await initSupabase();
  const [{data:teams, error:te},{data:rounds, error:re}] = await Promise.all([
    supa.from("teams").select("id,name").order("name"),
    supa.from("rounds").select("id,number,circuit,winner_team_id,fastest_team_id").order("number"),
  ]);
  if(te) throw te;
  if(re) throw re;
  TEAMS = teams || [];
  ROUNDS = rounds || [];
  renderRounds();
}

async function refreshAuthUI(){
  supa = supa || await initSupabase();
  const { data } = await supa.auth.getSession();
  const logged = !!data.session;

  document.getElementById("btnLogout").style.display = logged ? "inline-flex" : "none";
  document.getElementById("loginBox").style.display = logged ? "none" : "grid";
  document.getElementById("loginHint").style.display = logged ? "block" : "none";
  document.getElementById("authState").textContent = logged ? `Autenticado` : `No autenticado`;

  if(logged){
    await loadAll();
  }
}

document.getElementById("btnLogin").addEventListener("click", async (ev)=>{
  ev.preventDefault();
  try{
    toast("Entrando…");
    supa = supa || await initSupabase();
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value;
    const { error } = await supa.auth.signInWithPassword({ email, password: pass });
    if(error) throw error;
    toast("Login OK ✅");
    await refreshAuthUI();
  }catch(e){
    console.error(e);
    toast("Login falló ❌");
    alert("Login falló. Revisa email/contraseña en Supabase Auth.");
  }
});

document.getElementById("btnLogout").addEventListener("click", async ()=>{
  supa = supa || await initSupabase();
  await supa.auth.signOut();
  pending.clear();
  toast("Sesión cerrada");
  await refreshAuthUI();
});

document.getElementById("btnReload").addEventListener("click", async ()=>{
  pending.clear();
  await refreshAuthUI();
});

document.getElementById("btnSave").addEventListener("click", async ()=>{
  try{
    supa = supa || await initSupabase();
    const { data } = await supa.auth.getSession();
    if(!data.session){
      toast("Necesitas login");
      return;
    }
    if(pending.size === 0){
      toast("No hay cambios");
      return;
    }

    toast("Guardando…");
    for(const [roundId, patch] of pending.entries()){
      const { error } = await supa.from("rounds").update(patch).eq("id", roundId);
      if(error) throw error;
    }
    pending.clear();
    await loadAll();
    toast("Guardado ✅");
  }catch(e){
    console.error(e);
    toast("No guardó ❌");
    alert("No se ha podido guardar.\n\nCausas típicas:\n- RLS: falta policy de UPDATE para usuarios autenticados\n- No estás logueado\n\nMira la consola para el error.");
  }
});

refreshAuthUI();
