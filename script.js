// ==========================================================================
// 1. CONFIGURACIÓN DE ORIGEN DE DATOS
// ==========================================================================
// ==========================================================================

const timestamp = Date.now() + '-' + Math.random().toString(36).substring(2, 7);

const URL_PROJECTS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Proyectos_portafolio.csv?t=${timestamp}`;
const URL_DISCIPLINES = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Disciplinas_portafolio.csv?t=${timestamp}`;
const URL_SOFTWARE = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Software_portafolio.csv?t=${timestamp}`;
const URL_NORMS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Normativas%20y%20Est%C3%A1ndares_portafolio.csv?t=${timestamp}`;
const URL_EDUCATION = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Master%20MBIA_portafolio.csv?t=${timestamp}`;
const URL_ROI = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/ROI_Scripts_portafolio.csv?t=${timestamp}`;
const URL_COLLAB = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Colaboraci%C3%B3n_portafolio.csv?t=${timestamp}`;
const URL_SECTIONS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Dashboard%20global_secciones_portafolio.csv?t=${timestamp}`;
const URL_AI_REV = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Inteligencia%20Artificial_portafolio.csv?t=${timestamp}`;
const URL_CONTEXT = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Contexto_IA_Proyectos.csv?t=${timestamp}`;

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
    const textContext = normalizeStr(
        getVal(item, 'nombre') + " " + getVal(item, 'titulo') + " " + getVal(item, 'funcion') + " " + getVal(item, 'rol') + " " + getVal(item, 'pilar')
    );

    if (textContext.includes('visualiza')) return 'image';

    if (cleanIcon.length > 0 && cleanIcon.length < 25 && !cleanIcon.includes(' ')) return cleanIcon;

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
    if (textContext.includes('visualiza')) return 'eye';

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
        d3.csv(URL_AI_REV),
        d3.csv(URL_CONTEXT)
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
        const contextData = getData(9);

        if (contextData && contextData.length > 0) {
            projectsData.forEach(p => {
                const ctx = contextData.find(c => getVal(c, 'id') === getVal(p, 'id'));
                if (ctx) {
                    p.area_ctx = getVal(ctx, 'gba (m2)', 'gba');
                    p.niveles_ctx = getVal(ctx, 'niveles');
                    p.costo_ctx = getVal(ctx, 'costo aproximado (usd)', 'costo aproximado', 'costo');
                }
            });
        }

        console.log("Sistema BIM: Datos cargados.");

        if (projectsData.length > 0) {
            processProjects(projectsData);

            // Inyectar datos estadísticos en el Home Screen
            const statProjects = document.getElementById('stat-projects');
            const statExperience = document.getElementById('stat-experience');
            const statCities = document.getElementById('stat-cities');

            if (statProjects && statExperience && statCities) {
                // Cálculo de años de experiencia (Asumiendo inicio ~2014)
                const startYear = 2014;
                const currentYear = new Date().getFullYear();
                const yearsExp = currentYear - startYear;

                // Cálculo de ciudades únicas (tomando la primera parte de "Ciudad, Estado")
                const uniqueCitiesCount = new Set(projectsData.map(p => getVal(p, 'ubicación', 'ubicacion', 'loc').split(',')[0].trim()).filter(Boolean)).size;

                // Valores fijos solicitados por el usuario
                const displayProjects = 40;
                const displayExperience = 10;
                const displayCities = 20;

                statProjects.setAttribute('data-target', displayProjects);
                statExperience.setAttribute('data-target', displayExperience);
                statCities.setAttribute('data-target', displayCities);

                // Reiniciar la animación de contadores
                animateCounters();
            }
        }

        renderGlobalAnalytics(projectsData);
        renderGlobalPhases(projectsData);
        renderGlobalEnvironment(projectsData);
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
            renderGlobalPhases(projectsData, true);
            renderGlobalEnvironment(projectsData, true);
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

    if (headerEl) {
        headerEl.outerHTML = `
            <div class="flex items-center gap-2 mb-3 border-b border-gray-800/20 pb-2 w-full overflow-hidden">
                <i data-lucide="${iconRaw}" class="text-white w-4 h-4 shrink-0"></i>
                <span class="db-text-header font-bold truncate" title="${title}">${title}</span>
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

    // Sum the values of only the top 4 to make the donut chart close 100%
    const totalTop4 = chartData.reduce((sum, item) => sum + item.v, 0);
    const totalGrouped = Array.from(uniqueProjectMap.values()).length;

    const totalReal = data.length;

    let svg = `<svg viewBox="0 0 36 36" class="donut-svg w-full h-full transform -rotate-90 animate-donut">`;
    let offset = 0;
    const colors = ["#22d3ee", "#3b82f6", "#a855f7", "#10b981"];

    chartData.forEach((d, i) => {
        const pct = (d.v / totalTop4) * 100;
        svg += `<circle cx="18" cy="18" r="15.915" fill="transparent" stroke="${colors[i]}" stroke-width="4" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${-offset}">
            <animate attributeName="stroke-dasharray" from="0 100" to="${pct} ${100 - pct}" dur="3s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.42 0 0.58 1" />
        </circle>`;
        offset += pct;
    });

    svg += `</svg>`;
    container.innerHTML = svg;

    let legendHtml = chartData.map((d, i) => `
        <div class="flex items-center justify-between db-text-body mb-1 font-mono group animate-item ml-2" style="animation-delay: ${i * 0.1}s">
            <div class="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-2">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" style="background:${colors[i]}"></div>
                <span class="db-text-body truncate" title="${d.k}">${d.k}</span>
            </div>
            <span class="db-text-header font-bold w-10 text-right shrink-0"><span class="counter-anim" data-target="${Math.round((d.v / totalTop4) * 100)}">0</span>%</span>
        </div>
    `).join('');

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
        <div class="flex items-center justify-between db-text-body mb-0.5 font-mono group">
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

function renderGlobalPhases(allProjects, animateOnly = false) {
    const container = document.getElementById('global-phases-list');

    // Inyectar título "Fase del Proyecto" dinámico o default
    if (!animateOnly) injectSectionHeader('global-phases-list', 'fase', 'FASE DEL PROYECTO', 'pie-chart', 0);

    if (!container) return;

    const phaseCounts = {};
    let totalProjects = 0;

    allProjects.forEach(p => {
        // En tu nuevo CSV, asumo que la columna 'fase' tiene el dato.
        let faseRaw = getVal(p, 'fase');
        if (faseRaw) {
            // Capitalizar primera letra para visualización
            const fase = faseRaw.charAt(0).toUpperCase() + faseRaw.slice(1);
            phaseCounts[fase] = (phaseCounts[fase] || 0) + 1;
            totalProjects++;
        }
    });

    if (totalProjects === 0) {
        container.innerHTML = '<div class="text-gray-500 text-xs text-center">Datos no disponibles</div>';
        return;
    }

    const stats = Object.entries(phaseCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    let html = '';
    let delay = 0;
    // Paleta púrpura uniforme para todas las barras
    const colors = ["bg-purple-500", "bg-purple-500", "bg-purple-500", "bg-purple-500"];

    stats.forEach((s, idx) => {
        const pct = Math.round((s.count / totalProjects) * 100);
        const colorClass = colors[idx % colors.length];

        let icon = "folder";
        const lowerName = s.name.toLowerCase();
        if (lowerName.includes("obra nueva")) icon = "hammer";
        else if (lowerName.includes("remodelación") || lowerName.includes("remodelacion")) icon = "wrench";
        else if (lowerName.includes("confidencial")) icon = "lock";
        else if (lowerName.includes("scan")) icon = "scan";
        else icon = "file-text";

        html += `
        <div class="flex items-center justify-between db-text-body mb-0.5 font-mono group animate-item" style="animation-delay: ${delay}s">
            <div class="flex items-center gap-2 w-32 shrink-0">
                <i data-lucide="${icon}" class="w-3 h-3 text-gray-500 group-hover:text-${colorClass.replace('bg-', '')} transition"></i>
                <span class="db-text-body truncate pr-2 text-gray-300">${s.name}</span>
            </div>
            <div class="flex-1 mx-2 h-1 bg-[#0f141a] rounded-full overflow-hidden border border-gray-800">
                <div class="h-full ${colorClass} animate-bar" style="--final-width: ${pct}%"></div>
            </div>
            <span class="db-text-header font-bold w-8 text-right text-gray-400"><span class="counter-anim" data-target="${pct}">0</span>%</span>
        </div>`;
        delay += 0.05;
    });

    container.innerHTML = html;
    animateCounters();
}

function renderGlobalEnvironment(allProjects, animateOnly = false) {
    const container = document.getElementById('global-environment-list');

    // Inyectar título "Entorno del Proyecto"
    if (!animateOnly) injectSectionHeader('global-environment-list', 'entorno', 'ENTORNO DEL PROYECTO', 'map-pin', 0);

    if (!container) return;

    let obraCount = 0;
    let oficinaCount = 0;

    allProjects.forEach(p => {
        const entorno = normalizeStr(getVal(p, 'entorno'));
        if (entorno.includes('obra')) obraCount++;
        else if (entorno.includes('oficina') || entorno.includes('diseno')) oficinaCount++;
    });

    const totalReal = allProjects.length;

    if (totalReal === 0) {
        container.innerHTML = '<div class="text-gray-500 text-xs text-center">Datos no disponibles</div>';
        return;
    }

    const pctObra = Math.round((obraCount / totalReal) * 100) || 0;
    const pctOficina = Math.round((oficinaCount / totalReal) * 100) || 0;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full w-full animate-item" style="animation-delay: 0.1s">
            <div class="flex justify-evenly gap-3 xl:gap-5 h-full w-full pt-2">
                <!-- OFICINA -->
                <div class="flex flex-col items-center justify-end h-full">
                    <div class="font-bold font-mono text-blue-400 text-[10px] mb-1"><span class="counter-anim" data-target="${pctOficina}">0</span>%</div>
                    <div class="w-6 xl:w-8 bg-[#0f141a] rounded-t-lg h-16 flex items-end">
                        <div class="w-full bg-blue-500 rounded-t-lg animate-bar-vertical" style="--final-height: ${pctOficina}%"></div>
                    </div>
                    <span class="text-[9px] font-mono text-gray-400 mt-1 truncate text-center uppercase tracking-wider">Oficina</span>
                </div>
                
                <!-- OBRA -->
                <div class="flex flex-col items-center justify-end h-full">
                    <div class="font-bold font-mono text-green-400 text-[10px] mb-1"><span class="counter-anim" data-target="${pctObra}">0</span>%</div>
                    <div class="w-6 xl:w-8 bg-[#0f141a] rounded-t-lg h-16 flex items-end">
                        <div class="w-full bg-green-500 rounded-t-lg animate-bar-vertical" style="--final-height: ${pctObra}%"></div>
                    </div>
                    <span class="text-[9px] font-mono text-gray-400 mt-1 truncate text-center uppercase tracking-wider">Obra</span>
                </div>
            </div>
        </div>
    `;

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

        const nivel = getVal(s, 'nivel');
        const capacidad = getVal(s, 'capacidad');

        const safeNivel = nivel ? nivel.replace(/\n/g, '<br>').replace(/"/g, '&quot;') : '';
        const safeCapacidad = capacidad ? capacidad.replace(/\n/g, '<br>').replace(/"/g, '&quot;') : '';

        const tooltipHTML = `<div class='flex flex-col items-center justify-center text-center'>
            <span class='text-blue-400 text-xs font-normal tracking-wide mb-1'>Nivel: ${safeNivel}</span>
            <span class='text-white text-[11px] leading-relaxed'>${safeCapacidad}</span>
        </div>`;

        return `
        <div class="relative cursor-help p-2 rounded bg-transparent flex flex-col justify-center items-center text-center gap-1.5 hover:border-blue-500/50 hover:bg-blue-500/5 transition group h-full animate-item" style="animation-delay: ${i * 0.05}s"
             data-tooltip-text="${tooltipHTML}"
             onmouseenter="window.showRoiTooltip(event)"
             onmouseleave="window.hideRoiTooltip()"
             onmousemove="window.moveRoiTooltip(event)">
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
        <div class="flex-1 h-auto flex flex-col items-center text-center gap-2 p-3 bg-transparent hover:border-gray-500/30 transition group">
            <div class="p-2 shrink-0 bg-gray-500/10 text-gray-500 rounded group-hover:bg-gray-500/20 group-hover:text-white transition">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
            </div>
            <div class="w-full">
                <div class="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-200 [.light-theme_&]:text-black mb-1 transition leading-tight">${title}</div>
                <div class="db-text-meta font-mono leading-tight">${desc}</div>
            </div>
        </div>`;
    }).join('');
}

