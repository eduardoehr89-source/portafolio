# SISTEMA DE DISEÑO GLOBAL - ANTIGRAVITY

**DIRECTIVA PRINCIPAL:**
Este documento contiene las reglas estrictas e inmutables de UI. Lee este documento ANTES de generar cualquier código. Estas reglas deben aplicarse a TODAS las secciones generadas, sin excepciones. Queda estrictamente prohibido el uso de estilos en línea improvisados o variaciones entre secciones. Utiliza clases CSS globales unificadas.

---

## 1. [REGLAS: TOOLTIPS]
Homologación absoluta: Todos los tooltips del proyecto deben seguir este esquema.

**1.1. MODO CLARO (Light Mode):**
* 1.1.1. **Fondo:** Claro (Blanco/Gris muy claro con glassmorphism).
* 1.1.2. **Título:** Negro sólido.
* 1.1.3. **Contenido (Texto):** Gris oscuro (Slate/Gray 600-800).

**1.2. MODO OSCURO (Dark Mode):**
* 1.2.1. **Fondo:** Oscuro (Azul profundo/Negro con glassmorphism).
* 1.2.2. **Título:** Blanco sólido.
* 1.2.3. **Contenido (Texto):** Gris claro (Gray/Slate 300-400).

**1.3. REGLAS DE FORMATO:**
* 1.3.1. **Márgenes Internos:** Padding generoso (mínimo `p-6` o `pb-10` en contenidos largos).
* 1.3.2. **Dimensionamiento Dinámico:** Ancho dinámico según texto, máximo de **650px**.
* 1.3.3. **Espaciado Interno:** PROHIBIDO el uso de saltos de línea dobles o triples entre párrafos. Un solo salto de línea.
* 1.3.4. **Resaltado de Fases:** Sensible a MAYÚSCULAS (**Planeación, Ejecución, Cierre**). Prohibido resaltar en minúsculas.
* 1.3.5. **Proporciones (Regla 4:3):** Prohibido `min-width` > 200px o anchos fijos. Ratio objetivo de **4:3**.
* 1.3.6. **Alineación Obligatoria:** Todo el contenido debe estar **SIEMPRE CENTRADO** (`text-center` e `items-center`).
* 1.3.7. **PROHIBICIÓN DE SCROLL:** El uso de barras de desplazamiento (`overflow: auto/scroll`) queda terminantemente prohibido.
* 1.3.8. **VISIBILIDAD TOTAL:** El tooltip debe expandirse proporcionalmente en ratio 4:3 hasta que el 100% del contenido sea visible.

**1.4. REGLA DE ORO - TOOLTIPS (VISUALIZACIÓN DE RETOS):**
* 1.4.1. **Proporción:** Visual de 4:3 (o 5:3 para textos extensos > 800 caracteres).
* 1.4.2. **Ancho Máximo:** Límite estricto de **650px**.
* 1.4.3. **Alineación:** Texto y títulos de fases estrictamente CENTRADOS.
* 1.4.4. **Minimalismo:** **NO** deben llevar títulos (ej. "RETO: NOMBRE") ni metadatos. Solo las 3 fases.
* 1.4.5. **Interacción:** Aparecen al hacer hover sobre "ver más".
* 1.4.6. **Cero Scroll:** Prohibido ocultar texto tras un scroll. El área debe crecer para mostrar todo el contenido manteniendo la estética horizontal.
* 1.4.7. **Ratio Dinámico:** Para textos muy largos (ej. P41), se debe usar una proporción de **5:3** para maximizar el área de visualización horizontal.

---

## 2. [REGLAS: TIPOGRAFÍA Y CONTRASTE]
Está prohibido el uso de colores con bajo contraste sobre el fondo del tema actual.

**2.1. MODO CLARO (Light Mode):**
* 2.1.1. **PROHIBIDO:** Usar Cyan o Celeste sobre fondo claro.
* 2.1.2. **PERMITIDO:** Solo `sky-950` (principal/etiquetas) y `sky-700` (acentos/interacción).
* 2.1.3. **VERDES:** `green-700` (positivo) y `green-900` (hover).

