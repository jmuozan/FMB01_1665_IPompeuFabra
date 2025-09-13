/* ==========================================================================
   RA1 SLIDESHOW PRESENTATION SYSTEM
   Modern slideshow functionality inspired by master folder's approach
   ========================================================================== */


class SlideshowPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 0;
        this.slides = [];
        this.isTransitioning = false;

        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.slideshowContainer = document.getElementById('slideshowContainer');
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.prevBtn = document.getElementById('prevSlide');
        this.nextBtn = document.getElementById('nextSlide');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        this.progressPercentage = document.getElementById('progressPercentage');
        this.hamburgerMenu = document.querySelector('.navbar__bars');
        this.navMenu = document.querySelector('.navbar__menu');
        this.navbar = document.querySelector('.navbar');

        // Navigation elements
        this.slideNavigation = document.getElementById('slideNavigation');

        // QR code visibility control
        this.qrFixed = document.getElementById('qrFixed');

        // Generate dynamic navigation
        this.generateSlideNavigation();

        // Set up initial state
        this.updateSlideCounter();
        this.updateProgressPercentage();
        this.updateNavigationButtons();
        this.updateSlideNavigation();
        this.updateNavbarTheme();

        // Bind event listeners
        this.bindEvents();

        // Initialize first slide
        this.showSlide(1);

        // Set initial QR visibility
        this.updateQRVisibility();

        console.log('RA1 Slideshow initialized with', this.totalSlides, 'slides');
    }
    
    bindEvents() {
        // Navigation buttons
        this.prevBtn?.addEventListener('click', () => this.previousSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch/swipe navigation
        this.bindTouchEvents();
        
        // Mobile hamburger menu
        this.hamburgerMenu?.addEventListener('click', () => this.toggleMobileMenu());

        // Slide navigation clicks (will be bound after generation)
        this.bindSlideNavigationEvents();

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Prevent context menu on slides for smoother interaction
        this.slides.forEach(slide => {
            slide.addEventListener('contextmenu', (e) => e.preventDefault());
        });
    }
    
    bindTouchEvents() {
        // Touch navigation disabled - only button navigation allowed on mobile
        console.log('Touch slide navigation disabled - use buttons only');
    }
    
    handleKeyboard(e) {
        // Prevent default behavior for arrow keys
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
            e.preventDefault();
        }
        
        switch (e.code) {
            case 'ArrowUp':
            case 'ArrowLeft':
                this.previousSlide();
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                this.nextSlide();
                break;
            case 'Home':
                this.goToSlide(1);
                break;
            case 'End':
                this.goToSlide(this.totalSlides);
                break;
            case 'Escape':
                this.toggleFullscreen();
                break;
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1 && !this.isTransitioning) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides && !this.isTransitioning) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides || 
            slideNumber === this.currentSlide || this.isTransitioning) {
            return;
        }
        
        this.isTransitioning = true;
        const previousSlide = this.currentSlide;
        this.currentSlide = slideNumber;
        
        // Update UI elements
        this.updateSlideCounter();
        this.updateProgressPercentage();
        this.updateNavigationButtons();
        this.updateSlideNavigation();
        this.updateNavbarTheme();
        this.updateQRVisibility();
        
        // Perform slide transition
        this.showSlide(slideNumber, previousSlide);
    }
    
    showSlide(slideNumber, previousSlideNumber = null) {
        const direction = previousSlideNumber ? (slideNumber > previousSlideNumber ? 'forward' : 'backward') : 'forward';
        
        // Remove all transition classes from slides
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'slide-from-above', 'slide-from-below');
            
            if (index + 1 === slideNumber) {
                // New active slide
                if (previousSlideNumber) {
                    // Set initial position based on direction
                    slide.classList.add(direction === 'forward' ? 'slide-from-below' : 'slide-from-above');
                    // Force a reflow
                    slide.offsetHeight;
                }
                slide.classList.add('active');
            }
        });
        
        // Reset transition flag after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
            // Clean up any remaining transition classes
            this.slides.forEach(slide => {
                slide.classList.remove('slide-from-above', 'slide-from-below');
            });
        }, 800); // Match CSS transition duration
    }
    
    updateSlideCounter() {
        if (this.currentSlideSpan && this.totalSlidesSpan) {
            this.currentSlideSpan.textContent = this.currentSlide;
            this.totalSlidesSpan.textContent = this.totalSlides;
        }
    }
    
    updateProgressPercentage() {
        if (this.progressPercentage) {
            const progress = Math.round((this.currentSlide / this.totalSlides) * 100);
            this.progressPercentage.textContent = `${progress}%`;
        }
    }
    
    updateNavigationButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentSlide === 1;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        }
    }
    
    generateSlideNavigation() {
        if (!this.slideNavigation) return;

        // Clear existing navigation
        this.slideNavigation.innerHTML = '';

        // Generate navigation items for each slide
        this.slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            const slideTitle = this.extractSlideTitle(slide, slideNumber);

            const navItem = document.createElement('div');
            navItem.className = 'slide-nav-item';
            navItem.setAttribute('data-slide', slideNumber);
            navItem.innerHTML = `
                <span class="slide-nav-number">${slideNumber}</span>
                <span class="slide-nav-title">${slideTitle}</span>
            `;

            this.slideNavigation.appendChild(navItem);
        });

        // Update the cached navigation items
        this.slideNavItems = document.querySelectorAll('.slide-nav-item');
    }

    extractSlideTitle(slide, slideNumber) {
        // Try to extract title from various elements in order of preference
        const titleSelectors = [
            'h1',           // Main titles
            'h2',           // Secondary titles
            '.slide-title', // Specific slide title class
            '.slide-subtitle' // Subtitle fallback
        ];

        for (const selector of titleSelectors) {
            const titleElement = slide.querySelector(selector);
            if (titleElement && titleElement.textContent.trim()) {
                let title = titleElement.textContent.trim();
                // Truncate if too long
                if (title.length > 25) {
                    title = title.substring(0, 22) + '...';
                }
                return title;
            }
        }

        // Fallback to slide number
        return `Slide ${slideNumber}`;
    }

    bindSlideNavigationEvents() {
        if (this.slideNavItems) {
            this.slideNavItems.forEach(item => {
                item.addEventListener('click', () => {
                    const slideNumber = parseInt(item.getAttribute('data-slide'));
                    this.goToSlide(slideNumber);
                });
            });
        }
    }

    updateSlideNavigation() {
        if (this.slideNavItems) {
            this.slideNavItems.forEach(item => {
                const slideNumber = parseInt(item.getAttribute('data-slide'));
                if (slideNumber === this.currentSlide) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    }

    updateNavbarTheme() {
        if (this.navbar && this.slides[this.currentSlide - 1]) {
            const currentSlide = this.slides[this.currentSlide - 1];

            // Remove existing theme classes
            this.navbar.classList.remove('navbar-dark', 'navbar-light');

            // Add appropriate theme class based on slide background
            if (currentSlide.classList.contains('slide-dark')) {
                this.navbar.classList.add('navbar-dark');
            } else if (currentSlide.classList.contains('slide-light')) {
                this.navbar.classList.add('navbar-light');
            }
            // Default navbar styling is used for regular slides
        }
    }

    updateQRVisibility() {
        if (this.qrFixed) {
            // Show QR code only on slide 3 (the interactive canvas slide)
            if (this.currentSlide === 3) {
                this.qrFixed.classList.add('visible');
            } else {
                this.qrFixed.classList.remove('visible');
            }
        }
    }
    
    toggleMobileMenu() {
        if (this.navMenu) {
            this.navMenu.classList.toggle('active');
        }
    }
    
    handleResize() {
        // Ensure active slide is properly displayed after resize
        const activeSlide = this.slides[this.currentSlide - 1];
        if (activeSlide) {
            activeSlide.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }
    
    
    // Public API methods
    getCurrentSlide() {
        return this.currentSlide;
    }
    
    getTotalSlides() {
        return this.totalSlides;
    }
    
    jumpToSlide(slideNumber) {
        this.goToSlide(slideNumber);
    }
    
    // Auto-advance functionality (optional)
    startAutoAdvance(intervalMs = 10000) {
        this.stopAutoAdvance();
        this.autoAdvanceInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoAdvance();
            }
        }, intervalMs);
    }
    
    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }
}

// Smooth scrolling utility for anchor links (if needed)
function smoothScrollTo(element, duration = 800) {
    const targetPosition = element.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// Initialize slideshow when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the slideshow presentation
    window.slideshowPresentation = new SlideshowPresentation();
    
    // Add some helpful debugging info
    console.log('RA1 Slideshow Controls:');
    console.log('- Arrow keys: Navigate slides (↑/← previous, ↓/→ next)');
    console.log('- Home/End: Jump to first/last slide');
    console.log('- Escape: Toggle fullscreen');
    console.log('- Touch/Swipe: Navigate on mobile (vertical swipes)');
    
    // Optional: Start auto-advance after a delay (uncomment if needed)
    // setTimeout(() => {
    //     window.slideshowPresentation.startAutoAdvance(15000); // 15 seconds
    // }, 5000);
});

// Handle page visibility changes to pause/resume auto-advance
document.addEventListener('visibilitychange', () => {
    if (window.slideshowPresentation) {
        if (document.hidden) {
            window.slideshowPresentation.stopAutoAdvance();
        }
        // Auto-advance can be manually restarted when page becomes visible
    }
});

// Export for potential external usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlideshowPresentation;
}