/* =========================================================
   PROMPTLAB · motor de la página (multilingüe ES / FR / EN)
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const T = (k, v) => I18N.t(k, v);
  const C = () => I18N.content;               // contenidos del idioma actual
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();
  const titleCase = (s) => s.toLowerCase().replace(/(^|\s|-)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  const fmt = (ms) => { const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000); return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"); };
  const words = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;
  const money = (n) => "$" + Number(n || 0).toLocaleString(I18N.locale);
  const cursoText = () => (I18N.lang !== "es" && CONFIG.cursoI18n && CONFIG.cursoI18n[I18N.lang]) || CONFIG.curso;
  const agenda = (id) => C().AGENDA.find(a => a.id === id);

  /* ---------- estado ---------- */
  const fresh = () => ({
    name: "", activeMs: 0, timeIn: { m1: 0, m2: 0, m3: 0 }, done: {}, unlockAll: false, noAI: false,
    m1: { step: 0, mision: null, receta: { rol: "", tarea: "", contexto: "", formato: "" }, rondas: {}, final: { ingrediente: "", mejora: "" } },
    m2: { step: 0, subrayado: [], hlLang: "", trampa: "", recuerdo: 30, tutores: {}, explicacion: "", ideas: [], vecino: "", revelado: false },
    m3: { step: 0, slot: null, spins: 0, canvas: { nombre: "", slogan: "", solucion: "", datos: "", ingresos: "", mejora: "" }, socios: {}, inversion: 500000, consejo: "" }
  });
  let S = fresh();
  let current = null; // "m1" | "m2" | "m3"
  let screen = "screen-welcome";
  let openTutorId = null;
  function save() { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(S)); } catch (e) {} }
  function load() {
    try {
      const r = localStorage.getItem(CONFIG.storageKey); if (!r) return null;
      const d = JSON.parse(r); const f = fresh();
      const out = { ...f, ...d, m1: { ...f.m1, ...d.m1 }, m2: { ...f.m2, ...d.m2 }, m3: { ...f.m3, ...d.m3 }, timeIn: { ...f.timeIn, ...d.timeIn } };
      migrateSlot(out); return out;
    } catch (e) { return null; }
  }
  function wipe() { try { localStorage.removeItem(CONFIG.storageKey); } catch (e) {} }

  /* La máquina guarda ÍNDICES (así se muestra en cualquier idioma).
     Migra partidas guardadas con la versión anterior (textos en español). */
  function migrateSlot(st) {
    const s = st.m3.slot;
    if (!s || typeof s.p === "number") return;
    const M = PL_ES.TRAGAMONEDAS, idx = (a, v) => Math.max(0, a.indexOf(v));
    st.m3.slot = { p: idx(M.problema, s.problema), c: idx(M.cliente, s.cliente), s: Math.max(0, M.superpoder.findIndex(x => x.t === s.superpoder?.t)), r: idx(M.restriccion, s.restriccion) };
  }
  const slotObj = () => { const s = S.m3.slot, M = C().TRAGAMONEDAS; return s ? { problema: M.problema[s.p], cliente: M.cliente[s.c], superpoder: M.superpoder[s.s], restriccion: M.restriccion[s.r] } : null; };

  /* ---------- utilidades de interfaz ---------- */
  function show(id) {
    screen = id;
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    $("#topbar").classList.toggle("hidden", id === "screen-welcome");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toast(msg, ms = 2800) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), ms); }
  function modal(html, buttons) {
    buttons = buttons || [{ label: T("g.ok"), cls: "primary" }];
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
    try { await navigator.clipboard.writeText(text); toast(T("g.copied")); return; } catch (e) {}
    const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast(T("g.copied")); } catch (e) { toast(T("g.copyFail")); }
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
      const sug = agenda(current).min * 60000, used = S.timeIn[current] || 0;
      const el = $("#stage-timer"); const rem = sug - used;
      el.textContent = rem >= 0 ? T("t.left", { t: fmt(rem) }) : T("t.over", { t: fmt(-rem) });
      el.classList.toggle("over", rem < 0);
    }
  }

  /* ---------- topbar ---------- */
  const BADGES = ["m1", "m2", "m3"];
  const badge = (id) => T("badge." + id);
  function renderTop() {
    $("#top-name").textContent = S.name || "—";
    $("#top-badges").innerHTML = BADGES.map(b => `<span class="badge ${S.done[b] ? "got" : ""}">${badge(b)}</span>`).join("");
  }
  function renderStatic() {
    $("#foot").innerHTML = T("foot", { curso: esc(cursoText()) });
    // tarjetas de la portada con los minutos de la agenda
    ["m1", "m2", "m3"].forEach(m => { const el = $(`#mc-${m}-min`); if (el) el.textContent = agenda(m).min + " min"; });
  }

  /* ---------- bienvenida ---------- */
  let savedGame = null;
  function initWelcome() {
    savedGame = load();
    if (savedGame && savedGame.name) {
      $("#resume").classList.remove("hidden"); $("#form-name").classList.add("hidden");
      $("#resume-text").innerHTML = T("w.resume", { name: esc(savedGame.name) });
      $("#btn-resume").onclick = () => { S = savedGame; enterHub(); };
      $("#btn-new").onclick = async () => { const ok = await modal(`<h3>${T("w.newTitle")}</h3><p>${T("w.newText", { name: esc(savedGame.name) })}</p>`, [{ label: T("g.cancel"), value: false }, { label: T("g.yesDelete"), cls: "coral", value: true }]); if (ok) { wipe(); location.reload(); } };
    }
    $("#form-name").addEventListener("submit", e => {
      e.preventDefault();
      const raw = $("#input-name").value.replace(/\s+/g, " ").trim();
      if (raw.length < 3 || !/\p{L}{2,}/u.test(raw)) return toast(T("w.nameBad"));
      S = fresh(); S.name = titleCase(raw); save(); enterHub(true);
    });
  }

  /* ---------- hub ---------- */
  const MOM = {
    m1: { n: 1, icon: "assets/img/m1.svg", steps: 6 },
    m2: { n: 2, icon: "assets/img/m2.svg", steps: 4 },
    m3: { n: 3, icon: "assets/img/m3.svg", steps: 5 }
  };
  const unlocked = (m) => S.unlockAll || m === "m1" || (m === "m2" && S.done.m1) || (m === "m3" && S.done.m2);

  async function enterHub(first = false) {
    current = null; openTutorId = null; renderTop(); renderHub(); show("screen-hub");
    if (first) await modal(`<img src="assets/img/nova.svg" alt=""><h3>${T("hub.hello", { name: esc(S.name.split(" ")[0]) })}</h3><p>${T("hub.helloP")}</p><p><small>${T("hub.helloS")}</small></p>`, [{ label: T("hub.go"), cls: "primary" }]);
  }
  function renderHub() {
    const n = ["m1", "m2", "m3"].filter(m => S.done[m]).length;
    $("#hub-bubble").innerHTML = `<b>Nova:</b> ${T("hub.lines")[n]}`;
    const nowIdx = n + 1;
    $("#agenda").innerHTML = C().AGENDA.map((a, i) => `<div class="${i < nowIdx ? "done" : i === nowIdx ? "now" : ""}" style="flex:${a.min}">${esc(a.nombre.split(" · ")[0])} · ${a.min}′</div>`).join("");
    $("#hub-grid").innerHTML = ["m1", "m2", "m3"].map(m => {
      const st = S.done[m] ? "done" : unlocked(m) ? "open" : "locked";
      const lab = T("hub." + st);
      return `<div class="hub-card ${st}" data-m="${m}" tabindex="0" role="button"><span class="state">${lab}</span><img src="${MOM[m].icon}" alt=""><h3>${MOM[m].n} · ${esc(T(m + ".t"))}</h3><p>${esc(T(m + ".d"))}</p><p><b>${T("hub.minutes", { n: agenda(m).min })}</b></p></div>`;
    }).join("");
    $$(".hub-card").forEach(c => {
      const go = () => { const m = c.dataset.m; if (!unlocked(m)) return toast(T("hub.lockedToast")); openMoment(m); };
      c.onclick = go; c.onkeydown = e => { if (e.key === "Enter") go(); };
    });
    let fin = $("#hub-final");
    if (!fin) { fin = document.createElement("div"); fin.id = "hub-final"; fin.className = "panel hub-final"; $("#screen-hub").appendChild(fin); }
    fin.innerHTML = `<img src="assets/img/bitacora.svg" alt="" style="width:64px"><div class="grow"><h3 style="margin:0">${T("hub.log")}</h3><small>${T("hub.logS")}</small></div><button class="btn ${n === 3 ? "lime" : ""}" id="btn-log">${T("hub.logBtn")}</button>`;
    $("#btn-log").onclick = () => renderLog();
  }

  /* ---------- momentos ---------- */
  function stageHead(m) {
    $("#stage-icon").src = MOM[m].icon;
    $("#stage-kicker").textContent = T("st.kicker", { n: MOM[m].n, min: agenda(m).min });
    $("#stage-title").textContent = T(m + ".t");
  }
  function openMoment(m) {
    current = m; openTutorId = null;
    stageHead(m);
    show("screen-stage"); tick();
    RENDER[m]();
  }
  function steps(m) {
    const st = S[m].step, names = T(m + ".steps");
    $("#stage-steps").innerHTML = names.map((s, i) => `<span class="step ${i < st ? "done" : i === st ? "now" : ""}">${s}</span>`).join("");
  }
  function go(m, step) { S[m].step = step; openTutorId = null; save(); RENDER[m](); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function finish(m, msg) {
    S.done[m] = true; save(); renderTop(); confetti();
    await modal(`<img src="assets/img/nova.svg" alt=""><h3>${T("fin.title", { n: MOM[m].n })}</h3><p>${T("fin.badge")}</p><p><span class="medal">${badge(m)}</span></p><p>${msg}</p>`, [{ label: T("fin.back"), cls: "primary" }]);
    enterHub();
  }
  const body = () => $("#stage-body");

  /* ================= MOMENTO 1 ================= */
  // El medidor reconoce los ingredientes escritos en CUALQUIERA de los 3 idiomas
  const allLang = (key) => I18N.langs.map(l => I18N.contentOf(l)[key]);
  function detect(text) {
    const sets = allLang("INGREDIENTES");
    return C().INGREDIENTES.filter((ing, i) => sets.some(set => set[i] && set[i].re.test(text))).map(i => i.id);
  }
  function privacy(text) {
    const sets = allLang("DATOS_SENSIBLES");
    return C().DATOS_SENSIBLES.filter((d, i) => sets.some(set => set[i] && set[i].re.test(text))).map(d => d.msg);
  }
  function meterHTML() { return `<div class="meter" id="meter">${C().INGREDIENTES.map(i => `<span class="ing" data-i="${i.id}">${i.emoji} ${esc(i.nombre)}</span>`).join("")}</div><div class="meter-bar"><div id="meter-fill"></div></div><div class="privacy-alert" id="priv"></div>`; }
  function updateMeter(text) {
    const on = detect(text);
    $$("#meter .ing").forEach(el => el.classList.toggle("on", on.includes(el.dataset.i)));
    $("#meter-fill").style.width = Math.round(on.length / C().INGREDIENTES.length * 100) + "%";
    const p = privacy(text);
    $("#priv").textContent = p.length ? T("m1.privacy", { list: p.join(", ") }) : "";
    return { on, p };
  }
  const misionTxt = () => { const m = C().MISIONES.find(x => x.id === S.m1.mision); return m ? `${m.emoji} ${m.titulo}: ${m.desc}` : ""; };
  const recetaPrompt = () => { const r = S.m1.receta; return [r.rol, r.tarea, r.contexto, r.formato].map(s => s.trim()).filter(Boolean).join(" "); };

  function renderM1() {
    steps("m1");
    const st = S.m1.step;
    if (st === 0) {
      body().innerHTML = `<div class="panel">
        <h3>${T("m1.chooseT")}</h3>
        <p>${T("m1.chooseP")}</p>
        <div class="missions">${C().MISIONES.map(m => `<button class="mission ${S.m1.mision === m.id ? "sel" : ""}" data-id="${m.id}"><span class="e">${m.emoji}</span><b>${esc(m.titulo)}</b><span>${esc(m.desc)}</span></button>`).join("")}</div>
        <div class="callout">${T("m1.openAI")}</div>${aiLinks()}
        <div class="row"><button class="btn primary" id="next" ${S.m1.mision ? "" : "disabled"}>${T("m1.start")}</button></div></div>`;
      $$(".mission").forEach(b => b.onclick = () => { S.m1.mision = b.dataset.id; save(); renderM1(); });
      $("#next").onclick = () => go("m1", 1);
      return;
    }
    if (st >= 1 && st <= 4) return renderRonda(C().RONDAS[st - 1], st);
    return renderCompare();
  }

  function renderRonda(R, st) {
    const data = (S.m1.rondas[R.id] ??= { prompt: "", resp: "", util: 3, precisa: 3, clara: 3, semaforo: "", nota: "" });
    if (!data.prompt && (R.id === "ejemplos" || R.id === "pasos")) data.prompt = S.m1.rondas.pasos?.prompt || S.m1.rondas.ejemplos?.prompt || recetaPrompt();
    const prev = st > 1 ? C().RONDAS[st - 2] : null;
    body().innerHTML = `
      <div class="panel">
        <p class="kicker">${T("m1.round", { n: st })} · ${esc(misionTxt())}</p>
        <h3>${R.emoji} ${esc(R.nombre)}</h3>
        <p>${esc(R.consigna)}</p>
        ${R.receta ? `
          <div class="recipe">
            <div class="r"><label>${T("rc.rol")}</label><input type="text" data-bind="m1.receta.rol" placeholder="${esc(T("rc.rolPh"))}"></div>
            <div class="r"><label>${T("rc.tarea")}</label><input type="text" data-bind="m1.receta.tarea" placeholder="${esc(T("rc.tareaPh"))}"></div>
            <div class="r"><label>${T("rc.contexto")}</label><input type="text" data-bind="m1.receta.contexto" placeholder="${esc(T("rc.contextoPh"))}"></div>
            <div class="r"><label>${T("rc.formato")}</label><input type="text" data-bind="m1.receta.formato" placeholder="${esc(T("rc.formatoPh"))}"></div>
          </div>
          <div class="prompt-preview" id="preview"></div>` : `
          <textarea id="ptext" data-bind="m1.rondas.${R.id}.prompt" placeholder="${esc(R.pistas || "")}"></textarea>
          ${R.maxPalabras ? `<div class="wordcount" id="wc"></div>` : ""}
          ${R.pistas && !R.maxPalabras ? `<small>💡 ${esc(R.pistas)}</small>` : ""}`}
        ${meterHTML()}
        <div class="row"><button class="btn lime" id="copy">${T("g.copyPrompt")}</button>${aiLinks()}</div>
      </div>

      <div class="panel">
        <h3>${T("m1.respT")}</h3>
        <p>${T("m1.respP")}</p>
        <textarea data-bind="m1.rondas.${R.id}.resp" placeholder="${esc(T("m1.respPh"))}"></textarea>
      </div>

      <div class="panel">
        <h3>${T("m1.evalT")}</h3>
        <div class="rate"><span>${T("m1.util")}</span><input type="range" min="1" max="5" data-bind="m1.rondas.${R.id}.util"><b id="v-util">${data.util}</b></div>
        <div class="rate"><span>${T("m1.precisa")}</span><input type="range" min="1" max="5" data-bind="m1.rondas.${R.id}.precisa"><b id="v-precisa">${data.precisa}</b></div>
        <div class="rate"><span>${T("m1.clara")}</span><input type="range" min="1" max="5" data-bind="m1.rondas.${R.id}.clara"><b id="v-clara">${data.clara}</b></div>
        <p style="margin:14px 0 6px">${T("m1.traffic")}</p>
        <div class="traffic">
          <button data-v="verde">${T("sem.verde")}</button><button data-v="amarillo">${T("sem.amarillo")}</button><button data-v="rojo">${T("sem.rojo")}</button>
        </div>
        <label style="margin-top:14px">${prev ? T("m1.noteCmp", { prev: esc(prev.nombre) }) : T("m1.noteFirst")}</label>
        <textarea data-bind="m1.rondas.${R.id}.nota" placeholder="${esc(T("m1.notePh"))}"></textarea>
        <div class="row">
          ${st > 1 ? `<button class="btn ghost" id="back">${T("m1.prev")}</button>` : ""}
          <button class="btn primary" id="next">${st < 4 ? T("m1.next") : T("m1.compare")}</button>
        </div>
      </div>`;
    bindAll(body());
    const getPrompt = () => R.receta ? recetaPrompt() : (S.m1.rondas[R.id].prompt || "");
    const refresh = () => {
      const t = getPrompt();
      if (R.receta) { S.m1.rondas[R.id].prompt = t; $("#preview").textContent = t || T("rc.preview"); }
      if (R.maxPalabras) { const w = words(t); const el = $("#wc"); el.textContent = T("m1.words", { n: w, m: R.maxPalabras }); el.classList.toggle("bad", w > R.maxPalabras); }
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
      const conds = [[w >= 2, T("v.write")], [!privacy(t).length, T("v.privacy")]];
      if (R.maxPalabras) conds.push([w <= R.maxPalabras, T("v.max", { m: R.maxPalabras })]);
      if (R.receta) conds.push([["rol", "tarea", "contexto", "formato"].every(x => on.includes(x)), T("v.recipe")]);
      if (R.requiere) conds.push([on.includes(R.requiere), R.requiere === "ejemplos" ? T("v.examples") : T("v.steps")]);
      return conds;
    };
    $("#copy").onclick = () => { if (need(validPrompt())) copy(getPrompt()); };
    if ($("#back")) $("#back").onclick = () => go("m1", st - 1);
    $("#next").onclick = () => {
      const d = S.m1.rondas[R.id];
      if (!need([...validPrompt(), [respOK(d.resp), T("v.resp")], [!!d.semaforo, T("v.traffic")], [String(d.nota).trim().length >= 15, T("v.note")]])) return;
      go("m1", st + 1);
    };
  }

  function renderCompare() {
    const avg = (r) => { const d = S.m1.rondas[r.id] || {}; return ((+d.util || 0) + (+d.precisa || 0) + (+d.clara || 0)) / 3; };
    const sem = { verde: "🟢", amarillo: "🟡", rojo: "🔴" };
    body().innerHTML = `
      <div class="panel">
        <h3>${T("cmp.t")}</h3>
        <p>${T("cmp.p")}</p>
        <div class="compare">${C().RONDAS.map(r => `<div class="col"><b>${avg(r).toFixed(1)}</b><div class="bar" data-h="${avg(r) / 5 * 100}"></div><small>${r.emoji} ${esc(r.nombre.split(" (")[0])}<br>${sem[S.m1.rondas[r.id]?.semaforo] || ""}</small></div>`).join("")}</div>
      </div>
      <div class="panel">
        <h3>${T("cmp.refT")}</h3>
        <label>${T("cmp.ing")}</label>
        <textarea data-bind="m1.final.ingrediente" placeholder="${esc(T("cmp.ingPh"))}"></textarea>
        <div class="callout neigh">${T("cmp.neigh")}</div>
        <label>${T("cmp.mej")}</label>
        <textarea data-bind="m1.final.mejora" placeholder="${esc(T("cmp.mejPh"))}"></textarea>
        <div class="row"><button class="btn ghost" id="back">${T("cmp.back")}</button><button class="btn primary" id="next">${T("cmp.finish")}</button></div>
      </div>`;
    bindAll(body());
    requestAnimationFrame(() => setTimeout(() => $$(".compare .bar").forEach(b => b.style.height = b.dataset.h + "%"), 60));
    $("#back").onclick = () => go("m1", 4);
    $("#next").onclick = () => {
      if (!need([[S.m1.final.ingrediente.trim().length >= 20, T("v.ing")], [S.m1.final.mejora.trim().length >= 10, T("v.mej")]])) return;
      finish("m1", T("fin.m1"));
    };
  }

  /* ================= MOMENTO 2 ================= */
  const textoPlano = () => C().TEXTO.titulo + "\n\n" + C().TEXTO.parrafos.join("\n\n");
  const SPLIT = /(?<=[.!?]["”»]?)\s+(?=[A-ZÁÉÍÓÚÑÀÂÇÈÊÎÔÛ¿¡“"«])/;
  function readingHTML() {
    let k = 0;
    const hl = S.m2.hlLang === I18N.lang ? S.m2.subrayado : [];
    const X = C().TEXTO;
    return `<div class="reading" id="reading"><h3>${esc(X.titulo)}</h3>${X.parrafos.map(p => `<p>${p.split(SPLIT).map(s => `<span class="s ${hl.includes(k) ? "hl" : ""}" data-k="${k++}">${esc(s)} </span>`).join("")}</p>`).join("")}</div>`;
  }
  function renderM2() {
    steps("m2");
    const st = S.m2.step;
    if (st === 0) {
      // los subrayados dependen del idioma del texto: si cambió, se empieza de nuevo
      if (S.m2.hlLang !== I18N.lang) { S.m2.subrayado = []; S.m2.hlLang = I18N.lang; save(); }
      body().innerHTML = `
        <div class="callout">${T("m2.readHint")}</div>
        ${readingHTML()}
        <div class="row"><span class="wordcount" id="hlc"></span><button class="btn primary" id="next">${T("m2.read")}</button></div>`;
      const upd = () => { $("#hlc").textContent = T("m2.hlCount", { n: S.m2.subrayado.length }); };
      $$("#reading .s").forEach(s => s.onclick = () => {
        const k = +s.dataset.k, i = S.m2.subrayado.indexOf(k);
        if (i >= 0) S.m2.subrayado.splice(i, 1); else { if (S.m2.subrayado.length >= 5) return toast(T("m2.hlMax")); S.m2.subrayado.push(k); }
        s.classList.toggle("hl"); save(); upd();
      });
      upd();
      $("#next").onclick = () => { if (need([[S.m2.subrayado.length >= 3, T("v.hl")]])) go("m2", 1); };
      return;
    }
    if (st === 1) {
      body().innerHTML = `
        <div class="panel">
          <h3>${T("tr.t")}</h3>
          <p>${T("tr.p")}</p>
          <div class="vs">
            <div class="trap"><b>${T("tr.trap")}</b><p class="prompt-preview" style="background:#5a1f1a">${esc(C().PROMPT_TRAMPA)} [${T("tr.text")}]</p><small>${T("tr.trapS")}</small></div>
            <div class="good"><b>${T("tr.good")}</b><p class="prompt-preview" style="background:#0f4d3a">${T("tr.goodP")}</p><small>${T("tr.goodS")}</small></div>
          </div>
          <div class="callout">${T("tr.meaning")}</div>
          <label>${T("tr.q1")}</label>
          <div class="spectrum"><span>${T("tr.none")}</span><input type="range" min="0" max="100" data-bind="m2.recuerdo"><span>${T("tr.all")}</span></div>
          <label style="margin-top:12px">${T("tr.q2")}</label>
          <textarea data-bind="m2.trampa" placeholder="${esc(T("tr.ph"))}"></textarea>
          <div class="row"><button class="btn ghost" id="back">${T("tr.back")}</button><button class="btn primary" id="next">${T("tr.next")}</button></div>
        </div>`;
      bindAll(body());
      $("#back").onclick = () => go("m2", 0);
      $("#next").onclick = () => { if (need([[S.m2.trampa.trim().length >= 20, T("v.trampa")]])) go("m2", 2); };
      return;
    }
    if (st === 2) return renderTutores();
    return renderSinRed();
  }

  function renderTutores() {
    const n = Object.values(S.m2.tutores).filter(t => t.ok).length;
    body().innerHTML = `
      <div class="callout">${T("tu.hint")}</div>
      <div class="tutor-grid">${C().TUTORES.map(t => `<div class="tutor ${S.m2.tutores[t.id]?.ok ? "done" : ""}"><span class="e">${t.emoji}</span><b>${esc(t.nombre)}</b><p>${esc(t.para)}</p><button class="btn small ${S.m2.tutores[t.id]?.ok ? "" : "primary"}" data-t="${t.id}">${S.m2.tutores[t.id]?.ok ? T("tu.edit") : T("tu.use")}</button></div>`).join("")}</div>
      <div id="tutor-work"></div>
      <div class="row"><button class="btn ghost" id="back">${T("tu.back")}</button><span class="wordcount">${T("tu.count", { n })}</span><button class="btn primary" id="next" ${n >= 3 ? "" : "disabled"}>${T("tu.next")}</button></div>`;
    $$("[data-t]").forEach(b => b.onclick = () => openTutor(b.dataset.t));
    $("#back").onclick = () => go("m2", 1);
    $("#next").onclick = () => go("m2", 3);
    if (openTutorId) openTutor(openTutorId, true);
  }
  function openTutor(id, quiet = false) {
    openTutorId = id;
    const TU = C().TUTORES.find(t => t.id === id);
    const d = (S.m2.tutores[id] ??= { aprendi: "", pensar: 50, ok: false });
    const full = TU.prompt.replace("{TEXTO}", textoPlano());
    $("#tutor-work").innerHTML = `
      <div class="panel" style="margin-top:16px" id="tw">
        <h3>${TU.emoji} ${esc(TU.nombre)}</h3>
        <div class="prompt-preview">${esc(TU.prompt.replace("{TEXTO}", "« " + C().TEXTO.titulo + " … " + T("tu.full") + " »"))}</div>
        <div class="row"><button class="btn lime" id="tcopy">${T("tu.copy")}</button>${aiLinks()}</div>
        <div class="callout warn">${T("tu.warn")}</div>
        <label>${T("tu.learned")}</label>
        <textarea data-bind="m2.tutores.${id}.aprendi" placeholder="${esc(T("tu.learnedPh"))}"></textarea>
        <label style="margin-top:10px">${T("tu.how")}</label>
        <div class="spectrum"><span>${T("tu.gave")}</span><input type="range" min="0" max="100" data-bind="m2.tutores.${id}.pensar"><span>${T("tu.think")}</span></div>
        <div class="row"><button class="btn primary" id="tsave">${T("tu.save")}</button></div>
      </div>`;
    bindAll($("#tw"));
    if (!quiet) $("#tw").scrollIntoView({ behavior: "smooth", block: "start" });
    $("#tcopy").onclick = () => copy(full);
    $("#tsave").onclick = () => {
      if (!need([[d.aprendi.trim().length >= 25, T("v.tutor")]])) return;
      d.ok = true; openTutorId = null; save();
      if (d.pensar < 40) toast(T("tu.tip"), 4200); else toast(T("tu.saved"));
      renderTutores();
    };
  }
  function renderSinRed() {
    const rev = S.m2.revelado;
    const X = C().TEXTO;
    body().innerHTML = `
      <div class="panel">
        <h3>${T("sr.t")}</h3>
        <p>${rev ? T("sr.pRev") : T("sr.p")}</p>
        <textarea data-bind="m2.explicacion" ${rev ? "readonly" : ""} style="min-height:150px" placeholder="${esc(T("sr.ph"))}"></textarea>
        <small id="ec"></small>
        ${rev ? "" : `<div class="row"><button class="btn coral" id="reveal">${T("sr.reveal")}</button></div>`}
      </div>
      ${readingHTML().replace('class="reading"', `class="reading ${rev ? "" : "blur"}"`)}
      ${rev ? `
      <div class="panel" style="margin-top:16px">
        <h3>${T("sr.selfT")}</h3>
        <p>${T("sr.selfP")}</p>
        <div class="checks">${X.ideasClave.map((t, i) => `<label class="${S.m2.ideas.includes(i) ? "on" : ""}"><input type="checkbox" data-i="${i}" ${S.m2.ideas.includes(i) ? "checked" : ""}> ${esc(t)}</label>`).join("")}</div>
        <p class="money" id="score" style="font-size:22px"></p>
        <div class="callout neigh">${T("sr.neigh")}</div>
        <label>${T("sr.q")}</label>
        <textarea data-bind="m2.vecino" placeholder="${esc(T("sr.qPh"))}"></textarea>
        <div class="row"><button class="btn primary" id="next">${T("sr.finish")}</button></div>
      </div>` : ""}`;
    bindAll(body());
    const ec = () => { const el = $("#ec"); if (el) el.textContent = T("sr.chars", { n: S.m2.explicacion.trim().length }); };
    $$("[data-bind='m2.explicacion']").forEach(el => el.addEventListener("bound", ec)); ec();
    if (!rev) {
      $("#reveal").onclick = () => { if (!need([[S.m2.explicacion.trim().length >= 150, T("v.expl")]])) return; S.m2.revelado = true; save(); renderSinRed(); };
      return;
    }
    const sc = () => { const n = S.m2.ideas.length; $("#score").textContent = T("sr.score", { n, t: X.ideasClave.length }) + " " + (n >= 5 ? T("sr.s5") : n >= 3 ? T("sr.s3") : T("sr.s0")); };
    $$(".checks input").forEach(c => c.onchange = () => {
      const i = +c.dataset.i; S.m2.ideas = c.checked ? [...new Set([...S.m2.ideas, i])] : S.m2.ideas.filter(x => x !== i);
      c.parentElement.classList.toggle("on", c.checked); save(); sc();
    });
    sc();
    $("#next").onclick = () => { if (!need([[S.m2.vecino.trim().length >= 10, T("v.vecino")]])) return; finish("m2", T("fin.m2")); };
  }

  /* ================= MOMENTO 3 ================= */
  const slotTxt = () => { const s = slotObj(); return s ? { P: s.problema, C: s.cliente, S: `${s.superpoder.t} (${s.superpoder.d})`, R: s.restriccion } : null; };
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const canvasTxt = () => { const c = S.m3.canvas, s = slotObj() || {}; return T("cv.txt", { nombre: c.nombre, slogan: c.slogan, problema: s.problema || "", cliente: s.cliente || "", solucion: c.solucion, datos: c.datos, ingresos: c.ingresos }); };
  function socioPrompt(id) {
    const t = slotTxt(); const p = C().SOCIOS_IA.find(s => s.id === id).prompt;
    return p.replaceAll("{P}", t.P).replaceAll("{C}", t.C).replaceAll("{S}", t.S).replaceAll("{R}", t.R).replaceAll("{CANVAS}", canvasTxt());
  }
  let pitchTimer = null;
  function renderM3() {
    steps("m3");
    clearInterval(pitchTimer);
    const st = S.m3.step;
    const M = C().TRAGAMONEDAS;
    if (st === 0) {
      const s = slotObj();
      body().innerHTML = `
        <div class="panel">
          <h3>${T("sl.t")}</h3>
          <p>${T("sl.p", { n: 3 - S.m3.spins })}</p>
          <div class="slot">
            <div class="reel" id="r0"><small>${T("sl.problem")}</small><div>${s ? esc(s.problema) : "?"}</div></div>
            <div class="reel" id="r1"><small>${T("sl.client")}</small><div>${s ? esc(s.cliente) : "?"}</div></div>
            <div class="reel" id="r2"><small>${T("sl.power")}</small><div>${s ? `${s.superpoder.e} ${esc(s.superpoder.t)}<br><span style="font-weight:500;font-size:12px">${esc(s.superpoder.d)}</span>` : "?"}</div></div>
            <div class="reel" id="r3"><small>${T("sl.limit")}</small><div>${s ? esc(s.restriccion) : "?"}</div></div>
          </div>
          <div class="row"><button class="btn coral lever" id="spin" ${s && S.m3.spins >= 3 ? "disabled" : ""}>🎰 ${s ? T("sl.again") : T("sl.spin")}</button>
          <button class="btn primary" id="next" ${s ? "" : "disabled"}>${T("sl.keep")}</button></div>
        </div>`;
      $("#spin").onclick = () => {
        if (S.m3.spins >= 3) return;
        S.m3.spins++;
        const fin = { p: rnd(M.problema.length), c: rnd(M.cliente.length), s: rnd(M.superpoder.length), r: rnd(M.restriccion.length) };
        const reels = [0, 1, 2, 3].map(i => $("#r" + i));
        reels.forEach(r => r.classList.add("spin"));
        const lists = [M.problema, M.cliente, M.superpoder.map(x => x.e + " " + x.t), M.restriccion];
        const iv = setInterval(() => reels.forEach((r, i) => { const d = r.querySelector("div"); if (d) d.textContent = pick(lists[i]); }), 70);
        $("#spin").disabled = true;
        [0, 1, 2, 3].forEach(i => setTimeout(() => { reels[i].classList.remove("spin"); if (i === 3) { clearInterval(iv); S.m3.slot = fin; save(); if (current === "m3" && S.m3.step === 0) renderM3(); } }, 700 + i * 350));
      };
      $("#next").onclick = () => go("m3", 1);
      return;
    }
    if (st === 1) {
      const t = slotTxt();
      body().innerHTML = `
        <div class="callout">${T("so.challenge", { p: esc(t.P), c: esc(t.C), s: esc(t.S), r: esc(t.R) })}</div>
        <div class="socios">${C().SOCIOS_IA.slice(0, 2).map(s => `<div class="tutor ${S.m3.socios[s.id] ? "done" : ""}"><span class="e">${s.emoji}</span><b>${esc(s.nombre)}</b><p>${s.id === "cofundador" ? T("so.cofDesc") : T("so.anaDesc")}</p><button class="btn small primary" data-s="${s.id}">${T("g.copyPrompt")}</button></div>`).join("")}
          <div class="tutor" style="background:#fff6e0"><span class="e">🧠</span><b>${T("so.youT")}</b><p>${T("so.youP")}</p>${aiLinks()}</div></div>
        <div class="panel" style="margin-top:16px">
          <h3>${T("so.canvasT")}</h3>
          <div class="canvas-grid">
            <div><label>${T("so.name")}</label><input type="text" maxlength="28" data-bind="m3.canvas.nombre" placeholder="${esc(T("so.namePh"))}"></div>
            <div><label>${T("so.slogan")}</label><input type="text" maxlength="60" data-bind="m3.canvas.slogan" placeholder="${esc(T("so.sloganPh"))}"></div>
            <div class="full"><label>${T("so.how")}</label><textarea data-bind="m3.canvas.solucion" placeholder="${esc(T("so.howPh"))}"></textarea></div>
            <div><label>${T("so.data")}</label><textarea data-bind="m3.canvas.datos" placeholder="${esc(T("so.dataPh"))}"></textarea></div>
            <div><label>${T("so.money")}</label><textarea data-bind="m3.canvas.ingresos" placeholder="${esc(T("so.moneyPh"))}"></textarea></div>
          </div>
          <div class="row"><button class="btn ghost" id="back">${T("so.back")}</button><button class="btn primary" id="next">${T("so.next")}</button></div>
        </div>`;
      bindAll(body());
      $$("[data-s]").forEach(b => b.onclick = () => { S.m3.socios[b.dataset.s] = true; save(); b.closest(".tutor").classList.add("done"); copy(socioPrompt(b.dataset.s)); });
      $("#back").onclick = () => go("m3", 0);
      $("#next").onclick = () => {
        const c = S.m3.canvas;
        if (!need([[c.nombre.trim().length >= 2, T("v.name")], [c.slogan.trim().length >= 3 && words(c.slogan) <= 8, T("v.slogan")], [c.solucion.trim().length >= 30, T("v.sol")], [c.datos.trim().length >= 15, T("v.data")], [c.ingresos.trim().length >= 8, T("v.money")]])) return;
        go("m3", 2);
      };
      return;
    }
    if (st === 2) {
      body().innerHTML = `
        <div class="panel">
          <h3>${T("in.t")}</h3>
          <p>${T("in.p")}</p>
          <div class="prompt-preview">${esc(socioPrompt("inversor"))}</div>
          <div class="row"><button class="btn lime" id="icopy">${T("in.copy")}</button>${aiLinks()}</div>
          <label style="margin-top:14px">${T("in.q")}</label>
          <textarea data-bind="m3.canvas.mejora" placeholder="${esc(T("in.ph"))}"></textarea>
          <div class="row"><button class="btn ghost" id="back">${T("in.back")}</button><button class="btn primary" id="next">${T("in.next")}</button></div>
        </div>`;
      bindAll(body());
      $("#icopy").onclick = () => { S.m3.socios.inversor = true; save(); copy(socioPrompt("inversor")); };
      $("#back").onclick = () => go("m3", 1);
      $("#next").onclick = () => { if (need([[S.m3.canvas.mejora.trim().length >= 25, T("v.mejora")]])) go("m3", 3); };
      return;
    }
    if (st === 3) {
      body().innerHTML = `
        <div class="panel">
          <h3>${T("pi.t")}</h3>
          <div class="callout neigh">${T("pi.hint", { name: esc(S.m3.canvas.nombre) })}</div>
          <div class="partner">
            <div>
              <div class="big-timer" id="bt">01:00</div>
              <div class="row center"><button class="btn coral" id="start">${T("pi.start")}</button></div>
              <p style="text-align:center"><b>${esc(S.m3.canvas.nombre)}</b> — “${esc(S.m3.canvas.slogan)}”</p>
            </div>
            <div>
              <p>${T("pi.inv", { m: money(1000000) })}</p>
              <input type="range" min="0" max="1000000" step="50000" data-bind="m3.inversion" style="width:100%;accent-color:var(--ok)">
              <p class="money" id="inv"></p>
              <label>${T("pi.advice")}</label>
              <textarea data-bind="m3.consejo" placeholder="${esc(T("pi.advicePh"))}"></textarea>
            </div>
          </div>
          <div class="row"><button class="btn ghost" id="back">${T("pi.back")}</button><button class="btn primary" id="next">${T("pi.next")}</button></div>
        </div>`;
      bindAll(body());
      const inv = () => $("#inv").textContent = money(S.m3.inversion);
      $$("[data-bind='m3.inversion']").forEach(e => e.addEventListener("bound", inv)); inv();
      $("#start").onclick = () => {
        clearInterval(pitchTimer); let s = 60; const bt = $("#bt"); bt.classList.add("go");
        pitchTimer = setInterval(() => { s--; if (!document.body.contains(bt)) return clearInterval(pitchTimer); bt.textContent = "00:" + String(s).padStart(2, "0"); if (s <= 0) { clearInterval(pitchTimer); bt.classList.remove("go"); bt.textContent = T("pi.time"); } }, 1000);
      };
      $("#back").onclick = () => go("m3", 2);
      $("#next").onclick = () => { if (!need([[S.m3.consejo.trim().length >= 10, T("v.advice")]])) return; go("m3", 4); };
      return;
    }
    // st 4: tarjeta
    body().innerHTML = `
      <div class="panel">
        <h3>${T("cd.t")}</h3>
        <p>${T("cd.p")}</p>
        <canvas id="card-canvas" width="600" height="840"></canvas>
        <div class="row center"><button class="btn lime" id="dl">${T("cd.dl")}</button><button class="btn ghost" id="back">${T("cd.back")}</button><button class="btn primary" id="next">${T("cd.finish")}</button></div>
      </div>`;
    StartupCard.draw($("#card-canvas"), cardData());
    $("#dl").onclick = () => StartupCard.download($("#card-canvas"), S.m3.canvas.nombre);
    $("#back").onclick = () => go("m3", 3);
    $("#next").onclick = () => finish("m3", T("fin.m3", { name: esc(S.m3.canvas.nombre), m: money(S.m3.inversion) }));
  }
  const cardData = () => ({ ...S.m3.canvas, fundador: S.name, inversion: S.m3.inversion, slot: slotObj(), tx: T, locale: I18N.locale });

  const RENDER = { m1: renderM1, m2: renderM2, m3: renderM3 };

  /* ================= BITÁCORA ================= */
  const semIcon = { verde: "🟢", amarillo: "🟡", rojo: "🔴" };
  function logText() {
    const L = [];
    const r1 = S.m1.rondas;
    const today = new Date().toLocaleDateString(I18N.locale);
    L.push(T("lg.head", { name: S.name }), `${cursoText()}${CONFIG.institucion ? " · " + CONFIG.institucion : ""}`, T("lg.dateTime", { d: today, t: fmt(S.activeMs) }), "");
    L.push(T("lg.m1").toUpperCase(), `${T("lg.mission")}: ${misionTxt()}`);
    C().RONDAS.forEach(R => { const d = r1[R.id] || {}; L.push(`\n[${R.nombre}]`, `Prompt: ${d.prompt || "—"}`, `${T("lg.resp")}: ${(d.resp || "—").slice(0, 500)}`, T("lg.rates", { u: d.util ?? "-", p: d.precisa ?? "-", c: d.clara ?? "-", s: semIcon[d.semaforo] || "-" }), `${T("lg.note")}: ${d.nota || "—"}`); });
    L.push("", `${T("lg.ing")}: ${S.m1.final.ingrediente || "—"}`, `${T("lg.mej")}: ${S.m1.final.mejora || "—"}`, "");
    L.push(T("lg.m2").toUpperCase(), `${T("lg.hl")}: ${S.m2.subrayado.length}`, `${T("lg.trampa")}: ${S.m2.trampa || "—"}`);
    C().TUTORES.forEach(TU => { const d = S.m2.tutores[TU.id]; if (d?.ok) L.push(`\n[${TU.nombre}] ${d.aprendi} (${T("lg.think", { n: d.pensar })})`); });
    L.push("", `${T("lg.expl")}: ${S.m2.explicacion || "—"}`, `${T("lg.ideas")}: ${S.m2.ideas.length}/${C().TEXTO.ideasClave.length}`, `${T("lg.vecino")}: ${S.m2.vecino || "—"}`, "");
    const c = S.m3.canvas, s = slotObj() || {};
    L.push(T("lg.m3").toUpperCase(), `${T("lg.startup")}: ${c.nombre} — "${c.slogan}"`, T("lg.challenge", { p: s.problema || "—", c: s.cliente || "—", s: s.superpoder?.t || "—", r: s.restriccion || "—" }), `${T("lg.how")}: ${c.solucion}`, `${T("lg.data")}: ${c.datos}`, `${T("lg.money")}: ${c.ingresos}`, `${T("lg.mejora")}: ${c.mejora}`, `${T("lg.inv")}: ${money(S.m3.inversion)}`, `${T("lg.advice")}: ${S.m3.consejo || "—"}`);
    return L.join("\n");
  }
  function renderLog() {
    current = null;
    const qa = (q, a) => `<p class="q">${esc(q)}</p><p class="a">${esc(a || "—")}</p>`;
    const r1 = S.m1.rondas;
    const c = S.m3.canvas, s = slotObj() || {};
    const today = new Date().toLocaleDateString(I18N.locale);
    $("#log-body").innerHTML = `
      <div class="panel log">
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
          <img src="assets/img/bitacora.svg" alt="" style="width:70px">
          <div class="grow"><p class="kicker">${T("lg.kicker")}</p><h2>${esc(S.name)}</h2><small>${esc(cursoText())} · ${T("lg.dateTime", { d: today, t: fmt(S.activeMs) })}</small></div>
          <div>${BADGES.map(b => S.done[b] ? `<span class="medal">${badge(b)}</span>` : "").join("")}</div>
        </div>
        <div class="row no-print">
          <button class="btn primary" id="lprint">${T("lg.print")}</button>
          <button class="btn lime" id="lcopy">${T("lg.copy")}</button>
          ${S.done.m3 ? `<button class="btn" id="lcard">${T("lg.card")}</button>` : ""}
          <button class="btn ghost" id="lback">${T("lg.back")}</button>
        </div>
        <section><h3>🧪 ${T("lg.m1")}</h3>${qa(T("lg.mission"), misionTxt())}
          ${C().RONDAS.map(R => { const d = r1[R.id]; return d ? `<p class="q">${R.emoji} ${esc(R.nombre)} — ${T("lg.ratesShort", { u: d.util, p: d.precisa, c: d.clara })} · ${d.semaforo ? T("lgs." + d.semaforo) : ""}</p><p class="a">Prompt: ${esc(d.prompt)}\n\n${T("lg.note")}: ${esc(d.nota)}</p>` : ""; }).join("")}
          ${qa(T("lg.ingQ"), S.m1.final.ingrediente)}${qa(T("lg.mej"), S.m1.final.mejora)}</section>
        <section><h3>🦉 ${T("lg.m2")}</h3>
          ${qa(T("lg.trampaQ"), S.m2.trampa)}
          ${C().TUTORES.filter(TU => S.m2.tutores[TU.id]?.ok).map(TU => qa(`${TU.emoji} ${TU.nombre} (${T("lg.think", { n: S.m2.tutores[TU.id].pensar })})`, S.m2.tutores[TU.id].aprendi)).join("")}
          ${qa(T("lg.explQ", { n: S.m2.ideas.length, t: C().TEXTO.ideasClave.length }), S.m2.explicacion)}${qa(T("lg.vecino"), S.m2.vecino)}</section>
        <section><h3>🦈 ${T("lg.m3")}</h3>
          ${qa(T("lg.startup"), c.nombre ? `${c.nombre} — “${c.slogan}”` : "")}${qa(T("lg.challengeQ"), s.problema ? T("lg.challenge", { p: s.problema, c: s.cliente, s: s.superpoder?.t, r: s.restriccion }) : "")}
          ${qa(T("lg.how"), c.solucion)}${qa(T("lg.data"), c.datos)}${qa(T("lg.money"), c.ingresos)}${qa(T("lg.mejora"), c.mejora)}${qa(T("lg.invQ"), S.done.m3 ? `${money(S.m3.inversion)} — ${S.m3.consejo}` : "")}</section>
      </div>`;
    show("screen-log");
    $("#lprint").onclick = () => window.print();
    $("#lcopy").onclick = () => copy(logText());
    if ($("#lcard")) $("#lcard").onclick = () => { const cv = document.createElement("canvas"); cv.width = 600; cv.height = 840; StartupCard.draw(cv, cardData()).then(() => StartupCard.download(cv, S.m3.canvas.nombre)); };
    $("#lback").onclick = () => enterHub();
  }

  /* ---------- cambio de idioma en vivo ---------- */
  function onLangChange() {
    renderStatic();
    if (savedGame && savedGame.name) $("#resume-text").innerHTML = T("w.resume", { name: esc(savedGame.name) });
    if (!S.name) return;
    renderTop();
    if (screen === "screen-hub") renderHub();
    if (screen === "screen-stage" && current) { stageHead(current); RENDER[current](); tick(); }
    if (screen === "screen-log") renderLog();
  }

  /* ---------- menú ---------- */
  async function menu() {
    const v = await modal(`<h3>${T("mn.title")}</h3><p>${T("mn.student", { name: esc(S.name) })}</p><input type="text" id="tcode" placeholder="${esc(T("mn.codePh"))}" style="text-align:center">
      <p><small>${T("mn.codeHelp")}</small></p>`,
      [{ label: T("mn.close"), value: 0 }, { label: T("mn.apply"), cls: "primary", value: 1 }, { label: T("mn.erase"), cls: "coral", value: 2 }]);
    if (v === 1) {
      if (norm($("#tcode").value) === norm(CONFIG.codigoDocente)) { S.unlockAll = true; S.noAI = true; save(); toast(T("mn.ok")); if (!current) renderHub(); }
      else toast(T("mn.bad"));
    }
    if (v === 2) { const ok = await modal(`<h3>${T("mn.sureT")}</h3><p>${T("mn.sureP")}</p>`, [{ label: T("g.cancel"), value: false }, { label: T("g.yesDelete"), cls: "coral", value: true }]); if (ok) { wipe(); location.reload(); } }
  }

  /* ---------- arranque ---------- */
  I18N.initPicker();
  I18N.apply();
  I18N.onChange(onLangChange);
  renderStatic();
  $("#btn-menu").onclick = menu;
  $("#btn-home").onclick = () => enterHub();
  $("#btn-hub").onclick = () => enterHub();
  setInterval(tick, 1000);
  window.addEventListener("beforeunload", () => { if (S.name) { tick(); save(); } });
  document.addEventListener("visibilitychange", () => { if (S.name) { tick(); save(); } });
  initWelcome();
})();