**2.2. MODO OSCURO (Dark Mode):**
* 2.2.1. **PROHIBIDO:** Usar Azul/Verde oscuro sobre fondo oscuro.
* 2.2.2. **PERMITIDO:** Solo `cyan-400` (técnico/fases) y `blue-400` (roles de sitio).
* 2.2.3. **VERDES:** `green-400` (indicadores) y `green-500` (acentos).
* 2.2.4. **BASE:** Blanco y Gris claro (Slate 300) para texto base.

---

## 3. [REGLAS: NAVEGACIÓN Y MENÚS]
Control de la barra lateral (Sidebar).

**3.1. APERTURA (Sidebar):**
* 3.1.1. **Directiva:** Apertura suave y elegante en todas las secciones.
* 3.1.2. **PROHIBIDO:** Apertura brusca o instantánea.
* 3.1.3. **ESTILO:** Transiciones suaves (0.3s a 0.5s) con `cubic-bezier`.

---

## 4. [REGLAS: PUNTOS PULSANTES]
Homologación de contraste y comportamiento visual.

**4.1. MODO CLARO (Light Mode):**
* 4.1.1. **PROHIBIDO:** Usar Cyan o Verde brillante.
* 4.1.2. **PERMITIDO:** `sky-950` o `sky-700`.
* 4.1.3. **EXCEPCIÓN:** En GALERÍA, el Cyan se permite sobre imágenes si hay contraste.

**4.2. MODO OSCURO (Dark Mode):**
* 4.2.1. **PROHIBIDO:** Usar colores oscuros (Azul/Verde hondo).
* 4.2.2. **PERMITIDO:** Cyan brillante o Verde neón.

**4.3. GENERAL:**
* 4.3.1. **TAMAÑO:** Homogéneo en todas las secciones.
* 4.3.2. **EXCEPCIÓN HOME:** Ligeramente más grandes pero mismo efecto.
* 4.3.3. **EXCEPCIÓN AI:** Puntos simples en IA REVOLUTION.

---

## 5. [REGLAS: ICONOGRAFÍA Y BOTONES DE ACCIÓN]
Botones de Descarga, Temas, Atrás, Adelante, Home.

**5.1. DIRECTIVA:**
* 5.1.1. **Identidad:** Deben ser IDÉNTICOS en todas las secciones.
* 5.1.2. **Fondo:** Prohibido el uso de backgrounds para estos iconos.
* 5.1.3. **Color:** Color Gris en ambos modos para estética técnica.

**5.2. CONTENEDORES (Si aplica):**
* 5.2.1. **Color:** El fondo debe ser el mismo color exacto que el icono.
* 5.2.2. **Transparencia:** Opacidad baja (10% - 20%).
* 5.2.3. **Prohibición:** No mezclar colores distintos entre icono y fondo.

---

## 6. [REGLAS: BARRA DE ESTADO]
Homologación del encabezado en Project Database.

**6.1. COMPONENTES:**
* 6.1.1. **ITEMS:** Cantidad actual (ej: `ITEMS:41`).
* 6.1.2. **VISTA:** Organización visual (GALERÍA, GRUPO, LISTA).
* 6.1.3. **TIPO:** Criterio de filtro (ej: `AÑO`, `TIPOLOGÍA`).
* 6.1.4. **Formato:** MAYÚSCULAS, Fuente Mono, Separadores `|`.

---

## 7. [REGLAS: ANIMACIONES Y GRÁFICAS]
Dinámicas visuales para dashboards técnicos.

**7.1. DIRECTIVAS:**
* 7.1.1. **Llenado:** Barras deben llenarse suavemente desde 0%.
* 7.1.2. **Contadores:** Números deben hacer count-up desde 0.
* 7.1.3. **Duración:** Animación de **3 segundos** (3000ms).
* 7.1.4. **Curva:** Usar `ease-out` o `cubic-bezier`.

---

## 8. [REGLAS: TRANSICIONES Y APERTURAS]
Garantía de fluidez en toda la UI.

