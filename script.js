// ==========================================================================
// 1. CONFIGURACIÓN DE ORIGEN DE DATOS
// ==========================================================================

const timestamp = new Date().getTime();

const URL_PROJECTS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Proyectos_portafolio.csv?t=${timestamp}`;
const URL_DISCIPLINES = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Disciplinas_portafolio.csv?t=${timestamp}`;
const URL_SOFTWARE = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Software_portafolio.csv?t=${timestamp}`;
const URL_NORMS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Normativas%20y%20Est%C3%A1ndares_Portafolio.csv?t=${timestamp}`;
const URL_EDUCATION = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Master%20MBIA_portafolio.csv?t=${timestamp}`;
const URL_ROI = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/ROI_Scripts_portafolio.csv?t=${timestamp}`;
const URL_COLLAB = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Colaboraci%C3%B3n_portafolio.csv?t=${timestamp}`;
const URL_SECTIONS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Dashboard%20global_secciones_portafolio.csv?t=${timestamp}`;
const URL_AI_REV = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Inteligencia%20Artificial_portafolio.csv?t=${timestamp}`;

const TOP_PROJECTS_LIST = [
    { name: "Barrio Santa Lucía", loc: "Monterrey" },
    { name: "Tren Ligero", loc: "Campeche" },
    { name: "Puentes Periféric", loc: "Edo. Méx" },
    { name: "Hospital General de Zona", loc: "Tula" },
    { name: "Unidad de Medicina Familiar", loc: "Tula" },
    { name: "Central de Mezclas", loc: "Torreón" }
];

// Variables Globales
let projectsData = [];
let filteredProjects = [];
let roiData = [];
let sectionsData = []; // Nueva variable para secciones
let currentViewMode = 'gallery';
let isTop5Active = true;
let currentProjectIndex = -1;
let disciplinesData = []; // Global variable for disciplines

let aiData = [];
let hasSeenTopWarning = false; // Flag for first-time Top Projects warning

// ==========================================================================
// 2. MOTORES DE INTELIGENCIA DE DATOS
// ==========================================================================

const normalizeStr = (str) => {
    return str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
};

const getVal = (item, ...keys) => {
    if (!item) return "";
    const objectKeys = Object.keys(item);

    const foundKey = objectKeys.find(k => {
        if (!k || k.trim() === '') return false;
        // Normalize the key from the object (remove accents, lowercase)
        const cleanKey = normalizeStr(k);
        return keys.some(searchKey => {
            const sKey = normalizeStr(searchKey);
            return cleanKey === sKey || cleanKey.includes(sKey);
        });
    });

    return foundKey ? item[foundKey].trim() : "";
};

const resolveIcon = (item, fallbackIcon) => {
    let iconRaw = getVal(item, 'icono', 'icon');
    let cleanIcon = iconRaw ? iconRaw.toLowerCase().trim() : "";

    const iconMap = {
        'brain-ia': 'brain-circuit',
        'magic-wand': 'wand-2',
        'robot-automation': 'bot',
        'chat-agent': 'message-square',
        'recap': 'scan',
        'twinmotion': 'image',
        'acc / bim 360': 'cloud',
        'tools': 'wrench',
        'user-worker': 'hard-hat',
        'user-tie': 'user',
        'desktop': 'monitor',
        'project-diagram': 'network',
        'cubes': 'box',
        'users-class': 'users',
        'external-link': 'external-link',
        'calculator': 'calculator',
        'clipboard-check': 'clipboard-check',
        'building': 'building',
        'activity': 'activity',
        'layers': 'layers',
        'grid': 'grid',
        'book-open': 'book-open',
        'graduation-cap': 'graduation-cap',
        'timer': 'timer'
    };

    if (iconMap[cleanIcon]) return iconMap[cleanIcon];
    if (cleanIcon.length > 0 && cleanIcon.length < 25 && !cleanIcon.includes(' ')) return cleanIcon;

    const textContext = normalizeStr(
        getVal(item, 'nombre') + " " + getVal(item, 'titulo') + " " + getVal(item, 'funcion') + " " + getVal(item, 'rol') + " " + getVal(item, 'pilar')
    );

    if (textContext.includes('multimedia')) return 'video';
    if (textContext.includes('automatizacion')) return 'settings';
    if (textContext.includes('estandares') || textContext.includes('iso')) return 'shield-check';
    if (textContext.includes('copiloto')) return 'bot';
    if (textContext.includes('documental')) return 'file-search';
    if (textContext.includes('sincronizacion') || textContext.includes('5d')) return 'refresh-cw';
    if (textContext.includes('doc') || textContext.includes('contrato')) return 'file-text';
    if (textContext.includes('costo')) return 'dollar-sign';
    if (textContext.includes('nube') || textContext.includes('cloud')) return 'cloud';
    if (textContext.includes('plan') || textContext.includes('cad')) return 'pen-tool';
    if (textContext.includes('obra')) return 'hard-hat';
    if (textContext.includes('gerente')) return 'briefcase';
    if (textContext.includes('coordinador')) return 'git-merge';
    if (textContext.includes('revit')) return 'layers';
    if (textContext.includes('norma')) return 'book-open';
    if (textContext.includes('recap') || textContext.includes('scan')) return 'scan';

    return fallbackIcon || 'box';
};

const parseTime = (timeStr, defaultUnit = '') => {
    if (!timeStr) return 0;
    const str = timeStr.toLowerCase().replace(/\s/g, ''); // remove spaces
    let val = parseFloat(str);
    if (isNaN(val)) return 0;

    // Handle ranges: take the first number (conservative) or average? 
    // "1-2" -> parseFloat is 1. That's fine for now.

    // If explicit units exist, use them
    if (str.includes('h') || str.includes('hora')) return val * 60;
    if (str.includes('m') || str.includes('min')) return val;
    if (str.includes('d') || str.includes('dia')) return val * 8 * 60;

    // Fallback to default unit
    if (defaultUnit === 'h') return val * 60;
    if (defaultUnit === 'm') return val;

    return val;
};



// ==========================================================================
// 3. INICIALIZACIÓN
// ==========================================================================

// Helper for Number Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.counter-anim');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 3000; // 3s
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out expo for smooth effect
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const current = Math.floor(ease * (target - start) + start);
            counter.innerText = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.innerText = target;
            }
        }
        requestAnimationFrame(update);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initParticles();

    Promise.allSettled([
        d3.csv(URL_PROJECTS),
        d3.csv(URL_DISCIPLINES),
        d3.csv(URL_SOFTWARE),
        d3.csv(URL_NORMS),
        d3.csv(URL_EDUCATION),
        d3.csv(URL_ROI),
        d3.csv(URL_COLLAB),
        d3.csv(URL_SECTIONS),
        d3.csv(URL_AI_REV)
    ]).then((results) => {

        const getData = (index) => {
            if (results[index].status === 'fulfilled') return results[index].value;
            console.warn(`Fallo en archivo ${index}:`, results[index].reason);
            return [];
        };

        projectsData = getData(0);
        disciplinesData = getData(1);
        const software = getData(2);
        const norms = getData(3);
        const education = getData(4);
        roiData = getData(5);
        const collab = getData(6);
        sectionsData = getData(7); // Cargamos secciones
        aiData = getData(8); // Load AI Data

        console.log("Sistema BIM: Datos cargados.");

        if (projectsData.length > 0) processProjects(projectsData);

        renderGlobalAnalytics(projectsData);
        renderGlobalDisciplines(projectsData, disciplinesData);
        renderSoftware(software);
        renderNorms(norms);
        renderEducation(education);
        renderROI(roiData);
        renderCollab(collab);
        renderAI(); // Render AI Section

        setTimeout(() => {
            if (window.lucide) window.lucide.createIcons();
        }, 300);

        hideLoadingScreen();

        // Start Animation Loop (Every 30 seconds)
        setInterval(() => {
            renderGlobalAnalytics(projectsData, true);
            renderGlobalDisciplines(projectsData, disciplinesData, true);
            renderROI(roiData, true);
        }, 30000);

    }).catch(err => {
        console.error("Error crítico:", err);
        hideLoadingScreen();
    });
});
// ==========================================================================
// 4. RENDERS DE SECCIONES
// ==========================================================================

// Helper para inyectar encabezados dinámicos desde el CSV de Secciones
function injectSectionHeader(containerId, keyword, defaultTitle, defaultIcon, parentLevel = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let targetElement = container;
    // Subir niveles en el DOM para encontrar el encabezado (generalmente previousElementSibling)
    for (let i = 0; i < parentLevel; i++) {
        if (targetElement.parentElement) targetElement = targetElement.parentElement;
    }

    const headerEl = targetElement.previousElementSibling;

    // Buscar metadata en el CSV cargado
    const meta = sectionsData.find(s => normalizeStr(getVal(s, 'seccion')).includes(normalizeStr(keyword)));
    const title = meta ? getVal(meta, 'seccion') : defaultTitle;
    const iconRaw = meta ? resolveIcon(meta, defaultIcon) : defaultIcon;

    // Inyectar HTML con color BLANCO FORZADO (text-white)
    if (headerEl) {
        headerEl.outerHTML = `
            <div class="flex items-center gap-2 mb-3 border-b border-gray-800/50 pb-2">
                <i data-lucide="${iconRaw}" class="text-white w-4 h-4"></i>
                <span class="db-text-header">${title}</span>
            </div>
        `;
    }
}

function renderGlobalAnalytics(data, animateOnly = false) {
    const container = document.getElementById('global-analytics-chart');
    const legend = document.getElementById('global-analytics-legend');

    // Inyección Dinámica del Título (Busca "Tipología" en el CSV)
    if (!animateOnly) injectSectionHeader('global-analytics-chart', 'tipologia', 'TIPOLOGÍA DE PROYECTOS', 'activity', 1);

    if (!container || !data || data.length === 0) return;

    const uniqueProjectMap = new Map();
    data.forEach(p => {
        let nameKey = getVal(p, 'id');
        const pName = normalizeStr(getVal(p, 'nombre'));

        if (pName.includes("modulo covid")) nameKey = "GROUP_COVID";
        else if (pName.includes("central de mezclas")) nameKey = "GROUP_MEZCLAS";

        if (!uniqueProjectMap.has(nameKey)) {
            uniqueProjectMap.set(nameKey, getVal(p, 'tipologia') || "OTROS");
        }
    });

    const typeCounts = {};
    uniqueProjectMap.forEach((tipo) => {
        let t = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
        typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    let chartData = Object.entries(typeCounts).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v).slice(0, 4);
    const totalGrouped = Array.from(uniqueProjectMap.values()).length;

    let obraCount = 0;
    let oficinaCount = 0;
    data.forEach(p => {
        const fase = normalizeStr(getVal(p, 'fase'));
        if (fase.includes('obra')) obraCount++;
        else if (fase.includes('oficina') || fase.includes('diseno')) oficinaCount++;
    });
    const totalReal = data.length;
    const pctObra = Math.round((obraCount / totalReal) * 100);
    const pctOficina = Math.round((oficinaCount / totalReal) * 100);

    let svg = `<svg viewBox="0 0 36 36" class="donut-svg w-full h-full transform -rotate-90 animate-donut">`;
    let offset = 0;
    const colors = ["#22d3ee", "#3b82f6", "#a855f7", "#10b981"];

    chartData.forEach((d, i) => {
        const pct = (d.v / totalGrouped) * 100;
        svg += `<circle cx="18" cy="18" r="15.915" fill="transparent" stroke="${colors[i]}" stroke-width="4" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${-offset}">
            <animate attributeName="stroke-dasharray" from="0 100" to="${pct} ${100 - pct}" dur="3s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.42 0 0.58 1" />
        </circle>`;
        offset += pct;
    });

    svg += `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="fill-white [.light-theme_&]:fill-black" font-family="monospace" font-size="8px" font-weight="bold" transform="rotate(90 18 18)">${totalReal}</text></svg>`;
    container.innerHTML = svg;

    let legendHtml = chartData.map((d, i) => `
        <div class="flex items-center justify-between text-xs mb-1 animate-item" style="animation-delay: ${i * 0.1}s">
            <div class="flex items-center gap-2 overflow-hidden">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" style="background:${colors[i]}"></div>
                <span class="db-text-body truncate font-mono">${d.k}</span>
            </div>
            <span class="db-text-header font-bold font-mono"><span class="counter-anim" data-target="${Math.round((d.v / totalGrouped) * 100)}">0</span>%</span>
        </div>
    `).join('');

    legendHtml += `
        <div class="mt-3 pt-2 border-t border-gray-800">
        <div class="flex justify-between db-text-meta font-mono mb-1">
            <span>OFICINA (${pctOficina}%)</span>
            <span>OBRA (${pctObra}%)</span>
        </div>
        <div class="flex h-1.5 w-full rounded-full overflow-hidden bg-[#0f141a]">
            <div class="h-full bg-blue-500 animate-bar" style="--final-width: ${pctOficina}%"></div>
            <div class="h-full bg-green-500 animate-bar" style="--final-width: ${pctObra}%"></div>
        </div>
    </div>`;

    legend.innerHTML = legendHtml;
    animateCounters();
}

function renderGlobalDisciplines(allProjects, refDisciplines, animateOnly = false) {
    const container = document.getElementById('global-disciplines-list');

    // Inyección Dinámica del Título (Busca "Disciplinas" en el CSV)
    if (!animateOnly) injectSectionHeader('global-disciplines-list', 'disciplinas', 'DISCIPLINAS DOMINADAS', 'layers', 0);

    if (!refDisciplines || refDisciplines.length === 0) {
        if (container) container.innerHTML = '<div class="text-[10px] text-gray-500">Datos no disponibles</div>';
        return;
    }

    // 1. Group Projects logic (similar to Analytics)
    const uniqueMap = new Map();

    allProjects.forEach(p => {
        let key = getVal(p, 'id');
        const name = normalizeStr(getVal(p, 'nombre'));

        if (name.includes("modulo covid")) key = "GROUP_COVID";
        else if (name.includes("central de mezclas")) key = "GROUP_MEZCLAS";

        // If key exists, merge disciplines string to ensure we count all disciplines present in the group
        if (uniqueMap.has(key)) {
            const existing = uniqueMap.get(key);
            uniqueMap.set(key, existing + " " + getVal(p, 'disciplinas'));
        } else {
            uniqueMap.set(key, getVal(p, 'disciplinas'));
        }
    });

    const effectiveProjects = Array.from(uniqueMap.values()); // Array of discipline strings

    const stats = refDisciplines.map(ref => {
        const refName = getVal(ref, 'name', 'nombre');
        const refNameClean = normalizeStr(refName);
        let count = 0;

        effectiveProjects.forEach(pDiscsRaw => {
            const pDiscs = normalizeStr(pDiscsRaw);

            if (refNameClean.includes("doc") && refNameClean.includes("cuan")) {
                if (pDiscs.includes("doc") || pDiscs.includes("cuan")) count++;
            }
            else if (refNameClean.includes('mep')) {
                if (pDiscs.includes('mep') || pDiscs.includes('hidro') || pDiscs.includes('elec') || pDiscs.includes('insta')) count++;
            }
            else if (pDiscs.includes(refNameClean)) {
                count++;
            }
        });

        return {
            name: refName,
            icon: resolveIcon(ref, 'layers'),
            count: count
        };
    });

    stats.sort((a, b) => b.count - a.count);
    // The total for percentages should be the number of Groups/Unique Projects, not total rows
    const totalProjects = effectiveProjects.length;

    container.innerHTML = stats.map((stat, i) => {
        const percentage = Math.round((stat.count / totalProjects) * 100);

        return `
        <div class="flex items-center justify-between db-text-body mb-2 font-mono group">
            <div class="flex items-center gap-2 w-32 shrink-0">
                <i data-lucide="${stat.icon}" class="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition"></i>
                <span class="db-text-body truncate">${stat.name}</span>
            </div>
            <div class="flex-1 mx-2 h-1 bg-[#0f141a] rounded-full overflow-hidden border border-gray-800">
                <div class="h-full bg-cyan-500 rounded-full animate-bar" style="--final-width: ${percentage}%; animation-delay: ${i * 0.1}s"></div>
            </div>
            <span class="db-text-header font-bold w-8 text-right"><span class="counter-anim" data-target="${percentage}">0</span>%</span>
        </div>`;
    }).join('');

    animateCounters();
}

function renderSoftware(data) {
    const container = document.getElementById('global-software-list');

    // Inyección Dinámica del Título (Busca "Software" en el CSV)
    injectSectionHeader('global-software-list', 'software', 'SOFTWARE STACK', 'grid', 0);

    if (!container || !data) return;

    const sorted = data.sort((a, b) => getVal(a, 'nombre').localeCompare(getVal(b, 'nombre')));

    container.innerHTML = sorted.map((s, i) => {
        const name = getVal(s, 'nombre', 'software');
        const icon = resolveIcon(s, 'box');
        const desc = getVal(s, 'desc', 'descripcion');

        return `
        <div class="p-2 rounded border border-gray-800 bg-[#0f141a] flex flex-col justify-center items-center text-center gap-1.5 hover:border-blue-500/50 hover:bg-blue-500/5 transition group h-full animate-item" style="animation-delay: ${i * 0.05}s">
            <div class="p-1.5 rounded bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 group-hover:text-white transition">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
            </div>
            <div class="w-full">
                <span class="block text-xs font-bold uppercase tracking-wider text-gray-200 [.light-theme_&]:text-black transition truncate">${name}</span>
                <span class="block db-text-meta font-mono truncate">${desc}</span>
            </div>
        </div>`;
    }).join('');
}

function renderNorms(data) {
    const container = document.getElementById('global-norms-list');

    // Inyección Dinámica del Título (Busca "Normativas" en el CSV)
    injectSectionHeader('global-norms-list', 'normativas', 'NORMATIVAS', 'book-open', 0);

    if (!container || !data) return;

    if (data.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-xs col-span-4 text-center py-4">Sin datos.</div>';
        return;
    }

    container.innerHTML = data.map(n => {
        const title = getVal(n, 'titulo', 'título', 'norma');
        const desc = getVal(n, 'desc', 'descripcion');
        const icon = resolveIcon(n, 'file-text');

        return `
        <div class="flex items-center gap-3 p-3 bg-[#151b26] rounded border border-gray-800 hover:border-gray-500/30 transition group">
            <div class="p-2 bg-gray-500/10 text-gray-500 rounded group-hover:bg-gray-500/20 group-hover:text-white transition">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
            </div>
            <div>
                <div class="text-xs font-bold uppercase tracking-wider text-gray-200 [.light-theme_&]:text-black mb-0.5 transition">${title}</div>
                <div class="db-text-meta font-mono leading-tight">${desc}</div>
            </div>
        </div>`;
    }).join('');
}

function renderEducation(data) {
    const container = document.getElementById('global-education-list');

    // Inyección Dinámica del Título (Busca "Formacion" en el CSV)
    injectSectionHeader('global-education-list', 'formacion', 'FORMACIÓN', 'graduation-cap', 0);

    // Add Institution Info
    const headerContainer = document.getElementById('global-education-list')?.previousElementSibling;
    if (headerContainer) {
        headerContainer.insertAdjacentHTML('beforeend', `
            <div class="flex items-center gap-2 ml-3">
                <span class="text-gray-600">|</span>
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span class="text-green-500 text-xs font-mono">Butic The New School (En curso)</span>
            </div>`);
    }

    if (!container || !data) return;

    container.innerHTML = data.map(e => {
        const icon = resolveIcon(e, 'graduation-cap');
        const title = getVal(e, 'pilar', 'titulo', 'materia');
        const desc = getVal(e, 'desc', 'descripcion');

        return `
        <div class="p-3 border border-gray-800 rounded bg-[#0f141a] hover:border-green-500/50 transition flex items-start gap-2 h-full group">
            <div class="shrink-0 p-1.5 rounded bg-green-500/10 text-green-500 mt-0.5 group-hover:bg-green-500/20 group-hover:text-white transition">
                <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
            </div>
            <div class="min-w-0">
                <h4 class="text-xs font-bold uppercase tracking-wider text-gray-200 [.light-theme_&]:text-black truncate group-hover:text-green-400 transition">${title}</h4>
                <p class="db-text-meta font-mono leading-snug mt-1">${desc}</p>
            </div>
        </div>`;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
}

let roiExpanded = false;

function toggleROI() {
    roiExpanded = !roiExpanded;
    renderROI(roiData);
}

function renderROI(data, animateOnly = false) {
    const container = document.getElementById('global-roi-table');
    const btn = document.getElementById('roi-toggle-btn');

    // Inyección Dinámica del Título
    if (!animateOnly) injectSectionHeader('global-roi-table', 'ahorro', 'ROI (SCRIPTS DYNAMO)', 'timer', 1);

    if (!container || !data) return;

    // Actualizar texto del botón
    if (btn) {
        btn.innerText = roiExpanded ? "VER MENOS -" : "VER MÁS +";
    }

    // Filtrar datos: Si NO está expandido, mostrar solo el primero de cada disciplina
    let displayData = data;
    if (!roiExpanded) {
        const seenDisciplines = new Set();
        displayData = data.filter(item => {
            const disc = getVal(item, 'disciplina');
            if (!seenDisciplines.has(disc)) {
                seenDisciplines.add(disc);
                return true;
            }
            return false;
        });
    }

    container.innerHTML = displayData.map((i, index) => {
        try {
            // Nuevas columnas
            // Prioridad: Descripción Corta/Detallada -> Fallback: Descripción General
            const descriptionGeneric = getVal(i, 'descripción', 'descripcion');

            const taskVal = getVal(i, 'descripción breve', 'descripcion breve', 'descripción corta', 'descripcion corta', 'tarea', 'función');
            const task = taskVal || descriptionGeneric;

            const discipline = getVal(i, 'disciplina');
            const tool = getVal(i, 'herramienta');

            const detailVal = getVal(i, 'descripción detallada', 'descripcion detallada', 'detalle');
            const detail = detailVal || descriptionGeneric;

            const manual = getVal(i, 'tiempo manual', 'manual');
            const auto = getVal(i, 'tiempo script', 'tiempo optimizado', 'auto');

            // Mapeo específico de iconos por Herramienta
            const toolNameLow = normalizeStr(tool);
            let icon = 'zap'; // Default fallback

            if (toolNameLow.includes('acabados')) icon = 'layers';
            else if (toolNameLow.includes('muros')) icon = 'brick-wall';
            else if (toolNameLow.includes('puertas') || toolNameLow.includes('ventanas')) icon = 'door-open';
            else if (toolNameLow.includes('refuerzo')) icon = 'construction';
            else if (toolNameLow.includes('cimentación') || toolNameLow.includes('cimentacion')) icon = 'arrow-down-to-line';
            else if (toolNameLow.includes('unión') || toolNameLow.includes('union')) icon = 'combine';
            else if (toolNameLow.includes('tuberías') || toolNameLow.includes('tuberias')) icon = 'workflow';
            else if (toolNameLow.includes('soportería') || toolNameLow.includes('soporteria')) icon = 'anchor';
            else if (toolNameLow.includes('pasantes')) icon = 'circle-dot';
            else if (toolNameLow.includes('láminas') || toolNameLow.includes('laminas')) icon = 'layout-template';
            else if (toolNameLow.includes('estandarizador') || toolNameLow.includes('bep')) icon = 'clipboard-check';
            else if (toolNameLow.includes('gestor') || toolNameLow.includes('cuantificación')) icon = 'calculator';
            else if (toolNameLow.includes('etiquetado')) icon = 'tag';
            else if (toolNameLow.includes('salud')) icon = 'heart-pulse';
            else if (toolNameLow.includes('pre-flight') || toolNameLow.includes('plugin')) icon = 'rocket';
            else icon = resolveIcon(i, 'zap'); // Fallback final

            // Obtener Speedup directamente del CSV
            let speedup = getVal(i, 'ahorro', 'speedup', 'velocidad', 'eficiencia');

            // Limpiar el valor (quitar 'x' si existe) para mantener consistencia visual
            if (speedup) {
                speedup = speedup.toLowerCase().replace('x', '').trim();
            } else {
                // Fallback: Si no hay dato en CSV, mostrar 0 o calcular (opcional, pero el usuario pidió usar el CSV)
                speedup = "0";
            }

            return `
            <tr class="border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition group cursor-pointer relative hover:z-50" onclick="openROIModal(${index})">
                
                <!-- DISCIPLINA -->
                <td class="py-2 pl-2 db-text-meta font-mono text-xs uppercase text-gray-400">${discipline}</td>
                
                <!-- HERRAMIENTA (CON ICONO) -->
                <td class="py-2 flex items-center gap-2">
                     <div class="p-1.5 rounded-md transition bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-500/20 group-hover:text-green-700 dark:group-hover:text-white shrink-0">
                        <i data-lucide="${icon}" class="w-4 h-4"></i> 
                    </div>
                    <span class="db-text-meta font-mono text-xs text-cyan-500">${tool}</span>
                </td>
    
                <!-- DESCRIPCION (CON TOOLTIP) -->
                <td class="py-2 relative">
                    <span class="db-text-body leading-tight group-hover:text-green-400 transition line-clamp-2" style="font-weight: 300 !important;">${task}</span>
                    
                    <!-- TOOLTIP MEJORADO -->
                    <div class="absolute bottom-full left-0 mb-2 w-80 p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.8)] [.light-theme_&]:shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible z-[9999] pointer-events-none
                                bg-slate-900 [.light-theme_&]:bg-white 
                                text-gray-300 [.light-theme_&]:text-slate-700
                                border border-slate-700 [.light-theme_&]:border-slate-200 transition-opacity duration-200">
                        <div class="font-sans font-semibold mb-2 border-b pb-1 uppercase tracking-wider text-xs
                                    text-green-400 [.light-theme_&]:text-green-600 
                                    border-gray-700 [.light-theme_&]:border-gray-200">Detalles del Script</div>
                        <div class="leading-relaxed font-normal text-xs text-justify">
                            ${detail || "Haz clic para ver más información."}
                        </div>
                        <div class="absolute -bottom-1 left-4 w-2 h-2 transform rotate-45
                                    bg-slate-900 [.light-theme_&]:bg-white
                                    border-r border-b border-slate-700 [.light-theme_&]:border-slate-200"></div>
                    </div>
                </td>
    
                <!-- TIEMPOS -->
                <td class="py-2 text-right db-text-meta font-mono">${manual}</td>
                <td class="py-2 pr-2 text-right text-green-700 dark:text-green-400 font-mono db-text-meta">${auto}</td>
                
                <!-- SPEEDUP BADGE -->
                <td class="py-2 pr-2 text-right">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(74,222,128,0.3)]" style="background-color: #4ade80 !important; color: #000000 !important; border: none !important;">
                        ${speedup}x
                    </span>
                </td>
            </tr>`;
        } catch (e) {
            console.error("Error rendering ROI item:", i, e);
            return "";
        }
    }).join('');

    if (window.lucide) window.lucide.createIcons();
}

window.openROIModal = function (index) {
    const item = roiData[index];
    if (!item) return;

    const title = getVal(item, 'descripción corta', 'descripcion corta', 'tarea', 'función');
    const detail = getVal(item, 'descripción detallada', 'descripcion detallada', 'detalle'); // Asegurar match

    const modal = document.getElementById('text-modal');
    if (modal) {
        document.getElementById('text-modal-title').innerText = title;
        document.getElementById('text-modal-content').innerText = detail || "Sin descripción detallada.";
        modal.classList.remove('hidden');
    }
};

function renderCollab(data) {
    const siteContainer = document.getElementById('global-collab-site');
    const officeContainer = document.getElementById('global-collab-office');

    // Inyección Dinámica del Título (Busca "Colaboración" en el CSV)
    // Nota: El container es interno, así que subimos 2 niveles para hallar el encabezado del bento box
    if (siteContainer) {
        // Estructura: h3 -> div(grid) -> div(col) -> siteContainer
        // Buscamos el H3 que está antes del div(grid)
        // siteContainer.parentElement (col) -> parentElement (grid) -> previousSibling (H3)
        injectSectionHeader('global-collab-site', 'colaboracion', 'COLABORACIÓN', 'users', 2);
    }

    if (!data) return;

    const siteRoles = data.filter(d => getVal(d, 'seccion').toLowerCase().includes('obra'));
    const officeRoles = data.filter(d => getVal(d, 'seccion').toLowerCase().includes('oficina'));

    // Función de Item con TOOLTIP (Datos 100% del CSV)
    const genItem = (item, colorClass, hoverClass, tooltipTheme) => {
        const role = getVal(item, 'rol', 'cargo');
        const desc = getVal(item, 'descripcion', 'desc');
        const resp = getVal(item, 'responsabilidades');
        const icon = resolveIcon(item, 'user');

        // Asignar colores según tema
        // Asignar colores según tema - Usando Clases arbitrarias para light-mode
        // Green Theme (Default Dark: Green-400, Light: Green-600)
        // Blue Theme (Default Dark: Blue-400, Light: Blue-600)
        const titleColorClass = tooltipTheme === 'green'
            ? 'text-green-400 [.light-theme_&]:text-green-600'
            : 'text-blue-400 [.light-theme_&]:text-blue-600';

        return `
            <div class="relative group cursor-help mb-3 w-full hover:z-50">
            <div class="flex items-start gap-3">
                <div class="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-white transition mt-0.5 shrink-0">
                    <i data-lucide="${icon}" class="w-3.5 h-3.5 opacity-70 group-hover:opacity-100"></i>
                </div>
                <div class="flex flex-col min-w-0">
                    <span class="db-text-body font-bold text-white ${hoverClass} font-mono truncate transition leading-tight">${role}</span>
                    <span class="db-text-meta font-mono text-gray-500 truncate mt-0.5">${resp || ''}</span>
                </div>
            </div>
            
            <div class="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.8)] [.light-theme_&]:shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible z-[9999] pointer-events-none
                        bg-slate-900 [.light-theme_&]:bg-white 
                        text-gray-300 [.light-theme_&]:text-slate-700
                        border border-slate-700 [.light-theme_&]:border-slate-200">
                <div class="font-sans font-semibold mb-1 border-b pb-1 uppercase tracking-wider text-xs
                            ${titleColorClass} border-gray-700 [.light-theme_&]:border-gray-200">${role.toUpperCase()}</div>
                <div class="leading-relaxed font-normal text-xs">
                    ${desc || "Sin información disponible."}
                </div>
                <div class="absolute -bottom-1 left-4 w-2 h-2 transform rotate-45
                            bg-slate-900 [.light-theme_&]:bg-white
                            border-r border-b border-slate-700 [.light-theme_&]:border-slate-200"></div>
            </div>
        </div>`;
    };

    if (siteContainer) siteContainer.innerHTML = siteRoles.map(r => genItem(r, 'text-blue-400', 'group-hover:text-blue-400', 'blue')).join('');
    if (officeContainer) officeContainer.innerHTML = officeRoles.map(r => genItem(r, 'text-blue-400', 'group-hover:text-blue-400', 'blue')).join('');

    if (window.lucide) window.lucide.createIcons();
}
// ==========================================================================
// 6. UTILIDADES UI (NAVEGACIÓN & FILTROS)
// ==========================================================================

// ==========================================================================
// 6. UTILIDADES UI (NAVEGACIÓN & FILTROS)
// ==========================================================================

let currentImageIndex = 0; // Para la galería del modal

function processProjects(data) {
    if (!data || data.length === 0) return;

    // Verificar si existe la DB de imágenes generada 
    const hasImageDB = (typeof PROJECT_IMAGES_DB !== 'undefined');
    if (hasImageDB) console.log("DB de Imágenes cargada correctamente.");

    projectsData = data.map((d, i) => {
        const rawYear = String(getVal(d, 'año', 'year'));
        const matches = rawYear.match(/\d{4}/g);
        let cleanYear = 0;
        if (matches) cleanYear = Math.max(...matches.map(Number));

        const pid = getVal(d, 'id');
        let projectImages = [];
        let coverImage = null;

        if (hasImageDB) {
            if (PROJECT_IMAGES_DB[pid]) {
                // Usar DB generado
                const entry = PROJECT_IMAGES_DB[pid];

                // La DB ya contiene rutas relativas completas desde la raíz del sitio
                projectImages = entry.images || [];

                // Diccionario de overrides para la portada
                const topCoverOverrides = {
                    'P27': 'scudo de Armas_02', // Estación Escudo de Armas_02
                    'P25': 'rea_02', // Aérea_02
                    'P18': 'Acceso_02',
                    'P08': 'Fachada Principal_03'
                };

                // La portada por defecto es la primera imagen alfabéticamente
                if (projectImages.length > 0) {
                    coverImage = projectImages[0];

                    if (topCoverOverrides[pid]) {
                        const keyword = topCoverOverrides[pid];
                        // Buscar la imagen que contenga el keyword (ignorando mayúsculas/minúsculas para mayor seguridad)
                        const foundImg = projectImages.find(img => img.toLowerCase().includes(keyword.toLowerCase()));
                        if (foundImg) {
                            coverImage = foundImg;
                        }
                    }
                }
            }
        } else {
            // Fallback antiguo: intentar adivinar ruta hardcodeada
            coverImage = `img/${pid} ${getVal(d, 'nombre')}/1.jpg`;
            projectImages = [coverImage];
        }


        return {
            originalIndex: i,
            id: pid,
            nombre: getVal(d, 'nombre'),
            disciplina: getVal(d, 'disciplinas'), // Alias needed for filters
            disciplinas: getVal(d, 'disciplinas'),
            tipologia: getVal(d, 'tipologia'),
            fase: getVal(d, 'fase'),
            ubicacion: getVal(d, 'ubicacion'),
            anio: cleanYear, // Integer year for sorting/filtering
            anioStr: getVal(d, 'año'),
            descripcion: getVal(d, 'descripción'),
            reto: getVal(d, 'reto'),
            software: getVal(d, 'software'),
            imagen: coverImage,      // Portada
            imagenes: projectImages  // Array completo ordenado
        };
    });

    filteredProjects = [...projectsData];
    renderGlobalAnalytics(projectsData);
    populateAllFilters();
    runFilter(); // Apply initial filters (like Top 5) which will also call runSort() and updateSystemStatus()
}

function hideLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (screen) {
        setTimeout(() => {
            screen.style.opacity = '0';
            setTimeout(() => screen.classList.add('hidden'), 500);
        }, 800);
    }
}

function initEventListeners() {
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('main-sidebar');
        const btn = document.getElementById('menu-toggle-btn');
        if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !btn.contains(e.target)) toggleSidebar();

        const menu = document.getElementById('filter-dropdown');
        const btnFilter = document.getElementById('btn-filter-toggle');
        if (menu && !menu.classList.contains('hidden') && !menu.contains(e.target) && !btnFilter.contains(e.target)) menu.classList.add('hidden');

        const galleryModal = document.getElementById('gallery-modal');
        if (galleryModal && !galleryModal.classList.contains('hidden') && e.target.id === 'gallery-backdrop') closeGallery();

        // Close Reto Tooltips when clicking outside
        if (!e.target.closest('.group\\/reto')) {
            document.querySelectorAll('.reto-tooltip').forEach(el => el.classList.add('hidden'));
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGallery();
        if (!document.getElementById('gallery-modal').classList.contains('hidden')) {
            if (e.key === 'ArrowRight') navigateImage(1); // Cambiado a navegar imagen
            if (e.key === 'ArrowLeft') navigateImage(-1);
            if (e.key === 'ArrowUp') navigateProject(-1); // Proyectos con Arriba/Abajo
            if (e.key === 'ArrowDown') navigateProject(1);
        }
    });

    document.getElementById('btn-filter-toggle')?.addEventListener('click', (e) => { e.stopPropagation(); toggleFilterMenu(); });
}

window.toggleSidebar = function () { document.getElementById('main-sidebar').classList.toggle('open'); };

window.goHome = function () {
    const hero = document.getElementById('hero-dashboard');
    const appWrapper = document.getElementById('app-wrapper');
    const sidebar = document.getElementById('main-sidebar');
    if (!hero.classList.contains('hidden')) return;
    if (appWrapper) appWrapper.classList.add('fade-scale-out');
    sidebar.classList.remove('open');
    setTimeout(() => {
        if (appWrapper) { appWrapper.classList.add('hidden'); appWrapper.classList.remove('fade-scale-out'); }
        hero.classList.remove('hidden');
        hero.classList.remove('fade-in-up');
        void hero.offsetWidth;
        hero.classList.add('fade-in-up');
    }, 400);
};
window.showHome = window.goHome;

window.dismissTopWarning = function () {
    const warningEl = document.getElementById('top-projects-warning');
    if (warningEl) {
        warningEl.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => warningEl.classList.add('hidden'), 500); // Esperar CSS transition
    }
};

window.switchView = function (viewName, fromHome = false) {
    const hero = document.getElementById('hero-dashboard');
    const appWrapper = document.getElementById('app-wrapper');
    const sidebar = document.getElementById('main-sidebar');
    const views = ['view-global', 'view-projects', 'view-ai'];

    const activate = () => {
        appWrapper.classList.remove('hidden');
        views.forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById(`view-${viewName}`).classList.remove('hidden');
        if (viewName === 'ai') {
            document.getElementById('view-ai').classList.add('ai-container-mode');
            renderAI();
        } else {
            document.getElementById('view-ai').classList.remove('ai-container-mode');
        }

        // Trigger warning si entra a proyectos por primera vez
        if (viewName === 'projects' && !hasSeenTopWarning && isTop5Active) {
            hasSeenTopWarning = true;
            setTimeout(() => {
                const warningEl = document.getElementById('top-projects-warning');
                if (warningEl) {
                    warningEl.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
                    // Ocultar automáticamente después de 10 segundos
                    setTimeout(() => dismissTopWarning(), 10000);
                }
            }, 800); // Dar tiempo a la animación de cambio de pantalla
        }

        sidebar.classList.remove('open');
    };

    if (!hero.classList.contains('hidden') || fromHome) {
        hero.classList.add('fade-scale-out');
        setTimeout(() => {
            hero.classList.add('hidden');
            hero.classList.remove('fade-scale-out');
            activate();
            appWrapper.classList.add('fade-scale-in');
            setTimeout(() => appWrapper.classList.remove('fade-scale-in'), 500);

            // Trigger Animations if entering Global Dashboard
            if (viewName === 'global') {
                setTimeout(() => {
                    renderGlobalAnalytics(projectsData, true);
                    renderGlobalDisciplines(projectsData, disciplinesData, true);
                    renderROI(roiData, true);
                }, 100);
            }

        }, 300);
    } else {
        activate();
        // Trigger Animations immediately if no transition
        if (viewName === 'global') {
            renderGlobalAnalytics(projectsData, true);
            renderGlobalDisciplines(projectsData, disciplinesData, true);
            renderROI(roiData, true);
        }
    }
};

function updateSystemStatus() {
    const statusTextEl = document.getElementById('system-status-text');
    const filterBtn = document.getElementById('btn-filter-toggle');
    if (!statusTextEl) return;

    const fLoc = document.getElementById('filter-loc')?.value || 'all';
    const fType = document.getElementById('filter-type')?.value || 'all';
    const fYear = document.getElementById('filter-year')?.value || 'all';
    const fDisc = document.getElementById('filter-disc')?.value || 'all';
    const fPhase = document.getElementById('filter-phase')?.value || 'all';

    let activeFilters = [];
    if (fLoc !== 'all') activeFilters.push(`UBIC:${fLoc.substring(0, 10).toUpperCase()}`);
    if (fType !== 'all') activeFilters.push(`TIPO:${fType.substring(0, 10).toUpperCase()}`);
    if (fYear !== 'all') activeFilters.push(`AÑO:${fYear}`);
    if (fDisc !== 'all') activeFilters.push(`DISC:${fDisc.substring(0, 10).toUpperCase()}`);
    if (fPhase !== 'all') activeFilters.push(`FASE:${fPhase.substring(0, 10).toUpperCase()}`);

    // Construir texto de estado
    let statusText = `ITEMS:${filteredProjects.length}`;

    // Convertir vista a texto amigable
    const viewText = currentViewMode === 'gallery' ? 'GALERÍA' : 'LISTA';

    if (isTop5Active) {
        statusText += ` | TIPO: TOP PROJECTS | VISTA: ${viewText}`;
    } else if (activeFilters.length > 0) {
        statusText += ` | ${activeFilters.join(' | ')} | VISTA: ${viewText}`;
    } else {
        statusText += ` | VISTA: ${viewText}`;
    }

    // Asignar texto
    statusTextEl.innerText = statusText;

    // Forzar siempre gris en el texto de estado
    statusTextEl.classList.remove('text-cyan-400');
    statusTextEl.classList.add('text-gray-400');

    // Feedback visual SOLO en el botón
    if (activeFilters.length > 0) {
        if (filterBtn) {
            filterBtn.classList.remove('border-gray-700', 'text-gray-400');
            filterBtn.classList.add('border-cyan-500', 'text-cyan-400', 'bg-cyan-900/10');
        }
    } else {
        if (filterBtn) {
            filterBtn.classList.add('border-gray-700', 'text-gray-400');
            filterBtn.classList.remove('border-cyan-500', 'text-cyan-400', 'bg-cyan-900/10');
        }
    }

    // Feedback visual para botón Top 5
    const top5Btn = document.getElementById('btn-top5');
    if (top5Btn) {
        if (isTop5Active) {
            top5Btn.classList.remove('bg-transparent', 'border-gray-700', 'text-gray-400');
            top5Btn.classList.add('border-cyan-500', 'text-cyan-400', 'bg-cyan-900/10');
        } else {
            top5Btn.classList.remove('border-cyan-500', 'text-cyan-400', 'bg-cyan-900/10');
            top5Btn.classList.add('bg-transparent', 'border-gray-700', 'text-gray-400');
        }
    }
}

window.toggleTop5 = function () {
    isTop5Active = !isTop5Active;
    if (isTop5Active) {
        // Limpiar otros filtros si se reactiva Top Projects
        document.querySelectorAll('.filter-select').forEach(s => s.value = 'all');
        document.getElementById('search-bar').value = '';
    }
    runFilter();
};
window.toggleFilterMenu = function () { document.getElementById('filter-dropdown').classList.toggle('hidden'); };
window.resetFilters = function () { document.querySelectorAll('.filter-select').forEach(s => s.value = 'all'); handleFilterChange(); };
window.handleFilterChange = function () {
    if (isTop5Active) isTop5Active = false;
    runFilter();
};

window.runFilter = function () {
    const s = document.getElementById('search-bar').value.toLowerCase();
    const fLoc = document.getElementById('filter-loc')?.value || 'all';
    const fType = document.getElementById('filter-type')?.value || 'all';
    const fYear = document.getElementById('filter-year')?.value || 'all';
    const fDisc = document.getElementById('filter-disc')?.value || 'all';
    const fPhase = document.getElementById('filter-phase')?.value || 'all';

    filteredProjects = projectsData.filter(p => {
        const matchesText = (p.nombre.toLowerCase().includes(s) || p.id.toLowerCase().includes(s));
        let matchesTop5 = true;
        if (isTop5Active) {
            const pName = p.nombre.toLowerCase();
            const pLoc = p.ubicacion.toLowerCase();
            matchesTop5 = TOP_PROJECTS_LIST.some(item =>
                pName.includes(item.name.toLowerCase()) && pLoc.includes(item.loc.toLowerCase())
            );
        }
        const mLoc = (fLoc === 'all' || p.ubicacion === fLoc);
        const mType = (fType === 'all' || p.tipologia === fType);
        const mYear = (fYear === 'all' || p.anio == fYear);
        const mDisc = (fDisc === 'all' || p.disciplina === fDisc);
        const mPhase = (fPhase === 'all' || p.fase === fPhase);

        return matchesText && matchesTop5 && mLoc && mType && mYear && mDisc && mPhase;
    });
    runSort();
    updateSystemStatus();
};

window.handleFilterChange = window.runFilter;

function populateAllFilters() {
    const getOptions = (key) => [...new Set(projectsData.map(p => p[key]))].filter(Boolean).sort();
    const setOptions = (id, label, opts) => { const el = document.getElementById(id); if (el) el.innerHTML = `<option value="all">${label}</option>` + opts.map(x => `<option value="${x}">${x}</option>`).join(''); };

    setOptions('filter-loc', 'UBICACIÓN: TODAS', getOptions('ubicacion'));
    setOptions('filter-type', 'TIPO: TODOS', getOptions('tipologia'));
    setOptions('filter-year', 'AÑO: TODOS', getOptions('anio').sort((a, b) => b - a));
    setOptions('filter-disc', 'DISCIPLINA: TODAS', getOptions('disciplina'));
    setOptions('filter-phase', 'FASE: TODAS', getOptions('fase'));
}

window.runSort = function () {
    const sortValue = document.getElementById('sort-order')?.value || 'id-desc';

    filteredProjects.sort((a, b) => {
        const valA = (a[getSortKey(sortValue)] || '').toString().toLowerCase();
        const valB = (b[getSortKey(sortValue)] || '').toString().toLowerCase();

        switch (sortValue) {
            case 'id-desc':
                return parseInt(b.id.replace(/\D/g, '')) - parseInt(a.id.replace(/\D/g, ''));
            case 'id-asc':
                return parseInt(a.id.replace(/\D/g, '')) - parseInt(b.id.replace(/\D/g, ''));
            case 'name-asc':
                return valA.localeCompare(valB);
            case 'name-desc':
                return valB.localeCompare(valA);
            case 'loc':
                return valA.localeCompare(valB);
            case 'year-desc':
                return parseInt(b.anio) - parseInt(a.anio);
            case 'year-asc':
                return parseInt(a.anio) - parseInt(b.anio);
            case 'type':
                return valA.localeCompare(valB);
            case 'phase':
                return valA.localeCompare(valB);
            default:
                return 0;
        }
    });

    renderProjects(filteredProjects);
};

function getSortKey(sortValue) {
    if (sortValue.includes('name')) return 'nombre';
    if (sortValue.includes('loc')) return 'ubicacion';
    if (sortValue.includes('year')) return 'anio';
    if (sortValue.includes('type')) return 'tipologia';
    if (sortValue.includes('phase')) return 'fase';
    return 'id';
}

window.toggleTheme = function () { document.body.classList.toggle('light-theme'); };

window.setProjectView = function (mode) {
    currentViewMode = mode;
    document.getElementById('list-view-wrapper').classList.toggle('hidden', mode !== 'list');
    document.getElementById('gallery-view-wrapper').classList.toggle('hidden', mode !== 'gallery');

    // Actualizar estado visual de los botones
    const btnList = document.getElementById('btn-view-list');
    const btnGallery = document.getElementById('btn-view-gallery');

    if (btnList) {
        btnList.className = mode === 'list'
            ? 'p-1.5 hover:bg-white/10 rounded text-cyan-400 active transition'
            : 'p-1.5 hover:bg-white/10 rounded text-gray-400 transition';
    }
    if (btnGallery) {
        btnGallery.className = mode === 'gallery'
            ? 'p-1.5 hover:bg-white/10 rounded text-cyan-400 active transition'
            : 'p-1.5 hover:bg-white/10 rounded text-gray-400 transition';
    }

    updateSystemStatus();
};

function renderProjects(list) {
    const listContainer = document.getElementById('proyectos-list-container');
    if (listContainer) {
        listContainer.innerHTML = list.map(p => {
            const retoFull = p.reto || '';
            const isLong = retoFull.length > 80;

            // Determinar si es un proyecto TOP
            const pName = p.nombre.toLowerCase();
            const pLoc = p.ubicacion.toLowerCase();
            const isTopProject = TOP_PROJECTS_LIST.some(item =>
                pName.includes(item.name.toLowerCase()) && pLoc.includes(item.loc.toLowerCase())
            );

            const retoHtml = `
            <div class="relative group/reto">
                <div class="${isLong ? 'line-clamp-3' : ''} text-gray-300 leading-tight bg-transparent">
                    ${retoFull}
                </div>
                ${isLong ? `
                <button 
                    onmouseenter="showRetoTooltip(this, event, '${p.id}')" 
                    onmouseleave="hideRetoTooltip()" 
                    class="text-cyan-400 text-[10px] font-bold mt-1 hover:underline hover:text-cyan-300 transition-colors bg-transparent relative z-10">[Ver más]</button>
                 ` : ''}
            </div>`;
            return `
            <div class="tech-list-row grid grid-cols-[40px_10%_15%_15%_10%_5%_8%_8%_6%_1fr] gap-4 border-b border-gray-800 p-3 text-white hover:bg-white/5 cursor-pointer items-start text-xs font-mono" onclick="if(!event.target.closest('button')) openGallery('${p.id}')">
                <div class="text-cyan-500 font-bold flex items-center gap-1">
                    ${p.id}
                </div>
                <div class="font-bold whitespace-normal break-words leading-tight relative flex items-center">
                    ${isTopProject ? '<span class="flex h-2 w-2 relative mr-2 shrink-0"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span></span>' : ''}
                    <span>${p.nombre}</span>
                </div>
                <div class="text-gray-400 leading-tight">${p.descripcion}</div>
                ${retoHtml}
                <div class="text-gray-300 leading-tight">${p.ubicacion}</div>
                <div class="text-gray-500">${p.anioStr}</div>
                <div class="text-gray-400 leading-tight">${p.disciplinas}</div>
                <div class="text-gray-400 leading-tight">${p.tipologia}</div>
                <div class="text-gray-400 leading-tight">${p.fase}</div>
                <div class="text-cyan-400/70 text-[10px] leading-tight break-words">${p.software}</div>
            </div>`;
        }).join('');
    }

    const galleryContainer = document.getElementById('gallery-grid-container');
    if (galleryContainer) {
        galleryContainer.innerHTML = list.map(p => `
            <div class="group relative aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden cursor-pointer border border-gray-800 hover:border-cyan-500 transition" onclick="openGallery('${p.id}')">
                ${p.imagen && !p.imagen.includes('undefined') ? `<div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('${p.imagen}');"></div>` : `<div class="absolute inset-0 flex items-center justify-center bg-[#1a202c] text-gray-500 text-[10px] font-bold tracking-widest">CONFIDENCIAL</div>`}
                <div class="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent font-mono text-white">
                    <div class="text-[10px] opacity-80">${p.id}</div>
                    <div class="text-xs leading-tight truncate my-0.5">${p.nombre}</div>
                    <div class="text-[10px] opacity-70 truncate">${p.tipologia}</div>
                    <div class="absolute top-2 right-2 bg-black/50 px-1.5 py-0.5 rounded text-[9px] backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">${p.imagenes.length} FOTOS</div>
                </div>
            </div>
        `).join('');
    }
}

// MODALES
window.openRetoModal = function (id, event) {
    if (event) event.stopPropagation();
    const project = projectsData.find(p => p.id === id);
    if (!project) return;
    const modal = document.getElementById('text-modal');
    if (modal) {
        document.getElementById('text-modal-title').innerText = `RETO: ${project.nombre}`;
        document.getElementById('text-modal-content').innerText = project.reto || "Sin descripción.";
        modal.classList.remove('hidden');
    }
};

// TOOLTIPS (Reto Inline)
// GLOBAL TOOLTIP LOGIC
let globalTooltipEl = null;

function initGlobalTooltip() {
    if (document.getElementById('global-reto-tooltip')) return;

    globalTooltipEl = document.createElement('div');
    globalTooltipEl.id = 'global-reto-tooltip';
    globalTooltipEl.className = `fixed hidden z-[9999] p-4 rounded-xl shadow-2xl 
                                bg-slate-900 border border-slate-700 
                                [.light-theme_&]:bg-white [.light-theme_&]:border-slate-200 [.light-theme_&]:shadow-[0_10px_40px_rgba(0,0,0,0.2)]
                                text-gray-300 [.light-theme_&]:text-slate-700 transition-opacity duration-200 pointer-events-none`;
    // Force bigger width but NO min-height to fit content exactly
    globalTooltipEl.style.width = '700px';
    globalTooltipEl.style.maxWidth = '90vw';
    globalTooltipEl.style.minHeight = 'auto'; // Removed fixed min-height
    // globalTooltipEl.style.aspectRatio = '16/9'; // Removed to allow content to expand if needed
    globalTooltipEl.style.display = 'flex';
    globalTooltipEl.style.flexDirection = 'column';

    document.body.appendChild(globalTooltipEl);
}

window.showRetoTooltip = function (btn, event, projectId) {
    if (!globalTooltipEl) initGlobalTooltip();

    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    // Content
    globalTooltipEl.innerHTML = `
        <div class="font-sans font-bold mb-2 border-b pb-2 uppercase tracking-wider text-xs text-cyan-400 [.light-theme_&]:text-cyan-600 border-gray-700 [.light-theme_&]:border-gray-200 shrink-0">
            RETO
        </div>
        <div class="leading-relaxed font-normal text-xs font-mono pr-1 flex-1">
           ${project.reto || ''}
        </div>
    `;

    // Remove hidden class to calculate size
    globalTooltipEl.classList.remove('hidden');

    // Positioning
    const rect = btn.getBoundingClientRect();
    const tooltipRect = globalTooltipEl.getBoundingClientRect();

    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left;

    // Check if it goes off screen top
    if (top < 10) {
        top = rect.bottom + 10;
    }

    // Check right edge
    if (left + tooltipRect.width > window.innerWidth - 20) {
        left = window.innerWidth - tooltipRect.width - 20;
    }

    globalTooltipEl.style.top = `${top}px`;
    globalTooltipEl.style.left = `${left}px`;
};

window.hideRetoTooltip = function () {
    if (globalTooltipEl) globalTooltipEl.classList.add('hidden');
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initGlobalTooltip);

window.closeTextModal = function () { document.getElementById('text-modal')?.classList.add('hidden'); };

window.openGallery = function (id) {
    const idx = filteredProjects.findIndex(p => p.id === id);
    if (idx === -1) return;
    currentProjectIndex = idx;

    // Al abrir proyecto, empezamos en la primera imagen (alfabético)
    currentImageIndex = 0;

    updateModalContent();
    document.getElementById('gallery-modal').classList.remove('hidden');
};

window.closeGallery = () => {
    document.getElementById('gallery-modal').classList.add('hidden');
    const videoEl = document.getElementById('modal-video-element');
    if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
    }
};

window.navigateProject = function (direction) {
    if (currentProjectIndex === -1) return;
    let newIndex = currentProjectIndex + direction;
    if (newIndex < 0) newIndex = filteredProjects.length - 1;
    if (newIndex >= filteredProjects.length) newIndex = 0;
    currentProjectIndex = newIndex;

    // Reset imagen al cambiar proyecto
    currentImageIndex = 0;

    updateModalContent();
};

window.navigateImage = function (direction) {
    const p = filteredProjects[currentProjectIndex];
    if (!p || !p.imagenes || p.imagenes.length <= 1) return;

    let newImgIdx = currentImageIndex + direction;
    if (newImgIdx < 0) newImgIdx = p.imagenes.length - 1;
    if (newImgIdx >= p.imagenes.length) newImgIdx = 0;

    currentImageIndex = newImgIdx;
    updateModalContent();
};

function updateModalContent() {
    const p = filteredProjects[currentProjectIndex];
    document.getElementById('modal-project-id').innerText = p.id;
    document.getElementById('modal-project-name').innerText = p.nombre;
    document.getElementById('modal-project-details').innerText = `${p.ubicacion} | ${p.anioStr} | ${p.tipologia} | ${p.fase}`;

    // Contenedor principal de medios
    const mediaContainer = document.getElementById('gallery-backdrop');
    // Elementos existentes
    let imgEl = document.getElementById('modal-img-bg');
    let videoEl = document.getElementById('modal-video-element');
    const counterEl = document.getElementById('modal-image-counter');

    // Crear elemento de video si no existe
    if (!videoEl) {
        videoEl = document.createElement('video');
        videoEl.id = 'modal-video-element';
        videoEl.className = 'w-full h-full object-contain hidden pointer-events-auto';
        videoEl.controls = true;
        videoEl.autoplay = true;
        videoEl.loop = true;

        // Insertar en la posición correcta (reemplazando visualmente imgEl cuando toque)
        if (imgEl && imgEl.parentNode) {
            imgEl.parentNode.insertBefore(videoEl, imgEl);
        } else {
            mediaContainer.appendChild(videoEl);
        }
    }

    // Obtener recurso actual
    let currentSrc = "";
    if (p.imagenes && p.imagenes.length > 0) {
        currentSrc = p.imagenes[currentImageIndex];
        if (counterEl) counterEl.innerText = `${currentImageIndex + 1} / ${p.imagenes.length}`;
    } else {
        currentSrc = p.imagen; // Fallback
        if (counterEl) counterEl.innerText = "1 / 1";
    }

    // Extraer nombre del espacio
    let spaceName = "";
    if (currentSrc && !currentSrc.includes('undefined')) {
        const filename = currentSrc.split('/').pop(); // "Archivo.jpg"
        spaceName = filename.split('.')[0]; // "Archivo"
    }

    // Actualizar textos
    document.getElementById('modal-project-id').innerText = `${p.id} / ${filteredProjects.length}`;
    document.getElementById('modal-project-name').innerText = p.nombre;

    const detailsContainer = document.getElementById('modal-project-details');
    // Usar innerHTML para poder inyectar el span con color
    // Compactar ubicación si es muy larga (específicamente P07 y P08)
    let locationDisplay = p.ubicacion;
    if (p.id === 'P07' || p.id === 'P08' || locationDisplay.length > 50) {
        locationDisplay = "Múltiples Sedes";
    }

    // Cambio a CYAN brillante sin negrita (eliminado font-bold)
    let spaceNameHtml = spaceName ? `<span class="text-[#00e5ff] ml-2">| ${spaceName}</span>` : "";
    detailsContainer.innerHTML = `${locationDisplay} | ${p.anioStr} | ${p.tipologia} | ${p.fase} ${spaceNameHtml}`;

    // Determinar tipo de archivo (Soportando mayúsculas también)
    const srcLower = (currentSrc || "").toLowerCase();
    const isVideo = srcLower.endsWith('.mp4') || srcLower.endsWith('.mov') || srcLower.endsWith('.webm') || srcLower.endsWith('.mkv');

    // Resetear estados visuales
    imgEl.style.opacity = '0';
    videoEl.style.opacity = '0';

    // Detener video previo
    videoEl.pause();
    videoEl.src = "";

    setTimeout(() => {
        if (isVideo) {
            // MOSTRAR VIDEO
            imgEl.classList.add('hidden');
            videoEl.classList.remove('hidden');

            videoEl.src = currentSrc;
            videoEl.load();
            videoEl.style.opacity = '1';
            // Play handled by autoplay attribute, but ensuring request
            videoEl.play().catch(e => console.log("Auto-play prevented:", e));

        } else {
            // MOSTRAR IMAGEN
            videoEl.classList.add('hidden');
            imgEl.classList.remove('hidden');

            if (currentSrc && typeof currentSrc === 'string' && currentSrc.trim() !== '' && currentSrc !== 'undefined' && !currentSrc.includes('undefined')) {
                imgEl.style.backgroundImage = `url('${currentSrc}')`;
                imgEl.innerText = "";
                imgEl.className = "w-full h-full bg-contain bg-center bg-no-repeat transition-all duration-300";
            } else {
                imgEl.style.backgroundImage = 'none';
                imgEl.innerText = "CONFIDENCIAL";
                imgEl.className = "w-full h-full flex items-center justify-center text-gray-500 font-bold tracking-[1em] text-2xl md:text-4xl bg-[#1a202c] transition-all duration-300";
            }
            imgEl.style.opacity = '1';
        }
    }, 150);
}


// ... Rest of the file unchanged (renderAI, etc)

function renderAI() {
    const container = document.getElementById('ai-universe');
    if (!container) return;
    container.innerHTML = '';

    if (!aiData || aiData.length === 0) return;

    aiData.forEach((item, i) => {
        // ... (existing loop code placeholder)
    });

    // Inject Massive Neon Halo Background (Before items)
    const halo = document.createElement('div');
    halo.className = 'neon-halo';
    halo.innerHTML = `
        <div class="halo-ring"></div>
        <div class="halo-core"></div>
        <div id="halo-particles" class="absolute inset-0 overflow-hidden rounded-full"></div>
    `;
    // Prepend to ensure it is behind orbs if z-index matches, but CSS z-index handles layers mostly
    if (container.firstChild) {
        container.insertBefore(halo, container.firstChild);
    } else {
        container.appendChild(halo);
    }

    // Spawn Energy Particles Function
    const particleContainer = halo.querySelector('#halo-particles');
    const spawnParticle = () => {
        if (!particleContainer) return;
        const p = document.createElement('div');
        p.className = 'energy-particle';

        // Random size
        const size = Math.random() * 4 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;

        // Start at center
        p.style.left = '50%';
        p.style.top = '50%';

        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 200 + 100; // Distance to travel
        const tx = Math.cos(angle) * 50 + 'px'; // Start slightly offset
        const ty = Math.sin(angle) * 50 + 'px';
        const txEnd = Math.cos(angle) * velocity + 'px'; // End further out
        const tyEnd = Math.sin(angle) * velocity + 'px';

        p.style.setProperty('--tx', tx);
        p.style.setProperty('--ty', ty);
        p.style.setProperty('--tx-end', txEnd);
        p.style.setProperty('--ty-end', tyEnd);

        p.style.animation = `floatOut ${Math.random() * 2 + 2}s linear forwards`;

        particleContainer.appendChild(p);

        // Cleanup
        setTimeout(() => { p.remove(); }, 4000);
    };

    // Start emitting particles
    // Clear any existing interval to prevent duplicates on re-render
    if (window.haloInterval) clearInterval(window.haloInterval);
    window.haloInterval = setInterval(spawnParticle, 200);

    aiData.forEach((item, i) => {
        const orb = document.createElement('div');
        orb.className = `ai-orb float-anim-${(i % 3) + 1}`;
        const size = Math.random() * 40 + 120; // 120px - 160px
        const left = Math.random() * 80 + 10;
        const top = Math.random() * 60 + 20; // Keep away from top edge

        // Data from CSV
        const title = getVal(item, 'titulo', 'title');
        const desc = getVal(item, 'descripcion', 'desc', 'description');
        const iconName = resolveIcon(item, 'sparkles');

        orb.style.left = `${left}%`;
        orb.style.top = `${top}%`;
        orb.style.width = `${size}px`;
        orb.style.height = `${size}px`;

        // Show Title only (fixed) - ICON REMOVED
        // COMPLEX STRUCTURE FOR NEON RINGS / 3D ROTATION
        orb.innerHTML = `
            <!-- Spinning Ring/Neon Effect -->
            <div class="orb-ring absolute inset-0 rounded-full border-[3px] border-transparent border-t-cyan-400 border-l-purple-500 opacity-80 animate-spin-slow pointer-events-none"></div>
            <div class="orb-ring-inner absolute inset-2 rounded-full border-[2px] border-transparent border-b-white/50 opacity-60 animate-spin-reverse pointer-events-none"></div>
            
            <!-- Core Glow -->
            <div class="orb-core absolute inset-0 bg-radial-gradient from-white/10 to-transparent opacity-50 pointer-events-none"></div>

            <!-- Content -->
            <div class="orb-content flex flex-col items-center justify-center h-full w-full pointer-events-none p-4 text-center z-10 relative">
                <span class="text-sm font-black text-white leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] tracking-wide" style="text-shadow: 0 0 20px cyan;">${title.toUpperCase()}</span>
            </div>
        `;

        // click to show description in a modal or alert
        orb.onclick = (e) => {
            console.log("Orb clicked:", title);
            e.stopPropagation();
            e.preventDefault(); // Prevent default just in case

            const modal = document.getElementById('text-modal');
            if (modal) {
                document.getElementById('text-modal-title').innerText = title;
                document.getElementById('text-modal-content').innerText = desc || "Sin descripción disponible.";
                modal.classList.remove('hidden');
            } else {
                console.error("Modal 'text-modal' not found!");
            }
        };

        // click to show description in a modal or alert (since instructions said "when user clicks")
        orb.onclick = (e) => {
            e.stopPropagation();
            // Reuse the text-modal for description
            const modal = document.getElementById('text-modal');
            if (modal) {
                document.getElementById('text-modal-title').innerText = title;
                document.getElementById('text-modal-content').innerText = desc || "Sin descripción disponible.";
                modal.classList.remove('hidden');
            }
        };

        container.appendChild(orb);
    });

    if (window.lucide) window.lucide.createIcons();
}

// ==========================================================================
// 8. EFECTOS VISUALES & PARALLAX
// ==========================================================================

window.rotateRoom = function (e) {
    const room = document.getElementById('room');
    if (!room) return;
    const x = e.clientX - window.innerWidth / 2;
    const y = e.clientY - window.innerHeight / 2;
    const rotateY = x * 0.01;
    const rotateX = -y * 0.01;
    room.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
};

function initParticles() {
    const container = document.getElementById('ai-particles');
    if (!container) return;
    if (container.children.length > 0) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        p.style.left = Math.random() * 100 + '%'; p.style.top = Math.random() * 100 + '%';
        p.style.width = Math.random() * 3 + 'px'; p.style.height = p.style.width;
        p.style.animationDuration = (Math.random() * 20 + 10) + 's';
        container.appendChild(p);
    }
}

// ==========================================================================
// 9. EVENTOS GLOBALES (SAFE EXPORT)
// ==========================================================================

// Exponer funciones necesarias para el HTML (onclick handlers)
window.toggleSidebar = window.toggleSidebar || function () { document.getElementById('main-sidebar').classList.toggle('open'); };
window.goHome = window.goHome || function () {
    const hero = document.getElementById('hero-dashboard');
    const appWrapper = document.getElementById('app-wrapper');
    const sidebar = document.getElementById('main-sidebar');
    if (!hero || !hero.classList.contains('hidden')) return;
    if (appWrapper) appWrapper.classList.add('fade-scale-out');
    if (sidebar) sidebar.classList.remove('open');
    setTimeout(() => {
        if (appWrapper) { appWrapper.classList.add('hidden'); appWrapper.classList.remove('fade-scale-out'); }
        if (hero) {
            hero.classList.remove('hidden');
            hero.classList.remove('fade-in-up');
            void hero.offsetWidth;
            hero.classList.add('fade-in-up');
        }
    }, 400);
};
window.switchView = window.switchView;
window.toggleTheme = window.toggleTheme;
window.toggleTop5 = window.toggleTop5;
window.resetFilters = window.resetFilters;
window.handleFilterChange = window.handleFilterChange;
window.setProjectView = window.setProjectView;
window.openRetoModal = window.openRetoModal;
window.closeTextModal = window.closeTextModal;
window.dismissTopWarning = window.dismissTopWarning;
window.openGallery = window.openGallery;
window.closeGallery = window.closeGallery;
window.navigateProject = window.navigateProject;
window.openROIModal = window.openROIModal;
