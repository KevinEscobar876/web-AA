<<?php
// ══════════════════════════════════════════
//  ALIANZA AZUL — Formulario multi-paso
//  Lógica 100% PHP con sesiones
// ══════════════════════════════════════════
session_start();
require_once 'conexion.php';

// ── Inicializar sesión de formulario
if (!isset($_SESSION['form_paso'])) {
    $_SESSION['form_paso']   = 1;
    $_SESSION['form_data']   = [];
    $_SESSION['form_errors'] = [];
    $_SESSION['id_usuario']  = null;
}

$paso    = $_SESSION['form_paso'];
$errores = $_SESSION['form_errors'];
$datos   = $_SESSION['form_data'];
$_SESSION['form_errors'] = []; // limpiar errores tras mostrarlos

// ══════════════════════════════════════════
//  PROCESAMIENTO POST
// ══════════════════════════════════════════
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $accion = $_POST['accion'] ?? '';

    // ── Volver al paso anterior
    if ($accion === 'anterior') {
        $_SESSION['form_paso'] = max(1, $paso - 1);
        header('Location: formulario.php');
        exit;
    }

    // ── PASO 1: Guardar usuario
    if ($paso === 1 && $accion === 'continuar') {
        $nombre = trim($_POST['nombre'] ?? '');
        $email  = trim($_POST['email']  ?? '');
        $edad   = intval($_POST['edad'] ?? 0);
        $errors = [];

        if (!$nombre)
            $errors['nombre'] = 'Ingresa tu nombre completo.';
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL))
            $errors['email'] = 'Ingresa un correo electrónico válido.';
        if ($edad < 10 || $edad > 120)
            $errors['edad'] = 'La edad debe estar entre 10 y 120 años.';

        if ($errors) {
            $_SESSION['form_errors']         = $errors;
            $_SESSION['form_data']['nombre'] = $nombre;
            $_SESSION['form_data']['email']  = $email;
            $_SESSION['form_data']['edad']   = $edad;
        } else {
            $conn = getConexion();

            // Verificar email duplicado
            $stmt = $conn->prepare("SELECT id_usuario FROM usuario WHERE email = ?");
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows > 0) {
                $stmt->bind_result($id_existente);
                $stmt->fetch();
                $_SESSION['id_usuario'] = $id_existente;
                $stmt->close();
            } else {
                $stmt->close();
                $ins = $conn->prepare("INSERT INTO usuario (nombre, email, edad) VALUES (?, ?, ?)");
                $ins->bind_param('ssi', $nombre, $email, $edad);
                $ins->execute();
                $_SESSION['id_usuario'] = $ins->insert_id;
                $ins->close();

                // Registrar inicio de sesión
                $ip  = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
                $ses = $conn->prepare("INSERT INTO sesion (id_usuario, ip_origen) VALUES (?, ?)");
                $ses->bind_param('is', $_SESSION['id_usuario'], $ip);
                $ses->execute();
                $ses->close();
            }
            $conn->close();

            $_SESSION['form_data']['nombre'] = $nombre;
            $_SESSION['form_data']['email']  = $email;
            $_SESSION['form_data']['edad']   = $edad;
            $_SESSION['form_paso']           = 2;
        }

        header('Location: formulario.php');
        exit;
    }

    // ── PASO 2: Guardar preferencias
    if ($paso === 2 && $accion === 'continuar') {
        $tipos_ok   = ['texto','imagenes','mixto'];
        $niveles_ok = ['simple','avanzado'];
        $modos_ok   = ['balanced','infographic','text'];
        $errors     = [];

        $tipo  = $_POST['tipo_contenido']    ?? '';
        $nivel = $_POST['nivel_complejidad'] ?? '';
        $modo  = $_POST['modo_visual']       ?? '';

        if (!in_array($tipo,  $tipos_ok))   $errors['tipo_contenido']    = 'Selecciona un tipo de contenido.';
        if (!in_array($nivel, $niveles_ok)) $errors['nivel_complejidad'] = 'Selecciona un nivel de complejidad.';
        if (!in_array($modo,  $modos_ok))   $errors['modo_visual']       = 'Selecciona una vista preferida.';

        if ($errors) {
            $_SESSION['form_errors']                      = $errors;
            $_SESSION['form_data']['tipo_contenido']    = $tipo;
            $_SESSION['form_data']['nivel_complejidad'] = $nivel;
            $_SESSION['form_data']['modo_visual']       = $modo;
        } else {
            $id_u = $_SESSION['id_usuario'];
            $conn = getConexion();
            $stmt = $conn->prepare(
                "INSERT INTO preferencia (id_usuario, tipo_contenido, nivel_complejidad, modo_visual)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   tipo_contenido    = VALUES(tipo_contenido),
                   nivel_complejidad = VALUES(nivel_complejidad),
                   modo_visual       = VALUES(modo_visual)"
            );
            $stmt->bind_param('isss', $id_u, $tipo, $nivel, $modo);
            $stmt->execute();
            $stmt->close();
            $conn->close();

            $_SESSION['form_data']['tipo_contenido']    = $tipo;
            $_SESSION['form_data']['nivel_complejidad'] = $nivel;
            $_SESSION['form_data']['modo_visual']       = $modo;
            $_SESSION['form_paso']                      = 3;
        }

        header('Location: formulario.php');
        exit;
    }

    // ── PASO 3: Guardar uso de IA
    if ($paso === 3 && $accion === 'enviar') {
        $herramientas_ok = ['ChatGPT','Claude','Gemini','Copilot','Llama','Midjourney','Stable Diffusion','Otra'];
        $errors          = [];

        $herramienta = trim($_POST['herramienta_ia']      ?? '');
        $preguntas   = intval($_POST['cantidad_preguntas'] ?? 0);
        $minutos     = intval($_POST['minutos_uso']        ?? 0);

        if (!in_array($herramienta, $herramientas_ok))
            $errors['herramienta_ia'] = 'Selecciona una herramienta de IA.';
        if ($preguntas < 0 || $preguntas > 32767) $preguntas = 0;
        if ($minutos   < 0 || $minutos   > 32767) $minutos   = 0;

        if ($errors) {
            $_SESSION['form_errors']                         = $errors;
            $_SESSION['form_data']['herramienta_ia']         = $herramienta;
            $_SESSION['form_data']['cantidad_preguntas']     = $preguntas;
            $_SESSION['form_data']['minutos_uso']            = $minutos;
        } else {
            $id_u  = $_SESSION['id_usuario'];
            $fecha = date('Y-m-d');
            $conn  = getConexion();

            // Guardar uso_ia
            $stmt = $conn->prepare(
                "INSERT INTO uso_ia (id_usuario, fecha, herramienta_ia, cantidad_preguntas, minutos_uso)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   cantidad_preguntas = VALUES(cantidad_preguntas),
                   minutos_uso        = VALUES(minutos_uso)"
            );
            $stmt->bind_param('issii', $id_u, $fecha, $herramienta, $preguntas, $minutos);
            $stmt->execute();
            $stmt->close();

            // Actualizar modo_vista en sesión activa
            $modo = $_SESSION['form_data']['modo_visual'] ?? 'balanced';
            $upd  = $conn->prepare(
                "UPDATE sesion SET modo_vista = ?
                 WHERE id_usuario = ? AND fecha_fin IS NULL
                 ORDER BY fecha_inicio DESC LIMIT 1"
            );
            $upd->bind_param('si', $modo, $id_u);
            $upd->execute();
            $upd->close();

            // Cerrar sesión
            $cls = $conn->prepare(
                "UPDATE sesion SET fecha_fin = NOW()
                 WHERE id_usuario = ? AND fecha_fin IS NULL
                 ORDER BY fecha_inicio DESC LIMIT 1"
            );
            $cls->bind_param('i', $id_u);
            $cls->execute();
            $cls->close();
            $conn->close();

            $_SESSION['form_data']['herramienta_ia']     = $herramienta;
            $_SESSION['form_data']['cantidad_preguntas'] = $preguntas;
            $_SESSION['form_data']['minutos_uso']        = $minutos;
            $_SESSION['form_paso']                       = 4;
        }

        header('Location: formulario.php');
        exit;
    }

    // ── Reiniciar desde pantalla de éxito
    if ($accion === 'reiniciar') {
        session_destroy();
        header('Location: formulario.php');
        exit;
    }
}

