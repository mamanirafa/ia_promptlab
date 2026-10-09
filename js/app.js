/* =========================================================
   PROMPTLAB · motor de la página
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();
  const titleCase = (s) => s.toLowerCase().replace(/(^|\s|-)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  const fmt = (ms) => { const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000); return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"); };
  const words = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;
  const money = (n) => "$" + Number(n || 0).toLocaleString("es-AR");

  /* ---------- estado ---------- */
  const fresh = () => ({
    name: "", activeMs: 0, timeIn: { m1: 0, m2: 0, m3: 0 }, done: {}, unlockAll: false, noAI: false,
    m1: { step: 0, mision: null, receta: { rol: "", tarea: "", contexto: "", formato: "" }, rondas: {}, final: { ingrediente: "", mejora: "" } },
    m2: { step: 0, subrayado: [], trampa: "", recuerdo: 30, tutores: {}, explicacion: "", ideas: [], vecino: "", revelado: false },
    m3: { step: 0, slot: null, spins: 0, canvas: { nombre: "", slogan: "", solucion: "", datos: "", ingresos: "", mejora: "" }, socios: {}, inversion: 500000, consejo: "" }
  });
  let S = fresh();
  let current = null; // "m1" | "m2" | "m3"
  function save() { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(S)); } catch (e) {} }
  function load() { try { const r = localStorage.getItem(CONFIG.storageKey); if (!r) return null; const d = JSON.parse(r); const f = fresh(); return { ...f, ...d, m1: { ...f.m1, ...d.m1 }, m2: { ...f.m2, ...d.m2 }, m3: { ...f.m3, ...d.m3 }, timeIn: { ...f.timeIn, ...d.timeIn } }; } catch (e) { return null; } }
  function wipe() { try { localStorage.removeItem(CONFIG.storageKey); } catch (e) {} }

  /* ---------- utilidades de interfaz ---------- */
  function show(id) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    $("#topbar").classList.toggle("hidden", id === "screen-welcome");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toast(msg, ms = 2800) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), ms); }
  function modal(html, buttons = [{ label: "Entendido", cls: "primary" }]) {
    return new Promise(res => {
      $("#modal-content").innerHTML = html;
      const act = $("#modal-actions"); act.innerHTML = "";
      buttons.forEach((b, i) => { const el = document.createElement("button"); el.className = "btn " + (b.cls || ""); el.textContent = b.label; el.onclick = () => { $("#modal").classList.add("hidden"); res(b.value ?? i); }; act.appendChild(el); });
      $("#modal").classList.remove("hidden");
    });
  }
  function confetti() {
    const colors = ["#5b4bff", "#c6f432", "#ff6b5b", "#10b5a5", "#ffb627", "#ff8fd1"];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement("div"); c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw"; c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.8 + Math.random() * 1.8 + "s"; c.style.animationDelay = Math.random() * .5 + "s";
      document.body.appendChild(c); setTimeout(() => c.remove(), 4200);
    }
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast("📋 Copiado. Pegalo en la IA con Ctrl+V"); return; } catch (e) {}
    const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("📋 Copiado. Pegalo en la IA con Ctrl+V"); } catch (e) { toast("No pude copiar: seleccioná el texto y usá Ctrl+C"); }
    ta.remove();
  }
  const aiLinks = () => `<div class="ai-links">${IA_LINKS.map(l => `<a class="btn small" href="${l.url}" target="_blank" rel="noopener">${l.nombre} ↗</a>`).join("")}</div>`;

  /* Enlace de campos: data-bind="m1.final.mejora" */
  function getPath(p) { return p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), S); }
  function setPath(p, v) { const ks = p.split("."); const last = ks.pop(); const o = ks.reduce((o, k) => (o[k] ??= {}), S); o[last] = v; }
  function bindAll(root = document) {
    $$("[data-bind]", root).forEach(el => {
      const p = el.dataset.bind; const v = getPath(p);
      if (el.type === "range") el.value = v ?? el.value; else if (v != null) el.value = v;
      el.addEventListener("input", () => { setPath(p, el.type === "range" ? +el.value : el.value); save(); el.dispatchEvent(new CustomEvent("bound")); });
    });
  }
  function need(conds) {
    for (const [ok, msg] of conds) if (!ok) { toast("⚠️ " + msg, 3500); return false; }
    return true;
  }
  const respOK = (t) => S.noAI || String(t || "").trim().length >= 60;

  /* ---------- reloj (tiempo activo) ---------- */
  let last = Date.now(), ticks = 0;
  function tick() {
    const now = Date.now(), d = now - last; last = now;
    if (S.name && d > 0 && d < 120000) {
      S.activeMs += d;
      if (current) S.timeIn[current] = (S.timeIn[current] || 0) + d;
      if (++ticks % 5 === 0) save();
    }
    $("#top-clock").textContent = fmt(S.activeMs);
    if (current) {
      const sug = AGENDA.find(a => a.id === current).min * 60000, used = S.timeIn[current] || 0;
      const el = $("#stage-timer"); const rem = sug - used;
      el.textContent = rem >= 0 ? `⏳ ${fmt(rem)} sugeridos` : `⏰ +${fmt(-rem)} pasado`;
      el.classList.toggle("over", rem < 0);
    }
  }

  /* ---------- topbar ---------- */
  const BADGES = [{ id: "m1", t: "🧪 Ingeniería de prompts" }, { id: "m2", t: "🦉 Aprendizaje autónomo" }, { id: "m3", t: "🦈 Fundador/a IA" }];
  function renderTop() {
    $("#top-name").textContent = S.name;
    $("#top-badges").innerHTML = BADGES.map(b => `<span class="badge ${S.done[b.id] ? "got" : ""}">${b.t}</span>`).join("");
  }

  /* ---------- bienvenida ---------- */
  function initWelcome() {
    const saved = load();
    if (saved && saved.name) {
      $("#resume").classList.remove("hidden"); $("#form-name").classList.add("hidden");
      $("#resume-name").textContent = saved.name;
      $("#btn-resume").onclick = () => { S = saved; enterHub(); };
      $("#btn-new").onclick = async () => { const ok = await modal(`<h3>¿Empezar de nuevo?</h3><p>Se borra el trabajo de <b>${esc(saved.name)}</b> en esta compu.</p>`, [{ label: "Cancelar", value: false }, { label: "Sí, borrar", cls: "coral", value: true }]); if (ok) { wipe(); location.reload(); } };
    }
    $("#form-name").addEventListener("submit", e => {
      e.preventDefault();
      const raw = $("#input-name").value.replace(/\s+/g, " ").trim();
      if (raw.length < 3 || !/\p{L}{2,}/u.test(raw)) return toast("Escribí tu nombre y apellido.");
      S = fresh(); S.name = titleCase(raw); save(); enterHub(true);
    });
  }

  /* ---------- hub ---------- */
  const MOM = {
    m1: { n: 1, t: "Laboratorio de prompts", d: "4 formas de pedirle algo a la IA. ¿Cuál funciona mejor?", icon: "assets/img/m1.svg", steps: ["Misión", "⚡ Flash", "🧪 Receta", "🧩 Ejemplos", "🪜 Pasos", "📊 Comparar"] },
    m2: { n: 2, t: "Aprender con la IA (sin copiar)", d: "Usá a la IA como tutora para entender un texto de verdad.", icon: "assets/img/m2.svg", steps: ["📖 Leer", "🪤 La trampa", "🦉 Tutores IA", "🎤 Sin red"] },
    m3: { n: 3, t: "Tanque de Inversores IA", d: "Girá la máquina, fundá una startup y conseguí inversión.", icon: "assets/img/m3.svg", steps: ["🎰 Máquina", "🤝 Socios IA", "🦈 Inversor", "🎤 Pitch", "🃏 Tarjeta"] }
  };
  const unlocked = (m) => S.unlockAll || m === "m1" || (m === "m2" && S.done.m1) || (m === "m3" && S.done.m2);

  async function enterHub(first = false) {
    current = null; renderTop(); renderHub(); show("screen-hub");
    if (first) await modal(`<img src="assets/img/nova.svg" alt=""><h3>¡Hola, ${esc(S.name.split(" ")[0])}!</h3><p>Soy <b>Nova</b>, la guía del laboratorio. Hoy no vas a usar la IA para que haga la tarea por vos, sino para <b>pensar mejor</b>.</p><p><small>Vas a necesitar una IA abierta en otra pestaña (Gemini, ChatGPT o Copilot). Tu trabajo se guarda solo en esta compu.</small></p>`, [{ label: "¡Empecemos! →", cls: "primary" }]);
  }
  function renderHub() {
    const n = ["m1", "m2", "m3"].filter(m => S.done[m]).length;
    const lines = [
      "Empezá por el <b>Laboratorio de prompts</b>: vas a descubrir por qué la misma pregunta puede dar respuestas muy distintas.",
      "¡Bien! Ahora el <b>Momento 2</b>: vas a usar la IA para aprender, no para que piense por vos.",
      "¡Último momento! En el <b>Tanque de Inversores</b> vas a crear una startup con socios IA. Preparate para convencer a tu compañero/a.",
      "¡Completaste los 3 momentos! 🎉 Abrí tu <b>bitácora</b>, revisala y entregala en Classroom."
    ];
    $("#hub-bubble").innerHTML = `<b>Nova:</b> ${lines[n]}`;
    const nowIdx = n + 1;
    $("#agenda").innerHTML = AGENDA.map((a, i) => `<div class="${i < nowIdx ? "done" : i === nowIdx ? "now" : ""}" style="flex:${a.min}">${esc(a.nombre.split(" · ")[0])} · ${a.min}′</div>`).join("");
    $("#hub-grid").innerHTML = ["m1", "m2", "m3"].map(m => {
      const st = S.done[m] ? "done" : unlocked(m) ? "open" : "locked";
      const lab = st === "done" ? "✔ Completo" : st === "open" ? "Disponible" : "🔒 Bloqueado";
      return `<div class="hub-card ${st}" data-m="${m}" tabindex="0" role="button"><span class="state">${lab}</span><img src="${MOM[m].icon}" alt=""><h3>${MOM[m].n} · ${esc(MOM[m].t)}</h3><p>${esc(MOM[m].d)}</p><p><b>${AGENDA.find(a => a.id === m).min} minutos</b></p></div>`;
    }).join("") ;
    $$(".hub-card").forEach(c => {
      const go = () => { const m = c.dataset.m; if (!unlocked(m)) return toast("🔒 Primero completá el momento anterior."); openMoment(m); };
      c.onclick = go; c.onkeydown = e => { if (e.key === "Enter") go(); };
    });
    let fin = $("#hub-final");
    if (!fin) { fin = document.createElement("div"); fin.id = "hub-final"; fin.className = "panel hub-final"; $("#screen-hub").appendChild(fin); }
    fin.innerHTML = `<img src="assets/img/bitacora.svg" alt="" style="width:64px"><div class="grow"><h3 style="margin:0">Mi bitácora</h3><small>Todo lo que escribiste y reflexionaste, listo para entregar.</small></div><button class="btn ${n === 3 ? "lime" : ""}" id="btn-log">Ver bitácora →</button>`;
    $("#btn-log").onclick = () => renderLog();
  }

  /* ---------- momentos ---------- */
  function openMoment(m) {
    current = m;
    const M = MOM[m];
    $("#stage-icon").src = M.icon;
    $("#stage-kicker").textContent = `Momento ${M.n} de 3 · ${AGENDA.find(a => a.id === m).min} minutos sugeridos`;
    $("#stage-title").textContent = M.t;
    show("screen-stage"); tick();
    RENDER[m]();
  }
  function steps(m) {
    const st = S[m].step;
    $("#stage-steps").innerHTML = MOM[m].steps.map((s, i) => `<span class="step ${i < st ? "done" : i === st ? "now" : ""}">${s}</span>`).join("");
  }
  function go(m, step) { S[m].step = step; save(); RENDER[m](); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function finish(m, msg) {
    S.done[m] = true; save(); renderTop(); confetti();
    const b = BADGES.find(x => x.id === m);
    await modal(`<img src="assets/img/nova.svg" alt=""><h3>¡Momento ${MOM[m].n} completo!</h3><p>Ganaste la insignia</p><p><span class="medal">${b.t}</span></p><p>${msg}</p>`, [{ label: "Volver al mapa", cls: "primary" }]);
    enterHub();
  }
  const body = () => $("#stage-body");

  /* ================= MOMENTO 1 ================= */
  function detect(text) { return INGREDIENTES.filter(i => i.re.test(text)).map(i => i.id); }
  function privacy(text) { return DATOS_SENSIBLES.filter(d => d.re.test(text)).map(d => d.msg); }
  function meterHTML() { return `<div class="meter" id="meter">${INGREDIENTES.map(i => `<span class="ing" data-i="${i.id}">${i.emoji} ${i.nombre}</span>`).join("")}</div><div class="meter-bar"><div id="meter-fill"></div></div><div class="privacy-alert" id="priv"></div>`; }
  function updateMeter(text) {
    const on = detect(text);
    $$("#meter .ing").forEach(el => el.classList.toggle("on", on.includes(el.dataset.i)));
    $("#meter-fill").style.width = Math.round(on.length / INGREDIENTES.length * 100) + "%";
    const p = privacy(text);
    $("#priv").textContent = p.length ? `🚫 ¡Cuidado! ${p.join(", ")}. Nunca pongas datos personales en un prompt.` : "";
    return { on, p };
  }
  const misionTxt = () => { const m = MISIONES.find(x => x.id === S.m1.mision); return m ? `${m.emoji} ${m.titulo}: ${m.desc}` : ""; };
  const recetaPrompt = () => { const r = S.m1.receta; return [r.rol, r.tarea, r.contexto, r.formato].map(s => s.trim()).filter(Boolean).join(" "); };

  function renderM1() {
    steps("m1");
    const st = S.m1.step;
    if (st === 0) {
      body().innerHTML = `<div class="panel">
        <h3>Elegí tu misión</h3>
        <p>Vas a pedirle a la IA lo mismo <b>4 veces</b>, pero con formas diferentes de dar la instrucción. Al final vas a comparar qué cambió.</p>
        <div class="missions">${MISIONES.map(m => `<button class="mission ${S.m1.mision === m.id ? "sel" : ""}" data-id="${m.id}"><span class="e">${m.emoji}</span><b>${esc(m.titulo)}</b><span>${esc(m.desc)}</span></button>`).join("")}</div>
        <div class="callout">🔍 Abrí ahora tu IA en otra pestaña y dejala lista:</div>${aiLinks()}
        <div class="row"><button class="btn primary" id="next" ${S.m1.mision ? "" : "disabled"}>Empezar la ronda 1 →</button></div></div>`;
      $$(".mission").forEach(b => b.onclick = () => { S.m1.mision = b.dataset.id; save(); renderM1(); });
      $("#next").onclick = () => go("m1", 1);
      return;
    }
    if (st >= 1 && st <= 4) return renderRonda(RONDAS[st - 1], st);
    return renderCompare();
  }

  function renderRonda(R, st) {
    const data = (S.m1.rondas[R.id] ??= { prompt: "", resp: "", util: 3, precisa: 3, clara: 3, semaforo: "", nota: "" });
    if (!data.prompt && (R.id === "ejemplos" || R.id === "pasos")) data.prompt = S.m1.rondas.pasos?.prompt || S.m1.rondas.ejemplos?.prompt || recetaPrompt();
    const prev = st > 1 ? RONDAS[st - 2] : null;
    body().innerHTML = `
      <div class="panel">
        <p class="kicker">Ronda ${st} de 4 · ${esc(misionTxt())}</p>
        <h3>${R.emoji} ${esc(R.nombre)}</h3>
        <p>${esc(R.consigna)}</p>
        ${R.receta ? `
          <div class="recipe">
            <div class="r"><label>🎭 ROL · ¿Quién querés que sea la IA?</label><input type="text" data-bind="m1.receta.rol" placeholder="Sos un asesor financiero para adolescentes…"></div>
            <div class="r"><label>🎯 TAREA · ¿Qué tiene que hacer?</label><input type="text" data-bind="m1.receta.tarea" placeholder="Armá un plan para…"></div>
            <div class="r"><label>🧭 CONTEXTO · Datos de la situación (¡sin datos personales!)</label><input type="text" data-bind="m1.receta.contexto" placeholder="Tengo 16 años, recibo $40.000 por mes…"></div>
            <div class="r"><label>📋 FORMATO · ¿Cómo querés la respuesta?</label><input type="text" data-bind="m1.receta.formato" placeholder="En una tabla con 5 filas y un consejo final"></div>
          </div>
          <div class="prompt-preview" id="preview"></div>` : `
          <textarea id="ptext" data-bind="m1.rondas.${R.id}.prompt" placeholder="${esc(R.pistas || "")}"></textarea>
          ${R.maxPalabras ? `<div class="wordcount" id="wc"></div>` : ""}
          ${R.pistas && !R.maxPalabras ? `<small>💡 ${esc(R.pistas)}</small>` : ""}`}
        ${meterHTML()}
        <div class="row"><button class="btn lime" id="copy">📋 Copiar prompt</button>${aiLinks()}</div>
      </div>

      <div class="panel">
        <h3>📥 ¿Qué te respondió la IA?</h3>
        <p>Pegá la parte más importante de la respuesta (no hace falta todo).</p>
        <textarea data-bind="m1.rondas.${R.id}.resp" placeholder="Pegá acá un fragmento de la respuesta…"></textarea>
      </div>

      <div class="panel">
        <h3>🔬 Evaluá la respuesta</h3>
        <div class="rate"><span>👍 ¿Fue útil?</span><input type="range" min="1" max="5" data-bind="m1.rondas.${R.id}.util"><b id="v-util">${data.util}</b></div>
        <div class="rate"><span>🎯 ¿Fue precisa?</span><input type="range" min="1" max="5" data-bind="m1.rondas.${R.id}.precisa"><b id="v-precisa">${data.precisa}</b></div>
        <div class="rate"><span>🔎 ¿Fue clara?</span><input type="range" min="1" max="5" data-bind="m1.rondas.${R.id}.clara"><b id="v-clara">${data.clara}</b></div>
        <p style="margin:14px 0 6px"><b>Semáforo de confianza:</b> ¿usarías esta respuesta tal cual?</p>
        <div class="traffic">
          <button data-v="verde">🟢 Sí, la usaría</button><button data-v="amarillo">🟡 Tendría que verificar algo</button><button data-v="rojo">🔴 No me sirve / hay errores</button>
        </div>
        <label style="margin-top:14px">${prev ? `✍️ Comparada con la ronda anterior (${esc(prev.nombre)}), ¿qué cambió en la respuesta? ¿Por qué creés que pasó?` : "✍️ ¿Qué le faltó a esta respuesta para ser realmente útil para tu misión?"}</label>
        <textarea data-bind="m1.rondas.${R.id}.nota" placeholder="Escribí tu observación…"></textarea>
        <div class="row">
          ${st > 1 ? `<button class="btn ghost" id="back">← Ronda anterior</button>` : ""}
          <button class="btn primary" id="next">${st < 4 ? "Siguiente ronda →" : "Ver comparación 📊"}</button>
        </div>
      </div>`;
    bindAll(body());
    const getPrompt = () => R.receta ? recetaPrompt() : (S.m1.rondas[R.id].prompt || "");
    const refresh = () => {
      const t = getPrompt();
      if (R.receta) { S.m1.rondas[R.id].prompt = t; $("#preview").textContent = t || "Tu prompt va a aparecer acá a medida que completes la receta…"; }
      if (R.maxPalabras) { const w = words(t); const el = $("#wc"); el.textContent = `${w} / ${R.maxPalabras} palabras`; el.classList.toggle("bad", w > R.maxPalabras); }
      updateMeter(t);
    };
    $$("[data-bind]", body()).forEach(el => el.addEventListener("bound", () => {
      refresh();
      ["util", "precisa", "clara"].forEach(k => { const v = $("#v-" + k); if (v) v.textContent = S.m1.rondas[R.id][k]; });
    }));
    refresh();
    $$(".traffic button").forEach(b => { b.classList.toggle("sel", data.semaforo === b.dataset.v); b.onclick = () => { data.semaforo = b.dataset.v; save(); $$(".traffic button").forEach(x => x.classList.toggle("sel", x === b)); }; });
    const validPrompt = () => {
      const t = getPrompt(), on = detect(t), w = words(t);
      const conds = [[w >= 2, "Escribí tu prompt."], [!privacy(t).length, "Sacá los datos personales del prompt."]];
      if (R.maxPalabras) conds.push([w <= R.maxPalabras, `En esta ronda el prompt debe tener como máximo ${R.maxPalabras} palabras.`]);
      if (R.receta) conds.push([["rol", "tarea", "contexto", "formato"].every(x => on.includes(x)), "Tu receta necesita los 4 ingredientes encendidos: Rol, Tarea, Contexto y Formato."]);
      if (R.requiere) conds.push([on.includes(R.requiere), R.requiere === "ejemplos" ? "Incluí al menos un ejemplo (por ejemplo: “como estos: …”)." : "Pedí la respuesta por pasos (Paso 1…, Paso 2…)."]);
      return conds;
    };
    $("#copy").onclick = () => { if (need(validPrompt())) copy(getPrompt()); };
    if ($("#back")) $("#back").onclick = () => go("m1", st - 1);
    $("#next").onclick = () => {
      const d = S.m1.rondas[R.id];
      if (!need([...validPrompt(), [respOK(d.resp), "Pegá un fragmento de la respuesta de la IA (al menos 60 caracteres)."], [!!d.semaforo, "Elegí un color del semáforo de confianza."], [String(d.nota).trim().length >= 15, "Escribí tu observación (al menos una oración)."]])) return;
      go("m1", st + 1);
    };
  }

  function renderCompare() {
    const avg = (r) => { const d = S.m1.rondas[r.id] || {}; return ((+d.util || 0) + (+d.precisa || 0) + (+d.clara || 0)) / 3; };
    const sem = { verde: "🟢", amarillo: "🟡", rojo: "🔴" };
    body().innerHTML = `
      <div class="panel">
        <h3>📊 Tus 4 experimentos, lado a lado</h3>
        <p>Promedio de tus calificaciones (útil + precisa + clara) para cada forma de preguntar.</p>
        <div class="compare">${RONDAS.map(r => `<div class="col"><b>${avg(r).toFixed(1)}</b><div class="bar" data-h="${avg(r) / 5 * 100}"></div><small>${r.emoji} ${esc(r.nombre.split(" (")[0])}<br>${sem[S.m1.rondas[r.id]?.semaforo] || ""}</small></div>`).join("")}</div>
      </div>
      <div class="panel">
        <h3>🧠 Reflexión final</h3>
        <label>¿Qué ingrediente del prompt hizo MÁS diferencia en la respuesta? ¿Por qué?</label>
        <textarea data-bind="m1.final.ingrediente" placeholder="Para mí, el ingrediente que más cambió todo fue… porque…"></textarea>
        <div class="callout neigh">🤝 <b>Intercambio con tu compañero/a:</b> mostrale tu mejor prompt y pedile que lo mejore con UNA sola sugerencia. También ayudalo/a con el suyo.</div>
        <label>¿Qué mejora te propuso tu compañero/a? ¿Estás de acuerdo?</label>
        <textarea data-bind="m1.final.mejora" placeholder="Me sugirió… y creo que…"></textarea>
        <div class="row"><button class="btn ghost" id="back">← Ronda 4</button><button class="btn primary" id="next">Terminar Momento 1 ✔</button></div>
      </div>`;
    bindAll(body());
    requestAnimationFrame(() => setTimeout(() => $$(".compare .bar").forEach(b => b.style.height = b.dataset.h + "%"), 60));
    $("#back").onclick = () => go("m1", 4);
    $("#next").onclick = () => {
      if (!need([[S.m1.final.ingrediente.trim().length >= 20, "Contá qué ingrediente hizo más diferencia y por qué."], [S.m1.final.mejora.trim().length >= 10, "Escribí la mejora que te propuso tu compañero/a."]])) return;
      finish("m1", "Ahora sabés que <b>la calidad de la respuesta depende de la calidad de la instrucción</b>.");
    };
  }

  /* ================= MOMENTO 2 ================= */
  const textoPlano = () => TEXTO.titulo + "\n\n" + TEXTO.parrafos.join("\n\n");
  function readingHTML(clickable) {
    let k = 0;
    return `<div class="reading" id="reading"><h3>${esc(TEXTO.titulo)}</h3>${TEXTO.parrafos.map(p => `<p>${p.split(/(?<=[.!?]["”]?)\s+(?=[A-ZÁÉÍÓÚÑ¿¡“"])/).map(s => `<span class="s ${S.m2.subrayado.includes(k) ? "hl" : ""}" data-k="${k++}">${esc(s)} </span>`).join("")}</p>`).join("")}</div>`;
  }
  function renderM2() {
    steps("m2");
    const st = S.m2.step;
    if (st === 0) {
      body().innerHTML = `
        <div class="callout">📖 <b>Leé el texto con atención (5 min).</b> Mientras leés, <b>tocá las 3 a 5 oraciones</b> que te parezcan más importantes para subrayarlas.</div>
        ${readingHTML(true)}
        <div class="row"><span class="wordcount" id="hlc"></span><button class="btn primary" id="next">Ya lo leí →</button></div>`;
      const upd = () => { $("#hlc").textContent = `Subrayaste ${S.m2.subrayado.length} oraciones`; };
      $$("#reading .s").forEach(s => s.onclick = () => {
        const k = +s.dataset.k, i = S.m2.subrayado.indexOf(k);
        if (i >= 0) S.m2.subrayado.splice(i, 1); else { if (S.m2.subrayado.length >= 5) return toast("Máximo 5: elegí solo lo MÁS importante."); S.m2.subrayado.push(k); }
        s.classList.toggle("hl"); save(); upd();
      });
      upd();
      $("#next").onclick = () => { if (need([[S.m2.subrayado.length >= 3, "Subrayá al menos 3 oraciones importantes."]])) go("m2", 1); };
      return;
    }
    if (st === 1) {
      body().innerHTML = `
        <div class="panel">
          <h3>🪤 La trampa: ¿quién está pensando?</h3>
          <p>Mirá estos dos prompts para estudiar el mismo texto:</p>
          <div class="vs">
            <div class="trap"><b>❌ Prompt trampa</b><p class="prompt-preview" style="background:#5a1f1a">${esc(PROMPT_TRAMPA)} [texto]</p><small>La IA piensa, resume y elige qué es importante. Vos solo leés el resultado.</small></div>
            <div class="good"><b>✅ Prompt tutor</b><p class="prompt-preview" style="background:#0f4d3a">Haceme preguntas de a una para que YO descubra las ideas principales. No me des las respuestas…</p><small>Vos pensás, respondés y te equivocás. La IA te guía.</small></div>
          </div>
          <div class="callout">🧠 <b>Aprendizaje significativo</b> = conectar lo nuevo con lo que ya sabés, <b>haciendo el esfuerzo vos</b>. Si la IA hace todo, tu cerebro no guarda nada.</div>
          <label>Si estudiás solo con el prompt trampa, ¿cuánto creés que recordarías mañana en una prueba sin IA?</label>
          <div class="spectrum"><span>Nada</span><input type="range" min="0" max="100" data-bind="m2.recuerdo"><span>Todo</span></div>
          <label style="margin-top:12px">¿Por qué? ¿Quién hace el “trabajo de pensar” en cada caso?</label>
          <textarea data-bind="m2.trampa" placeholder="Con el prompt trampa… en cambio con el prompt tutor…"></textarea>
          <div class="row"><button class="btn ghost" id="back">← Texto</button><button class="btn primary" id="next">Conocer a los tutores IA →</button></div>
        </div>`;
      bindAll(body());
      $("#back").onclick = () => go("m2", 0);
      $("#next").onclick = () => { if (need([[S.m2.trampa.trim().length >= 20, "Explicá con una o dos oraciones quién hace el trabajo de pensar."]])) go("m2", 2); };
      return;
    }
    if (st === 2) return renderTutores();
    return renderSinRed();
  }

  function renderTutores() {
    const n = Object.values(S.m2.tutores).filter(t => t.ok).length;
    body().innerHTML = `
      <div class="callout">🦉 <b>Elegí al menos 3 tutores IA</b> y conversá con cada uno unos 3 minutos. Cada prompt ya incluye el texto completo: copialo, pegalo en la IA y <b>respondé vos</b> lo que te pregunte.</div>
      <div class="tutor-grid">${TUTORES.map(t => `<div class="tutor ${S.m2.tutores[t.id]?.ok ? "done" : ""}"><span class="e">${t.emoji}</span><b>${esc(t.nombre)}</b><p>${esc(t.para)}</p><button class="btn small ${S.m2.tutores[t.id]?.ok ? "" : "primary"}" data-t="${t.id}">${S.m2.tutores[t.id]?.ok ? "Ver / editar" : "Usar este tutor"}</button></div>`).join("")}</div>
      <div id="tutor-work"></div>
      <div class="row"><button class="btn ghost" id="back">← La trampa</button><span class="wordcount">Tutores completados: ${n} / 3</span><button class="btn primary" id="next" ${n >= 3 ? "" : "disabled"}>Desafío sin red →</button></div>`;
    $$("[data-t]").forEach(b => b.onclick = () => openTutor(b.dataset.t));
    $("#back").onclick = () => go("m2", 1);
    $("#next").onclick = () => go("m2", 3);
  }
  function openTutor(id) {
    const T = TUTORES.find(t => t.id === id);
    const d = (S.m2.tutores[id] ??= { aprendi: "", pensar: 50, ok: false });
    const full = T.prompt.replace("{TEXTO}", textoPlano());
    $("#tutor-work").innerHTML = `
      <div class="panel" style="margin-top:16px" id="tw">
        <h3>${T.emoji} ${esc(T.nombre)}</h3>
        <div class="prompt-preview">${esc(T.prompt.replace("{TEXTO}", "« " + TEXTO.titulo + " … (texto completo) »"))}</div>
        <div class="row"><button class="btn lime" id="tcopy">📋 Copiar prompt con el texto</button>${aiLinks()}</div>
        <div class="callout warn">⚠️ Si la IA te da la respuesta igual, escribile: <i>“No me des la respuesta, guiame con preguntas”</i>.</div>
        <label>Después de conversar: ¿qué aprendiste, descubriste o te costó?</label>
        <textarea data-bind="m2.tutores.${id}.aprendi" placeholder="Me di cuenta de que…"></textarea>
        <label style="margin-top:10px">¿Cómo se comportó la IA?</label>
        <div class="spectrum"><span>Me dio todo resuelto</span><input type="range" min="0" max="100" data-bind="m2.tutores.${id}.pensar"><span>Me hizo pensar a mí</span></div>
        <div class="row"><button class="btn primary" id="tsave">Guardar este tutor ✔</button></div>
      </div>`;
    bindAll($("#tw"));
    $("#tw").scrollIntoView({ behavior: "smooth", block: "start" });
    $("#tcopy").onclick = () => copy(full);
    $("#tsave").onclick = () => {
      if (!need([[d.aprendi.trim().length >= 25, "Contá con al menos una oración qué aprendiste con este tutor."]])) return;
      d.ok = true; save();
      if (d.pensar < 40) toast("💡 Ojo: si la IA te dio todo resuelto, probá pedirle que te guíe con preguntas.", 4200); else toast("✔ ¡Tutor guardado!");
      renderTutores();
    };
  }
  function renderSinRed() {
    const rev = S.m2.revelado;
    body().innerHTML = `
      <div class="panel">
        <h3>🎤 Desafío sin red</h3>
        <p>${rev ? "Ahora compará lo que escribiste con el texto." : "El texto está oculto y la IA, cerrada. <b>Explicá con tus palabras</b> de qué trata el texto, como si se lo contaras a alguien que no lo leyó."}</p>
        <textarea data-bind="m2.explicacion" ${rev ? "readonly" : ""} style="min-height:150px" placeholder="El texto explica que…"></textarea>
        <small id="ec"></small>
        ${rev ? "" : `<div class="row"><button class="btn coral" id="reveal">👀 Revelar el texto y comprobar</button></div>`}
      </div>
      ${readingHTML(false).replace('class="reading"', `class="reading ${rev ? "" : "blur"}"`)}
      ${rev ? `
      <div class="panel" style="margin-top:16px">
        <h3>✅ Autoevaluación</h3>
        <p>Marcá las ideas clave que SÍ aparecen en tu explicación (sé honesto/a: nadie te califica por esto).</p>
        <div class="checks">${TEXTO.ideasClave.map((t, i) => `<label class="${S.m2.ideas.includes(i) ? "on" : ""}"><input type="checkbox" data-i="${i}" ${S.m2.ideas.includes(i) ? "checked" : ""}> ${esc(t)}</label>`).join("")}</div>
        <p class="money" id="score" style="font-size:22px"></p>
        <div class="callout neigh">🤝 <b>Explicale el texto en 1 minuto a tu compañero/a</b>, sin mirar. Después, que te haga una pregunta.</div>
        <label>¿Qué te preguntó tu compañero/a? ¿Pudiste responderle?</label>
        <textarea data-bind="m2.vecino" placeholder="Me preguntó…"></textarea>
        <div class="row"><button class="btn primary" id="next">Terminar Momento 2 ✔</button></div>
      </div>` : ""}`;
    bindAll(body());
    const ec = () => { const el = $("#ec"); if (el) el.textContent = `${S.m2.explicacion.trim().length} caracteres (mínimo 150)`; };
    $$("[data-bind='m2.explicacion']").forEach(el => el.addEventListener("bound", ec)); ec();
    if (!rev) {
      $("#reveal").onclick = () => { if (!need([[S.m2.explicacion.trim().length >= 150, "Escribí tu explicación (mínimo 150 caracteres) antes de mirar."]])) return; S.m2.revelado = true; save(); renderSinRed(); };
      return;
    }
    const sc = () => { const n = S.m2.ideas.length; $("#score").textContent = `${n} de ${TEXTO.ideasClave.length} ideas clave ${n >= 5 ? "🏆 ¡Excelente!" : n >= 3 ? "👍 ¡Bien!" : "📚 Volvé a usar un tutor"}`; };
    $$(".checks input").forEach(c => c.onchange = () => {
      const i = +c.dataset.i; S.m2.ideas = c.checked ? [...new Set([...S.m2.ideas, i])] : S.m2.ideas.filter(x => x !== i);
      c.parentElement.classList.toggle("on", c.checked); save(); sc();
    });
    sc();
    $("#next").onclick = () => { if (!need([[S.m2.vecino.trim().length >= 10, "Contá qué te preguntó tu compañero/a."]])) return; finish("m2", "Usaste la IA como <b>tutora</b>, no como fotocopiadora. Así se aprende de verdad."); };
  }

  /* ================= MOMENTO 3 ================= */
  const slotTxt = () => { const s = S.m3.slot; return s ? { P: s.problema, C: s.cliente, S: `${s.superpoder.t} (${s.superpoder.d})`, R: s.restriccion } : null; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const canvasTxt = () => { const c = S.m3.canvas, s = S.m3.slot || {}; return `Nombre: ${c.nombre}\nSlogan: ${c.slogan}\nProblema: ${s.problema}\nCliente: ${s.cliente}\nSolución: ${c.solucion}\nDatos que usa y cómo los cuida: ${c.datos}\nCómo gana dinero: ${c.ingresos}`; };
  function socioPrompt(id) {
    const t = slotTxt(); const p = SOCIOS_IA.find(s => s.id === id).prompt;
    return p.replaceAll("{P}", t.P).replaceAll("{C}", t.C).replaceAll("{S}", t.S).replaceAll("{R}", t.R).replaceAll("{CANVAS}", canvasTxt());
  }
  function renderM3() {
    steps("m3");
    const st = S.m3.step;
    if (st === 0) {
      const s = S.m3.slot;
      body().innerHTML = `
        <div class="panel">
          <h3>🎰 La máquina de startups</h3>
          <p>Tirá de la palanca: la máquina te asigna un <b>problema real</b>, un <b>cliente</b>, el <b>superpoder de IA</b> que vas a usar y una <b>restricción</b>. Giros disponibles: <b>${3 - S.m3.spins}</b>.</p>
          <div class="slot">
            <div class="reel" id="r0"><small>Problema</small><div>${s ? esc(s.problema) : "?"}</div></div>
            <div class="reel" id="r1"><small>Cliente</small><div>${s ? esc(s.cliente) : "?"}</div></div>
            <div class="reel" id="r2"><small>Superpoder IA</small><div>${s ? `${s.superpoder.e} ${esc(s.superpoder.t)}<br><span style="font-weight:500;font-size:12px">${esc(s.superpoder.d)}</span>` : "?"}</div></div>
            <div class="reel" id="r3"><small>Restricción</small><div>${s ? esc(s.restriccion) : "?"}</div></div>
          </div>
          <div class="row"><button class="btn coral lever" id="spin" ${s && S.m3.spins >= 3 ? "disabled" : ""}>🎰 ${s ? "Volver a girar" : "¡Girar!"}</button>
          <button class="btn primary" id="next" ${s ? "" : "disabled"}>Me quedo con esta → </button></div>
        </div>`;
      $("#spin").onclick = () => {
        if (S.m3.spins >= 3) return;
        S.m3.spins++;
        const fin = { problema: pick(TRAGAMONEDAS.problema), cliente: pick(TRAGAMONEDAS.cliente), superpoder: pick(TRAGAMONEDAS.superpoder), restriccion: pick(TRAGAMONEDAS.restriccion) };
        const reels = [0, 1, 2, 3].map(i => $("#r" + i));
        reels.forEach(r => r.classList.add("spin"));
        const lists = [TRAGAMONEDAS.problema, TRAGAMONEDAS.cliente, TRAGAMONEDAS.superpoder.map(x => x.e + " " + x.t), TRAGAMONEDAS.restriccion];
        const iv = setInterval(() => reels.forEach((r, i) => r.querySelector("div").textContent = pick(lists[i])), 70);
        $("#spin").disabled = true;
        [0, 1, 2, 3].forEach(i => setTimeout(() => { reels[i].classList.remove("spin"); if (i === 3) { clearInterval(iv); S.m3.slot = fin; save(); renderM3(); } }, 700 + i * 350));
      };
      $("#next").onclick = () => go("m3", 1);
      return;
    }
    if (st === 1) {
      const t = slotTxt();
      body().innerHTML = `
        <div class="callout"><b>Tu desafío:</b> ${esc(t.P)} · <b>Cliente:</b> ${esc(t.C)} · <b>IA:</b> ${esc(t.S)} · <b>Restricción:</b> ${esc(t.R)}</div>
        <div class="socios">${SOCIOS_IA.slice(0, 2).map(s => `<div class="tutor ${S.m3.socios[s.id] ? "done" : ""}"><span class="e">${s.emoji}</span><b>${esc(s.nombre)}</b><p>${s.id === "cofundador" ? "Te propone nombres y slogans. Vos elegís." : "Te ayuda a pensar qué datos usar y cómo cuidarlos."}</p><button class="btn small primary" data-s="${s.id}">📋 Copiar prompt</button></div>`).join("")}
          <div class="tutor" style="background:#fff6e0"><span class="e">🧠</span><b>Vos sos quien decide</b><p>La IA sugiere; la idea final, los números y las decisiones son tuyas.</p>${aiLinks()}</div></div>
        <div class="panel" style="margin-top:16px">
          <h3>🧾 Canvas de tu startup</h3>
          <div class="canvas-grid">
            <div><label>Nombre</label><input type="text" maxlength="28" data-bind="m3.canvas.nombre" placeholder="Ej.: AhorrApp"></div>
            <div><label>Slogan (máx. 8 palabras)</label><input type="text" maxlength="60" data-bind="m3.canvas.slogan" placeholder="Tu plata, tu futuro"></div>
            <div class="full"><label>¿Cómo funciona? ¿Cómo usa la IA?</label><textarea data-bind="m3.canvas.solucion" placeholder="La app…"></textarea></div>
            <div><label>¿Qué datos usa y cómo los cuida?</label><textarea data-bind="m3.canvas.datos" placeholder="Usa… y pide permiso para…"></textarea></div>
            <div><label>¿Cómo gana dinero?</label><textarea data-bind="m3.canvas.ingresos" placeholder="Cobra… / publicidad / suscripción…"></textarea></div>
          </div>
          <div class="row"><button class="btn ghost" id="back">← Máquina</button><button class="btn primary" id="next">Presentar al inversor 🦈 →</button></div>
        </div>`;
      bindAll(body());
      $$("[data-s]").forEach(b => b.onclick = () => { S.m3.socios[b.dataset.s] = true; save(); b.closest(".tutor").classList.add("done"); copy(socioPrompt(b.dataset.s)); });
      $("#back").onclick = () => go("m3", 0);
      $("#next").onclick = () => {
        const c = S.m3.canvas;
        if (!need([[c.nombre.trim().length >= 2, "Ponele nombre a tu startup."], [c.slogan.trim().length >= 3 && words(c.slogan) <= 8, "Escribí un slogan de hasta 8 palabras."], [c.solucion.trim().length >= 30, "Explicá cómo funciona (al menos 30 caracteres)."], [c.datos.trim().length >= 15, "Contá qué datos usa y cómo los cuida."], [c.ingresos.trim().length >= 8, "Contá cómo gana dinero."]])) return;
        go("m3", 2);
      };
      return;
    }
    if (st === 2) {
      body().innerHTML = `
        <div class="panel">
          <h3>🦈 El/la inversor/a despiadado/a</h3>
          <p>Antes de presentar a tu compañero/a, poné a prueba tu idea con una IA exigente. Copiá el prompt (ya incluye tu canvas) y leé las críticas.</p>
          <div class="prompt-preview">${esc(socioPrompt("inversor"))}</div>
          <div class="row"><button class="btn lime" id="icopy">📋 Copiar prompt del inversor</button>${aiLinks()}</div>
          <label style="margin-top:14px">¿Qué crítica te pareció más justa y cómo mejorás tu idea? (decidís vos)</label>
          <textarea data-bind="m3.canvas.mejora" placeholder="El inversor dijo que… entonces voy a…"></textarea>
          <div class="row"><button class="btn ghost" id="back">← Canvas</button><button class="btn primary" id="next">¡A hacer el pitch! 🎤 →</button></div>
        </div>`;
      bindAll(body());
      $("#icopy").onclick = () => { S.m3.socios.inversor = true; save(); copy(socioPrompt("inversor")); };
      $("#back").onclick = () => go("m3", 1);
      $("#next").onclick = () => { if (need([[S.m3.canvas.mejora.trim().length >= 25, "Contá qué crítica recibiste y cómo vas a mejorar."]])) go("m3", 3); };
      return;
    }
    if (st === 3) {
      body().innerHTML = `
        <div class="panel">
          <h3>🎤 Pitch de 60 segundos</h3>
          <div class="callout neigh">🤝 Girá la pantalla hacia tu compañero/a. Tenés <b>60 segundos</b> para convencerlo/a de invertir en <b>${esc(S.m3.canvas.nombre)}</b>. Después cambian los roles.</div>
          <div class="partner">
            <div>
              <div class="big-timer" id="bt">01:00</div>
              <div class="row center"><button class="btn coral" id="start">▶ Empezar pitch</button></div>
              <p style="text-align:center"><b>${esc(S.m3.canvas.nombre)}</b> — “${esc(S.m3.canvas.slogan)}”</p>
            </div>
            <div>
              <p><b>Para tu compañero/a inversor/a:</b> tenés $1.000.000 virtuales. ¿Cuánto invertís?</p>
              <input type="range" min="0" max="1000000" step="50000" data-bind="m3.inversion" style="width:100%;accent-color:var(--ok)">
              <p class="money" id="inv"></p>
              <label>¿Qué le recomienda el/la inversor/a para mejorar?</label>
              <textarea data-bind="m3.consejo" placeholder="Le recomiendo…"></textarea>
            </div>
          </div>
          <div class="row"><button class="btn ghost" id="back">← Inversor IA</button><button class="btn primary" id="next">Generar mi tarjeta 🃏 →</button></div>
        </div>`;
      bindAll(body());
      const inv = () => $("#inv").textContent = money(S.m3.inversion);
      $$("[data-bind='m3.inversion']").forEach(e => e.addEventListener("bound", inv)); inv();
      let t = null;
      $("#start").onclick = () => {
        clearInterval(t); let s = 60; const bt = $("#bt"); bt.classList.add("go");
        t = setInterval(() => { s--; bt.textContent = "00:" + String(s).padStart(2, "0"); if (s <= 0) { clearInterval(t); bt.classList.remove("go"); bt.textContent = "⏰ ¡Tiempo!"; } }, 1000);
      };
      $("#back").onclick = () => { clearInterval(t); go("m3", 2); };
      $("#next").onclick = () => { if (!need([[S.m3.consejo.trim().length >= 10, "Anotá el consejo de tu compañero/a inversor/a."]])) return; clearInterval(t); go("m3", 4); };
      return;
    }
    // st 4: tarjeta
    body().innerHTML = `
      <div class="panel">
        <h3>🃏 Tu tarjeta de startup</h3>
        <p>Coleccionable: comparala con las del resto del curso. ¿Quién consiguió una <b>Legendaria</b>?</p>
        <canvas id="card-canvas" width="600" height="840"></canvas>
        <div class="row center"><button class="btn lime" id="dl">⬇️ Descargar tarjeta</button><button class="btn ghost" id="back">← Pitch</button><button class="btn primary" id="next">Terminar Momento 3 ✔</button></div>
      </div>`;
    StartupCard.draw($("#card-canvas"), cardData());
    $("#dl").onclick = () => StartupCard.download($("#card-canvas"), S.m3.canvas.nombre);
    $("#back").onclick = () => go("m3", 3);
    $("#next").onclick = () => finish("m3", `Fundaste <b>${esc(S.m3.canvas.nombre)}</b> y conseguiste <b>${money(S.m3.inversion)}</b> de inversión.`);
  }
  const cardData = () => ({ ...S.m3.canvas, fundador: S.name, inversion: S.m3.inversion, slot: S.m3.slot });

  const RENDER = { m1: renderM1, m2: renderM2, m3: renderM3 };

  /* ================= BITÁCORA ================= */
  function logText() {
    const L = [];
    const r1 = S.m1.rondas, sem = { verde: "🟢", amarillo: "🟡", rojo: "🔴" };
    L.push(`BITÁCORA PROMPTLAB — ${S.name}`, `${CONFIG.curso}${CONFIG.institucion ? " · " + CONFIG.institucion : ""}`, `Fecha: ${new Date().toLocaleDateString("es-AR")} · Tiempo de trabajo: ${fmt(S.activeMs)} min`, "");
    L.push("MOMENTO 1 · LABORATORIO DE PROMPTS", `Misión: ${misionTxt()}`);
    RONDAS.forEach(R => { const d = r1[R.id] || {}; L.push(`\n[${R.nombre}]`, `Prompt: ${d.prompt || "—"}`, `Respuesta (fragmento): ${(d.resp || "—").slice(0, 500)}`, `Útil ${d.util ?? "-"} · Precisa ${d.precisa ?? "-"} · Clara ${d.clara ?? "-"} · Confianza ${sem[d.semaforo] || "-"}`, `Observación: ${d.nota || "—"}`); });
    L.push("", `Ingrediente que más influyó: ${S.m1.final.ingrediente || "—"}`, `Mejora sugerida por mi compañero/a: ${S.m1.final.mejora || "—"}`, "");
    L.push("MOMENTO 2 · APRENDER CON LA IA", `Oraciones que subrayé: ${S.m2.subrayado.length}`, `Reflexión sobre el prompt trampa: ${S.m2.trampa || "—"}`);
    TUTORES.forEach(T => { const d = S.m2.tutores[T.id]; if (d?.ok) L.push(`\n[${T.nombre}] ${d.aprendi} (la IA me hizo pensar: ${d.pensar}/100)`); });
    L.push("", `Mi explicación sin red: ${S.m2.explicacion || "—"}`, `Ideas clave logradas: ${S.m2.ideas.length}/${TEXTO.ideasClave.length}`, `Pregunta de mi compañero/a: ${S.m2.vecino || "—"}`, "");
    const c = S.m3.canvas, s = S.m3.slot || {};
    L.push("MOMENTO 3 · TANQUE DE INVERSORES IA", `Startup: ${c.nombre} — "${c.slogan}"`, `Problema: ${s.problema || "—"} · Cliente: ${s.cliente || "—"} · IA: ${s.superpoder?.t || "—"} · Restricción: ${s.restriccion || "—"}`, `Solución: ${c.solucion}`, `Datos y privacidad: ${c.datos}`, `Modelo de ingresos: ${c.ingresos}`, `Mejora tras la crítica del inversor IA: ${c.mejora}`, `Inversión conseguida: ${money(S.m3.inversion)}`, `Consejo del inversor: ${S.m3.consejo || "—"}`);
    return L.join("\n");
  }
  function renderLog() {
    current = null;
    const qa = (q, a) => `<p class="q">${esc(q)}</p><p class="a">${esc(a || "—")}</p>`;
    const r1 = S.m1.rondas, sem = { verde: "🟢 Confiable", amarillo: "🟡 Verificar", rojo: "🔴 No sirve" };
    const c = S.m3.canvas, s = S.m3.slot || {};
    $("#log-body").innerHTML = `
      <div class="panel log">
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
          <img src="assets/img/bitacora.svg" alt="" style="width:70px">
          <div class="grow"><p class="kicker">Bitácora PromptLab</p><h2>${esc(S.name)}</h2><small>${esc(CONFIG.curso)} · ${new Date().toLocaleDateString("es-AR")} · Tiempo de trabajo: ${fmt(S.activeMs)} min</small></div>
          <div>${BADGES.map(b => S.done[b.id] ? `<span class="medal">${b.t}</span>` : "").join("")}</div>
        </div>
        <div class="row no-print">
          <button class="btn primary" id="lprint">🖨️ Imprimir / Guardar PDF</button>
          <button class="btn lime" id="lcopy">📋 Copiar texto para Classroom</button>
          ${S.done.m3 ? `<button class="btn" id="lcard">🃏 Descargar tarjeta</button>` : ""}
          <button class="btn ghost" id="lback">← Mapa</button>
        </div>
        <section><h3>🧪 Momento 1 · Laboratorio de prompts</h3>${qa("Misión", misionTxt())}
          ${RONDAS.map(R => { const d = r1[R.id]; return d ? `<p class="q">${R.emoji} ${esc(R.nombre)} — útil ${d.util} · precisa ${d.precisa} · clara ${d.clara} · ${sem[d.semaforo] || ""}</p><p class="a">Prompt: ${esc(d.prompt)}\n\nObservación: ${esc(d.nota)}</p>` : ""; }).join("")}
          ${qa("¿Qué ingrediente hizo más diferencia?", S.m1.final.ingrediente)}${qa("Mejora sugerida por mi compañero/a", S.m1.final.mejora)}</section>
        <section><h3>🦉 Momento 2 · Aprender con la IA</h3>
          ${qa("¿Quién hace el trabajo de pensar con el prompt trampa?", S.m2.trampa)}
          ${TUTORES.filter(T => S.m2.tutores[T.id]?.ok).map(T => qa(`${T.emoji} ${T.nombre} (me hizo pensar: ${S.m2.tutores[T.id].pensar}/100)`, S.m2.tutores[T.id].aprendi)).join("")}
          ${qa(`Mi explicación sin red (${S.m2.ideas.length}/${TEXTO.ideasClave.length} ideas clave)`, S.m2.explicacion)}${qa("Lo que me preguntó mi compañero/a", S.m2.vecino)}</section>
        <section><h3>🦈 Momento 3 · Tanque de Inversores IA</h3>
          ${qa("Startup", c.nombre ? `${c.nombre} — “${c.slogan}”` : "")}${qa("Desafío", s.problema ? `${s.problema} · Cliente: ${s.cliente} · IA: ${s.superpoder?.t} · Restricción: ${s.restriccion}` : "")}
          ${qa("Cómo funciona", c.solucion)}${qa("Datos y privacidad", c.datos)}${qa("Cómo gana dinero", c.ingresos)}${qa("Mejora tras la crítica del inversor IA", c.mejora)}${qa("Inversión y consejo de mi compañero/a", S.done.m3 ? `${money(S.m3.inversion)} — ${S.m3.consejo}` : "")}</section>
      </div>`;
    show("screen-log");
    $("#lprint").onclick = () => window.print();
    $("#lcopy").onclick = () => copy(logText());
    if ($("#lcard")) $("#lcard").onclick = () => { const cv = document.createElement("canvas"); cv.width = 600; cv.height = 840; StartupCard.draw(cv, cardData()).then(() => StartupCard.download(cv, S.m3.canvas.nombre)); };
    $("#lback").onclick = () => enterHub();
  }

  /* ---------- menú ---------- */
  async function menu() {
    const v = await modal(`<h3>⚙️ Opciones</h3><p>Estudiante: <b>${esc(S.name)}</b></p><input type="text" id="tcode" placeholder="Código docente (opcional)" style="text-align:center">
      <p><small>El código docente desbloquea todos los momentos y permite seguir sin acceso a una IA.</small></p>`,
      [{ label: "Cerrar", value: 0 }, { label: "Aplicar código", cls: "primary", value: 1 }, { label: "Borrar mi trabajo", cls: "coral", value: 2 }]);
    if (v === 1) {
      if (norm($("#tcode").value) === norm(CONFIG.codigoDocente)) { S.unlockAll = true; S.noAI = true; save(); toast("✅ Modo docente: momentos desbloqueados y respuestas de IA opcionales."); if (!current) renderHub(); }
      else toast("Código incorrecto.");
    }
    if (v === 2) { const ok = await modal(`<h3>¿Seguro?</h3><p>Se borra todo lo que escribiste en esta compu.</p>`, [{ label: "Cancelar", value: false }, { label: "Sí, borrar", cls: "coral", value: true }]); if (ok) { wipe(); location.reload(); } }
  }

  /* ---------- arranque ---------- */
  $("#btn-menu").onclick = menu;
  $("#btn-home").onclick = () => enterHub();
  $("#btn-hub").onclick = () => enterHub();
  $("#foot-course").textContent = CONFIG.curso;
  setInterval(tick, 1000);
  window.addEventListener("beforeunload", () => { if (S.name) { tick(); save(); } });
  document.addEventListener("visibilitychange", () => { if (S.name) { tick(); save(); } });
  initWelcome();
})();
