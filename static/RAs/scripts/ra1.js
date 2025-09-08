/**
 * Modular version of RA1 interactive content
 * Combines all functionality in a single file for easy importing
 */

// Slideshow functionality
class SlideshowManager {
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
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });

    document.getElementById('prevBtn')?.addEventListener('click', () => {
      this.previousSlide();
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
      this.nextSlide();
    });

    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!this.isSlideMode) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.updateCurrentSlideFromScroll();
        }, 100);
      }
    });

    document.addEventListener('wheel', (e) => {
      if (this.isSlideMode) {
        e.preventDefault();
      }
    }, { passive: false });

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
    
    this.container.classList.add('slideshow-mode');
    this.blocks.forEach((block, index) => {
      block.classList.add('slideshow-mode');
      if (index === this.currentSlide) {
        block.classList.add('active');
      } else if (index < this.currentSlide) {
        block.classList.add('prev');
      }
    });

    this.slideNavigation.classList.add('visible');
    this.updateModeIndicator();
    this.updateSlideCounter();
    document.body.style.overflow = 'hidden';
  }

  exitSlideMode() {
    this.isSlideMode = false;
    
    this.container.classList.remove('slideshow-mode');
    this.blocks.forEach(block => {
      block.classList.remove('slideshow-mode', 'active', 'prev');
    });

    this.slideNavigation.classList.remove('visible');
    this.updateModeIndicator();
    document.body.style.overflow = 'auto';
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
      const blockTop = block.offsetTop - 80;
      const blockBottom = blockTop + block.offsetHeight;
      
      if (scrollPosition >= blockTop - windowHeight / 2 && 
          scrollPosition < blockBottom - windowHeight / 2) {
        return i;
      }
    }
    
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
      const targetPosition = block.offsetTop - 80;
      
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

// PDF Export functionality
class PDFExporter {
  constructor(slideshowManager) {
    this.slideshowManager = slideshowManager;
  }

  init() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToPDF();
      });
    }
  }

  async exportToPDF() {
    const exportBtn = document.getElementById('exportBtn');
    const originalText = exportBtn.innerHTML;
    
    try {
      exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generant PDF...';
      exportBtn.disabled = true;

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const wasInSlideMode = this.slideshowManager.isSlideMode;
      if (!wasInSlideMode) {
        this.slideshowManager.enterSlideMode();
      }

      for (let i = 0; i < this.slideshowManager.blocks.length; i++) {
        this.slideshowManager.currentSlide = i;
        this.slideshowManager.updateSlideView();
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const activeSlide = document.querySelector('.content-block.active');
        
        if (activeSlide) {
          try {
            const canvas = await html2canvas(activeSlide, {
              useCORS: true,
              allowTaint: true,
              scale: 2,
              width: activeSlide.offsetWidth,
              height: activeSlide.offsetHeight,
              backgroundColor: '#f7f7f7'
            });
            
            const canvasAspectRatio = canvas.width / canvas.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;
            
            let imgWidth, imgHeight, imgX, imgY;
            
            if (canvasAspectRatio > pdfAspectRatio) {
              imgWidth = pdfWidth - 20;
              imgHeight = imgWidth / canvasAspectRatio;
              imgX = 10;
              imgY = (pdfHeight - imgHeight) / 2;
            } else {
              imgHeight = pdfHeight - 20;
              imgWidth = imgHeight * canvasAspectRatio;
              imgX = (pdfWidth - imgWidth) / 2;
              imgY = 10;
            }
            
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);
            
            if (i < this.slideshowManager.blocks.length - 1) {
              pdf.addPage();
            }
            
          } catch (error) {
            console.error(`Error capturing slide ${i + 1}:`, error);
          }
        }
      }

      if (!wasInSlideMode) {
        this.slideshowManager.exitSlideMode();
      }

      const fileName = `RA1_Digitalitzacio_Sectors_Productius_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generant el PDF. Si us plau, torna-ho a intentar.');
    } finally {
      exportBtn.innerHTML = originalText;
      exportBtn.disabled = false;
    }
  }
}

// Animation utilities
class AnimationUtils {
  static observeElements() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.concept-item, .department-card, .benefit-item, .comparison-side');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `all 0.6s ease ${index * 0.1}s`;
      
      observer.observe(el);
    });
  }

  static addHoverEffects() {
    const cards = document.querySelectorAll('.concept-item, .department-card, .benefit-item');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  static createKeyboardHints() {
    const keyboardHints = document.createElement('div');
    keyboardHints.className = 'keyboard-hints';
    keyboardHints.innerHTML = `
      <div class="hint-item">↑↓ Mode presentació</div>
      <div class="hint-item">ESC Sortir</div>
      <div class="hint-item">→← Navegar</div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-hints {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        padding: 10px;
        border-radius: 10px;
        font-size: 0.8rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 998;
        transition: all 0.3s ease;
        opacity: 0.7;
      }
      
      .keyboard-hints:hover {
        opacity: 1;
      }
      
      .hint-item {
        margin: 2px 0;
        color: #222121;
      }
      
      @media screen and (max-width: 768px) {
        .keyboard-hints {
          display: none;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(keyboardHints);
  }
}

// Main application
class InteractiveContent {
  constructor() {
    this.slideshowManager = new SlideshowManager();
    this.pdfExporter = new PDFExporter(this.slideshowManager);
  }

  init() {
    this.slideshowManager.init();
    this.pdfExporter.init();
    
    AnimationUtils.observeElements();
    AnimationUtils.addHoverEffects();
    AnimationUtils.createKeyboardHints();
    
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new InteractiveContent();
  app.init();
});