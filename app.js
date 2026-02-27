
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

async function loadAndRender(){
  try{
    toast("Cargando datos…");
    supa = supa || await initSupabase();

    const [{data:teams, error:te},{data:rounds, error:re}] = await Promise.all([
      supa.from("teams").select("id,name").order("name"),
      supa.from("rounds").select("id,number,circuit,date,winner_team_id,fastest_team_id").order("number")
    ]);
    if(te) throw te;
    if(re) throw re;

    const teamsById = new Map((teams||[]).map(t=>[t.id,t]));
    const standings = computeStandings(teams||[], rounds||[]);
    document.getElementById("leaderName").textContent = standings[0]?.name || "—";
    document.getElementById("roundCount").textContent = `${(rounds||[]).filter(r=>r.winner_team_id || r.fastest_team_id).length} / ${(rounds||[]).length} rondas disputadas`;

    const tbody = document.querySelector("#standings tbody");
    tbody.innerHTML = "";
    standings.forEach((t, idx)=>{
      const tr = document.createElement("tr");
      if(idx===0) tr.classList.add("leaderRow");
      tr.innerHTML = `<td class="pos">${idx+1}</td><td>${esc(t.name)}</td><td class="num"><strong>${t.points}</strong></td><td class="num">${t.wins}</td><td class="num">${t.fl}</td>`;
      tbody.appendChild(tr);
    });

    const roundsList = document.getElementById("roundsList");
    roundsList.innerHTML = "";
    for(const r of (rounds||[])){
      const done = (r.winner_team_id || r.fastest_team_id);
      const div = document.createElement("div");
      div.className="round";
      div.innerHTML = `
        <div class="row"><div class="title">Ronda ${r.number}</div><div class="muted">${esc(r.circuit)}</div></div>
        <div class="row" style="margin-top:8px">
          <div><span class="muted">Ganador:</span> <strong>${esc(winnerName(teamsById, r.winner_team_id))}</strong></div>
          <div><span class="muted">VR:</span> <strong>${esc(winnerName(teamsById, r.fastest_team_id))}</strong></div>
        </div>
        <div class="muted small" style="margin-top:8px">${done ? "✅ Disputada" : "⏳ Pendiente"}</div>
      `;
      roundsList.appendChild(div);
    }

    toast("Actualizado ✅");
  }catch(e){
    console.error(e);
    toast("No puedo cargar. Revisa SUPABASE_URL/KEY.");
  }
}

document.getElementById("btnRefresh").addEventListener("click", loadAndRender);
loadAndRender();
setInterval(loadAndRender, 60000);
