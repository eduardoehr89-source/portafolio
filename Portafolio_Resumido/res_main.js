/**
 * Script para el Portafolio Resumido (Versión Imprimible A4)
 * Carga datos dinámicamente desde el CSV y la base de datos de imágenes.
 */

const timestamp = `v_forced_${Date.now()}`;
const URL_PROJECTS = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Proyectos_portafolio.csv?t=${timestamp}`;
const URL_EDUCATION = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/CV/Formaci%C3%B3n%20acad%C3%A9mica_cv.csv?t=${timestamp}`;
const URL_ROI_PROY = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/ROI_Scripts_portafolio%20resumido.txt?t=${timestamp}`;
const CLOUD_ASSET_BASE = 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/';
const CLOUD_BADGE_BASE = 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/CV/insignias/';
const URL_SUMMARY = `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/main/Resumen_portafolio.csv?t=${timestamp}`;

const TOP_PROJECTS_NAMES = [
    "Barrio Santa Lucía",
    "Tren Ligero",
    "Puentes Periféricos",
    "Hospital General de Zona",
    "Unidad de Medicina Familiar",
    "Central de Mezclas",
    "Tawra",
    "Salina Cruz"
];

const PORTFOLIO_URL = "https://linkedin.com/in/eduardoehr/";

document.addEventListener('DOMContentLoaded', () => {
    init();
    initTheme();
});

// Helper para Animación de Contadores Numéricos
function animateCounters() {
    const counters = document.querySelectorAll('.counter-anim');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target')) || 0;
        const duration = 2000; // 2s
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            const current = Math.floor(ease * target);
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

async function init() {
    // Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    try {
        const [resProjects, resEducation, resRoiProy, resSummary] = await Promise.all([
            fetch(URL_PROJECTS),
            fetch(URL_EDUCATION),
            fetch(URL_ROI_PROY),
            fetch(URL_SUMMARY)
        ]);

        const csvText = await resProjects.text();
        const eduText = await resEducation.text();
        const roiProyText = await resRoiProy.text();
        const summaryText = await resSummary.text();

        const projects = d3.csvParse(csvText);
        const education = d3.csvParse(eduText);
        const roiProyData = d3.csvParse(roiProyText);
        const summaryData = d3.csvParse(summaryText);

        // Filtrar con búsqueda flexible (case insensitive y parcial)
        const topProjects = projects.filter(p => {
            const pName = (p.nombre || '').toUpperCase();
            return TOP_PROJECTS_NAMES.some(name => pName.includes(name.toUpperCase()));
        });

        // Ordenar por ID numérico (P01, P02...)
        topProjects.sort((a, b) => {
            const idA = parseInt((getVal(a, 'id') || '').replace('P', '')) || 0;
            const idB = parseInt((getVal(b, 'id') || '').replace('P', '')) || 0;
            return idB - idA;
        });

        renderProjects(topProjects, roiProyData);
        renderStatsTypology(projects);
        renderStatsDisciplines(projects);
        renderStatsEnvironment(projects);
        renderStatsMethodology(projects);
        renderStatsPhases(projects);
        renderProjectsMap(projects);
        renderSummaryModal(summaryData);


        // Iniciar animaciones después de renderizar todo
        setTimeout(animateCounters, 150);

        // Volver a procesar iconos Lucide para los nuevos elementos inyectados
        if (window.lucide) {
            window.lucide.createIcons();
        }
    } catch (error) {
        console.error("Error cargando el portafolio resumido:", error);
    }
}

const normalizeStr = (str) => {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
};

function getVal(item, ...keys) {
    if (!item || typeof item !== 'object') return "";
    const objectKeys = Object.keys(item);

    // Prioridad 1: Coincidencia EXACTA (normalizada)
    const exactKey = objectKeys.find(k => {
        const cleanKey = normalizeStr(k);
        return keys.some(sk => normalizeStr(sk) === cleanKey);
    });
    if (exactKey) return String(item[exactKey]).trim();

    // Prioridad 2: Coincidencia parcial (solo si no hay exacta)
    const foundKey = objectKeys.find(k => {
        const cleanKey = normalizeStr(k);
        return keys.some(searchKey => {
            const sKey = normalizeStr(searchKey);
            return cleanKey === sKey || cleanKey.includes(sKey) || sKey.includes(cleanKey);
        });
    });
    const value = foundKey ? item[foundKey] : "";
    return (value === undefined || value === null || value === "undefined") ? "" : String(value).trim();
}

function calculateLeadershipStats(allProjects) {
    if (!allProjects || allProjects.length === 0) return { total: 0, led: 0, percentage: 0 };
    const uniqueMap = new Map();
    allProjects.forEach(p => {
        let key = getVal(p, 'id');
        if (!key) return;
        const name = normalizeStr(getVal(p, 'nombre', 'proyecto'));
        if (name.includes("modulo covid")) key = "GROUP_COVID";
        else if (name.includes("central de mezclas")) key = "GROUP_MEZCLAS";
        
        const actividad = normalizeStr(getVal(p, 'actividad principal', 'liderazgo', 'rol')).toLowerCase();
        // Regex robusto para detectar roles de liderazgo (Sincronizado con CV)
        const isLeader = /(lider|coord|gestor|head|director|supervis|jefe)/.test(actividad);

        if (!uniqueMap.has(key)) { uniqueMap.set(key, isLeader); }
        else if (isLeader) { uniqueMap.set(key, true); }
    });
    const total = uniqueMap.size;
    let led = 0;
    uniqueMap.forEach(isL => { if (isL) led++; });
    const percentage = total > 0 ? Math.round((led / total) * 100) : 0;
    return { total, led, percentage };
}

function renderStatsTypology(projects) {
    const container = document.getElementById('stats-typology-container');
    if (!container) return;

    const typeCounts = {};
    const uniqueIds = new Set();

    projects.forEach(p => {
        const id = getVal(p, 'id');
        if (id && !uniqueIds.has(id)) {
            uniqueIds.add(id);
            let t = getVal(p, 'tipologia') || "OTROS";
            t = t.split(',')[0].trim().toUpperCase();
            typeCounts[t] = (typeCounts[t] || 0) + 1;
        }
    });

    const stats = Object.entries(typeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

    const total = stats.reduce((acc, curr) => acc + curr.count, 0);

    container.innerHTML = stats.map((s, i) => {
        const pct = Math.round((s.count / total) * 100);
        return `
            <div class="flex items-center gap-2 text-[8px] font-mono animate-item mb-1.5" style="animation-delay: ${i * 0.1}s">
                <div class="flex items-center w-24 shrink-0">
                    <span class="text-[var(--text-muted)] uppercase truncate" title="${s.name}">${s.name}</span>
                </div>
                <div class="flex-1 h-[3px] bg-[var(--bar-bg)] rounded-full overflow-hidden relative">
                    <div class="h-full bg-blue-500 animate-bar" style="--final-width: ${pct}%"></div>
                </div>
                <span class="text-[var(--text-accent)] font-bold w-7 text-right shrink-0"><span class="counter-anim" data-target="${pct}">0</span>%</span>
            </div>
        `;
    }).join('');

    // Actualizar Métrica de Liderazgo en el Portafolio Resumido
    // v50.54 - Refinamiento de Resumen + Ancho 1400px
    const leadPctEl = document.getElementById('res-leadership-pct');
    if (leadPctEl) {
        const stats = calculateLeadershipStats(projects);
        leadPctEl.innerHTML = `
            <span class="stat-value text-[var(--text-accent)]">${stats.led}</span>
            <span class="stat-label">Liderados</span>
        `;
    }
}

function renderStatsDisciplines(projects) {
    const container = document.getElementById('stats-disciplines-container');
    if (!container) return;

    const discCounts = {};
    const uniqueIds = new Set();

    projects.forEach(p => {
        const id = getVal(p, 'id');
        if (id && !uniqueIds.has(id)) {
            uniqueIds.add(id);
            const discs = getVal(p, 'disciplina modelada', 'disciplinas').split(/[,;]/);
            discs.forEach(d => {
                let cleanD = d.trim().toUpperCase();
                if (cleanD.includes("DOC") || cleanD.includes("CUAN")) cleanD = "DOCS Y CUANT.";
                if (cleanD.includes("MEP") || cleanD.includes("INSTA")) cleanD = "MEP";
                if (cleanD.length > 3) {
                    discCounts[cleanD] = (discCounts[cleanD] || 0) + 1;
                }
            });
        }
    });

    const stats = Object.entries(discCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const total = stats.reduce((acc, curr) => acc + curr.count, 0);

    container.innerHTML = stats.map((s, i) => {
        const pct = Math.round((s.count / total) * 100);
        return `
            <div class="flex items-center gap-2 text-[8px] font-mono animate-item mb-1.5" style="animation-delay: ${i * 0.1}s">
                <div class="flex items-center w-24 shrink-0">
                    <span class="text-[var(--text-muted)] uppercase truncate" title="${s.name}">${s.name}</span>
                </div>
                <div class="flex-1 h-[3px] bg-[var(--bar-bg)] rounded-full overflow-hidden relative">
                    <div class="h-full bg-blue-500 animate-bar" style="--final-width: ${pct}%"></div>
                </div>
                <span class="text-[var(--text-accent)] font-bold w-7 text-right shrink-0"><span class="counter-anim" data-target="${pct}">0</span>%</span>
            </div>
        `;
    }).join('');
}

function parseCSV(text) {
    const results = [];
    let currentLine = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            currentField += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            currentLine.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            currentLine.push(currentField.trim());
            if (currentLine.length > 1 || currentLine[0] !== '') {
                results.push(currentLine);
            }
            currentLine = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim());
        results.push(currentLine);
    }

    if (results.length === 0) return [];

    const headers = results[0].map(h => h.trim().replace(/^"|"$/g, ''));
    return results.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i] || '';
        });
        return obj;
    });
}

function renderProjects(projects, roiData) {
    const container = document.getElementById('print-projects-grid');
    if (!container) return;

    container.innerHTML = projects.map(p => {
        const id = getVal(p, 'id');
        const name = getVal(p, 'nombre', 'proyecto');
        const location = (() => {
            const c = getVal(p, 'ciudad', 'ubicacion', 'ubicación');
            const pa = getVal(p, 'país', 'pais') || 'México';
            return c ? `${c}, ${pa}` : pa;
        })();
        const area = getVal(p, 'gba (m2)', 'area', 'área') || '—';
        const cost = getVal(p, 'costo', 'inversion', 'inversión') || '—';
        const year = getVal(p, 'ano', 'año') || '—';

        // Buscar ROI del proyecto
        const proyRoi = roiData ? roiData.find(r => r.id === id) : null;

        // Obtener la primera imagen de la DB
        let imgPath = 'https://via.placeholder.com/400x225?text=SIN+IMAGEN';
        if (typeof PROJECT_IMAGES_DB !== 'undefined' && PROJECT_IMAGES_DB[id] && PROJECT_IMAGES_DB[id].images.length > 0) {
            imgPath = CLOUD_ASSET_BASE + PROJECT_IMAGES_DB[id].images[0];
        }

        // Limpiar descripción (quitar saltos de línea y obtener primera frase relevante)
        let reto = getVal(p, 'reto', 'descripción') || '';
        reto = reto.replace(/[\r\n]+/g, ' ').trim();
        const firstSentence = reto.split(/[.!?]/)[0] + '.';
        const tipologia = getVal(p, 'tipologia', 'tipo') || '-';
        const entorno = getVal(p, 'entorno') || '-';
        const methodology = getVal(p, 'metodología proyecto') || '—';

        return `
            <div class="project-card pb-4 h-full flex flex-col">
                <div class="relative overflow-hidden rounded-lg group mb-2 shrink-0">
                    <a href="../index.html?view=projects&project=${id}" target="_blank" class="block cursor-pointer">
                        <img src="${imgPath}" alt="${name}" 
                             class="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-110"
                             onerror="this.src='https://via.placeholder.com/400x225?text=IMAGEN+NO+ENCONTRADA'">
                        <!-- Overlay de gradiente + Título -->
                        <div class="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 pb-8 pointer-events-none">
                             <h4 class="text-white/70 text-[10px] font-mono uppercase tracking-tight drop-shadow-md">
                                 ID: ${id} - ${name}
                             </h4>
                        </div>
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <i data-lucide="external-link" class="w-5 h-5 text-white/90 drop-shadow-md"></i>
                        </div>
                    </a>
                </div>
                <div class="flex flex-col flex-1">
                    <div class="project-meta flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[var(--text-muted)] font-medium">
                        <span>${location}</span>
                        <span class="text-[var(--text-accent)] opacity-30">|</span>
                        <span>${year}</span>
                        <span class="text-[var(--text-accent)] opacity-30">|</span>
                        <span class="text-[var(--text-main)]" style="font-weight: 400">${area}</span>
                        <div class="flex items-center">
                            <span class="text-[var(--text-accent)] opacity-30 mr-2">|</span>
                            <span class="text-[var(--text-main)]" style="font-weight: 400">${cost}</span>
                            <span class="text-[var(--text-accent)] opacity-30 mx-2">|</span>
                            <span class="text-blue-500 dark:text-blue-400 font-bold uppercase text-[7px]">${methodology}</span>
                        </div>
                    </div>
                    <div class="grid grid-cols-[1.3fr_0.9fr_0.8fr] gap-1.5 mt-2 text-[7px] uppercase tracking-wider font-bold">
                        <div class="flex items-center justify-center px-1 py-0.5 rounded bg-[var(--tag-bg)] text-[var(--text-accent)] border border-[var(--tag-border)] w-full whitespace-nowrap">
                            ${tipologia}
                        </div>
                        <div class="flex items-center justify-center px-1 py-0.5 rounded bg-gray-50 dark:bg-gray-800/30 text-[var(--text-muted)] border border-gray-100 dark:border-gray-700/30 w-full text-center whitespace-nowrap">
                            ${entorno}
                        </div>
                        ${proyRoi ? `
                            <div class="group relative flex items-center justify-center gap-1 px-1 py-0.5 rounded bg-[var(--tag-bg)] text-[var(--text-accent)] border border-[var(--tag-border)] cursor-help w-full whitespace-nowrap">
                                <i data-lucide="timer" class="w-2.5 h-2.5 shrink-0"></i>
                                <span>ROI: ${proyRoi.roi}</span>
                                                                 <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 roi-tooltip rounded shadow-xl text-[8px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 normal-case font-sans leading-snug font-normal">
                                    <div class="font-bold border-b border-white/10 dark:border-white/10 pb-1 mb-1 tooltip-title uppercase tracking-tighter">OPTIMIZACIÓN TÉCNICA</div>
                                    <div class="mb-1 italic font-normal">"${proyRoi.justificacion}"</div>
                                    <div class="text-[7px] font-normal opacity-80">Ahorro estimado: <span class="font-bold text-[var(--text-accent)] dark:text-blue-400 html:not(.dark):text-blue-700">${proyRoi.ahorro}</span></div>
                                </div>
                            </div>
                        ` : `
                            <div class="px-1.5 py-0.5 opacity-0 pointer-events-none"></div>
                        `}
                    </div>
                    <p class="project-reto mt-1.5 italic">
                        ${firstSentence || 'Sin descripción disponible.'}
                    </p>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function renderStatsEnvironment(projects) {
    const container = document.getElementById('stats-environment-container');
    if (!container) return;

    let obraCount = 0;
    let oficinaCount = 0;

    projects.forEach(p => {
        const ent = (getVal(p, 'entorno') || '').toLowerCase();
        if (ent.includes('obra')) obraCount++;
        else if (ent.includes('oficina') || ent.includes('diseno')) oficinaCount++;
    });

    const total = (obraCount + oficinaCount) || 1;
    const pctObra = Math.round((obraCount / total) * 100);
    const pctOficina = 100 - pctObra;

    container.innerHTML = `
        <div class="flex flex-col gap-1 w-full pt-1">
            <div class="flex justify-between text-[7px] font-mono text-[var(--text-muted)] uppercase mb-0.5 px-0.5">
                <div class="flex items-center gap-1">
                    <div class="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)]"></div>
                    <span>OFICINA ${pctOficina}%</span>
                </div>
                <div class="flex items-center gap-1">
                    <span>OBRA ${pctObra}%</span>
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                </div>
            </div>
            <div class="h-[3px] bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
                <div class="h-full bg-[var(--text-accent)] animate-bar" style="--final-width: ${pctOficina}%"></div>
                <div class="h-full bg-slate-400 animate-bar" style="--final-width: ${pctObra}%"></div>
            </div>
        </div>
    `;
}

