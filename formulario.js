
  let idUsuario   = null;
  let currentStep = 1;
  const TOTAL_STEPS = 3;

  // ── Actualizar barra de progreso
  function updateProgress(step) {
    const pct = ((step - 1) / TOTAL_STEPS) * 100;
    document.getElementById('progressLine').style.width = pct + '%';
    document.querySelectorAll('.progress-step').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active','done');
      if (s === step) el.classList.add('active');
      if (s < step)  el.classList.add('done');
    });
  }

  // ── Navegar entre pasos
  function goTo(step) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
    currentStep = step;
    updateProgress(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  
  function setLoading(btnId, spinId, loading) {
    const btn  = document.getElementById(btnId);
    const spin = document.getElementById(spinId);
    btn.disabled = loading;
    spin.style.display = loading ? 'block' : 'none';
    btn.querySelector('span.btn-text') && (btn.querySelector('span.btn-text').style.display = loading ? 'none' : '');
  }

  // ── Muestra alerta de error en un paso
  function showAlert(step, msg) {
    const al  = document.getElementById('alert' + step);
    const msg_el = document.getElementById('alertMsg' + step);
    msg_el.textContent = msg;
    al.classList.add('show');
    setTimeout(() => al.classList.remove('show'), 5000);
  }

  // ── Llama al backend PHP
  async function callBackend(paso, body) {
    try {
      const res = await fetch('guardar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paso, ...body })
      });
      return await res.json();
    } catch (e) {
      return { ok: false, msg: 'Error de red. Verifica tu conexión.' };
    }
  }

  // ── PASO 1: Validar y enviar
  async function submitStep1() {
    const nombre = document.getElementById('nombre').value.trim();
    const email  = document.getElementById('email').value.trim();
    const edad   = parseInt(document.getElementById('edad').value);

    // Limpiar errores
    ['nombre','email','edad'].forEach(id => {
      document.getElementById('err-'+id).classList.remove('show');
      document.getElementById(id).classList.remove('error');
    });

    let valid = true;
    if (!nombre) {
      document.getElementById('err-nombre').classList.add('show');
      document.getElementById('nombre').classList.add('error');
      valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('err-email').classList.add('show');
      document.getElementById('email').classList.add('error');
      valid = false;
    }
    if (!edad || edad < 10 || edad > 120) {
      document.getElementById('err-edad').classList.add('show');
      document.getElementById('edad').classList.add('error');
      valid = false;
    }
    if (!valid) return;

    setLoading('btn1','spin1', true);
    const res = await callBackend(1, { nombre, email, edad });
    setLoading('btn1','spin1', false);

    if (res.ok) {
      idUsuario = res.id_usuario;
      goTo(2);
    } else {
      showAlert(1, res.msg || 'Error al guardar tus datos.');
    }
  }

  // ── PASO 2: Validar y enviar preferencias
  async function submitStep2() {
    const tipo_contenido    = document.querySelector('input[name="tipo_contenido"]:checked')?.value;
    const nivel_complejidad = document.querySelector('input[name="nivel_complejidad"]:checked')?.value;
    const modo_visual       = document.querySelector('input[name="modo_visual"]:checked')?.value;

    if (!tipo_contenido || !nivel_complejidad || !modo_visual) {
      showAlert(2, 'Por favor selecciona una opción en cada pregunta.');
      return;
    }

    setLoading('btn2','spin2', true);
    const res = await callBackend(2, {
      id_usuario: idUsuario,
      tipo_contenido, nivel_complejidad, modo_visual
    });
    setLoading('btn2','spin2', false);

    if (res.ok) {
      goTo(3);
    } else {
      showAlert(2, res.msg || 'Error al guardar tus preferencias.');
    }
  }

  // ── PASO 3: Validar y enviar uso de IA
  async function submitStep3() {
    const herramienta_ia     = document.getElementById('herramienta_ia').value;
    const cantidad_preguntas = parseInt(document.getElementById('cantidad_preguntas').value);
    const minutos_uso        = parseInt(document.getElementById('minutos_uso').value);
    const modo_visual        = document.querySelector('input[name="modo_visual"]:checked')?.value || 'balanced';

    document.getElementById('err-herramienta').classList.remove('show');
    document.getElementById('herramienta_ia').classList.remove('error');

    if (!herramienta_ia) {
      document.getElementById('err-herramienta').classList.add('show');
      document.getElementById('herramienta_ia').classList.add('error');
      return;
    }

    setLoading('btn3','spin3', true);
    const res = await callBackend(3, {
      id_usuario: idUsuario,
      herramienta_ia, cantidad_preguntas, minutos_uso, modo_vista: modo_visual
    });

    if (res.ok) {
      // Paso 4: cerrar sesión
      await callBackend(4, { id_usuario: idUsuario });
    }

    setLoading('btn3','spin3', false);

    if (res.ok) {
      showSuccess(cantidad_preguntas);
    } else {
      showAlert(3, res.msg || 'Error al guardar tus datos de uso.');
    }
  }

  // ── Mostrar pantalla de éxito
  function showSuccess(preguntas) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.getElementById('stepSuccess').classList.add('active');
    document.getElementById('formProgress').style.display = 'none';

    // Calcular agua estimada
    const ml = Math.round((preguntas / 20) * 500);
    const txt = ml >= 1000
      ? (ml / 1000).toFixed(1) + ' litros'
      : ml + ' ml';
    document.getElementById('successWater').textContent = '🌊 Tu huella diaria: ' + txt;
    document.getElementById('aguaEstimada').textContent = txt;

    updateProgress(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Actualizar agua estimada en tiempo real (paso 3)
  function updateAguaEstimada() {
    const preguntas = parseInt(document.getElementById('cantidad_preguntas')?.value || 0);
    const ml = Math.round((preguntas / 20) * 500);
    const txt = ml >= 1000
      ? (ml / 1000).toFixed(1) + ' litros'
      : ml + ' ml';
    const el = document.getElementById('aguaEstimada');
    if (el) el.textContent = txt;
  }

  document.getElementById('cantidad_preguntas')?.addEventListener('input', updateAguaEstimada);

  // Init
  updateProgress(1);