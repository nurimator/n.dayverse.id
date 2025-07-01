/**
 * main.js
 * Skrip ini menangani pemuatan komponen bersama (seperti header dan footer)
 * dan menginisialisasi logika interaktifnya.
 */

/**
 * Mengambil konten HTML dari URL dan menyuntikkannya ke dalam elemen target.
 * @param {string} url - URL file HTML yang akan dimuat.
 * @param {string} elementId - ID elemen tempat HTML akan disuntikkan.
 */
async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Gagal mengambil ${url}: ${response.statusText}`);
        }
        const text = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = text;
        } else {
            console.warn(`Elemen dengan ID '${elementId}' tidak ditemukan.`);
        }
    } catch (error) {
        console.error(`Error memuat komponen untuk ${elementId}:`, error);
    }
}

/**
 * Menginisialisasi semua elemen UI interaktif yang ditemukan di dalam header.
 * Fungsi ini harus dipanggil SETELAH header dimuat.
 */
function initializeHeaderLogic() {
    // --- Logika untuk Menu Mobile ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Logika untuk Dropdown Desktop ---
    const desktopDropdownButton = document.getElementById('desktop-dropdown-button');
    const desktopDropdownMenu = document.getElementById('desktop-dropdown-menu');
    const desktopDropdownContainer = document.getElementById('desktop-dropdown-container');
    if (desktopDropdownButton && desktopDropdownMenu && desktopDropdownContainer) {
        desktopDropdownButton.addEventListener('click', (event) => {
            event.stopPropagation();
            desktopDropdownMenu.classList.toggle('hidden');
        });
        // Menutup dropdown jika klik di luar container
        window.addEventListener('click', (event) => {
            if (!desktopDropdownContainer.contains(event.target)) {
                desktopDropdownMenu.classList.add('hidden');
            }
        });
    }

    // --- Logika untuk Tampilan Pencarian Mobile ---
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

    // Inisialisasi ulang ikon Lucide setelah komponen baru dimuat ke DOM.
    // Ini penting agar ikon di dalam header.html dapat dirender.
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.warn('Lucide Icons tidak terdefinisi. Pastikan skripnya sudah dimuat.');
    }
}

/**
 * Fungsi utama untuk memuat semua komponen bersama dan menginisialisasinya.
 */
async function initializeSharedComponents() {
    // Gunakan Promise.all untuk memuat header dan footer secara bersamaan
    // untuk efisiensi.
    await Promise.all([
        loadComponent('header.html', 'header-container'),
        loadComponent('footer.html', 'footer-container')
    ]);

    // Setelah SEMUA komponen di atas selesai dimuat,
    // jalankan logika untuk membuat header menjadi interaktif.
    initializeHeaderLogic();
}

// Jalankan proses inisialisasi utama saat DOM siap.
document.addEventListener('DOMContentLoaded', initializeSharedComponents);
