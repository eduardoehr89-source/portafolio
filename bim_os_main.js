// ==========================================================================
// 1. CONFIGURACIÃ“N DE ORIGEN DE DATOS
// ==========================================================================
// ==========================================================================

// Cache horaria para evitar descargas innecesarias (Cambia cada 60 min)
const cacheHour = Math.floor(Date.now() / (1000 * 60 * 60));
const timestamp = `v1-${cacheHour}`;

const URL_PROJECTS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Proyectos_portafolio.csv?t=${timestamp}`;
const URL_DISCIPLINES = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Disciplinas_portafolio.csv?t=${timestamp}`;
const URL_SOFTWARE = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Software_portafolio.csv?t=${timestamp}`;
const URL_NORMS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Normativas%20y%20Est%C3%A1ndares_portafolio.csv?t=${timestamp}`;
const URL_EDUCATION = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Master%20MBIA_portafolio.csv?t=${timestamp}`;
const URL_ROI = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/ROI_Scripts_portafolio.csv?t=${timestamp}`;
const URL_COLLAB = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Colaboraci%C3%B3n_portafolio.csv?t=${timestamp}`;
const URL_SECTIONS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Dashboard%20global_secciones_portafolio.csv?t=${timestamp}`;
const URL_AI_REV = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Inteligencia%20Artificial_portafolio.csv?t=${timestamp}`;
const URL_ACADEMIC_CV = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/CV/Formaci%C3%B3n%20acad%C3%A9mica_cv.csv?t=${timestamp}`;
const URL_TECH_VALUE = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Valor%20T%C3%A9cnico%20Aplicado_portafolio.csv?t=${timestamp}`;
const CLOUD_BADGE_BASE = 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/CV/insignias/';
const CLOUD_ASSET_BASE = 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/';
const URL_HOME = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Home_portafolio.csv?t=${timestamp}`;
const URL_SUMMARY_LOCAL = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/Resumen_portafolio.csv?t=${timestamp}`;

const TOP_PROJECTS_LIST = [
    { name: "Barrio Santa Lucía", loc: "Monterrey" },
    { name: "Tren Ligero", loc: "Campeche" },
    { name: "Puentes Periféricos", loc: "Edo. Méx" },
    { name: "Hospital General de Zona", loc: "Tula" },
    { name: "Unidad de Medicina Familiar", loc: "Tula" },
    { name: "Central de Mezclas", loc: "Torreón" }
];

// Detección Global de Parámetros de URL para evitar parpadeos en carga directa
const urlParamsGlobal = new URLSearchParams(window.location.search);
const viewParamGlobal = urlParamsGlobal.get('view');
const projectParamGlobal = urlParamsGlobal.get('project');
const themeParamGlobal = urlParamsGlobal.get('theme');

// Aplicar tema desde URL si existe
if (themeParamGlobal === 'light') {
    document.body.classList.add('light-theme');
    // Limpiar el parámetro de la URL para que F5 resetee a dark
    const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
}

// Variables Globales
let projectsData = [];
let filteredProjects = [];
let roiData = [];
let sectionsData = []; // Nueva variable para secciones
let currentViewMode = 'gallery';
let isTop5Active = !projectParamGlobal; // Si hay un proyecto, desactivamos TOP de inmediato
let currentProjectIndex = -1;
let disciplinesData = []; // Global variable for disciplines
let aiData = [];
let cvEducationData = [];
let globalTechValueData = [];
let homeData = [];
let summaryData = [];
let lastNavState = null; // Store last group/type for forward navigation

window.isTopBadgesOnly = true;
window.toggleTopBadges = function() {
    window.isTopBadgesOnly = !window.isTopBadgesOnly;
    
    // Actualizar estilo del botón
    const btn = document.getElementById('btn-top-badges');
    if (btn) {
        if (window.isTopBadgesOnly) {
            btn.classList.remove('border-gray-600', 'text-gray-400', 'hover:border-cyan-400', 'hover:text-white');
            btn.classList.add('border-cyan-400', 'text-cyan-400', 'bg-cyan-400/10');
        } else {
            btn.classList.remove('border-cyan-400', 'text-cyan-400', 'bg-cyan-400/10');
            btn.classList.add('border-gray-600', 'text-gray-400', 'hover:border-cyan-400', 'hover:text-white');
        }
    }
    
    // Forzar re-render de la sección Educación
    if (window.lastCvData && window.lastMbiaData) {
        renderEducationView(window.lastMbiaData, window.lastCvData);
    }
};

// Data para Sección Tech Value (Cargada desde CSV)
function renderTechValue() {
    const container = document.getElementById('global-tech-value-list');
    if (!container || !globalTechValueData || globalTechValueData.length === 0) return;

    container.innerHTML = globalTechValueData.map((item, i) => {
        const title = getVal(item, 'Title', 'title');
        const desc = getVal(item, 'Description', 'description', 'desc');
        const icon = getVal(item, 'Icon', 'icon');
        const kpi = getVal(item, 'KPI', 'kpi');

        return `
        <div class="relative transition group h-full flex flex-col items-center justify-center gap-1.5 animate-item cursor-help p-2 rounded-lg border border-transparent hover:border-cyan-500/10 hover:bg-cyan-500/5" style="animation-delay: ${i * 0.1}s"
             data-tooltip-title="${title}"
             data-tooltip-text="${desc || `Optimización de procesos mediante ${title.toLowerCase()} e integración tecnológica.`}"
             onmouseenter="window.showRoiTooltip(event)"
             onmouseleave="window.hideRoiTooltip()"
             onmousemove="window.moveRoiTooltip(event)">
            
            <!-- Icono Superior -->
            <div class="text-cyan-400 [.light-theme_&]:text-sky-700 transition shrink-0">
                <i data-lucide="${icon}" class="w-5 h-5"></i>
            </div>

            <!-- Textos Centrales -->
            <div class="flex flex-col items-center text-center w-full min-w-0">
                <h4 class="font-bold text-[9px] xl:text-[10px] text-gray-200 [.light-theme_&]:text-black uppercase tracking-wider transition leading-tight break-words min-h-[24px] flex items-center justify-center">${title}</h4>
                ${kpi ? `<div class="mt-1"><span class="px-1.5 py-0.5 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 [.light-theme_&]:bg-sky-500/10 [.light-theme_&]:text-sky-700 [.light-theme_&]:border-sky-300 text-[9px] xl:text-[10px] font-bold font-mono whitespace-nowrap">${kpi}</span></div>` : ''}
            </div>
        </div>`;
    }).join('');
    if (window.lucide) window.lucide.createIcons();
}

/**
 * Renderiza el modal de resumen dinámicamente desde CSV local
 */
function renderSummaryModal(data) {
    const containers = [
        document.getElementById('summary-cards-container'),
        document.getElementById('summary-cv-cards-container')
    ];

    containers.forEach(container => {
        if (!container) return;
        
        container.innerHTML = data.map((item, i) => {
            const title = getVal(item, 'Title', 'title');
            const value = getVal(item, 'Value', 'value');
            const desc = getVal(item, 'Description', 'description', 'desc');
            
            // Mapeo básico de iconos según título o índice
            let icon = "box";
            const cleanTitle = normalizeStr(title);
            if (cleanTitle.includes('desarrollo') || cleanTitle.includes('vibe')) icon = "zap";
            else if (cleanTitle.includes('experiencia')) icon = "history";
            else if (cleanTitle.includes('software')) icon = "code-2";
            else if (cleanTitle.includes('modelado')) icon = "layers";
            else if (cleanTitle.includes('estandar')) icon = "file-check";
            else if (cleanTitle.includes('gemini')) icon = "brain-circuit";
            else if (cleanTitle.includes('idioma')) icon = "languages";
            else if (cleanTitle.includes('roi') || cleanTitle.includes('ahorro')) icon = "trending-up";
            else if (cleanTitle.includes('formacion') || cleanTitle.includes('master')) icon = "graduation-cap";

            return `
                <div class="flex flex-col items-center text-center group transition-all duration-300 min-h-[170px] hover:scale-[1.02] cursor-default p-3 hover:bg-white/5 transition-all">
                    <div class="w-full h-[40px] mb-3 flex items-center justify-center flex-shrink-0">
                        <div class="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all duration-300 font-bold text-cyan-400">
                            <i data-lucide="${icon}" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="w-full h-[30px] mb-1 flex items-center justify-center flex-shrink-0">
                        <h4 class="text-[9px] font-bold text-gray-500 font-mono tracking-widest uppercase text-center m-0 p-0 leading-none">${title}</h4>
                    </div>
                    <div class="w-full h-[45px] mb-2 flex items-center justify-center flex-shrink-0">
                        <p class="text-white font-bold text-[15px] leading-tight uppercase text-center">${value}</p>
                    </div>
                    <p class="text-[9px] text-cyan-500/70 font-bold uppercase font-mono mt-auto pt-1">${desc}</p>
                </div>
            `;
        }).join('');
    });
    if (window.lucide) window.lucide.createIcons();
}

function renderHome() {
    if (!homeData || homeData.length === 0) return;

    const getHomeVal = (key) => {
        const item = homeData.find(d => normalizeStr(getVal(d, 'Key', 'key')) === normalizeStr(key));
        return item ? getVal(item, 'Value', 'value') : '';
    };

    const nombre = getHomeVal('Nombre');
    const puesto = getHomeVal('Puesto');
    const ubicacion = getHomeVal('Ubicación');
    const proyCount = getHomeVal('Proyectos');
    const expCount = getHomeVal('Experiencia');
    const ciudadesCount = getHomeVal('Ciudades');
    const slogan = getHomeVal('Slogan');

    // Actualizar Textos
    const homeSubtitle = document.getElementById('home-subtitle');
    const sidebarName = document.getElementById('sidebar-name');
    const homeSlogan = document.getElementById('home-slogan');

    if (homeSubtitle) {
        homeSubtitle.innerHTML = `
            <div class="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl mx-auto text-[0.6rem] md:text-xs text-gray-500 font-mono uppercase opacity-70 gap-2 md:gap-0">
                <div class="flex-1 text-center md:text-right tracking-[0.5em] pl-[0.5em] md:pr-4 whitespace-nowrap">${nombre} <span class="tracking-normal opacity-50 px-1 md:px-2">//</span></div>
                <div class="flex-none text-center tracking-[0.5em] pl-[0.5em] whitespace-nowrap">${puesto}</div>
                <div class="flex-1 text-center md:text-left tracking-[0.5em] pl-[0.5em] md:pl-4 whitespace-nowrap"><span class="tracking-normal opacity-50 px-1 md:px-2">//</span> ${ubicacion}</div>
            </div>
            <div class="text-cyan-400 text-[11px] tracking-[0.4em] opacity-90 text-center mt-[12px] pl-[0.4em] w-full content-center">CITIZEN DEVELOPER</div>
        `;
    }
    if (sidebarName) {
        const nameParts = nombre.split(' ');
        const first = nameParts[0] || 'SAID';
        const rest = nameParts.slice(1).join(' ') || 'HERRERA';
        sidebarName.innerHTML = `<span class="text-xl font-light">${first} <span class="sidebar-name-highlight">${rest}</span></span>`;
    }
    // Forzar el nuevo eslogan profesional (Corregido: MÉXICO)
    const finalSlogan = "MODELADOR BIM SENIOR & CITIZEN DEVELOPER // MÉXICO";
    if (homeSlogan) homeSlogan.textContent = finalSlogan;

    // Actualizar Contadores
    const statProjects = document.getElementById('stat-projects');
    const statExperience = document.getElementById('stat-experience');
    const statCities = document.getElementById('stat-cities');

    if (statProjects) statProjects.setAttribute('data-target', proyCount || '40');
    if (statExperience) statExperience.setAttribute('data-target', expCount || '10');
    if (statCities) statCities.setAttribute('data-target', ciudadesCount || '20');

    // Reiniciar animación de contadores si estamos en home
    if (typeof animateCounters === 'function') animateCounters();
}

// Flag for first-time Top Projects warning
let hasSeenTopWarning = false;

/**
 * Calcula estadísticas de liderazgo basadas en proyectos agrupados (Ãºnicos)
 */
function calculateLeadershipStats(allProjects) {
    if (!allProjects || allProjects.length === 0) return { total: 0, led: 0, percentage: 0 };

    const uniqueMap = new Map();
    allProjects.forEach(p => {
        let key = getVal(p, 'id');
        const name = normalizeStr(getVal(p, 'nombre'));
        if (name.includes("modulo covid")) key = "GROUP_COVID";
        else if (name.includes("central de mezclas")) key = "GROUP_MEZCLAS";

        const isLeader = normalizeStr(getVal(p, 'actividad principal', 'liderazgo')).includes('lider');

        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, isLeader);
        } else if (isLeader) {
            uniqueMap.set(key, true);
        }
    });

    const total = uniqueMap.size;
    let led = 0;
    uniqueMap.forEach(isL => { if (isL) led++; });

    return {
        total,
        led,
        percentage: Math.round((led / total) * 100)
    };
}

// ==========================================================================
// 2. MOTORES DE INTELIGENCIA DE DATOS
// ==========================================================================

const normalizeStr = (str) => {
    if (!str) return "";
    // Extreme normalization: remove accents, lowercase, and keep only a-z 0-9
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "") // Keep only alphanumeric
        .trim();
};

const getVal = (item, ...keys) => {
    if (!item || typeof item !== 'object') return "";
    const objectKeys = Object.keys(item);

    const foundKey = objectKeys.find(k => {
        if (!k || k.trim() === '') return false;
        const cleanKey = normalizeStr(k);
        return keys.some(searchKey => {
            const sKey = normalizeStr(searchKey);
            return cleanKey === sKey || cleanKey.includes(sKey);
        });
    });

    const value = foundKey ? item[foundKey] : "";
    return (value === undefined || value === null || value === "undefined") ? "" : String(value).trim();
};

const levelMapping = {
    'Experto': 95, 'Alto': 85, 'Avanzado': 80, 'Medio': 60, 'Bajo': 25, 'En proceso': 20, 'Básico': 15, 'Basico': 15
};

const getSoftwarePct = (sw) => {
    const raw = getVal(sw, '% Dominio', 'Porcentaje', 'dominio');
    const num = parseInt(raw.replace('%', ''));
    if (!isNaN(num) && num > 0) return num;
    // Fallback al texto del Nivel
    const textLevel = getVal(sw, 'Nivel');
    return levelMapping[textLevel] || 0;
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
// 3. INICIALIZACIÃ“N
// ==========================================================================

// Helper for Number Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.counter-anim');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target')) || 0;
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

    // Inicializar estado activo del sidebar
    if (window.updateSidebarActive) window.updateSidebarActive('nav-home');

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
        d3.csv(URL_ACADEMIC_CV),
        d3.csv(URL_TECH_VALUE),
        d3.csv(URL_HOME),
        d3.csv(URL_SUMMARY_LOCAL)
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
        cvEducationData = getData(9);
        globalTechValueData = getData(10);
        homeData = getData(11);
        summaryData = getData(12);

        console.log("Sistema BIM: Datos cargados.");

        if (projectsData.length > 0) {
            processProjects(projectsData);
            // Inyectar datos estadísticos en el Home Screen
            renderHome();
        }

        renderGlobalAnalytics(projectsData);
        renderGlobalPhases(projectsData);
        renderGlobalEnvironment(projectsData);
        renderGlobalDisciplines(projectsData, disciplinesData);
        renderSoftware(software);
        renderTechValue(); // Nueva renderizadora Tech Value
        renderNorms(norms);
        renderEducationView(education, cvEducationData);
        renderROI(roiData);
        renderCollab(collab);
        renderSummaryModal(summaryData);
        // renderAI() eliminado de aquí para evitar que el auto-nav inicie antes de tiempo

        setTimeout(() => {
            if (window.lucide) window.lucide.createIcons();
        }, 300);

        hideLoadingScreen();

        // Iniciar transición suave al cargar (fade-in)
        document.body.classList.add('page-fade-in');

        // Inicializar animación de placeholder y auto-navegación si venimos de otra página (ej. CV)
        initSearchPlaceholderAnimation();

        if (projectParamGlobal && window.updateTop5ButtonUI) {
            window.updateTop5ButtonUI();
        }

        if (viewParamGlobal && window.switchView) {
            window.switchView(viewParamGlobal, false, true);
        }

        // Auto-abrir proyecto si viene por parámetro (ej. desde Portafolio Resumido)
        if (projectParamGlobal && window.openGallery) {
            window.openGallery(projectParamGlobal);
        }

        // Limpiar la URL para que futuras recargas (F5) lleven al Home o mantengan estado limpio
        if (viewParamGlobal || projectParamGlobal) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // v50.55 - Resumen Dinámico + Edición en Bloc de Notas
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
        // Solo permitir navegación si es un criterio de agrupación
        const navKeywords = ['fase', 'tipologia', 'disciplinas', 'entorno', 'pais', 'ano', 'liderazgo'];
        const canNav = navKeywords.some(nk => normalizeStr(keyword).includes(normalizeStr(nk)));

        if (canNav) {
            headerEl.innerHTML = `
                <div class="flex items-center justify-between group cursor-pointer hover:bg-white/5 px-2 -mx-2 py-1 rounded-lg transition-all duration-300 w-full overflow-hidden mb-2" 
                     onclick="window.switchView('projects', false, false, true); window.setProjectView('groups', '${keyword}')"
                     title="Ver Proyectos por ${title}">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <i data-lucide="${iconRaw}" class="text-gray-400 group-hover:text-cyan-400 w-4 h-4 shrink-0 transition-colors"></i>
                        <span class="db-text-header font-bold truncate group-hover:text-white transition-colors" title="${title}">${title}</span>
                    </div>
                    <i data-lucide="chevron-right" class="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                </div>
            `;
        } else {
            // Encabezado estático para Software, Normativas, ROI, etc.
            headerEl.innerHTML = `
                <div class="flex items-center justify-between px-2 -mx-2 py-1 w-full overflow-hidden mb-2">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <i data-lucide="${iconRaw}" class="text-gray-400 w-4 h-4 shrink-0"></i>
                        <span class="db-text-header font-bold truncate" title="${title}">${title}</span>
                    </div>
                </div>
            `;
        }
        if (window.lucide) window.lucide.createIcons();
    }
}

function renderGlobalAnalytics(data, animateOnly = false) {
    const container = document.getElementById('global-analytics-chart');

    // Inyección Dinámica del Título (Busca "Tipología" en el CSV)
    if (!animateOnly) injectSectionHeader('global-analytics-chart', 'tipologia', 'TIPOLOGÃA DE PROYECTOS', 'activity', 0);

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

    // Sum the values of only the top 4
    const totalTop4 = chartData.reduce((sum, item) => sum + item.v, 0) || 1;

    container.innerHTML = chartData.map((d, i) => {
        const percentage = Math.round((d.v / totalTop4) * 100);

        let icon = "building";
        const lowerK = d.k.toLowerCase();
        if (lowerK.includes("mixto")) icon = "layers";
        else if (lowerK.includes("infra")) icon = "settings";
        else if (lowerK.includes("vivienda") || lowerK.includes("residencial")) icon = "home";
        else if (lowerK.includes("salud") || lowerK.includes("hospital")) icon = "cross";

        return `
        <div class="flex items-center gap-2 db-text-body mb-0.5 font-mono group animate-item" style="animation-delay: ${i * 0.1}s">
            <div class="flex items-start gap-1.5 w-32 shrink-0 pl-1 pt-0.5">
                <i data-lucide="${icon}" class="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition shrink-0 mt-0.5"></i>
                <span class="db-text-body text-[10px] leading-[1.1] break-words" title="${d.k}">${d.k}</span>
            </div>
            <div class="flex-1 h-1 bg-[#0f141a] rounded-full overflow-hidden border border-gray-800/50 relative">
                <div class="h-full bg-cyan-500 rounded-full animate-bar" style="--final-width: ${percentage}%"></div>
            </div>
            <span class="db-text-body text-gray-400 w-7 text-right text-[10px] shrink-0"><span class="counter-anim" data-target="${percentage}">0</span>%</span>
        </div>`;
    }).join('');

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
            else if (refNameClean.includes('arquitectura') && (pDiscs.includes('arquitectura') || pDiscs.includes('general'))) {
                count++;
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
    const top5Stats = stats.slice(0, 5);
    const totalCount = top5Stats.reduce((acc, curr) => acc + curr.count, 0) || 1;

    container.innerHTML = top5Stats.map((stat, i) => {
        const percentage = Math.round((stat.count / totalCount) * 100);

        return `
        <div class="flex items-center gap-2 db-text-body mb-0.5 font-mono group animate-item">
            <div class="flex items-start gap-1.5 w-32 shrink-0 pl-1 pt-0.5">
                <i data-lucide="${stat.icon}" class="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition shrink-0 mt-0.5"></i>
                <span class="db-text-body text-[10px] leading-[1.1] break-words">${stat.name}</span>
            </div>
            <div class="flex-1 h-1 bg-[#0f141a] rounded-full overflow-hidden border border-gray-800/50 relative">
                <div class="h-full bg-cyan-500 rounded-full animate-bar" style="--final-width: ${percentage}%; animation-delay: ${i * 0.1}s"></div>
            </div>
            <span class="db-text-body text-gray-400 w-7 text-right text-[10px] shrink-0"><span class="counter-anim" data-target="${percentage}">0</span>%</span>
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
    // Paleta cyan uniforme para todas las barras
    const colors = ["bg-cyan-500", "bg-cyan-500", "bg-cyan-500", "bg-cyan-500"];

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
        <div class="flex items-center gap-2 db-text-body mb-0.5 font-mono group animate-item" style="animation-delay: ${delay}s">
            <div class="flex items-start gap-1.5 w-32 shrink-0 pl-1 pt-0.5">
                <i data-lucide="${icon}" class="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition shrink-0 mt-0.5"></i>
                <span class="db-text-body text-[10px] text-gray-300 leading-[1.1] break-words pr-1">${s.name}</span>
            </div>
            <div class="flex-1 h-1 bg-[#0f141a] rounded-full overflow-hidden border border-gray-800/50 relative">
                <div class="h-full bg-cyan-500 rounded-full animate-bar" style="--final-width: ${pct}%"></div>
            </div>
            <span class="db-text-body w-7 text-right text-gray-400 text-[10px] shrink-0"><span class="counter-anim" data-target="${pct}">0</span>%</span>
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
                    <div class="db-text-body text-blue-400 [.light-theme_&]:text-blue-700 font-bold text-[10px] mb-1"><span class="counter-anim" data-target="${pctOficina}">0</span>%</div>
                    <div class="w-6 xl:w-8 bg-[#0f141a] rounded-t-lg h-16 flex items-end">
                        <div class="w-full bg-blue-500 rounded-t-lg animate-bar-vertical" style="--final-height: ${pctOficina}%"></div>
                    </div>
                    <span class="text-[9px] font-mono text-gray-400 [.light-theme_&]:text-slate-600 mt-1 truncate text-center uppercase tracking-wider">Oficina</span>
                </div>
                
                <!-- OBRA -->
                <div class="flex flex-col items-center justify-end h-full">
                    <div class="db-text-body text-green-400 [.light-theme_&]:text-green-700 font-bold text-[10px] mb-1"><span class="counter-anim" data-target="${pctObra}">0</span>%</div>
                    <div class="w-6 xl:w-8 bg-[#0f141a] rounded-t-lg h-16 flex items-end">
                        <div class="w-full bg-green-500 rounded-t-lg animate-bar-vertical" style="--final-height: ${pctObra}%"></div>
                    </div>
                    <span class="text-[9px] font-mono text-gray-400 [.light-theme_&]:text-slate-600 mt-1 truncate text-center uppercase tracking-wider">Obra</span>
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

    // Ordenar por nivel (dominio%) de mayor a menor segÃºn el CSV
    data.sort((a, b) => {
        const nivelA = getSoftwarePct(a);
        const nivelB = getSoftwarePct(b);
        return nivelB - nivelA;
    });
    const grouped = {};
    data.forEach(s => {
        let grupo = getVal(s, 'grupo') || 'Generales';
        // Remover el prefijo numÃ©rico como "1. " o "2. " si existe para la etiqueta
        grupo = grupo.replace(/^\d+\.\s*/, '');
        if (!grouped[grupo]) grouped[grupo] = [];
        grouped[grupo].push(s);
    });

    // Contenedor general en grid de 3 columnas
    container.className = "grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start";

    let html = '';

    const columnLayout = [
        ['Producción y Modelado', 'Coordinación y CDE'],
        ['IA y Automatización', 'Gestión y Análisis'],
        ['Visualización']
    ];

    const renderedGroups = new Set();

    // Helper function to render a single group
    const renderSoftwareGroup = (grupoName) => {
        let groupHtml = '';
        if (!grouped[grupoName]) return groupHtml;

        renderedGroups.add(grupoName);

        grouped[grupoName].sort((a, b) => {
            const nivelA = getSoftwarePct(a);
            const nivelB = getSoftwarePct(b);

            if (nivelB !== nivelA) {
                return nivelB - nivelA; // Mayor nivel primero
            }

            // Si el nivel es igual, alfabÃ©tico
            const nameA = getVal(a, 'nombre', 'software').toLowerCase();
            const nameB = getVal(b, 'nombre', 'software').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        groupHtml += `
        <div class="w-full flex flex-col gap-1.5 overflow-hidden">
            <span class="text-[9px] text-gray-500 font-mono tracking-widest uppercase ml-1 break-words whitespace-normal text-left">${grupoName}</span>
            <div class="flex flex-wrap gap-1.5 pb-1">`;

        grouped[grupoName].forEach((s) => {
            const name = getVal(s, 'nombre', 'software');
            const icon = resolveIcon(s, 'box');
            const desc = getVal(s, 'desc', 'descripcion', 'descripción');
            const nivel = getVal(s, 'nivel');
            const capacidad = getVal(s, 'capacidad');

            const safeDesc = desc ? desc.replace(/\n/g, '<br>').replace(/"/g, '&quot;') : '';
            // Forzar Proper Case para el Nivel (ej. 'Alto')
            const displayNivel = nivel ? nivel.charAt(0).toUpperCase() + nivel.slice(1).toLowerCase() : '';
            const safeNivel = displayNivel ? displayNivel.replace(/\n/g, '<br>').replace(/"/g, '&quot;') : '';
            const safeCapacidad = capacidad ? capacidad.replace(/\n/g, '<br>').replace(/"/g, '&quot;') : '';
            const safeName = name ? name.replace(/"/g, '&quot;') : '';

            let displayName = name;
            if (name.toLowerCase() === 'revit') {
                displayName = `Revit <span class="text-gray-500 font-light lowercase">(multidisciplina)</span>`;
            }

            groupHtml += `
            <div class="shrink-0 flex items-center gap-1 bg-cyan-900/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400/50 rounded-md px-1.5 py-0.5 transition group cursor-help anim-fade-in"
                 data-tooltip-title="Nivel: ${safeNivel}"
                 data-tooltip-text="${safeCapacidad}"
                 onmouseenter="window.showRoiTooltip(event)"
                 onmouseleave="window.hideRoiTooltip()"
                 onmousemove="window.moveRoiTooltip(event)">
                <i data-lucide="${icon}" class="w-3 h-3 text-cyan-400/70 [.light-theme_&]:text-cyan-700 group-hover:text-cyan-300 [.light-theme_&]:group-hover:text-cyan-800 transition shrink-0"></i>
                <span class="text-[8.5px] md:text-[9.5px] font-bold uppercase tracking-wider text-gray-400 [.light-theme_&]:text-gray-800 transition leading-none py-0.5 whitespace-nowrap">${displayName}</span>
            </div>`;
        });

        groupHtml += `</div></div>`;
        return groupHtml;
    };

    columnLayout.forEach((colGroups, colIndex) => {
        html += `<div class="flex flex-col gap-5 w-full">`;

        colGroups.forEach(targetGrupo => {
            const actualGroup = Object.keys(grouped).find(g => normalizeStr(g) === normalizeStr(targetGrupo));
            if (actualGroup) {
                html += renderSoftwareGroup(actualGroup);
            }
        });

        // Si es la ultima columna, agregar cualquier grupo que no se haya especificado arriba
        if (colIndex === columnLayout.length - 1) {
            Object.keys(grouped).forEach(actualGroup => {
                if (!renderedGroups.has(actualGroup)) {
                    html += renderSoftwareGroup(actualGroup);
                }
            });
        }

        html += `</div>`;
    });

    container.insertAdjacentHTML('beforeend', html);
}

function renderNorms(data) {
    const container = document.getElementById('global-norms-list');

    // Inyección Dinámica del Título (Busca "Normativas" en el CSV)
    injectSectionHeader('global-norms-list', 'normativas', 'NORMATIVAS', 'book-open', 0);

    if (!container || !data) return;

    if (data.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-xs w-full text-center py-4">Sin datos.</div>';
        return;
    }

    // Agrupar por 'grupo'
    const grouped = {};
    data.forEach(n => {
        let grupo = getVal(n, 'grupo') || 'Generales';
        if (!grouped[grupo]) grouped[grupo] = [];
        grouped[grupo].push(n);
    });

    let html = '';

    const logicalOrder = [
        // Estrategia
        "oir", "pir", "air", "eir", "pim", "aim",
        // Gestión
        "iso 19650", "bep pre-appointment", "bep post-appointment", "midp", "tidp",
        "responsibility matrix", "mobilization plan", "information protocol", "risk register", "pmp",
        // Open BIM
        "open bim", "ifc", "ifc / cobie", "bcf", "ids", "bsdd", "iso 7817", "iso 7817 (loin)", "lod", "omniclass",
        // Coordinación
        "clash avoidance", "clash detection", "cte"
    ];

    Object.keys(grouped).forEach(grupo => {

        // Ordenar lógicamente y luego alfabÃ©ticamente
        grouped[grupo].sort((a, b) => {
            const titleA = getVal(a, 'titulo', 'título', 'norma', 'nombre').toLowerCase();
            const titleB = getVal(b, 'titulo', 'título', 'norma', 'nombre').toLowerCase();

            const indexA = logicalOrder.indexOf(titleA);
            const indexB = logicalOrder.indexOf(titleB);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Ambos en lista
            if (indexA !== -1) return -1; // Solo A en lista (va primero)
            if (indexB !== -1) return 1;  // Solo B en lista (va primero)

            // Si ninguno está en la lista lógica, orden alfabÃ©tico
            return titleA.localeCompare(titleB);
        });

        html += `
        <div class="w-full flex flex-col gap-1.5 overflow-hidden">
            <span class="text-[9px] text-gray-500 font-mono tracking-widest uppercase ml-1">${grupo}</span>
            <div class="flex flex-wrap gap-1.5 pb-1">`;

        grouped[grupo].forEach(n => {
            const title = getVal(n, 'titulo', 'título', 'norma', 'nombre');
            // Tooltip estrictamente con 'Aplicación en Modelado'
            const tooltipText = getVal(n, 'aplicación en modelado', 'aplicacion en modelado');
            const icon = resolveIcon(n, 'file-text');

            const safeTooltip = tooltipText ? tooltipText.replace(/"/g, '&quot;').replace(/\n/g, '<br>') : 'Información no disponible';
            const safeTitle = title ? title.replace(/"/g, '&quot;') : '';

            // DiseÃ±o muy compacto (píldora con icono y nombre)
                html += `
                    <div class="shrink-0 flex items-center gap-1 bg-blue-900/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-400/50 rounded-md px-1.5 py-0.5 transition group cursor-help"
                         data-tooltip-title="${safeTitle}"
                         data-tooltip-text="${safeTooltip}"
                         onmouseenter="window.showRoiTooltip(event)"
                         onmouseleave="window.hideRoiTooltip()"
                         onmousemove="window.moveRoiTooltip(event)">
                        <i data-lucide="${icon}" class="w-3 h-3 text-blue-400/70 [.light-theme_&]:text-blue-700 group-hover:text-blue-300 [.light-theme_&]:group-hover:text-blue-800 transition shrink-0"></i>
                        <span class="text-[8.5px] md:text-[9.5px] font-bold uppercase tracking-wider text-gray-300 [.light-theme_&]:text-gray-800 transition leading-none py-0.5 whitespace-nowrap">${title}</span>
                    </div>`;
            });
            html += `</div></div>`;
        });

    container.innerHTML = html;
}

function renderEducationView(mbiaData, cvData) {
    window.lastMbiaData = mbiaData || window.lastMbiaData;
    window.lastCvData = cvData || window.lastCvData;

    const unifiedRow1 = document.getElementById('edu-row1-unified');
    const extraOngoingContainer = document.getElementById('edu-ongoing-extra');
    const prevBadgesContainer = document.getElementById('global-edu-prev-badges');
    const listContainer = document.getElementById('global-edu-list');

    if (!cvData) return;

    const generateBadgeHtml = (edu, idx, showTooltip = true) => {
        if (!edu) return null;
        const eduKeys = Object.keys(edu || {});
        const nombre = getVal(edu, 'Nombre', 'Titulo', 'titulo');
        let institucion = getVal(edu, 'Institucion', 'Institución', 'institucion');
        
        // Abreviar U.A.N.L. para el texto curvo del badge
        if (institucion && institucion.toLowerCase().includes('autónoma de nuevo león')) {
            institucion = institucion.replace(/Universidad Autónoma de Nuevo León/gi, 'U.A.N.L.');
        }
        
        const urlPaginaInput = (getVal(edu, 'URL Página', 'URL Pagina', 'url', 'enlace', 'link') || '').trim();
        const urlArchivoInput = (getVal(edu, 'URL Archivo', 'URL', 'archivo', 'url archivo ', 'url archivo') || '').trim();
        
        // El enlace principal del badge es URL Página (respaldo URL Archivo)
        const mainLink = urlPaginaInput || urlArchivoInput || '#';
        const idCredencial = getVal(edu, 'ID / Credencial', 'credencial', 'id');
        const categoria = getVal(edu, 'nivel', 'categoría', 'categoria');
        const isCertificacion = normalizeStr(categoria).includes('certifica');

        const lowNombre = normalizeStr(nombre);
        const lowInst = normalizeStr(institucion);

        // --- LÓGICA ESPECIAL PARA BIMCOLLAB (MODAL) ---
        // Ampliamos la detección para capturar "BCF", "Manager Course", etc.
        const isBimCollabAny = lowNombre.includes('bimcollab') || lowInst.includes('bimcollab') || 
                               lowNombre.includes('bcf') || lowInst.includes('bcf') ||
                               (lowNombre.includes('bc') && lowNombre.includes('manager'));
        let clickAction = `href="${mainLink}" target="_blank"`;

        // Si es Bimcollab, forzamos abrir el modal con el certificado (URL Archivo)
        if (isBimCollabAny) {
            let certImg = urlArchivoInput;
            
            // Failsafe: Búsqueda exhaustiva de cualquier URL de certificado en el objeto
            if (!certImg || !certImg.includes('http')) {
                const possibleCert = Object.values(edu || {}).find(v => {
                    const s = String(v).toLowerCase();
                    return s.includes('http') && (s.includes('certificate') || s.includes('certificacion') || s.includes('.png') || s.includes('.jpg'));
                });
                if (possibleCert) certImg = String(possibleCert).trim();
            }

            if (certImg && certImg.includes('github.com') && certImg.includes('/blob/')) {
                certImg = certImg.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
            }
            // Aseguramos que la URL esté bien codificada (para manejar espacios %20)
            try { certImg = encodeURI(decodeURI(certImg)); } catch(e) {}
            
            const escNombre = (nombre || '').replace(/'/g, "\\'");
            clickAction = `onclick="event.preventDefault(); window.openCertModal('${certImg}', '${escNombre}')" style="cursor: pointer;"`;
        }
        // ----------------------------------------------

        // Búsqueda exhaustiva de archivos (URL o Nombre)
        const archivosVal = (getVal(edu, 'archivos', 'insignia', 'archivo', 'badge', 'logo', 'imagen') || '').trim();
        let fullBadgeUrl = null;
        let badgeFile = null;

        if (archivosVal.toLowerCase().includes('http')) {
            fullBadgeUrl = archivosVal;
            if (fullBadgeUrl.includes('github.com') && fullBadgeUrl.includes('/blob/')) {
                fullBadgeUrl = fullBadgeUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
            }
            try { fullBadgeUrl = encodeURI(decodeURI(fullBadgeUrl)); } catch(e) {}
        } else if (archivosVal) {
            badgeFile = archivosVal.split(',')[0].trim();
        } else {
             // Fallback: buscamos en todo el objeto cualquier valor que parezca un archivo (pero no URL)
             const possibleFile = Object.values(edu || {}).find(v => {
                const s = String(v).toLowerCase();
                return (s.includes('.png') || s.includes('.jpg') || s.includes('.svg')) && !s.includes('http');
            });
            if (possibleFile) badgeFile = String(possibleFile).trim();
        }
        const isPlannerly = lowInst.includes('plannerly');
        const isDynamoSolibri = lowNombre.includes('dynamo') || lowNombre.includes('solibri');
        
        // --- FALLBACKS MANUALES POR NOMBRE ---
        if (lowNombre.includes('boot camp')) {
             badgeFile = '04_BIM Boot Camp_badge_2.png';
        } else if (lowNombre.includes('workshop')) {
            // URL específica proporcionada por el usuario para Butic Workshop
            fullBadgeUrl = "https://raw.githubusercontent.com/eduardoehr89-source/portafolio/c6e71f8f5be8c62df3bb908336bbcb1930351217/CV/insignias/Unreal%20Engine%20Workshop_certificate_badge.png";
        } else if (lowNombre.includes('master') || lowNombre.includes('superior')) {
            // URL específica proporcionada por el usuario para Butic Master (BIM Master Program)
            fullBadgeUrl = "https://raw.githubusercontent.com/eduardoehr89-source/portafolio/c6e71f8f5be8c62df3bb908336bbcb1930351217/CV/insignias/BIM%20Master%20Program_certificate_badge.png";
        } else if (lowNombre.includes('buildingsmart')) {
            badgeFile = 'buildingSMART_Professional_Certification-Entry_Badge_(Spanish).png';
        } else if (!badgeFile && !fullBadgeUrl && isPlannerly) {
            if (lowNombre.includes('expert') || lowNombre.includes('level 3')) {
                fullBadgeUrl = "https://raw.githubusercontent.com/eduardoehr89-source/portafolio/c6e71f8f5be8c62df3bb908336bbcb1930351217/CV/insignias/03_Expert_badge.png";
            } else if (lowNombre.includes('advanced') || lowNombre.includes('level 2')) badgeFile = '02_Advanced_badge.png';
            else if (lowNombre.includes('basics') || lowNombre.includes('level 1')) badgeFile = '01_Basics_badge.png';
            else if (lowNombre.includes('troublemaker')) badgeFile = '05_Digital Troublemaker_badge.png';
            else badgeFile = 'logo_plannerly.png';
        }

        // --- NUEVAS COLUMNAS CSV (Matching Estricto) ---
        // Buscamos la columna que diga SI/NO (Badge genérico)
        const keyGenerico = eduKeys.find(k => {
            const nk = normalizeStr(k);
            return nk.includes('badge') && nk.includes('generico') && !nk.includes('titulo');
        });
        const isGenericCSV = keyGenerico ? (edu[keyGenerico] || '').toUpperCase() === 'SI' : false;
        
        // Buscamos la columna del Título (Titulo en badge genérico)
        const keyTituloGenerico = eduKeys.find(k => {
            const nk = normalizeStr(k);
            return nk.includes('titulo') && nk.includes('generico');
        });
        const titleCSV = keyTituloGenerico ? edu[keyTituloGenerico] : '';

        // Si el CSV dice SI, forzamos diseño circular de texto. 
        if (isGenericCSV) {
            badgeFile = null; 
        }

        // Fallback dinámico para Máster si no hay archivo específico y NO es genérico
        if (!badgeFile && !fullBadgeUrl && !isGenericCSV && (lowNombre.includes('aimaster') || lowNombre.includes('programademasteria'))) {
            badgeFile = 'AI Master Program_candidate_badge.png';
        }

        let customBadge = '';
        // Solo generamos customBadge si es SI (excluyendo a BUTIC por orden del usuario) o BimCollab.
        const isButicAny = lowInst.includes('butic') || lowNombre.includes('butic');
        const isCustomTextFormat = (isGenericCSV || isBimCollabAny) && !isButicAny; 
        
        if (isCustomTextFormat) {
            badgeFile = null;
            fullBadgeUrl = null;
            let shortTitle = 'CERT';
            
            // Prioridad 1: Título del CSV si es válido
            if (titleCSV && titleCSV !== 'N/A' && titleCSV !== '') {
                shortTitle = titleCSV;
            } 
            // Prioridad 2: Mapeos hardcoded (Fallback)
            else if (lowNombre.includes('dynamo')) shortTitle = 'DYNAMO';
            else if (lowNombre.includes('solibri')) shortTitle = 'SOLIBRI';
            else if (lowNombre.includes('ef set') || lowInst.includes('ef set')) shortTitle = 'EF SET';
            else if (lowNombre.includes('d4 reality') || lowInst.includes('d4 reality')) shortTitle = 'D4 REALITY';
            else if (lowNombre.includes('workshop')) shortTitle = 'WORKSHOP';
            else if (lowInst.includes('tecnologico')) shortTitle = 'REVIT AVANZ';
            else if (lowNombre.includes('buildingsmart') || lowInst.includes('buildingsmart')) shortTitle = 'BSI';
            else if (lowNombre.includes('univer') || lowInst.includes('univer')) {
                if (lowNombre.includes('arquitecto')) shortTitle = 'ARQUITECTO';
                else shortTitle = 'UNIVERSIDAD';
            }
            else if (isBimCollabAny) {
                if (lowNombre.includes('ids')) shortTitle = 'IDS';
                else if (lowNombre.includes('zoom')) {
                    if (lowNombre.includes('basic')) shortTitle = 'ZOOM BASIC';
                    else if (lowNombre.includes('smart')) shortTitle = 'ZOOM SMART';
                    else shortTitle = 'ZOOM';
                }
                else if (lowNombre.includes('webviewer')) shortTitle = 'WEBVIEWER';
                else if (lowNombre.includes('getting started')) shortTitle = 'BASICS';
                else if (lowNombre.includes('issue')) shortTitle = 'INCIDENCIAS';
                else if (lowNombre.includes('bcf')) shortTitle = 'BCF';
                else shortTitle = 'ACADEMY';
            }
            else {
                shortTitle = (getVal(edu, 'Nombre', 'Titulo', 'titulo') || 'CERT').split(' ').slice(0, 2).join(' ').toUpperCase();
                if (shortTitle.length > 12) shortTitle = shortTitle.substring(0, 10);
            }

            customBadge = `
                <div class="relative w-[85px] h-[85px] md:w-[95px] md:h-[95px] rounded-full flex items-center justify-center group-hover/cert:scale-110 transition-transform duration-500 z-10 custom-badge-card" style="display: flex !important;">
                    <span class="text-[9px] md:text-[10px] font-bold tracking-[0.05em] uppercase text-center px-1 custom-badge-text leading-tight break-words">${shortTitle.split(' ').join('<br>')}</span>
                </div>`;
        }

        if (!badgeFile && !customBadge) {
            badgeFile = 'badge_generic.png';
        }

        const svgContent = `
            <svg viewBox="0 0 120 120" class="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                <path id="curve-cert-dash-${idx}" d="M 60, 60 m -54, 0 a 54,54 0 1,1 108,0 a 54,54 0 1,1 -108,0" fill="transparent" />
                <text class="text-[8px] font-black fill-gray-500 font-mono uppercase tracking-[0.25em] badge-ring-text">
                    <textPath href="#curve-cert-dash-${idx}" startOffset="50%" text-anchor="middle">${institucion}</textPath>
                </text>
            </svg>`;

        let displayEstado = getVal(edu, 'Estado', 'estado') + ' ' + getVal(edu, 'periodo', 'Periodo');
        if (displayEstado.includes('undefined')) displayEstado = displayEstado.replace('undefined', '').trim();

        // Limpieza de URLs de GitHub (de blob a raw) si fullBadgeUrl es un enlace de GitHub
        if (fullBadgeUrl && fullBadgeUrl.includes('github.com') && fullBadgeUrl.includes('/blob/')) {
            fullBadgeUrl = fullBadgeUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }

        let finalBadgeSrc = fullBadgeUrl || (badgeFile ? `${CLOUD_BADGE_BASE}${encodeURIComponent(badgeFile)}?t=${timestamp}` : null);

        const badgeImgEl = finalBadgeSrc ? `<img src="${finalBadgeSrc}" alt="${nombre}" 
                     class="w-[95px] h-[95px] object-contain group-hover/cert:scale-110 transition-transform duration-500 relative z-10"
                     onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/CV/insignias/badge_generic.png';">` : customBadge;

        const tooltipHTML = showTooltip ? `
             <div class="glass-tooltip !bottom-[120%] !left-1/2 !-translate-x-1/2 mt-auto">
                <strong class="text-blue-400 block mb-0.5 text-[0.6rem]">${institucion}</strong>
                <p class="text-white text-[0.65rem] mb-1 font-bold leading-tight">${nombre}</p>
                <span class="text-[0.5rem] text-gray-400 block border-t border-white/10 pt-1 uppercase">${displayEstado} ${idCredencial && idCredencial !== 'N/A' ? `// ID: ${idCredencial}` : ''}</span>
             </div>` : '';

        return `
            <a ${clickAction} class="flex-shrink-0 no-underline hover:scale-105 transition-transform group/cert relative w-[120px] h-[120px] flex items-center justify-center block">
                ${svgContent}
                ${badgeImgEl}
                ${tooltipHTML}
            </a>`;
    };

    const ongoing = cvData.filter(e => {
        const st = normalizeStr(getVal(e, 'Estado', 'estado') || '');
        return st.includes('curso') || st.includes('cruso');
    });

    let origPast = cvData.filter(e => {
        const st = normalizeStr(getVal(e, 'Estado', 'estado') || '');
        return !st.includes('curso') && !st.includes('cruso');
    });

    let past = [...origPast];
    let totalPastCount = origPast.length;

    if (window.isTopBadgesOnly) {
        const topNames = [
            'arquitect',
            'autodesk',
            'buildingsmart',
            'expert',
            'ids', 'bcf'
        ];
        past = past.filter(cert => {
            const name = normalizeStr(getVal(cert, 'titulo', 'nombre', 'badge'));
            return topNames.some(t => name.includes(t));
        });
    }

    const master = ongoing.find(e => normalizeStr(getVal(e, 'titulo', 'nombre')).match(/(master|mbia)/));
    const dynamo = ongoing.find(e => normalizeStr(getVal(e, 'titulo', 'nombre')).includes('dynamo'));
    const solibri = ongoing.find(e => normalizeStr(getVal(e, 'titulo', 'nombre')).includes('solibri'));

    // Actualizar el contador en el título de Educación Previa
    const pastHeader = document.getElementById('edu-prev-header-title');
    if (pastHeader) {
        if (window.isTopBadgesOnly) {
            pastHeader.innerHTML = `<span class="font-semibold">EDUCACI&Oacute;N PREVIA</span> - LICENCIAS Y CERTIFICACIONES (${past.length}/${totalPastCount})`;
        } else {
            pastHeader.innerHTML = `<span class="font-semibold">EDUCACI&Oacute;N PREVIA</span> - LICENCIAS Y CERTIFICACIONES (${totalPastCount})`;
        }
    }

    if (unifiedRow1 && master) {
        const pilaresFiltrados = (mbiaData || []).filter(p => {
            const lowTitle = normalizeStr(getVal(p, 'pilar', 'título', 'nombre', 'titulo'));
            return !lowTitle.includes('estrategia');
        });

        unifiedRow1.innerHTML = `
        <div class="flex flex-col xl:flex-row gap-4 w-full">
            <!-- Bloque 1: Máster y Pilares -->
            <div class="flex-1 edu-premium-card rounded-xl p-5 flex flex-col lg:flex-row items-center group/main transition-all duration-500">
                <div class="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto lg:pr-8 border-b lg:border-b-0 lg:border-r border-gray-800/15 pb-6 lg:pb-0 shrink-0">
                    ${generateBadgeHtml(master, 'master-main', false)}
                    <div class="flex flex-col gap-1 items-center lg:items-start text-center lg:text-left">
                        <span class="text-[9px] font-mono text-cyan-400 uppercase tracking-[0.2em] font-bold mb-1">${getVal(master, 'nivel', 'categoría', 'categoria')}</span>
                        <h4 class="text-sm font-black text-white leading-tight uppercase mb-1">${getVal(master, 'Nombre', 'Titulo', 'titulo')}</h4>
                        <div class="flex items-center gap-2 text-gray-500 text-[10px] font-medium uppercase tracking-wider">
                            <span>${getVal(master, 'periodo', 'Periodo')}</span>
                        </div>
                    </div>
                </div>
                <div class="flex-1 w-full lg:pl-8 pt-6 lg:pt-0">
                    <div class="flex items-center justify-between gap-1 sm:gap-2 w-full px-1">
                        ${pilaresFiltrados.map(p => {
                            const title = getVal(p, 'pilar', 'titulo', 'materia');
                            const icon = resolveIcon(p, 'graduation-cap');
                            const text = (getVal(p, 'acción técnica', 'accion tecnica') || '').replace(/\n/g, '<br>').replace(/"/g, '&quot;');
                            const tools = (getVal(p, 'herramientas clave') || '').replace(/"/g, '&quot;');
                            return `<div class="relative cursor-help flex flex-col items-center justify-center text-center gap-1 group/pilar flex-1 min-w-0"
                                     data-tooltip-title="${title}" data-tooltip-text="${text}" data-tooltip-footer="HERRAMIENTAS CLAVE: ${tools}"
                                     onmouseenter="window.showRoiTooltip(event)" onmouseleave="window.hideRoiTooltip()" onmousemove="window.moveRoiTooltip(event)">
                                <div class="shrink-0 p-2 rounded-full bg-green-500/5 text-green-500/70 group-hover/pilar:bg-green-500/20 group-hover/pilar:text-white transition-all duration-300">
                                    <i data-lucide="${icon}" class="w-5 h-5 sm:w-6 sm:h-6"></i>
                                </div>
                                <div class="min-w-0 w-full">
                                    <h4 class="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400 group-hover/pilar:text-white transition leading-tight">${title}</h4>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Bloque 2: Herramientas Adicionales (Dynamo, Solibri) -->
            <div class="shrink-0 flex items-center justify-center min-w-fit px-4 border-l border-gray-800/15">
                <div class="flex justify-center items-center gap-4 flex-nowrap">
                    ${[dynamo, solibri].filter(Boolean).map((e, idx) => generateBadgeHtml(e, 'ext'+idx, false)).join('')}
                </div>
            </div>
        </div>`;

    } else if (unifiedRow1) {
        unifiedRow1.innerHTML = '';
    }

    if (extraOngoingContainer) extraOngoingContainer.innerHTML = '';

    if (prevBadgesContainer) {
        prevBadgesContainer.classList.remove('hidden'); // Asegurar visible por defecto
        const sortedPastCerts = [...past].sort((a, b) => {
            const orderA = parseInt(getVal(a, 'Orden de badge', 'orden', 'posicion') || 999);
            const orderB = parseInt(getVal(b, 'Orden de badge', 'orden', 'posicion') || 999);
            return orderA - orderB;
        });

        const badgesHtml = sortedPastCerts.map((edu, idx) => generateBadgeHtml(edu, 'pv'+idx)).filter(Boolean).join('');
        
        prevBadgesContainer.innerHTML = `
            <div class="cert-nav-container w-full h-full group">
                <button class="cert-nav-btn left" onclick="scrollCerts('${prevBadgesContainer.id}', -1)">
                    <i data-lucide="chevron-left" class="w-5 h-5"></i>
                </button>
                <div id="${prevBadgesContainer.id}-inner" class="flex-1 h-full overflow-hidden flex items-center gap-4 px-4 overflow-x-auto no-scrollbar">
                    ${badgesHtml}
                </div>
                <button class="cert-nav-btn right" onclick="scrollCerts('${prevBadgesContainer.id}', 1)">
                    <i data-lucide="chevron-right" class="w-5 h-5"></i>
                </button>
            </div>
        `;
        
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => initCertAutoScroll(`${prevBadgesContainer.id}-inner`), 1000);
    }

    if (listContainer) {
        listContainer.className = "w-full space-y-1 ml-0 list-none hidden"; 

        const headerHtml = `
            <li class="grid grid-cols-[450px_140px_100px_100px_1fr] gap-4 px-4 py-2 mb-2 text-gray-300 [.light-theme_&]:text-black text-[10px] items-center font-bold tracking-widest uppercase">
                <span>CURSO / ESTUDIO</span>
                <span>INSTITUCI&Oacute;N</span>
                <span class="text-center">NIVEL</span>
                <span class="text-right">PERIODO</span>
                <span></span>
            </li>`;

        const itemsHtml = past.map(edu => {
            const nombre = getVal(edu, 'Nombre', 'Titulo', 'titulo');
            const institucion = getVal(edu, 'Institucion', 'Institución', 'institucion');
            const periodo = getVal(edu, 'periodo', 'Periodo');
            const nivel = getVal(edu, 'nivel', 'categoría', 'categoria') || 'CURSO';

            // --- LÓGICA DE CLICK (Igual que badges) ---
            const lowNombre = normalizeStr(nombre);
            const lowInst = normalizeStr(institucion);
            const urlPaginaInput = (getVal(edu, 'URL Página', 'URL Pagina', 'url', 'enlace', 'link') || '').trim();
            const urlArchivoInput = (getVal(edu, 'URL Archivo', 'URL', 'archivo', 'url archivo ', 'url archivo') || '').trim();
            const mainLink = urlPaginaInput || urlArchivoInput || '#';
            const isBimCollabAny = lowNombre.includes('bimcollab') || lowInst.includes('bimcollab');
            let clickActionAttr = `onclick="window.open('${mainLink}', '_blank')"`;

            if (isBimCollabAny) {
                let certImg = urlArchivoInput;
                if (!certImg || !certImg.includes('http')) {
                    const possibleCert = Object.values(edu || {}).find(v => {
                        const s = String(v).toLowerCase();
                        return s.includes('http') && (s.includes('certificate') || s.includes('certificacion') || s.includes('.png') || s.includes('.jpg'));
                    });
                    if (possibleCert) certImg = String(possibleCert).trim();
                }
                if (certImg && certImg.includes('github.com') && certImg.includes('/blob/')) {
                    certImg = certImg.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
                }
                try { certImg = encodeURI(decodeURI(certImg)); } catch(e) {}
                const escNombre = (nombre || '').replace(/'/g, "\\'");
                clickActionAttr = `onclick="event.preventDefault(); window.openCertModal('${certImg}', '${escNombre}')"`;
            }

            return `<li ${clickActionAttr} class="grid grid-cols-[450px_140px_100px_100px_1fr] gap-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800/30 transition-all rounded-lg px-4 items-center group relative cursor-pointer">
                <span class="absolute left-1 w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-40 transition-opacity"></span>
                <span class="text-[11px] text-gray-300 [.light-theme_&]:text-slate-800 uppercase tracking-wider font-light group-hover:text-cyan-500 [.light-theme_&]:group-hover:text-cyan-700 transition-colors">${nombre}</span>
                <span class="text-[10px] text-gray-400 [.light-theme_&]:text-slate-500 italic font-light">${institucion}</span>
                <div class="flex justify-center">
                    <span class="text-[8px] px-2 py-0.5 rounded-full border border-blue-600/20 dark:border-cyan-500/20 bg-blue-600/5 dark:bg-cyan-500/5 text-blue-600 dark:text-cyan-400/70 [.light-theme_&]:text-blue-600 font-mono uppercase tracking-widest min-w-[80px] text-center font-normal">${nivel}</span>
                </div>
                <span class="text-[9px] text-gray-400 [.light-theme_&]:text-slate-500 font-mono text-right whitespace-nowrap">${periodo}</span>
                <span></span>
            </li>`;
        }).join('');

        listContainer.innerHTML = headerHtml + itemsHtml;
    }
}

window.showRoiTooltip = function (e) {
    if (!globalTooltipEl) initGlobalTooltip();
    if (globalTooltipTimeout) {
        clearTimeout(globalTooltipTimeout);
        globalTooltipTimeout = null;
    }

    const target = e.currentTarget;
    const meta = target.getAttribute('data-tooltip-meta');
    const title = target.getAttribute('data-tooltip-title');
    const subtitle = target.getAttribute('data-tooltip-subtitle');
    const text = target.getAttribute('data-tooltip-text');
    const footer = target.getAttribute('data-tooltip-footer');
    const colorClass = target.getAttribute('data-tooltip-color') || 'text-cyan-400';

    const isCompact = target.getAttribute('data-tooltip-size') === 'compact';
    const metaHTML = meta ? `<div class="font-mono font-bold uppercase tracking-[0.2em] ${isCompact ? 'text-[8.5px]' : 'text-[10px]'} mb-1 ${colorClass}">${meta}</div>` : '';
    const titleHTML = title ? `<div class="font-sans font-semibold mb-1 tracking-tight ${isCompact ? 'text-[9.6px] normal-case' : 'text-[12px] uppercase'} tooltip-title leading-tight">${title}</div>` : '';
    const subtitleHTML = subtitle ? `<div class="italic ${isCompact ? 'text-[8.5px]' : 'text-[10px]'} text-gray-500 lowercase font-mono mt-1">${subtitle}</div>` : '';
    const footerHTML = footer ? `<div class="mt-2.5 pt-2 border-t border-gray-700/60 font-mono ${isCompact ? 'text-[8.5px]' : 'text-[10px]'} text-gray-400 leading-normal w-full flex flex-col items-center"><span>${footer}</span></div>` : '';

    globalTooltipEl.innerHTML = `
        <div class="flex flex-col items-center justify-center text-center w-full h-full">
            <div class="leading-relaxed font-normal ${isCompact ? 'text-[9.6px]' : 'text-[13px]'} text-center w-full font-sans flex flex-col items-center">
                ${text}
            </div>
            ${footerHTML}
        </div>
    `;

    // Lógica de Proporción 4:3 (Ratio 1.333) - Regla 01
    const textLength = (text || '').length;
    let idealWidth;
    
    if (isCompact) {
        idealWidth = 200;
    } else {
        // Factor 140-150 para que el ancho sea protagónico y busque los 650px
        const estimatedArea = textLength * 140; 
        idealWidth = Math.sqrt(estimatedArea * 1.333); 
        
        // Aplicar límites de seguridad
        idealWidth = Math.max(450, Math.min(650, idealWidth));
    }
    
    // Estilos de ROI
    globalTooltipEl.classList.remove('hidden', 'max-w-3xl', 'max-w-2xl', 'md:max-w-[540px]');
    globalTooltipEl.classList.add('flex', 'flex-col', 'items-center', 'justify-center', isCompact ? 'p-2.5' : 'p-6');
    globalTooltipEl.style.width = `${idealWidth}px`;
    globalTooltipEl.style.minWidth = isCompact ? '160px' : '450px'; 
    globalTooltipEl.style.height = 'auto'; 
    globalTooltipEl.style.display = 'flex';
    globalTooltipEl.style.flexDirection = 'column';
    globalTooltipEl.style.justifyContent = 'center';
    window.moveRoiTooltip(e);

    requestAnimationFrame(() => {
        globalTooltipEl.classList.remove('opacity-0', 'scale-95');
        globalTooltipEl.classList.add('opacity-100', 'scale-100');
    });
};

window.hideRoiTooltip = function () {
    window.hideGlobalTooltip();
};

window.moveRoiTooltip = function (e) {
    if (globalTooltipEl) {
        let x = e.clientX;
        let y = e.clientY - 15;
        
        // Evadir bordes de la pantalla
        const tooltipRect = globalTooltipEl.getBoundingClientRect();
        if (x + tooltipRect.width > window.innerWidth - 15) {
            x = window.innerWidth - tooltipRect.width - 15;
        }
        if (x < 15) x = 15;
        if (y + tooltipRect.height > window.innerHeight - 15) {
            y = window.innerHeight - tooltipRect.height - 15;
        }
        if (y < 15) y = 15;

        // Si el mouse estÃ¡ muy cerca del borde superior, mostrar debajo
        if (e.clientY < 50) {
            y = e.clientY + 25;
        }

        globalTooltipEl.style.left = `${x}px`;
        globalTooltipEl.style.top = `${y}px`;
        globalTooltipEl.style.transform = ''; // Reset transform for mouse follower
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
            let speedup = getVal(i, 'ahorro', 'speedup', 'velocidad', 'eficiencia', 'vel', 'x');

            // Limpiar el valor (quitar 'x' si existe) para mantener consistencia visual
            if (speedup) {
                speedup = speedup.toLowerCase().replace('x', '').trim();
            } else {
                // Fallback: Si no hay dato en CSV, mostrar 0 o calcular (opcional)
                speedup = "0";
            }

            // Escapar texto para el tooltip y manejar saltos de línea
            const rawDetail = detail || "Detalle de optimización no disponible.";
            const safeDetail = String(rawDetail)
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/\r?\n/g, '\n')
                .replace(/\n{2,}/g, '\n')
                .replace(/\n/g, '<br>');

            const tooltipAttrs = `
                data-tooltip-title="${tool}"
                data-tooltip-text="${safeDetail}"
                data-tooltip-color="text-green-400"
                onmouseenter="window.showRoiTooltip(event)"
                onmouseleave="window.hideRoiTooltip()"
                onmousemove="window.moveRoiTooltip(event)"
            `;

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition group cursor-help relative hover:z-50" ${tooltipAttrs}>
                
                <!-- DISCIPLINA -->
                <td class="py-2.5 pl-2 db-text-meta font-mono text-xs uppercase text-gray-400 [.light-theme_&]:text-slate-500">${discipline}</td>
                
                <!-- HERRAMIENTA(CON ICONO) -->
                <td class="py-2.5 flex items-center gap-2">
                     <div class="p-1.5 rounded-md transition bg-green-500/10 [.light-theme_&]:bg-green-700/20 text-green-500 [.light-theme_&]:text-green-700 group-hover:bg-green-500/20 group-hover:text-green-400 [.light-theme_&]:group-hover:text-green-900 shrink-0">
                        <i data-lucide="${icon}" class="w-4 h-4 stroke-[2.5px] [.light-theme_&]:stroke-[3px]"></i> 
                    </div>
                    <span class="db-text-meta font-mono text-xs text-white [.light-theme_&]:text-gray-900 font-bold">${tool}</span>
                </td>
    
                <!-- DESCRIPCION -->
                <td class="py-2.5">
                    <span class="db-text-body leading-tight text-gray-300 [.light-theme_&]:text-slate-700 transition" style="font-weight: 300 !important;">${task}</span>
                </td>
    
                <!-- TIEMPOS -->
                <td class="py-2.5 text-right db-text-meta font-mono text-gray-400 [.light-theme_&]:text-slate-500">${manual}</td>
                <td class="py-2.5 pr-2 text-right text-green-700 dark:text-green-400 font-mono db-text-meta">${auto}</td>
                
                <!-- SPEEDUP BADGE -->
                <td class="py-2.5 pr-2 text-right">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(74,222,128,0.3)]" style="background-color: #4ade80 !important; color: #000000 !important; border: none !important;">
                        <span class="counter-anim" data-target="${speedup}">0</span>x
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
    if (typeof animateCounters === 'function') animateCounters();
}

window.openROIModal = function (index) {
    const item = roiData[index];
    if (!item) return;

    const title = getVal(item, 'descripción corta', 'descripcion corta', 'tarea', 'función');
    const detail = getVal(item, 'descripción detallada', 'descripcion detallada', 'detalle') || getVal(item, 'descripción', 'descripcion');

    const modal = document.getElementById('text-modal');
    if (modal) {
        document.getElementById('text-modal-title').innerText = title;
        document.getElementById('text-modal-content').innerHTML = detail ? detail.replace(/\n/g, '<br>') : "Sin descripción detallada.";
        
        // Apertura suave
        modal.classList.remove('hidden');
        const modalContent = modal.querySelector('div');
        
        // Forzar reflow
        void modal.offsetWidth;
        
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        
        if (modalContent) {
            modalContent.classList.remove('opacity-0', 'scale-95');
            modalContent.classList.add('opacity-100', 'scale-100');
        }
    }
};

function renderCollab(data) {
    console.log("DEBUG: renderCollab iniciado con data:", data ? data.length : 0);
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
        const centerIcon = document.getElementById('collab-center-avatar'); // Debe aÃ±adirse al HTML
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

        // Determinar gradiente basado en el tema actual
        const isLight = document.documentElement.classList.contains('light-theme') || document.body.classList.contains('light-theme');
        let strokeColor;
        if (color === 'blue') {
            strokeColor = isLight ? 'rgba(29, 78, 216, 0.6)' : 'rgba(96, 165, 250, 0.6)'; // blue-700 vs blue-400
        } else {
            strokeColor = isLight ? 'rgba(21, 128, 61, 0.8)' : 'rgba(74, 222, 128, 0.6)'; // green-700 vs green-400
        }

        // Crear Curva SVG (BÃ©zier cÃºbica para un arco suave)
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Puntos de control para la curva en formato "S" suave horizontal
        // Puntos de control para la curva en formato "S" suave horizontal
        const controlX = startX + (endX - startX) * 0.5;
        const pathData = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', '1');
        path.setAttribute('class', 'transition-all duration-300 animate-pulse drop-shadow-md');

        svg.appendChild(path);
    };

    window.clearCollabLine = function () {
        const svg = document.getElementById('collab-lines-svg');
        if (svg) svg.innerHTML = '';
    };

    window.collabAutoNavItems = [];

    // Función de Item (Dinámico izquierda o derecha) sin bordes de hover
    const genItem = (item, colorKey, isOffice = false) => {
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

        // Forced explicit classes for Tailwind JIT avoiding dynamic concatenation issues
        const colorClassBase = isOffice ? 'text-green-400' : 'text-blue-400';
        const hoverColorClassBase = isOffice ? 'group-hover:text-green-400' : 'group-hover:text-blue-400';

        // Use direct stroke-[color] for SVGs in light theme to override any inherited dark text colors
        const lightThemeStroke = isOffice ? '[.light-theme_&]:!stroke-green-700' : '[.light-theme_&]:!stroke-sky-700';
        const lightThemeText = isOffice ? '[.light-theme_&]:!text-green-700' : '[.light-theme_&]:!text-sky-700';


        const unifiedBg = isOffice ? 'bg-green-400/20' : 'bg-blue-400/20';
        const unifiedBorder = isOffice ? 'border-green-400/30' : 'border-blue-400/30';

        // Additional light theme force for the background of the icon container
        const lightThemeBgOverride = isOffice ? '[.light-theme_&]:!bg-green-700/20' : '[.light-theme_&]:!bg-blue-700/20';

        const dotColorClass = colorKey === 'blue' ? 'pulse-blue' : 'pulse-green';

        const idx = window.collabAutoNavItems.length - 1;

        return `
        <div id="${uniqueId}" class="collab-item group relative p-1.5 rounded-md border border-transparent transition-all cursor-pointer bg-transparent w-full"
             onmouseenter="window.stopCollabAutoNav(); window.showCollabTooltipByIndex(${idx}); window.drawCollabLine(this, '${colorKey}');"
             onmouseleave="window.hideCollabTooltip(); window.clearCollabLine();">
            <div class="flex items-center gap-2 ${flexRowClass}">
                ${isOffice ? `
                <div class="premium-pulse-container ${dotColorClass} scale-[0.35] -ml-6 -mr-4">
                    <span class="premium-pulse-aura"></span>
                    <span class="premium-pulse-dot"></span>
                </div>
                ` : ''}
                <div class="w-6 h-6 rounded shrink-0 ${unifiedBg} ${lightThemeBgOverride} border ${unifiedBorder} flex items-center justify-center transition shadow-sm ${colorClassBase}">
                    <i data-lucide="${icon}" class="w-[14px] h-[14px] opacity-70 group-hover:opacity-100 [.light-theme_&]:stroke-[3px] [.light-theme_&]:opacity-100 ${lightThemeStroke}"></i>
                </div>
                <div class="flex flex-col min-w-0 ${textAlignClass}">
                    <span class="db-text-body font-bold text-white [.light-theme_&]:text-sky-950 text-xs ${hoverColorClassBase} ${lightThemeText} font-mono transition leading-tight">${role}</span>
                </div>

            </div>
        </div>`;
    };

    if (siteContainer) siteContainer.innerHTML = siteRoles.map(r => genItem(r, 'blue', false)).join('');
    if (officeContainer) officeContainer.innerHTML = officeRoles.map(r => genItem(r, 'green', true)).join('');

    if (window.lucide) window.lucide.createIcons();
    // window.startCollabAutoNav() eliminado de aquí, ahora se inicia solo al entrar en la vista AI
}

window.collabAutoNavInterval = null;
window.collabAutoNavStopped = false;

window.startCollabAutoNav = function () {
    if (window.collabAutoNavStopped) return;
    if (!window.collabAutoNavItems || !window.collabAutoNavItems.length) return;

    let currentIndex = 0;

    const triggerNext = () => {
        // Guardas de seguridad para evitar que el tooltip se muestre en otras vistas
        const globalView = document.getElementById('view-global');
        const isGlobalActive = globalView && !globalView.classList.contains('hidden');

        if (window.collabAutoNavStopped || !isGlobalActive) {
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
    window.collabAutoNavInterval = setInterval(triggerNext, 2000);
};

window.stopCollabAutoNav = function () {
    if (!window.collabAutoNavStopped) {
        window.collabAutoNavStopped = true;
        if (window.collabAutoNavInterval) clearInterval(window.collabAutoNavInterval);
    }
};

// Lógica para el Popup interactivo central ("MODELADOR BIM") en sección Colaboración
window.showCollabTooltipByIndex = function (idx) {
    const data = window.collabAutoNavItems[idx];
    if (!data) return;
    window.showCollabTooltip(data.role, data.inData, data.outData);
};

window.showCollabTooltip = function (role, inData, outData) {
    const popup = document.getElementById('collab-central-popup');
    if (!popup) return;

    // Pintar contenido con líneas en lugar de cajas
    popup.innerHTML = `
        <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400 [.light-theme_&]:text-cyan-700 mb-4 mt-1 text-center border-b border-cyan-500/20 [.light-theme_&]:border-cyan-500/40 pb-2">${role}</h4>
        <div class="flex flex-col gap-1.5 w-full text-xs font-mono px-2">
            <div class="flex flex-col border-l-2 border-blue-500/40 pl-2">
                <span class="text-blue-400 [.light-theme_&]:text-blue-700 font-bold tracking-widest uppercase text-[9px] mb-0.5 opacity-80">IN (RECIBO):</span>
                <span class="text-gray-300 [.light-theme_&]:text-slate-600 leading-snug">${inData}</span>
            </div>
            <div class="flex flex-col border-l-2 border-green-500/40 pl-2 mt-1">
                <span class="text-green-400 [.light-theme_&]:text-green-700 font-bold tracking-widest uppercase text-[9px] mb-0.5 opacity-80">OUT (ENTREGO):</span>
                <span class="text-gray-300 [.light-theme_&]:text-slate-600 leading-snug">${outData}</span>
            </div>
        </div>
    `;
};

window.hideCollabTooltip = function () {
    const popup = document.getElementById('collab-central-popup');
    if (!popup) return;

    // Restaurar contenido orgánico por defecto
    popup.innerHTML = `
        <div class="flex flex-col items-center justify-start h-full text-center text-gray-500 [.light-theme_&]:text-slate-500 text-[9px] font-mono tracking-widest uppercase mt-2">
            <i data-lucide="mouse-pointer-click" class="w-4 h-4 mb-1.5 text-cyan-500 [.light-theme_&]:text-cyan-700 animate-pulse"></i>
            Pasa el cursor sobre un rol para ver la informaci&oacute;n
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();
};

// ==========================================================================
// 6. UTILIDADES UI (NAVEGACIÃ“N & FILTROS)
// ==========================================================================

let currentImageIndex = 0; // Para la galería del modal

function processProjects(data) {
    if (!data || data.length === 0) return;

    // Verificar si existe la DB de imágenes generada 
    const hasImageDB = (typeof PROJECT_IMAGES_DB !== 'undefined');
    if (hasImageDB) console.log("DB de Imágenes cargada correctamente.");

    projectsData = data.map((d, i) => {
        const rawYear = String(getVal(d, 'ano', 'año', 'year'));
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
                    'P35': 'rea_02', // Aérea_02
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
            pais: (getVal(d, 'pais', 'país') || 'MÉXICO').toUpperCase(),
            ubicacion: (() => {
                const c = getVal(d, 'ciudad', 'ubicacion', 'ubicación');
                const p = getVal(d, 'pais', 'país') || 'MÉXICO';
                return c ? `${c}, ${p}` : p;
            })(),
            anio: cleanYear, // Integer year for sorting/filtering
            ano: getVal(d, 'ano', 'año'),
            anioStr: getVal(d, 'ano', 'año'),
            descripcion: getVal(d, 'descripción', 'descripcion'),
            area: d.area_ctx || '',
            niveles: d.niveles_ctx || '',
            costo: d.costo_ctx || '',
            retoRaw: getVal(d, 'nuevo reto') || getVal(d, 'nuevo_reto') || getVal(d, 'reto') || '', // Grab "nuevo reto" first
            get reto() {
                // Formateo automático de las secciones Planeacion, Ejecucion, Cierre
                if (!this.retoRaw) return '';
                // LIMPIEZA AGRESIVA: Eliminar saltos de línea preexistentes para evitar dobles espacios (Regla 1.3.3)
                let formatted = this.retoRaw.replace(/\r?\n|\r/g, ' ').replace(/\s\s+/g, ' ').trim();
                
                // Reemplazos Regex para hacer negritas las palabras clave y forzar saltos SENCILOS
                const textColorClass = 'text-cyan-400 [.light-theme_&]:text-sky-900';

                formatted = formatted.replace(/(Planeacion:|Planeación:)/g, `<br><strong class="${textColorClass} font-bold">$1</strong>`);
                formatted = formatted.replace(/(Ejecucion:|Ejecución:)/g, `<br><strong class="${textColorClass} font-bold">$1</strong>`);
                formatted = formatted.replace(/(Cierre:)/g, `<br><strong class="${textColorClass} font-bold">$1</strong>`);


                // Limpiar br extra al inicio si existiera
                return formatted.replace(/^(<br>)+/, '').trim();
            },
            software: getVal(d, 'software'),
            actividad_principal: getVal(d, 'actividad principal', 'liderazgo'),
            liderazgo: getVal(d, 'actividad principal', 'liderazgo'),
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
        if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !btn.contains(e.target)) window.setSidebarState(false);

        const menu = document.getElementById('filter-dropdown');
        const btnFilter = document.getElementById('btn-filter-toggle');
        if (menu && !menu.classList.contains('hidden') && !menu.contains(e.target) && !btnFilter.contains(e.target)) menu.classList.add('hidden');

        const sortMenu = document.getElementById('sort-dropdown');
        const btnSort = document.getElementById('btn-sort-toggle');
        if (sortMenu && !sortMenu.classList.contains('hidden') && !sortMenu.contains(e.target) && !btnSort.contains(e.target)) sortMenu.classList.add('hidden');

        const galleryModal = document.getElementById('gallery-modal');
        if (galleryModal && !galleryModal.classList.contains('hidden') && e.target.id === 'gallery-backdrop') closeGallery();

        // Close Reto Tooltips when clicking outside
        if (!e.target.closest('.group\\/reto')) {
            window.hideGlobalTooltip();
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
    document.getElementById('btn-sort-toggle')?.addEventListener('click', (e) => { e.stopPropagation(); toggleSortMenu(); });

    checkMobileAccess();
}

function checkMobileAccess() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 1024;

    if (isMobile || isSmallScreen) {
        const overlay = document.getElementById('mobile-warning-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            if (window.lucide) window.lucide.createIcons();
        }
    }
}

// Helper to sync menu button with sidebar state
window.setSidebarState = function (isOpen) {
    const sidebar = document.getElementById('main-sidebar');
    const menuBtn = document.getElementById('menu-toggle-btn');
    if (sidebar) {
        if (isOpen) sidebar.classList.add('open');
        else sidebar.classList.remove('open');
    }
    if (menuBtn) {
        if (isOpen) {
            menuBtn.classList.add('opacity-0', 'pointer-events-none');
        } else {
            menuBtn.classList.remove('opacity-0', 'pointer-events-none');
        }
    }
};

window.toggleSidebar = function () {
    const sidebar = document.getElementById('main-sidebar');
    if (!sidebar) return;
    const willOpen = !sidebar.classList.contains('open');
    window.setSidebarState(willOpen);
};

window.goBack = function () { window.history.back(); };
window.goForward = function () { window.history.forward(); };

// Helper para obtener el parámetro de tema actual
function getThemeParam() {
    return document.body.classList.contains('light-theme') ? 'theme=light' : 'theme=dark';
}

window.goToCV = function () {
    window.location.href = `CV/index.html?${getThemeParam()}`;
};

window.goToPortfolio = function () {
    window.location.href = `Portafolio_Resumido/index.html?${getThemeParam()}`;
};

window.goHome = function (isPopstate = false) {
    const hero = document.getElementById('hero-dashboard');
    const appWrapper = document.getElementById('app-wrapper');
    const sidebar = document.getElementById('main-sidebar');

    // Remover clase de bloqueo anti-flicker si llegamos por link externo
    document.documentElement.classList.remove('direct-view-load');

    if (!hero.classList.contains('hidden')) return;

    // Resaltar botón en sidebar
    window.updateSidebarActive('nav-home');

    // Cerrar aviso del sistema si está abierto
    const aiPopup = document.getElementById('ai-notice-popup');
    if (aiPopup) {
        aiPopup.classList.add('hidden');
        aiPopup.classList.add('ai-popup-hidden');
    }
    if (appWrapper) appWrapper.classList.add('fade-scale-out');
    window.setSidebarState(false);
    setTimeout(() => {
        if (appWrapper) { appWrapper.classList.add('hidden'); appWrapper.classList.remove('fade-scale-out'); }
        hero.classList.remove('hidden');
        hero.classList.remove('fade-in-up');
        void hero.offsetWidth;
        hero.classList.add('fade-in-up');
    }, 400);

    if (!isPopstate) {
        history.pushState({ view: 'home' }, '', '#home');
    }
};
window.showHome = window.goHome;

window.switchView = function (viewName, fromHome = false, immediate = false, isPopstate = false) {
    const hero = document.getElementById('hero-dashboard');
    const appWrapper = document.getElementById('app-wrapper');
    const sidebar = document.getElementById('main-sidebar');
    const views = ['view-global', 'view-projects', 'view-ai', 'view-education'];

    const activate = () => {
        appWrapper.classList.remove('hidden');
        views.forEach(id => {
            const el = document.getElementById(id);
            el.classList.add('hidden');
            el.classList.remove('view-fade-in'); // Limpiar animaciones previas
        });

        const targetView = document.getElementById(`view-${viewName}`);
        targetView.classList.remove('hidden');

        // Aplicar animación de entrada suave (forzar reflow para reiniciar si es necesario)
        void targetView.offsetWidth;
        targetView.classList.add('view-fade-in');

        // Actualizar estado activo en sidebar
        window.updateSidebarActive(`nav-${viewName}`);

        // [FIX] Forzar cierre de tooltips globales al cambiar de sección para evitar artefactos huérfanos
        if (typeof window.hideGlobalTooltip === 'function') {
            window.hideGlobalTooltip(true); // Pasar true para ocultación inmediata sin delay de animación
        }
        
        // [NUEVO] Detener el interval de auto-navegación de colaboración si cambiamos de vista
        if (typeof window.stopCollabAutoNav === 'function') {
            window.stopCollabAutoNav();
        }

        if (viewName === 'projects') {
            renderProjects(filteredProjects);
            // Asegurar revelado si venimos de carga directa (anti-flicker opacidad 0)
            const projectsView = document.getElementById('view-projects');
            if (projectsView && !projectParamGlobal) {
                projectsView.classList.add('revealed');
            }
        }

        if (viewName === 'global') {
            // [NUEVO] Iniciar auto-navegación solo cuando la vista está activa
            if (typeof window.startCollabAutoNav === 'function') {
                window.collabAutoNavStopped = false;
                window.startCollabAutoNav();
            }
        }

        if (viewName === 'ai') {
            document.getElementById('view-ai').classList.add('ai-container-mode');
            const menuBtn = document.getElementById('menu-toggle-btn');
            if (menuBtn) menuBtn.classList.add('ai-menu-dot-mode');
            renderAI();
        } else {
            document.getElementById('view-ai').classList.remove('ai-container-mode');
            const menuBtn = document.getElementById('menu-toggle-btn');
            if (menuBtn) menuBtn.classList.remove('ai-menu-dot-mode');
        }

        // Mostrar Popup Consolidado de IA y Top Projects al abrir la vista por primera vez
        const aiPopup = document.getElementById('ai-notice-popup');
        if (viewName === 'projects' && !window.aiNoticeSeen) {
            window.aiNoticeSeen = true;
            setTimeout(() => {
                if (aiPopup) {
                    aiPopup.classList.remove('hidden');
                    aiPopup.classList.remove('ai-popup-hidden');

                    if (window.lucide) window.lucide.createIcons();

                    // Auto-cerrar después de 15 segundos
                    clearTimeout(window.aiNoticeTimeout);
                    window.aiNoticeTimeout = setTimeout(() => {
                        window.closeAINotice();
                    }, 15000);
                }
            }, 800);
        } else if (viewName !== 'projects' && aiPopup) {
            // Si cambiamos a cualquier otra vista desde proyectos, cerramos el aviso automáticamente
            window.closeAINotice();
        }

        window.setSidebarState(false);

        if (!isPopstate) {
            history.pushState({ view: viewName }, '', '#' + viewName);
        }
    };

    if (immediate) {
        if (hero) {
            hero.classList.add('hidden');
            hero.classList.remove('fade-scale-out', 'fade-in-up');
        }
        activate();
        appWrapper.classList.remove('fade-scale-in');

        // Trigger Animations immediately
        if (viewName === 'global') {
            setTimeout(() => {
                renderGlobalAnalytics(projectsData, true);
                renderGlobalPhases(projectsData, true);
                renderGlobalEnvironment(projectsData, true);
                renderGlobalDisciplines(projectsData, disciplinesData, true);
                renderROI(roiData, true);
            }, 50);
        }
        return;
    }

    if (!hero.classList.contains('hidden') || fromHome) {
        hero.classList.add('fade-scale-out');
        setTimeout(() => {
            hero.classList.add('hidden');
            hero.classList.remove('fade-scale-out');
            
            // Inyectar transición de opacidad al contenedor principal
            appWrapper.style.opacity = '0';
            appWrapper.style.transition = 'opacity 0.4s ease-out';
            
            activate();
            
            requestAnimationFrame(() => {
                appWrapper.style.opacity = '1';
            });

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

window.updateSidebarActive = function (activeId) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('nav-active'));

    const activeBtn = document.getElementById(activeId);
    if (activeBtn) activeBtn.classList.add('nav-active');
};

window.openSummary = function () {
    const overlay = document.getElementById('summary-popup-overlay');
    const popup = document.getElementById('summary-popup');
    const bento = document.getElementById('global-bento-grid');

    if (overlay && popup) {
        overlay.classList.remove('hidden');
        // Forzar reflow para animación
        void overlay.offsetWidth;
        overlay.classList.add('opacity-100');
        popup.classList.remove('scale-95');
        popup.classList.add('scale-100');

        // Oscurecer el dashboard de fondo
        if (bento) bento.classList.add('opacity-10', 'blur-sm');

        if (window.lucide) window.lucide.createIcons();
    }
};

window.closeSummary = function () {
    const overlay = document.getElementById('summary-popup-overlay');
    const popup = document.getElementById('summary-popup');
    const bento = document.getElementById('global-bento-grid');

    if (overlay && popup) {
        overlay.classList.remove('opacity-100');
        popup.classList.remove('scale-100');
        popup.classList.add('scale-95');

        // Restaurar dashboard de fondo
        if (bento) bento.classList.remove('opacity-10', 'blur-sm');

        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
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
    const fLider = document.getElementById('filter-liderazgo')?.value || 'all';

    let activeFilters = [];
    if (fLoc !== 'all') activeFilters.push(`UBIC:${fLoc.toUpperCase()}`);
    if (fType !== 'all') activeFilters.push(`TIPO:${fType.toUpperCase()}`);
    if (fYear !== 'all') activeFilters.push(`AÑO:${fYear}`);
    if (fDisc !== 'all') activeFilters.push(`DISC:${fDisc.toUpperCase()}`);
    if (fEntorno !== 'all') activeFilters.push(`ENTORNO:${fEntorno.toUpperCase()}`);
    if (fPhase !== 'all') activeFilters.push(`FASE:${fPhase.toUpperCase()}`);
    if (fIA !== 'all') activeFilters.push(`IA:${fIA.toUpperCase()}`);
    if (fVideo !== 'all') activeFilters.push(`VIDEO:${fVideo.toUpperCase()}`);
    if (fLider !== 'all') activeFilters.push(`LIDER:${fLider.toUpperCase()}`);

    // Homologación de Barra de Estado (ITEMS | VISTA | TIPO)
    const count = filteredProjects.length;
    const viewLabels = { 'gallery': 'GALERÍA', 'list': 'LISTA', 'groups': 'GRUPO' };
    const viewText = viewLabels[currentViewMode] || 'SISTEMA';

    let types = [];
    if (currentViewMode === 'groups' && window.currentProjectsGrouping) {
        const groupLabels = { 
            'tipologia': 'TIPOLOGÍA', 
            'disciplinas': 'DISCIPLINAS', 
            'fase': 'FASE', 
            'entorno': 'ENTORNO', 
            'liderazgo': 'LIDERAZGO',
            'ano': 'AÑO',
            'paises': 'PAÍSES'
        };
        types.push(groupLabels[window.currentProjectsGrouping] || window.currentProjectsGrouping.toUpperCase());
    }

    if (isTop5Active) types.push('TOP PROJECTS');
    
    // Filtros activos (limpiando prefijos para mejor legibilidad en TIPO)
    activeFilters.forEach(f => {
        const val = f.includes(':') ? f.split(':')[1] : f; // Simplified check
        types.push(val);
    });

    const searchInput = document.getElementById('search-bar');
    const hasSearch = searchInput && searchInput.value.trim() !== '';

    if (hasSearch) types.push('BÚSQUEDA');

    const typeText = types.length > 0 ? types.join(', ') : 'GENERAL';
    const statusText = `ITEMS:${count} | VISTA: ${viewText} | TIPO: ${typeText}`;

    // Asignar texto
    statusTextEl.innerText = statusText;

    // Forzar siempre gris en el texto de estado
    statusTextEl.classList.remove('text-cyan-400');
    statusTextEl.classList.add('text-gray-400');

    // Feedback visual avanzado (Filtros, Top Projects, Búsqueda)
    const hasAnyFilter = activeFilters.length > 0 || isTop5Active || hasSearch || window.currentProjectsGrouping;

    // Actualizar botón de filtros principal
    if (filterBtn) {
        if (hasAnyFilter) {
            filterBtn.className = "bg-transparent border-none text-cyan-400 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors shrink-0 btn-filter-active";
        } else {
            filterBtn.className = "bg-transparent border-none text-gray-500 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors shrink-0";
        }
    }

    // Actualizar botón de reset (X) - SIEMPRE VISIBLE
    const btnReset = document.getElementById('btn-reset-filters');
    if (btnReset) {
        btnReset.classList.remove('hidden');
        if (hasAnyFilter) {
            // Estado ACTIVO: Solo la X en Cian
            btnReset.className = "bg-transparent border-none text-cyan-400 hover:text-white transition-all shrink-0 p-1 cursor-pointer btn-filter-active";
        } else {
            // Estado INACTIVO: Solo la X en Gris
            btnReset.className = "bg-transparent border-none text-gray-500 hover:text-gray-600 transition-all shrink-0 p-1 cursor-pointer";
        }
    }

    // Feedback visual para botón Top 5
    const top5Btn = document.getElementById('btn-top5');
    if (top5Btn) {
        if (isTop5Active) {
            top5Btn.classList.remove('text-gray-400');
            top5Btn.classList.add('text-cyan-400');
        } else {
            top5Btn.classList.remove('text-cyan-400');
            top5Btn.classList.add('text-gray-400');
        }
        // Asegurar que no haya fondos ni bordes
        top5Btn.classList.remove('bg-cyan-900/10', 'border-cyan-500', 'border-gray-700', 'bg-transparent');
        top5Btn.classList.add('bg-transparent', 'border-none');
    }
}

window.toggleTop5 = function () {
    isTop5Active = !isTop5Active;
    if (isTop5Active) {
        // Limpiar otros filtros si se reactiva Top Projects
        document.querySelectorAll('.filter-select').forEach(s => s.value = 'all');
        document.getElementById('search-bar').value = '';
    }
    
    // Actualizar UI del botón
    const btn = document.getElementById('btn-top5');
    if (btn) {
        btn.classList.toggle('text-cyan-400', isTop5Active);
        btn.classList.toggle('[.light-theme_&]:text-sky-900', isTop5Active);
        btn.classList.toggle('text-gray-400', !isTop5Active);
        btn.classList.toggle('active', isTop5Active);
    }
    
    runFilter();
};
window.toggleFilterMenu = function () {
    const filterBtn = document.getElementById('btn-filter-toggle');
    document.getElementById('sort-dropdown').classList.add('hidden');
    const isHidden = document.getElementById('filter-dropdown').classList.toggle('hidden');
    
    // Resaltar botón si el menú está abierto
    if (filterBtn) {
        filterBtn.classList.toggle('text-cyan-400', !isHidden);
        filterBtn.classList.toggle('[.light-theme_&]:text-sky-900', !isHidden);
        filterBtn.classList.toggle('text-gray-400', isHidden);
    }
    
    // Resetear el otro botón
    const sortBtn = document.getElementById('btn-sort-toggle');
    if (sortBtn) {
        sortBtn.classList.add('text-gray-400');
        sortBtn.classList.remove('text-cyan-400', '[.light-theme_&]:text-sky-900');
    }
};

window.toggleSortMenu = function () {
    const sortBtn = document.getElementById('btn-sort-toggle');
    document.getElementById('filter-dropdown').classList.add('hidden');
    const isHidden = document.getElementById('sort-dropdown').classList.toggle('hidden');
    
    // Resaltar botón si el menú está abierto
    if (sortBtn) {
        sortBtn.classList.toggle('text-cyan-400', !isHidden);
        sortBtn.classList.toggle('[.light-theme_&]:text-sky-900', !isHidden);
        sortBtn.classList.toggle('text-gray-400', isHidden);
    }
    
    // Resetear el otro botón
    const filterBtn = document.getElementById('btn-filter-toggle');
    if (filterBtn) {
        filterBtn.classList.add('text-gray-400');
        filterBtn.classList.remove('text-cyan-400', '[.light-theme_&]:text-sky-900');
    }
};

window.setSortOrder = function (value, label) {
    const input = document.getElementById('sort-order');
    const labelSpan = document.getElementById('sort-order-label');
    if (input) input.value = value;
    if (labelSpan) labelSpan.innerText = label;
    document.getElementById('sort-dropdown').classList.add('hidden');
    window.runFilter();
};
window.resetFilters = function () {
    // 1. Limpiar estados internos
    isTop5Active = false;
    window.currentProjectsGrouping = null;

    // 2. Limpiar UI
    document.querySelectorAll('.filter-select').forEach(s => s.value = 'all');
    const searchBar = document.getElementById('search-bar');
    if (searchBar) searchBar.value = '';

    // 3. Ocultar botones dinámicos
    const btnBack = document.getElementById('btn-back-to-groups');
    if (btnBack) btnBack.classList.add('hidden');

    // 4. Ejecutar cambios (updateSystemStatus se encargará de los estilos)
    runFilter();
};
window.handleFilterChange = function () {
    if (isTop5Active) isTop5Active = false;
    runFilter();
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
    const fLider = document.getElementById('filter-liderazgo')?.value || 'all';

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

        const checkMatch = (val, filter) => {
            if (filter === 'all') return true;
            if (!val) return false;
            const tags = val.split(/[;,]/).map(t => t.trim().toUpperCase());
            // Si el filtro es CONFIDENCIAL, cualquier tag que contenga CONFIDENCIAL es un match
            if (filter === 'CONFIDENCIAL') return tags.some(t => t.includes('CONFIDENCIAL'));
            return tags.includes(filter.toUpperCase());
        };

        const mLoc = (fLoc === 'all' ||
            (p.ubicacion || '').toUpperCase().includes(fLoc.toUpperCase()) ||
            ((fLoc.toUpperCase() === 'USA' || fLoc.toUpperCase() === 'ESTADOS UNIDOS') &&
                ((p.ubicacion || '').toUpperCase().includes('USA') || (p.ubicacion || '').toUpperCase().includes('ESTADOS UNIDOS')))
        );
        const mType = checkMatch(p.tipologia, fType);
        const mYear = (fYear === 'all' || (p.anioStr || '').includes(fYear));
        const mDisc = checkMatch(p.disciplina, fDisc);
        const mEntorno = checkMatch(p.entorno, fEntorno);
        const mPhase = checkMatch(p.fase, fPhase);

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

        const usesVideoCheck = imgList.some(img => {
            const lower = img.toLowerCase();
            return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov') || lower.includes('.avi');
        });

        let mVideo = true;
        if (fVideo === 'si') mVideo = usesVideoCheck;
        if (fVideo === 'no') mVideo = !usesVideoCheck;

        const matchesLider = checkMatch(p.actividad_principal, fLider);

        return matchesText && matchesTop5 && mLoc && mType && mYear && mDisc && mEntorno && mPhase && mIA && mVideo && matchesLider;

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
    const getOptions = (key) => {
        const raw = [];
        projectsData.forEach(p => {
            const val = getVal(p, key);
            if (val) {
                // Soportar mltiples tags separados por ";" o ","
                const tags = val.split(/[;,]/).map(t => t.trim().toUpperCase()).filter(Boolean);
                raw.push(...tags);
            }
        });
        return [...new Set(raw)].sort();
    };

    const setOptions = (id, label, opts) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `<option value="all">${label}</option>` +
                opts.map(x => `<option value="${x}">${x.length > 35 ? x.substring(0, 35) + '...' : x}</option>`).join('');
        }
    };

    setOptions('filter-loc', 'UBICACIÓN: TODAS', getOptions('ubicacion'));
    setOptions('filter-type', 'TIPO: TODOS', getOptions('tipologia'));
    setOptions('filter-year', 'AÑO: TODOS', getOptions('anioStr').sort((a, b) => parseInt(b) - parseInt(a)));
    setOptions('filter-disc', 'DISCIPLINA: TODAS', getOptions('disciplina'));
    setOptions('filter-entorno', 'ENTORNO: TODOS', getOptions('entorno'));
    setOptions('filter-phase', 'FASE: TODAS', getOptions('fase'));
    setOptions('filter-liderazgo', 'LIDERAZGO: TODOS', getOptions('actividad_principal'));
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

window.toggleTheme = function () {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    // Re-renderizar si estamos en la vista de proyectos para actualizar clases dinámicas
    if (window.lucide) window.lucide.createIcons();
};

window.setProjectView = function (mode, groupBy = null, isPopstate = false) {
    currentViewMode = mode;

    if (groupBy) {
        window.currentProjectsGrouping = groupBy;
        isTop5Active = false; // v50.50 - Reparación de navegación de retroceso (historial limpio)
        runFilter(); // RE-CALCULAR FILTROS PARA MOSTRAR TODO EL UNIVERSO
    }
    // Si entramos en grupos y no hay criterio, default a tipologia
    if (mode === 'groups' && !window.currentProjectsGrouping) window.currentProjectsGrouping = 'tipologia';

    if (!isPopstate) {
        history.pushState({ view: 'projects', subView: mode, groupBy: window.currentProjectsGrouping }, '', '#projects');
    }

    document.getElementById('list-view-wrapper').classList.toggle('hidden', mode !== 'list');
    document.getElementById('gallery-view-wrapper').classList.toggle('hidden', mode !== 'gallery');
    document.getElementById('groups-view-wrapper').classList.toggle('hidden', mode !== 'groups');

    // Actualizar estado de las flechas de navegación
    updateNavigationUI();

    // Actualizar estado visual de los botones
    const btnList = document.getElementById('btn-view-list');
    const btnGallery = document.getElementById('btn-view-gallery');
    const btnGroups = document.getElementById('btn-view-groups');

    if (btnList) {
        btnList.classList.toggle('text-cyan-400', mode === 'list');
        btnList.classList.toggle('[.light-theme_&]:text-sky-700', mode === 'list');
        btnList.classList.toggle('active', mode === 'list');
        btnList.classList.toggle('text-gray-500', mode !== 'list');
        btnList.classList.toggle('[.light-theme_&]:text-gray-600', mode !== 'list');
    }
    if (btnGallery) {
        btnGallery.classList.toggle('text-cyan-400', mode === 'gallery');
        btnGallery.classList.toggle('[.light-theme_&]:text-sky-700', mode === 'gallery');
        btnGallery.classList.toggle('active', mode === 'gallery');
        btnGallery.classList.toggle('text-gray-500', mode !== 'gallery');
        btnGallery.classList.toggle('[.light-theme_&]:text-gray-600', mode !== 'gallery');
    }
    if (btnGroups) {
        btnGroups.classList.toggle('text-cyan-400', mode === 'groups');
        btnGroups.classList.toggle('[.light-theme_&]:text-sky-700', mode === 'groups');
        btnGroups.classList.toggle('active', mode === 'groups');
        btnGroups.classList.toggle('text-gray-500', mode !== 'groups');
        btnGroups.classList.toggle('[.light-theme_&]:text-gray-600', mode !== 'groups');
    }

    renderProjects(filteredProjects);
    updateSystemStatus();
};

window.groupToGallery = function (groupValue, type, isPopstate = false) {
    const groupsWrapper = document.getElementById('groups-view-wrapper');
    if (groupsWrapper) {
        groupsWrapper.classList.add('animate-fade-out');
        groupsWrapper.style.pointerEvents = 'none'; // Evitar clics dobles
    }

    const filterIds = {
        'tipologia': 'filter-type',
        'disciplinas': 'filter-disc',
        'fase': 'filter-phase',
        'pais': 'filter-loc',
        'ano': 'filter-year',
        'entorno': 'filter-entorno',
        'liderazgo': 'filter-liderazgo'
    };

    const filterId = filterIds[type];
    if (filterId) {
        const select = document.getElementById(filterId);
        if (select) {
            const options = Array.from(select.options);
            const targetOption = options.find(opt => {
                const val = opt.value.toUpperCase();
                const text = opt.text.toUpperCase();
                const gv = groupValue.toUpperCase();

                if (val === gv || text.includes(gv)) return true;

                // Alias para USA / ESTADOS UNIDOS
                if (gv === 'USA' || gv === 'ESTADOS UNIDOS') {
                    return val.includes('USA') || val.includes('ESTADOS UNIDOS') ||
                        text.includes('USA') || text.includes('ESTADOS UNIDOS');
                }
                return false;
            });

            if (targetOption) {
                select.value = targetOption.value;
                lastNavState = { groupValue, type };
                handleFilterChange();

                if (!isPopstate) {
                    history.pushState({ view: 'projects', subView: 'gallery', groupValue, type }, '', '#projects');
                }

                setTimeout(() => {
                    window.setProjectView('gallery', null, true); // true to avoid redundant pushState
                    if (groupsWrapper) {
                        groupsWrapper.classList.remove('animate-fade-out');
                        groupsWrapper.style.pointerEvents = '';
                    }
                }, 100); // Pequeño delay para que se vea el fade out
            } else {
                select.value = groupValue;
                lastNavState = { groupValue, type };
                handleFilterChange();

                if (!isPopstate) {
                    history.pushState({ view: 'projects', subView: 'gallery', groupValue, type }, '', '#projects');
                }

                setTimeout(() => {
                    window.setProjectView('gallery', null, true); // true to avoid redundant pushState
                    if (groupsWrapper) {
                        groupsWrapper.classList.remove('animate-fade-out');
                        groupsWrapper.style.pointerEvents = '';
                    }
                }, 100);
            }
            updateNavigationUI();
        }
    }
};

window.goBackToGroups = function () {
    console.log("Navigación: Regresando a grupos y reseteando filtros...");

    // 1. Limpiar ABSOLUTAMENTE TODO
    isTop5Active = false;
    // No reseteamos lastNavState porque lo usaremos para el "Adelante"

    // Limpiar selectores por ID
    const filters = ['filter-loc', 'filter-type', 'filter-year', 'filter-disc', 'filter-entorno', 'filter-phase', 'filter-ia', 'filter-video', 'filter-liderazgo'];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 'all';
    });

    // Limpiar buscador
    const searchBar = document.getElementById('search-bar');
    if (searchBar) searchBar.value = '';

    // 2. Forzar recálculo
    runFilter();
    setProjectView('groups');

    // 3. Gestión de flechas
    updateNavigationUI();
};

window.goForwardToGallery = function () {
    if (!lastNavState) return;
    console.log("Navigación: Restaurando estado previo...", lastNavState);
    window.groupToGallery(lastNavState.groupValue, lastNavState.type);
};

window.goToProjectsHome = function () {
    console.log("Navegación: Reset a Inicio de Proyectos (Top Project Gallery)...");

    // 1. Mostrar la vista de proyectos si está oculta
    const projectsView = document.getElementById('view-projects');
    if (projectsView && projectsView.classList.contains('hidden')) {
        window.switchView('projects', true); // Pass true to indicate coming from "outside" or needing reset
    }

    // 2. Forzar estado de "Top Projects" (Top 5)
    isTop5Active = true;

    // 3. Limpiar todos los selectores de filtro y buscador
    const filters = ['filter-loc', 'filter-type', 'filter-year', 'filter-disc', 'filter-entorno', 'filter-phase', 'filter-ia', 'filter-video'];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 'all';
    });

    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.value = '';
        if (window.toggleClearSearch) window.toggleClearSearch();
    }

    // 4. Asegurar que estamos en modo GALERÍA (petición original)
    window.setProjectView('gallery');

    // 5. Borrar historial de navegación de grupos (para que el botón Home sea un reset total)
    lastNavState = null;

    // 6. Recalcular filtros y actualizar UI
    // runFilter llamará a runSort, renderProjects y updateSystemStatus
    if (typeof runFilter === 'function') {
        runFilter();
    }

    // 7. Actualizar flechas de navegación
    if (typeof updateNavigationUI === 'function') {
        updateNavigationUI();
    }

    console.log("Navegación: Home completado satisfactoriamente.");
};

// Función Centralizada para Navegación (ASEGURA VISIBILIDAD PERMANENTE)
function updateNavigationUI() {
    const btnBack = document.getElementById('btn-back-to-groups');
    const btnForward = document.getElementById('btn-forward-nav');
    if (!btnBack || !btnForward) return;

    // ELIMINAR CUALQUIER POSIBILIDAD DE QUE ESTÉN OCULTOS
    btnBack.classList.remove('hidden');
    btnForward.classList.remove('hidden');
    btnBack.style.display = ''; // Por si acaso hay inline style
    btnForward.style.display = '';

    if (currentViewMode === 'groups') {
        // En Dashboard de grupos: "Atrás" habilitado para volver a la vista global.
        btnBack.disabled = false;
        // "Adelante" se activa SOLO si hay un destino previo guardado
        btnForward.disabled = !lastNavState;
        console.info("NavUI: Modo Grupos. Adelante habilitado:", !btnForward.disabled);
    } else {
        // En Galería o Lista: "Atrás" siempre disponible para volver.
        btnBack.disabled = false;
        // "Adelante" se desactiva porque ya estás en una categoría vista
        btnForward.disabled = true;
        console.info("NavUI: Modo Galeria/Lista. Volver habilitado.");
    }

    // Refresh iconos
    if (window.lucide) window.lucide.createIcons();
}

function renderProjects(list) {
    const listContainer = document.getElementById('proyectos-list-container');
    const galleryContainer = document.getElementById('gallery-grid-container');
    const groupsContainer = document.getElementById('groups-dashboard-container');

    if (!listContainer || !galleryContainer || !groupsContainer) return;

    // MODO GRUPOS (Dashboard Dinámico)
    if (currentViewMode === 'groups') {
        const groupingKey = window.currentProjectsGrouping || 'ano';
        const grouped = {};

        list.forEach(p => {
            const rawVal = getVal(p, groupingKey);
            if (!rawVal) {
                const key = "OTROS";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(p);
                return;
            }

            // Soporte para múltiples categorías separadas por ";" o ","
            const tags = rawVal.split(/[;,]/).map(t => t.trim().toUpperCase()).filter(Boolean);

            // Eliminar duplicados en el mismo proyecto y mapear variaciones de CONFIDENCIAL
            const uniqueTags = [...new Set(tags.map(t => t.includes('CONFIDENCIAL') ? 'CONFIDENCIAL' : t))];

            uniqueTags.forEach(tag => {
                if (!grouped[tag]) grouped[tag] = [];
                // Evitar duplicar el mismo proyecto
                if (!grouped[tag].includes(p)) {
                    grouped[tag].push(p);
                }
            });
        });

        // ORDEN ALFABÉTICO DE LOS GRUPOS (Mejorado)
        const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
            return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
        });

        // Título del Dashboard de Proyectos
        const groupingLabels = {
            'tipologia': 'TIPOLOGÍA',
            'disciplinas': 'DISCIPLINAS',
            'fase': 'FASE DEL PROYECTO',
            'pais': 'PAÍS',
            'ano': 'AÑO',
            'entorno': 'ENTORNO',
            'liderazgo': 'LIDERAZGO'
        };
        const label = groupingLabels[groupingKey] || groupingKey.toUpperCase();

        groupsContainer.innerHTML = `
            <div class="p-6 w-full animate-fade-in">
                <div class="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                            <i data-lucide="layers" class="w-5 h-5 text-cyan-400"></i>
                        </div>
                        <div>
                            <h2 class="text-base font-bold text-white tracking-widest uppercase mb-1">PROYECTOS POR ${label}</h2>
                            <p class="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Dashboard de proyectos modelados clasificados por ${label}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.setProjectView('groups', 'ano')" 
                                class="px-3 py-1.5 rounded-lg border ${groupingKey === 'ano' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 text-gray-500'} hover:border-cyan-500 transition-all text-[9px] font-mono uppercase tracking-widest">AÑO</button>
                        <button onclick="window.setProjectView('groups', 'disciplinas')" 
                                class="px-3 py-1.5 rounded-lg border ${groupingKey === 'disciplinas' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 text-gray-500'} hover:border-cyan-500 transition-all text-[9px] font-mono uppercase tracking-widest">DISCIPLINAS</button>
                        <button onclick="window.setProjectView('groups', 'entorno')" 
                                class="px-3 py-1.5 rounded-lg border ${groupingKey === 'entorno' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 text-gray-500'} hover:border-cyan-500 transition-all text-[9px] font-mono uppercase tracking-widest">ENTORNO</button>
                        <button onclick="window.setProjectView('groups', 'fase')" 
                                class="px-3 py-1.5 rounded-lg border ${groupingKey === 'fase' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 text-gray-500'} hover:border-cyan-500 transition-all text-[9px] font-mono uppercase tracking-widest">FASE</button>
                        <button onclick="window.setProjectView('groups', 'liderazgo')" 
                                class="px-3 py-1.5 rounded-lg border ${groupingKey === 'liderazgo' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 text-gray-500'} hover:border-cyan-500 transition-all text-[9px] font-mono uppercase tracking-widest">LIDERAZGO</button>
                        <button onclick="window.setProjectView('groups', 'pais')" 
                                class="px-3 py-1.5 rounded-lg border ${groupingKey === 'pais' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 text-gray-500'} hover:border-cyan-500 transition-all text-[9px] font-mono uppercase tracking-widest">PAÍS</button>
                        <button onclick="window.setProjectView('groups', 'tipologia')" 
                                class="px-3 py-1.5 rounded-lg border ${groupingKey === 'tipologia' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 text-gray-500'} hover:border-cyan-500 transition-all text-[9px] font-mono uppercase tracking-widest">TIPOLOGÍA</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start pb-32">
                    ${sortedGroupKeys.map((groupKey, idx) => {
            const projectsInGroup = grouped[groupKey];
            const count = projectsInGroup.length;
            const totalProjects = list.length;
            const percentage = Math.round((count / totalProjects) * 100);

            // Mapping de Iconos por Categoría
            const groupIcons = {
                // Tipologías
                'SALUD': 'heart-pulse',
                'INDUSTRIAL': 'factory',
                'INFRAESTRUCTURA': 'tower-control',
                'VIVIENDA': 'home',
                'COMERCIAL': 'shopping-cart',
                'CORPORATIVO': 'building-2',
                'DEPORTIVO': 'trophy',
                'EDUCACIÓN': 'graduation-cap',
                'CULTURA': 'landmark',
                'URBANISMO': 'map',
                'OTROS': 'box',
                'CONFIDENCIAL': 'eye-off',
                // Fases / Tipos de intervención (Nuevos)
                'OBRA NUEVA': 'sparkles',
                'REMODELACIÓN': 'hammer',
                'SCAN TO BIM & DIGITAL TWIN': 'binary',
                'SCAN TO BIM': 'binary',
                'DIGITAL TWIN': 'cpu',
                // Disciplinas
                'ARQUITECTURA': 'palmtree',
                'ESTRUCTURAS': 'drafting-compass',
                'MEP': 'workflow',
                'MODELADO': 'cuboid',
                'COORDINACIÓN': 'users-round',
                'DISEÑO': 'palette',
                // Países
                'MÉXICO': 'flag',
                'MEXICO': 'flag',
                'ESTADOS UNIDOS': 'landmark',
                'INTERNACIONAL': 'globe',
                // Entornos
                'URBANO': 'building',
                'RURAL': 'trees',
                'VIRTUAL': 'monitor',
                'INTERIOR': 'layout-template',
                // LIDERAZGO
                'MODELADOR BIM SENIOR LIDER': 'user-check',
                'MODELADOR BIM SENIOR': 'user',
                'MODELADOR BIM LIDER': 'users',
                'MODELADOR BIM': 'user'
            };

            const icon = (groupIcons[groupKey.toUpperCase()] ||
                (/^[0-9]{4}$/.test(groupKey) ? 'calendar' : 'layers'));

            // Metadatos
            const cities = [...new Set(projectsInGroup.map(p => p.ubicacion))].filter(Boolean).sort();
            const years = projectsInGroup.map(p => parseInt(String(p.anioStr).match(/\d+/)) || 0).filter(y => y > 0).sort((a, b) => a - b);
            const yearRange = years.length > 0 ? (years[0] === years[years.length - 1] ? years[0] : `${years[0]} — ${years[years.length - 1]}`) : '—';
            const citySummary = cities.length > 3 ? `${cities.slice(0, 3).join(', ')} ...` : cities.join(', ');

            // Determinar si el grupo es confidential
            const isGroupConfidential = groupKey.toUpperCase().includes('CONFIDENCIAL') || projectsInGroup.every(p => {
                const name = String(p.nombre || '').toUpperCase();
                const img = String(p.imagen || '').toUpperCase();
                const loc = String(p.ubicacion || '').toUpperCase();
                const hasKeyword = name.includes('CONFIDENCIAL') || img.includes('CONFIDENCIAL') || loc.includes('CONFIDENCIAL');
                const noImages = !p.imagenes || p.imagenes.length === 0 || !p.imagen || img.includes('undefined');
                return hasKeyword || noImages;
            });

            return `
                        <div class="group/card relative bg-[#111827]/40 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-[#111827]/60 active:scale-[0.98] active:bg-[#111827]/80 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col gap-6 animate-stagger" 
                             style="animation-delay: ${idx * 0.05}s"
                             onclick="setTimeout(() => groupToGallery('${groupKey}', '${groupingKey}'), 80)">
                            
                            <!-- Fondo Decorativo -->
                            <div class="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] group-hover/card:bg-cyan-500/10 transition-all"></div>
                            
                            <div class="flex flex-col gap-2 relative z-10">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400 group-hover/card:bg-cyan-500 group-hover/card:text-white transition-all duration-500 shadow-sm">
                                            <i data-lucide="${icon}" class="w-4 h-4"></i>
                                        </div>
                                        <h3 class="text-lg font-bold text-white tracking-widest uppercase group-hover/card:text-cyan-400 transition-colors">${groupKey}</h3>
                                    </div>
                                    <div class="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold">
                                        ${count} PROYECTO${count !== 1 ? 'S' : ''}
                                    </div>
                                </div>
                                
                                <!-- Mini Gráfica de Impacto -->
                                <div class="mt-1">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-[8px] text-gray-500 font-mono uppercase tracking-widest">RELEVANCIA_PORTAFOLIO</span>
                                        <span class="text-[8px] text-cyan-500 font-mono font-bold">${percentage}%</span>
                                    </div>
                                    <div class="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div class="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4 relative z-10">
                                <div class="flex flex-col gap-1">
                                    <span class="text-[9px] text-gray-500 font-mono uppercase tracking-widest">Temporalidad</span>
                                    <span class="text-xs text-gray-300 font-mono font-bold">${yearRange}</span>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <span class="text-[9px] text-gray-500 font-mono uppercase tracking-widest">Ubicaciones (${cities.length})</span>
                                    <span class="text-xs text-gray-300 font-mono font-bold truncate" title="${cities.join(', ')}">${citySummary || 'N/A'}</span>
                                </div>
                            </div>

                            <div class="flex items-center justify-between mt-2 pt-4 border-t border-gray-800/30 relative z-10">
                                <span class="text-[10px] ${isGroupConfidential ? 'text-gray-500' : 'text-cyan-500/70'} font-mono uppercase tracking-[0.2em] group-hover/card:text-cyan-400 transition-colors">
                                    ${isGroupConfidential ? 'Sin galería' : 'Ver Galería'}
                                </span>
                                <i data-lucide="${isGroupConfidential ? 'eye-off' : 'arrow-right'}" class="w-4 h-4 ${isGroupConfidential ? 'text-slate-600' : 'text-slate-500'} group-hover/card:text-cyan-400 group-hover/card:translate-x-1 transition-all"></i>
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        return;
    }

    // MODO LISTA
    if (currentViewMode === 'list') {
        listContainer.innerHTML = list.map(p => {
            const pName = (p.nombre || '').toLowerCase();
            const pLoc = (p.ubicacion || '').toLowerCase();
            const isTopProject = TOP_PROJECTS_LIST.some(item =>
                pName.includes(item.name.toLowerCase()) && pLoc.includes(item.loc.toLowerCase())
            );

            // --- LÓGICA DE TRUNCADO PARA DESCRIPCIÓN ---
            const descFull = p.descripcion || '';
            const descWordCount = descFull.split(/\s+/).filter(w => w.length > 0).length;
            let displayDesc = descFull;
            let descTooltipAttrs = "";
            if (descWordCount > 20) {
                const words = descFull.split(/\s+/);
                displayDesc = words.slice(0, 18).join(' ') + `... <span class="text-cyan-500 [.light-theme_&]:text-sky-700 font-bold ml-1 cursor-help">ver más</span>`;
                descTooltipAttrs = `
                    data-tooltip-title="DESCRIPCIÓN: ${p.nombre.replace(/"/g, '&quot;')}"
                    data-tooltip-text="${descFull.replace(/"/g, '&quot;').replace(/\n/g, '<br>')}"
                    onmouseenter="window.showRoiTooltip(event)"
                    onmouseleave="window.hideRoiTooltip()"
                    onmousemove="window.moveRoiTooltip(event)"
                `;
            }

            // --- LÓGICA DE TRUNCADO PARA RETO ---
            const retoFull = p.reto || '';
            const retoWordCount = retoFull.split(/\s+/).filter(w => w.length > 0).length;
            let displayReto = retoFull;
            let retoTooltipAttrs = "";
            if (retoWordCount > 20) {
                const words = retoFull.split(/\s+/);
                displayReto = words.slice(0, 18).join(' ') + `... <span class="text-cyan-500 [.light-theme_&]:text-sky-700 font-bold ml-1 cursor-help">ver más</span>`;
                retoTooltipAttrs = `
                    data-tooltip-title="RETO: ${p.nombre.replace(/"/g, '&quot;')}"
                    data-tooltip-text="${retoFull.replace(/"/g, '&quot;').replace(/\n/g, '<br>')}"
                    onmouseenter="window.showRoiTooltip(event)"
                    onmouseleave="window.hideRoiTooltip()"
                    onmousemove="window.moveRoiTooltip(event)"
                `;
            }

            return `
            <div class="tech-list-row grid grid-cols-[40px_10%_15%_12%_8%_4%_8%_8%_6%_6%_1fr] gap-4 p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition cursor-pointer items-start text-xs font-mono font-light" onclick="if(!event.target.closest('button')) openGallery('${p.id}', event)">
                <div class="text-cyan-400 [.light-theme_&]:text-sky-800 font-bold flex items-center gap-1">
                    ${p.id}
                </div>
                <div class="font-bold text-white [.light-theme_&]:text-black whitespace-normal break-words leading-tight relative flex items-center overflow-visible">
                    ${isTopProject ? `
                        <div class="premium-pulse-container pulse-cyan mr-2 shrink-0">
                            <div class="premium-pulse-aura"></div>
                            <div class="premium-pulse-dot"></div>
                        </div>` : ''}
                    <span class="whitespace-normal">${p.nombre}</span>
                </div>
                <!-- DESCRIPCIÓN CON TRUNCADO -->
                <div class="text-gray-300 [.light-theme_&]:text-slate-600 leading-tight" ${descTooltipAttrs}>
                    ${displayDesc}
                </div>
                <!-- RETO CON TRUNCADO -->
                <div class="text-gray-300 [.light-theme_&]:text-slate-600 leading-tight" ${retoTooltipAttrs}>
                    ${displayReto}
                </div>
                <div class="text-gray-300 [.light-theme_&]:text-slate-600 leading-tight">
                    ${(() => {
                        const loc = p.ubicacion || '';
                        if (p.id === 'P07') {
                            const parts = loc.split(/,|\by\b/).map(s => s.trim()).filter(Boolean);
                            return `
                                <div>
                                    <span class="text-gray-300 [.light-theme_&]:text-slate-600">${parts[0]}${parts.length > 1 ? `... <span class="text-cyan-400 [.light-theme_&]:text-sky-700 font-bold cursor-help" 
                                         data-tooltip-title="UBICACIONES: ${p.nombre}"
                                         data-tooltip-text="${loc.replace(/"/g, '&quot;')}"
                                         onmouseenter="window.showRoiTooltip(event)"
                                         onmouseleave="window.hideRoiTooltip()"
                                         onmousemove="window.moveRoiTooltip(event)">ver más</span>` : ''}</span>
                                </div>
                            `;
                        }
                        return loc;
                    })()}
                </div>
                <div class="text-gray-400 [.light-theme_&]:text-slate-500">${p.anioStr}</div>
                <div class="text-gray-300 [.light-theme_&]:text-slate-600 leading-tight">${p.disciplinas}</div>
                <div class="text-gray-300 [.light-theme_&]:text-slate-600 leading-tight">${p.tipologia}</div>
                <div class="text-gray-300 [.light-theme_&]:text-slate-600 leading-tight">${p.entorno}</div>
                <div class="text-gray-300 [.light-theme_&]:text-slate-600 leading-tight">
                    ${(() => {
                        const isLight = document.body.classList.contains('light-theme');
                        const colorClass = isLight ? 'text-sky-950' : 'text-cyan-400';
                        return (p.fase || '').replace(/(Planeación|Ejecución|Cierre):?/g, '<br><span class="' + colorClass + ' font-bold">$1</span>').replace(/^<br>/, '');
                    })()}
                </div>
                <div class="text-cyan-400 [.light-theme_&]:text-sky-950 text-[10px] leading-tight break-words font-normal">${p.software}</div>

            </div>`;
        }).join('');
    }

    // MODO GALERÍA
    if (currentViewMode === 'gallery') {
        galleryContainer.innerHTML = list.map((p, idx) => {
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
                'P35': 3, 'P34': 6, 'P33': 4, 'P32': 5, 'P30': 5,
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
            <div class="group relative aspect-[4/3] bg-transparent rounded-lg overflow-hidden cursor-pointer border border-gray-800 hover:border-cyan-500 transition animate-stagger" 
                 style="animation-delay: ${idx * 0.02}s"
                 onclick="openGallery('${p.id}', event)">
                ${displayImage && !displayImage.includes('undefined') ? `<img src="${displayImage}" loading="lazy" alt="${p.nombre}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">` : `<div class="absolute inset-0 flex items-center justify-center bg-transparent text-gray-500 text-3xl font-bold tracking-widest opacity-30 select-none">CONFIDENCIAL</div>`}
                <div class="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent font-mono text-white flex flex-col justify-end" style="color: white !important;">
                    <div class="text-[10px] opacity-80" style="color: white !important;">${p.id}</div>
                    <div class="text-xs leading-tight my-0.5 flex items-center gap-1.5 overflow-visible">
                        ${showDot ? `
                        <div class="premium-pulse-container pulse-cyan shrink-0 mr-1">
                            <div class="premium-pulse-aura"></div>
                            <div class="premium-pulse-dot"></div>
                        </div>` : ''}
                        <span class="truncate" style="color: white !important;">${p.nombre}</span>
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

    const project = projectsData.find(p => p.id === id);
    if (project) {
        const title = "RETO / DESAFÍO";
        const detail = project.reto || "Sin descripción de reto.";
        
        const modal = document.getElementById('text-modal');
        if (modal) {
            document.getElementById('text-modal-title').innerText = title;
            document.getElementById('text-modal-content').innerHTML = detail.replace(/\n/g, '<br>');
            
            // Apertura suave
            modal.classList.remove('hidden');
            const modalContent = modal.querySelector('div');
            
            void modal.offsetWidth;
            
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
            
            if (modalContent) {
                modalContent.classList.remove('opacity-0', 'scale-95');
                modalContent.classList.add('opacity-100', 'scale-100');
            }
        }
    }
};

// TOOLTIPS (Reto Inline)
// GLOBAL TOOLTIP LOGIC
let globalTooltipEl = null;
let globalTooltipTimeout = null;

function initGlobalTooltip() {
    if (document.getElementById('global-reto-tooltip')) {
        globalTooltipEl = document.getElementById('global-reto-tooltip');
        // Asegurar que comience oculto y con las clases base correctas aunque ya exista
        globalTooltipEl.classList.add('hidden', 'opacity-0', 'scale-95');
        globalTooltipEl.classList.remove('opacity-100', 'scale-100');
        return;
    }

    globalTooltipEl = document.createElement('div');
    globalTooltipEl.id = 'global-reto-tooltip';
    // Inicializar con opacidad 0 y escala reducida para transición suave
    // IMPORTANTE: No usar style.display = 'flex' inline ya que anula la clase 'hidden' de Tailwind
    globalTooltipEl.className = `fixed hidden z-[9999] p-4 rounded-xl shadow-2xl roi-tooltip pointer-events-none opacity-0 scale-95 transition-all duration-300 flex flex-col`;
    
    globalTooltipEl.style.width = 'auto'; // Ajustar al contenido inicialmente
    globalTooltipEl.style.maxWidth = '90vw';

    document.body.appendChild(globalTooltipEl);
}

window.hideGlobalTooltip = function (immediate = false) {
    if (globalTooltipEl) {
        if (globalTooltipTimeout) {
            clearTimeout(globalTooltipTimeout);
            globalTooltipTimeout = null;
        }

        if (immediate) {
            globalTooltipEl.classList.add('hidden', 'opacity-0', 'scale-95');
            globalTooltipEl.classList.remove('opacity-100', 'scale-100');
            globalTooltipEl.style.transform = ''; // Limpiar transformaciones
            return;
        }
        
        globalTooltipEl.classList.remove('opacity-100', 'scale-100');
        globalTooltipEl.classList.add('opacity-0', 'scale-95');
        
        globalTooltipTimeout = setTimeout(() => {
            if (globalTooltipEl.classList.contains('opacity-0')) {
                globalTooltipEl.classList.add('hidden');
                globalTooltipEl.style.transform = ''; // Limpiar transformaciones
                // Restaurar contenido orgánico por defecto si es necesario (para el tooltip de colaboración)
                globalTooltipEl.innerHTML = `
                    <div class="flex flex-col items-center justify-start h-full text-center text-gray-500 text-xs font-mono tracking-widest uppercase mt-2">
                        <i data-lucide="mouse-pointer-click" class="w-4 h-4 mb-1.5 text-cyan-400 animate-pulse"></i>
                        Pasa el cursor sobre un rol para ver la información
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
            }
        }, 300);
    }
};

window.showRetoTooltip = function (btn, event, projectId) {
    if (!globalTooltipEl) initGlobalTooltip();
    if (globalTooltipTimeout) {
        clearTimeout(globalTooltipTimeout);
        globalTooltipTimeout = null;
    }

    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    const isLight = document.body.classList.contains('light-theme');
    const colorClass = isLight ? 'text-sky-950' : 'text-cyan-400';

    let cleanReto = (project.reto || '').replace(/\r?\n|<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
    let retoFormatted = cleanReto.replace(/(Planeación|Ejecución|Cierre):?/g, '<br><span class="' + colorClass + ' font-bold">$1</span>').replace(/^<br>/, '').trim();

    // Content
    globalTooltipEl.innerHTML = `<div class="leading-tight font-normal text-xs font-mono px-1 flex-1 text-center">${retoFormatted}</div>`;

    // Cálculo dinámico de ancho para proporción 4:3 (Reto)
    const charCount = (project.reto || '').length;
    const idealWidth = Math.max(340, Math.min(650, 220 + charCount * 0.5));

    // Resetear estilos base
    globalTooltipEl.style.width = `${idealWidth}px`;
    globalTooltipEl.style.minWidth = '200px';
    globalTooltipEl.style.maxHeight = '85vh';
    globalTooltipEl.style.overflowY = 'auto';
    globalTooltipEl.style.pointerEvents = 'none';

    globalTooltipEl.classList.remove('hidden', 'max-w-sm', 'max-w-2xl', 'max-w-3xl');
    globalTooltipEl.classList.add('flex', 'flex-col', 'p-6'); 

    // Positioning
    const rect = btn.getBoundingClientRect();
    const tooltipRect = globalTooltipEl.getBoundingClientRect();

    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 15;
    if (top < 15) top = rect.bottom + 15;
    if (top + tooltipRect.height > window.innerHeight - 15) top = Math.max(15, (window.innerHeight - tooltipRect.height) / 2);
    if (left < 15) left = 15;
    if (left + tooltipRect.width > window.innerWidth - 15) left = window.innerWidth - tooltipRect.width - 15;

    globalTooltipEl.style.top = `${top}px`;
    globalTooltipEl.style.left = `${left}px`;
    globalTooltipEl.style.transform = '';

    requestAnimationFrame(() => {
        globalTooltipEl.classList.remove('opacity-0', 'scale-95');
        globalTooltipEl.classList.add('opacity-100', 'scale-100');
    });
};

window.hideRetoTooltip = function () {
    window.hideGlobalTooltip();
};

window.showUbicacionTooltip = function (btn, event, projectId) {
    if (!globalTooltipEl) initGlobalTooltip();
    if (globalTooltipTimeout) {
        clearTimeout(globalTooltipTimeout);
        globalTooltipTimeout = null;
    }

    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    // Content
    globalTooltipEl.innerHTML = `
        <div class="font-sans font-bold mb-2 border-b pb-2 uppercase tracking-wider text-xs border-gray-700 [.light-theme_&]:border-gray-200 shrink-0 tooltip-title text-center w-full">
            UBICACIÓN
        </div>
        <div class="leading-relaxed font-normal text-xs font-mono pr-1 flex-1 text-center w-full">
           ${project.ubicacion || ''}
        </div>
    `;

    globalTooltipEl.style.width = '300px';
    globalTooltipEl.style.pointerEvents = 'none';

    globalTooltipEl.classList.remove('hidden', 'max-w-3xl', 'max-w-2xl');
    globalTooltipEl.classList.add('flex', 'flex-col', 'p-6');
    globalTooltipEl.style.width = 'max-content'; // Ubicación suele ser corto, ajustar al texto
    globalTooltipEl.style.minWidth = '200px';

    const rect = btn.getBoundingClientRect();
    const tooltipRect = globalTooltipEl.getBoundingClientRect();

    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 15;
    if (top < 15) top = rect.bottom + 15;
    if (top + tooltipRect.height > window.innerHeight - 15) top = Math.max(15, (window.innerHeight - tooltipRect.height) / 2);
    if (left < 15) left = 15;
    if (left + tooltipRect.width > window.innerWidth - 15) left = window.innerWidth - tooltipRect.width - 15;

    globalTooltipEl.style.top = `${top}px`;
    globalTooltipEl.style.left = `${left}px`;
    globalTooltipEl.style.transform = '';

    requestAnimationFrame(() => {
        globalTooltipEl.classList.remove('opacity-0', 'scale-95');
        globalTooltipEl.classList.add('opacity-100', 'scale-100');
    });
};

window.hideUbicacionTooltip = function () {
    window.hideGlobalTooltip();
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initGlobalTooltip);

window.toggleModalInfo = function () {
    const bg = document.getElementById('modal-info-bg');
    const content = document.getElementById('modal-info-content');
    const icon = document.getElementById('icon-toggle-modal-info');
    if (!bg || !content || !icon) return;

    const isCollapsed = bg.classList.contains('max-h-0');

    if (isCollapsed) {
        // Accion: MAXIMIZAR
        bg.classList.remove('max-h-0', 'border-transparent', 'opacity-0', 'invisible');
        bg.classList.add('max-h-[500px]', 'border-white/5', 'opacity-100', 'visible');
        content.classList.remove('opacity-0', 'translate-y-4');
        content.classList.add('opacity-100', 'translate-y-0');
        icon.style.transform = 'rotate(0deg)'; // Apunta abajo
    } else {
        // Accion: MINIMIZAR
        bg.classList.remove('max-h-[500px]', 'border-white/5', 'opacity-100', 'visible');
        bg.classList.add('max-h-0', 'border-transparent', 'opacity-0', 'invisible');
        content.classList.remove('opacity-100', 'translate-y-0');
        content.classList.add('opacity-0', 'translate-y-4');
        icon.style.transform = 'rotate(180deg)'; // Apunta arriba (para expandir)
    }
};

window.closeTextModal = function () { 
    const modal = document.getElementById('text-modal');
    if (!modal) return;
    
    // Cierre suave
    const modalContent = modal.querySelector('div');
    if (modalContent) {
        modalContent.classList.add('opacity-0', 'scale-95');
        modalContent.classList.remove('opacity-100', 'scale-100');
    }
    modal.classList.add('opacity-0');
    modal.classList.remove('opacity-100');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

let currentGalleryView = 'default';

window.setGalleryViewMode = function (mode) {
    currentGalleryView = mode;

    // Actualizar estados visuales de los botones
    const btns = ['default', 'list', 'grid'];
    btns.forEach(b => {
        const el = document.getElementById(`btn-gallery-view-${b}`);
        if (el) {
            if (b === mode) {
                // Estado ACTIVO
                el.classList.remove('text-gray-400', 'text-gray-500');
                el.classList.add('text-cyan-400', '[.light-theme_&]:text-sky-700');
            } else {
                // Estado INACTIVO
                el.classList.remove('text-cyan-400', '[.light-theme_&]:text-sky-700');
                el.classList.add('text-gray-500');
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

window.aiNoticeSeen = false;

window.openGallery = function (id, event) {
    const idx = filteredProjects.findIndex(p => p.id === id);
    if (idx === -1) return;
    currentProjectIndex = idx;

    // Al abrir un proyecto, cerramos automáticamente el aviso de IA/Top Projects si está presente
    window.closeAINotice();

    // Limpiar imagen previa inmediatamente para evitar parpadeo (ghosting)
    const imgTag = document.getElementById('modal-img-tag');
    const confTag = document.getElementById('modal-confidencial');
    if (imgTag) { imgTag.src = ''; imgTag.classList.add('hidden'); }
    if (confTag) confTag.classList.add('hidden');

    // Al abrir proyecto, empezamos en la primera imagen
    currentImageIndex = 0;
    setGalleryViewMode('default');
    updateModalContent();

    const modal = document.getElementById('gallery-modal');
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.add('modal-anim-entering');

    // REVELADO CONTROLADO: Ahora que el modal ya está cubriendo la pantalla (o entrando)
    // podemos mostrar el fondo (view-projects) suavemente por si el usuario cierra el modal.
    const projectsView = document.getElementById('view-projects');
    if (projectsView) {
        projectsView.classList.add('revealed');
    }
};

window.closeAINotice = function () {
    const aiPopup = document.getElementById('ai-notice-popup');
    window.aiNoticeSeen = true; // Marcar como visto para que no aparezca de nuevo al navegar
    clearTimeout(window.aiNoticeTimeout); // Detener timer de auto-cierre

    if (aiPopup && !aiPopup.classList.contains('hidden')) {
        aiPopup.classList.add('ai-popup-hidden');
        setTimeout(() => {
            aiPopup.classList.add('hidden');
        }, 500);
    }
};

window.closeGallery = () => {
    const modal = document.getElementById('gallery-modal');
    if (!modal) return;
    
    // Cierre suave
    modal.classList.remove('modal-anim-entering');
    modal.classList.add('modal-anim-exiting');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('modal-anim-exiting');
    }, 300);

    const videoEl = document.getElementById('modal-video-element');
    if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
    }

    // Limpiar medios para el próximo uso
    const imgTag = document.getElementById('modal-img-tag');
    const confTag = document.getElementById('modal-confidencial');
    if (imgTag) {
        imgTag.src = '';
        imgTag.classList.add('hidden');
        imgTag.classList.remove('media-visible');
    }
    if (confTag) confTag.classList.add('hidden');
};

window.navigateProject = function (direction) {
    if (currentProjectIndex === -1) return;
    let newIndex = currentProjectIndex + direction;
    if (newIndex < 0) newIndex = filteredProjects.length - 1;
    if (newIndex >= filteredProjects.length) newIndex = 0;
    currentProjectIndex = newIndex;

    // Reset imagen al cambiar proyecto
    currentImageIndex = 0;

    // Limpiar imagen previa inmediatamente
    const imgTag = document.getElementById('modal-img-tag');
    const confTag = document.getElementById('modal-confidencial');
    if (imgTag) { imgTag.src = ''; imgTag.classList.add('hidden'); }
    if (confTag) confTag.classList.add('hidden');

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
    if (!p) return;

    // 1. ACTUALIZAR METADATOS BÁSICOS
    document.getElementById('modal-project-id').innerText = `${p.id} / ${filteredProjects.length}`;
    document.getElementById('modal-project-name').innerText = p.nombre;

    const detailsContainer = document.getElementById('modal-project-details');
    let locationDisplay = p.ubicacion;
    if (p.id === 'P07' || p.id === 'P08' || (locationDisplay && locationDisplay.length > 50)) {
        locationDisplay = "Múltiples Sedes";
    }

    const mediaContainer = document.getElementById('gallery-backdrop');
    let videoEl = document.getElementById('modal-video-element');
    const counterEl = document.getElementById('modal-image-counter');

    const currentSrc = (p.imagenes && p.imagenes.length > 0) ? p.imagenes[currentImageIndex] : p.imagen;
    const isVideo = (currentSrc || "").toLowerCase().match(/\.(mp4|webm|mov|mkv)$/);

    // Extraer nombre del espacio
    let spaceName = "";
    if (currentSrc && !currentSrc.includes('undefined')) {
        const filename = currentSrc.split('/').pop();
        spaceName = filename.split('.')[0].replace(/_/g, ' ');
    }
    let spaceNameHtml = (spaceName && currentGalleryView === 'default') ? `<span class="ml-2 text-cyan-400 [.light-theme_&]:text-[#0284c7]">| ${spaceName}</span>` : "";

    detailsContainer.innerHTML = `${locationDisplay} <span class="text-cyan-400/50 [.light-theme_&]:text-gray-500 mx-1">|</span> ${p.anioStr} <span class="text-cyan-400/50 [.light-theme_&]:text-gray-500 mx-1">|</span> ${p.tipologia} <span class="text-cyan-400/50 [.light-theme_&]:text-gray-500 mx-1">|</span> ${p.entorno} <span class="text-cyan-400/50 [.light-theme_&]:text-gray-500 mx-1">|</span> ${p.fase} ${spaceNameHtml}`;

    // 2. GESTIÓN DE TRANSICIÓN DE MEDIOS
    const imgTag = document.getElementById('modal-img-tag');
    const confTag = document.getElementById('modal-confidencial');
    const isFirstLoad = (!imgTag || !imgTag.src) && (!videoEl || !videoEl.src);

    if (!isFirstLoad) {
        if (imgTag) imgTag.classList.remove('media-visible');
        if (videoEl) videoEl.classList.remove('media-visible');
        if (imgTag) imgTag.classList.add('media-transitioning');
        if (videoEl) videoEl.classList.add('media-transitioning');
    }

    setTimeout(() => {
        if (!videoEl) {
            videoEl = document.createElement('video');
            videoEl.id = 'modal-video-element';
            videoEl.className = 'w-full h-full object-contain hidden pointer-events-auto transition-opacity duration-500';
            videoEl.controls = true; videoEl.autoplay = true; videoEl.muted = true; videoEl.loop = true;
            mediaContainer.appendChild(videoEl);
        }

        if (isVideo) {
            if (imgTag) imgTag.classList.add('hidden');
            if (confTag) confTag.classList.add('hidden');
            videoEl.classList.remove('hidden');
            if (videoEl.src !== currentSrc) {
                videoEl.src = currentSrc;
                videoEl.load();
            }
            videoEl.play().catch(e => console.log("Auto-play prevented:", e));
        } else {
            videoEl.classList.add('hidden');
            videoEl.pause();

            if (currentSrc && currentSrc !== 'undefined') {
                confTag.classList.add('hidden');
                imgTag.classList.remove('hidden');
                imgTag.src = currentSrc;
            } else {
                imgTag.classList.add('hidden');
                confTag.classList.remove('hidden');
            }
        }

        if (counterEl) counterEl.innerText = p.imagenes ? `${currentImageIndex + 1} / ${p.imagenes.length}` : "1 / 1";

        // Fade-in lento
        requestAnimationFrame(() => {
            if (imgTag) imgTag.classList.remove('media-transitioning');
            if (videoEl) videoEl.classList.remove('media-transitioning');
            if (imgTag) imgTag.classList.add('media-visible');
            if (videoEl) videoEl.classList.add('media-visible');
        });
    }, isFirstLoad ? 0 : 220);

    // 3. ACTUALIZAR TEXTOS (DESCRIPCIÓN Y RETO)
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
        // Formatear fases en negrita para el modo claro/oscuro
        const isLightReto = document.body.classList.contains('light-theme');
        const phaseColorClass = isLightReto ? 'text-sky-800' : 'text-cyan-400';
        retoBase = retoBase.replace(/(Planeaci[oó]n|Ejecuci[oó]n|Cierre):/g, `<br><strong class="${phaseColorClass} font-bold">$1:</strong>`);
        retoBase = retoBase.replace(/^<br>/, '');

        let extraHtml = extraInfo.length > 0 ? `<span class="text-cyan-400 [.light-theme_&]:text-sky-950 ml-1 opacity-100">| ${extraInfo.join(' | ')}</span>` : '';

        if (retoBase !== '' || extraHtml !== '') {
            retoEl.querySelector('.content').innerHTML = `${retoBase} ${extraHtml}`;
            retoEl.classList.remove('hidden');
            hasText = true;
        } else {
            retoEl.classList.add('hidden');
        }

        // Mostrar bloque de texto solo si hay contenido
        const hasContent = hasText || extraHtml !== '';
        if (textBlock) {
            // El contenedor padre debe estar visible siempre que haya contenido
            textBlock.classList.toggle('hidden', !hasContent);
            textBlock.classList.toggle('opacity-0', !hasContent);
        }

        // Lógica de Minimizado/Maximizado por defecto según imagen
        const bg = document.getElementById('modal-info-bg');
        const content = document.getElementById('modal-info-content');
        const icon = document.getElementById('icon-toggle-modal-info');

        if (bg && content && icon) {
            // Sincronizar estado inicial segun imagen
            if (currentImageIndex === 0) {
                // Maximizado por defecto en la primera imagen
                bg.classList.remove('max-h-0', 'border-transparent', 'opacity-0', 'invisible');
                bg.classList.add('max-h-[500px]', 'border-white/5', 'opacity-100', 'visible');
                content.classList.remove('opacity-0', 'translate-y-4');
                content.classList.add('opacity-100', 'translate-y-0');
                icon.style.transform = 'rotate(0deg)';
            } else {
                // Minimizado por defecto en las demás
                bg.classList.remove('max-h-[500px]', 'border-white/5', 'opacity-100', 'visible');
                bg.classList.add('max-h-0', 'border-transparent', 'opacity-0', 'invisible');
                content.classList.remove('opacity-100', 'translate-y-0');
                content.classList.add('opacity-0', 'translate-y-4');
                icon.style.transform = 'rotate(180deg)';
            }
        }
    }

    // 4. ACTUALIZAR VISTAS ALTERNATIVAS
    if (currentGalleryView === 'list') renderGalleryListView(p);
    if (currentGalleryView === 'grid') renderGalleryGridView(p);

    if (window.lucide) window.lucide.createIcons();
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
    const counterHtml = `<div class="w-full text-center text-cyan-400 [.light-theme_&]:text-slate-700 font-mono text-[10px] md:text-xs uppercase tracking-widest bg-[#1a212c] [.light-theme_&]:bg-[#f8fafc] py-2 border-b border-cyan-900 [.light-theme_&]:border-slate-300 shrink-0 z-10">${totalImages} IMÁGENES | ${totalVideos} VIDEOS</div>`;

    container.innerHTML = counterHtml + `<div class="overflow-y-auto h-full p-2 custom-scrollbar flex-1 w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 w-full pb-2">` +
        p.imagenes.map((src, idx) => {
            const filename = src.split('/').pop() || 'Recurso';
            const isVideo = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');
            const icon = isVideo ? 'video' : 'image';
            const iconColor = isVideo ? 'text-purple-400 group-hover:text-purple-300 [.light-theme_&]:text-purple-700' : 'text-cyan-400 group-hover:text-cyan-300 [.light-theme_&]:text-sky-700';

            return `
            <div class="flex items-center justify-between py-1.5 px-3 hover:bg-white/5 [.light-theme_&]:hover:bg-slate-200 border border-transparent hover:border-gray-700 [.light-theme_&]:hover:border-slate-400 rounded cursor-pointer transition group" onclick="jumpToGalleryImage(${idx})">
                <div class="flex items-center gap-3 overflow-hidden w-full">
                    <div class="w-6 h-6 shrink-0 bg-gray-900 border border-gray-800 [.light-theme_&]:bg-white [.light-theme_&]:border-slate-300 rounded flex items-center justify-center ${iconColor} border-cyan-900/50 transition">
                        <i data-lucide="${icon}" class="w-3 h-3"></i>
                    </div>
                    <span class="text-gray-300 [.light-theme_&]:text-slate-600 font-mono text-[11px] truncate group-hover:text-white [.light-theme_&]:group-hover:text-slate-900 transition flex-1">${filename}</span>
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
    const counterHtml = `<div class="col-span-full w-full text-center text-cyan-400 [.light-theme_&]:text-slate-700 font-mono text-[10px] md:text-xs uppercase tracking-widest bg-[#0f141a]/95 [.light-theme_&]:bg-white/95 backdrop-blur-sm py-2 px-4 border-b border-gray-800/80 [.light-theme_&]:border-slate-200 shadow-xl mb-2 sticky top-0 z-20 rounded-lg">${totalImages} IMÁGENES | ${totalVideos} VIDEOS</div>`;

    // Ajustamos la cuadrícula expandida
    container.innerHTML = `<div class="w-full h-full overflow-y-auto custom-scrollbar pr-4 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-max content-start relative">` +
        counterHtml +
        p.imagenes.map((src, idx) => {
            const isVideo = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');
            const filename = src.split('/').pop() || '';
            const spaceName = filename.split('.')[0].replace(/_/g, ' ') || '';

            if (isVideo) {
                return `
                <div class="group relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500 cursor-pointer transition hover:scale-105" onclick="jumpToGalleryImage(${idx})">
                    <video src="${src}#t=0.1" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" preload="metadata" muted></video>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div class="w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white/80 group-hover:text-cyan-400 group-hover:scale-110 transition shadow-lg">
                            <i data-lucide="play" class="w-5 h-5 ml-0.5"></i>
                        </div>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-3 pt-6 bg-gradient-to-t from-black/90 to-transparent flex items-end pointer-events-none opacity-80 group-hover:opacity-100 transition">
                        <span class="text-white font-mono text-[9px] md:text-xs truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style="color: white !important;">${spaceName}</span>
                    </div>
                </div>
            `;
            } else {
                return `
                <div class="group relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500 cursor-pointer transition hover:scale-105" onclick="jumpToGalleryImage(${idx})">
                    <div class="w-full h-full bg-cover bg-center opacity-80 group-hover:opacity-100 transition" style="background-image: url('${src}')"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-3 pt-6 bg-gradient-to-t from-black/90 to-transparent flex items-end pointer-events-none opacity-80 group-hover:opacity-100 transition">
                        <span class="text-white font-mono text-[9px] md:text-xs truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style="color: white !important;">${spaceName}</span>
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
        particle.className = `absolute rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)] opacity-0 pointer-events-none force-light-text`;

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

        // Mapa estelar de posiciones seguras para evitar colisiones (Layout en constelación)
        const starMap = [
            { left: 15, top: 20 }, // Superior Izquierda
            { left: 80, top: 25 }, // Superior Derecha
            { left: 25, top: 75 }, // Inferior Izquierda
            { left: 75, top: 70 }, // Inferior Derecha
            { left: 50, top: 35 }, // Centro Arriba
            { left: 40, top: 85 }, // Centro Abajo
            { left: 10, top: 45 }, // Centro Izquierda
            { left: 90, top: 55 }  // Centro Derecha
        ];

        let mapPoint = starMap[i % starMap.length];

        // Agregar micro variación aleatoria (±2%) para que no se vea robotizado si hay muchos anillos
        let left = mapPoint.left + (Math.random() * 4 - 2);
        let top = mapPoint.top + (Math.random() * 4 - 2);

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

            <!-- Contenido de Texto Flotante (Visible solo al Expandir) -->
            <div class="orb-expanded-content absolute top-[130%] left-1/2 -translate-x-1/2 w-[600px] max-w-[90vw] text-center z-30 pointer-events-auto flex flex-col items-center gap-3 text-shadow-md pb-8">
                <div class="relative w-full flex justify-center items-center">
                    <h3 class="text-white font-bold text-lg md:text-xl tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        ${title}
                    </h3>
                    <button class="close-orb-btn absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-2">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium drop-shadow-md px-4 text-center">
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
window.goToProjectsHome = window.goToProjectsHome;

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

// El listener DOMContentLoaded principal está al inicio del archivo

// ==========================================================================
// OBSERVADOR DE TEMA PARA REDIBUJO DINÁMICO (SVG COLABORACIÓN)
// ==========================================================================
const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            const documentIsLight = document.documentElement.classList.contains('light-theme') || document.body.classList.contains('light-theme');

            // Re-evaluar si repintamos el SVG de Colaboración
            if (window.collabAutoNavStopped && window.drawCollabLine) {
                // Hay alguien "pausado" activamente con el tooltip abierto, 
                // pero no sabemos a ciencia cierta quien es. 
                // En vez de mantener un color obsoleto, limpiamos la línea suavemente para 
                // que la vuelva a disparar al mover el cursor y se dibuje en el nuevo tema.
                window.clearCollabLine();
            }
        }
    });
});

themeObserver.observe(document.documentElement, { attributes: true });
themeObserver.observe(document.body, { attributes: true });

// Interceptar navegación al CV para salida suave
document.addEventListener('click', (e) => {
    const btn = e.target.closest('#nav-cv');
    if (btn) {
        const href = btn.getAttribute('href');
        if (href) {
            e.preventDefault();
            document.body.classList.add('page-fade-out');
            setTimeout(() => { window.location.href = href; }, 400);
        }
    }
});














// Listener para navegacin nativa del navegador y botones Atrs/Adelante
window.addEventListener('popstate', function (event) {
    if (event.state && event.state.view) {
        if (event.state.view === 'home') {
            window.goHome(true);
        } else if (event.state.view === 'projects') {
            // Manejar sub-vistas de proyectos
            if (event.state.subView === 'gallery' && event.state.groupValue) {
                // Restaurar filtrado por grupo
                window.switchView('projects', false, true, true);
                window.groupToGallery(event.state.groupValue, event.state.type, true);
            } else if (event.state.subView === 'groups') {
                // Al volver a GRUPOS, debemos LIMPIAR filtros para ver todos los grupos
                window.switchView('projects', false, true, true);

                // Limpiar filtros (silenciosamente sin disparar runFilter dos veces innecesariamente)
                const filters = ['filter-loc', 'filter-type', 'filter-year', 'filter-disc', 'filter-entorno', 'filter-phase', 'filter-ia', 'filter-video', 'filter-liderazgo'];
                filters.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = 'all';
                });
                const searchBar = document.getElementById('search-bar');
                if (searchBar) searchBar.value = '';

                window.setProjectView('groups', event.state.groupBy || null, true);
            } else if (event.state.subView) {
                // Restaurar vista base (gallery base, list)
                window.switchView('projects', false, true, true);
                window.setProjectView(event.state.subView, event.state.groupBy || null, true);
            } else {
                window.switchView(event.state.view, false, true, true);
            }
        } else {
            window.switchView(event.state.view, false, true, true);
        }
    } else {
        // Fallback al home si no hay estado
        window.goHome(true);
    }
});

window.scrollCerts = function(containerId, direction) {
    const container = document.getElementById(containerId + '-inner');
    if (!container) return;
    if (container._pauseAutoScroll) container._pauseAutoScroll();
    const scrollAmount = 300 * direction;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    if (container._resumeAutoScroll) {
        clearTimeout(container._resumeTimeout);
        container._resumeTimeout = setTimeout(() => { container._resumeAutoScroll(); }, 2000);
    }
};

window.initCertAutoScroll = function(containerId) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;
    if (container._autoScrollActive) return;
    container._autoScrollActive = true;
    let isPaused = false;
    let scrollPos = container.scrollLeft;
    const scrollSpeed = 0.5;
    const step = () => {
        if (!isPaused) {
            scrollPos += scrollSpeed;
            if (scrollPos >= (container.scrollWidth - container.clientWidth)) scrollPos = 0;
            container.scrollLeft = scrollPos;
        }
        container._animationFrame = requestAnimationFrame(step);
    };
    container._stopAutoScroll = () => { cancelAnimationFrame(container._animationFrame); container._autoScrollActive = false; };
    container._pauseAutoScroll = () => { isPaused = true; };
    container._resumeAutoScroll = () => { scrollPos = container.scrollLeft; isPaused = false; };
    container.addEventListener('mouseenter', () => { isPaused = true; clearTimeout(container._resumeTimeout); });
    container.addEventListener('mouseleave', () => { container._resumeTimeout = setTimeout(() => { scrollPos = container.scrollLeft; isPaused = false; }, 2000); });
    container._animationFrame = requestAnimationFrame(step);
};

