/**
 * Storytelling experience with smooth scrolling and progressive disclosure
 * Based on modern storytelling websites with hybrid navigation
 */

class StorytellingExperience {
  constructor() {
    this.currentSectionIndex = 0;
    this.sections = [];
    this.isNavigating = false;
    
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

  async exportToPDF() {
    const exportBtn = document.getElementById('exportBtn');
    const originalText = exportBtn.innerHTML;
    
    try {
      // Show loading state
      exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generant PDF...';
      exportBtn.disabled = true;

      // Create PDF with proper text content
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pdfWidth - (margin * 2);
      let yPosition = margin;

      // Title page
      pdf.setFontSize(24);
      pdf.setTextColor(133, 0, 204);
      pdf.text('Repercussió de la digitalització', margin, yPosition);
      yPosition += 12;
      pdf.text('en els sectors productius', margin, yPosition);
      yPosition += 20;
      
      pdf.setFontSize(16);
      pdf.setTextColor(34, 33, 33);
      pdf.text('RA1 - Resultats d\'Aprenentatge 1', margin, yPosition);
      yPosition += 10;
      pdf.text('Institut Pompeu Fabra', margin, yPosition);
      yPosition += 10;
      pdf.text('Curs 2025/26', margin, yPosition);
      
      // Process content sections
      const contentSections = document.querySelectorAll('.story-section .section-content');
      
      for (let section of contentSections) {
        // Check if we need a new page
        if (yPosition > pdfHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        // Extract headings
        const headings = section.querySelectorAll('h1, h2, h3');
        headings.forEach(heading => {
          if (yPosition > pdfHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }

          const text = heading.textContent.trim();
          if (text) {
            const fontSize = heading.tagName === 'H1' ? 20 : 
                           heading.tagName === 'H2' ? 16 : 14;
            pdf.setFontSize(fontSize);
            pdf.setTextColor(133, 0, 204);
            
            const lines = pdf.splitTextToSize(text, contentWidth);
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * (fontSize * 0.35) + 10;
          }
        });

        // Extract paragraphs
        const paragraphs = section.querySelectorAll('p:not(.comment):not(.statement)');
        paragraphs.forEach(p => {
          const text = p.textContent.trim();
          if (text) {
            pdf.setFontSize(11);
            pdf.setTextColor(34, 33, 33);
            
            const lines = pdf.splitTextToSize(text, contentWidth);
            
            // Check if we need a new page
            if (yPosition + (lines.length * 4) > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 4 + 6;
          }
        });

        // Extract lists
        const lists = section.querySelectorAll('ul, ol');
        lists.forEach(list => {
          const items = Array.from(list.querySelectorAll('li'));
          
          items.forEach(item => {
            const text = '• ' + item.textContent.trim();
            
            pdf.setFontSize(10);
            pdf.setTextColor(34, 33, 33);
            
            const lines = pdf.splitTextToSize(text, contentWidth - 20);
            
            if (yPosition + (lines.length * 4) > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.text(lines, margin + 10, yPosition);
            yPosition += lines.length * 4 + 2;
          });
          
          yPosition += 8;
        });

        // Extract blockquotes
        const quotes = section.querySelectorAll('blockquote');
        quotes.forEach(quote => {
          const text = quote.textContent.trim();
          if (text) {
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            
            const lines = pdf.splitTextToSize(text, contentWidth - 20);
            
            if (yPosition + (lines.length * 5) > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            
            // Add quote styling
            pdf.setDrawColor(133, 0, 204);
            pdf.line(margin, yPosition - 3, margin + 3, yPosition - 3);
            
            pdf.text(lines, margin + 10, yPosition);
            yPosition += lines.length * 5 + 10;
          }
        });

        yPosition += 15; // Space between sections
      }

      // Add footer to each page
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`RA1 - Digitalització Aplicada - Pàgina ${i}/${pageCount}`, 
                  margin, pdfHeight - 10);
      }

      // Save PDF
      const fileName = `RA1_Digitalitzacio_Sectors_Productius_${new Date().toISOString().split('T')[0]}.pdf`;
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