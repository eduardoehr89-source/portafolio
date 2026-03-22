/**
 * CV Digital - Said Herrera
 * Lógica modular para interactividad, modo oscuro y asistente virtual.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initPrintLogic();
    loadExternalData();
    initProfileCarousel();
    if (window.lucide) lucide.createIcons();
});

/* =========================================
   PROFILE IMAGE CAROUSEL
   ========================================= */
let profileCarouselInterval;
let currentProfileIndex = 1;

function initProfileCarousel() {
    startProfileCarousel();
}

function startProfileCarousel() {
    if (profileCarouselInterval) clearInterval(profileCarouselInterval);
    profileCarouselInterval = setInterval(() => {
        executeProfileTransition(1);
    }, 6000);
}

function executeProfileTransition(direction) {
    const frontImg = document.getElementById('cv-profile-front');
    const backImg = document.getElementById('cv-profile-back');
    if (!frontImg || !backImg) return;

    const basePath = 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/89cc64fe4d59fd4266acd84373a379e89b341bd2/CV/fotos%20de%20perfil/';
    const totalImages = 18;

    // Determinamos el siguiente índice basándonos en la dirección
    currentProfileIndex = currentProfileIndex + direction;
    if (currentProfileIndex > totalImages) currentProfileIndex = 1;
    if (currentProfileIndex < 1) currentProfileIndex = totalImages;

    const nextImgStr = currentProfileIndex.toString().padStart(2, '0');
    const nextSrc = `${basePath}profile_optimized_${nextImgStr}.jpg`;

    // 1. Colocamos la SIGUIENTE imagen en el fondo (backImg)
    backImg.src = nextSrc;

    // 2. Transición de fundido
    setTimeout(() => {
        frontImg.style.opacity = '0';
        
        setTimeout(() => {
            frontImg.style.transition = 'none';
            frontImg.src = backImg.src;
            frontImg.style.opacity = '1';
            void frontImg.offsetWidth; // Force Reflow
            frontImg.style.transition = 'opacity 2500ms ease-in-out, transform 10000ms ease-out';
        }, 2500);
    }, 100);
}

// Función global para navegación manual
window.navigateProfile = function(direction) {
    executeProfileTransition(direction);
    // Al navegar manualmente, reiniciamos el contador para que no salte de inmediato
    startProfileCarousel();
};

/* =========================================
   DATA LOADING (CSV Parsing)
   ========================================= */
