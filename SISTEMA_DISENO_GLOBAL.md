# SISTEMA DE DISEÑO GLOBAL - ANTIGRAVITY

**DIRECTIVA PRINCIPAL:**
Este documento contiene las reglas estrictas e inmutables de UI. Lee este documento ANTES de generar cualquier código. Estas reglas deben aplicarse a TODAS las secciones generadas, sin excepciones. Queda estrictamente prohibido el uso de estilos en línea improvisados o variaciones entre secciones. Utiliza clases CSS globales unificadas.

## 1. [REGLAS: TOOLTIPS]
Homologación absoluta: Todos los tooltips del proyecto, sin importar la sección donde se encuentren, deben seguir exactamente este esquema de colores.

**MODO CLARO (Light Mode):**
* **Fondo:** Claro (Blanco/Gris muy claro con glassmorphism).
* **Título:** Negro sólido.
* **Contenido (Texto):** Gris oscuro (Slate/Gray 600-800).

**MODO OSCURO (Dark Mode):**
* **Fondo:** Oscuro (Azul profundo/Negro con glassmorphism).
* **Título:** Blanco sólido.
* **Contenido (Texto):** Gris claro (Gray/Slate 300-400).

**REGLAS DE FORMATO:**
* **Márgenes Internos:** Se debe garantizar un padding generoso (mínimo `p-6` o `pb-10` en contenidos largos) para evitar que el texto toque los bordes inferiores.
* **Dimensionamiento Dinámico:** Si el texto es breve, el tooltip debe ser pequeño (`max-content`). Para textos extensos, el ancho debe crecer proporcionalmente pero nunca exceder un límite que rompa el balance visual (máximo recomendado `650px`).
* **Espaciado Interno:** Queda estrictamente PROHIBIDO el uso de saltos de línea dobles o triples entre párrafos. Se debe utilizar un único salto de línea para separar bloques de texto (ej. entre fases de Reto).
* **Resaltado de Fases:** El resaltado automático de fases (**Planeación, Ejecución, Cierre**) debe ser **estrictamente sensible a mayúsculas**. Queda PROHIBIDO resaltar estas palabras en minúsculas cuando forman parte del contenido descriptivo (ej. "plan de ejecución").
* **Proporciones (Regla 4:3):** Queda estrictamente PROHIBIDO el uso de `min-width` superior a `200px` o anchos fijos (ej. `width: 540px` o `700px`). El tooltip debe ajustar su ancho dinámicamente según el volumen de texto para tender a una relación de aspecto de **4:3**.
* **Alineación Obligatoria:** Todo el contenido del tooltip (metadatos, títulos, cuerpo de texto y pie de página) debe estar **SIEMPRE CENTRADO** (`text-center` e `items-center`). Queda prohibida la alineación a la izquierda o derecha en cualquier sección.

**REGLA DE ORO - TOOLTIPS (VISUALIZACIÓN DE RETOS):**
* **Proporción:** Deben tener una proporción visual de 4:3 (más anchos que altos).
* **Ancho Máximo:** El ancho máximo permitido es de **650px**.
* **Alineación:** Todo el contenido (texto y títulos de fases) debe estar estrictamente CENTRADO.
* **Minimalismo:** Los tooltips de Retos **NO** deben llevar títulos (ej. "RETO: NOMBRE") ni metadatos. Deben mostrar exclusivamente los 3 párrafos de las fases (Planeación, Ejecución, Cierre).
* **Interacción:** Deben aparecer al hacer hover sobre el texto truncado "ver más".

---

## 2. [REGLAS: TIPOGRAFÍA Y CONTRASTE]
Homologación de legibilidad: Está prohibido el uso de colores con bajo contraste sobre el fondo del tema actual.

**MODO CLARO (Light Mode):**
* **PROHIBIDO:** Usar texto de color **Cyan** o **Celeste** sobre fondo claro (pues no contrasta y dificulta la lectura).
* **PERMITIDO:** Usar **únicamente** dos variantes de azul:
    1. **`sky-950`**: Para texto principal, etiquetas de fase y contenido de alta densidad.
    2. **`sky-700`**: Para acentos, interacción ("ver más") e iconos seleccionados.