// ══════════════════════════════════════════
//  CÁLCULO DE HUELLA HÍDRICA (PHP puro)
//  Fuente: Li et al. 2023 · IEA 2024
// ══════════════════════════════════════════
$modelFactors = [
    'ChatGPT'          => ['mlPerQuery' => 10,  'mlPerMin' => 3.5, 'label' => 'GPT-4',        'size' => 'Grande'],
    'Claude'           => ['mlPerQuery' => 8,   'mlPerMin' => 3.0, 'label' => 'Claude 3',      'size' => 'Grande'],
    'Gemini'           => ['mlPerQuery' => 9,   'mlPerMin' => 3.2, 'label' => 'Gemini Pro',    'size' => 'Grande'],
    'Copilot'          => ['mlPerQuery' => 10,  'mlPerMin' => 3.5, 'label' => 'GPT-4 base',    'size' => 'Grande'],
    'Llama'            => ['mlPerQuery' => 4,   'mlPerMin' => 1.5, 'label' => 'Llama 3',       'size' => 'Mediano'],
    'Midjourney'       => ['mlPerQuery' => 50,  'mlPerMin' => 8.0, 'label' => 'Imagen IA',     'size' => 'Muy alto'],
    'Stable Diffusion' => ['mlPerQuery' => 35,  'mlPerMin' => 6.0, 'label' => 'Difusión',      'size' => 'Alto'],
    'Otra'             => ['mlPerQuery' => 7,   'mlPerMin' => 2.5, 'label' => 'Desconocido',   'size' => 'Variable'],
];

