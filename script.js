/**
 * CV Digital - Said Herrera
 * Lógica modular para interactividad, modo oscuro y asistente virtual.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initPrintLogic();
    loadExternalData();
    if (window.lucide) lucide.createIcons();
});

/* =========================================
   DATA LOADING (CSV Parsing)
   ========================================= */
const CSV_URLS = {
    experiencia: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/CV/Experiencia%20laboral_cv.csv',
    formacion: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/CV/Formaci%C3%B3n%20ac%C3%A1d%C3%A9mica_cv.csv',
    software: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Software_portafolio.csv',
    habilidades: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/CV/Soft%20skills_cv.csv',
    contacto: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/CV/Contacto_cv.csv',
    perfil: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/CV/Perfil%20Profesional_cv.csv',
    proyectos_global: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Proyectos_portafolio.csv',
    disciplinas_global: 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/main/Disciplinas_portafolio.csv'
};

async function loadExternalData() {
    try {
        const ts = Date.now() + Math.floor(Math.random() * 1000); // Rompe-caché dinámico
        const [expData, formData, softData, habData, contactData, profileData, projectsGlobal, disciplinesGlobal] = await Promise.all([
            fetchCSV(`${CSV_URLS.experiencia}?v=${ts}`),
            fetchCSV(`${CSV_URLS.formacion}?v=${ts}`),
            fetchCSV(`${CSV_URLS.software}?v=${ts}`),
            fetchCSV(`${CSV_URLS.habilidades}?v=${ts}`),
            fetchCSV(`${CSV_URLS.contacto}?v=${ts}`),
            fetchCSV(`${CSV_URLS.perfil}?v=${ts}`),
            fetchCSV(`${CSV_URLS.proyectos_global}?v=${ts}`),
            fetchCSV(`${CSV_URLS.disciplinas_global}?v=${ts}`)
        ]);

        renderExperience(expData);
        renderEducation(formData);
        renderSoftware(softData);
        renderSkills(habData);
        renderContact(contactData);
        renderProfile(profileData);

        // Renderizar estadísticas del sidebar
        renderStatsTypology(projectsGlobal);
        renderStatsDisciplines(projectsGlobal, disciplinesGlobal);
        renderStatsEnvironment(projectsGlobal);

        initAnimations();
    } catch (error) {
        console.error("Error cargando datos:", error);
        initAnimations();
    }
}

async function fetchCSV(url) {
    const response = await fetch(url);
    const text = await response.text();
    const parsed = parseCSV(text);
    // Si no se parseó nada pero el texto no está vacío, devolver el texto limpio (útil para perfiles en texto plano)
    if (parsed.length === 0 && text.trim().length > 0) {
        return text.trim().replace(/^"|"$/g, '');
    }
    return parsed;
}

const normalizeStr = (str) => {
    return str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
};

const getVal = (item, ...keys) => {
    if (!item || typeof item !== 'object') return "";
    const objectKeys = Object.keys(item);
    const foundKey = objectKeys.find(k => {
        const cleanKey = normalizeStr(k);
        return keys.some(searchKey => {
            const sKey = normalizeStr(searchKey);
            return cleanKey === sKey || cleanKey.includes(sKey);
        });
    });
    // Garantizamos que NUNCA sea undefined devolviendo "" como fallback final
    const value = foundKey ? item[foundKey] : "";
    return (value === undefined || value === null || value === "undefined") ? "" : String(value).trim();
};

function parseCSV(text) {
    const rows = [];
    let currentRow = [];
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
            currentRow.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
            if (char === '\r' && nextChar === '\n') i++;
        } else {
            currentField += char;
        }
    }

    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }

    if (rows.length < 2) return [];

    // Limpiar cabeceras de posibles BOM o comillas
    const headers = rows[0].map(h => h.replace(/"/g, '').trim());

    return rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = (row[i] || '').trim();
        });
        return obj;
    });
}

/* =========================================
   RENDER FUNCTIONS
   ========================================= */
