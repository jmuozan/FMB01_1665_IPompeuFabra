/* MOBILE MENU FUNCTIONALITY */

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.navbar__bars');
    const navMenu = document.querySelector('.navbar__menu');
    const body = document.body;

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        if (navMenu) {
            navMenu.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
            // Prevent body scroll when menu is open
            body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        }
    };

    // Add click event to hamburger menu
    hamburgerMenu?.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking on a link
    const menuLinks = document.querySelectorAll('.navbar__menu--links');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerMenu.contains(e.target) && !navMenu.contains(e.target)) {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburgerMenu.classList.remove('active');
                body.style.overflow = '';
            }
        }
    });
});
