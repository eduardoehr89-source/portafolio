/**
 * CV Digital - Said Herrera
 * Lógica modular para interactividad, modo oscuro y asistente virtual.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initPrintLogic();
    loadExternalData(); // Nueva función para cargar CSV
    if (window.lucide) lucide.createIcons();
});

/* =========================================
   DATA LOADING (CSV Parsing)
   ========================================= */
const CSV_URLS = {
    experiencia: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/CV/Experiencia%20laboral_cv.csv',
    formacion: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/CV/Formaci%C3%B3n%20ac%C3%A1d%C3%A9mica_cv.csv',
    software: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Software_portafolio.csv',
    habilidades: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/CV/Habilidades_cv.csv'
};

async function loadExternalData() {
    try {
        const [expData, formData, softData, habData] = await Promise.all([
            fetchCSV(CSV_URLS.experiencia),
            fetchCSV(CSV_URLS.formacion),
            fetchCSV(CSV_URLS.software),
            fetchCSV(CSV_URLS.habilidades)
        ]);

        renderExperience(expData);
        renderEducation(formData);
        renderSoftware(softData);
        renderSkills(habData);

        // Iniciar animaciones después de cargar datos
        initAnimations();
    } catch (error) {
        console.error("Error cargando datos:", error);
        initAnimations(); // Fallback
    }
}

// ... (fetchCSV y parseCSV se mantienen igual)

function renderSoftware(data) {
    const mainContainer = document.getElementById('software-main-container');
    const secondaryContainer = document.getElementById('software-secondary-list');

    if (mainContainer) mainContainer.innerHTML = '';
    if (secondaryContainer) secondaryContainer.innerHTML = '';

    data.forEach(sw => {
        const clasificacion = sw.Clasificación || sw.Clasificacion;
        const nombre = sw.Nombre || sw.Item;
        const porcentaje = sw['Porcentaje Dominio'] || sw.Detalle;
        const capacidad = sw.Capacidad || '';
        const nivel = sw.Nivel || '';

        if (clasificacion === 'Principal' && mainContainer) {
            mainContainer.innerHTML += `
                <div class="group relative cursor-help">
                    <div class="flex justify-between text-[0.6rem] text-gray-200 mb-0.5"><span>${nombre}</span></div>
                    <div class="skill-bar">
                        <div class="skill-progress h-full bg-blue-500" data-width="${porcentaje}"></div>
                    </div>
                    <div class="glass-tooltip">
                        <strong class="text-blue-400 block mb-1 text-[0.65rem]">${nivel}</strong>
                        ${capacidad}
                    </div>
                </div>
            `;
        } else if (clasificacion === 'Secundario' && secondaryContainer) {
            const span = document.createElement('span');
            span.className = 'text-white font-medium';
            span.innerText = nombre;

            // Añadir separador si no es el último
            if (secondaryContainer.children.length > 0) {
                secondaryContainer.innerHTML += '<span class="text-gray-500 mx-1">•</span>';
            }
            secondaryContainer.appendChild(span);
        }
    });
}

function renderSkills(data) {
    const softContainer = document.getElementById('soft-skills-container');
    if (softContainer) softContainer.innerHTML = '';

    data.forEach(skill => {
        const categoria = skill.Categoría || skill.Categoria;
        const item = skill.Ítem || skill.Item;

        if (categoria === 'Habilidades Blandas' && softContainer) {
            softContainer.innerHTML += `<span class="soft-skill-tag">${item}</span>`;
        }
    });
}

function getSkillTooltip(name) {
    if (name.includes('Revit')) return "Nivel suficiente para desarrollar proyectos complejos de cualquier tipo y disciplinas con una excelente calidad.";
    if (name.includes('Twinmotion')) return "Nivel suficiente para generar render o videos de semirealistas.";
    if (name.includes('Navisworks')) return "Nivel suficiente para detección de interferencias.";
    return "Habilidad técnica profesional.";
}

function typeEffect(element, text, speed) {
    let i = 0;
    element.innerHTML = '';
    const timer = setInterval(() => {
        if (i < text.length) {
            element.append(text.charAt(i));
            i++;
        } else {
            clearInterval(timer);
        }
    }, speed);
}

/* =========================================
   PRINT LOGIC
   ========================================= */
function initPrintLogic() {
    const modal = document.getElementById('print-modal');

    window.printCV = () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) document.documentElement.classList.remove('dark');
        modal.classList.remove('hidden');

        window.onafterprint = () => {
            if (isDark) document.documentElement.classList.add('dark');
        };
    };

    window.closeModal = () => modal.classList.add('hidden');

    window.confirmPrint = () => {
        window.closeModal();
        setTimeout(() => window.print(), 500);
    };
}