function renderExperience(data) {
    const container = document.getElementById('experience-container');
    if (!container || !Array.isArray(data)) return;
    container.innerHTML = '';

    data.forEach(job => {
        const puesto = getVal(job, 'Puesto');
        const empresa = getVal(job, 'Empresa');
        const periodo = getVal(job, 'Periodo');
        const ubicacion = getVal(job, 'Ubicacion', 'Ubicación');
        const descripcion = getVal(job, 'Descripcion', 'Descripción');

        const duration = calculateDuration(periodo);
        const article = document.createElement('article');
        article.className = 'job-card group';
        article.innerHTML = `
            <div class="flex justify-between items-center mb-0.5">
                <h4 class="text-xs font-bold text-gray-800 dark:text-white flex items-center">
                    <span class="${puesto.includes('Modelador BIM Senior') ? 'pulse-dot' : 'static-dot'}"></span>
                    ${puesto.replace(/\s*\((.*?)\)/g, ' <span class="font-normal opacity-80 ml-1.5">($1)</span>')}
                </h4>
                <div class="text-right flex items-center gap-2">
                    <span class="text-[0.6rem] text-blue-600 dark:text-blue-400 whitespace-nowrap">${duration}</span>
                    <span class="text-[0.6rem] text-gray-400 dark:text-gray-500 whitespace-nowrap">(${periodo})</span>
                </div>
            </div>
            <p class="text-[0.65rem] font-semibold text-gray-500 dark:text-gray-400 italic mb-2.5">${empresa}</p>

            <div class="space-y-1.5">
                ${descripcion.split('\n').filter(p => p.trim() !== '').map(p => `
                    <div class="flex items-start gap-1.5">
                        <span class="text-gray-400 dark:text-gray-500 text-[0.6rem] mt-0.5">•</span>
                        <p class="text-[0.65rem] text-gray-600 dark:text-gray-300 text-justify leading-snug flex-1">${p.trim()}</p>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(article);
    });
}

function renderEducation(data) {
    const gridContainer = document.getElementById('education-grid');
    const listContainer = document.getElementById('education-list');

    if (!Array.isArray(data)) return;
    if (gridContainer) gridContainer.innerHTML = '';
    if (listContainer) listContainer.innerHTML = '';

    const sortedData = [...data].sort((a, b) => {
        const getYear = (str) => {
            if (!str) return 0;
            if (str.toLowerCase().includes('presente') || str.toLowerCase().includes('actualidad')) return new Date().getFullYear() + 1;
            const years = str.match(/\d{4}/g);
            return years ? Math.max(...years.map(Number)) : 0;
        };
        return getYear(b.Periodo) - getYear(a.Periodo);
    });

    sortedData.forEach((edu, index) => {
        const estado = getVal(edu, 'Estado');
        const titulo = getVal(edu, 'Titulo', 'Título');
        const institucion = getVal(edu, 'Institucion', 'Institución');
        const insignia = getVal(edu, 'Insignia');
        const periodo = getVal(edu, 'Periodo');

        const isCurrent = estado === 'En curso';

        if (isCurrent && gridContainer) {
            // Iconos basados en palabras clave
            let icon = 'fa-rocket';
            if (titulo.toLowerCase().includes('smart')) icon = 'fa-certificate';
            if (titulo.toLowerCase().includes('dynamo')) icon = 'fa-code';

            const linkIcon = insignia ? `<i class="fas fa-arrow-up-right-from-square text-[0.4rem] opacity-50"></i>` : '';
            const cardContent = `
                <div class="future-study group flex flex-row items-center gap-3">
                    <i class="fas ${icon} text-lg text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform"></i>
                    <p class="text-[0.6rem] font-light uppercase tracking-wider whitespace-nowrap">
                        ${titulo} ${linkIcon} <span class="text-gray-400 dark:text-gray-500 normal-case"> — ${institucion}</span>
                    </p>
                </div>
            `;

            if (insignia) {
                gridContainer.innerHTML += `<a href="${insignia}" target="_blank" class="block no-underline">${cardContent}</a>`;
            } else {
                gridContainer.innerHTML += cardContent;
            }
        } else if (listContainer) {
            const li = document.createElement('li');
            const badgeLink = insignia ? `<a href="${insignia}" target="_blank" class="hover:text-blue-400 transition-colors inline-flex items-center gap-1">${titulo} <i class="fas fa-arrow-up-right-from-square text-[0.45rem] opacity-70"></i></a>` : titulo;

            li.innerHTML = `
                <div class="flex flex-col mb-1">
                    <strong class="text-[0.65rem] text-gray-800 dark:text-gray-200">${institucion}</strong>
                    <div class="flex justify-between items-center gap-2">
                        <span class="text-[0.6rem] text-gray-500 dark:text-gray-400 italic flex-1">${badgeLink}</span>
                        <span class="text-[0.55rem] text-gray-400 font-mono whitespace-nowrap">${periodo}</span>
                    </div>
                </div>
            `;
            listContainer.appendChild(li);
        }
    });
}

