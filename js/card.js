/* Tarjeta coleccionable de la startup (canvas → PNG) */
const StartupCard = (() => {
  const RAREZAS = [
    { min: 900000, n: "LEGENDARIA", c1: "#ffb627", c2: "#ff6b5b", star: 4 },
    { min: 600000, n: "ÉPICA", c1: "#8b5bff", c2: "#ff8fd1", star: 3 },
    { min: 300000, n: "RARA", c1: "#10b5a5", c2: "#5b4bff", star: 2 },
    { min: 0, n: "COMÚN", c1: "#9aa0b4", c2: "#5b6178", star: 1 }
  ];
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  function wrap(ctx, text, x, y, maxW, lh, maxLines) {
    const ws = String(text || "").split(/\s+/); let line = "", n = 0;
    for (let i = 0; i < ws.length; i++) {
      const t = line ? line + " " + ws[i] : ws[i];
      if (ctx.measureText(t).width > maxW && line) {
        n++; if (n === maxLines) { ctx.fillText(line + "…", x, y); return; }
        ctx.fillText(line, x, y); y += lh; line = ws[i];
      } else line = t;
    }
    ctx.fillText(line, x, y);
  }
  async function draw(cv, d) {
    try { await document.fonts.ready; } catch (e) {}
    const ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
    const R = RAREZAS.find(r => d.inversion >= r.min);
    ctx.clearRect(0, 0, W, H);
    // marco
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, R.c1); g.addColorStop(1, R.c2);
    ctx.fillStyle = "#1d1a3a"; rr(ctx, 0, 0, W, H, 34); ctx.fill();
    ctx.fillStyle = g; rr(ctx, 14, 14, W - 28, H - 28, 26); ctx.fill();
    // brillos
    ctx.save(); rr(ctx, 14, 14, W - 28, H - 28, 26); ctx.clip();
    ctx.globalAlpha = .18; ctx.fillStyle = "#fff";
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(80 + i * 95, 120 + (i % 2) * 40, 30 + i * 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.restore();
    // cabecera
    ctx.fillStyle = "#1d1a3a"; rr(ctx, 34, 34, W - 68, 70, 16); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "700 34px 'Space Grotesk', sans-serif"; ctx.textAlign = "left";
    let name = (d.nombre || "Mi startup").toUpperCase(); ctx.fillText(name.length > 18 ? name.slice(0, 18) + "…" : name, 56, 82);
    ctx.textAlign = "right"; ctx.font = "26px sans-serif"; ctx.fillText("★".repeat(R.star), W - 56, 80);
    // ilustración
    ctx.fillStyle = "#fffdf8"; rr(ctx, 34, 120, W - 68, 300, 18); ctx.fill();
    ctx.strokeStyle = "#1d1a3a"; ctx.lineWidth = 4; rr(ctx, 34, 120, W - 68, 300, 18); ctx.stroke();
    const bg = ctx.createRadialGradient(W / 2, 270, 20, W / 2, 270, 220); bg.addColorStop(0, R.c1 + "55"); bg.addColorStop(1, "#fffdf800");
    ctx.fillStyle = bg; ctx.fillRect(40, 126, W - 80, 288);
    ctx.textAlign = "center"; ctx.font = "150px sans-serif"; ctx.fillText(d.slot?.superpoder?.e || "🚀", W / 2, 320);
    ctx.font = "700 20px 'Space Grotesk', sans-serif"; ctx.fillStyle = "#1d1a3a";
    ctx.fillText("Superpoder IA: " + (d.slot?.superpoder?.t || "—"), W / 2, 395);
    // rareza
    ctx.fillStyle = "#1d1a3a"; rr(ctx, W / 2 - 110, 402, 220, 40, 20); ctx.fill();
    ctx.fillStyle = R.c1; ctx.font = "700 20px 'Space Grotesk', sans-serif"; ctx.fillText(R.n, W / 2, 429);
    // slogan
    ctx.fillStyle = "#1d1a3a"; ctx.font = "italic 600 24px Inter, sans-serif";
    wrap(ctx, "“" + (d.slogan || "") + "”", W / 2, 488, W - 100, 30, 2);
    // datos
    ctx.fillStyle = "rgba(255,255,255,.88)"; rr(ctx, 34, 540, W - 68, 190, 16); ctx.fill();
    ctx.textAlign = "left"; ctx.fillStyle = "#1d1a3a";
    ctx.font = "700 16px Inter, sans-serif"; ctx.fillText("PROBLEMA", 54, 570);
    ctx.font = "500 17px Inter, sans-serif"; wrap(ctx, d.slot?.problema || "", 54, 594, W - 108, 22, 2);
    ctx.font = "700 16px Inter, sans-serif"; ctx.fillText("CLIENTE", 54, 652); ctx.fillText("INVERSIÓN", W / 2 + 10, 652);
    ctx.font = "500 17px Inter, sans-serif"; ctx.fillText(d.slot?.cliente || "", 54, 676);
    ctx.font = "700 26px 'Space Grotesk', sans-serif"; ctx.fillStyle = "#19a96b"; ctx.fillText("$" + Number(d.inversion || 0).toLocaleString("es-AR"), W / 2 + 10, 682);
    ctx.fillStyle = "#1d1a3a"; ctx.font = "500 14px Inter, sans-serif"; ctx.fillText("Restricción: " + (d.slot?.restriccion || ""), 54, 712);
    // pie
    ctx.fillStyle = "#1d1a3a"; rr(ctx, 34, 748, W - 68, 58, 14); ctx.fill();
    ctx.fillStyle = "#c6f432"; ctx.font = "700 18px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("Fundador/a: " + (d.fundador || ""), 54, 784);
    ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.font = "600 14px 'Space Grotesk', sans-serif"; ctx.fillText("PromptLab · Tanque de Inversores IA", W - 54, 784);
  }
  function download(cv, name) {
    const a = document.createElement("a");
    a.download = "Startup_" + String(name || "PromptLab").replace(/[^\p{L}\p{N}]+/gu, "_") + ".png";
    a.href = cv.toDataURL("image/png"); document.body.appendChild(a); a.click(); a.remove();
  }
  return { draw, download };
})();