function renderStatsMethodology(projects) {
    const container = document.getElementById('stats-methodology-container');
    if (!container) return;

    let openCount = 0;
    let closedCount = 0;

    projects.forEach(p => {
        const meth = (getVal(p, 'metodología proyecto') || '').toLowerCase();
        if (meth.includes('open')) openCount++;
        else if (meth.includes('closed')) closedCount++;
    });

    const total = (openCount + closedCount) || 1;
    const pctOpen = Math.round((openCount / total) * 100);
    const pctClosed = 100 - pctOpen;

    container.innerHTML = `
        <div class="flex flex-col gap-1 w-full pt-1">
            <div class="flex justify-between text-[7px] font-mono text-[var(--text-muted)] uppercase mb-0.5 px-0.5">
                <div class="flex items-center gap-1">
                    <div class="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)]"></div>
                    <span>OPEN BIM ${pctOpen}%</span>
                </div>
                <div class="flex items-center gap-1">
                    <span>CLOSED BIM ${pctClosed}%</span>
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                </div>
            </div>
            <div class="h-[3px] bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
                <div class="h-full bg-[var(--text-accent)] animate-bar" style="--final-width: ${pctOpen}%"></div>
                <div class="h-full bg-slate-400 animate-bar" style="--final-width: ${pctClosed}%"></div>
            </div>
        </div>
    `;
}