window.switchEduView = function(view) {
    const gallery = document.getElementById('global-edu-prev-badges');
    const list = document.getElementById('global-edu-list');
    const btnGallery = document.getElementById('btn-view-gallery');
    const btnList = document.getElementById('btn-view-list');

    if (view === 'gallery') {
        if (gallery) gallery.classList.remove('hidden');
        if (list) list.classList.add('hidden');
        if (btnGallery) {
            btnGallery.classList.add('text-cyan-400', '[.light-theme_&]:text-sky-900', 'active-view');
            btnGallery.classList.remove('text-gray-400');
        }
        if (btnList) {
            btnList.classList.remove('text-cyan-400', '[.light-theme_&]:text-sky-900', 'active-view');
            btnList.classList.add('text-gray-400');
        }
    } else {
        if (gallery) gallery.classList.add('hidden');
        if (list) list.classList.remove('hidden');
        if (btnGallery) {
            btnGallery.classList.remove('text-cyan-400', '[.light-theme_&]:text-sky-900', 'active-view');
            btnGallery.classList.add('text-gray-400');
        }
        if (btnList) {
            btnList.classList.add('text-cyan-400', '[.light-theme_&]:text-sky-900', 'active-view');
            btnList.classList.remove('text-gray-400');
        }
    }
    if (window.lucide) window.lucide.createIcons();
};

