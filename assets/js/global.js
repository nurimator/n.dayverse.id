/**
 * global.js
 * * Berisi semua skrip yang berjalan di seluruh situs.
 * - Kontrol menu navigasi (mobile & desktop) dengan dropdown eksklusif.
 * - Tampilan pencarian mobile.
 * - Logika untuk pengalih bahasa dengan penanda aktif.
 * - Penanganan pengiriman formulir pencarian global.
 */
document.addEventListener('DOMContentLoaded', function () {

  // --- Elemen UI Global ---
  const headerMainContent = document.getElementById('header-main-content');
  const mobileSearchView = document.getElementById('mobile-search-view');
  const mobileSearchOpenButton = document.getElementById('mobile-search-open-button');
  const mobileSearchCloseButton = document.getElementById('mobile-search-close-button');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const desktopDropdownButton = document.getElementById('desktop-dropdown-button');
  const desktopDropdownMenu = document.getElementById('desktop-dropdown-menu');
  const desktopSearchForm = document.getElementById('desktop-search-form');
  const mobileSearchForm = document.getElementById('mobile-search-form');
  const desktopSwitcherButton = document.getElementById('desktop-lang-switcher-button');
  const desktopSwitcherMenu = document.getElementById('desktop-lang-switcher-menu');
  const mobileSwitcherButton = document.getElementById('mobile-lang-switcher-button');
  const mobileSwitcherMenu = document.getElementById('mobile-lang-switcher-menu');

  // --- Fungsi Global ---

  /**
   * Mengatur fungsionalitas untuk tombol pengalih bahasa.
   * Mendeteksi bahasa saat ini, mengatur URL, dan menyorot bahasa aktif.
   */
  const setupLanguageSwitcher = () => {
    const path = window.location.pathname;
    const currentLang = path.includes('/en/') ? 'en' : 'id';
    const currentLangDisplay = document.getElementById('current-lang-display');
    if (currentLangDisplay) currentLangDisplay.textContent = currentLang.toUpperCase();

    const langLinks = document.querySelectorAll('.lang-option');
    
    const applyLinkLogic = (link) => {
      const targetLang = link.dataset.lang;
      if (targetLang === currentLang) {
        link.classList.add('bg-blue-600', 'cursor-default');
        link.classList.remove('hover:bg-gray-700');
        link.addEventListener('click', e => e.preventDefault());
        return;
      }

      if (typeof postMeta !== 'undefined' && typeof allSitePosts !== 'undefined') {
        const alternatePost = allSitePosts.find(p => String(p.page_id) === String(postMeta.page_id) && p.lang === targetLang);
        if (alternatePost && alternatePost.url) {
          link.href = alternatePost.url;
        } else {
          link.href = '#';
          link.classList.add('opacity-50', 'cursor-default');
          link.title = 'Terjemahan tidak tersedia';
          link.addEventListener('click', e => e.preventDefault());
        }
      } else {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.setItem('preferredLang', targetLang);
          let newPath = path.startsWith(`/${currentLang}/`) ? path.replace(`/${currentLang}/`, `/${targetLang}/`) : `/${targetLang}${path}`;
          window.location.href = newPath + window.location.search;
        });
      }
    };

    langLinks.forEach(applyLinkLogic);
  };

  /**
   * Menangani pengiriman formulir pencarian.
   * Mengarahkan pengguna ke halaman pencarian yang sesuai dengan bahasa saat ini.
   * @param {Event} event - Event pengiriman formulir.
   */
  const handleSearch = (event) => {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input[name="q"]');
    const query = input.value.trim();
    if (!query) return;

    const currentLang = window.location.pathname.includes('/en/') ? 'en' : 'id';
    const searchPageUrl = `/${currentLang}/all/`;
    
    window.location.href = `${searchPageUrl}?q=${encodeURIComponent(query)}`;
  };

  // --- Inisialisasi Logika UI Global ---

  // Fungsi untuk menutup semua dropdown yang relevan
  const closeAllDropdowns = () => {
    if (desktopDropdownMenu) desktopDropdownMenu.classList.add('hidden');
    if (desktopSwitcherMenu) desktopSwitcherMenu.classList.add('hidden');
    if (mobileSwitcherMenu) mobileSwitcherMenu.classList.add('hidden');
  };

  // 1. Logika untuk Dropdown Desktop (Menu & Bahasa) yang saling eksklusif
  const setupDesktopDropdowns = () => {
    const toggle = (button, menu) => {
      if (!button || !menu) return;
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains('hidden');
        // Tutup semua dropdown lain sebelum membuka yang ini
        closeAllDropdowns();
        if (isHidden) {
          menu.classList.remove('hidden');
        }
      });
    };
    toggle(desktopDropdownButton, desktopDropdownMenu);
    toggle(desktopSwitcherButton, desktopSwitcherMenu);
  };

  // 2. Logika untuk Menu Mobile Utama
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      // Tambahkan/hapus highlight pada tombol saat menu dibuka/ditutup
      mobileMenuButton.classList.toggle('bg-gray-700');
      // Jika menu utama baru saja dibuka, pastikan submenu bahasa tertutup
      if (!isHidden && mobileSwitcherMenu) {
        mobileSwitcherMenu.classList.add('hidden');
      }
    });
  }

  // 3. Logika untuk Dropdown Bahasa di dalam Menu Mobile
  if (mobileSwitcherButton && mobileSwitcherMenu) {
    mobileSwitcherButton.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileSwitcherMenu.classList.toggle('hidden');
    });
  }

  // 4. Logika untuk Tampilan Pencarian Mobile
  if (mobileSearchOpenButton) {
    mobileSearchOpenButton.addEventListener('click', () => {
      if (headerMainContent) headerMainContent.classList.add('hidden');
      if (mobileSearchView) {
        mobileSearchView.classList.remove('hidden');
        mobileSearchView.classList.add('flex');
        const mobileInput = mobileSearchView.querySelector('input');
        if (mobileInput) mobileInput.focus();
      }
    });
  }

  if (mobileSearchCloseButton) {
    mobileSearchCloseButton.addEventListener('click', () => {
      if (headerMainContent) headerMainContent.classList.remove('hidden');
      if (mobileSearchView) {
        mobileSearchView.classList.add('hidden');
        mobileSearchView.classList.remove('flex');
      }
    });
  }
  
  // Listener global untuk menutup semua dropdown saat mengklik di luar
  window.addEventListener('click', () => {
    closeAllDropdowns();
    // Juga tutup menu mobile utama jika terbuka
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      mobileMenuButton.classList.remove('bg-gray-700');
    }
  });

  // Inisialisasi semua fungsi
  setupDesktopDropdowns();
  setupLanguageSwitcher();
  if (desktopSearchForm) desktopSearchForm.addEventListener('submit', handleSearch);
  if (mobileSearchForm) mobileSearchForm.addEventListener('submit', handleSearch);
  
  window.scrollTo(0, 0);
});