function calcularAgua($herramienta, $preguntas, $minutos, $factors) {
    $f           = $factors[$herramienta] ?? $factors['Otra'];
    $mlConsultas = $preguntas * $f['mlPerQuery'];
    $mlTiempo    = $minutos   * $f['mlPerMin'];
    $mlTotal     = $mlConsultas + $mlTiempo;
    $impacto     = $mlTotal < 200  ? 'Muy bajo 🟢' :
                  ($mlTotal < 600  ? 'Bajo 🟡'      :
                  ($mlTotal < 1500 ? 'Moderado 🟠'  :
                  ($mlTotal < 3000 ? 'Alto 🔴'       : 'Muy alto 🔴🔴')));
    return [
        'consultas' => $mlConsultas,
        'tiempo'    => $mlTiempo,
        'total'     => $mlTotal,
        'label'     => $f['label'] . ' (' . $f['size'] . ')',
        'impacto'   => $impacto,
    ];
}

function formatMl($ml) {
    return $ml >= 1000
        ? number_format($ml / 1000, 2) . ' L'
        : round($ml) . ' ml';
}

// Calcular huella solo en paso 4
$agua = null;
if ($paso === 4) {
    $agua = calcularAgua(
        $datos['herramienta_ia']         ?? 'Otra',
        intval($datos['cantidad_preguntas'] ?? 0),
        intval($datos['minutos_uso']        ?? 0),
        $modelFactors
    );
}