**8.1. APLICACIONES:**
* 8.1.1. **Tooltips:** Fade-in/out + Escala (0.95 a 1.0) en **0.2s - 0.3s**.
* 8.1.2. **Modales:** Apertura expansiva y suave en **0.4s**.
* 8.1.3. **Secciones:** Desvanecimiento (fade) entre secciones principales.
* 8.1.4. **PROHIBIDO:** Cambios `display: none/block` sin transiciones de opacidad.

---

## 9. [REGLAS: ESTADO ACTIVO DE BOTONES]
Resalte puramente cromático (Sin fondos).

**9.1. COLORES:**
* 9.1.1. **Modo Oscuro:** Cyan (`text-cyan-400`). Prohibido fondos.
* 9.1.2. **Modo Claro:** Azul (`text-sky-700`). Prohibido fondos/sombras.

---

## 10. [REGLAS: FONDOS (BACKGROUNDS)]
Jerarquía y profundidad visual.

**10.1. MODO OSCURO:**
* 10.1.1. **Base:** Negro Profundo (`#0b1016`).
* 10.1.2. **Primario:** Negro Denso (`#080c10`).
* 10.1.3. **Secundario:** Gris Azulado (`#151b26`).

**10.2. MODO CLARO:**
* 10.2.1. **Base:** Blanco/Gris muy claro (`#ffffff` a `#f8fafc`).
* 10.2.2. **Secundario:** Degradados con sombras suaves (`shadow-md`).

---

## 11. [REGLAS: TABLAS Y LISTAS]
Diseño minimalista sin ruido visual.

**11.1. ENCABEZADOS:**
* 11.1.1. **Estilo:** MAYÚSCULAS y **NEGRITA**.
* 11.1.2. **Color:** Negro (Claro) / Gris claro (Oscuro).

**11.2. DIVISORES:**
* 11.2.1. **Prohibición:** Prohibido líneas divisorias entre filas/columnas.
* 11.2.2. **Hover:** Resalte con fondo gris tenue al pasar el mouse.

**11.3. GESTIÓN DE TEXTO:**
* 11.3.1. **Corto (<= 20 palabras):** Celda debe crecer verticalmente (wrap). Completo siempre.
* 11.3.2. **Largo (> 20 palabras):** Truncado con "ver más" + ToolTip 4:3.

---

## 12. [REGLAS: MODALES DE RESUMEN]
Minimalismo absoluto (Zero Divisions).

**12.1. DIRECTIVA:**
* 12.1.1. **Divisores:** PROHIBIDO líneas divisorias o bordes internos.
* 12.1.2. **Bordes:** Prohibido incluso el uso de `border-transparent` (evitar artefactos).
* 12.1.3. **Sombra:** Usar `shadow-2xl` para profundidad.
* 12.1.4. **Sincronización:** Replicar diseño idéntico en Root, CV y Proyectos.

---

## 13. [REGLAS: OPTIMIZACIÓN Y RENDIMIENTO]
Control de carga eficiente.

**13.1. MEDIOS:**
* 13.1.1. **Peso:** Máximo **500 KB** por imagen.
* 13.1.2. **Formato:** `.jpg` optimizado o `.webp`. Prohibido `.png` pesados.
* 13.1.3. **Carruseles:** Sincronización exacta entre código y archivos físicos.

---

## 14. [REGLAS: BLINDAJE CROMÁTICO]
Contraste en zonas de fondo estático.

**14.1. APLICACIÓN:**
* 14.1.1. **Forzado:** Usar `!important` en textos críticos sobre fondos fijos.
* 14.1.2. **Objetivo:** Evitar que el color de texto se pierda por cambios de tema global.

---

## 15. [REGLAS: INTEGRIDAD DE CONTENIDO]
Evitar conflictos de renderizado.

**15.1. DIRECTIVA:**
* 15.1.1. **Separación:** No mezclar HTML estático con inyecciones dinámicas en la misma área.
* 15.1.2. **Inyección:** Usar solo contenedores vacíos o actualización de campos puntuales.
