/**
 * global.js
 * * Berisi semua skrip yang berjalan di seluruh situs.
 * - Kontrol menu navigasi (mobile & desktop).
 * - Tampilan pencarian mobile.
 * - Logika untuk pengalih bahasa.
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

  // --- Fungsi Global ---

  /**
   * Mengatur fungsionalitas untuk tombol pengalih bahasa.
   * Mendeteksi bahasa saat ini dan mengarahkan ke URL alternatif jika ada.
   */
  const setupLanguageSwitcher = () => {
    const desktopSwitcherButton = document.getElementById('desktop-lang-switcher-button');
    const desktopSwitcherMenu = document.getElementById('desktop-lang-switcher-menu');
    const currentLangDisplay = document.getElementById('current-lang-display');
    const mobileSwitcherButton = document.getElementById('mobile-lang-switcher-button');
    const mobileSwitcherMenu = document.getElementById('mobile-lang-switcher-menu');

    const path = window.location.pathname;
    const currentLang = path.includes('/en/') ? 'en' : 'id';
    if (currentLangDisplay) currentLangDisplay.textContent = currentLang.toUpperCase();

    const toggleMenu = (button, menu) => {
      if (!button || !menu) return;
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
      });
    };
    toggleMenu(desktopSwitcherButton, desktopSwitcherMenu);
    toggleMenu(mobileSwitcherButton, mobileSwitcherMenu);

    // Menutup semua menu dropdown saat mengklik di luar
    window.addEventListener('click', () => {
        if (desktopSwitcherMenu) desktopSwitcherMenu.classList.add('hidden');
        if (mobileSwitcherMenu) mobileSwitcherMenu.classList.add('hidden');
        if (desktopDropdownMenu) desktopDropdownMenu.classList.add('hidden');
    });

    const langLinks = document.querySelectorAll('.lang-option');
    // Jika data post tersedia (untuk halaman detail post)
    if (typeof postMeta !== 'undefined' && typeof allSitePosts !== 'undefined') {
      langLinks.forEach(link => {
        const targetLang = link.dataset.lang;
        if (targetLang === currentLang) {
          link.classList.add('opacity-50', 'cursor-default');
          link.addEventListener('click', e => e.preventDefault());
          return;
        }
        const alternatePost = allSitePosts.find(p => String(p.page_id) === String(postMeta.page_id) && p.lang === targetLang);
        if (alternatePost && alternatePost.url) {
          link.href = alternatePost.url;
        } else {
          link.href = '#';
          link.classList.add('opacity-50', 'cursor-default');
          link.title = 'Terjemahan tidak tersedia';
          link.addEventListener('click', e => e.preventDefault());
        }
      });
    } else { // Fallback untuk halaman lain
      langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetLang = link.dataset.lang;
          if (targetLang === currentLang) return;
          let newPath = path.startsWith(`/${currentLang}/`) ? path.replace(`/${currentLang}/`, `/${targetLang}/`) : `/${targetLang}${path}`;
          window.location.href = newPath + window.location.search;
        });
      });
    }
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

  // --- Inisialisasi Logika Global ---
  if (mobileMenuButton) mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  
  if (desktopDropdownButton) {
    desktopDropdownButton.addEventListener('click', (e) => {
      e.stopPropagation();
      desktopDropdownMenu.classList.toggle('hidden');
    });
  }

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
  
  // Inisialisasi semua fungsi global
  setupLanguageSwitcher();
  if (desktopSearchForm) desktopSearchForm.addEventListener('submit', handleSearch);
  if (mobileSearchForm) mobileSearchForm.addEventListener('submit', handleSearch);

});