// Helpers de render
function err($campo, $errores) {
    if (isset($errores[$campo]))
        echo '<div class="field-error show">' . htmlspecialchars($errores[$campo]) . '</div>';
}
function val($campo, $datos, $default = '') {
    return htmlspecialchars($datos[$campo] ?? $default);
}
function sel($campo, $valor, $datos) {
    return ($datos[$campo] ?? '') === $valor ? 'checked' : '';
}
?>
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

  <div class="cursor" id="cursor"></div>
  <div class="cursor-dot" id="cursorDot"></div>

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

    <!-- BARRA DE PROGRESO -->
    <?php if ($paso < 4): ?>
    <div class="form-progress">
      <div class="form-progress-steps">
        <div class="form-progress-line" style="width:<?= (($paso-1)/3)*100 ?>%"></div>
        <?php
        $labels = ['Tu Perfil','Preferencias','Uso de IA','Completado'];
        for ($i = 1; $i <= 4; $i++):
            $cls = $i === $paso ? 'active' : ($i < $paso ? 'done' : '');
        ?>
        <div class="progress-step <?= $cls ?>">
          <div class="progress-step-dot"><?= $i < $paso ? '✓' : $i ?></div>
          <span class="progress-step-label"><?= $labels[$i-1] ?></span>
        </div>
        <?php endfor; ?>
      </div>
    </div>
    <?php endif; ?>

    <div class="form-card">

    <?php if ($paso === 1): ?>
    <!-- ══ PASO 1 ══ -->
    <form method="POST" action="formulario.php" novalidate>
      <div class="step-header">
        <span class="step-eyebrow">Paso 1 de 3 · Tu identidad</span>
        <h2>Cuéntanos<br>sobre <em>ti</em></h2>
        <p>Estos datos nos ayudan a personalizar tu experiencia y entender mejor quién se preocupa por el impacto hídrico de la IA.</p>
      </div>

      <?php if ($errores): ?>
      <div class="form-alert error show"><span>⚠</span><span>Corrige los errores marcados en rojo.</span></div>
      <?php endif; ?>

      <div class="field-row">
        <div class="field-group">
          <label for="nombre">Nombre completo <span class="req">*</span></label>
          <input type="text" id="nombre" name="nombre"
            class="field-input <?= isset($errores['nombre']) ? 'error' : '' ?>"
            placeholder="Tu nombre" maxlength="100" autocomplete="name"
            value="<?= val('nombre',$datos) ?>">
          <?php err('nombre',$errores); ?>
        </div>
        <div class="field-group">
          <label for="edad">Edad <span class="req">*</span></label>
          <input type="number" id="edad" name="edad"
            class="field-input <?= isset($errores['edad']) ? 'error' : '' ?>"
            placeholder="25" min="10" max="120"
            value="<?= val('edad',$datos) ?>">
          <?php err('edad',$errores); ?>
        </div>
      </div>

      <div class="field-group">
        <label for="email">Correo electrónico <span class="req">*</span></label>
        <input type="email" id="email" name="email"
          class="field-input <?= isset($errores['email']) ? 'error' : '' ?>"
          placeholder="tucorreo@email.com" maxlength="150" autocomplete="email"
          value="<?= val('email',$datos) ?>">
        <?php err('email',$errores); ?>
        <p class="field-hint">Nunca compartiremos tu correo. Solo sirve para identificar tu perfil.</p>
      </div>

      <div class="form-nav">
        <button type="submit" name="accion" value="continuar" class="btn-next">Continuar →</button>
      </div>
    </form>

    <?php elseif ($paso === 2): ?>
    <!-- ══ PASO 2 ══ -->
    <form method="POST" action="formulario.php">
      <div class="step-header">
        <span class="step-eyebrow">Paso 2 de 3 · Tus preferencias</span>
        <h2>¿Cómo prefieres<br><em>explorar</em>?</h2>
        <p>Personaliza cómo quieres recibir la información sobre el impacto hídrico de la IA.</p>
      </div>

      <?php if ($errores): ?>
      <div class="form-alert error show"><span>⚠</span><span>Selecciona una opción en cada pregunta.</span></div>
      <?php endif; ?>

      <div class="field-group">
        <label>Tipo de contenido preferido <span class="req">*</span></label>
        <?php err('tipo_contenido',$errores); ?>
        <div class="option-grid cols-3">
          <div class="option-card">
            <input type="radio" name="tipo_contenido" id="tc_texto" value="texto" <?= sel('tipo_contenido','texto',$datos) ?>>
            <label for="tc_texto"><span class="opt-icon">📖</span><span class="opt-name">Texto</span><span class="opt-desc">Artículos y análisis</span></label>
          </div>
          <div class="option-card">
            <input type="radio" name="tipo_contenido" id="tc_imagenes" value="imagenes" <?= sel('tipo_contenido','imagenes',$datos) ?>>
            <label for="tc_imagenes"><span class="opt-icon">🖼️</span><span class="opt-name">Visual</span><span class="opt-desc">Infografías e imágenes</span></label>
          </div>
          <div class="option-card">
            <input type="radio" name="tipo_contenido" id="tc_mixto" value="mixto" <?= sel('tipo_contenido','mixto',$datos) ?: 'checked' ?>>
            <label for="tc_mixto"><span class="opt-icon">⚖️</span><span class="opt-name">Mixto</span><span class="opt-desc">Texto e imágenes</span></label>
          </div>
        </div>
      </div>

      <div class="field-group">
        <label>Nivel de complejidad <span class="req">*</span></label>
        <?php err('nivel_complejidad',$errores); ?>
        <div class="option-grid cols-2">
          <div class="option-card">
            <input type="radio" name="nivel_complejidad" id="nc_simple" value="simple" <?= sel('nivel_complejidad','simple',$datos) ?: 'checked' ?>>
            <label for="nc_simple"><span class="opt-icon">🌱</span><span class="opt-name">Simple</span><span class="opt-desc">Lenguaje claro y directo</span></label>
          </div>
          <div class="option-card">
            <input type="radio" name="nivel_complejidad" id="nc_avanzado" value="avanzado" <?= sel('nivel_complejidad','avanzado',$datos) ?>>
            <label for="nc_avanzado"><span class="opt-icon">🔬</span><span class="opt-name">Avanzado</span><span class="opt-desc">Datos técnicos y fuentes</span></label>
          </div>
        </div>
      </div>

      <div class="field-group">
        <label>Vista preferida de la campaña <span class="req">*</span></label>
        <?php err('modo_visual',$errores); ?>
        <div class="option-grid cols-3">
          <div class="option-card">
            <input type="radio" name="modo_visual" id="mv_balanced" value="balanced" <?= sel('modo_visual','balanced',$datos) ?: 'checked' ?>>
            <label for="mv_balanced"><span class="opt-icon">⚖️</span><span class="opt-name">Balanceado</span></label>
          </div>
          <div class="option-card">
            <input type="radio" name="modo_visual" id="mv_infographic" value="infographic" <?= sel('modo_visual','infographic',$datos) ?>>
            <label for="mv_infographic"><span class="opt-icon">📊</span><span class="opt-name">Infografía</span></label>
          </div>
          <div class="option-card">
            <input type="radio" name="modo_visual" id="mv_text" value="text" <?= sel('modo_visual','text',$datos) ?>>
            <label for="mv_text"><span class="opt-icon">📄</span><span class="opt-name">Lectura</span></label>
          </div>
        </div>
      </div>

      <div class="form-nav">
        <button type="submit" name="accion" value="anterior" class="btn-prev">← Anterior</button>
        <button type="submit" name="accion" value="continuar" class="btn-next">Continuar →</button>
      </div>
    </form>

    <?php elseif ($paso === 3): ?>
    <!-- ══ PASO 3 ══ -->
    <form method="POST" action="formulario.php">
      <div class="step-header">
        <span class="step-eyebrow">Paso 3 de 3 · Tu uso de IA</span>
        <h2>Tu huella<br><em>digital</em></h2>
        <p>Cuéntanos cómo usas la IA hoy. Con estos datos calcularemos cuánta agua consume tu actividad diaria.</p>
      </div>

      <?php if ($errores): ?>
      <div class="form-alert error show"><span>⚠</span><span>Corrige los errores marcados.</span></div>
      <?php endif; ?>

      <div class="field-group">
        <label for="herramienta_ia">¿Qué herramienta de IA usas principalmente? <span class="req">*</span></label>
        <select id="herramienta_ia" name="herramienta_ia"
          class="field-input <?= isset($errores['herramienta_ia']) ? 'error' : '' ?>">
          <option value="" disabled <?= !isset($datos['herramienta_ia']) ? 'selected' : '' ?>>Selecciona una herramienta</option>
          <?php
          $tools = [
            'ChatGPT'          => 'ChatGPT (OpenAI)',
            'Claude'           => 'Claude (Anthropic)',
            'Gemini'           => 'Gemini (Google)',
            'Copilot'          => 'Copilot (Microsoft)',
            'Llama'            => 'Llama (Meta)',
            'Midjourney'       => 'Midjourney (imágenes)',
            'Stable Diffusion' => 'Stable Diffusion',
            'Otra'             => 'Otra herramienta',
          ];
          foreach ($tools as $v => $l):
              $s = ($datos['herramienta_ia'] ?? '') === $v ? 'selected' : '';
          ?>
          <option value="<?= $v ?>" <?= $s ?>><?= $l ?></option>
          <?php endforeach; ?>
        </select>
        <?php err('herramienta_ia',$errores); ?>
      </div>

      <div class="field-group">
        <label for="cantidad_preguntas">¿Cuántas consultas haces al día aproximadamente?</label>
        <div class="range-value">
          <span id="preguntasVal"><?= val('cantidad_preguntas',$datos,'10') ?></span> <span>preguntas</span>
        </div>
        <div class="range-wrap">
          <input type="range" class="field-range" id="cantidad_preguntas" name="cantidad_preguntas"
            min="0" max="200" step="5" value="<?= val('cantidad_preguntas',$datos,'10') ?>"
            oninput="document.getElementById('preguntasVal').textContent=this.value">
        </div>
        <div class="range-labels"><span>0</span><span>50</span><span>100</span><span>150</span><span>200+</span></div>
        <p class="field-hint">💧 El consumo varía según el modelo: GPT-4 ~10ml/consulta, modelos de imagen hasta 50ml.</p>
      </div>

      <div class="field-group">
        <label for="minutos_uso">¿Cuántos minutos al día usas herramientas de IA?</label>
        <div class="range-value">
          <span id="minutosVal"><?= val('minutos_uso',$datos,'30') ?></span> <span>min</span>
        </div>
        <div class="range-wrap">
          <input type="range" class="field-range" id="minutos_uso" name="minutos_uso"
            min="0" max="480" step="5" value="<?= val('minutos_uso',$datos,'30') ?>"
            oninput="document.getElementById('minutosVal').textContent=this.value">
        </div>
        <div class="range-labels"><span>0</span><span>2h</span><span>4h</span><span>6h</span><span>8h+</span></div>
      </div>

      <div style="background:rgba(34,211,238,0.05);border:1px solid rgba(34,211,238,0.15);
                  border-radius:12px;padding:1rem 1.2rem;margin-bottom:1.5rem;text-align:center;">
        <p style="font-size:.72rem;letter-spacing:2px;text-transform:uppercase;
                  color:rgba(34,211,238,0.5);margin-bottom:.4rem;">Tu consumo estimado</p>
        <p style="font-size:.85rem;color:rgba(240,249,255,0.5);line-height:1.6;">
          Se calculará al enviar el formulario basándose en el modelo, consultas y tiempo de uso.
        </p>
        <p style="font-size:.65rem;color:rgba(240,249,255,0.2);margin-top:.5rem;">
          Fuente: Li et al. 2023 (UC Riverside) · IEA 2024
        </p>
      </div>

      <div class="form-nav">
        <button type="submit" name="accion" value="anterior" class="btn-prev">← Anterior</button>
        <button type="submit" name="accion" value="enviar" class="btn-submit">Enviar mi perfil</button>
      </div>
    </form>

    <?php elseif ($paso === 4): ?>
    <!-- ══ PASO 4: ÉXITO ══ -->
    <div class="form-success active">
      <div class="success-icon">💧</div>
      <div class="success-title">¡Gracias por<br><em>unirte</em>!</div>
      <p class="success-body">
        Tu perfil ha sido registrado. Con esta información ayudas a visibilizar el impacto hídrico real de la inteligencia artificial.
      </p>

      <div style="background:rgba(34,211,238,0.05);border:1px solid rgba(34,211,238,0.15);
                  border-radius:16px;padding:1.5rem;margin-bottom:2rem;text-align:left;">
        <p style="font-size:.7rem;letter-spacing:2px;text-transform:uppercase;
                  color:rgba(34,211,238,0.5);text-align:center;margin-bottom:1rem;">Tu huella hídrica diaria</p>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:3rem;color:var(--cyan);
                    text-shadow:0 0 20px rgba(34,211,238,0.4);text-align:center;margin-bottom:.3rem;">
          <?= formatMl($agua['total']) ?>
        </div>
        <p style="font-size:.68rem;color:rgba(240,249,255,0.3);text-align:center;margin-bottom:1.2rem;">total combinado</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;">
          <div style="background:rgba(3,11,20,0.4);border-radius:8px;padding:.7rem .9rem;">
            <div style="font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(34,211,238,0.4);margin-bottom:.2rem;">Por consultas</div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:var(--white);"><?= formatMl($agua['consultas']) ?></div>
          </div>
          <div style="background:rgba(3,11,20,0.4);border-radius:8px;padding:.7rem .9rem;">
            <div style="font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(34,211,238,0.4);margin-bottom:.2rem;">Por tiempo activo</div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:var(--white);"><?= formatMl($agua['tiempo']) ?></div>
          </div>
          <div style="background:rgba(3,11,20,0.4);border-radius:8px;padding:.7rem .9rem;">
            <div style="font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(34,211,238,0.4);margin-bottom:.2rem;">Modelo</div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:.95rem;color:var(--white);"><?= htmlspecialchars($agua['label']) ?></div>
          </div>
          <div style="background:rgba(3,11,20,0.4);border-radius:8px;padding:.7rem .9rem;">
            <div style="font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(34,211,238,0.4);margin-bottom:.2rem;">Impacto relativo</div>
            <div style="font-size:.88rem;color:var(--white);"><?= $agua['impacto'] ?></div>
          </div>
        </div>
        <p style="font-size:.65rem;color:rgba(240,249,255,0.2);text-align:center;margin-top:.8rem;">
          Fuente: Li et al. 2023 (UC Riverside) · IEA 2024
        </p>
      </div>

      <div class="btn-group" style="justify-content:center;flex-direction:column;align-items:center;gap:1rem;">
        <a href="index.html" class="btn btn-primary">Explorar la campaña</a>
        <a href="index.html#accion" class="btn btn-ghost">Compartir el mensaje</a>
        <form method="POST" action="formulario.php" style="margin:0;">
          <button type="submit" name="accion" value="reiniciar"
            style="background:none;border:none;color:rgba(240,249,255,0.25);font-size:.72rem;
                   letter-spacing:1px;cursor:pointer;text-decoration:underline;font-family:'DM Sans',sans-serif;">
            Registrar otro perfil
          </button>
        </form>
      </div>
    </div>
    <?php endif; ?>

    </div><!-- /form-card -->
  </div><!-- /form-page -->

  <script src="script.js"></script>
</body>
</html>

