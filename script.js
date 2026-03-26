// ── CUSTOM CURSOR ──
// Strategy: keep cursor hidden & off-screen until first real mousemove.
// Use CSS transform only (no left/top animation lag issue).
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

// Start completely off screen and invisible
cursor.style.cssText    += ';opacity:0;left:-200px;top:-200px;';
cursorDot.style.cssText += ';opacity:0;left:-200px;top:-200px;';

let raf = null;
let mx = -200, my = -200;
let cx = -200, cy = -200;
let started = false;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;

  if (!started) {
    // Snap immediately on first move - no lag from (-200,-200)
    cx = mx;
    cy = my;
    started = true;
    cursor.style.opacity    = '1';
    cursorDot.style.opacity = '1';
  }

  // Dot follows instantly
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
}, { passive: true });

function tickCursor() {
  if (started) {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  }
  requestAnimationFrame(tickCursor);
}
requestAnimationFrame(tickCursor);

// Scale on hover using delegation (works for dynamic content too)
document.addEventListener('mouseover', e => {
  if (e.target.closest('a, button, .card, .drop, .cycle-node, .mode-btn, .map-region')) {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.2)';
  }
}, { passive: true });
document.addEventListener('mouseout', e => {
  if (e.target.closest('a, button, .card, .drop, .cycle-node, .mode-btn, .map-region')) {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  }
}, { passive: true });

// Touch devices: hide custom cursor and restore default
if (!window.matchMedia('(pointer: fine)').matches) {
  cursor.style.display    = 'none';
  cursorDot.style.display = 'none';
} else {
  document.body.style.cursor = 'none';
}

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      e.target.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── PARALLAX DROPS ──
if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    document.querySelectorAll('.drop').forEach((drop, i) => {
      const f = (i + 1) * 4;
      drop.style.marginLeft = (dx * f) + 'px';
      drop.style.marginTop  = (dy * f) + 'px';
    });
  });
}

// ── NAV SCROLL EFFECT ──
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.background = window.scrollY > 80
    ? 'rgba(3,11,20,0.97)'
    : 'linear-gradient(to bottom, rgba(3,11,20,0.95), transparent)';
});

// ── DROP CLICK RIPPLE ──
document.querySelectorAll('.drop').forEach(drop => {
  drop.addEventListener('click', function () {
    const r = document.createElement('span');
    r.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;
      width:10px;height:10px;background:rgba(34,211,238,0.4);
      transform:translate(-50%,-50%) scale(0);animation:rippleOut 0.6s ease forwards;
      left:50%;top:50%;`;
    this.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
});
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes rippleOut{to{transform:translate(-50%,-50%) scale(15);opacity:0;}}`;
document.head.appendChild(styleEl);

// ══════════════════════════════════════════════════════════
//  WATER COUNTER — datos académicos reales
//  Li et al. 2023 (UC Riverside) + IEA 2024
//  ~150M consultas/hora globalmente × 10ml promedio = ~416 L/seg
// ══════════════════════════════════════════════════════════
const WATER_RATE = 416.67;
const PAGE_LOAD  = Date.now();

function updateCounter() {
  const secs   = (Date.now() - PAGE_LOAD) / 1000;
  const liters = Math.floor(secs * WATER_RATE);
  const el = document.getElementById('waterCount');
  if (el) el.textContent = liters.toLocaleString('es-ES');
  requestAnimationFrame(updateCounter);
}
updateCounter();

// ══════════════════════════════════════════════════════════
//  AMBIENT SOUND — gotas generadas con Web Audio API
// ══════════════════════════════════════════════════════════
let audioCtx   = null;
let soundOn    = false;
let masterGain = null;
let dropTimer  = null;

function createAudioContext() {
  if (audioCtx) return;
  audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
}

function playWaterDrop() {
  if (!audioCtx || !soundOn) return;
  const now = audioCtx.currentTime;

  const osc    = audioCtx.createOscillator();
  const env    = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  const base   = 400 + Math.random() * 600;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(base * 1.6, now);
  osc.frequency.exponentialRampToValueAtTime(base, now + 0.08);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(base, now);
  filter.Q.setValueAtTime(8, now);
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(0.35, now + 0.005);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc.connect(filter); filter.connect(env); env.connect(masterGain);
  osc.start(now); osc.stop(now + 0.55);

  const osc2 = audioCtx.createOscillator();
  const env2 = audioCtx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(base * 0.9, now + 0.06);
  osc2.frequency.exponentialRampToValueAtTime(base * 0.6, now + 0.3);
  env2.gain.setValueAtTime(0, now + 0.06);
  env2.gain.linearRampToValueAtTime(0.08, now + 0.09);
  env2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc2.connect(env2); env2.connect(masterGain);
  osc2.start(now + 0.06); osc2.stop(now + 0.45);
}

function scheduleDrops() {
  if (!soundOn) return;
  playWaterDrop();
  dropTimer = setTimeout(scheduleDrops, 900 + Math.random() * 1500);
}

function toggleSound() {
  const btn   = document.getElementById('soundToggle');
  const icon  = document.getElementById('soundIcon');
  const label = document.getElementById('soundLabel');
  createAudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  soundOn = !soundOn;
  if (soundOn) {
    masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    scheduleDrops();
    btn.classList.add('active');
    icon.textContent  = '🔊';
    label.textContent = 'Sonido';
  } else {
    clearTimeout(dropTimer);
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    btn.classList.remove('active');
    icon.textContent  = '🔇';
    label.textContent = 'Silencio';
  }
}

// ══════════════════════════════════════════════════════════
//  VIEW MODE SWITCHER
// ══════════════════════════════════════════════════════════
let currentMode = 'balanced';

function setViewMode(mode) {
  if (currentMode === mode) return;
  currentMode = mode;

  document.querySelectorAll('.mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));
  document.body.className = document.body.className.replace(/\bmode-\S+/g, '').trim();
  document.body.classList.add('mode-' + mode);

  const main = document.getElementById('main-content');
  main.style.transition = 'opacity .3s ease, transform .3s ease';
  main.style.opacity    = '0';
  main.style.transform  = 'translateY(14px)';

  setTimeout(() => {
    renderMode(mode);
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.remove('visible');
      observer.observe(el);
    });
    main.style.opacity   = '1';
    main.style.transform = 'translateY(0)';
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9) {
          el.classList.add('visible');
          el.querySelectorAll('.progress-fill').forEach(bar =>
            bar.style.width = bar.dataset.width + '%');
        }
      });
    }, 120);
  }, 310);
}

