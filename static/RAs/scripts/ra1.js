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
        
        // Interactive canvas elements
        this.canvas = document.getElementById('wordCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.studentInput = document.getElementById('studentInput');
        this.addTextBtn = document.getElementById('addTextBtn');
        this.clearCanvasBtn = document.getElementById('clearCanvasBtn');
        
        // Set up initial state
        this.updateSlideCounter();
        this.updateProgressPercentage();
        this.updateNavigationButtons();
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize first slide
        this.showSlide(1);
        
        // Initialize canvas if it exists
        this.initializeCanvas();
        
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
        
        // Interactive canvas events
        this.addTextBtn?.addEventListener('click', () => this.addTextToCanvas());
        this.clearCanvasBtn?.addEventListener('click', () => this.clearCanvas());
        this.studentInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTextToCanvas();
            }
        });
        
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
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
        
        switch (e.code) {
            case 'ArrowUp':
            case 'ArrowLeft':
                this.previousSlide();
                break;
            case 'ArrowDown':
            case 'ArrowRight':
            case 'Space':
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
    
    // Interactive Canvas Methods
    addTextToCanvas() {
        if (!this.canvas || !this.ctx || !this.studentInput) return;
        
        const text = this.studentInput.value.trim();
        if (!text) return;
        
        // Clear the input
        this.studentInput.value = '';
        
        // Generate random properties
        const colors = ['#0366d6', '#db4a38', '#28a745', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'];
        const fonts = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Helvetica'];
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
        const randomSize = Math.floor(Math.random() * 30) + 16; // 16-45px
        const randomRotation = (Math.random() - 0.5) * 60; // -30 to +30 degrees
        
        // Random position (with some margin from edges)
        const margin = 50;
        const maxX = this.canvas.width - margin;
        const maxY = this.canvas.height - margin;
        const x = Math.floor(Math.random() * (maxX - margin)) + margin;
        const y = Math.floor(Math.random() * (maxY - margin)) + margin;
        
        // Set up context
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(randomRotation * Math.PI / 180);
        this.ctx.font = `${randomSize}px ${randomFont}`;
        this.ctx.fillStyle = randomColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add text shadow for better visibility
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        // Draw the text
        this.ctx.fillText(text, 0, 0);
        
        // Restore context
        this.ctx.restore();
    }
    
    clearCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add background matching page color
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add a border
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    initializeCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        // Set canvas size to match container
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = Math.min(800, container.clientWidth - 40);
            this.canvas.height = 400;
        }
        
        // Initialize with placeholder
        this.clearCanvas();
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
    console.log('- Space: Next slide');
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