* **VERDES (Opcional):** Se permite el uso de **`green-700`** para textos positivos (automático/obra) y **`green-900`** exclusivamente para efectos de hover.


**MODO OSCURO (Dark Mode):**
* **PROHIBIDO:** Usar texto de color **Azul oscuro**, **Verde oscuro**, o colores apagados sobre fondo oscuro.
* **PERMITIDO:** Usar **únicamente** dos variantes de azul/cián para resaltar:
    1. **`cyan-400`**: Color técnico principal (Software, Fases) e interacciones ("ver más").
    2. **`blue-400`**: Color para roles de sitio y elementos secundarios.
* **VERDES (Opcional):** Se permite el uso de **`green-400`** para indicadores positivos y **`green-500`** para acentos discretos o iconos.

* **OTROS:** Se permite Blanco y Gris claro (Slate 300) para texto base.



---

## 3. [REGLAS: NAVEGACIÓN Y MENÚS]
Apertura de Barra Lateral (Sidebar):

* **DIRECTIVA:** La barra lateral (Menú) debe tener una **apertura suave y elegante** en TODAS las secciones del ecosistema (Dashboard, CV, Portafolio Resumido).
* **PROHIBIDO:** La apertura rápida, brusca o instantánea que degrade la experiencia de usuario premium.
* **ESTILO:** Utilizar transiciones CSS suaves (0.3s a 0.5s) con `cubic-bezier` para un efecto fluido y profesional.

---

## 6. [REGLAS: PUNTOS PULSANTES]
Efectos visuales dinámicos: Homologación de contraste y comportamiento.

**MODO CLARO (Light Mode):**
* **PROHIBIDO:** Usar puntos pulsantes color **Cyan** o **Verde brillante** (pues no contrastan).
* **PERMITIDO:** Usar **`sky-950`** para máxima visibilidad o **`sky-700`** para destacar sobre fondos neutros.

* **EXCEPCIÓN:** En la vista de **GALERÍA (PROJECT DATABASE)**, los puntos **Cyan** pueden mantenerse sobre las imágenes si el contraste es adecuado, incluso en modo claro.

**MODO OSCURO (Dark Mode):**
* **PROHIBIDO:** Usar puntos pulsantes **Oscuros** (Azul/Verde oscuro) sobre fondo oscuro.
* **PERMITIDO:** Usar Cyan brillante, Verde neón o colores de alta visibilidad.

**GENERAL:**
* **TAMAÑO:** Todos los puntos pulsantes deben tener el mismo tamaño y efecto en todas las secciones.
* **EXCEPCIÓN:** En la sección **HOME SYSTEM**, los puntos son ligeramente más grandes, pero mantienen el mismo efecto visual exactamente.
* **EXCEPCIÓN AI:** La sección de **IA REVOLUTION** puede usar puntos simples para su navegación/menú.

---

## 7. [REGLAS: BOTONES DE NAVEGACIÓN Y ACCIÓN]
Iconografía de sistema (Descarga, Temas, Atrás, Adelante, Home).

* **DIRECTIVA:** Estos botones deben ser **IDÉNTICOS** en todas las secciones donde aparezcan.
* **ESTILO:** Queda prohibido el uso de fondos (backgrounds) para estos iconos.
* **COLOR:** Deben ser de color **Gris** en ambos modos (Claro y Oscuro) para mantener una estética técnica y limpia.

---

## 8. [REGLAS: BARRA DE ESTADO - PROJECT DATABASE]
Homologación de información técnica en el encabezado de la sección 02.

* **DIRECTIVA:** La barra de estado debe ser SIEMPRE visible y mostrar la información en el siguiente orden y formato:
* **Componentes Obligatorios:**
    1. **ITEMS:** Cantidad de proyectos mostrados actualmente (ej: `ITEMS:41`).
    2. **VISTA:** Tipo de organización visual (GALERÍA, GRUPO, LISTA).
    3. **TIPO:** Criterio de filtro o agrupación aplicado (ej: `AÑO`, `TIPOLOGÍA`, `DISCIPLINA`, etc.). Si no hay ninguno, usar `GENERAL`.