function renderMode(mode) {
  const c = document.getElementById('dynamic-sections');
  if (!c) return;
  if (mode === 'balanced')    c.innerHTML = getBalancedHTML();
  if (mode === 'infographic') { c.innerHTML = getInfographicHTML(); initInfographic(); }
  if (mode === 'text')        c.innerHTML = getTextHTML();
}

// ─── BALANCED ─────────────────────────────────────────────
function getBalancedHTML() {
  return `
  <section id="crisis">
    <div class="split reveal">
      <div class="split-text">
        <span class="section-tag">La Crisis Invisible</span>
        <h2>IA consume <em>agua</em> como nunca antes</h2>
        <p class="lead">Hoy en día, debido al uso excesivo y acelerado de la IA se ha generado un aumento del uso de servidores y centros de datos, los cuales precisan de un enfriamiento constante para mantener una temperatura apta para su debido funcionamiento, lo que conlleva a un uso excesivo del agua.</p>
        <p class="body">El uso en exceso del agua con respecto a los sistemas de enfriamiento representa un grave problema debido a que los centros de datos utilizan toneladas de agua que contribuyen al agotamiento de esta misma.</p>
        <p class="body">Es importante reconocer el desconocimiento que existe entre las personas, sus actividades digitales y el consumo de agua. Esta falta de información tiene un impacto constante en los recursos hídricos.</p>
        <div class="progress-list" style="margin-top:2rem;">
          <div class="progress-item">
            <div class="progress-label"><span>Enfriamiento de Servidores</span><span>78%</span></div>
            <div class="progress-track"><div class="progress-fill" data-width="78"></div></div>
          </div>
          <div class="progress-item">
            <div class="progress-label"><span>Generación de Energía</span><span>14%</span></div>
            <div class="progress-track"><div class="progress-fill" data-width="14"></div></div>
          </div>
          <div class="progress-item">
            <div class="progress-label"><span>Procesos Industriales</span><span>8%</span></div>
            <div class="progress-track"><div class="progress-fill" data-width="8"></div></div>
          </div>
        </div>
      </div>
      <div class="split-image">
        <div class="img-placeholder img-p1">
          <div style="text-align:center;">
            <div class="server-visual">
              <div class="server-bar" style="height:80px;animation-delay:.1s;"></div>
              <div class="server-bar" style="height:140px;animation-delay:.2s;"></div>
              <div class="server-bar" style="height:100px;animation-delay:.3s;"></div>
              <div class="server-bar" style="height:170px;animation-delay:.4s;"></div>
              <div class="server-bar" style="height:90px;animation-delay:.5s;"></div>
              <div class="server-bar" style="height:160px;animation-delay:.6s;"></div>
              <div class="server-bar" style="height:120px;animation-delay:.7s;"></div>
            </div>
            <p style="font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:rgba(34,211,238,0.4);margin-top:1rem;">Consumo de agua por datacenter</p>
          </div>
        </div>
        <span class="img-caption">Fuente: mi equipo y yo</span>
      </div>
    </div>
  </section>
  <div class="divider"></div>
  <section id="cifras" style="padding-top:6rem;padding-bottom:6rem;">
    <div style="text-align:center;margin-bottom:2rem;" class="reveal">
      <span class="section-tag">Cifras que Impactan</span>
      <h2>Los números<br>de la <em>sed digital</em></h2>
    </div>
    <div class="stats-row reveal">
      <div class="stat-block"><div class="stat-num">1.8<span class="stat-unit">B</span></div><div class="stat-desc">Litros/año en un solo<br>centro de datos grande</div></div>
      <div class="stat-block"><div class="stat-num">700<span class="stat-unit">ml</span></div><div class="stat-desc">Agua por cada 20–50<br>preguntas a ChatGPT</div></div>
      <div class="stat-block"><div class="stat-num">2X</div><div class="stat-desc">Crecimiento en consumo<br>hídrico cada 4 años</div></div>
    </div>
  </section>
  <div class="big-quote">
    <p class="quote-text reveal">"En 2027, la IA podría consumir más agua que todo el uso <em>doméstico</em> de países como Dinamarca o Bélgica"</p>
    <p class="quote-source reveal">— Investigadores de Universidad de California, Riverside · 2023</p>
  </div>
  <section id="impacto">
    <div class="split reverse reveal">
      <div class="split-text">
        <span class="section-tag">El Ciclo del Daño</span>
        <h2>Del servidor<br>al <em>desierto</em></h2>
        <p class="lead">Los efectos del consumo hídrico de la IA no se limitan a las cifras corporativas. Se extienden sobre ecosistemas, comunidades y el ciclo del agua en regiones enteras.</p>
        <p class="body">Los centros de datos que entrenan y ejecutan modelos de IA necesitan grandes volúmenes de agua para enfriamiento. En zonas con estrés hídrico, eso compite con el consumo humano y agrícola.</p>
        <p class="body">La instalación de infraestructura tecnológica concentra consumo en territorios específicos. Si hay fallas o sobreexplotación, las comunidades locales asumen el impacto.</p>
        <a href="#accion" class="btn btn-primary" style="margin-top:1.5rem;display:inline-flex;">Ver Soluciones →</a>
      </div>
      <div class="split-image">
        <div class="img-placeholder img-p2">
          <svg width="180" height="220" viewBox="0 0 180 220" style="opacity:.25;">
            <defs><linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#0e7490"/></linearGradient></defs>
            <ellipse cx="90" cy="30" rx="70" ry="25" fill="none" stroke="url(#wg2)" stroke-width="2"/>
            <path d="M20,30 Q20,120 90,190 Q160,120 160,30" fill="none" stroke="url(#wg2)" stroke-width="2"/>
            <path d="M50,70 Q90,100 130,70" fill="none" stroke="url(#wg2)" stroke-width="1" opacity=".5"/>
            <circle cx="90" cy="190" r="8" fill="#22d3ee" opacity=".4">
              <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".4;0;.4" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
        <span class="img-caption">Modelo hidrológico 2024</span>
      </div>
    </div>
  </section>
  <div class="divider"></div>
  ${counterHTML()}
  <div class="divider"></div>
  <section>
    <div class="reveal" style="margin-bottom:1rem;">
      <span class="section-tag">Consecuencias</span>
      <h2>El costo <em>real</em><br>de la inteligencia</h2>
    </div>
    ${cardsHTML()}
  </section>
  <div class="divider"></div>
  <section>
    <div class="split reveal">
      <div class="split-text">
        <span class="section-tag">¿Qué Podemos Hacer?</span>
        <h2>Tecnología<br><em>responsable</em></h2>
        <p class="lead">Usar la inteligencia artificial de forma responsable significa tratar de que no dañe al planeta ni a las personas. Para gastar menos agua los centros de datos deben usar mejores sistemas de enfriamiento y energías limpias.</p>
        <p class="body">Para no afectar la naturaleza ni a comunidades vulnerables, es necesario hacer estudios antes de instalar estos centros y ser claros sobre cuánta agua y energía usan.</p>
        <p class="body">También es importante crear programas que consuman menos energía. Deben existir reglas claras para evitar que su crecimiento sea descontrolado.</p>
      </div>
      <div class="split-image">
        <div class="img-placeholder img-p3">
          <svg width="200" height="200" viewBox="0 0 200 200" style="opacity:.3;">
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(14,116,144,0.3)" stroke-width="8"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#22d3ee" stroke-width="8"
              stroke-dasharray="377" stroke-dashoffset="94" stroke-linecap="round" transform="rotate(-90 100 100)">
              <animate attributeName="stroke-dashoffset" from="377" to="94" dur="2s" fill="freeze"/>
            </circle>
            <text x="100" y="95" text-anchor="middle" fill="#22d3ee" font-family="'Bebas Neue',sans-serif" font-size="36">75%</text>
            <text x="100" y="118" text-anchor="middle" fill="rgba(240,249,255,0.4)" font-family="'DM Sans',sans-serif" font-size="11">reducción posible</text>
          </svg>
        </div>
        <span class="img-caption">Potencial de reducción</span>
      </div>
    </div>
  </section>
  <div class="divider"></div>`;
}

