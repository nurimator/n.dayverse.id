// Fungsi untuk memuat HTML dan menyuntikkannya ke elemen target
async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const text = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = text;
        } else {
            console.warn(`Element with ID '${elementId}' not found.`);
        }
    } catch (error) {
        console.error(`Error loading component for ${elementId}:`, error);
    }
}

// Inisialisasi logika interaktif untuk header setelah dimuat
function initializeHeaderLogic() {
    // Mobile Menu
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Desktop Dropdown
    const desktopDropdownButton = document.getElementById('desktop-dropdown-button');
    const desktopDropdownMenu = document.getElementById('desktop-dropdown-menu');
    const desktopDropdownContainer = document.getElementById('desktop-dropdown-container');
    if (desktopDropdownButton && desktopDropdownMenu && desktopDropdownContainer) {
        desktopDropdownButton.addEventListener('click', (event) => {
            event.stopPropagation();
            desktopDropdownMenu.classList.toggle('hidden');
        });
        window.addEventListener('click', (event) => {
            if (!desktopDropdownContainer.contains(event.target)) {
                desktopDropdownMenu.classList.add('hidden');
            }
        });
    }

    // Mobile Search Toggle
    const headerMainContent = document.getElementById('header-main-content');
    const mobileSearchView = document.getElementById('mobile-search-view');
    const mobileSearchOpenButton = document.getElementById('mobile-search-open-button');
    const mobileSearchCloseButton = document.getElementById('mobile-search-close-button');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (mobileSearchOpenButton && headerMainContent && mobileSearchView && mobileSearchInput) {
        mobileSearchOpenButton.addEventListener('click', () => {
            headerMainContent.classList.add('hidden');
            mobileSearchView.classList.remove('hidden');
            mobileSearchView.classList.add('flex');
            mobileSearchInput.focus();
        });
    }
    if (mobileSearchCloseButton && headerMainContent && mobileSearchView) {
        mobileSearchCloseButton.addEventListener('click', () => {
            headerMainContent.classList.remove('hidden');
            mobileSearchView.classList.add('hidden');
            mobileSearchView.classList.remove('flex');
        });
    }

    // Inisialisasi ulang ikon jika Lucide tersedia
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.warn('Lucide Icons not defined. Make sure the script is loaded.');
    }
}

// Fungsi utama untuk memuat komponen bersama
async function initializeSharedComponents() {
    await Promise.all([
        loadComponent('/header.html', 'header-container'),
        loadComponent('/footer.html', 'footer-container')
    ]);

    // Setelah komponen dimuat, aktifkan logika interaktif
    initializeHeaderLogic();
}

// Jalankan inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', initializeSharedComponents);