* **FORMATO:** Utilizar mayúsculas, fuente monoespaciada y separadores de tubería (`|`).

---

## 9. [REGLAS: ANIMACIONES DE GRÁFICAS Y PORCENTAJES]
Dinámicas visuales para dashboards técnicos.

* **DIRECTIVA:** Todas las barras de progreso o gráficas de barras que representen un porcentaje (%) deben tener una animación de entrada obligatoria.
* **REGLAS TÉCNICAS:**
    1. **Barras:** Deben "llenarse" suavemente desde 0% hasta su valor final.
    2. **Contadores:** Los números de porcentaje deben incrementar (count-up) desde 0 hasta su valor final.
    3. **Duración:** La animación debe ser lenta, con una duración aproximada de **3 segundos** (3000ms).
* **ESTILO:** Usar `ease-out` o `cubic-bezier` para un efecto premium.
---

## 10. [REGLAS: TRANSICIONES Y APERTURAS SUAVES]
Directiva de fluidez: Queda prohibida cualquier aparición brusca o instantánea de elementos de UI.

**APLICACIÓN GENERAL:**
* **Tooltips:** Deben aparecer y desaparecer con un fundido (fade-in/out) y un ligero escalado (de 0.95 a 1.0) en un tiempo de **0.2s a 0.3s**.
* **Modales (Imagen/Video):** La apertura debe ser expansiva y suave, utilizando transiciones de opacidad y escala durante **0.4s**.
* **Barras Laterales:** (Ver Sección 3) Apertura lateral suave con `cubic-bezier`.
* **Cambio de Secciones:** El paso entre Dashboard, Proyectos y CV debe incluir un desvanecimiento (fade) para evitar saltos visuales bruscos.
* **PROHIBIDO:** El uso de `display: none` a `block` (o viceversa) sin una transición de opacidad acompañante que suavice el cambio.

**ESTILO TÉCNICO:**
* Priorizar el uso de `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` para asegurar movimientos que se sientan naturales y premium.

---

## 11. [REGLAS: ESTADO ACTIVO DE BOTONES]
Directiva de resalte: Los botones que representen un estado activo (filtros, tipos de vista, categorías) deben resaltar claramente sin usar fondos (backgrounds).

**MODO OSCURO (Dark Mode):** 
* Usar color **Cyan** (`text-cyan-400` o similar) para el icono/texto.
* **PROHIBIDO:** El uso de fondos de color. El resalte debe ser puramente cromático.

**MODO CLARO (Light Mode):** 
* Usar color **`sky-700`** para el icono/texto. 
* **PROHIBIDO:** El uso de fondos de color o sombreados densos. El resalte debe ser puramente cromático.


---

## 12. [REGLAS: FONDOS Y SUPERFICIES (BACKGROUNDS)]
Homologación de profundidad: El fondo debe reflejar la jerarquía visual de la aplicación y adaptarse al tema para mantener el contraste premium.

**MODO OSCURO (Dark Mode):**
* **Fondo Base (Viewport):** Negro Profundo / Azul técnico (`#0b1016`).
* **Superficies Primarias (Sidebar/Paneles fijos):** Negro más denso (`#080c10`).
* **Superficies Secundarias (Cards/Bento/Modales):** Gris Azulado oscuro (`#151b26`).
* **Bordes:** `border-gray-800` o `rgba(255, 255, 255, 0.1)`.

**MODO CLARO (Light Mode):**
* **Fondo Base (Viewport):** Blanco puro a Gris muy claro (`#ffffff` a `#f8fafc`). Se permite un degradado suave hacia `#cbd5e1` para dar profundidad.
* **Superficies Primarias (Sidebar/Paneles fijos):** Gris claro (`#f1f5f9`).
* **Superficies Secundarias (Cards/Bento/Modales):** Degradados claros (`linear-gradient` de `#f1f5f9` a `#cbd5e1`) con sombras suaves.
* **Sombras (Shadows):** Usar `box-shadow` (ej: `shadow-md`) en lugar de bordes oscuros para separar capas.

