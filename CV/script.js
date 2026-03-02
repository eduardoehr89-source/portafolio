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
        initAnimations();
    } catch (error) {
        console.error("Error cargando datos:", error);
        initAnimations();
    }
}

async function fetchCSV(url) {
    const response = await fetch(url);
    const text = await response.text();
    return parseCSV(text);
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 1) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const obj = {};
        headers.forEach((header, i) => {
            let val = values[i] ? values[i].trim() : '';
            if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
            obj[header] = val;
        });
        return obj;
    });
}

/* =========================================
   RENDER FUNCTIONS
   ========================================= */
function renderExperience(data) {
    const container = document.getElementById('experience-container');
    if (!container) return;
    container.innerHTML = '';

    data.forEach(job => {
        const duration = calculateDuration(job.Periodo);
        const article = document.createElement('article');
        article.className = 'job-card group';
        article.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <h4 class="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <i class="fas fa-bolt text-blue-500"></i> ${job.Puesto}
                </h4>
                <div class="text-right flex items-center gap-2">
                    <span class="text-[0.6rem] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">${duration}</span>
                    <span class="text-[0.65rem] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">${job.Periodo}</span>
                </div>
            </div>
            <p class="text-[0.65rem] font-semibold text-gray-500 dark:text-gray-400 italic mb-1">${job.Empresa}</p>
            <p class="text-[0.6rem] text-gray-500 dark:text-gray-500 flex items-center gap-1 mb-1">
                <i class="fas fa-map-marker-alt"></i> ${job.Ubicacion}
            </p>
            <p class="text-[0.65rem] text-gray-600 dark:text-gray-300 text-justify leading-snug">${job.Descripcion}</p>
        `;
        container.appendChild(article);
    });
}

function renderEducation(data) {
    const container = document.getElementById('education-list');
    if (!container) return;
    container.innerHTML = '';
    data.forEach(edu => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="flex justify-between items-center mb-0.5">
                <strong class="text-gray-800 dark:text-gray-200">${edu.Titulo}</strong>
                ${edu.Nivel === 'Postgrado' ? '<span class="text-[0.5rem] bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded text-blue-600 no-print">Autodesk Cert.</span>' : ''}
            </div>
            <p class="text-[0.6rem] text-gray-500 italic">${edu.Institucion} | ${edu.Periodo}</p>
        `;
        container.appendChild(li);
    });
}

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
            if (secondaryContainer.children.length > 0) secondaryContainer.innerHTML += '<span class="text-gray-500 mx-1">•</span>';
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
        if (categoria === 'Habilidades Blandas' && softContainer) softContainer.innerHTML += `<span class="soft-skill-tag">${item}</span>`;
    });
}

function calculateDuration(periodo) {
    if (!periodo || !periodo.includes(' - ')) return '';
    const parts = periodo.split(' - ');
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

        return res.length > 0 ? `(${res.join(' ')})` : '';
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
    const animateBars = () => {
        const bars = document.querySelectorAll('.skill-progress');
        bars.forEach(b => { b.style.transition = 'none'; b.style.width = '0'; });
        void document.body.offsetWidth;
        setTimeout(() => {
            bars.forEach(b => {
                b.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
                b.style.width = b.getAttribute('data-width');
            });
        }, 100);
    };
    animateBars();
    setInterval(animateBars, 30000);

    const txt = "Modelador BIM Senior con +10 años de experiencia liderando la coordinación multidisciplinaria en proyectos de gran escala (Edificación Vertical, Salud, Infraestructura). Especialista en la implementación de metodologías BIM y aseguramiento de calidad (BEP). Actualmente ampliando competencias en IA Generativa y Automatización (Python, Dynamo) para optimizar el ciclo de vida de los activos. En busca de oportunidades desafiantes en el mercado europeo o modalidad remota, aportando eficiencia técnica y liderazgo.";
    const el = document.getElementById('profile-text');
    if (el && el.innerHTML === '') setTimeout(() => typeEffect(el, txt, 30), 500);
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
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) document.documentElement.classList.remove('dark');
        modal.classList.remove('hidden');
        window.onafterprint = () => { if (isDark) document.documentElement.classList.add('dark'); };
    };
    window.closeModal = () => modal.classList.add('hidden');
    window.confirmPrint = () => { window.closeModal(); setTimeout(() => window.print(), 500); };
}
