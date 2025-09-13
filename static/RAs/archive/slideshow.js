/**
 * Slideshow functionality for interactive content presentations
 */
export class SlideshowManager {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = 0;
    this.isSlideMode = false;
    this.blocks = [];
    this.container = null;
    this.slideNavigation = null;
    this.modeIndicator = null;
  }

  init() {
    this.container = document.getElementById('contentContainer');
    this.slideNavigation = document.getElementById('slideNavigation');
    this.modeIndicator = document.querySelector('.mode-indicator');
    this.blocks = Array.from(document.querySelectorAll('.content-block'));
    this.totalSlides = this.blocks.length;

    this.setupEventListeners();
    this.updateSlideCounter();
  }

  setupEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });

    // Navigation buttons
    document.getElementById('prevBtn')?.addEventListener('click', () => {
      this.previousSlide();
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
      this.nextSlide();
    });

    // Scroll detection for normal mode
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!this.isSlideMode) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.updateCurrentSlideFromScroll();
        }, 100);
      }
    });

    // Prevent default scroll behavior in slide mode
    document.addEventListener('wheel', (e) => {
      if (this.isSlideMode) {
        e.preventDefault();
      }
    }, { passive: false });

    // Touch events for mobile slide navigation
    this.setupTouchEvents();
  }

  setupTouchEvents() {
    let startY = 0;
    let startX = 0;

    document.addEventListener('touchstart', (e) => {
      if (!this.isSlideMode) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    });

    document.addEventListener('touchmove', (e) => {
      if (!this.isSlideMode) return;
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (!this.isSlideMode) return;
      
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const diffY = startY - endY;
      const diffX = startX - endX;

      // Determine if it's a vertical or horizontal swipe
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
        if (diffY > 0) {
          this.nextSlide();
        } else {
          this.previousSlide();
        }
      }
    });
  }

  handleKeyPress(e) {
    switch(e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (!this.isSlideMode) {
          this.enterSlideMode();
        } else {
          this.previousSlide();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!this.isSlideMode) {
          this.enterSlideMode();
        } else {
          this.nextSlide();
        }
        break;
      case 'ArrowLeft':
        if (this.isSlideMode) {
          e.preventDefault();
          this.previousSlide();
        }
        break;
      case 'ArrowRight':
        if (this.isSlideMode) {
          e.preventDefault();
          this.nextSlide();
        }
        break;
      case 'Escape':
        if (this.isSlideMode) {
          e.preventDefault();
          this.exitSlideMode();
        }
        break;
      case ' ':
        if (this.isSlideMode) {
          e.preventDefault();
          this.nextSlide();
        }
        break;
    }
  }

  enterSlideMode() {
    this.isSlideMode = true;
    this.currentSlide = this.getCurrentSlideFromScroll();
    
    // Add slideshow mode classes
    this.container.classList.add('slideshow-mode');
    this.blocks.forEach((block, index) => {
      block.classList.add('slideshow-mode');
      if (index === this.currentSlide) {
        block.classList.add('active');
      } else if (index < this.currentSlide) {
        block.classList.add('prev');
      }
    });

    // Show navigation
    this.slideNavigation.classList.add('visible');
    
    // Update mode indicator
    this.updateModeIndicator();
    
    // Update slide counter
    this.updateSlideCounter();

    // Disable body scroll
    document.body.style.overflow = 'hidden';
  }

  exitSlideMode() {
    this.isSlideMode = false;
    
    // Remove slideshow mode classes
    this.container.classList.remove('slideshow-mode');
    this.blocks.forEach(block => {
      block.classList.remove('slideshow-mode', 'active', 'prev');
    });

    // Hide navigation
    this.slideNavigation.classList.remove('visible');
    
    // Update mode indicator
    this.updateModeIndicator();

    // Re-enable body scroll
    document.body.style.overflow = 'auto';

    // Scroll to current slide
    this.scrollToSlide(this.currentSlide);
  }

  nextSlide() {
    if (!this.isSlideMode) return;
    
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.updateSlideView();
    }
  }

  previousSlide() {
    if (!this.isSlideMode) return;
    
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlideView();
    }
  }

  updateSlideView() {
    this.blocks.forEach((block, index) => {
      block.classList.remove('active', 'prev');
      
      if (index === this.currentSlide) {
        block.classList.add('active');
      } else if (index < this.currentSlide) {
        block.classList.add('prev');
      }
    });

    this.updateSlideCounter();
    this.updateNavigationButtons();
  }

  updateSlideCounter() {
    const counter = document.getElementById('slideCounter');
    if (counter) {
      counter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentSlide === 0;
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }
  }

  getCurrentSlideFromScroll() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      const blockTop = block.offsetTop - 80; // Account for navbar
      const blockBottom = blockTop + block.offsetHeight;
      
      if (scrollPosition >= blockTop - windowHeight / 2 && 
          scrollPosition < blockBottom - windowHeight / 2) {
        return i;
      }
    }
    
    // Default to last slide if scrolled to bottom
    if (scrollPosition + windowHeight >= document.documentElement.scrollHeight - 100) {
      return this.blocks.length - 1;
    }
    
    return 0;
  }

  updateCurrentSlideFromScroll() {
    if (!this.isSlideMode) {
      this.currentSlide = this.getCurrentSlideFromScroll();
      this.updateSlideCounter();
    }
  }

  scrollToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < this.blocks.length) {
      const block = this.blocks[slideIndex];
      const targetPosition = block.offsetTop - 80; // Account for navbar
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  updateModeIndicator() {
    const modeText = this.modeIndicator.querySelector('.mode-text');
    const modeHint = this.modeIndicator.querySelector('.mode-hint');
    
    if (this.isSlideMode) {
      modeText.textContent = 'Mode presentació';
      modeHint.textContent = 'ESC per sortir • ↑↓ per navegar';
    } else {
      modeText.textContent = 'Mode navegació';
      modeHint.textContent = 'Prem ↑↓ per canviar a mode presentació';
    }
  }
}