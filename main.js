document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Get DOM elements
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileSearchOpenButton = document.getElementById('mobile-search-open-button');
    const mobileSearchCloseButton = document.getElementById('mobile-search-close-button');
    const mobileSearchView = document.getElementById('mobile-search-view');
    const headerMainContent = document.getElementById('header-main-content');
    const desktopDropdownButton = document.getElementById('desktop-dropdown-button');
    const desktopDropdownMenu = document.getElementById('desktop-dropdown-menu');
    const desktopLangSwitcherButton = document.getElementById('desktop-lang-switcher-button');
    const desktopLangSwitcherMenu = document.getElementById('desktop-lang-switcher-menu');
    const mobileLangSwitcherButton = document.getElementById('mobile-lang-switcher-button');
    const mobileLangSwitcherMenu = document.getElementById('mobile-lang-switcher-menu');
    const currentLangDisplay = document.getElementById('current-lang-display');

    // --- Toggle Functions for Menus and Search ---

    // Toggles the mobile navigation menu visibility
    function toggleMobileMenu() {
        mobileMenu.classList.toggle('hidden');
        // Ensure other mobile views are closed when menu is opened
        if (!mobileSearchView.classList.contains('hidden')) {
            mobileSearchView.classList.add('hidden');
            headerMainContent.classList.remove('hidden');
        }
    }

    // Toggles the desktop main menu dropdown visibility
    function toggleDesktopDropdown() {
        desktopDropdownMenu.classList.toggle('hidden');
        // Close desktop language switcher if open
        if (!desktopLangSwitcherMenu.classList.contains('hidden')) {
            desktopLangSwitcherMenu.classList.add('hidden');
        }
    }

    // Toggles the desktop language switcher dropdown visibility
    function toggleDesktopLangSwitcher() {
        desktopLangSwitcherMenu.classList.toggle('hidden');
        // Close desktop main menu dropdown if open
        if (!desktopDropdownMenu.classList.contains('hidden')) {
            desktopDropdownMenu.classList.add('hidden');
        }
    }

    // Toggles the mobile language switcher dropdown visibility
    function toggleMobileLangSwitcher() {
        mobileLangSwitcherMenu.classList.toggle('hidden');
    }

    // Toggles the mobile search view visibility
    function toggleMobileSearch() {
        mobileSearchView.classList.toggle('hidden');
        headerMainContent.classList.toggle('hidden');
        // Close mobile menu if open
        if (!mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
        // Focus on the search input when the search view is opened
        if (!mobileSearchView.classList.contains('hidden')) {
            document.getElementById('mobile-search-input').focus();
        }
    }

    // --- Event Listeners for UI Interactions ---

    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    mobileSearchOpenButton.addEventListener('click', toggleMobileSearch);
    mobileSearchCloseButton.addEventListener('click', toggleMobileSearch);

    // Desktop Dropdown Button
    desktopDropdownButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from immediately closing
        toggleDesktopDropdown();
    });

    // Desktop Language Switcher Button
    desktopLangSwitcherButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from immediately closing
        toggleDesktopLangSwitcher();
    });

    // Mobile Language Switcher Button
    mobileLangSwitcherButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from immediately closing
        toggleMobileLangSwitcher();
    });

    // Close dropdowns/menus when clicking outside of them
    document.addEventListener('click', (event) => {
        // Close desktop main menu dropdown
        if (!desktopDropdownButton.contains(event.target) && !desktopDropdownMenu.contains(event.target)) {
            desktopDropdownMenu.classList.add('hidden');
        }
        // Close desktop language switcher dropdown
        if (!desktopLangSwitcherButton.contains(event.target) && !desktopLangSwitcherMenu.contains(event.target)) {
            desktopLangSwitcherMenu.classList.add('hidden');
        }
        // Mobile menu and search are full-screen overlays, their closing is handled by specific buttons.
    });

    // --- Language Detection and Switching Logic ---

    /**
     * Determines the current language based on the URL path.
     * Assumes '/en/' prefix for English, '/id/' for Indonesian,
     * and defaults to 'id' if no explicit language prefix is found (e.g., for '/').
     * @returns {string} 'id' or 'en'.
     */
    function getCurrentLangFromPath() {
        const path = window.location.pathname;
        if (path.startsWith('/en/')) {
            return 'en';
        } else if (path.startsWith('/id/')) {
            return 'id';
        }
        // Default to 'id' if no explicit language prefix (assuming root is Indonesian)
        return 'id';
    }

    /**
     * Generates a new URL for a target language based on the current path.
     * Handles root paths and paths with language prefixes.
     * @param {string} targetLang - The target language code ('id' or 'en').
     * @returns {string} The new URL path.
     */
    function generateLangUrl(targetLang) {
        const currentPath = window.location.pathname;
        const currentLang = getCurrentLangFromPath();

        let newPath = currentPath;

        // If already in the target language, no change needed
        if (targetLang === currentLang) {
            return newPath;
        }

        if (currentLang === 'id') {
            // From Indonesian to English
            if (currentPath === '/') {
                newPath = '/en/'; // Root ID to Root EN
            } else if (currentPath.startsWith('/id/')) {
                newPath = currentPath.replace('/id/', '/en/'); // /id/page.html to /en/page.html
            } else {
                // Path like /page.html (implicit ID) to /en/page.html
                newPath = `/en${currentPath}`;
            }
        } else { // currentLang === 'en'
            // From English to Indonesian
            if (currentPath === '/en/') {
                newPath = '/'; // Root EN to Root ID
            } else {
                newPath = currentPath.replace('/en/', '/id/'); // /en/page.html to /id/page.html
            }
        }

        // Clean up any potential double slashes that might occur
        newPath = newPath.replace(/\/\//g, '/');

        return newPath;
    }

    /**
     * Updates the 'href' attributes of all language option links
     * and the text of the desktop language switcher button to reflect the current language.
     */
    function updateLanguageLinksHref() {
        document.querySelectorAll('.lang-option').forEach(link => {
            const targetLang = link.dataset.lang;
            link.href = generateLangUrl(targetLang);
        });

        // Update the text on the desktop language switcher button
        if (currentLangDisplay) {
            currentLangDisplay.textContent = getCurrentLangFromPath().toUpperCase();
        }
    }

    /**
     * Detects the user's browser language and attempts to redirect the page
     * if the current page's language does not match the preferred browser language.
     * This helps in automatically serving content in the user's preferred language.
     */
    function setInitialLanguage() {
        const browserLang = navigator.language.split('-')[0]; // e.g., "en-US" -> "en"
        // Prioritize 'id' or 'en', default to 'en' if browser language is neither
        const preferredLang = (browserLang === 'id' || browserLang === 'en') ? browserLang : 'en';

        const currentLangInPath = getCurrentLangFromPath();

        // Only redirect if the preferred language doesn't match the current page's language
        if (preferredLang !== currentLangInPath) {
            const newUrl = generateLangUrl(preferredLang);
            // Prevent unnecessary reloads if the generated URL is already the current one
            if (newUrl !== window.location.pathname) {
                window.location.href = newUrl;
            }
        }
    }

    // Attach click listeners to language option links to trigger navigation
    document.querySelectorAll('.lang-option').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            const targetLang = event.currentTarget.dataset.lang;
            window.location.href = generateLangUrl(targetLang);
        });
    });

    // Initial setup calls when the DOM is fully loaded
    updateLanguageLinksHref(); // Set correct hrefs for language links
    setInitialLanguage();     // Attempt to redirect based on browser language preference
});