function renderStatsPhases(projects) {
    const container = document.getElementById('stats-phases-container');
    if (!container) return;

    const phaseCounts = {};
    let total = 0;

    projects.forEach(p => {
        const faseRaw = getVal(p, 'fase');
        if (faseRaw) {
            const fase = faseRaw.charAt(0).toUpperCase() + faseRaw.slice(1);
            phaseCounts[fase] = (phaseCounts[fase] || 0) + 1;
            total++;
        }
    });

    if (total === 0) return;

    const stats = Object.entries(phaseCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

    container.innerHTML = stats.map((s, i) => {
        const pct = Math.round((s.count / total) * 100);
        return `
            <div class="flex items-start gap-2 text-[8px] font-mono animate-item mb-1.5" style="animation-delay: ${i * 0.1}s">
                <div class="flex items-start w-24 shrink-0 leading-tight">
                    <span class="text-[var(--text-muted)] uppercase" title="${s.name}">${s.name}</span>
                </div>
                <div class="flex-1 h-[3px] bg-[var(--bar-bg)] rounded-full overflow-hidden relative mt-1">
                    <div class="h-full bg-blue-500 animate-bar" style="--final-width: ${pct}%"></div>
                </div>
                <span class="text-[var(--text-accent)] font-bold w-7 text-right shrink-0"><span class="counter-anim" data-target="${pct}">0</span>%</span>
            </div>
        `;
    }).join('');
}





// LÓGICA JAVASCRIPT (D3.js)
let svg, g, tooltipElement, hideTimeout;

window.addEventListener('resize', () => {
     const container = document.getElementById('d3-map-svg-container');
     if(container && d3.select("#map-svg").node()) {
         d3.select("#map-svg").attr("width", container.clientWidth);
     }
});

function renderProjectsMap(projects) {
    const mainContainer = document.getElementById('res-projects-map-container');
    if (!mainContainer) return;

    const container = document.getElementById('d3-map-svg-container');
    if (!container) return; 
    
    // Limpiar render previo
    const svgSelect = d3.select("#map-svg");
    svgSelect.selectAll("*").remove();

    const w = container.clientWidth; 
    const h = 160; 
    
    const svg = svgSelect.attr("width", w).attr("height", h);
    const proj = d3.geoMercator().center([-97, 23.5]).scale(w * 1.25).translate([w/2, h/2]);
    const path = d3.geoPath().projection(proj); 
    const g = svg.append("g");

    // Tooltip del mapa (crear si no existe en el body)
    let tooltip = d3.select("#map-tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
          .attr("id", "map-tooltip")
          .attr("class", "map-tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("z-index", "9999");
    }

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(data => {
        g.selectAll("path").data(topojson.feature(data, data.objects.countries).features)
         .enter().append("path").attr("class", "country").attr("d", path);
        
        // Coordenadas centrales por país para la prueba de simplificación total
        const COUNTRY_COORDS = {
            'mexico': [-102, 23.8],
            'estadosunidos': [-100, 31],
            'usa': [-100, 31],
            'jamaica': [-76.79, 17.97]
        };

        const countryGroups = {};
        projects.forEach(p => {
            let paisNorm = normalizeStr(getVal(p, 'país', 'pais'));
            if (paisNorm.includes('totalmenteremoto')) return; // Ignorar remotos sin sede fija
            
            if (paisNorm.includes('mexico')) paisNorm = 'mexico';
            else if (paisNorm.includes('estadosunidos') || paisNorm === 'usa') paisNorm = 'usa';
            else if (paisNorm.includes('jamaica')) paisNorm = 'jamaica';
            else return; // Solo los 3 países solicitados

            if (!countryGroups[paisNorm]) {
                countryGroups[paisNorm] = { 
                    name: (paisNorm === 'mexico' ? 'MÉXICO' : (paisNorm === 'usa' ? 'USA' : 'JAMAICA')),
                    coords: COUNTRY_COORDS[paisNorm], 
                    count: 0 
                };
            }
            countryGroups[paisNorm].count++;
        });

        const projectPoints = Object.values(countryGroups);

        // Renderizar puntos brillantes
        g.selectAll("circle").data(projectPoints).enter().append("circle")
          .attr("class","city-marker shadow-glow animate-pulse")
          .attr("cx", d => proj(d.coords)[0])
          .attr("cy", d => proj(d.coords)[1])
          .attr("r", 2.0)
          .attr("fill", "var(--text-accent)")
          .style("cursor", "pointer")
          .style("pointer-events", "all")
          .on("mouseover", function(event, d) {
              console.log(`Hover on ${d.name}`); // Debug para el usuario
              tooltip.style("opacity", 1);
              tooltip.html(`${d.name}: ${d.count} proyectos`);
          })
          .on("mousemove", function(event) {
              // Con position: fixed usamos clientX/Y
              tooltip
                .style("left", (event.clientX + 10) + "px")
                .style("top", (event.clientY - 30) + "px");
          })
          .on("mouseout", function() {
              tooltip.style("opacity", 0);
          });

        // Etiquetas de países sutiles
        const countryLabels = [
            { name: "USA", coords: [-100, 31], offset: [0, -10] },
            { name: "MÉXICO", coords: [-102, 23.8], offset: [0, 0] },
            { name: "JAMAICA", coords: [-76.79, 17.97], offset: [15, 2] }
        ];

        g.selectAll(".country-label").data(countryLabels).enter().append("text")
          .attr("class", "country-label")
          .attr("x", d => proj(d.coords)[0] + d.offset[0])
          .attr("y", d => proj(d.coords)[1] + d.offset[1])
          .text(d => d.name)
          .attr("font-size", "7px")
          .attr("fill", "var(--text-muted)")
          .attr("opacity", 0.6)
          .attr("text-anchor", "middle")
          .attr("font-weight", "500")
          .attr("pointer-events", "none")
          .style("text-transform", "uppercase")
          .style("letter-spacing", "0.5px");
    });
}




function initTheme() {
    const html = document.documentElement;
    const body = document.body;

    const set = (dark) => {
        if (dark) {
            html.classList.add('dark');
            body.classList.remove('light-theme');
        } else {
            html.classList.remove('dark');
            body.classList.add('light-theme');
        }
    };

    // 1. Default a Oscuro (tal como pidió el usuario para ingresos frescos o F5)
    set(true);

    // 2. Detección por URL para persistencia entre secciones
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    if (themeParam === 'light') {
        set(false);
        // Limpiar URL para que el próximo F5 sea oscuro
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

window.toggleTheme = function () {
    const isDark = document.documentElement.classList.toggle('dark');
    document.body.classList.toggle('light-theme', !isDark);
    if (window.lucide) window.lucide.createIcons();
};

function getThemeParam() {
    return document.body.classList.contains('light-theme') ? 'theme=light' : 'theme=dark';
}
// Funciones de Navegación Universal
window.goBack = function () { window.history.back(); };
window.goForward = function () { window.history.forward(); };
window.goHome = function(view = null) {
    let url = '../index.html';
    const params = [];
    if (view) params.push(`view=${view}`);
    const theme = getThemeParam();
    if (theme) params.push(theme);
    if (params.length > 0) url += '?' + params.join('&');
    window.location.href = url;
};

/* =========================================
   MODALS: RESUMEN Y DESCARGAS (Sincronizado con CV)
   ========================================= */
window.openSummaryCV = () => {
    const modal = document.getElementById('summary-cv-modal');
    const popup = document.getElementById('summary-cv-popup');
    if (!modal || !popup) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
        popup.classList.remove('opacity-0', 'scale-95');
        popup.classList.add('opacity-100', 'scale-100');
    }, 10);
};

window.closeSummaryCV = () => {
    const modal = document.getElementById('summary-cv-modal');
    const popup = document.getElementById('summary-cv-popup');
    if (!modal || !popup) return;
    popup.classList.remove('opacity-100', 'scale-100');
    popup.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 500);
};

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

window.switchView = function() {
    window.location.href = `../CV/index.html?${getThemeParam()}`;
};

/**
 * Renderiza el modal de resumen dinámicamente desde CSV local (Sincronizado con Main)
 */
function renderSummaryModal(data) {
    const container = document.getElementById('summary-cv-cards-container');
    if (!container || !Array.isArray(data)) return;

    container.innerHTML = data.map((item, i) => {
        const title = getVal(item, 'Title', 'title');
        const value = getVal(item, 'Value', 'value');
        const desc = getVal(item, 'Description', 'description', 'desc');
        const link = getVal(item, 'Link', 'link');
        
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

        const valueHtml = link ? `
            <a href="${link}" target="_blank" class="hover:opacity-80 transition-opacity inline-flex items-center justify-center gap-1.5 w-full">
                <p class="text-white font-bold text-[12px] leading-tight uppercase text-center flex items-center justify-center gap-1.5">
                    ${value} <i class="fas fa-external-link-alt text-[10px] text-cyan-400 shrink-0"></i>
                </p>
            </a>` : `
            <p class="text-white font-bold text-[12px] leading-tight uppercase text-center">${value}</p>`;

        return `
            <div class="flex flex-col items-center text-center group transition-all duration-300 min-h-[140px] hover:scale-[1.02] cursor-default p-2 hover:bg-white/5 transition-all">
                <div class="w-full h-[35px] mb-2 flex items-center justify-center flex-shrink-0">
                    <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all duration-300 font-bold text-cyan-400">
                        <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
                    </div>
                </div>
                <div class="w-full h-[25px] mb-1 flex items-center justify-center flex-shrink-0">
                    <h4 class="text-[8px] font-bold text-gray-500 font-mono tracking-widest uppercase text-center m-0 p-0 leading-none">${title}</h4>
                </div>
                <div class="w-full h-[40px] mb-1 flex items-center justify-center flex-shrink-0">
                    ${valueHtml}
                </div>
                <p class="text-[8px] text-cyan-500/70 font-bold uppercase font-mono mt-auto pt-1">${desc}</p>
            </div>
        `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
}