function renderEducation(data) {
    const container = document.getElementById('global-education-list');

    // Inyección Dinámica del Título (Busca "Formacion" en el CSV)
    injectSectionHeader('global-education-list', 'formacion', 'FORMACIÓN: MÁSTER GLOBAL BIM Y IA AVANZADA', 'graduation-cap', 0);

    const headerContainer = document.getElementById('global-education-list')?.previousElementSibling;
    if (headerContainer) {

        // Convertir el propio encabezado generado dinámicamente en clickable
        const headerText = headerContainer.querySelector('.db-text-header');
        if (headerText) {
            const originalText = headerText.innerText;
            headerText.innerHTML = `<a href="https://butic.es/master-global-en-bim-ia-avanzada/" target="_blank" class="hover:text-cyan-400 hover:underline transition">${originalText} <i data-lucide="external-link" class="inline w-3 h-3 ml-1 mb-0.5"></i></a>`;
        }

        headerContainer.insertAdjacentHTML('beforeend', `
            <div class="flex items-center gap-2 ml-3 opacity-90 transition hover:opacity-100">
                <span class="text-gray-600">|</span>
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <a href="https://butic.es/" target="_blank" class="text-green-500 hover:text-cyan-400 hover:underline transition text-xs font-mono ml-1">Butic The New School <i data-lucide="external-link" class="inline w-2.5 h-2.5 mb-0.5"></i></a>
                <span class="text-gray-400 text-[10px] font-mono border border-gray-700 px-1.5 py-0.5 rounded ml-1">ESPAÑA</span>
                <span class="text-gray-400 text-[10px] font-mono border border-gray-700 px-1.5 py-0.5 rounded ml-1">ONLINE</span>
                <span class="text-green-400 text-[10px] font-mono border border-green-700/50 bg-green-900/10 px-1.5 py-0.5 rounded ml-1">EN CURSO</span>
                <a href="https://www.credential.net/c455ea9f-59d7-44d6-9d15-c81eb34d5cfb" target="_blank" class="text-blue-400 hover:text-white hover:bg-blue-600 transition text-[10px] font-mono border border-blue-700/50 bg-blue-900/10 px-1.5 py-0.5 rounded ml-1 cursor-pointer flex items-center gap-1">INSIGNIA <i data-lucide="award" class="w-2.5 h-2.5"></i></a>
            </div>`);
    }

    if (!container || !data) return;

    container.innerHTML = data.map(e => {
        const icon = resolveIcon(e, 'graduation-cap');
        const title = getVal(e, 'pilar', 'titulo', 'materia');

        const accionTecnica = getVal(e, 'acción técnica', 'accion tecnica');
        const herramientasClave = getVal(e, 'herramientas clave');

        // Preparar contenido para inyectar en data-tooltip preservando saltos de línea (br) y escapando comillas
        const safeAccionTecnica = accionTecnica ? accionTecnica.replace(/\n/g, '<br>').replace(/"/g, '&quot;') : '';
        const safeHerramientas = herramientasClave ? herramientasClave.replace(/"/g, '&quot;') : '';
        const tooltipHTML = `${safeAccionTecnica}<br><br><span class='text-[10px] text-gray-500 font-mono tracking-wider'>HERRAMIENTAS CLAVE:</span><br><span class='text-xs font-mono text-cyan-400'>${safeHerramientas}</span>`;

        return `
            <div class="relative cursor-help p-2 bg-transparent hover:border-green-500/50 transition flex flex-col items-center justify-center text-center gap-1.5 h-full w-full group"
                 data-tooltip-title="${title}"
                 data-tooltip-text="${tooltipHTML}"
                 onmouseenter="window.showRoiTooltip(event)"
                 onmouseleave="window.hideRoiTooltip()"
                 onmousemove="window.moveRoiTooltip(event)">
            <div class="shrink-0 p-1.5 rounded bg-green-500/10 text-green-500 group-hover:bg-green-500/20 group-hover:text-white transition flex items-center justify-center">
                <i data-lucide="${icon}" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0 w-full">
                <h4 class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-200 [.light-theme_&]:text-black transition mb-0 text-center leading-tight">${title}</h4>
            </div>
        </div > `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
}

window.showRoiTooltip = function (e) {
    if (!window.globalHoverTooltip) {
        window.globalHoverTooltip = document.createElement('div');
        window.globalHoverTooltip.className = `fixed w-max max-w-xs md:max-w-sm px-4 py-3 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] [.light-theme_&]:shadow-xl z-[99999] pointer-events-none transition-opacity duration-200 opacity-0
        text-gray-200 [.light-theme_&]:text-slate-800
        border border-gray-600/30 [.light-theme_&]:border-slate-300/40`;
        window.globalHoverTooltip.style.cssText = "backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; background-color: rgba(15, 20, 26, 0.5) !important;";
        document.body.appendChild(window.globalHoverTooltip);
    }

    const target = e.currentTarget;
    const title = target.getAttribute('data-tooltip-title');
    const text = target.getAttribute('data-tooltip-text');

    const titleHTML = title ? `
        <div class="font-sans font-semibold mb-2 border-b pb-1 uppercase tracking-wider text-xs
        text-green-400 [.light-theme_&]:text-green-600
        border-gray-700 [.light-theme_&]:border-gray-200">${title}</div>` : '';

    window.globalHoverTooltip.innerHTML = `
        ${titleHTML}
        <div class="leading-relaxed font-normal text-xs text-justify w-full">
            ${text}
        </div>
    `;

    window.moveRoiTooltip(e);
    window.globalHoverTooltip.style.opacity = '1';
    window.globalHoverTooltip.style.visibility = 'visible';
};

window.hideRoiTooltip = function () {
    if (window.globalHoverTooltip) {
        window.globalHoverTooltip.style.opacity = '0';
        window.globalHoverTooltip.style.visibility = 'hidden';
    }
};

window.moveRoiTooltip = function (e) {
    if (window.globalHoverTooltip) {
        let x = e.clientX;
        let y = e.clientY - 15;

        // Evadir bordes de la pantalla
        const rect = window.globalHoverTooltip.getBoundingClientRect();
        if (x + 160 > window.innerWidth) x = window.innerWidth - 170; // 160 is half of 320 (w-80)
        if (x - 160 < 0) x = 170;
        if (y - rect.height < 0) y = e.clientY + 15 + rect.height; // show below mouse

        window.globalHoverTooltip.style.left = `${x}px`;
        window.globalHoverTooltip.style.top = `${y}px`;
        window.globalHoverTooltip.style.transform = `translate(-50%, -100%)`;
    }
};

function renderROI(data, animateOnly = false) {
    const container = document.getElementById('global-roi-table');

    // Inyección Dinámica del Título
    if (!animateOnly) injectSectionHeader('global-roi-table', 'ahorro', 'ROI (SCRIPTS DYNAMO)', 'timer', 1);

    if (!container || !data) return;

    // Mostrar todos los datos sin recortes
    let displayData = data;

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

            // Escapar texto para el tooltip
            const rawDetail = detail || "Haz clic para ver más información.";
            const safeDetail = String(rawDetail).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

            return `
            <tr class="border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition group cursor-pointer relative hover:z-50" onclick="openROIModal(${index})">
                
                <!-- DISCIPLINA -->
                <td class="py-2 pl-2 db-text-meta font-mono text-xs uppercase text-gray-400">${discipline}</td>
                
                <!-- HERRAMIENTA(CON ICONO) -->
                <td class="py-2 flex items-center gap-2">
                     <div class="p-1.5 rounded-md transition bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-500/20 group-hover:text-green-700 dark:group-hover:text-white shrink-0">
                        <i data-lucide="${icon}" class="w-4 h-4"></i> 
                    </div>
                    <span class="db-text-meta font-mono text-xs text-cyan-500">${tool}</span>
                </td>
    
                <!-- DESCRIPCION(CON TOOLTIP GLOBAL) -->
                <td class="py-2"
                    data-tooltip-title="Detalles del Script"
                    data-tooltip-text="${safeDetail}"
                    onmouseenter="window.showRoiTooltip(event)"
                    onmouseleave="window.hideRoiTooltip()"
                    onmousemove="window.moveRoiTooltip(event)">
                    <span class="db-text-body leading-tight group-hover:text-green-400 transition line-clamp-2" style="font-weight: 300 !important;">${task}</span>
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
            </tr>
            `;
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

    if (!data) return;

    // Separar en obra vs oficina
    const getCollabData = data;
    const siteRoles = getCollabData.slice(0, Math.ceil(getCollabData.length / 2));
    const officeRoles = getCollabData.slice(Math.ceil(getCollabData.length / 2));

    // Función de Dibujo de Línea Dinámica
    window.drawCollabLine = function (element, color) {
        const svg = document.getElementById('collab-lines-svg');
        const container = document.getElementById('collab-container');
        const centerIcon = document.getElementById('collab-center-avatar'); // Debe añadirse al HTML
        if (!svg || !container || !centerIcon) return;

        const contRect = container.getBoundingClientRect();
        const elRect = element.getBoundingClientRect();
        const centerRect = centerIcon.getBoundingClientRect();

        // El destino es el borde exterior del texto, no del icono
        const textSpan = element.querySelector('span.db-text-body');
        const targetRect = textSpan ? textSpan.getBoundingClientRect() : elRect;

        // Determina si el rol está a la izquierda (Obra) o derecha (Oficina) comparándolo con el centro
        const isLeftColumn = targetRect.left < centerRect.left;

        // Calcular coordenadas de inicio relativas al contenedor
        // Si está a la izquierda, la línea inicia desde el borde izquierdo del avatar
        // Si está a la derecha, inicia desde el borde derecho del avatar
        let startX;
        if (isLeftColumn) startX = centerRect.left - contRect.left - 5;
        else startX = centerRect.right - contRect.left + 5;

        const startY = centerRect.top + (centerRect.height / 2) - contRect.top;

        // Si está a la izquierda, la línea debe llegar hasta el borde derecho del texto. Si está a ladercha, al izquierdo.
        let endX;
        if (isLeftColumn) endX = targetRect.right - contRect.left + 10;
        else endX = targetRect.left - contRect.left - 10;

        const endY = targetRect.top + (targetRect.height / 2) - contRect.top;

        // Limpiar svgs previos
        svg.innerHTML = '';

        // Determinar gradiente
        const strokeColor = color === 'blue' ? 'rgba(96, 165, 250, 0.6)' : 'rgba(74, 222, 128, 0.6)';

        // Crear Curva SVG (Bézier cúbica para un arco suave)
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Puntos de control para la curva en formato "S" suave horizontal
        // Puntos de control para la curva en formato "S" suave horizontal
        const controlX = startX + (endX - startX) * 0.5;
        const pathData = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', '1');
        path.setAttribute('class', 'transition-all duration-300 animate-pulse');

        svg.appendChild(path);
    };

    window.clearCollabLine = function () {
        const svg = document.getElementById('collab-lines-svg');
        if (svg) svg.innerHTML = '';
    };

    window.collabAutoNavItems = [];

    // Función de Item (Dinámico izquierda o derecha) sin bordes de hover
    const genItem = (item, colorClass, hoverClass, colorKey, isOffice = false) => {
        const role = getVal(item, 'rol', 'actor');
        const inData = getVal(item, 'in', 'entrada');
        const outData = getVal(item, 'out', 'salida');
        const icon = resolveIcon(item, 'user', {
            'superintendente': 'hard-hat',
            'residente': 'clipboard-check',
            'gerente': 'building-2',
            'manager': 'monitor',
            'coordinador': 'network',
            'modelador': 'cuboid',
            'cliente': 'users',
            'contratista': 'wrench',
            'mano de obra': 'hard-hat',
            'despacho': 'external-link',
            'jefe': 'calculator'
        });

        const flexRowClass = isOffice ? 'flex-row-reverse' : 'flex-row';
        const textAlignClass = isOffice ? 'text-right items-end' : 'text-left items-start';
        const uniqueId = 'collab-item-' + Math.random().toString(36).substr(2, 9);

        window.collabAutoNavItems.push({
            id: uniqueId,
            role: role,
            inData: inData,
            outData: outData,
            colorKey: colorKey
        });

        return `
        <div id="${uniqueId}" class="collab-item group relative p-1.5 rounded-md border border-transparent transition-all cursor-pointer bg-transparent w-full"
             onmouseenter="window.stopCollabAutoNav(); window.showCollabTooltip('${role}', \`${inData.replace(/`/g, '\\`')}\`, \`${outData.replace(/`/g, '\\`')}\`); window.drawCollabLine(this, '${colorKey}');"
             onmouseleave="window.hideCollabTooltip(); window.clearCollabLine();">
            <div class="flex items-center gap-2 ${flexRowClass}">
                <div class="w-6 h-6 rounded shrink-0 bg-[#0f141a] border border-gray-800 flex items-center justify-center transition shadow-sm ${colorClass}">
                    <i data-lucide="${icon}" class="w-[14px] h-[14px] opacity-70 group-hover:opacity-100"></i>
                </div>
                <div class="flex flex-col min-w-0 ${textAlignClass}">
                    <span class="db-text-body font-bold text-white text-xs ${hoverClass} font-mono transition leading-tight">${role}</span>
                </div>
            </div>
        </div>`;
    };

    if (siteContainer) siteContainer.innerHTML = siteRoles.map(r => genItem(r, 'text-blue-400', 'group-hover:text-blue-400', 'blue', false)).join('');
    if (officeContainer) officeContainer.innerHTML = officeRoles.map(r => genItem(r, 'text-green-400', 'group-hover:text-green-400', 'green', true)).join('');

    if (window.lucide) window.lucide.createIcons();
    window.startCollabAutoNav();
}

