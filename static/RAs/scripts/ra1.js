/**
 * Storytelling experience with smooth scrolling and progressive disclosure
 * Based on modern storytelling websites with hybrid navigation
 */

class StorytellingExperience {
  constructor() {
    this.currentSectionIndex = 0;
    this.sections = [];
    this.isNavigating = false;
    this.isPresentationMode = false;
    
    this.init();
  }

  init() {
    // Get all story sections
    this.sections = Array.from(document.querySelectorAll('[data-section]'));
    
    // Setup intersection observer for progressive disclosure
    this.setupIntersectionObserver();
    
    // Setup keyboard navigation
    this.setupKeyboardNavigation();
    
    // Setup PDF export
    this.setupPDFExport();
    
    // Setup presentation mode
    this.setupPresentationMode();
    
    // Setup scroll tracking
    this.setupScrollTracking();
    
    console.log(`Story initialized with ${this.sections.length} sections`);
  }

  setupIntersectionObserver() {
    // Observer for slide animations
    const slideObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all slides
    document.querySelectorAll('.slide').forEach(slide => {
      slideObserver.observe(slide);
    });

    // Observer for section tracking
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isNavigating) {
          const sectionIndex = this.sections.findIndex(section => section === entry.target);
          if (sectionIndex !== -1) {
            this.currentSectionIndex = sectionIndex;
          }
        }
      });
    }, {
      threshold: 0.3
    });

    // Observe all sections
    this.sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          this.navigateToSection(1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          this.navigateToSection(-1);
          break;
        case 'Home':
          e.preventDefault();
          this.goToSection(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSection(this.sections.length - 1);
          break;
      }
    });
  }

  navigateToSection(direction) {
    const newIndex = this.currentSectionIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.sections.length) {
      this.goToSection(newIndex);
    }
  }

  goToSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    
    this.isNavigating = true;
    this.currentSectionIndex = index;
    
    const targetSection = this.sections[index];
    
    // Smooth scroll to section
    targetSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    // Reset navigation flag after scroll completes
    setTimeout(() => {
      this.isNavigating = false;
    }, 1000);
  }

  setupScrollTracking() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!this.isNavigating) {
          this.updateCurrentSection();
        }
      }, 100);
    });
  }

  updateCurrentSection() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections[i];
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        this.currentSectionIndex = i;
        break;
      }
    }
  }

  setupPDFExport() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToPDF();
      });
    }
  }

  setupPresentationMode() {
    const presentBtn = document.getElementById('presentBtn');
    if (presentBtn) {
      presentBtn.addEventListener('click', () => {
        this.togglePresentationMode();
      });
    }

    // Listen for ESC key to exit presentation mode
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isPresentationMode) {
        this.togglePresentationMode();
      }
    });
  }

  togglePresentationMode() {
    const navbar = document.querySelector('.navbar');
    const storyControls = document.querySelector('.story-controls');
    const navigationHint = document.querySelector('.navigation-hint');
    const presentBtn = document.getElementById('presentBtn');
    
    this.isPresentationMode = !this.isPresentationMode;
    
    if (this.isPresentationMode) {
      // Enter presentation mode
      navbar.style.display = 'none';
      storyControls.style.display = 'none';
      navigationHint.style.display = 'none';
      document.body.classList.add('presentation-mode');
      presentBtn.innerHTML = '<i class="fas fa-compress"></i> Sortir Presentació';
      
      // Request fullscreen if supported
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Fullscreen not available:', err);
        });
      }
    } else {
      // Exit presentation mode
      navbar.style.display = 'flex';
      storyControls.style.display = 'flex';
      navigationHint.style.display = 'block';
      document.body.classList.remove('presentation-mode');
      presentBtn.innerHTML = '<i class="fas fa-expand"></i> Mode Presentació';
      
      // Exit fullscreen if in fullscreen mode
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }

  async exportToPDF() {
    const exportBtn = document.getElementById('exportBtn');
    const originalText = exportBtn.innerHTML;
    
    try {
      // Show loading state
      exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generant PDF...';
      exportBtn.disabled = true;

      // Create presentation-style PDF (16:9 landscape)
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('landscape', 'mm', [297, 210]); // A4 landscape for presentation
      
      // PDF dimensions for presentation slides
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 30;
      const contentWidth = pdfWidth - (margin * 2);
      
      // Get all story sections to create slides
      const sections = Array.from(document.querySelectorAll('.story-section'));
      
      sections.forEach((section, index) => {
        if (index > 0) pdf.addPage(); // Add new page for each section
        
        let yPosition = margin + 20;
        
        // Check if it's a full section (title slide)
        const isFullSection = section.classList.contains('section-full');
        const isBlackSection = section.classList.contains('section-black');
        
        // Set background for black sections
        if (isBlackSection) {
          pdf.setFillColor(34, 33, 33);
          pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        }
        
        const content = section.querySelector('.section-content') || section;
        
        // Extract and format title (H1)
        const h1 = content.querySelector('h1');
        if (h1) {
          const text = h1.textContent.trim();
          pdf.setFontSize(isFullSection ? 36 : 28);
          pdf.setTextColor(isBlackSection ? 247 : 133, isBlackSection ? 247 : 0, isBlackSection ? 247 : 204);
          
          const lines = pdf.splitTextToSize(text, contentWidth);
          const textHeight = lines.length * 12;
          const startY = isFullSection ? (pdfHeight - textHeight) / 2 : yPosition;
          
          pdf.text(lines, pdfWidth / 2, startY, { align: 'center' });
          yPosition = startY + textHeight + 20;
        }
        
        // Extract subtitles and statements
        const statements = content.querySelectorAll('p.statement');
        statements.forEach(stmt => {
          const text = stmt.textContent.trim();
          if (text) {
            pdf.setFontSize(18);
            pdf.setTextColor(isBlackSection ? 200 : 133, isBlackSection ? 200 : 0, isBlackSection ? 200 : 204);
            
            const lines = pdf.splitTextToSize(text, contentWidth);
            pdf.text(lines, pdfWidth / 2, yPosition, { align: 'center' });
            yPosition += lines.length * 8 + 15;
          }
        });
        
        // Extract and format subtitles (H2)
        const h2 = content.querySelector('h2');
        if (h2) {
          const text = h2.textContent.trim();
          pdf.setFontSize(24);
          pdf.setTextColor(isBlackSection ? 247 : 34, isBlackSection ? 247 : 33, isBlackSection ? 247 : 33);
          
          const lines = pdf.splitTextToSize(text, contentWidth);
          pdf.text(lines, pdfWidth / 2, yPosition, { align: 'center' });
          yPosition += lines.length * 10 + 20;
        }
        
        // Extract main content paragraphs
        const paragraphs = content.querySelectorAll('p:not(.statement):not(.comment)');
        paragraphs.forEach(p => {
          const text = p.textContent.trim();
          if (text && yPosition < pdfHeight - 50) {
            pdf.setFontSize(14);
            pdf.setTextColor(isBlackSection ? 220 : 34, isBlackSection ? 220 : 33, isBlackSection ? 220 : 33);
            
            const lines = pdf.splitTextToSize(text, contentWidth);
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 12;
          }
        });
        
        // Extract key points from cards
        const conceptCards = content.querySelectorAll('.concept-card');
        if (conceptCards.length > 0 && yPosition < pdfHeight - 100) {
          let cardY = yPosition;
          const cardWidth = (contentWidth - 40) / Math.min(conceptCards.length, 3);
          
          conceptCards.forEach((card, cardIndex) => {
            if (cardIndex >= 3) return; // Limit to 3 cards per slide
            
            const cardX = margin + (cardIndex * (cardWidth + 20));
            const h3 = card.querySelector('h3');
            const cardText = card.querySelector('p') || card;
            
            if (h3) {
              pdf.setFontSize(16);
              pdf.setTextColor(133, 0, 204);
              const title = h3.textContent.trim();
              pdf.text(title, cardX, cardY);
              cardY += 10;
            }
            
            if (cardText && cardText !== h3) {
              pdf.setFontSize(11);
              pdf.setTextColor(60, 60, 60);
              const text = cardText.textContent.trim();
              const lines = pdf.splitTextToSize(text, cardWidth - 10);
              pdf.text(lines, cardX, cardY);
            }
          });
          
          yPosition = cardY + 40;
        }
        
        // Extract lists
        const lists = content.querySelectorAll('ul, ol');
        lists.forEach(list => {
          if (yPosition < pdfHeight - 60) {
            const items = Array.from(list.querySelectorAll('li')).slice(0, 6); // Limit items per slide
            
            items.forEach(item => {
              const text = '• ' + item.textContent.trim();
              pdf.setFontSize(12);
              pdf.setTextColor(isBlackSection ? 200 : 60, isBlackSection ? 200 : 60, isBlackSection ? 200 : 60);
              
              const lines = pdf.splitTextToSize(text, contentWidth - 20);
              pdf.text(lines, margin + 10, yPosition);
              yPosition += lines.length * 5 + 3;
            });
            yPosition += 10;
          }
        });
        
        // Extract blockquotes
        const quotes = content.querySelectorAll('blockquote');
        quotes.forEach(quote => {
          if (yPosition < pdfHeight - 40) {
            const text = quote.textContent.trim();
            pdf.setFontSize(16);
            pdf.setTextColor(100, 100, 100);
            
            // Add quote styling
            pdf.setDrawColor(133, 0, 204);
            pdf.setLineWidth(2);
            pdf.line(margin, yPosition - 5, margin + 5, yPosition - 5);
            
            const lines = pdf.splitTextToSize(text, contentWidth - 30);
            pdf.text(lines, margin + 15, yPosition);
            yPosition += lines.length * 8 + 15;
          }
        });
        
        // Add footer with slide number
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`${index + 1}`, pdfWidth - margin, pdfHeight - 15, { align: 'right' });
        
        // Add title in footer for content slides
        if (!isFullSection && h1) {
          pdf.text('RA1 - Digitalització Aplicada', margin, pdfHeight - 15);
        }
      });

      // Save PDF with presentation format
      const fileName = `RA1_Presentacio_Digitalitzacio_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generant el PDF. Si us plau, torna-ho a intentar.');
    } finally {
      // Reset button
      exportBtn.innerHTML = originalText;
      exportBtn.disabled = false;
    }
  }
}

// Smooth scrolling utility
function smoothScrollTo(element, duration = 1000) {
  const targetPosition = element.offsetTop - 80; // Account for navbar
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

// Initialize the storytelling experience when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new StorytellingExperience();
  
  // Add loading state management
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Trigger initial slide animations for visible content
    setTimeout(() => {
      const visibleSlides = document.querySelectorAll('.slide');
      visibleSlides.forEach((slide, index) => {
        const rect = slide.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => {
            slide.classList.add('slide-visible');
          }, index * 100);
        }
      });
    }, 500);
  });
});