function renderSoftware(data) {
    const mainContainer = document.getElementById('software-main-container');
    const secondaryContainer = document.getElementById('software-secondary-list');
    if (!mainContainer || !secondaryContainer || !Array.isArray(data)) return;
    if (mainContainer) mainContainer.innerHTML = '';
    if (secondaryContainer) secondaryContainer.innerHTML = '';

    const principalData = data.filter(sw => {
        const cls = normalizeStr(getVal(sw, 'Clasificación', 'Clasificacion'));
        return cls === 'principal';
    });
    const secundarioData = data.filter(sw => {
        const cls = normalizeStr(getVal(sw, 'Clasificación', 'Clasificacion'));
        return cls === 'secundario';
    });

    const priority = { 'Experto': 4, 'Avanzado': 3, 'Medio': 2, 'Básico': 1, 'Basico': 1, '': 0 };

    // Principal: Revit -> Nivel -> Nombre
    const sortedPrincipal = [...principalData].sort((a, b) => {
        const nameA = getVal(a, 'Nombre', 'Item').toLowerCase();
        const nameB = getVal(b, 'Nombre', 'Item').toLowerCase();
        if (nameA.includes("revit")) return -1;
        if (nameB.includes("revit")) return 1;
        const nivelA = priority[getVal(a, 'Nivel')] || 0;
        const nivelB = priority[getVal(b, 'Nivel')] || 0;
        if (nivelB !== nivelA) return nivelB - nivelA;
        return nameA.localeCompare(nameB);
    });

    // Secundario: Alfabético
    const sortedSecundario = [...secundarioData].sort((a, b) => {
        return getVal(a, 'Nombre', 'Item').localeCompare(getVal(b, 'Nombre', 'Item'));
    });

    sortedPrincipal.forEach(sw => {
        const nombre = getVal(sw, 'Nombre', 'Item', 'Software');
        const porcentaje = getVal(sw, 'Porcentaje Dominio', 'Detalle');
        const capacidad = getVal(sw, 'Capacidad');
        const nivel = getVal(sw, 'Nivel');

        mainContainer.innerHTML += `
            <div class="group relative cursor-help flex items-center gap-3 mb-1">
                <span class="text-[0.6rem] text-gray-200 w-24 shrink-0 truncate">${nombre}</span>
                <div class="skill-bar flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden mt-0">
                    <div class="skill-progress h-full bg-blue-500 rounded-full" data-width="${porcentaje}" style="width: ${porcentaje}%"></div>
                </div>
                <div class="glass-tooltip">
                    <strong class="text-blue-400 block mb-1 text-[0.65rem]">${nivel}</strong>
                    ${capacidad}
                </div>
            </div>
        `;
    });

    sortedSecundario.forEach(sw => {
        const nombre = getVal(sw, 'Nombre', 'Item', 'Software');
        const span = document.createElement('span');
        span.className = 'text-white/90 font-normal text-[0.58rem]';
        span.innerText = nombre;
        if (secondaryContainer.children.length > 0) secondaryContainer.innerHTML += '<span class="text-gray-500 mx-0.5 text-[0.5rem]">•</span>';
        secondaryContainer.appendChild(span);
    });
}

