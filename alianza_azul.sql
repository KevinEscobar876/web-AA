-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-03-2026 a las 16:52:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `alianza_azul`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preferencia`
--

CREATE TABLE `preferencia` (
  `id_preferencia` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo_contenido` enum('texto','imagenes','mixto') DEFAULT 'mixto',
  `nivel_complejidad` enum('simple','avanzado') DEFAULT 'simple',
  `modo_visual` enum('balanced','infographic','text') DEFAULT 'balanced',
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `preferencia`
--

INSERT INTO `preferencia` (`id_preferencia`, `id_usuario`, `tipo_contenido`, `nivel_complejidad`, `modo_visual`, `fecha_actualizacion`) VALUES
(1, 1, 'texto', 'avanzado', 'infographic', '2026-03-23 23:05:00'),
(2, 2, 'texto', 'avanzado', 'infographic', '2026-03-23 23:06:55'),
(3, 3, 'texto', 'avanzado', 'text', '2026-03-26 10:24:38'),
(4, 4, 'texto', 'simple', 'infographic', '2026-03-26 10:35:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesion`
--

CREATE TABLE `sesion` (
  `id_sesion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_fin` datetime DEFAULT NULL,
  `modo_vista` enum('balanced','infographic','text') DEFAULT NULL,
  `ip_origen` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sesion`
--

INSERT INTO `sesion` (`id_sesion`, `id_usuario`, `fecha_inicio`, `fecha_fin`, `modo_vista`, `ip_origen`) VALUES
(1, 1, '2026-03-23 23:04:55', '2026-03-23 23:05:11', 'infographic', '::1'),
(2, 2, '2026-03-23 23:06:50', '2026-03-23 23:07:11', 'infographic', '::1'),
(3, 3, '2026-03-26 10:24:22', '2026-03-26 10:24:58', 'text', '::1'),
(4, 4, '2026-03-26 10:35:26', '2026-03-26 10:35:41', 'infographic', '::1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `uso_ia`
--

CREATE TABLE `uso_ia` (
  `id_registro` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `cantidad_preguntas` smallint(5) UNSIGNED DEFAULT 0,
  `herramienta_ia` varchar(50) DEFAULT NULL,
  `minutos_uso` smallint(5) UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `uso_ia`
--

INSERT INTO `uso_ia` (`id_registro`, `id_usuario`, `fecha`, `cantidad_preguntas`, `herramienta_ia`, `minutos_uso`) VALUES
(1, 1, '2026-03-24', 45, 'ChatGPT', 110),
(2, 2, '2026-03-24', 125, 'Copilot', 450),
(3, 3, '2026-03-26', 140, 'Gemini', 230),
(4, 4, '2026-03-26', 125, 'Gemini', 215);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `edad` tinyint(3) UNSIGNED NOT NULL,
  `rango_edad` enum('menor_18','18_30','mayor_30') GENERATED ALWAYS AS (case when `edad` < 18 then 'menor_18' when `edad` <= 30 then '18_30' else 'mayor_30' end) STORED,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `email`, `edad`, `fecha_registro`) VALUES
(1, 'hola', 'holasoyuntester@gmail.com', 12, '2026-03-23 23:04:55'),
(2, 'hjk', 'holasoyuntester7878@gmail.com', 67, '2026-03-23 23:06:50'),
(3, 'pepito suarez', 'soypepito123456@gmail.com', 67, '2026-03-26 10:24:22'),
(4, 'holahola', 'holaholahola@yahoo.es', 24, '2026-03-26 10:35:26');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `preferencia`
--
ALTER TABLE `preferencia`
  ADD PRIMARY KEY (`id_preferencia`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `sesion`
--
ALTER TABLE `sesion`
  ADD PRIMARY KEY (`id_sesion`),
  ADD KEY `fk_sesion_usuario` (`id_usuario`);

--
-- Indices de la tabla `uso_ia`
--
ALTER TABLE `uso_ia`
  ADD PRIMARY KEY (`id_registro`),
  ADD UNIQUE KEY `uq_usuario_fecha_tool` (`id_usuario`,`fecha`,`herramienta_ia`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `preferencia`
--
ALTER TABLE `preferencia`
  MODIFY `id_preferencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sesion`
--
ALTER TABLE `sesion`
  MODIFY `id_sesion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `uso_ia`
--
ALTER TABLE `uso_ia`
  MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `preferencia`
--
ALTER TABLE `preferencia`
  ADD CONSTRAINT `fk_pref_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sesion`
--
ALTER TABLE `sesion`
  ADD CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `uso_ia`
--
ALTER TABLE `uso_ia`
  ADD CONSTRAINT `fk_uso_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