// PDF Download Logic
window.openPdfModal = () => {
    const modal = document.getElementById('pdf-modal');
    if (modal) modal.classList.remove('hidden');
};

window.closePdfModal = () => {
    const modal = document.getElementById('pdf-modal');
    if (modal) modal.classList.add('hidden');
};

window.downloadPdf = async (doc, type) => {
    const documents = {
        'cv': {
            'light': 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/CV/CV%20-%20Said%20Herrera_light.pdf',
            'dark': 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/CV/CV%20-%20Said%20Herrera_dark.pdf',
            'filename': 'CV_Said_Herrera'
        },
        'portfolio': {
            'light': 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Portafolio_Resumido.pdf',
            'dark': 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Portafolio_Resumido.pdf',
            'filename': 'Portafolio_Said_Herrera'
        }
    };

    const fetchAndDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Fetch download failed, falling back to open:', err);
            window.open(url, '_blank');
        }
    };

    if (doc === 'all') {
        const docsToDownload = [
            { url: documents.cv.light, name: 'CV_Said_Herrera_Claro.pdf' },
            { url: documents.cv.dark, name: 'CV_Said_Herrera_Oscuro.pdf' },
            { url: documents.portfolio.light, name: 'Portafolio_Said_Herrera_Claro.pdf' },
            { url: documents.portfolio.dark, name: 'Portafolio_Said_Herrera_Oscuro.pdf' }
        ];

        for (let i = 0; i < docsToDownload.length; i++) {
            const d = docsToDownload[i];
            await fetchAndDownload(d.url, d.name);
            if (i < docsToDownload.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 600));
            }
        }
        closePdfModal();
        return;
    }

    const docConfig = documents[doc];
    if (!docConfig) return;

    if (type === 'both') {
        await fetchAndDownload(docConfig.light, `${docConfig.filename}_Claro.pdf`);
        setTimeout(() => fetchAndDownload(docConfig.dark, `${docConfig.filename}_Oscuro.pdf`), 600);
    } else {
        const url = docConfig[type];
        const fileExt = type === 'light' ? 'Claro' : 'Oscuro';
        await fetchAndDownload(url, `${docConfig.filename}_${fileExt}.pdf`);
    }

    closePdfModal();
};