**REGLA DE IMAGEN DE PERFIL (SIDEBAR):**
* **Modo Oscuro:** Gradiente de fondo a `#080c10`, opacidad de imagen al **50%** para un look integrado.
* **Modo Claro:** Gradiente de fondo a `#f1f5f9`, opacidad de imagen al **80%** para asegurar que no se "lave" con el fondo claro.
* **General:** La imagen debe ser siempre visible y legible al desplegar el menú.


---

## 13. [REGLAS: ICONOGRAFÍA Y CONTENEDORES]
Homologación de minimalismo técnico: Los iconos deben ser limpios y sin distracciones, integrándose cromáticamente con sus contenedores.

* **ESTILO GENERAL:** Minimalista, trazo fino (`stroke-width: 1.5` o `2`), sin rellenos sólidos. Se prefiere el uso de la librería Lucide.
* **CONTENEDORES CON FONDO:** Si un icono requiere un fondo para resaltar (ej. Colaboración, Headers de sección):
    * **REGLA DE COLOR:** El fondo DEBE ser del mismo color exacto que el icono (usando la misma escala cromática).
    * **REGLA DE TRANSPARENCIA:** El fondo debe tener una opacidad baja (entre `10%` y `20%`) para generar contraste sin opacar el icono.
    * **EJEMPLO:** Icono `text-cyan-400` -> Fondo `bg-cyan-400/20`.
* **HOMOLOGACIÓN:** Queda estrictamente prohibido usar colores de fondo distintos al color del icono (ej. icono cyan con fondo azul oscuro).

---

## 14. [REGLAS: TABLAS Y LISTAS DATIFICADAS]
Homologación de legibilidad y limpieza tabular: Las tablas deben ser puramente minimalistas, eliminando el ruido visual de bordes y líneas.

* **ENCABEZADOS (Headers):**
    * **ESTILO:** Siempre en MAYÚSCULAS y en **NEGRITA**.
    * **TAMAÑO:** Mantener el tamaño de fuente estándar del sistema para metadatos.
    * **COLOR:** Dependiente del modo: Negro (`#000000`) en modo claro y Gris claro (`#e2e8f0`) en modo oscuro.
* **DIVISORES:** Queda PROHIBIDO el uso de líneas divisorias para filas o columnas. La separación debe ser puramente espacial o mediante hover.
* **RESALTE AL PASAR EL MOUSE (Hover):**
    * Al posicionar el cursor sobre una fila, esta debe resaltarse con un fondo gris tenue (adaptado al tema) que aparezca debajo de la fila.
    * El comportamiento debe emular el resalte de la sección `EDUCACIÓN PREVIA` en vista lista.
* **COLOR DEL CONTENIDO:**
    * **MODO CLARO:** Gris oscuro (`#475569`).
    * **MODO OSCURO:** Gris claro (`#94a3b8`).
* **EXCEPCIONES DE DISEÑO (Nivel Programador):** Se permite al desarrollador definir excepciones manuales para columnas específicas:
    * Colores personalizados, **negritas**, *cursivas* o inclusión de elementos dinámicos (ej. puntos pulsantes).
* **GESTIÓN DE TEXTO Y TRUNCADO:**
    * **TEXTO CORTO (<= 20 palabras):** Queda PROHIBIDO truncar o cortar la información. La celda debe crecer verticalmente (wrap) para mostrar el contenido completo.
    * **TEXTO LARGO (> 20 palabras):** Se debe usar un tooltip para mostrar la información completa. Se incluirá un botón discreto de "ver más" que activará dicho tooltip **únicamente** al posicionar el cursor sobre este texto específico, no sobre el área general de la celda.
* **GESTIÃ“N DE COLORES Y CONTRASTE:**
    * **Modo Oscuro:** Queda PROHIBIDO el uso de azul oscuro o colores con bajo contraste sobre fondos negros. Para resaltar elementos técnicos se permite **únicamente** el uso de: **`cyan-400`** y **`blue-400`**.


    * **Modo Claro:** Se permite el uso de azul oscuro de alta densidad para generar contraste sobre fondos claros, utilizando **únicamente** `sky-950` (texto base) y `sky-700` (acentos).

