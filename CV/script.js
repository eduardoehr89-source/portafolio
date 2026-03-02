/**
 * CV Digital - Said Herrera
 * Lógica modular para interactividad, modo oscuro y asistente virtual.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAnimations();
    initPrintLogic();
    // Inicializar iconos de Lucide si está disponible
    if (window.lucide) lucide.createIcons();
});

/* =========================================
   THEME LOGIC (Dark/Light Mode)
   ========================================= */
function initTheme() {
    const toggleButton = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    const updateIcon = (isDark) => {
        themeIcon.className = isDark ? 'fas fa-sun text-lg' : 'fas fa-moon text-lg';
    };

    const setDark = (isDark) => {
        if (isDark) htmlElement.classList.add('dark');
        else htmlElement.classList.remove('dark');
        updateIcon(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    // Initial check
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(savedTheme === 'dark' || (!savedTheme && prefersDark));

    toggleButton.addEventListener('click', () => {
        setDark(!htmlElement.classList.contains('dark'));
    });
}

/* =========================================
   ANIMATIONS (Progress Bars & Typewriter)
   ========================================= */
function initAnimations() {
    // Skill bars animation
    const animateBars = () => {
        const bars = document.querySelectorAll('.skill-progress');
        bars.forEach(bar => {
            bar.style.transition = 'none';
            bar.style.width = '0';
        });

        void document.body.offsetWidth; // Force reflow

        setTimeout(() => {
            bars.forEach(bar => {
                bar.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
                bar.style.width = bar.getAttribute('data-width');
            });
        }, 100);
    };

    window.addEventListener('load', animateBars);
    setInterval(animateBars, 30000);

    // Profile Typewriter
    const profileText = "Modelador BIM Senior con +10 años de experiencia liderando la coordinación multidisciplinaria en proyectos de gran escala (Edificación Vertical, Salud, Infraestructura). Especialista en la implementación de metodologías BIM y aseguramiento de calidad (BEP). Actualmente ampliando competencias en IA Generativa y Automatización (Python, Dynamo) para optimizar el ciclo de vida de los activos. En busca de oportunidades desafiantes en el mercado europeo o modalidad remota, aportando eficiencia técnica y liderazgo.";
    const profileElement = document.getElementById('profile-text');

    if (profileElement) {
        setTimeout(() => {
            typeEffect(profileElement, profileText, 30);
        }, 1000);
    }
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