// ─── INFOGRAPHIC ──────────────────────────────────────────
function getInfographicHTML() {
  return `
  <section id="crisis" class="infographic-section">
    <div class="reveal" style="text-align:center;margin-bottom:3rem;">
      <span class="section-tag">Infografía Interactiva</span>
      <h2>El ciclo del <em>agua digital</em></h2>
      <p style="color:rgba(240,249,255,0.55);max-width:560px;margin:1rem auto 0;font-size:.95rem;line-height:1.7;">Haz click en cada nodo para explorar cómo fluye el agua a través de los sistemas de IA.</p>
    </div>
    <div class="infograph-cycle reveal">
      <div class="cycle-node" data-info="consulta"><div class="cycle-icon">💬</div><div class="cycle-label">Tu consulta<br>a la IA</div><div class="cycle-arrow">→</div></div>
      <div class="cycle-node" data-info="servidor"><div class="cycle-icon">🖥️</div><div class="cycle-label">Servidor<br>procesa</div><div class="cycle-arrow">→</div></div>
      <div class="cycle-node active" data-info="calor"><div class="cycle-icon">🔥</div><div class="cycle-label">Genera<br>calor</div><div class="cycle-arrow">→</div></div>
      <div class="cycle-node" data-info="enfriamiento"><div class="cycle-icon">💧</div><div class="cycle-label">Necesita<br>agua</div><div class="cycle-arrow">→</div></div>
      <div class="cycle-node" data-info="impacto"><div class="cycle-icon">🌍</div><div class="cycle-label">Impacto<br>ambiental</div><div class="cycle-arrow cycle-arrow-end">⚠</div></div>
    </div>
    <div class="cycle-info-panel reveal" id="cycleInfo">
      <div class="cycle-info-content" id="cycleInfoContent">
        <span class="cycle-info-icon">🔥</span>
        <div><strong>Generación de Calor</strong><p>Los procesadores de IA alcanzan temperaturas de hasta 85°C durante cálculos intensivos. Sin enfriamiento activo, los servidores se dañarían en minutos.</p></div>
      </div>
    </div>
    <div class="infograph-grid reveal">
      <div class="infograph-card big">
        <canvas id="donutChart" width="200" height="200"></canvas>
        <div class="infograph-card-text">
          <h3>Distribución del<br>consumo hídrico</h3>
          <div class="legend-list">
            <span class="legend-item" style="--c:#22d3ee">78% Enfriamiento</span>
            <span class="legend-item" style="--c:#0e7490">14% Energía</span>
            <span class="legend-item" style="--c:#164e63">8% Procesos</span>
          </div>
        </div>
      </div>
      <div class="infograph-card">
        <div class="infograph-big-num" id="mlCounter">0 ml</div>
        <div class="infograph-sublabel">por consulta promedio</div>
        <div class="infograph-bar-track"><div class="infograph-bar-fill" id="mlBar"></div></div>
      </div>
      <div class="infograph-card">
        <div class="infograph-big-num" id="dcCounter">0</div>
        <div class="infograph-sublabel">centros de datos activos</div>
        <div class="infograph-bar-track"><div class="infograph-bar-fill" id="dcBar"></div></div>
      </div>
      <div class="infograph-card full">
        <div class="infograph-wave-label">Proyección consumo hídrico IA — 2020 a 2030</div>
        <canvas id="waveChart" width="700" height="160" style="width:100%;max-width:700px;"></canvas>
      </div>
    </div>
    <div class="infograph-globe-section reveal">
      <h3 style="text-align:center;font-family:'Bebas Neue',sans-serif;font-size:2rem;margin-bottom:.5rem;">Zonas de <em style="font-style:normal;color:var(--cyan)">mayor impacto</em></h3>
      <p style="text-align:center;color:rgba(240,249,255,0.5);font-size:.9rem;margin-bottom:1.5rem;">Pasa el cursor sobre cada región para ver datos de consumo hídrico de IA</p>
      <div class="heatmap-wrap">
        <canvas id="worldHeatmap"></canvas>
        <div class="heatmap-tooltip" id="hmTooltip"></div>
        <div class="heatmap-legend">
          <span class="hml-label">Bajo impacto</span>
          <div class="hml-bar"></div>
          <span class="hml-label">Alto impacto</span>
        </div>
      </div>
    </div>
  </section>
  <div class="divider"></div>
  ${counterHTML()}
  <div class="divider"></div>
  <section>
    <div class="reveal" style="text-align:center;margin-bottom:2rem;">
      <span class="section-tag">Consecuencias</span>
      <h2>El costo <em>real</em></h2>
    </div>
    ${cardsHTML()}
  </section>
  <div class="divider"></div>`;
}