const timestamp = `v_forced_${Date.now()}`;
const CSV_URLS = {
    experiencia: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/CV/Experiencia%20laboral_cv.csv?t=${timestamp}`,
    formacion: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/CV/Formaci%C3%B3n%20acad%C3%A9mica_cv.csv?t=${timestamp}`,
    software: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/Software_portafolio.csv?t=${timestamp}`,
    habilidades: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/CV/Soft%20skills_cv.csv?t=${timestamp}`,
    contacto: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/CV/Contacto_cv.csv?t=${timestamp}`,
    perfil: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/CV/Perfil%20Profesional_cv.csv?t=${timestamp}`,
    proyectos_global: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/refs/heads/master/Proyectos_portafolio.csv?t=${timestamp}`,
    disciplinas_global: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/Disciplinas_portafolio.csv?t=${timestamp}`,
    normas: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/Normativas%20y%20Est%C3%A1ndares_portafolio.csv?t=${timestamp}`,
    summary: `https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/Resumen_portafolio.csv?t=${timestamp}`
};
const CLOUD_BADGE_BASE = 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/CV/insignias/';
const CLOUD_ASSET_BASE = 'https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/';

async function loadExternalData() {
    try {
        // Cache horaria para evitar descargas innecesarias (Cambia cada 60 min)
        const cacheHour = Math.floor(Date.now() / (1000 * 60 * 60));
        const ts = `v1-${cacheHour}`;
        const [expData, formData, softData, habData, contactData, profileData, projectsGlobal, disciplinesGlobal, normsData, summaryData] = await Promise.all([
            fetchCSV(CSV_URLS.experiencia),
            fetchCSV(CSV_URLS.formacion),
            fetchCSV(CSV_URLS.software),
            fetchCSV(CSV_URLS.habilidades),
            fetchCSV(CSV_URLS.contacto),
            fetchCSV(CSV_URLS.perfil),
            fetchCSV(CSV_URLS.proyectos_global),
            fetchCSV(CSV_URLS.disciplinas_global),
            fetchCSV(CSV_URLS.normas),
            fetchCSV(CSV_URLS.summary)
        ]);

        const safeRender = (fn, ...args) => {
            try { fn(...args); } catch (e) { console.warn(`Render error:`, e); }
        };

        safeRender(renderExperience, expData);
        safeRender(renderEducation, formData, softData);
        safeRender(renderSoftware, softData);
        safeRender(renderSkills, habData);
        safeRender(renderProfile, profileData);
        safeRender(renderSidebarPortfolioLink);
        safeRender(renderContact, contactData);

        // Renderizar estadísticas del sidebar
        safeRender(renderStatsTypology, projectsGlobal);
        safeRender(renderStatsDisciplines, projectsGlobal, disciplinesGlobal);
        safeRender(renderNorms, normsData);
        safeRender(renderSummaryModal, summaryData);


        if (window.lucide) lucide.createIcons();
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
    // v50.54 - Refinamiento de Resumen + Ancho 1400px
    if (parsed.length === 0 && text.trim().length > 0) {
        // Limpiamos comillas extremas si el texto las trae (evita duplicación si el CSV viene con "Texto")
        return text.trim().replace(/^"+|"+$/g, '').trim();
    }
    return parsed;
}

const normalizeStr = (str) => {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "") // Solo alfanuméricos para evitar fallos de codificación
        .trim();
};

const getVal = (item, ...keys) => {
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
};

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
        const urlEmpresa = getVal(job, 'URL', 'Link', 'URL Empresa', 'URL Página', 'URL Pagina');
        
        // El usuario pide que CEMEX envíe a cemexmexico.com y se lea del CSV si es posible
        const mainUrl = (empresa.toUpperCase().includes('CEMEX')) ? 'https://www.cemexmexico.com/' : urlEmpresa;

        const article = document.createElement('article');
        article.className = 'job-card group';
        article.innerHTML = `
            <div class="flex justify-between items-center mb-0.5">
                <h4 class="text-xs font-bold text-gray-800 dark:text-white flex items-center">
                    ${puesto.includes('Modelador BIM Senior') ? `
                    <div class="premium-pulse-container pulse-blue">
                        <span class="premium-pulse-aura"></span>
                        <span class="premium-pulse-dot"></span>
                    </div>` : '<span class="static-dot"></span>'}
                    ${puesto.replace(/\s*\((.*?)\)/g, ' <span class="font-normal opacity-80 ml-1.5">($1)</span>')}
                </h4>
                <div class="text-right flex items-center gap-2">
                    <span class="text-[0.6rem] text-blue-600 dark:text-blue-400 whitespace-nowrap">${duration}</span>
                    <span class="text-[0.6rem] text-gray-400 dark:text-gray-500 whitespace-nowrap">(${periodo})</span>
                </div>
            </div>
            
            ${mainUrl ? 
                `<a href="${mainUrl}" target="_blank" class="text-[0.65rem] font-semibold text-gray-500 dark:text-gray-400 italic mb-2.5 hover:text-blue-500 dark:hover:text-blue-300 transition-colors flex items-center gap-1 group/emp-link">
                    ${empresa}
                    <i class="fas fa-external-link-alt text-[0.45rem] opacity-0 group-hover/emp-link:opacity-100 transition-opacity"></i>
                </a>` :
                `<p class="text-[0.65rem] font-semibold text-gray-500 dark:text-gray-400 italic mb-2.5">${empresa}</p>`
            }

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

function renderEducation(data, softwareData = []) {
    const gridContainer = document.getElementById('education-grid');
    const listContainer = document.getElementById('education-list');
    const certsContainer = document.getElementById('certifications-badges-container');

    if (!Array.isArray(data)) return;
    if (gridContainer) gridContainer.innerHTML = '';
    if (listContainer) listContainer.innerHTML = '';
    if (certsContainer) certsContainer.innerHTML = '';

    const whitelist = [
        'iso19650',
        'buildingsmart',
        'aimaster',
        'mastersuperior',
        'plannerly',
        'bimcollab'
    ];

    const educationRecords = data.filter(edu => {
        const name = normalizeStr(getVal(edu, 'Nombre', 'Titulo'));
        const cat = normalizeStr(getVal(edu, 'Categoria', 'Categoría'));
        const st = normalizeStr(getVal(edu, 'Estado', 'estado') + ' ' + getVal(edu, 'periodo'));
        
        // Filtro Nuclear para BCF en CV
        const rawJson = JSON.stringify(edu).toLowerCase();
        if (rawJson.includes('bcf') || rawJson.includes('bc manager') || name.includes('bcf')) return false;

        const isAcademic = cat.includes('master') || cat.includes('licenciatura') || cat.includes('ingenieria') || cat.includes('grado') || cat.includes('academico') || cat.includes('diploma');
        const isOngoing = st.includes('curso') || st.includes('cruso') || st.includes('presente');
        const isWhitelisted = whitelist.some(w => name.includes(w));

        if (name.includes('cursobimcollabids') || name.includes('bimcollabids') || name.includes('gettingstarted') || 
            name.includes('webviewer') || name.includes('zoom') || name.includes('smartproperties') || name.includes('issuemanagement') || name.includes('idscourse')) return false;

        // Permitir si es académico de alto nivel (Grados)
        // O si es un curso/especialización pero está en la whitelist
        if (isAcademic && !cat.includes('curso')) return true;
        if (isWhitelisted) return true;
        if (isOngoing && isWhitelisted) return true; 
        
        if (name.includes('dynamo') || name.includes('solibri')) return true;

        return false;
    });

    const certificationRecords = data.filter(edu => {
        const name = normalizeStr(getVal(edu, 'Nombre', 'Titulo'));
        const estado = normalizeStr(getVal(edu, 'Estado', 'estado') + ' ' + getVal(edu, 'periodo'));
        
        // Filtro Nuclear para BCF en CV (Badges)
        const rawJson = JSON.stringify(edu).toLowerCase();
        if (rawJson.includes('bcf') || rawJson.includes('bc manager') || name.includes('bcf')) return false;

        if (name.includes('cursobimcollabids') || name.includes('bimcollabids') || name.includes('gettingstarted') || 
            name.includes('webviewer') || name.includes('zoom') || name.includes('smartproperties') || name.includes('issuemanagement') || name.includes('idscourse')) return false;
        
        return whitelist.some(w => name.includes(w)) && !estado.includes('curso') && !estado.includes('presente') && !name.includes('aimaster');
    });

    // 1. RENDER EDUCATION (MASTERS/DEGREES)
    educationRecords.sort((a, b) => {
        const getYear = (item) => {
            const val = getVal(item, 'Periodo') || '';
            if (val.toLowerCase().includes('presente')) return new Date().getFullYear() + 1;
            const years = val.match(/\d{4}/g);
            return years ? Math.max(...years.map(Number)) : 0;
        };
        return getYear(b) - getYear(a);
    });

    educationRecords.forEach((edu, idx) => {
        const estado = getVal(edu, 'Estado', 'estado', 'Periodo', 'periodo');
        const titulo = getVal(edu, 'Nombre', 'Titulo');
        const institucion = getVal(edu, 'Institucion', 'Institución');
        const periodo = getVal(edu, 'Periodo');
        const ubicacion = getVal(edu, 'Ubicacion', 'Ubicación', 'ubicacion ', 'ubicacion');
        const credencial = getVal(edu, 'ID / Credencial', 'Credencial');
        const archivos = getVal(edu, 'Archivos', 'archivos', 'url archivo ', 'url archivo') || '';

        // Buscar si hay un archivo de imagen de badge (cualquier imagen en la lista de archivos)
        let badgeFile = archivos.split(',').map(s => s.trim()).find(s => {
            const low = s.toLowerCase();
            return low.endsWith('.png') || low.endsWith('.jpg') || low.endsWith('.svg') || low.includes('badge');
        });

        // Forzar badges específicos si no se detectan (para asegurar transparencia y ocultar texto)
        const lowTitle = normalizeStr(titulo);
        if (lowTitle.includes('mastersuperior')) {
            badgeFile = 'BIM Master Program_certificate_badge.png';
        } else if (lowTitle.includes('aimaster')) {
            badgeFile = 'AI Master Program_candidate_badge.png';
        } else if (lowTitle.includes('buildingsmart')) {
            badgeFile = 'buildingSMART_Professional_Certification-Entry_Badge_(Spanish).png';
        } else if (lowTitle.includes('level1')) {
            badgeFile = '01_Basics_badge.png';
        } else if (lowTitle.includes('level2')) {
            badgeFile = '02_Advanced_badge.png';
        } else if (lowTitle.includes('level3')) {
            badgeFile = '03_Expert_badge.png';
        } else if (lowTitle.includes('troublemaker')) {
            badgeFile = '05_Digital Troublemaker_badge.png';
        } else if (lowTitle.includes('bcfmanager')) {
            badgeFile = 'BCF-manager-revit_certificate.png';
        }

        const isOngoing = estado.toLowerCase().includes('curso') || estado.toLowerCase().includes('cruso') || estado.toLowerCase().includes('presente');
        if (isOngoing && gridContainer) {
            let iconClass = 'fa-graduation-cap';
            const normalizedTitle = normalizeStr(titulo);
            if (normalizedTitle.includes('dynamo')) iconClass = 'fa-laptop-code'; 
            if (normalizedTitle.includes('solibri')) iconClass = 'fa-check-double';   

            const urlPagina = getVal(edu, 'URL Página', 'URL Pagina');
            // Crear insignia circular personalizada para Dynamo/Solibri si no hay imagen
            let customBadge = '';
            const isCustom = normalizedTitle.includes('dynamo') || normalizedTitle.includes('solibri');
            if (!badgeFile && isCustom) {
                const shortTitle = normalizedTitle.includes('dynamo') ? 'DYNAMO' : 'SOLIBRI';
                customBadge = `
                    <div class="relative w-[95px] h-[95px] rounded-full bg-[#1a202c] [.light-theme_&]:bg-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <span class="text-[10px] font-black text-white tracking-[0.2em] uppercase text-center px-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">${shortTitle}</span>
                    </div>`;
            }

            let badgeImg = badgeFile ? `
                <div class="relative w-[120px] h-[120px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <svg viewBox="0 0 120 120" class="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <path id="curve-ongoing-${idx}" d="M 60, 60 m -54, 0 a 54,54 0 1,1 108,0 a 54,54 0 1,1 -108,0" fill="transparent" />
                        <text class="text-[7.5px] font-bold fill-gray-400 [.light-theme_&]:fill-gray-800 font-mono uppercase tracking-[0.2em]">
                            <textPath href="#curve-ongoing-${idx}" startOffset="50%" text-anchor="middle">${institucion}</textPath>
                        </text>
                    </svg>
                    <img src="${(badgeFile && (badgeFile.includes('http://') || badgeFile.includes('https://'))) ? badgeFile : `${CLOUD_BADGE_BASE}${encodeURIComponent(badgeFile)}?t=${timestamp}`}" class="w-[95px] h-[95px] object-contain relative z-10 transition-transform duration-500">
                </div>
            ` : (customBadge ? `
                <div class="relative w-[120px] h-[120px] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 120 120" class="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <path id="curve-ongoing-${idx}" d="M 60, 60 m -54, 0 a 54,54 0 1,1 108,0 a 54,54 0 1,1 -108,0" fill="transparent" />
                        <text class="text-[7.5px] font-bold fill-gray-400 [.light-theme_&]:fill-gray-800 font-mono uppercase tracking-[0.2em]">
                            <textPath href="#curve-ongoing-${idx}" startOffset="50%" text-anchor="middle">${institucion}</textPath>
                        </text>
                    </svg>
                    ${customBadge}
                </div>
            ` : `<i class="fas ${iconClass} text-xl text-gray-400 dark:text-white group-hover:scale-110 transition-transform mt-0.5"></i>`);
            
            // Si tiene URL de página, envolver en enlace
            if (urlPagina) {
                badgeImg = `<a href="${urlPagina}" target="_blank" class="hover:scale-105 transition-transform inline-block">${badgeImg}</a>`;
            }

            const isAIMaster = titulo.toLowerCase().includes('ai master');
            const hideText = isAIMaster || isCustom;
            gridContainer.innerHTML += `
                <div class="future-study group flex flex-row items-center gap-3">
                    ${badgeImg}
                    <div class="flex flex-col ${hideText ? 'hidden' : ''}">
                        <p class="text-[0.6rem] font-bold uppercase tracking-wider">${titulo}</p>
                        ${urlPagina ? 
                            `<a href="${urlPagina}" target="_blank" class="text-[0.55rem] text-gray-500 dark:text-gray-400 normal-case leading-tight hover:text-sky-900 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 group/inst-link">
                                ${institucion}
                                <i class="fas fa-external-link-alt text-[0.4rem] opacity-0 group-hover/inst-link:opacity-100 transition-opacity"></i>
                            </a>` :
                            `<p class="text-[0.55rem] text-gray-500 dark:text-gray-400 normal-case leading-tight">${institucion}</p>`
                        }
                        <p class="text-[0.5rem] text-gray-400 dark:text-gray-500 font-normal opacity-80 leading-none mt-0.5">${ubicacion}</p>
                    </div>
                </div>
            `;
        } else if (listContainer) {
            const isWhitelisted = whitelist.some(w => normalizeStr(titulo).includes(w));
            if (isWhitelisted && badgeFile) return;

            const urlPagina = getVal(edu, 'URL Página', 'URL Pagina');
            const urlArchivo = getVal(edu, 'URL Archivo', 'Archivo', 'url archivo ', 'url archivo');
            
            // Determinar si es una imagen para abrir en modal (SOLO para el certificado/archivo)
            const isImageCert = urlArchivo && (urlArchivo.toLowerCase().endsWith('.png') || urlArchivo.toLowerCase().endsWith('.jpg') || urlArchivo.toLowerCase().endsWith('.jpeg'));

            const li = document.createElement('li');
            li.innerHTML = `
                <div class="flex flex-col mb-1.5">
                    <div class="flex items-center justify-between">
                        ${urlPagina ? 
                            `<a href="${urlPagina}" target="_blank" class="text-[0.65rem] text-gray-800 dark:text-gray-200 font-bold hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group/inst-link">
                                ${institucion}
                                <i class="fas fa-external-link-alt text-[0.4rem] opacity-0 group-hover/inst-link:opacity-100 transition-opacity"></i>
                            </a>` : 
                            `<strong class="text-[0.65rem] text-gray-800 dark:text-gray-200">${institucion}</strong>`
                        }
                        <span class="text-[0.55rem] text-gray-400 font-mono">${periodo}</span>
                    </div>
                    <div class="flex items-center justify-start gap-2">
                        ${urlArchivo ? 
                            `<a href="${isImageCert ? 'javascript:void(0)' : urlArchivo}" 
                                ${isImageCert ? `onclick="openCertModal('${urlArchivo}', '${titulo}')"` : 'target="_blank"'}
                                class="text-[0.65rem] text-gray-500 dark:text-gray-400 hover:underline italic flex items-center gap-1 group/edu-link truncate max-w-[70%]">
                                ${titulo}
                                <i class="fas ${isImageCert ? 'fa-search-plus' : 'fa-external-link-alt'} text-[0.4rem] opacity-0 group-hover/edu-link:opacity-100 transition-opacity"></i>
                            </a>` : 
                            `<span class="text-[0.65rem] text-gray-500 dark:text-gray-400 italic truncate max-w-[70%]">${titulo}</span>`
                        }
                        ${credencial && credencial !== 'N/A' ? `<span class="text-[0.5rem] text-gray-400 opacity-70 font-mono whitespace-nowrap shrink-0">ID: ${credencial}</span>` : ''}
                    </div>
                </div>
            `;
            listContainer.appendChild(li);
        }
    });

    // 2. RENDER CERTIFICATIONS AS BADGES
    if (certsContainer) {
        // Orden personalizado: Butic (1), buildingSMART (2), Plannerly (3)
        const orderMap = {
            'mastersuperior': 1,
            'aimaster': 1,
            'buildingsmart': 2,
            'iso19650': 3,
            'plannerly': 3
        };

        const sortedCerts = [...certificationRecords].sort((a, b) => {
            const nameA = normalizeStr(getVal(a, 'Nombre', 'Titulo'));
            const nameB = normalizeStr(getVal(b, 'Nombre', 'Titulo'));
            
            const orderA = Object.keys(orderMap).find(k => nameA.includes(k)) ? orderMap[Object.keys(orderMap).find(k => nameA.includes(k))] : 99;
            const orderB = Object.keys(orderMap).find(k => nameB.includes(k)) ? orderMap[Object.keys(orderMap).find(k => nameB.includes(k))] : 99;
            
            return orderA - orderB;
        });

        sortedCerts.forEach((cert, idx) => {
            const nombre = getVal(cert, 'Nombre');
            const institucion = getVal(cert, 'Institucion', 'Institución');
            const archivos = getVal(cert, 'Archivos', 'archivos', 'url archivo ', 'url archivo') || '';
            const urlPagina = getVal(cert, 'URL Página', 'URL Pagina');
            const urlArchivo = getVal(cert, 'URL Archivo', 'URL Archivo', 'url archivo ', 'url archivo');
            const idCredencial = getVal(cert, 'ID / Credencial');
            const estado = getVal(cert, 'Estado', 'estado') + ' ' + getVal(cert, 'periodo');

            // Determinar link prioritario: URL de página > URL de archivo
            const mainLink = urlPagina || urlArchivo || '#';

            // Buscar si hay un archivo de imagen de badge (cualquier imagen en la lista de archivos)
            let badgeFile = archivos.split(',').map(s => s.trim()).find(s => {
                const low = s.toLowerCase();
                return low.endsWith('.png') || low.endsWith('.jpg') || low.endsWith('.svg') || low.includes('badge');
            });
            
            // Forzar badge específico para Master Superior / Master Program
            if (!badgeFile && (normalizeStr(nombre).includes('master') || normalizeStr(nombre).includes('superior'))) {
                badgeFile = 'BIM Master Program_certificate_badge.png';
            }
            // Forzar badge específico para AI Master si no se detecta uno
            if (!badgeFile && normalizeStr(nombre).includes('aimaster')) {
                badgeFile = 'AI Master Program_candidate_badge.png';
            }
            // Forzar buildingSMART
            if (!badgeFile && normalizeStr(nombre).includes('buildingsmart')) {
                badgeFile = 'buildingSMART_Professional_Certification-Entry_Badge_(Spanish).png';
            }
            // Forzar Plannerly Level 1, 2, 3
            if (!badgeFile && normalizeStr(nombre).includes('level1')) {
                badgeFile = '01_Basics_badge.png';
            }
            if (!badgeFile && normalizeStr(nombre).includes('level2')) {
                badgeFile = '02_Advanced_badge.png';
            }
            if (!badgeFile && (normalizeStr(nombre).includes('level3') || normalizeStr(nombre).includes('expert'))) {
                badgeFile = '03_Expert_badge.png';
            }
            if (!badgeFile && (normalizeStr(nombre).includes('bootcamp') || normalizeStr(nombre).includes('boot camp'))) {
                badgeFile = '04_BIM Boot Camp_badge_2.png';
            }
            if (!badgeFile && normalizeStr(nombre).includes('troublemaker')) {
                badgeFile = '05_Digital Troublemaker_badge.png';
            }
            // Forzar BCF Manager (BIMcollab)
            if (!badgeFile && normalizeStr(nombre).includes('bcfmanager')) {
                badgeFile = 'BCF-manager-revit_certificate.png';
            }
            
            let badgeHtml = '';
            if (badgeFile) {
                // Badge con imagen + Texto Curvo (Ocultando para BIMcollab)
                const isBimCollab = normalizeStr(nombre).includes('bimcollab') || normalizeStr(institucion).includes('bimcollab');
                
                // Forzar URLs exactas para casos críticos reportados por el usuario
                let finalBadgeSrc = (badgeFile && (badgeFile.includes('http://') || badgeFile.includes('https://'))) ? badgeFile : `${CLOUD_BADGE_BASE}${encodeURIComponent(badgeFile)}?t=${timestamp}`;
                
                if (normalizeStr(nombre).includes('master') || normalizeStr(nombre).includes('superior')) {
                    finalBadgeSrc = "https://raw.githubusercontent.com/eduardoehr89-source/portafolio/c6e71f8f5be8c62df3bb908336bbcb1930351217/CV/insignias/BIM%20Master%20Program_certificate_badge.png";
                } else if (normalizeStr(nombre).includes('expert') || normalizeStr(nombre).includes('level3')) {
                    finalBadgeSrc = "https://raw.githubusercontent.com/eduardoehr89-source/portafolio/c6e71f8f5be8c62df3bb908336bbcb1930351217/CV/insignias/03_Expert_badge.png";
                }

                const svgContent = isBimCollab ? '' : `
                        <svg viewBox="0 0 120 120" class="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <path id="curve-cert-${idx}" d="M 60, 60 m -54, 0 a 54,54 0 1,1 108,0 a 54,54 0 1,1 -108,0" fill="transparent" />
                            <text class="text-[8px] font-black fill-gray-400 [.light-theme_&]:fill-gray-800 font-mono uppercase tracking-[0.25em]">
                                <textPath href="#curve-cert-${idx}" startOffset="50%" text-anchor="middle">${institucion}</textPath>
                            </text>
                        </svg>`;

                badgeHtml = `
                    <div class="relative group/cert cursor-pointer flex items-center justify-center w-[120px] h-[120px]">
                        ${svgContent}
                        <img src="${finalBadgeSrc}" alt="${nombre}" 
                             class="w-[95px] h-[95px] object-contain group-hover/cert:scale-110 transition-all duration-500 relative z-10"
                             onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/eduardoehr89-source/portafolio/master/CV/insignias/badge_generic.png';">
                        <div class="glass-tooltip !bottom-[120%] !left-1/2 !-translate-x-1/2">
                            <strong class="text-blue-500 [.dark_&]:text-blue-400 block mb-0.5 text-[0.6rem]">${institucion}</strong>
                            <p class="text-[0.65rem] mb-1 font-bold leading-tight">${nombre}</p>
                            <span class="text-[0.5rem] opacity-70 block border-t border-current/10 pt-1 uppercase">${estado} ${idCredencial !== 'N/A' ? `// ID: ${idCredencial}` : ''}</span>
                        </div>
                    </div>
                `;
            } else {
                // Si no tiene badge imagen, no mostrar nada en la sección de destacadas
                return;
            }

            // Determinar si es BIMcollab para el modal
            const isBimCollab = normalizeStr(nombre).includes('bimcollab') || normalizeStr(institucion).includes('bimcollab');
            
            // Corregir URL de GitHub para el modal si es necesario
            let finalUrlForModal = urlArchivo;
            if (finalUrlForModal && finalUrlForModal.includes('github.com') && finalUrlForModal.includes('/blob/')) {
                finalUrlForModal = finalUrlForModal.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
            }

            const isImageFilter = finalUrlForModal && (
                finalUrlForModal.toLowerCase().includes('.png') || 
                finalUrlForModal.toLowerCase().includes('.jpg') || 
                finalUrlForModal.toLowerCase().includes('.jpeg')
            );
            const canOpenModal = isBimCollab && finalUrlForModal && isImageFilter;

            const wrapper = document.createElement('a');
            if (canOpenModal) {
                wrapper.href = 'javascript:void(0)';
                wrapper.onclick = (e) => {
                    e.preventDefault();
                    if (window.openCertModal) {
                        window.openCertModal(finalUrlForModal, nombre);
                    } else {
                        window.open(mainLink, '_blank');
                    }
                };
            } else {
                wrapper.href = mainLink;
                wrapper.target = "_blank";
            }
            wrapper.className = "flex-shrink-0 no-underline";
            wrapper.innerHTML = badgeHtml;
            certsContainer.appendChild(wrapper);
        });
    }
}

function renderMiniFicha(nombre, institucion, id, estado = 'Finalizado') {
    // Iniciales o icono según institución
    let icon = 'fa-certificate';
    if (institucion.toLowerCase().includes('bimcollab')) icon = 'fa-compass';
    if (institucion.toLowerCase().includes('udemy')) icon = 'fa-play-circle';
    
    return `
        <div class="relative group/cert cursor-pointer">
            <div class="w-10 h-10 rounded border border-cyan-500/30 dark:border-cyan-400/20 bg-cyan-500/5 dark:bg-cyan-400/5 flex flex-col items-center justify-center p-1 group-hover/cert:border-cyan-400 transition-colors shadow-sm">
                <i class="fas ${icon} text-sky-900 dark:text-cyan-400 group-hover/cert:text-white text-xs mb-0.5"></i>
                <span class="text-[0.35rem] text-sky-900 dark:text-cyan-300 font-mono text-center leading-none uppercase truncate w-full font-bold">${institucion.split(' ')[0]}</span>
            </div>
            <div class="glass-tooltip !bottom-[115%] !left-1/2 !-translate-x-1/2">
                <strong class="text-blue-500 [.dark_&]:text-blue-400 block mb-0.5 text-[0.6rem]">${institucion}</strong>
                <p class="text-[0.65rem] mb-1 font-bold leading-tight">${nombre}</p>
                <span class="text-[0.5rem] opacity-70 block border-t border-current/10 pt-1 uppercase">${estado} ${id !== 'N/A' && id ? `// ID: ${id}` : ''}</span>
            </div>
        </div>
    `;
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

    const levelToPct = {
        'Experto': 98, 'Alto': 90, 'Avanzado': 85, 'Medio': 75,
        'Bajo': 65, 'Básico': 55, 'Basico': 55, '': 0
    };

    const sortedPrincipal = [...principalData].sort((a, b) => {
        const valA = getVal(a, '% Dominio', 'Porcentaje', 'dominio');
        const valB = getVal(b, '% Dominio', 'Porcentaje', 'dominio');
        const pctA = parseInt(valA.replace('%', '')) || 0;
        const pctB = parseInt(valB.replace('%', '')) || 0;
        if (pctB !== pctA) return pctB - pctA;
        return getVal(a, 'Nombre', 'Item').toLowerCase().localeCompare(getVal(b, 'Nombre', 'Item').toLowerCase());
    });

    const sortedSecundario = [...secundarioData].sort((a, b) => {
        return getVal(a, 'Nombre', 'Item').localeCompare(getVal(b, 'Nombre', 'Item'));
    });

    sortedPrincipal.forEach(sw => {
        const nombre = getVal(sw, 'Nombre', 'Item', 'Software');
        const nivel = getVal(sw, 'Nivel');
        const capacidad = getVal(sw, 'Capacidad');
        let rawPct = getVal(sw, '% Dominio', 'Porcentaje Dominio', 'Porcentaje', 'dominio', 'Detalle');
        let porcentaje = parseInt(rawPct.replace('%', ''));
        if (!porcentaje || isNaN(porcentaje)) porcentaje = levelToPct[nivel] || 0;
        let displayNombre = nombre;
        if (nombre.toLowerCase() === 'revit') {
            displayNombre = `Revit <span class="sidebar-subtext font-light lowercase">(multidisciplina)</span>`;
        }
        mainContainer.innerHTML += `
            <div class="group relative cursor-help flex items-center gap-3 mb-1">
                <span class="text-[0.6rem] text-gray-100 dark:text-gray-200 w-24 shrink-0 truncate">${displayNombre}</span>
                <div class="skill-bar flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden mt-0">
                    <div class="skill-progress h-full bg-blue-500 rounded-full transition-all duration-1000" 
                         data-width="${porcentaje}" style="width: 0%"></div>
                </div>
                <div class="glass-tooltip">
                    <strong class="text-blue-500 [.dark_&]:text-blue-400 block mb-1 text-[0.6rem]">Nivel: ${nivel}</strong>
                    <p class="mb-1 opacity-90">${capacidad}</p>
                </div>
            </div>
        `;
    });

        secondaryContainer.innerHTML = `
            <div class="flex flex-wrap gap-1 w-full">
                ${sortedSecundario.map(sw => {
                    const nombre = getVal(sw, 'Nombre', 'Item', 'Software');
                    const nivel = getVal(sw, 'Nivel');
                    const desc = getVal(sw, 'Descripción', 'Descripcion', 'desc');
                    const capacidad = getVal(sw, 'Capacidad');
                    return `
                        <div class="soft-skill-tag group relative cursor-help py-1 px-1.5 grow min-w-[50px]">
                            <span class="block px-1 text-center" title="${nombre}">${nombre}</span>
                            <div class="glass-tooltip">
                                <strong class="text-blue-500 [.dark_&]:text-blue-400 block mb-1 text-[0.6rem]">Nivel: ${nivel}</strong>
                                <p class="mb-1 opacity-90">${capacidad || desc || ''}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
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
            emailEl.innerHTML = `${detalle} <i class="fas fa-external-link-alt text-[0.45rem] text-gray-400 ml-1"></i>`;
            emailEl.href = `mailto:${detalle}`;
        }
        if (campo.includes('telefono') && phoneEl) {
            const cleanPhone = detalle.replace(/\D/g, '');
            let formattedPhone = detalle;
            if (cleanPhone.length === 12) {
                formattedPhone = `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 4)} ${cleanPhone.slice(4, 8)} ${cleanPhone.slice(8)}`;
            }
            phoneEl.innerHTML = `${formattedPhone} <i class="fas fa-external-link-alt text-[0.45rem] text-gray-400 ml-1"></i>`;
            phoneEl.href = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';
        }
        if (campo.includes('ubicacion') && locationEl) {
            locationEl.innerHTML = `${detalle}<br><span class="block text-gray-500 font-normal italic uppercase text-[0.55rem] mt-0.5">INTERESADO EN TRABAJO REMOTO</span>`;
        }
        if (campo.includes('linkedin') && linkedinEl) {
            linkedinEl.innerHTML = `${detalle.replace('linkedin.com/in/', '/in/')} <i class="fas fa-external-link-alt text-[0.45rem] text-gray-400 ml-1"></i>`;
            linkedinEl.href = detalle.startsWith('http') ? detalle : `https://${detalle}`;
        }
        if (campo.includes('nacionalidad') && nacionalidadEl) {
            nacionalidadEl.innerHTML = `<span class="text-white/90">${detalle}</span><br><span class="font-extralight text-white/90 tracking-widest text-[0.45rem] mt-0.5 inline-block not-italic">10+ AÑOS EXP. | 40+ PROYECTOS | 20+ CIUDADES</span>`;
        }
    });

    const qrContainer = document.getElementById('qrcode-container');
    const targetLinkedin = document.getElementById('contact-linkedin');
    if (qrContainer && targetLinkedin && targetLinkedin.href) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(targetLinkedin.href)}`;
        qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR LinkedIn" class="w-full h-full object-contain">`;
    }
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
        // Limpiamos comillas residuales antes de renderizar (asegurar una sola " al inicio/final)
        let cleanText = text.replace(/^"+|"+$/g, '').trim();
        
        // Resaltar Inteligencia Artificial
        const highlightedText = cleanText.replace(/Inteligencia Artificial/gi, '<strong>Inteligencia Artificial</strong>');
        
        // Renderizar con comillas únicas y en cursiva (solo el párrafo)
        el.innerHTML = `"${highlightedText}"`;
        el.className = "italic block text-gray-600 dark:text-gray-400"; 
    }
}