window.collabAutoNavInterval = null;
window.collabAutoNavStopped = false;

window.startCollabAutoNav = function () {
    if (window.collabAutoNavStopped) return;
    if (!window.collabAutoNavItems || !window.collabAutoNavItems.length) return;

    let currentIndex = 0;

    const triggerNext = () => {
        if (window.collabAutoNavStopped) {
            clearInterval(window.collabAutoNavInterval);
            window.hideCollabTooltip();
            window.clearCollabLine();
            return;
        }
        const data = window.collabAutoNavItems[currentIndex];
        const element = document.getElementById(data.id);
        if (element) {
            window.showCollabTooltip(data.role, data.inData, data.outData);
            window.drawCollabLine(element, data.colorKey);
        }
        currentIndex = (currentIndex + 1) % window.collabAutoNavItems.length;
    };

    setTimeout(triggerNext, 500);
    window.collabAutoNavInterval = setInterval(triggerNext, 3000);
};

window.stopCollabAutoNav = function () {
    if (!window.collabAutoNavStopped) {
        window.collabAutoNavStopped = true;
        if (window.collabAutoNavInterval) clearInterval(window.collabAutoNavInterval);
    }
};

// Lógica para el Popup interactivo central ("MODELADOR BIM") en sección Colaboración
window.showCollabTooltip = function (role, inData, outData) {
    const popup = document.getElementById('collab-central-popup');
    if (!popup) return;

    // Aplicar estilos Glassmorphism on-the-fly
    popup.style.cssText = "backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; background-color: rgba(15, 20, 26, 0.4) !important; border-radius: 0.5rem; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.05);";

    // Pintar contenido con líneas en lugar de cajas
    popup.innerHTML = `
        <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 mt-1 text-center border-b border-cyan-500/20 pb-1">${role}</h4>
        <div class="flex flex-col gap-1.5 w-full text-xs font-mono px-2">
            <div class="flex flex-col border-l-2 border-blue-500/40 pl-2">
                <span class="text-blue-400 font-bold tracking-widest uppercase text-[9px] mb-0.5 opacity-80">IN (RECIBO):</span>
                <span class="text-gray-300 leading-snug">${inData}</span>
            </div>
            <div class="flex flex-col border-l-2 border-green-500/40 pl-2 mt-1">
                <span class="text-green-400 font-bold tracking-widest uppercase text-[9px] mb-0.5 opacity-80">OUT (ENTREGO):</span>
                <span class="text-gray-300 leading-snug">${outData}</span>
            </div>
        </div>
    `;
};