// ─── TEXT MODE ─────────────────────────────────────────────
function getTextHTML() {
  return `
  <section id="crisis" class="text-section">
    <div class="text-article reveal">
      <span class="section-tag">La Crisis Invisible</span>
      <h2>IA consume <em>agua</em> como nunca antes</h2>
      <p class="lead">Hoy en día, debido al uso excesivo y acelerado de la IA se ha generado un aumento del uso de servidores y centros de datos, los cuales precisan de un enfriamiento constante para mantener una temperatura apta para su debido funcionamiento, lo que conlleva a un uso excesivo del agua.</p>
      <p class="body">El uso en exceso del agua con respecto a los sistemas de enfriamiento representa un grave problema. A medida que la demanda de servicios de IA crece, también lo hace el volumen de agua necesaria para mantener los servidores operativos.</p>
      <p class="body">Es importante reconocer el desconocimiento que existe entre las personas, sus actividades digitales y el consumo de agua. Cuando alguien hace una pregunta a un asistente de IA, pocas veces se pregunta qué recursos naturales fueron necesarios para procesar esa respuesta.</p>
      <div class="text-quote"><span class="tq-bar"></span><p>"Cada 20 a 50 consultas a un modelo como ChatGPT equivalen a consumir una botella de agua de 500ml." — Estudio UC Riverside, 2023</p></div>
      <p class="body">Los sistemas de enfriamiento representan el 78% del consumo hídrico. Le sigue la generación de energía con 14%, y los procesos industriales con 8%. Estas cifras crecen cada año junto con el número de modelos de IA entrenados y desplegados a nivel global.</p>
    </div>
  </section>
  <div class="divider"></div>
  <section id="cifras" class="text-section">
    <div class="text-article reveal">
      <span class="section-tag">Cifras que Impactan</span>
      <h2>Los números de la <em>sed digital</em></h2>
      <div class="text-stats-inline">
        <div class="tsi-item"><span class="tsi-num">1.8B</span><span class="tsi-desc">litros por año en un solo centro de datos grande</span></div>
        <div class="tsi-item"><span class="tsi-num">700ml</span><span class="tsi-desc">agua por cada 20–50 preguntas a ChatGPT</span></div>
        <div class="tsi-item"><span class="tsi-num">2×</span><span class="tsi-desc">crecimiento en consumo hídrico cada 4 años</span></div>
      </div>
      <p class="body">Para dimensionar el problema: 1.800 millones de litros equivalen al consumo de agua anual de aproximadamente 14.000 hogares. Un único centro de datos de escala media puede consumir esa cantidad, y el mundo opera con más de 8.000 centros activos.</p>
      <p class="body">El agua no solo se consume: también se evapora durante el proceso de enfriamiento por torre húmeda, lo que significa que parte del recurso no puede ser recuperado ni reutilizado. Esta pérdida neta tiene especial impacto en regiones con estrés hídrico.</p>
    </div>
  </section>
  <div class="divider"></div>
  <section id="impacto" class="text-section">
    <div class="text-article reveal">
      <span class="section-tag">Impacto Global</span>
      <h2>Del servidor al <em>desierto</em></h2>
      <p class="lead">Los efectos del consumo hídrico de la IA no se limitan a las cifras de los reportes corporativos. Se extienden sobre ecosistemas, comunidades y el ciclo del agua en regiones enteras.</p>
      <h3 class="text-subheading">Escasez Hídrica</h3>
      <p class="body">Los centros de datos que entrenan y ejecutan modelos de IA necesitan grandes volúmenes de agua para enfriamiento. En zonas con estrés hídrico, eso compite directamente con el consumo humano y agrícola. Países como India, España o México —donde ya existe presión sobre los acuíferos— albergan instalaciones que agravan la situación local.</p>
      <h3 class="text-subheading">Comunidades en Riesgo</h3>
      <p class="body">La instalación de infraestructura tecnológica concentra consumo de energía y agua en territorios específicos. Si hay fallas, contaminación o sobreexplotación de recursos, las comunidades locales asumen el impacto, no las empresas globales.</p>
      <h3 class="text-subheading">Calentamiento Local</h3>
      <p class="body">Los centros de datos liberan calor constante hacia el entorno inmediato. En áreas urbanas ya afectadas por islas de calor, esto intensifica la temperatura del barrio o municipio, especialmente en ciudades densas con poca vegetación.</p>
      <h3 class="text-subheading">Ecosistemas y Biodiversidad</h3>
      <p class="body">La fabricación de hardware para IA requiere minería de litio, cobre y tierras raras, lo que implica deforestación, contaminación de suelos y pérdida de biodiversidad. La descarga de agua caliente de los sistemas de enfriamiento puede alterar la temperatura de cuerpos de agua superficiales, afectando la vida acuática local.</p>
      <div class="text-quote"><span class="tq-bar"></span><p>"En 2027, la IA podría consumir más agua que todo el uso doméstico de países como Dinamarca o Bélgica." — Investigadores de UC Riverside, 2023</p></div>
    </div>
  </section>
  <div class="divider"></div>
  ${counterHTML()}
  <div class="divider"></div>
  <section class="text-section">
    <div class="text-article reveal">
      <span class="section-tag">¿Qué Podemos Hacer?</span>
      <h2>Tecnología <em>responsable</em></h2>
      <p class="lead">Usar la inteligencia artificial de forma responsable significa tratar de que no dañe al planeta ni a las personas.</p>
      <h3 class="text-subheading">Enfriamiento sostenible</h3>
      <p class="body">Los centros de datos deben usar mejores sistemas para enfriarse, usar energías limpias como la solar o la eólica, y construirse en sitios donde no empeoren problemas ambientales existentes. El enfriamiento por aire o líquido cerrado puede reducir el consumo hídrico hasta en un 75%.</p>
      <h3 class="text-subheading">Transparencia y regulación</h3>
      <p class="body">Es necesario hacer estudios de impacto antes de instalar centros de datos, y ser claros sobre cuánta agua y energía usan. Deben existir reglas claras para evitar que su crecimiento sea descontrolado y cause más impacto del necesario.</p>
      <h3 class="text-subheading">Eficiencia algorítmica</h3>
      <p class="body">Técnicas como la destilación de modelos, la cuantización y la reutilización de modelos preentrenados permiten obtener resultados similares con una fracción del costo energético e hídrico.</p>
      <h3 class="text-subheading">Conciencia del usuario</h3>
      <p class="body">Cada persona puede contribuir: preferir plataformas con políticas de sostenibilidad verificadas, reducir consultas innecesarias, y exigir transparencia a las empresas tecnológicas. El cambio sistémico requiere también demanda ciudadana informada.</p>
    </div>
  </section>
  <div class="divider"></div>`;
}