function renderNorms(data) {
    const container = document.getElementById('normas-list');
    if (!container || !Array.isArray(data)) return;
    container.innerHTML = '';

    // Selección de normativas destacadas con nombres de ficha simplificados
    const important = ['ISO 19650', 'BEP', 'IFC / COBie', 'LOD', 'EIR', 'ISO 7817 (LOIN)'];

    const seenKeywords = new Set();
    const filtered = [];

    data.forEach(item => {
        const title = getVal(item, 'Título', 'Title');
        important.forEach(imp => {
            // Coincidencia parcial para agrupar (ej: 'BEP' coincide con 'BEP Pre-appointment')
            if (title.includes(imp) && !seenKeywords.has(imp)) {
                seenKeywords.add(imp);
                filtered.push({
                    item,
                    displayTitle: imp
                });
            }
        });
    });

    // Ordenar según el array 'important'
    filtered.sort((a, b) => {
        return important.indexOf(a.displayTitle) - important.indexOf(b.displayTitle);
    });

    container.innerHTML = filtered.map(({item, displayTitle}) => {
        const desc = getVal(item, 'Descripción', 'Descripcion');
        
        return `
            <div class="soft-skill-tag group relative cursor-help py-1 px-1.5 grow min-w-[65px]">
                <span class="block px-1 text-center font-bold tracking-tight">${displayTitle}</span>
                <div class="glass-tooltip !w-48">
                    <strong class="text-blue-500 [.dark_&]:text-blue-400 block mb-1 text-[0.65rem]">Normativa BIM</strong>
                    <p class="mb-1 opacity-90 text-[0.6rem] leading-snug">${desc}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderSidebarPortfolioLink() {
    const container = document.getElementById('sidebar-portfolio-link-container');
    if (!container) return;

    container.innerHTML = `
        <section class="mb-0">
            <h3 class="sidebar-section-title">
                <i data-lucide="globe"></i> Información Completa
            </h3>
            <div class="mt-2 flex flex-col items-center text-center">
                <p class="sidebar-subtext italic mb-1 leading-tight px-2">
                    Para explorar mi informacion profesional completa (Certificaciones, Galería, IA, Proyectos, ROI, etc.), visita mi ecosistema:
                </p>
                <a href="../index.html" class="flex items-center gap-2 group transition-all mb-1 no-print">
                    <span class="text-[0.65rem] font-bold text-blue-400 group-hover:text-blue-300 decoration-dotted underline-offsets-4 hover:underline uppercase tracking-widest leading-none flex items-center">
                        <div class="premium-pulse-container pulse-blue">
                            <span class="premium-pulse-aura"></span>
                            <span class="premium-pulse-dot"></span>
                        </div>
                        BIM.OS <i class="fas fa-external-link-alt text-[0.45rem] text-gray-400 ml-0.5"></i>
                    </span>
                </a>
            </div>
        </section>
    `;
    if (window.lucide) lucide.createIcons();
}

/* =========================================
   SIDEBAR STATISTICS RENDERING
   ========================================= */

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
        // Regex robusto para detectar roles de liderazgo
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
        catDiv.className = 'w-full mb-1';
        catDiv.innerHTML = `
            <div class="flex flex-col gap-1 w-full">
                ${skills.map(skill => {
            const item = getVal(skill, 'Ítem', 'Item');
            const detalle = getVal(skill, 'Detalle');
            const hasDetail = detalle && detalle.length > 5;

            return `
                        <div class="soft-skill-tag group relative cursor-help w-full py-1 px-2">
                            <span class="block w-full text-center" title="${item}">${item}</span>
                            ${hasDetail ? `<div class="glass-tooltip">${detalle}</div>` : ''}
                        </div>
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
        // Limpiar URL para que el próximo F5 resetee a modo oscuro
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    if (btn) btn.onclick = () => {
        const isDark = html.classList.contains('dark');
        set(!isDark);
        if (window.lucide) lucide.createIcons();
    };

    // Iniciar transición suave al cargar (fade-in)
    body.classList.add('page-fade-in');
    setTimeout(() => {
        body.classList.remove('page-fade-in');
        body.style.transform = 'none';
    }, 850);

    // Interceptar enlaces al Portfolio para salida suave con persistencia de tema
    document.addEventListener('click', (e) => {
        const el = e.target.closest('a[href="../index.html"], a[onclick*="window.location.href"], .sidebar-nav button');
        if (el) {
            const rawHref = el.getAttribute('href') || (el.getAttribute('onclick') ? el.getAttribute('onclick').match(/'([^']+)'/)?.[1] : null);
            if (rawHref && (rawHref.includes('index.html') || rawHref === '../')) {
                e.preventDefault();
                body.classList.add('page-fade-out');
                
                // Construir URL con tema
                const theme = getThemeParam();
                const separator = rawHref.includes('?') ? '&' : '?';
                const finalHref = rawHref + separator + theme;

                setTimeout(() => {
                    window.location.href = finalHref;
                }, 400);
            }
        }
    });
}

/* =========================================
   RESUMEN (RESUMEN EJECUTIVO CV)
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

// PDF Download Logic
window.openPdfModal = () => {
    document.getElementById('pdf-modal').classList.remove('hidden');
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

/* =========================================
   RESUMEN (RESUMEN EJECUTIVO CV)
   ========================================= */
window.openSummaryCV = () => {
    const modal = document.getElementById('summary-cv-modal');
    const popup = document.getElementById('summary-cv-popup');

    // Asegurar que light-theme esté sincronizado para las utilidades de color
    if (!document.documentElement.classList.contains('dark')) {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

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

    popup.classList.remove('opacity-100', 'scale-100');
    popup.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 500);
};

// Helper para obtener el parámetro de tema actual
function getThemeParam() {
    return document.body.classList.contains('light-theme') ? 'theme=light' : 'theme=dark';
}

window.goBack = function () {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = `../index.html?${getThemeParam()}`;
    }
};
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
   CERTIFICATE MODAL LOGIC
   ========================================= */
window.openCertModal = function(url, title = "") {
    const modal = document.getElementById('cert-modal');
    const content = document.getElementById('cert-modal-content');
    const modalImg = document.getElementById('cert-modal-img');
    const modalTitle = document.getElementById('cert-modal-title');
    
    if (!modal || !modalImg || !content) return;

    // Convertir URL de GitHub Blob a Raw si es necesario
    let rawUrl = url;
    if (url.includes('github.com') && url.includes('/blob/')) {
        rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }

    modalImg.src = rawUrl;
    if (modalTitle) modalTitle.innerText = title;
    
    // Preparar y mostrar con transición
    modal.classList.remove('hidden');
    
    // Forzar reflow para que la transición funcione
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('opacity-0', 'scale-95');
        content.classList.add('opacity-100', 'scale-100');
    }, 10);

    document.body.style.overflow = 'hidden'; // Bloquear scroll

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

// Navegación rápida
window.switchView = function() {
    window.location.href = `../Portafolio_Resumido/index.html?${getThemeParam()}`;
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
        
        let icon = "box";
        const cleanTitle = normalizeStr(title);
        if (cleanTitle.includes('desarrollo') || cleanTitle.includes('vibe')) icon = "bolt";
        else if (cleanTitle.includes('experiencia')) icon = "history";
        else if (cleanTitle.includes('software')) icon = "code";
        else if (cleanTitle.includes('modelado')) icon = "layer-group";
        else if (cleanTitle.includes('estandar')) icon = "clipboard-check";
        else if (cleanTitle.includes('gemini')) icon = "brain";
        else if (cleanTitle.includes('idioma')) icon = "language";
        else if (cleanTitle.includes('roi') || cleanTitle.includes('ahorro')) icon = "chart-line";
        else if (cleanTitle.includes('formacion') || cleanTitle.includes('master')) icon = "graduation-cap";

        const iconClass = `fas fa-${icon}`;

        return `
            <div class="flex flex-col items-center text-center group transition-all duration-300 min-h-[170px] hover:scale-[1.02] cursor-default p-3 hover:bg-white/5 transition-all">
                <div class="w-full h-[40px] mb-3 flex items-center justify-center flex-shrink-0">
                    <div class="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all duration-300 font-bold text-cyan-400">
                        <i class="${iconClass} text-sm"></i>
                    </div>
                </div>
                <div class="w-full h-[30px] mb-1 flex items-center justify-center flex-shrink-0">
                    <h4 class="text-[9px] font-bold text-gray-500 font-mono tracking-widest uppercase text-center m-0 p-0 leading-none">${title}</h4>
                </div>
                <div class="w-full h-[45px] mb-2 flex items-center justify-center flex-shrink-0">
                    <p class="text-white [.light-theme_&]:text-gray-800 font-bold text-[15px] leading-tight uppercase text-center">${value}</p>
                </div>
                <p class="text-[9px] text-cyan-500/70 font-bold uppercase font-mono mt-auto pt-1">${desc}</p>
            </div>
        `;
    }).join('');
}