function renderContact(data) {
    const emailEl = document.getElementById('contact-email');
    const phoneEl = document.getElementById('contact-phone');
    const locationEl = document.getElementById('contact-location');
    const linkedinEl = document.getElementById('contact-linkedin');
    const nacionalidadEl = document.getElementById('contact-nacionalidad');

    if (!Array.isArray(data)) return;
    data.forEach(row => {
        const campo = normalizeStr(getVal(row, 'Campo'));
        const detalle = getVal(row, 'Detalle');

        if (campo.includes('correo') && emailEl) {
            emailEl.innerHTML = `${detalle} <i class="fas fa-arrow-up-right-from-square text-[0.45rem] opacity-50 ml-1"></i>`;
            emailEl.href = `mailto:${detalle}`;
        }
        if (campo.includes('telefono') && phoneEl) {
            phoneEl.innerHTML = `${detalle} <i class="fas fa-arrow-up-right-from-square text-[0.45rem] opacity-50 ml-1"></i>`;
            const cleanPhone = detalle.replace(/\D/g, '');
            phoneEl.href = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';
        }
        if (campo.includes('ubicacion') && locationEl) {
            locationEl.innerText = detalle;
        }
        if (campo.includes('linkedin') && linkedinEl) {
            linkedinEl.innerHTML = `${detalle.replace('linkedin.com/in/', '/in/')} <i class="fas fa-arrow-up-right-from-square text-[0.45rem] opacity-50 ml-1"></i>`;
            linkedinEl.href = detalle.startsWith('http') ? detalle : `https://${detalle}`;
        }
        if (campo.includes('nacionalidad') && nacionalidadEl) {
            nacionalidadEl.innerHTML = `<span class="text-white/90">${detalle}</span><br><span class="font-extralight text-white/90 tracking-widest text-[0.45rem] mt-0.5 inline-block not-italic">40+ PROYECTOS | 10+ AÑOS EXP. | 20+ CIUDADES</span>`;
        }
    });
}

function renderProfile(data) {
    const el = document.getElementById('profile-text');
    if (!el || !data) return;

    let text = "";
    if (Array.isArray(data) && data.length > 0) {
        const row = data.find(r => normalizeStr(getVal(r, 'Campo')) === 'contenido');
        if (row) text = getVal(row, 'Detalle');
    } else if (typeof data === 'string') {
        text = data;
    }

    if (text) {
        // Resaltar Inteligencia Artificial
        const highlightedText = text.replace(/Inteligencia Artificial/gi, '<strong>Inteligencia Artificial</strong>');

        el.innerHTML = `
            ${highlightedText}
            <div class="mt-4 mb-2 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                <p class="text-[0.62rem] text-gray-600 dark:text-gray-400">
                    Si quieres saber más sobre mis proyectos (imágenes, videos, ROI), visita mi 
                    <a href="../index.html" class="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors">
                        <i class="fas fa-laptop-code"></i> Portafolio <i class="fas fa-external-link-alt text-[0.45rem]"></i>
                    </a>
                </p>
            </div>
        `;
    }
}

/* =========================================
   SIDEBAR STATISTICS RENDERING
   ========================================= */