// ─── SHARED ──────────────────────────────────────────────
function counterHTML() {
  return `
  <div class="counter-section">
    <div class="reveal">
      <span class="section-tag">En Tiempo Real</span>
      <h2 style="margin-top:.5rem;">Agua consumida<br>mientras lees esto</h2>
      <div class="counter-wrap">
        <div class="ripple-rings"><div class="ring"></div><div class="ring"></div><div class="ring"></div></div>
        <span class="water-count" id="waterCount">0</span>
        <span class="water-count-label">Litros consumidos por IA a nivel global</span>
      </div>
      <p style="color:rgba(240,249,255,0.45);font-size:.85rem;letter-spacing:1px;">Desde que cargaste esta página</p>
      <p style="color:rgba(240,249,255,0.22);font-size:.7rem;margin-top:.4rem;">Basado en Li et al. 2023 &amp; IEA 2024 · ~416 L/seg globales (estimación conservadora)</p>
    </div>
  </div>`;
}

function cardsHTML() {
  return `
  <div class="cards">
    <div class="card reveal"><div class="card-icon">🌊</div><h3>Escasez Hídrica</h3><p>Los centros de datos que entrenan y ejecutan modelos de IA necesitan grandes volúmenes de agua para enfriamiento. En zonas con estrés hídrico, eso compite con el consumo humano y agrícola.</p></div>
    <div class="card reveal" style="transition-delay:.1s;"><div class="card-icon">🌍</div><h3>Comunidades en Riesgo</h3><p>La instalación de infraestructura tecnológica concentra consumo de energía y agua en territorios específicos. Si hay fallas o sobreexplotación, las comunidades locales asumen el impacto.</p></div>
    <div class="card reveal" style="transition-delay:.2s;"><div class="card-icon">♨️</div><h3>Calentamiento Local</h3><p>Los centros de datos liberan calor constante. En áreas urbanas ya afectadas por islas de calor, esto intensifica la temperatura del entorno inmediato.</p></div>
    <div class="card reveal" style="transition-delay:.3s;"><div class="card-icon">🐟</div><h3>Ecosistemas Dañados</h3><p>La fabricación de hardware para IA requiere minería de litio, cobre y tierras raras. Eso implica deforestación, contaminación de suelos y pérdida de biodiversidad.</p></div>
    <div class="card reveal" style="transition-delay:.4s;"><div class="card-icon">⚡</div><h3>Demanda Energética</h3><p>Entrenar modelos avanzados consume enormes cantidades de electricidad. Si la matriz energética depende de combustibles fósiles, la IA incrementa emisiones de CO₂.</p></div>
    <div class="card reveal" style="transition-delay:.5s;"><div class="card-icon">📈</div><h3>Crecimiento sin Control</h3><p>La expansión acelerada de la IA prioriza competencia y velocidad sobre regulación ambiental. Sin límites claros, el consumo de recursos escala más rápido que las medidas de mitigación.</p></div>
  </div>`;
}