---
## 15. [REGLAS: MODALES DE RESUMEN (SUMMARY POPUP)]
Homologación global del "Resumen Ejecutivo" en Root, CV y Portafolio Resumido.

* **DISEÑO CLEAN (Zero Divisions):** El modal debe ser puramente visual y minimalista. Queda estrictamente PROHIBIDO el uso de líneas divisorias visibles, incluyendo:
    * Bordes laterales (`border-l`, `border-r`).
    * Bordes inferiores y superiores (`border-b`, `border-t`).
    * **REGLA ESTRICTA:** Queda prohibido el uso de bordes transparentes (`border-transparent`) en las celdas internas, ya que pueden generar artefactos visuales o líneas fantasma en ciertos navegadores.
* **CONTENEDOR:** Se permite únicamente un borde sutil y suavizado en el contenedor principal del modal (ej. `border-gray-800/10`) y un sombreado pronunciado (`shadow-2xl`) para dar profundidad sin usar líneas.
* **HEADER:** El contenedor del icono en el header NO debe tener bordes reales ni transparentes. Usar únicamente fondos con opacidad (`bg-gray-500/10`).
* **FOOTER:** El texto de cierre debe estar centrado, usar formato de tubería (`//`) y carecer de cualquier línea de separación superior.
* **SINCRONIZACIÓN:** Cualquier cambio en la estructura del modal en una sección DEBE replicarse en las otras (Root, CV_Digital, Portafolio_Resumido).


---

## 16. [REGLAS: OPTIMIZACIÓN DE MEDIOS Y RENDIMIENTO]
Directiva de carga eficiente: Control estricto sobre el peso y formato de imágenes.

* **PESO MÁXIMO:** Todas las fotografías, imágenes de perfil y recursos en carruseles deben pesar estrictamente **menos de 500 KB**.
* **FORMATO:** Se debe unificar el uso de formatos con alta compresión web, preferentemente **`.jpg`** optimizado o **`.webp`**. Queda PROHIBIDO el uso de archivos `.png` pesados (> 1MB) sin comprimir.
* **CARRUSELES:** El número de imágenes referenciadas en el código debe coincidir exactamente con los archivos físicos disponibles para evitar errores 404 e iconos de imagen rota.

---

## 17. [REGLAS: BLINDAJE CROMÁTICO EN ZONAS ESTÁTICAS]
Directiva de contraste garantizado en elementos de fondo fijo (ej. Sidebar del CV).

* **APLICACIÓN:** Cuando un contenedor mantenga un color de fondo invariable independientemente del tema global (ej. el sidebar del CV siempre es oscuro en Light Mode y Dark Mode).
* **BLINDAJE:** Los colores de acento y los textos críticos deben forzarse mediante utilidades de máxima prioridad (ej. `!text-blue-500` en Tailwind) o mediante **estilos en línea** (ej. `style="color: #3b82f6 !important;"`).
* **OBJETIVO:** Evitar que las clases condicionales del tema claro ("light-theme") modifiquen el color del texto a blanco o plateado, haciéndolo invisible o incoherente sobre el fondo oscuro estático.

---

## 18. [REGLAS: INTEGRIDAD DEL CONTENIDO ESTÁTICO VS DINÁMICO]
Directiva contra la duplicación y conflictos de renderizado.

* **SEPARACIÓN ESTRICTA:** Queda PROHIBIDO mezclar en la misma área visual estructura HTML estática (con diseño final) y funciones de JavaScript que inyecten contenido análogo vía `innerHTML`.
* **EVITAR DUPLICADOS:** Si un bloque de diseño (ej. estadísticas del perfil) ya está estructurado estáticamente en el HTML, el JS no debe inyectar datos redundantes en el mismo contenedor o en la misma área a menos que sea un reemplazo total y consciente.
* **INYECCIÓN SEGURA:** El renderizado dinámico (desde CSV o APIs) solo debe aplicarse en contenedores vacíos (`<div id="target"></div>`), o mediante actualización específica de campos puntuales (`textContent`, atributos `src`/`href`), evitando inyectar bloques completos de HTML de forma descontrolada.