function getThemeParam() {
    return document.body.classList.contains('light-theme') ? 'theme=light' : 'theme=dark';
}

/* =========================================
   CERTIFICATE MODAL LOGIC
   ========================================= */
window.openCertModal = function(url, title = "") {
    const modal = document.getElementById('cert-modal');
    const modalImg = document.getElementById('cert-modal-img');
    const content = document.getElementById('cert-modal-content');
    const modalTitle = document.getElementById('cert-modal-title');

    if (!modal || !modalImg || !content) return;

    // Handle GitHub raw image conversion
    if (url && url.includes('github.com') && url.includes('/blob/')) {
        url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }

    modalImg.src = url;
    if (modalTitle) modalTitle.innerText = title;

    modal.classList.remove('hidden');
    
    // Forzar reflow
    void modal.offsetWidth;

    // Activar transiciones de opacidad y escala
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
    content.classList.remove('opacity-0', 'scale-95');
    content.classList.add('opacity-100', 'scale-100');

    if (window.lucide) lucide.createIcons();
};

window.closeCertModal = function() {
    const modal = document.getElementById('cert-modal');
    const content = document.getElementById('cert-modal-content');
    
    if (!modal || !content) return;

    // Animación de salida
    modal.classList.add('opacity-0');
    content.classList.remove('opacity-100', 'scale-100');
    content.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restaurar scroll
    }, 300);
};

// Asegurar que Lucide se ejecute al final del documento si es necesario
if (window.lucide) window.lucide.createIcons();