// ── INFOGRAPHIC INIT ──────────────────────────────────────
const cycleData = {
  consulta:     { icon:'💬', title:'Tu consulta a la IA',   text:'Cada vez que escribes una pregunta a ChatGPT u otro modelo, generas una carga de trabajo que viaja hasta servidores físicos alrededor del mundo.' },
  servidor:     { icon:'🖥️', title:'El servidor procesa',   text:'Miles de chips GPU y TPU corren en paralelo para generar tu respuesta. Un modelo como GPT-4 usa entre 1.000 y 10.000 chips simultáneamente.' },
  calor:        { icon:'🔥', title:'Generación de Calor',   text:'Los procesadores de IA alcanzan temperaturas de hasta 85°C. Sin enfriamiento activo, los servidores se dañarían en minutos causando pérdidas millonarias.' },
  enfriamiento: { icon:'💧', title:'Necesita Agua',         text:'Por cada MW de potencia de cómputo, se evaporan entre 1.5 y 3 millones de litros de agua al año mediante torres de enfriamiento.' },
  impacto:      { icon:'🌍', title:'Impacto Ambiental',     text:'El agua evaporada no retorna al ciclo local. En regiones con estrés hídrico, cada litro del datacenter es uno menos para agricultura y consumo humano.' }
};

function initInfographic() {
  document.querySelectorAll('.cycle-node').forEach(node => {
    node.addEventListener('click', () => {
      document.querySelectorAll('.cycle-node').forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      const d = cycleData[node.dataset.info];
      const el = document.getElementById('cycleInfoContent');
      if (el && d) el.innerHTML = `<span class="cycle-info-icon">${d.icon}</span><div><strong>${d.title}</strong><p>${d.text}</p></div>`;
    });
  });
  setTimeout(() => { drawDonut(); animateInfoCounters(); drawWave(); drawWorldHeatmap(); }, 100);
}