function renderStatsTypology(data) {
    const container = document.getElementById('stats-typology-container');
    if (!container || !Array.isArray(data)) return;

    const typeCounts = {};
    const uniqueIds = new Set();

    data.forEach(p => {
        const id = getVal(p, 'id');
        if (!uniqueIds.has(id)) {
            uniqueIds.add(id);
            let t = getVal(p, 'tipologia') || "OTROS";
            t = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
            typeCounts[t] = (typeCounts[t] || 0) + 1;
        }
    });

    const stats = Object.entries(typeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const colors = ["#22d3ee", "#3b82f6", "#a855f7", "#10b981"];

    container.innerHTML = stats.map((s, i) => {
        const pct = Math.round((s.count / total) * 100);
        return `
            <div class="flex items-center justify-between text-[0.6rem] font-mono">
                <div class="flex items-center gap-1.5 truncate pr-2">
                    <span class="truncate text-gray-300 uppercase">${s.name}</span>
                </div>
                <span class="text-gray-400 opacity-80 percentage-counter" data-target="${pct}">0%</span>
            </div>
        `;
    }).join('');
}

function renderStatsDisciplines(projects, refDisciplines) {
    const container = document.getElementById('stats-disciplines-container');
    if (!container || !Array.isArray(projects) || !Array.isArray(refDisciplines)) return;

    // Lógica similar al dashboard: agrupar por proyecto único
    const uniqueProjectMap = new Map();
    projects.forEach(p => {
        const id = getVal(p, 'id');
        if (!uniqueProjectMap.has(id)) {
            uniqueProjectMap.set(id, getVal(p, 'disciplina modelada', 'disciplinas'));
        }
    });
    const effectiveProjects = Array.from(uniqueProjectMap.values());
    const totalProjects = effectiveProjects.length || 1;

    const stats = refDisciplines.map(ref => {
        const refName = getVal(ref, 'name', 'nombre');
        const refNameClean = normalizeStr(refName);
        let count = 0;

        effectiveProjects.forEach(pDiscsRaw => {
            const pDiscs = normalizeStr(pDiscsRaw);
            // Lógica de detección flexible
            if ((refNameClean.includes("doc") || refNameClean.includes("cuan")) &&
                (pDiscs.includes("doc") || pDiscs.includes("cuan"))) {
                count++;
            } else if (refNameClean.includes('mep') &&
                (pDiscs.includes('mep') || pDiscs.includes('hidro') || pDiscs.includes('elec') || pDiscs.includes('insta'))) {
                count++;
            } else if (refNameClean.includes('arquitectura') && (pDiscs.includes('arquitectura') || pDiscs.includes('general'))) {
                count++;
            } else if (pDiscs.includes(refNameClean) || refNameClean.includes(pDiscs)) {
                if (pDiscs.length > 2) count++;
            }
        });

        return { name: refName, count: count };
    }).sort((a, b) => b.count - a.count).slice(0, 5);

    const totalStats = stats.reduce((acc, curr) => acc + curr.count, 0) || 1;

    container.innerHTML = stats.map(s => {
        const pct = Math.round((s.count / totalStats) * 100);
        return `
            <div class="flex justify-between text-[0.6rem] font-mono text-gray-300 uppercase">
                <span class="truncate pr-1">${s.name}</span>
                <span class="text-gray-400 opacity-80 percentage-counter" data-target="${pct}">0%</span>
            </div>
        `;
    }).join('');
}

function renderStatsEnvironment(projects) {
    const container = document.getElementById('stats-environment-container');
    if (!container || !Array.isArray(projects)) return;

    let obraCount = 0;
    let oficinaCount = 0;

    projects.forEach(p => {
        const entorno = normalizeStr(getVal(p, 'entorno'));
        if (entorno.includes('obra')) obraCount++;
        else if (entorno.includes('oficina') || entorno.includes('diseno')) oficinaCount++;
    });

    const total = projects.length || 1;
    const pctObra = Math.round((obraCount / total) * 100);
    const pctOficina = Math.round((oficinaCount / total) * 100);

    container.innerHTML = `
        <div class="space-y-1 pt-0.5">
            <div class="h-[3px] w-full bg-white/5 rounded-full overflow-hidden flex">
                <div class="h-full bg-blue-500 skill-progress" data-width="${pctOficina}" style="width: ${pctOficina}%"></div>
                <div class="h-full bg-white skill-progress" data-width="${pctObra}" style="width: ${pctObra}%"></div>
            </div>
            <div class="flex justify-between text-[0.6rem] font-mono uppercase mt-0.5">
                <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span class="text-gray-300">Oficina</span>
                    <span class="text-gray-400 opacity-80 ml-1 percentage-counter" data-target="${pctOficina}">0%</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <span class="text-gray-300">Obra</span>
                    <span class="text-gray-400 opacity-80 ml-1 percentage-counter" data-target="${pctObra}">0%</span>
                </div>
            </div>
        </div>
    `;
}

function renderSkills(data) {
    const softContainer = document.getElementById('soft-skills-container');
    if (!softContainer || !Array.isArray(data) || data.length === 0) {
        if (softContainer) softContainer.innerHTML = '';
        return;
    }
    softContainer.innerHTML = '';

    // Agrupar por categoría
    const categories = {};
    data.forEach(skill => {
        const cat = getVal(skill, 'Categoría', 'Categoria', 'Categorï¿½a'); // Soportar errores de encoding
        if (!cat) return;
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(skill);
    });

    // Renderizar cada categoría
    Object.entries(categories).forEach(([catName, skills]) => {
        const catDiv = document.createElement('div');
        catDiv.className = 'w-full mb-2';
        catDiv.innerHTML = `
            <div class="flex flex-wrap gap-0.5">
                ${skills.map(skill => {
            const item = getVal(skill, 'Ítem', 'Item');
            const detalle = getVal(skill, 'Detalle');
            return `
                        <span class="soft-skill-tag group cursor-help">
                            ${item}
                            <div class="glass-tooltip">${detalle}</div>
                        </span>
                    `;
        }).join('')}
            </div>
        `;
        softContainer.appendChild(catDiv);
    });
}

function calculateDuration(periodo) {
    if (!periodo) return '';
    // Soportar guiones normales, en-dash (–) y em-dash (—)
    const separators = [' - ', ' – ', ' — ', '–', '—', '-'];
    let parts = null;
    for (const sep of separators) {
        if (periodo.includes(sep)) {
            parts = periodo.split(sep);
            break;
        }
    }
    if (!parts || parts.length < 2) return '';
    const startStr = parts[0].trim();
    const endStr = parts[1].trim();

    const monthsMap = {
        'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11,
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
        'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };

    const parseDate = (str) => {
        const cleanStr = str.toLowerCase().replace('.', '').trim();
        if (cleanStr === 'actualidad' || cleanStr === 'presente') return new Date();

        const dateParts = cleanStr.split(' ');
        if (dateParts.length < 2) return new Date();

        // Tomamos el mes (primeras 3 letras para coincidir con el mapa) y el año
        const m = dateParts[0].substring(0, 3);
        const y = dateParts[1];

        return new Date(parseInt(y), monthsMap[m] !== undefined ? monthsMap[m] : 0, 1);
    };

    try {
        const start = parseDate(startStr);
        const end = parseDate(endStr);

        // Cálculo de meses totales (+1 para incluir el último mes trabajado)
        let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

        if (totalMonths <= 0) return '';

        const years = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;

        let res = [];
        if (years > 0) res.push(`${years} ${years === 1 ? 'año' : 'años'}`);
        if (remainingMonths > 0) res.push(`${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`);

        return res.length > 0 ? res.join(' ') : '';
    } catch (e) {
        return '';
    }
}

/* =========================================
   THEME, ANIMATIONS & PRINT
   ========================================= */
function initTheme() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const html = document.documentElement;
    const upd = (dark) => { if (icon) icon.className = dark ? 'fas fa-sun text-lg' : 'fas fa-moon text-lg'; };
    const set = (dark) => {
        if (dark) html.classList.add('dark'); else html.classList.remove('dark');
        upd(dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    };
    const saved = localStorage.getItem('theme');
    set(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));
    if (btn) btn.addEventListener('click', () => set(!html.classList.contains('dark')));
}

function initAnimations() {
    const animateAll = () => {
        const bars = document.querySelectorAll('.skill-progress');
        const counters = document.querySelectorAll('.percentage-counter');

        // Reset inmediato sin transiciones
        bars.forEach(b => {
            b.style.transition = 'none';
            b.style.width = '0%';
        });
        counters.forEach(c => c.innerText = '0%');

        void document.body.offsetWidth; // Forzar reflujo

        const duration = 2000;
        const startTime = performance.now();

        // Animación de Barras
        setTimeout(() => {
            bars.forEach(b => {
                let target = b.getAttribute('data-width') || '0';
                // Asegurar que solo sea el número para concatenar %
                target = target.toString().replace('%', '');
                b.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                b.style.width = target + '%';
            });
        }, 100);

        // Animación de Contadores Numéricos
        const updateCounters = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target')) || 0;
                counter.innerText = Math.round(progress * target) + '%';
            });

            if (progress < 1) {
                requestAnimationFrame(updateCounters);
            }
        };
        requestAnimationFrame(updateCounters);
    };

    animateAll();
    setInterval(animateAll, 30000);
}

function typeEffect(el, txt, speed) {
    let i = 0; el.innerHTML = '';
    const timer = setInterval(() => {
        if (i < txt.length) { el.append(txt.charAt(i)); i++; } else clearInterval(timer);
    }, speed);
}

function initPrintLogic() {
    const modal = document.getElementById('print-modal');
    window.printCV = () => {
        const modal = document.getElementById('print-modal');
        // Forzar colores de impresión masivos directamente
        document.documentElement.style.webkitPrintColorAdjust = 'exact';
        document.documentElement.style.printColorAdjust = 'exact';

        modal.classList.remove('hidden');
        window.onafterprint = () => {
            document.documentElement.style.webkitPrintColorAdjust = '';
            document.documentElement.style.printColorAdjust = '';
        };
    };
    window.closeModal = () => modal.classList.add('hidden');
    window.confirmPrint = () => {
        window.closeModal();
        // Asegurar que las barras estén llenas para la impresión
        document.querySelectorAll('.skill-progress').forEach(b => {
            const w = b.getAttribute('data-width');
            if (w) b.style.width = w + '%';
        });
        setTimeout(() => window.print(), 500);
    };
}