window.hideCollabTooltip = function () {
    const popup = document.getElementById('collab-central-popup');
    if (!popup) return;

    // Limpiar estilos on-the-fly
    popup.style.cssText = "background-color: transparent; border: none; backdrop-filter: none;";

    // Restaurar contenido orgánico por defecto
    popup.innerHTML = `
        <div class="flex flex-col items-center justify-start h-full text-center text-gray-500 text-xs font-mono tracking-widest uppercase opacity-70 mt-2">
            <i data-lucide="mouse-pointer-click" class="w-4 h-4 mb-1.5 text-cyan-500/50"></i>
            Pasa el cursor sobre un rol para ver la información
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();
};

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
                let rawImages = entry.images || [];
                projectImages = rawImages.sort((a, b) => {
                    const filenameA = a.split('/').pop().toLowerCase();
                    const filenameB = b.split('/').pop().toLowerCase();

                    const isAInfo = filenameA.includes('infograf');
                    const isBInfo = filenameB.includes('infograf');

                    if (isAInfo && !isBInfo) return 1;
                    if (!isAInfo && isBInfo) return -1;

                    return filenameA.localeCompare(filenameB);
                });

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
            coverImage = `img / ${pid} ${getVal(d, 'nombre')}/1.jpg`;
            projectImages = [coverImage];
        }


        return {
            originalIndex: i,
            id: pid,
            nombre: getVal(d, 'nombre'),
            disciplina: getVal(d, 'disciplina modelada') || getVal(d, 'disciplinas'), // Alias needed for filters
            disciplinas: getVal(d, 'disciplina modelada') || getVal(d, 'disciplinas'),
            tipologia: getVal(d, 'tipologia'),
            fase: getVal(d, 'fase'),
            entorno: getVal(d, 'entorno'),
            ubicacion: getVal(d, 'ubicacion'),
            anio: cleanYear, // Integer year for sorting/filtering
            anioStr: getVal(d, 'año'),
            descripcion: getVal(d, 'descripción'),
            area: d.area_ctx || '',
            niveles: d.niveles_ctx || '',
            costo: d.costo_ctx || '',
            retoRaw: getVal(d, 'nuevo reto') || getVal(d, 'nuevo_reto') || getVal(d, 'reto') || '', // Grab "nuevo reto" first
            get reto() {
                // Formateo automático de las secciones Planeacion, Ejecucion, Cierre
                if (!this.retoRaw) return '';
                let formatted = this.retoRaw;
                // Reemplazos Regex para hacer negritas las palabras clave y forzar saltos doble de linea
                formatted = formatted.replace(/(?:^|\s)(Planeacion:|Planeación:)(?=\s)/gi, '<br><strong class="text-cyan-400">$1</strong>');
                formatted = formatted.replace(/(?:^|\s)(Ejecucion:|Ejecución:)(?=\s)/gi, '<br><br><strong class="text-cyan-400">$1</strong>');
                formatted = formatted.replace(/(?:^|\s)(Cierre:)(?=\s)/gi, '<br><br><strong class="text-cyan-400">$1</strong>');

                // Limpiar br extra al inicio si existiera
                return formatted.replace(/^(<br>)+/, '').trim();
            },
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
                    renderGlobalPhases(projectsData, true);
                    renderGlobalEnvironment(projectsData, true);
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
            renderGlobalPhases(projectsData, true);
            renderGlobalEnvironment(projectsData, true);
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
    const fEntorno = document.getElementById('filter-entorno')?.value || 'all';
    const fPhase = document.getElementById('filter-phase')?.value || 'all';
    const fIA = document.getElementById('filter-ia')?.value || 'all';
    const fVideo = document.getElementById('filter-video')?.value || 'all';

    let activeFilters = [];
    if (fLoc !== 'all') activeFilters.push(`UBIC:${fLoc.substring(0, 10).toUpperCase()}`);
    if (fType !== 'all') activeFilters.push(`TIPO:${fType.substring(0, 10).toUpperCase()}`);
    if (fYear !== 'all') activeFilters.push(`AÑO:${fYear}`);
    if (fDisc !== 'all') activeFilters.push(`DISC:${fDisc.substring(0, 10).toUpperCase()}`);
    if (fEntorno !== 'all') activeFilters.push(`ENTORNO:${fEntorno.substring(0, 10).toUpperCase()}`);
    if (fPhase !== 'all') activeFilters.push(`FASE:${fPhase.substring(0, 10).toUpperCase()}`);
    if (fIA !== 'all') activeFilters.push(`IA:${fIA.toUpperCase()}`);
    if (fVideo !== 'all') activeFilters.push(`VIDEO:${fVideo.toUpperCase()}`);

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

    // Actualizar estilo del botón de filtro
    const btnFilter = document.getElementById('btn-filter-toggle');
    const fLoc = document.getElementById('filter-loc')?.value || 'all';
    const fType = document.getElementById('filter-type')?.value || 'all';
    const fYear = document.getElementById('filter-year')?.value || 'all';
    const fDisc = document.getElementById('filter-disc')?.value || 'all';
    const fEntorno = document.getElementById('filter-entorno')?.value || 'all';
    const fPhase = document.getElementById('filter-phase')?.value || 'all';
    const fIA = document.getElementById('filter-ia')?.value || 'all';
    const fVideo = document.getElementById('filter-video')?.value || 'all';

    if (btnFilter) {
        if (fLoc !== 'all' || fType !== 'all' || fYear !== 'all' || fDisc !== 'all' || fEntorno !== 'all' || fPhase !== 'all' || fIA !== 'all' || fVideo !== 'all') {
            btnFilter.classList.remove('border-gray-700', 'text-gray-400', 'bg-transparent');
            btnFilter.classList.add('border-cyan-500', 'text-cyan-400', 'bg-cyan-900/10');
        } else {
            btnFilter.classList.remove('border-cyan-500', 'text-cyan-400', 'bg-cyan-900/10');
            btnFilter.classList.add('border-gray-700', 'text-gray-400', 'bg-transparent');
        }
    }
};

window.runFilter = function () {
    const s = document.getElementById('search-bar').value.toLowerCase().trim();
    const fLoc = document.getElementById('filter-loc')?.value || 'all';
    const fType = document.getElementById('filter-type')?.value || 'all';
    const fYear = document.getElementById('filter-year')?.value || 'all';
    const fDisc = document.getElementById('filter-disc')?.value || 'all';
    const fEntorno = document.getElementById('filter-entorno')?.value || 'all';
    const fPhase = document.getElementById('filter-phase')?.value || 'all';
    const fIA = document.getElementById('filter-ia')?.value || 'all';
    const fVideo = document.getElementById('filter-video')?.value || 'all';

    const aiKeywords = ['gemini', 'notebook', 'chat gpt', 'chatgpt', 'copilot', 'rendair', 'dalux', 'midjourney', 'stable diffusion', 'claude', 'krea', 'dall-e', 'dalle', 'llama'];
    const isSearchIA = ['ia', 'ai', 'inteligencia artificial'].includes(s);

    filteredProjects = projectsData.filter(p => {
        const pText = [
            (p.nombre || ''),
            (p.id || ''),
            (p.ubicacion || ''),
            (p.software || ''),
            (p.tipologia || ''),
            (p.reto || ''),
            (p.disciplinas || '')
        ].join(' ').toLowerCase();

        const usesAI = aiKeywords.some(kw => pText.includes(kw));

        // MATCH DE BÚSQUEDA DE TEXTO
        let matchesText = false;
        if (s === '') {
            matchesText = true;
        } else if (isSearchIA) {
            matchesText = usesAI || pText.includes(s);
        } else {
            matchesText = pText.includes(s);
        }

        let matchesTop5 = true;
        if (isTop5Active) {
            const pName = (p.nombre || '').toLowerCase();
            const pLoc = (p.ubicacion || '').toLowerCase();
            matchesTop5 = TOP_PROJECTS_LIST.some(item =>
                pName.includes(item.name.toLowerCase()) && pLoc.includes(item.loc.toLowerCase())
            );
        }

        const mLoc = (fLoc === 'all' || p.ubicacion === fLoc);
        const mType = (fType === 'all' || p.tipologia === fType);
        const mYear = (fYear === 'all' || p.anio == fYear);
        const mDisc = (fDisc === 'all' || p.disciplina === fDisc);
        const mEntorno = (fEntorno === 'all' || p.entorno === fEntorno);
        const mPhase = (fPhase === 'all' || p.fase === fPhase);

        // MATCH DE DROPDOWN DE IA
        let mIA = true;
        if (fIA === 'si') mIA = usesAI;
        if (fIA === 'no') mIA = !usesAI;

        // MATCH DE DROPDOWN DE VIDEO
        let imgList = [];
        if (Array.isArray(p.imagenes)) {
            imgList = p.imagenes;
        } else if (typeof p.imagenes === 'string') {
            imgList = p.imagenes.split(',').map(s => s.trim()).filter(Boolean);
        }

        const usesVideo = imgList.some(img => {
            const lower = img.toLowerCase();
            return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov') || lower.includes('.avi');
        });

        let mVideo = true;
        if (fVideo === 'si') mVideo = usesVideo;
        if (fVideo === 'no') mVideo = !usesVideo;

        return matchesText && matchesTop5 && mLoc && mType && mYear && mDisc && mEntorno && mPhase && mIA && mVideo;
    });
    runSort();
    updateSystemStatus();
};

window.toggleClearSearch = function () {
    const searchInput = document.getElementById('search-bar');
    const clearBtn = document.getElementById('clear-search-btn');
    if (!searchInput || !clearBtn) return;

    if (searchInput.value.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
};

window.clearSearch = function () {
    const searchInput = document.getElementById('search-bar');
    if (searchInput) {
        searchInput.value = '';
        window.toggleClearSearch();
        window.runFilter();
    }
};

function populateAllFilters() {
    const getOptions = (key) => [...new Set(projectsData.map(p => p[key]))].filter(Boolean).sort();
    const setOptions = (id, label, opts) => { const el = document.getElementById(id); if (el) el.innerHTML = `<option value="all">${label}</option>` + opts.map(x => `<option value="${x}">${x.length > 35 ? x.substring(0, 35) + '...' : x}</option>`).join(''); };

    setOptions('filter-loc', 'UBICACIÓN: TODAS', getOptions('ubicacion'));
    setOptions('filter-type', 'TIPO: TODOS', getOptions('tipologia'));
    setOptions('filter-year', 'AÑO: TODOS', getOptions('anio').sort((a, b) => b - a));
    setOptions('filter-disc', 'DISCIPLINA: TODAS', getOptions('disciplina'));
    setOptions('filter-entorno', 'ENTORNO: TODOS', getOptions('entorno'));
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
            case 'entorno':
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
    if (sortValue.includes('entorno')) return 'entorno';
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
            <div class="tech-list-row grid grid-cols-[40px_10%_15%_12%_8%_4%_8%_8%_6%_6%_1fr] gap-4 border-b border-gray-800 p-3 text-white hover:bg-white/5 cursor-pointer items-start text-xs font-mono" onclick="if(!event.target.closest('button')) openGallery('${p.id}')">
                <div class="text-cyan-500 font-bold flex items-center gap-1">
                    ${p.id}
                </div>
                <div class="font-bold whitespace-normal break-words leading-tight relative flex items-center">
                    ${isTopProject ? '<span class="flex h-2 w-2 relative mr-2 shrink-0"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span></span>' : ''}
                    <span>${p.nombre}</span>
                </div>
                <div class="text-gray-400 leading-tight">
                    ${p.descripcion}
                    ${(p.area && p.area !== '0' || p.niveles && p.niveles !== '0' || p.costo && p.costo !== '0') ? `
                    <ul class="list-disc pl-4 mt-2 opacity-80 text-[10px]">
                        ${p.area && p.area !== '0' ? `<li><strong class="text-gray-300">Área:</strong> ${p.area}</li>` : ''}
                        ${p.niveles && p.niveles !== '0' ? `<li><strong class="text-gray-300">Niveles:</strong> ${p.niveles}</li>` : ''}
                        ${p.costo && p.costo !== '0' ? `<li><strong class="text-gray-300">Costo:</strong> ${p.costo}</li>` : ''}
                    </ul>` : ''}
                </div>
                ${retoHtml}
                <div class="text-gray-300 leading-tight">${p.ubicacion}</div>
                <div class="text-gray-500">${p.anioStr}</div>
                <div class="text-gray-400 leading-tight">${p.disciplinas}</div>
                <div class="text-gray-400 leading-tight">${p.tipologia}</div>
                <div class="text-gray-400 leading-tight">${p.entorno}</div>
                <div class="text-gray-400 leading-tight">${p.fase}</div>
                <div class="text-cyan-400/70 text-[10px] leading-tight break-words">${p.software}</div>
            </div>`;
        }).join('');
    }

    const galleryContainer = document.getElementById('gallery-grid-container');
    if (galleryContainer) {
        galleryContainer.innerHTML = list.map(p => {
            // Determinar si es un proyecto TOP
            const pName = p.nombre.toLowerCase();
            const pLoc = p.ubicacion.toLowerCase();
            const isTopProject = TOP_PROJECTS_LIST.some(item =>
                pName.includes(item.name.toLowerCase()) && pLoc.includes(item.loc.toLowerCase())
            );
            const showDot = isTopProject;

            let imgList = [];
            if (Array.isArray(p.imagenes)) {
                imgList = p.imagenes;
            } else if (typeof p.imagenes === 'string') {
                // Si es un string separado por comas, dividirlo y limpiar
                imgList = p.imagenes.split(',').map(s => s.trim()).filter(Boolean);
                p.imagenes = imgList; // Guardamos el array para no volverlo a procesar
            }

            // Contabilizar fotos y videos por separado
            const numVideos = imgList.filter(img => {
                const lower = img.toLowerCase();
                return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov') || lower.includes('.avi');
            }).length;

            const numFotos = imgList.length - numVideos;

            let textParts = [];
            if (numFotos > 0) textParts.push(`${numFotos} FOTO${numFotos !== 1 ? 'S' : ''}`);
            if (numVideos > 0) textParts.push(`${numVideos} VIDEO${numVideos !== 1 ? 'S' : ''}`);
            const mediaTag = textParts.join(' | ') || '0 FOTOS';

            // Mapeo especial portadas de galería indicadas por usuario (1-indexed convertido a 0-indexed)
            const customThumbnails = {
                'P35': 7, 'P34': 6, 'P33': 4, 'P32': 5, 'P30': 5,
                'P26': 2, 'P22': 3, 'P21': 10, 'P20': 4, 'P17': 2,
                'P16': 10, 'P15': 4, 'P14': 5, 'P13': 4, 'P11': 5, 'P10': 1,
                'P07': 1, 'P03': 2, 'P02': 3
            };

            let displayImage = p.imagen; // Por defecto la imagen calculada al inicio

            if (imgList.length > 0) {
                const targetIdx = customThumbnails[p.id];
                if (targetIdx !== undefined && imgList[targetIdx]) {
                    // Si el proyecto tiene una foto definida y existe en su array, sobreescribir miniatura
                    displayImage = imgList[targetIdx];
                } else if (displayImage === undefined || displayImage.includes('undefined')) {
                    // Fallback si la principal es undefined pero tiene fotos
                    displayImage = imgList[0];
                }
            }

            return `
            <div class="group relative aspect-[4/3] bg-transparent rounded-lg overflow-hidden cursor-pointer border border-gray-800 hover:border-cyan-500 transition" onclick="openGallery('${p.id}')">
                ${displayImage && !displayImage.includes('undefined') ? `<div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('${displayImage}');"></div>` : `<div class="absolute inset-0 flex items-center justify-center bg-transparent text-gray-500 text-3xl font-bold tracking-widest opacity-30 select-none">CONFIDENCIAL</div>`}
                <div class="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent font-mono text-white flex flex-col justify-end">
                    <div class="text-[10px] opacity-80">${p.id}</div>
                    <div class="text-xs leading-tight truncate my-0.5 flex items-center gap-1.5">
                        ${showDot ? '<span class="flex h-2 w-2 relative shrink-0"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span></span>' : ''}
                        <span class="truncate">${p.nombre}</span>
                    </div>
                    <div class="text-[10px] opacity-70 truncate">${p.tipologia}</div>
                    <div class="absolute top-2 right-2 bg-black/50 px-1.5 py-0.5 rounded text-[9px] backdrop-blur-sm opacity-0 group-hover:opacity-100 transition whitespace-nowrap">${mediaTag}</div>
                </div>
            </div>
            `;
        }).join('');
    }
}

// MODALES
window.openRetoModal = function (id, event) {
    if (event) event.stopPropagation();
    const project = filteredProjects.find(p => p.id === id);
    if (project) {
        document.getElementById('text-modal-title').innerText = `RETO: ${project.nombre}`;
        document.getElementById('text-modal-content').innerHTML = project.reto || "Sin descripción."; // MODIFICADO PARA SOPORTAR HTML
        document.getElementById('text-modal').classList.remove('hidden');
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
                                border border-gray-600/30
                                [.light-theme_&]:border-slate-300/40 [.light-theme_&]:shadow-[0_10px_40px_rgba(0,0,0,0.2)]
                                text-gray-300 [.light-theme_&]:text-slate-800 transition-opacity duration-200 pointer-events-none`;
    // Force bigger width but NO min-height to fit content exactly
    globalTooltipEl.style.cssText += "backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; background-color: rgba(0, 0, 0, 0.3) !important;";
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

let currentGalleryView = 'default';

window.setGalleryViewMode = function (mode) {
    currentGalleryView = mode;

    // Actualizar estados visuales de los botones
    const btns = ['default', 'list', 'grid'];
    btns.forEach(b => {
        const el = document.getElementById(`btn-gallery-view-${b}`);
        if (el) {
            if (b === mode) {
                el.classList.remove('text-gray-400');
                el.classList.add('text-cyan-400');
            } else {
                el.classList.remove('text-cyan-400');
                el.classList.add('text-gray-400');
            }
        }
    });

    // Ocultar todas las vistas
    document.getElementById('modal-view-default')?.classList.add('hidden');
    document.getElementById('modal-view-list')?.classList.add('hidden');
    document.getElementById('modal-view-grid')?.classList.add('hidden');

    // Mostrar la vista seleccionada
    document.getElementById(`modal-view-${mode}`)?.classList.remove('hidden');

    updateModalContent();
};

window.openGallery = function (id) {
    const idx = filteredProjects.findIndex(p => p.id === id);
    if (idx === -1) return;
    currentProjectIndex = idx;

    // Al abrir proyecto, empezamos en la primera imagen (alfabético)
    currentImageIndex = 0;

    // Inicializar la vista forzada a default al abrir uno nuevo
    setGalleryViewMode('default');

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
    document.getElementById('modal-project-details').innerText = `${p.ubicacion} | ${p.anioStr} | ${p.tipologia} | ${p.entorno} | ${p.fase}`;

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
    document.getElementById('modal-project-details').innerText = `${p.ubicacion} | ${p.anioStr} | ${p.tipologia} | ${p.entorno} | ${p.fase}`;

    // Descripcion y Reto en Galería
    const descEl = document.getElementById('modal-project-desc');
    const retoEl = document.getElementById('modal-project-reto');
    const textBlock = document.getElementById('modal-text-block');

    if (descEl && retoEl && textBlock) {
        let hasText = false;

        if (p.descripcion && p.descripcion.trim() !== '') {
            descEl.innerText = p.descripcion;
            descEl.classList.remove('hidden');
            hasText = true;
        } else {
            descEl.classList.add('hidden');
        }

        let extraInfo = [];
        if (p.area && p.area !== '0') extraInfo.push(`Área: ${p.area}`);
        if (p.niveles && p.niveles !== '0') extraInfo.push(`Niveles: ${p.niveles}`);
        if (p.costo && p.costo !== '0') extraInfo.push(`Costo: ${p.costo}`);

        let retoBase = (p.reto && p.reto.trim() !== '') ? p.reto : '';
        let extraHtml = extraInfo.length > 0 ? `<span class="text-cyan-400 ml-1 opacity-90">| ${extraInfo.join(' | ')}</span>` : '';

        if (retoBase !== '' || extraHtml !== '') {
            retoEl.querySelector('.content').innerHTML = `${retoBase} ${extraHtml}`;
            retoEl.classList.remove('hidden');
            hasText = true;
        } else {
            retoEl.classList.add('hidden');
        }

        // Mostrar solo si hay algo que leer Y estamos en la primera imagen
        const shouldShow = hasText && currentImageIndex === 0;
        textBlock.classList.toggle('opacity-0', !shouldShow);
        textBlock.classList.toggle('pointer-events-none', !shouldShow);
    }

    const detailsContainer = document.getElementById('modal-project-details');
    // Usar innerHTML para poder inyectar el span con color
    // Compactar ubicación si es muy larga (específicamente P07 y P08)
    let locationDisplay = p.ubicacion;
    if (p.id === 'P07' || p.id === 'P08' || locationDisplay.length > 50) {
        locationDisplay = "Múltiples Sedes";
    }

    // Cambio a CYAN brillante sin negrita (eliminado font-bold)
    // Mostrar nombre del espacio SOLAMENTE en la vista Default
    let spaceNameHtml = (spaceName && currentGalleryView === 'default') ? `<span class="text-[#00e5ff] ml-2">| ${spaceName}</span>` : "";
    detailsContainer.innerHTML = `${locationDisplay} | ${p.anioStr} | ${p.tipologia} | ${p.entorno} | ${p.fase} ${spaceNameHtml}`;

    // Determinar tipo de archivo (Soportando mayúsculas también)
    const srcLower = (currentSrc || "").toLowerCase();
    const isVideo = srcLower.endsWith('.mp4') || srcLower.endsWith('.mov') || srcLower.endsWith('.webm') || srcLower.endsWith('.mkv');

    // Resetear estados visuales
    imgEl.style.opacity = '0';
    videoEl.style.opacity = '0';

    // Detener video previo independientemente de la vista
    videoEl.pause();
    videoEl.src = "";

    if (currentGalleryView === 'list') {
        renderGalleryListView(p);
        textBlock.classList.add('hidden');
    } else if (currentGalleryView === 'grid') {
        renderGalleryGridView(p);
        textBlock.classList.add('hidden');
    } else {
        // MODO DEFAULT (CARRUSEL)
        textBlock.classList.remove('hidden');
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
}

function renderGalleryListView(p) {
    const container = document.getElementById('modal-list-container');
    if (!container) return;
    if (!p.imagenes || p.imagenes.length === 0) {
        container.innerHTML = `<div class="text-gray-500 text-center py-4 text-xs font-mono">NO HAY RECURSOS DISPONIBLES</div>`;
        return;
    }

    const totalVideos = p.imagenes.filter(src => src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm')).length;
    const totalImages = p.imagenes.length - totalVideos;
    const counterHtml = `<div class="w-full text-center text-cyan-400 font-mono text-[10px] md:text-xs uppercase tracking-widest bg-slate-800 py-2 border-b border-cyan-900 shrink-0 z-10">${totalImages} IMÁGENES | ${totalVideos} VIDEOS</div>`;

    container.innerHTML = counterHtml + `<div class="overflow-y-auto h-full p-2 custom-scrollbar flex-1 w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 w-full pb-2">` +
        p.imagenes.map((src, idx) => {
            const filename = src.split('/').pop() || 'Recurso';
            const isVideo = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');
            const icon = isVideo ? 'video' : 'image';
            const iconColor = isVideo ? 'text-purple-400 group-hover:text-purple-300' : 'text-cyan-400 group-hover:text-cyan-300';

            return `
            <div class="flex items-center justify-between py-1.5 px-3 hover:bg-white/5 border border-transparent hover:border-gray-700 rounded cursor-pointer transition group" onclick="jumpToGalleryImage(${idx})">
                <div class="flex items-center gap-3 overflow-hidden w-full">
                    <div class="w-6 h-6 shrink-0 bg-gray-900 border border-gray-800 rounded flex items-center justify-center ${iconColor} border-cyan-900/50 transition">
                        <i data-lucide="${icon}" class="w-3 h-3"></i>
                    </div>
                    <span class="text-gray-300 font-mono text-[11px] truncate group-hover:text-white transition flex-1">${filename}</span>
                </div>
            </div>
        `;
        }).join('') + `</div></div>`;

    if (window.lucide) window.lucide.createIcons();
}

function renderGalleryGridView(p) {
    const container = document.getElementById('modal-grid-container');
    if (!container) return;
    if (!p.imagenes || p.imagenes.length === 0) {
        container.innerHTML = `<div class="text-gray-500 col-span-full text-center py-4 text-xs font-mono">NO HAY RECURSOS DISPONIBLES</div>`;
        return;
    }

    const totalVideos = p.imagenes.filter(src => src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm')).length;
    const totalImages = p.imagenes.length - totalVideos;
    const counterHtml = `<div class="col-span-full w-full text-center text-cyan-400 font-mono text-[10px] md:text-xs uppercase tracking-widest bg-[#0f141a]/95 backdrop-blur-sm py-2 px-4 border-b border-gray-800/80 shadow-xl mb-2 sticky top-0 z-20 rounded-lg">${totalImages} IMÁGENES | ${totalVideos} VIDEOS</div>`;

    // Ajustamos la cuadrícula expandida
    container.innerHTML = `<div class="w-full h-full overflow-y-auto custom-scrollbar pr-4 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-max content-start relative">` +
        counterHtml +
        p.imagenes.map((src, idx) => {
            const isVideo = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');
            const filename = src.split('/').pop() || '';
            const spaceName = filename.split('.')[0] || '';

            if (isVideo) {
                return `
                <div class="group relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500 cursor-pointer transition hover:scale-105" onclick="jumpToGalleryImage(${idx})">
                    <video src="${src}#t=0.1" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" preload="metadata"></video>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div class="w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white/80 group-hover:text-cyan-400 group-hover:scale-110 transition shadow-lg">
                            <i data-lucide="play" class="w-5 h-5 ml-0.5"></i>
                        </div>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-3 pt-6 bg-gradient-to-t from-black/90 to-transparent flex items-end pointer-events-none opacity-80 group-hover:opacity-100 transition">
                        <span class="text-white font-mono text-[9px] md:text-xs truncate drop-shadow-md">${spaceName}</span>
                    </div>
                </div>
            `;
            } else {
                return `
                <div class="group relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500 cursor-pointer transition hover:scale-105" onclick="jumpToGalleryImage(${idx})">
                    <div class="w-full h-full bg-cover bg-center opacity-80 group-hover:opacity-100 transition" style="background-image: url('${src}')"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-3 pt-6 bg-gradient-to-t from-black/90 to-transparent flex items-end pointer-events-none opacity-80 group-hover:opacity-100 transition">
                        <span class="text-white font-mono text-[9px] md:text-xs truncate drop-shadow-md">${spaceName}</span>
                    </div>
                </div>
            `;
            }
        }).join('') + `</div>`;

    if (window.lucide) window.lucide.createIcons();
}

window.jumpToGalleryImage = function (idx) {
    currentImageIndex = idx;
    setGalleryViewMode('default'); // Regresar a la visualización individual y enfocar recurso.
};


// ... Rest of the file unchanged (renderAI, etc)

function renderAI() {
    const container = document.getElementById('ai-universe');
    const particlesContainer = document.getElementById('ai-particles');

    if (!container || !particlesContainer) return;

    container.innerHTML = '';
    particlesContainer.innerHTML = ''; // Limpiar partículas previas

    if (!aiData || aiData.length === 0) return;

    // --- INYECTAR SISTEMA DE PARTÍCULAS ASCENDENTES ---
    const particleCount = 40; // Cantidad de "estrellas" / polvo morado
    for (let p = 0; p < particleCount; p++) {
        const particle = document.createElement('div');
        // Estilo base: punto morado ínfimo
        particle.className = `absolute rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)] opacity-0 pointer-events-none`;

        // Posiciones y tamaños aleatorios
        const size = Math.random() * 3 + 1; // 1px a 4px max
        const left = Math.random() * 100; // 0% a 100% del viewport width

        // Animaciones aleatorias (Tailwind/Inline)
        const duration = Math.random() * 10 + 5; // 5s a 15s de subida
        const delay = Math.random() * 5; // Retrasos asíncronos

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.bottom = `-10px`; // Empezar justo bajo el suelo

        // Animación inyectada directo
        particle.style.animation = `riseUp ${duration}s linear ${delay}s infinite`;

        particlesContainer.appendChild(particle);
    }

    aiData.forEach((item, i) => {
        // ... (existing loop code placeholder)
    });

    // (Sección removida: Inject Massive Neon Halo Background)

    aiData.forEach((item, i) => {
        const orb = document.createElement('div');
        orb.className = `ai-orb group float-anim-${(i % 3) + 1}`;
        const size = Math.random() * 30 + 110; // 110px a 140px

        // Estrategia Sencilla de 4 Cuadrantes para mitigar overlapping
        let left, top;
        switch (i % 4) {
            case 0: left = Math.random() * 30 + 10; top = Math.random() * 30 + 10; break;     // Zona Superior Izquierda
            case 1: left = Math.random() * 30 + 50; top = Math.random() * 30 + 10; break;     // Zona Superior Derecha
            case 2: left = Math.random() * 30 + 10; top = Math.random() * 30 + 50; break;     // Zona Inferior Izquierda
            case 3: left = Math.random() * 30 + 50; top = Math.random() * 30 + 50; break;     // Zona Inferior Derecha
        }

        // Data from CSV
        const title = getVal(item, 'titulo', 'title');
        const desc = getVal(item, 'descripcion', 'desc', 'description');
        const iconName = resolveIcon(item, 'sparkles');

        orb.style.left = `${left}%`;
        orb.style.top = `${top}%`;
        orb.style.width = `${size}px`;
        orb.style.height = `${size}px`;

        // Generamos la estructura DOM combinada: Anillo UI Inactivo y Tarjeta de Contenido Expandida
        orb.innerHTML = `
            <!-- UI del Anillo Hueco (Visible por Defecto, Invisible al Expandir) -->
            <div class="ring-ui absolute inset-0 rounded-full border-[2px] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5),inset_0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 pointer-events-none group-hover:border-purple-400 group-hover:shadow-[0_0_25px_rgba(192,132,252,0.8),inset_0_0_25px_rgba(192,132,252,0.8)] scale-100 group-hover:scale-105 bg-transparent backdrop-blur-none"></div>
            
            <!-- Zona de Clic Global para modo Anillo -->
            <div class="click-zone ring-ui absolute inset-0 z-20 w-full h-full rounded-full cursor-pointer pointer-events-auto" title="${title}"></div>

            <!-- Contenido de Texto Oculto (Visible solo al Expandir) -->
            <div class="orb-expanded-content text-left w-full h-full absolute inset-0 z-30 p-5 md:p-6 flex-col justify-start overflow-hidden">
                <div class="flex justify-between items-start mb-3 border-b border-purple-500/30 pb-3 w-full shrink-0">
                    <h3 class="text-purple-300 font-normal text-sm md:text-base pr-4 leading-tight">${title}</h3>
                    <button class="close-orb-btn text-gray-400 hover:text-white transition shrink-0 p-1 pointer-events-auto">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="overflow-y-auto custom-scroll flex-1 pr-3 w-full text-gray-300 pointer-events-auto text-xs md:text-sm leading-relaxed whitespace-pre-wrap pb-4">
                    ${desc || "Sin descripción detallada por el momento."}
                </div>
            </div>
        `;

        // Bind click handler strictly on the new element in DOM
        setTimeout(() => {
            const clickZone = orb.querySelector('.click-zone');
            const closeBtn = orb.querySelector('.close-orb-btn');

            // Abrir Carta Expansible
            clickZone.addEventListener('click', (e) => {
                console.log("Expanding Orb:", title);
                e.stopPropagation();
                e.preventDefault();

                // 1. Colapsar cuaquier otra carta abierta en el universo de la IA
                document.querySelectorAll('.ai-orb.expanded-orb').forEach(otherOrb => {
                    if (otherOrb !== orb) {
                        otherOrb.classList.remove('expanded-orb');
                    }
                });

                // 2. Expandir el anillo actual
                orb.classList.add('expanded-orb');
            });

            // Cerrar Carta Expansible (Boton X)
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                orb.classList.remove('expanded-orb');
            });

        }, 0);

        container.appendChild(orb);
    });

    // --- CERRAR CARTAS AL HACER CLIC FUERA DE ELLAS ---
    // Atamos el evento al contenedor principal del universo IA
    const aiView = document.getElementById('view-ai');
    if (aiView) {
        // Remover listener anterior si existe (evitar acumulacion en re-renders)
        aiView.removeEventListener('click', window._closeExpandedOrbsOutside);

        window._closeExpandedOrbsOutside = (e) => {
            // Si el clic no fue DENTRO de un .ai-orb
            if (!e.target.closest('.ai-orb')) {
                document.querySelectorAll('.ai-orb.expanded-orb').forEach(openedOrb => {
                    openedOrb.classList.remove('expanded-orb');
                });
            }
        };

        aiView.addEventListener('click', window._closeExpandedOrbsOutside);
    }

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

window.toggleTheme = window.toggleTheme;
window.toggleTop5 = window.toggleTop5;
window.resetFilters = window.resetFilters;
window.handleFilterChange = window.handleFilterChange;
window.setProjectView = window.setProjectView;
window.openGallery = window.openGallery;
window.closeGallery = window.closeGallery;
window.navigateGallery = window.navigateGallery;
window.handleGalleryTouchStart = window.handleGalleryTouchStart;
window.handleGalleryTouchMove = window.handleGalleryTouchMove;
window.handleGalleryTouchEnd = window.handleGalleryTouchEnd;
window.dismissTopWarning = window.dismissTopWarning;

// ==========================================================================
// ANIMACIÓN DEL PLACEHOLDER DE BÚSQUEDA
// ==========================================================================
function initSearchPlaceholderAnimation() {
    const searchInput = document.getElementById('search-bar');
    if (!searchInput) return;

    const suggestions = [
        "Buscar 'Revit'...",
        "Buscar 'Hospitales'...",
        "Buscar 'Navisworks'...",
        "Buscar 'Coordinación BIM'...",
        "Buscar 'México'...",
        "Buscar 'Dynamo'...",
        "Buscar 'Rascacielos'..."
    ];

    let currentSuggestionIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeLine() {
        if (document.activeElement === searchInput || searchInput.value.length > 0) {
            // Si el usuario está enfocando o escribió algo, pausar y mostrar texto por defecto
            searchInput.setAttribute('placeholder', 'Buscar...');
            setTimeout(typeLine, 1000); // Check again in 1s
            return;
        }

        const currentText = suggestions[currentSuggestionIndex];

        if (isDeleting) {
            searchInput.setAttribute('placeholder', currentText.substring(0, currentCharIndex - 1));
            currentCharIndex--;
            typingSpeed = 50; // Borrar más rápido
        } else {
            searchInput.setAttribute('placeholder', currentText.substring(0, currentCharIndex + 1));
            currentCharIndex++;
            typingSpeed = 100; // Escribir normal
        }

        if (!isDeleting && currentCharIndex === currentText.length) {
            // Terminó de escribir, esperar
            isDeleting = true;
            typingSpeed = 2000; // Pausa al final de la palabra
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            // Pasar a la siguiente sugerencia
            currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
            typingSpeed = 500; // Pausa antes de la siguiente palabra
        }

        setTimeout(typeLine, typingSpeed);
    }

    // Iniciar el loop
    setTimeout(typeLine, 1000);
}

// Inicializar la animación cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    initSearchPlaceholderAnimation();
});
