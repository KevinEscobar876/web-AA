<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ALIANZA AZUL | Únete al Movimiento</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,600;1,300&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="formulario.css">
</head>
<body class="mode-balanced">

  <!-- CURSOR -->
  <div class="cursor" id="cursor"></div>
  <div class="cursor-dot" id="cursorDot"></div>

  <!-- NAV -->
  <nav>
    <a href="index.html" class="nav-logo">ALIANZA AZUL</a>
    <ul class="nav-links">
      <li><a href="index.html#crisis">La Crisis</a></li>
      <li><a href="index.html#cifras">Cifras</a></li>
      <li><a href="index.html#accion">Acción</a></li>
    </ul>
  </nav>

  <a href="index.html" class="form-back">Volver al inicio</a>

  <div class="form-page">

    <!-- PROGRESS BAR -->
    <div class="form-progress" id="formProgress">
      <div class="form-progress-steps">
        <div class="form-progress-line" id="progressLine" style="width:0%"></div>
        <div class="progress-step active" data-step="1">
          <div class="progress-step-dot">1</div>
          <span class="progress-step-label">Tu Perfil</span>
        </div>
        <div class="progress-step" data-step="2">
          <div class="progress-step-dot">2</div>
          <span class="progress-step-label">Preferencias</span>
        </div>
        <div class="progress-step" data-step="3">
          <div class="progress-step-dot">3</div>
          <span class="progress-step-label">Uso de IA</span>
        </div>
        <div class="progress-step" data-step="4">
          <div class="progress-step-dot">4</div>
          <span class="progress-step-label">Completado</span>
        </div>
      </div>
    </div>

    <!-- FORM CARD -->
    <div class="form-card">

      <!-- ── PASO 1: Datos del usuario ── -->
      <div class="form-step active" id="step1">
        <div class="step-header">
          <span class="step-eyebrow">Paso 1 de 3 · Tu identidad</span>
          <h2>Cuéntanos<br>sobre <em>ti</em></h2>
          <p>Estos datos nos ayudan a personalizar tu experiencia y entender mejor quién se preocupa por el impacto hídrico de la IA.</p>
        </div>

        <div class="form-alert error" id="alert1">
          <span>⚠</span><span id="alertMsg1"></span>
        </div>

        <div class="field-row">
          <div class="field-group">
            <label for="nombre">Nombre completo <span class="req">*</span></label>
            <input type="text" id="nombre" class="field-input" placeholder="Tu nombre" maxlength="100" autocomplete="name">
            <div class="field-error" id="err-nombre">Ingresa tu nombre.</div>
          </div>
          <div class="field-group">
            <label for="edad">Edad <span class="req">*</span></label>
            <input type="number" id="edad" class="field-input" placeholder="25" min="10" max="120">
            <div class="field-error" id="err-edad">Edad inválida (10–120).</div>
          </div>
        </div>

        <div class="field-group">
          <label for="email">Correo electrónico <span class="req">*</span></label>
          <input type="email" id="email" class="field-input" placeholder="tucorreo@email.com" maxlength="150" autocomplete="email">
          <div class="field-error" id="err-email">Ingresa un correo válido.</div>
          <p class="field-hint">Nunca compartiremos tu correo. Solo sirve para identificar tu perfil.</p>
        </div>

        <div class="form-nav">
          <button class="btn-next" id="btn1" onclick="submitStep1()">
            Continuar
            <div class="btn-spinner" id="spin1"></div>
          </button>
        </div>
      </div>

      <!-- ── PASO 2: Preferencias ── -->
      <div class="form-step" id="step2">
        <div class="step-header">
          <span class="step-eyebrow">Paso 2 de 3 · Tus preferencias</span>
          <h2>¿Cómo prefieres<br><em>explorar</em>?</h2>
          <p>Personaliza cómo quieres recibir la información sobre el impacto hídrico de la IA.</p>
        </div>

        <div class="form-alert error" id="alert2">
          <span>⚠</span><span id="alertMsg2"></span>
        </div>

        <!-- Tipo de contenido -->
        <div class="field-group">
          <label>Tipo de contenido preferido <span class="req">*</span></label>
          <div class="option-grid cols-3">
            <div class="option-card">
              <input type="radio" name="tipo_contenido" id="tc_texto" value="texto">
              <label for="tc_texto">
                <span class="opt-icon">📖</span>
                <span class="opt-name">Texto</span>
                <span class="opt-desc">Artículos y análisis</span>
              </label>
            </div>
            <div class="option-card">
              <input type="radio" name="tipo_contenido" id="tc_imagenes" value="imagenes">
              <label for="tc_imagenes">
                <span class="opt-icon">🖼️</span>
                <span class="opt-name">Visual</span>
                <span class="opt-desc">Infografías e imágenes</span>
              </label>
            </div>
            <div class="option-card">
              <input type="radio" name="tipo_contenido" id="tc_mixto" value="mixto" checked>
              <label for="tc_mixto">
                <span class="opt-icon">⚖️</span>
                <span class="opt-name">Mixto</span>
                <span class="opt-desc">Texto e imágenes</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Nivel de complejidad -->
        <div class="field-group">
          <label>Nivel de complejidad <span class="req">*</span></label>
          <div class="option-grid cols-2">
            <div class="option-card">
              <input type="radio" name="nivel_complejidad" id="nc_simple" value="simple" checked>
              <label for="nc_simple">
                <span class="opt-icon">🌱</span>
                <span class="opt-name">Simple</span>
                <span class="opt-desc">Lenguaje claro y directo</span>
              </label>
            </div>
            <div class="option-card">
              <input type="radio" name="nivel_complejidad" id="nc_avanzado" value="avanzado">
              <label for="nc_avanzado">
                <span class="opt-icon">🔬</span>
                <span class="opt-name">Avanzado</span>
                <span class="opt-desc">Datos técnicos y fuentes</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Modo visual -->
        <div class="field-group">
          <label>Vista preferida de la campaña <span class="req">*</span></label>
          <div class="option-grid cols-3">
            <div class="option-card">
              <input type="radio" name="modo_visual" id="mv_balanced" value="balanced" checked>
              <label for="mv_balanced">
                <span class="opt-icon">⚖️</span>
                <span class="opt-name">Balanceado</span>
              </label>
            </div>
            <div class="option-card">
              <input type="radio" name="modo_visual" id="mv_infographic" value="infographic">
              <label for="mv_infographic">
                <span class="opt-icon">📊</span>
                <span class="opt-name">Infografía</span>
              </label>
            </div>
            <div class="option-card">
              <input type="radio" name="modo_visual" id="mv_text" value="text">
              <label for="mv_text">
                <span class="opt-icon">📄</span>
                <span class="opt-name">Lectura</span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-nav">
          <button class="btn-prev" onclick="goTo(1)">← Anterior</button>
          <button class="btn-next" id="btn2" onclick="submitStep2()">
            Continuar
            <div class="btn-spinner" id="spin2"></div>
          </button>
        </div>
      </div>

      <!-- ── PASO 3: Uso de IA ── -->
      <div class="form-step" id="step3">
        <div class="step-header">
          <span class="step-eyebrow">Paso 3 de 3 · Tu uso de IA</span>
          <h2>Tu huella<br><em>digital</em></h2>
          <p>Cuéntanos cómo usas la IA hoy. Con estos datos calcularemos cuánta agua consume tu actividad diaria.</p>
        </div>

        <div class="form-alert error" id="alert3">
          <span>⚠</span><span id="alertMsg3"></span>
        </div>

        <!-- Herramienta de IA -->
        <div class="field-group">
          <label for="herramienta_ia">¿Qué herramienta de IA usas principalmente? <span class="req">*</span></label>
          <select id="herramienta_ia" class="field-input">
            <option value="" disabled selected>Selecciona una herramienta</option>
            <option value="ChatGPT">ChatGPT (OpenAI)</option>
            <option value="Claude">Claude (Anthropic)</option>
            <option value="Gemini">Gemini (Google)</option>
            <option value="Copilot">Copilot (Microsoft)</option>
            <option value="Llama">Llama (Meta)</option>
            <option value="Midjourney">Midjourney (imágenes)</option>
            <option value="Stable Diffusion">Stable Diffusion</option>
            <option value="Otra">Otra herramienta</option>
          </select>
          <div class="field-error" id="err-herramienta">Selecciona una herramienta.</div>
        </div>

        <!-- Cantidad de preguntas -->
        <div class="field-group">
          <label>¿Cuántas consultas o preguntas haces al día aproximadamente?</label>
          <div class="range-value"><span id="preguntasVal">10</span> <span>preguntas</span></div>
          <div class="range-wrap">
            <input type="range" class="field-range" id="cantidad_preguntas"
              min="0" max="200" value="10" step="5"
              oninput="document.getElementById('preguntasVal').textContent=this.value">
          </div>
          <div class="range-labels"><span>0</span><span>50</span><span>100</span><span>150</span><span>200+</span></div>
          <p class="field-hint">
            💧 Cada 20 consultas ≈ 500ml de agua consumida para enfriar servidores.
          </p>
        </div>

        <!-- Minutos de uso -->
        <div class="field-group">
          <label>¿Cuántos minutos al día usas herramientas de IA?</label>
          <div class="range-value"><span id="minutosVal">30</span> <span>min</span></div>
          <div class="range-wrap">
            <input type="range" class="field-range" id="minutos_uso"
              min="0" max="480" value="30" step="5"
              oninput="document.getElementById('minutosVal').textContent=this.value">
          </div>
          <div class="range-labels"><span>0</span><span>2h</span><span>4h</span><span>6h</span><span>8h+</span></div>
        </div>

        <!-- Agua estimada en tiempo real -->
        <div style="background:rgba(34,211,238,0.05);border:1px solid rgba(34,211,238,0.15);
                    border-radius:12px;padding:1rem 1.2rem;margin-bottom:1.5rem;text-align:center;">
          <p style="font-size:.72rem;letter-spacing:2px;text-transform:uppercase;
                    color:rgba(34,211,238,0.5);margin-bottom:.3rem;">Tu consumo estimado diario</p>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;
                      color:var(--cyan);text-shadow:0 0 20px rgba(34,211,238,0.4);"
               id="aguaEstimada">250 ml</div>
          <p style="font-size:.72rem;color:rgba(240,249,255,0.3);">basado en tus respuestas</p>
        </div>

        <div class="form-nav">
          <button class="btn-prev" onclick="goTo(2)">← Anterior</button>
          <button class="btn-submit" id="btn3" onclick="submitStep3()">
            Enviar mi perfil
            <div class="btn-spinner" id="spin3"></div>
          </button>
        </div>
      </div>

      <!-- ── ÉXITO ── -->
      <div class="form-success" id="stepSuccess">
        <div class="success-icon">💧</div>
        <div class="success-title">¡Gracias por<br><em>unirte</em>!</div>
        <p class="success-body">
          Tu perfil ha sido registrado. Con esta información ayudas a visibilizar el impacto hídrico real de la inteligencia artificial.
        </p>
        <div class="water-consumed-mini" id="successWater">🌊 Tu huella diaria: 250 ml</div>
        <div class="btn-group" style="justify-content:center;flex-direction:column;align-items:center;gap:1rem;">
          <a href="index.html" class="btn btn-primary">Explorar la campaña</a>
          <a href="index.html#accion" class="btn btn-ghost">Compartir el mensaje</a>
        </div>
      </div>

    </div><!-- /form-card -->
  </div><!-- /form-page -->

  <script src="script.js"></script>
  <script src="formulario.js"></script>
</body>
</html>
