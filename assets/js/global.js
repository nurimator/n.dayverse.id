document.addEventListener('DOMContentLoaded', function () {

    // --- Elemen UI Global ---
    const header = document.getElementById('header');
    const headerMainContent = document.getElementById('header-main-content');
    const mobileSearchView = document.getElementById('mobile-search-view');
    const mobileSearchOpenButton = document.getElementById('mobile-search-open-button');
    const mobileSearchCloseButton = document.getElementById('mobile-search-close-button');
    const mobileSearchForm = document.getElementById('mobile-search-form');
    const desktopSearchForm = document.getElementById('desktop-search-form');
    const desktopSearchInput = document.querySelector('#desktop-search-form input[name="q"]');
    const mobileSearchInput = document.querySelector('#mobile-search-input');
    const desktopMenuButtonText = document.querySelector('#desktop-dropdown-button span');

    // --- Data untuk Menu & Terjemahan UI ---
    const langMenuItems = [
        { href: '#', text: 'Bahasa Indonesia', dataLang: 'id' },
        { href: '#', text: 'English', dataLang: 'en' }
    ];

    // Tambahkan data subdomain menu
    const subdomainMenuItems = [
        { 
            href: '#', 
            text: 'nurimator.com', 
            description: 'Situs utama - Konten kreatif dan edukasi',
            colorClass: 'main',
            subdomain: 'main'
        },
        { 
            href: '#', 
            text: 'u.nurimator.com', 
            description: 'Utilities - Tools dan aplikasi berguna',
            colorClass: 'utilities',
            subdomain: 'utilities'
        },
        { 
            href: '#', 
            text: 'n.nurimator.com', 
            description: 'Notes - Catatan dan dokumentasi',
            colorClass: 'notes',
            subdomain: 'notes'
        },
        { 
            href: '#', 
            text: 'app.nurimator.com', 
            description: 'Applications - Aplikasi web interaktif',
            colorClass: 'app',
            subdomain: 'app'
        }
    ];

    const mainMenuItems = {
        id: [
            { href: '/id/', text: 'Beranda' },
            { href: '/id/articles/', text: 'Artikel' },
            { href: '/id/resources/', text: 'Bahan Desain' },
            { href: '/id/media/', text: 'Media' },
            { href: '/id/donate.html', text: 'Donasi' }
        ],
        en: [
            { href: '/en/', text: 'Home' },
            { href: '/en/articles/', text: 'Articles' },
            { href: '/en/resources/', text: 'Resources' },
            { href: '/en/media/', text: 'Media' },
            { href: '/en/donate.html', text: 'Donate' }
        ]
    };

    const uiStrings = {
        id: {
            searchPlaceholder: 'Cari...',
            menuButton: 'Menu',
            footer: {
                description: 'Sebuah ruang berkarya dari bentuk dan tanya, menghadirkan gerak, warna, dan kisah yang menyimpan makna.',
                navTitle: 'Navigasi',
                infoTitle: 'Informasi',
                socialTitle: 'Ikuti kami',
                navLinks: [
                    { text: 'Semua Konten', href: '/id/all/' },
                    { text: 'Artikel', href: '/id/articles/' },
                    { text: 'Bahan Desain', href: '/id/resources/' },
                    { text: 'Media', href: '/id/media/' },
                    { text: 'Donasi', href: '/id/donate.html' }
                ],
                infoLinks: [
                    { text: 'Term and Conditions', href: '/term-and-conditions' },
                    { text: 'Privacy Policy', href: '/privacy-policy' },
                    { text: 'License', href: '/license' },
                    { text: 'Disclaimer', href: '/disclaimer' },
                    { text: 'Tentang Kami', href: '/id/about-us' }
                ]
            }
        },
        en: {
            searchPlaceholder: 'Search...',
            menuButton: 'Menu',
            footer: {
                description: 'A creative space of form and inquiry, presenting motion, color, and stories that hold meaning.',
                navTitle: 'Navigation',
                infoTitle: 'Information',
                socialTitle: 'Follow us',
                navLinks: [
                    { text: 'All Content', href: '/en/all/' },
                    { text: 'Articles', href: '/en/articles/' },
                    { text: 'Resources', href: '/en/resources/' },
                    { text: 'Media', href: '/en/media/' },
                    { text: 'Donate', href: '/en/donate' }
                ],
                infoLinks: [
                    { text: 'Term and Conditions', href: '/term-and-conditions' },
                    { text: 'Privacy Policy', href: '/privacy-policy' },
                    { text: 'License', href: '/license' },
                    { text: 'Disclaimer', href: '/disclaimer' },
                    { text: 'About Us', href: '/en/about-us' }
                ]
            }
        }
    };
    
    // --- Sistem Kontrol Menu Terpusat (Disederhanakan) ---
    const activeMenus = new Map();

    const closeAllMenus = (excludeId = null) => {
        activeMenus.forEach((menuControl, menuId) => {
            if (menuId !== excludeId) {
                menuControl.close();
            }
        });
    };

    const createMenuItem = (item) => {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text;
        
        // Gunakan class CSS yang sudah didefinisikan di header
        a.className = 'header-menu-item';
        
        if (item.dataLang) {
            a.dataset.lang = item.dataLang;
            a.classList.add('lang-option');
        }
        return a;
    };

    // Fungsi khusus untuk membuat item subdomain menu
    const createSubdomainMenuItem = (item) => {
        const a = document.createElement('a');
        a.href = item.href;
        a.className = `subdomain-menu-item ${item.colorClass}`;
        
        // Tandai item aktif berdasarkan subdomain saat ini
        const currentHost = window.location.hostname;
        const isActive = (item.subdomain === 'main' && currentHost === 'nurimator.com') ||
                        currentHost === item.text;
        
        if (isActive) {
            a.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
            a.style.cursor = 'default';
            a.addEventListener('click', e => e.preventDefault());
        }
        
        a.innerHTML = `
            <div>
                <div class="font-semibold text-white">${item.text}</div>
                <div class="text-xs text-gray-400 mt-1">${item.description}</div>
            </div>
            <div class="w-2 h-2 rounded-full ${getColorDot(item.colorClass)}"></div>
        `;
        
        return a;
    };

    // Fungsi untuk mendapatkan warna dot berdasarkan class
    const getColorDot = (colorClass) => {
        switch (colorClass) {
            case 'main': return 'bg-teal-500';
            case 'utilities': return 'bg-blue-500';
            case 'notes': return 'bg-amber-500';
            case 'app': return 'bg-violet-500';
            default: return 'bg-gray-500';
        }
    };

    const setupAnimatedMenu = (buttonId, menuId, itemsData) => {
        const button = document.getElementById(buttonId);
        const menu = document.getElementById(menuId);
        if (!button || !menu) return;
        
        const pageLang = document.documentElement.lang || 'id';
        
        let isOpen = false;
        while (menu.firstChild) {
            menu.removeChild(menu.firstChild);
        }
        
        // Logika khusus untuk subdomain menu
        if (menuId === 'logo-dropdown-menu') {
            subdomainMenuItems.forEach(item => {
                menu.appendChild(createSubdomainMenuItem(item));
            });
        } else if (menuId.includes('lang-switcher')) {
            const currentPath = window.location.pathname;
            const currentLang = pageLang;

            langMenuItems.forEach(item => {
                const targetLang = item.dataLang;
                let newHref = '#';
                let isAvailable = true;

                if (targetLang === currentLang) {
                    // Tautan untuk bahasa saat ini, tidak perlu href
                } else if (typeof postMeta !== 'undefined' && typeof allSitePosts !== 'undefined') {
                    // Logika prioritas untuk halaman konten spesifik
                    const alternatePost = allSitePosts.find(p => String(p.page_id) === String(postMeta.page_id) && p.lang === targetLang);
                    if (alternatePost && alternatePost.url) {
                        newHref = alternatePost.url;
                    } else {
                        isAvailable = false; // Terjemahan tidak ditemukan
                    }
                } else {
                    // Logika global untuk pergantian URL (disederhanakan)
                    if (currentPath.startsWith('/en/')) {
                            if (targetLang === 'id') newHref = currentPath.replace('/en/', '/id/');
                    } else if (currentPath.startsWith('/id/')) {
                            if (targetLang === 'en') newHref = currentPath.replace('/id/', '/en/');
                    } else {
                        // Halaman tanpa awalan bahasa (misal: /privacy-policy.html)
                        isAvailable = false;
                    }
                }

                const newItem = { ...item, href: newHref };
                const menuItemElement = createMenuItem(newItem);
                
                if (!isAvailable) {
                    menuItemElement.classList.add('disabled');
                    menuItemElement.title = 'Terjemahan tidak tersedia';
                    menuItemElement.addEventListener('click', e => e.preventDefault());
                }

                menu.appendChild(menuItemElement);
            });
        } else {
            // Logika untuk menu lainnya
            const itemsToRender = itemsData[pageLang] || itemsData.id || itemsData;
            itemsToRender.forEach(item => menu.appendChild(createMenuItem(item)));
        }

        const openMenu = () => {
            if (isOpen) return;
            isOpen = true;

            const buttonRect = button.getBoundingClientRect();
            const headerHeight = header.offsetHeight;
            menu.style.top = `${headerHeight + 8}px`; 
            
            // Posisi khusus untuk logo dropdown (di kiri)
            if (menuId === 'logo-dropdown-menu') {
                menu.style.left = `${buttonRect.left}px`;
                menu.style.right = 'auto';
            } else {
                menu.style.right = `${window.innerWidth - buttonRect.right}px`;
                menu.style.left = 'auto';
            }
            
            menu.classList.remove('hidden');
            menu.classList.add('flex');
        };

        const closeMenu = () => {
            if (!isOpen) return;
            isOpen = false;
            menu.classList.add('hidden');
            menu.classList.remove('flex');
        };

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen) {
                closeMenu();
            } else {
                closeAllMenus(menuId);
                openMenu();
            }
        });

        activeMenus.set(menuId, { open: openMenu, close: closeMenu });
    };

    // --- Fungsi Global Lainnya ---
    const setupLanguageSwitcherUI = () => {
        const pageLang = document.documentElement.lang || 'id';
        
        const currentLangDisplay = document.getElementById('current-lang-display');
        if (currentLangDisplay) currentLangDisplay.textContent = pageLang.toUpperCase();
        
        setTimeout(() => {
            document.querySelectorAll('.lang-option').forEach(link => {
                // Hapus semua kelas status sebelumnya
                link.classList.remove('active', 'disabled');

                if (link.dataset.lang === pageLang) {
                    // Tambahkan kelas untuk bahasa aktif
                    link.classList.add('active');
                    link.addEventListener('click', e => e.preventDefault());
                } else {
                    // Periksa kembali ketersediaan terjemahan jika diperlukan
                    if (link.title === 'Terjemahan tidak tersedia') {
                        link.classList.add('disabled');
                        link.addEventListener('click', e => e.preventDefault());
                    }
                }
            });
        }, 100);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const input = event.target.querySelector('input[name="q"]');
        const query = input.value.trim();
        if (!query) return;
        const pageLang = document.documentElement.lang || 'id';
        window.location.href = `/${pageLang}/all/?q=${encodeURIComponent(query)}`;
    };
    
    const setUiLanguage = () => {
        const pageLang = document.documentElement.lang || 'id';
        const translations = uiStrings[pageLang] || uiStrings.id;
        const searchActionUrl = `/${pageLang}/all/`;

        if(desktopSearchInput) desktopSearchInput.placeholder = translations.searchPlaceholder;
        if(mobileSearchInput) mobileSearchInput.placeholder = translations.searchPlaceholder;
        if(desktopMenuButtonText) desktopMenuButtonText.textContent = translations.menuButton;
        if(desktopSearchForm) desktopSearchForm.action = searchActionUrl;
        if(mobileSearchForm) mobileSearchForm.action = searchActionUrl;
    };

    const setFooterLanguage = () => {
        const pageLang = document.documentElement.lang || 'id';
        const footerStrings = uiStrings[pageLang]?.footer || uiStrings.id.footer;

        if (!footerStrings) return;

        document.getElementById('footer-description').textContent = footerStrings.description;
        document.getElementById('footer-nav-title').textContent = footerStrings.navTitle;
        document.getElementById('footer-info-title').textContent = footerStrings.infoTitle;
        document.getElementById('footer-social-title').textContent = footerStrings.socialTitle;

        const navLinksContainer = document.getElementById('footer-nav-links');
        if (navLinksContainer) {
            navLinksContainer.innerHTML = '';
            footerStrings.navLinks.forEach(linkData => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = linkData.href;
                a.textContent = linkData.text;
                a.className = 'text-gray-400 hover:text-teal-400';
                li.appendChild(a);
                navLinksContainer.appendChild(li);
            });
        }
        
        const infoLinksContainer = document.getElementById('footer-info-links');
        if (infoLinksContainer) {
            infoLinksContainer.innerHTML = '';
            footerStrings.infoLinks.forEach(linkData => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = linkData.href;
                a.textContent = linkData.text;
                a.className = 'text-gray-400 hover:text-teal-400';
                li.appendChild(a);
                infoLinksContainer.appendChild(li);
            });
        }
    };

    // --- Inisialisasi ---
    setUiLanguage();
    setFooterLanguage();
    
    // Panggil setupAnimatedMenu untuk semua menu termasuk logo dropdown
    setupAnimatedMenu('logo-dropdown-button', 'logo-dropdown-menu', subdomainMenuItems);
    setupAnimatedMenu('desktop-lang-switcher-button', 'desktop-lang-switcher-menu', langMenuItems);
    setupAnimatedMenu('desktop-dropdown-button', 'desktop-dropdown-menu', mainMenuItems);
    setupAnimatedMenu('mobile-lang-switcher-button', 'mobile-lang-switcher-menu', langMenuItems);
    setupAnimatedMenu('mobile-menu-button', 'mobile-menu', mainMenuItems);

    if (mobileSearchOpenButton) {
        mobileSearchOpenButton.addEventListener('click', () => {
            closeAllMenus();
            if (headerMainContent) headerMainContent.classList.add('hidden');
            if (mobileSearchView) {
                mobileSearchView.classList.remove('hidden');
                mobileSearchView.classList.add('flex');
                mobileSearchView.querySelector('input')?.focus();
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
    
    // Tutup menu saat klik di luar
    window.addEventListener('click', () => {
        closeAllMenus();
    });
    
    // Panggil setupLanguageSwitcherUI setelah semua menu bahasa dibuat
    setupLanguageSwitcherUI();
    
    desktopSearchForm?.addEventListener('submit', handleSearch);
    mobileSearchForm?.addEventListener('submit', handleSearch);
    
    window.scrollTo(0, 0);
});