function drawDonut() {
  const c = document.getElementById('donutChart');
  if (!c) return;
  const ctx = c.getContext('2d');
  const segs = [{p:.78,col:'#22d3ee'},{p:.14,col:'#0e7490'},{p:.08,col:'#164e63'}];
  const t0 = performance.now();
  function draw(ts) {
    const prog = Math.min((ts-t0)/1200,1);
    const ease = 1-Math.pow(1-prog,3);
    ctx.clearRect(0,0,200,200);
    ctx.beginPath(); ctx.arc(100,100,70,0,Math.PI*2);
    ctx.strokeStyle='rgba(14,116,144,0.15)'; ctx.lineWidth=22; ctx.stroke();
    let s=-Math.PI/2;
    segs.forEach(seg => {
      const e=s+seg.p*Math.PI*2*ease;
      ctx.beginPath(); ctx.arc(100,100,70,s,e);
      ctx.strokeStyle=seg.col; ctx.lineWidth=22; ctx.lineCap='round'; ctx.stroke();
      s=e;
    });
    ctx.fillStyle='#22d3ee'; ctx.font="bold 22px 'Bebas Neue',sans-serif";
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('78%',100,100);
    if(prog<1) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

function animateInfoCounters() {
  const ml=document.getElementById('mlCounter');
  const dc=document.getElementById('dcCounter');
  const mlB=document.getElementById('mlBar');
  const dcB=document.getElementById('dcBar');
  const t0=performance.now();
  function tick(ts){
    const p=Math.min((ts-t0)/1500,1);
    const e=1-Math.pow(1-p,3);
    if(ml) ml.textContent=Math.floor(e*700)+' ml';
    if(dc) dc.textContent='+'+Math.floor(e*8000).toLocaleString('es-ES');
    if(mlB) mlB.style.width=(e*70)+'%';
    if(dcB) dcB.style.width=(e*85)+'%';
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function drawWave() {
  const c=document.getElementById('waveChart');
  if(!c) return;
  const ctx=c.getContext('2d');
  const W=c.width, H=c.height;
  const years=[2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030];
  const vals=[100,118,140,165,200,245,300,370,450,540,640];
  const maxV=700, pL=50,pR=20,pT=20,pB=30;
  const pts=years.map((yr,i)=>({
    x:pL+i*(W-pL-pR)/(years.length-1),
    y:H-pB-(vals[i]/maxV)*(H-pT-pB)
  }));
  const grad=ctx.createLinearGradient(0,pT,0,H-pB);
  grad.addColorStop(0,'rgba(34,211,238,0.3)');
  grad.addColorStop(1,'rgba(34,211,238,0)');
  const t0=performance.now();
  function draw(ts){
    const prog=Math.min((ts-t0)/1600,1);
    const ease=1-Math.pow(1-prog,3);
    const vis=Math.max(2,Math.floor(ease*pts.length));
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(34,211,238,0.08)'; ctx.lineWidth=1;
    for(let i=0;i<=4;i++){
      const y=pT+i*(H-pT-pB)/4;
      ctx.beginPath(); ctx.moveTo(pL,y); ctx.lineTo(W-pR,y); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(pts[0].x,H-pB); ctx.lineTo(pts[0].x,pts[0].y);
    for(let i=1;i<vis;i++){
      const cpx=(pts[i-1].x+pts[i].x)/2;
      const cpy=pts[i-1].y;
      ctx.quadraticCurveTo(cpx,cpy,pts[i].x,pts[i].y);
    }
    ctx.lineTo(pts[vis-1].x,H-pB); ctx.fillStyle=grad; ctx.fill();
    ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
    for(let i=1;i<vis;i++){
      const cpx=(pts[i-1].x+pts[i].x)/2;
      const cpy=pts[i-1].y;
      ctx.quadraticCurveTo(cpx,cpy,pts[i].x,pts[i].y);
    }
    ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2.5; ctx.stroke();
    for(let i=0;i<vis;i++){
      ctx.beginPath(); ctx.arc(pts[i].x,pts[i].y,4,0,Math.PI*2);
      ctx.fillStyle='#22d3ee'; ctx.fill();
      if(i%2===0){
        ctx.fillStyle='rgba(240,249,255,0.4)'; ctx.font="10px 'DM Sans',sans-serif";
        ctx.textAlign='center'; ctx.fillText(years[i],pts[i].x,H-8);
      }
    }
    if(vis>=5){
      ctx.fillStyle='rgba(34,211,238,0.4)'; ctx.font="10px 'DM Sans',sans-serif";
      ctx.textAlign='left'; ctx.fillText('▶ proyectado',pts[4].x+8,pts[4].y-8);
    }
    if(prog<1) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}


// ── WORLD HEATMAP ─────────────────────────────────────────
function drawWorldHeatmap() {
  const wrap = document.querySelector('.heatmap-wrap');
  if (!wrap) return;

  const continentData = {
    norteamerica: {
      label: 'Norte América',
      icon: '🌎',
      color: '#ef4444',
      score: 88,
      desc: 'Región con mayor concentración de datacenters del mundo. Virginia (USA) es la capital mundial de los servidores.',
      ranking: [
        { country: '🇺🇸 Estados Unidos', liters: '800M', score: 92, detail: 'Virginia, Oregon, Texas' },
        { country: '🇨🇦 Canadá',          liters: '40M',  score: 28, detail: 'Toronto, Vancouver' },
        { country: '🇲🇽 México',           liters: '20M',  score: 42, detail: 'Ciudad de México' },
        { country: '🇨🇺 Cuba',             liters: '0.5M', score: 8,  detail: 'Infraestructura mínima' },
        { country: '🇬🇹 Guatemala',        liters: '0.3M', score: 6,  detail: 'Infraestructura mínima' },
      ]
    },
    sudamerica: {
      label: 'Sur América',
      icon: '🌎',
      color: '#f59e0b',
      score: 38,
      desc: 'Brasil domina la infraestructura IA de la región. Crecimiento acelerado de datacenters en São Paulo.',
      ranking: [
        { country: '🇧🇷 Brasil',       liters: '50M',  score: 55, detail: 'São Paulo, Rio de Janeiro' },
        { country: '🇨🇱 Chile',        liters: '8M',   score: 32, detail: 'Santiago' },
        { country: '🇦🇷 Argentina',    liters: '6M',   score: 28, detail: 'Buenos Aires' },
        { country: '🇨🇴 Colombia',     liters: '4M',   score: 22, detail: 'Bogotá' },
        { country: '🇵🇪 Perú',        liters: '2M',   score: 15, detail: 'Lima' },
        { country: '🇻🇪 Venezuela',    liters: '0.8M', score: 10, detail: 'Caracas' },
        { country: '🇧🇴 Bolivia',      liters: '0.2M', score: 5,  detail: 'Infraestructura mínima' },
      ]
    },
    europa: {
      label: 'Europa',
      icon: '🌍',
      color: '#22d3ee',
      score: 55,
      desc: 'Irlanda y Países Bajos son los hubs de IA más críticos. Buena regulación ambiental pero alta densidad de servidores.',
      ranking: [
        { country: '🇮🇪 Irlanda',          liters: '65M',  score: 72, detail: 'Dublin (AWS, Google, Meta)' },
        { country: '🇳🇱 Países Bajos',      liters: '55M',  score: 68, detail: 'Amsterdam (AMS-IX)' },
        { country: '🇩🇪 Alemania',          liters: '48M',  score: 62, detail: 'Frankfurt, Berlín' },
        { country: '🇬🇧 Reino Unido',       liters: '40M',  score: 58, detail: 'Londres, Manchester' },
        { country: '🇫🇷 Francia',           liters: '32M',  score: 52, detail: 'París, Marsella' },
        { country: '🇸🇪 Suecia',            liters: '22M',  score: 40, detail: 'Estocolmo' },
        { country: '🇫🇮 Finlandia',         liters: '18M',  score: 35, detail: 'Helsinki' },
        { country: '🇪🇸 España',            liters: '15M',  score: 30, detail: 'Madrid, Barcelona' },
        { country: '🇵🇱 Polonia',           liters: '10M',  score: 25, detail: 'Varsovia' },
        { country: '🇮🇹 Italia',            liters: '8M',   score: 20, detail: 'Milán' },
      ]
    },
    africa: {
      label: 'África',
      icon: '🌍',
      color: '#10b981',
      score: 15,
      desc: 'Infraestructura IA mínima pero en rápido crecimiento. El Norte tiene el mayor estrés hídrico, lo que hace cualquier expansión muy riesgosa.',
      ranking: [
        { country: '🇿🇦 Sudáfrica',   liters: '5M',   score: 28, detail: 'Johannesburgo, Ciudad del Cabo' },
        { country: '🇳🇬 Nigeria',      liters: '3M',   score: 18, detail: 'Lagos' },
        { country: '🇪🇬 Egipto',       liters: '2.5M', score: 22, detail: 'El Cairo (zona árida crítica)' },
        { country: '🇰🇪 Kenia',        liters: '1.5M', score: 15, detail: 'Nairobi' },
        { country: '🇲🇦 Marruecos',    liters: '0.8M', score: 12, detail: 'Casablanca' },
        { country: '🇹🇳 Túnez',        liters: '0.3M', score: 8,  detail: 'Túnez ciudad' },
        { country: '🇬🇭 Ghana',        liters: '0.2M', score: 6,  detail: 'Accra' },
        { country: '🇪🇹 Etiopía',      liters: '0.1M', score: 4,  detail: 'Infraestructura mínima' },
      ]
    },
    asia: {
      label: 'Asia',
      icon: '🌏',
      color: '#f97316',
      score: 75,
      desc: 'China e India lideran el consumo. Medio Oriente invierte masivamente en IA en zonas con estrés hídrico extremo.',
      ranking: [
        { country: '🇨🇳 China',             liters: '400M', score: 85, detail: 'Beijing, Shanghai, Shenzhen' },
        { country: '🇮🇳 India',             liters: '180M', score: 78, detail: 'Bangalore, Hyderabad, Chennai' },
        { country: '🇸🇦 Arabia Saudita',    liters: '70M',  score: 80, detail: 'Riad (zona árida crítica)' },
        { country: '🇦🇪 Emiratos Árabes',   liters: '50M',  score: 75, detail: 'Dubai, Abu Dhabi' },
        { country: '🇯🇵 Japón',             liters: '45M',  score: 62, detail: 'Tokyo, Osaka' },
        { country: '🇰🇷 Corea del Sur',     liters: '35M',  score: 58, detail: 'Seúl, Busan' },
        { country: '🇸🇬 Singapur',          liters: '30M',  score: 65, detail: 'Restricciones activas de agua' },
        { country: '🇮🇩 Indonesia',         liters: '20M',  score: 42, detail: 'Yakarta' },
        { country: '🇹🇭 Tailandia',         liters: '12M',  score: 35, detail: 'Bangkok' },
        { country: '🇲🇾 Malasia',           liters: '10M',  score: 32, detail: 'Kuala Lumpur' },
        { country: '🇮🇱 Israel',            liters: '8M',   score: 55, detail: 'Tel Aviv' },
        { country: '🇷🇺 Rusia',             liters: '35M',  score: 22, detail: 'Moscú, San Petersburgo' },
        { country: '🇵🇰 Pakistán',          liters: '3M',   score: 18, detail: 'Karachi' },
        { country: '🇻🇳 Vietnam',           liters: '5M',   score: 28, detail: 'Ho Chi Minh' },
      ]
    },
    oceania: {
      label: 'Oceanía',
      icon: '🌏',
      color: '#8b5cf6',
      score: 35,
      desc: 'Australia domina la región con crecimiento sostenido de IA. Nueva Zelanda con menor huella hídrica.',
      ranking: [
        { country: '🇦🇺 Australia',       liters: '22M', score: 38, detail: 'Sydney, Melbourne, Perth' },
        { country: '🇳🇿 Nueva Zelanda',   liters: '3M',  score: 25, detail: 'Auckland, Wellington' },
        { country: '🇵🇬 Papúa N. Guinea', liters: '0.2M',score: 5,  detail: 'Infraestructura mínima' },
        { country: '🇫🇯 Fiji',            liters: '0.1M',score: 4,  detail: 'Infraestructura mínima' },
      ]
    },
  };

  function scoreColor(score) {
    if (score >= 75) return '#ef4444';
    if (score >= 55) return '#f59e0b';
    if (score >= 35) return '#22d3ee';
    return '#10b981';
  }

  let activeContinent = null;

  function renderPanel(key) {
    const data = continentData[key];
    const existing = document.getElementById('continentPanel');
    if (existing) existing.remove();

    if (activeContinent === key) {
      activeContinent = null;
      document.querySelectorAll('.cont-btn').forEach(b => b.classList.remove('active'));
      return;
    }
    activeContinent = key;
    document.querySelectorAll('.cont-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.key === key));

    const panel = document.createElement('div');
    panel.id = 'continentPanel';
    panel.className = 'continent-panel';
    panel.innerHTML = `
      <div class="cp-header">
        <div class="cp-title">
          <span class="cp-icon">${data.icon}</span>
          <div>
            <h3>${data.label}</h3>
            <p class="cp-desc">${data.desc}</p>
          </div>
        </div>
        <button class="cp-close" onclick="document.getElementById('continentPanel').remove();
          document.querySelectorAll('.cont-btn').forEach(b=>b.classList.remove('active'));
          activeContinent=null;">✕</button>
      </div>
      <div class="cp-ranking">
        <div class="cp-ranking-header">
          <span>País</span><span>Litros/día</span><span>Impacto</span>
        </div>
        ${data.ranking.map((item, i) => `
          <div class="cp-row" style="animation-delay:${i*0.05}s">
            <span class="cp-rank">${i+1}</span>
            <span class="cp-country">${item.country}<small>${item.detail}</small></span>
            <span class="cp-liters">${item.liters}</span>
            <div class="cp-bar-wrap">
              <div class="cp-bar" style="--w:${item.score}%;--c:${scoreColor(item.score)}"></div>
              <span class="cp-score">${item.score}</span>
            </div>
          </div>`).join('')}
      </div>`;

    wrap.appendChild(panel);
    requestAnimationFrame(() => panel.classList.add('visible'));
  }

  wrap.innerHTML = `
    <div class="cont-buttons">
      ${Object.entries(continentData).map(([key, data]) => `
        <button class="cont-btn" data-key="${key}"
          onclick="renderPanel('${key}')"
          style="--accent:${data.color}">
          <span class="cont-btn-icon">${data.icon}</span>
          <span class="cont-btn-name">${data.label}</span>
          <span class="cont-btn-score" style="background:${scoreColor(data.score)}">${data.score}</span>
        </button>`).join('')}
    </div>
    <div class="heatmap-legend">
      <span class="hml-label">Bajo impacto</span>
      <div class="hml-bar"></div>
      <span class="hml-label">Alto impacto</span>
    </div>`;

  // expose renderPanel globally so inline onclick works
  window.renderPanel = renderPanel;
}


// ── SHARE CAMPAIGN ────────────────────────────────────────
function shareCampaign() {
  const url = window.location.href;
  const showToast = (msg, icon='🔗') => {
    const toast = document.getElementById('toast');
    const msg_el = document.getElementById('toastMsg');
    if (!toast) return;
    msg_el.textContent = msg;
    toast.querySelector('.toast-icon').textContent = icon;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  if (navigator.share) {
    navigator.share({
      title: 'Alianza Azul — El Agua Que No Ves',
      text: 'Cada consulta a la IA consume agua. Descubre la crisis hídrica invisible.',
      url
    }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => showToast('¡Enlace copiado al portapapeles!', '🔗'))
      .catch(() => {
        fallbackCopy(url);
        showToast('¡Enlace copiado al portapapeles!', '🔗');
      });
  } else {
    fallbackCopy(url);
    showToast('¡Enlace copiado al portapapeles!', '🔗');
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); } catch(e) {}
  document.body.removeChild(ta);
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderMode('balanced');
});