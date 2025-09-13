/* ==========================================================================
   RA1 SLIDESHOW PRESENTATION SYSTEM
   Modern slideshow functionality inspired by master folder's approach
   ========================================================================== */


class SlideshowPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 13;
        this.slides = [];
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.slideshowContainer = document.getElementById('slideshowContainer');
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevSlide');
        this.nextBtn = document.getElementById('nextSlide');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        this.progressPercentage = document.getElementById('progressPercentage');
        this.hamburgerMenu = document.querySelector('.navbar__bars');
        this.navMenu = document.querySelector('.navbar__menu');
        
        // QR code visibility control
        this.qrFixed = document.getElementById('qrFixed');
        
        // Set up initial state
        this.updateSlideCounter();
        this.updateProgressPercentage();
        this.updateNavigationButtons();
        
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
        
        
        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Prevent context menu on slides for smoother interaction
        this.slides.forEach(slide => {
            slide.addEventListener('contextmenu', (e) => e.preventDefault());
        });
    }
    
    bindTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        this.slideshowContainer?.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        this.slideshowContainer?.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 50;
            
            // Only trigger swipe if vertical movement is greater than horizontal
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        }, { passive: true });
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
    
    updateQRVisibility() {
        console.log('updateQRVisibility called, currentSlide:', this.currentSlide);
        console.log('qrFixed element:', this.qrFixed);
        
        if (this.qrFixed) {
            // Show QR code only on slide 3 (the interactive canvas slide)
            if (this.currentSlide === 3) {
                console.log('Setting QR visible');
                this.qrFixed.classList.add('visible');
            } else {
                console.log('Setting QR hidden');
                this.qrFixed.classList.remove('visible');
            }
        } else {
            console.error('QR element not found!');
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