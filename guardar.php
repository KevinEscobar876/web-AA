<?php
// ══════════════════════════════════════════
//  ALIANZA AZUL — Procesador del formulario
//  Recibe JSON por POST, guarda en BD,
//  devuelve JSON con ok/msg/id
// ══════════════════════════════════════════

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

// Leer body JSON
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

$paso = intval($data['paso'] ?? 0);

switch ($paso) {

    // ── PASO 1: Registrar usuario ──────────────────────────
    case 1:
        $nombre = trim($data['nombre'] ?? '');
        $email  = trim($data['email']  ?? '');
        $edad   = intval($data['edad'] ?? 0);

        // Validaciones
        if (!$nombre || !$email || !$edad) {
            echo json_encode(['ok'=>false,'msg'=>'Completa todos los campos obligatorios.']);
            exit;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['ok'=>false,'msg'=>'El correo electrónico no es válido.']);
            exit;
        }
        if ($edad < 10 || $edad > 120) {
            echo json_encode(['ok'=>false,'msg'=>'La edad debe estar entre 10 y 120 años.']);
            exit;
        }

        $conn = getConexion();

        // Verificar si el email ya existe
        $check = $conn->prepare("SELECT id_usuario FROM usuario WHERE email = ?");
        $check->bind_param('s', $email);
        $check->execute();
        $check->store_result();

        if ($check->num_rows > 0) {
            // Ya existe: devolver su id para continuar
            $check->bind_result($id_existente);
            $check->fetch();
            $check->close();
            $conn->close();
            echo json_encode(['ok'=>true,'id_usuario'=>$id_existente,'nuevo'=>false,
                              'msg'=>'¡Bienvenido de nuevo! Continúa completando tu perfil.']);
            exit;
        }
        $check->close();

        // Insertar nuevo usuario
        $stmt = $conn->prepare(
            "INSERT INTO usuario (nombre, email, edad) VALUES (?, ?, ?)"
        );
        $stmt->bind_param('ssi', $nombre, $email, $edad);

        if ($stmt->execute()) {
            $id = $stmt->insert_id;
            $stmt->close();

            // Registrar inicio de sesión automáticamente
            $ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
            $stmt2 = $conn->prepare(
                "INSERT INTO sesion (id_usuario, ip_origen) VALUES (?, ?)"
            );
            $stmt2->bind_param('is', $id, $ip);
            $stmt2->execute();
            $stmt2->close();

            $conn->close();
            echo json_encode(['ok'=>true,'id_usuario'=>$id,'nuevo'=>true,
                              'msg'=>'¡Usuario registrado correctamente!']);
        } else {
            $conn->close();
            echo json_encode(['ok'=>false,'msg'=>'Error al guardar: '.$stmt->error]);
        }
        break;

    // ── PASO 2: Preferencias ──────────────────────────────
    case 2:
        $id_usuario       = intval($data['id_usuario']       ?? 0);
        $tipo_contenido   = $data['tipo_contenido']          ?? 'mixto';
        $nivel_complejidad= $data['nivel_complejidad']       ?? 'simple';
        $modo_visual      = $data['modo_visual']             ?? 'balanced';

        $tipos_ok  = ['texto','imagenes','mixto'];
        $niveles_ok= ['simple','avanzado'];
        $modos_ok  = ['balanced','infographic','text'];

        if (!$id_usuario) {
            echo json_encode(['ok'=>false,'msg'=>'Sesión inválida. Reinicia el formulario.']);
            exit;
        }
        if (!in_array($tipo_contenido,    $tipos_ok))   $tipo_contenido    = 'mixto';
        if (!in_array($nivel_complejidad, $niveles_ok)) $nivel_complejidad = 'simple';
        if (!in_array($modo_visual,       $modos_ok))   $modo_visual       = 'balanced';

        $conn = getConexion();

        // INSERT OR UPDATE (el usuario puede tener solo un registro de preferencias)
        $stmt = $conn->prepare(
            "INSERT INTO preferencia (id_usuario, tipo_contenido, nivel_complejidad, modo_visual)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               tipo_contenido    = VALUES(tipo_contenido),
               nivel_complejidad = VALUES(nivel_complejidad),
               modo_visual       = VALUES(modo_visual)"
        );
        $stmt->bind_param('isss', $id_usuario, $tipo_contenido, $nivel_complejidad, $modo_visual);

        if ($stmt->execute()) {
            $stmt->close(); $conn->close();
            echo json_encode(['ok'=>true,'msg'=>'Preferencias guardadas.']);
        } else {
            $err = $stmt->error; $stmt->close(); $conn->close();
            echo json_encode(['ok'=>false,'msg'=>'Error: '.$err]);
        }
        break;

    // ── PASO 3: Uso de IA ─────────────────────────────────
    case 3:
        $id_usuario        = intval($data['id_usuario']        ?? 0);
        $herramienta_ia    = trim($data['herramienta_ia']      ?? '');
        $cantidad_preguntas= intval($data['cantidad_preguntas'] ?? 0);
        $minutos_uso       = intval($data['minutos_uso']        ?? 0);

        if (!$id_usuario || !$herramienta_ia) {
            echo json_encode(['ok'=>false,'msg'=>'Datos incompletos en el paso 3.']);
            exit;
        }
        if ($cantidad_preguntas < 0 || $cantidad_preguntas > 32767) $cantidad_preguntas = 0;
        if ($minutos_uso < 0 || $minutos_uso > 32767)               $minutos_uso = 0;

        $conn  = getConexion();
        $fecha = date('Y-m-d');

        $stmt = $conn->prepare(
            "INSERT INTO uso_ia (id_usuario, fecha, herramienta_ia, cantidad_preguntas, minutos_uso)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               cantidad_preguntas = VALUES(cantidad_preguntas),
               minutos_uso        = VALUES(minutos_uso)"
        );
        $stmt->bind_param('issii', $id_usuario, $fecha, $herramienta_ia,
                                    $cantidad_preguntas, $minutos_uso);

        if ($stmt->execute()) {
            $stmt->close();

            // Actualizar modo_vista en la sesión activa
            $modo = $data['modo_vista'] ?? null;
            if ($modo && in_array($modo, ['balanced','infographic','text'])) {
                $s2 = $conn->prepare(
                    "UPDATE sesion SET modo_vista = ?
                     WHERE id_usuario = ? AND fecha_fin IS NULL
                     ORDER BY fecha_inicio DESC LIMIT 1"
                );
                $s2->bind_param('si', $modo, $id_usuario);
                $s2->execute();
                $s2->close();
            }

            $conn->close();
            echo json_encode(['ok'=>true,'msg'=>'Datos de uso de IA guardados.']);
        } else {
            $err = $stmt->error; $stmt->close(); $conn->close();
            echo json_encode(['ok'=>false,'msg'=>'Error: '.$err]);
        }
        break;

    // ── PASO 4 (final): Cerrar sesión ─────────────────────
    case 4:
        $id_usuario = intval($data['id_usuario'] ?? 0);
        if (!$id_usuario) {
            echo json_encode(['ok'=>false,'msg'=>'Sesión inválida.']);
            exit;
        }

        $conn = getConexion();
        $stmt = $conn->prepare(
            "UPDATE sesion SET fecha_fin = NOW()
             WHERE id_usuario = ? AND fecha_fin IS NULL
             ORDER BY fecha_inicio DESC LIMIT 1"
        );
        $stmt->bind_param('i', $id_usuario);
        $stmt->execute();
        $stmt->close();
        $conn->close();

        echo json_encode(['ok'=>true,'msg'=>'Formulario completado correctamente.']);
        break;

    default:
        echo json_encode(['ok'=>false,'msg'=>'Paso no reconocido.']);
}
