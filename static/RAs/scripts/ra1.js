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
          if (!this.isPresentationMode) {
            this.togglePresentationMode();
          }
          this.navigateToSection(1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          if (!this.isPresentationMode) {
            this.togglePresentationMode();
          }
          this.navigateToSection(-1);
          break;
        case 'Home':
          e.preventDefault();
          if (!this.isPresentationMode) {
            this.togglePresentationMode();
          }
          this.goToSection(0);
          break;
        case 'End':
          e.preventDefault();
          if (!this.isPresentationMode) {
            this.togglePresentationMode();
          }
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
    // Listen for ESC and Q keys to exit presentation mode
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key.toLowerCase() === 'q') && this.isPresentationMode) {
        this.togglePresentationMode();
      }
    });
  }

  togglePresentationMode() {
    const navbar = document.querySelector('.navbar');
    const storyControls = document.querySelector('.story-controls');
    const navigationHint = document.querySelector('.navigation-hint');
    
    this.isPresentationMode = !this.isPresentationMode;
    
    if (this.isPresentationMode) {
      // Enter presentation mode
      navbar.style.display = 'none';
      storyControls.style.display = 'none';
      navigationHint.style.display = 'none';
      document.body.classList.add('presentation-mode');
      
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
      
      // Exit fullscreen if in fullscreen mode
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }

  async exportToPDF() {
    const exportBtn = document.getElementById('exportBtn');
    const originalText = exportBtn.textContent;
    
    try {
      // Show loading state
      exportBtn.textContent = 'Generant PDF...';
      exportBtn.style.pointerEvents = 'none';
      
      // Ensure fonts are loaded before generating PDF
      await this.ensureFontsLoaded();

      // Create presentation-style PDF (16:9 landscape)
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('landscape', 'mm', [297, 210]); // A4 landscape
      
      // PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 25;
      const contentWidth = pdfWidth - (margin * 2);
      
      // Brand colors matching your CSS
      const brandPurple = [133, 0, 204];
      const brandRed = [251, 75, 78];
      const darkGray = [34, 33, 33];
      const lightGray = [247, 247, 247];
      const textDark = [60, 60, 60];
      
      // Get all story sections
      const sections = Array.from(document.querySelectorAll('.story-section'));
      
      sections.forEach((section, index) => {
        if (index > 0) pdf.addPage();
        
        const isFullSection = section.classList.contains('section-full');
        const isBlackSection = section.classList.contains('section-black');
        const isLightSection = section.classList.contains('section-light');
        const content = section.querySelector('.section-content') || section;
        
        // Set background color
        if (isBlackSection) {
          pdf.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
          pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        } else if (isLightSection) {
          pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
          pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        } else {
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        }
        
        let yPosition = margin + 20;
        
        // Title (H1) - Using Newsreader style
        const h1 = content.querySelector('h1');
        if (h1) {
          const text = h1.textContent.trim();
          pdf.setFont('times', 'bold'); // Times is closer to Newsreader than Helvetica
          pdf.setFontSize(isFullSection ? 36 : 28); // Larger sizes to match HTML impact
          pdf.setTextColor(isBlackSection ? 247 : brandPurple[0], isBlackSection ? 247 : brandPurple[1], isBlackSection ? 247 : brandPurple[2]);
          
          const lines = pdf.splitTextToSize(text, contentWidth);
          const textHeight = lines.length * (isFullSection ? 14 : 10);
          
          if (isFullSection) {
            // Center vertically for full sections
            const startY = (pdfHeight - textHeight) / 2;
            pdf.text(lines, pdfWidth / 2, startY, { align: 'center' });
            yPosition = startY + textHeight + 30;
          } else {
            pdf.text(lines, margin, yPosition);
            yPosition += textHeight + 25;
          }
        }
        
        // Statement paragraphs (subtitle style) - Using Mulish style
        const statements = content.querySelectorAll('p.statement');
        statements.forEach(stmt => {
          const text = stmt.textContent.trim();
          if (text) {
            pdf.setFont('helvetica', 'normal'); // Helvetica is closest to Mulish
            pdf.setFontSize(18); // Slightly larger for better readability
            pdf.setTextColor(isBlackSection ? 200 : brandPurple[0], isBlackSection ? 200 : brandPurple[1], isBlackSection ? 200 : brandPurple[2]);
            
            const lines = pdf.splitTextToSize(text, contentWidth);
            const startX = isFullSection ? pdfWidth / 2 : margin;
            const align = isFullSection ? 'center' : 'left';
            
            pdf.text(lines, startX, yPosition, { align: align });
            yPosition += lines.length * 7 + 20;
          }
        });
        
        // Comments (small gray text) - Using Mulish light
        const comments = content.querySelectorAll('p.comment');
        comments.forEach(comment => {
          const text = comment.textContent.trim();
          if (text) {
            pdf.setFont('helvetica', 'normal'); // Helvetica normal for Mulish light
            pdf.setFontSize(12);
            pdf.setTextColor(isBlackSection ? 180 : 120, isBlackSection ? 180 : 120, isBlackSection ? 180 : 120);
            
            const lines = pdf.splitTextToSize(text, contentWidth);
            const startX = isFullSection ? pdfWidth / 2 : margin;
            const align = isFullSection ? 'center' : 'left';
            
            pdf.text(lines, startX, yPosition, { align: align });
            yPosition += lines.length * 5 + 15;
          }
        });
        
        // H2 subtitles - Using Mulish bold
        const h2 = content.querySelector('h2');
        if (h2) {
          const text = h2.textContent.trim();
          pdf.setFont('helvetica', 'bold'); // Helvetica bold for Mulish bold
          pdf.setFontSize(22); // Slightly larger for better hierarchy
          pdf.setTextColor(isBlackSection ? 247 : textDark[0], isBlackSection ? 247 : textDark[1], isBlackSection ? 247 : textDark[2]);
          
          const lines = pdf.splitTextToSize(text, contentWidth);
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 8 + 20;
        }
        
        // H3 subtitles - Using Mulish bold
        const h3Elements = content.querySelectorAll('h3');
        h3Elements.forEach(h3 => {
          if (!h3.closest('.concept-card')) { // Skip h3 inside cards, handle them separately
            const text = h3.textContent.trim();
            pdf.setFont('helvetica', 'bold'); // Helvetica bold for Mulish bold
            pdf.setFontSize(16);
            pdf.setTextColor(isBlackSection ? 220 : brandPurple[0], isBlackSection ? 220 : brandPurple[1], isBlackSection ? 220 : brandPurple[2]);
            
            const lines = pdf.splitTextToSize(text, contentWidth);
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 15;
          }
        });
        
        // Regular paragraphs - Using Mulish normal
        const paragraphs = content.querySelectorAll('p:not(.statement):not(.comment)');
        paragraphs.forEach(p => {
          const text = p.textContent.trim();
          if (text && yPosition < pdfHeight - 60) {
            pdf.setFont('helvetica', 'normal'); // Helvetica for body text (Mulish)
            pdf.setFontSize(13); // Slightly larger for better readability
            pdf.setTextColor(isBlackSection ? 200 : textDark[0], isBlackSection ? 200 : textDark[1], isBlackSection ? 200 : textDark[2]);
            
            const lines = pdf.splitTextToSize(text, contentWidth - 20);
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 5 + 12;
          }
        });
        
        // Concept cards
        const conceptCards = content.querySelectorAll('.concept-card');
        if (conceptCards.length > 0 && yPosition < pdfHeight - 80) {
          const cardsPerRow = Math.min(conceptCards.length, 3);
          const cardWidth = (contentWidth - (cardsPerRow - 1) * 15) / cardsPerRow;
          const startY = yPosition;
          
          conceptCards.forEach((card, cardIndex) => {
            if (cardIndex >= 6) return; // Limit cards per slide
            
            const row = Math.floor(cardIndex / 3);
            const col = cardIndex % 3;
            const cardX = margin + (col * (cardWidth + 15));
            const cardY = startY + (row * 70);
            
            // Card background
            pdf.setFillColor(isBlackSection ? 45 : 250, isBlackSection ? 45 : 250, isBlackSection ? 45 : 250);
            pdf.roundedRect(cardX - 5, cardY - 10, cardWidth + 10, 60, 3, 3, 'F');
            
            // Card title - Using Mulish bold
            const cardH3 = card.querySelector('h3');
            if (cardH3) {
              pdf.setFont('helvetica', 'bold'); // Helvetica bold for card titles
              pdf.setFontSize(14);
              pdf.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
              
              const title = cardH3.textContent.trim();
              const titleLines = pdf.splitTextToSize(title, cardWidth - 10);
              pdf.text(titleLines, cardX, cardY);
            }
            
            // Card content - Using Mulish normal
            const cardP = card.querySelector('p');
            if (cardP) {
              pdf.setFont('helvetica', 'normal'); // Helvetica normal for card content
              pdf.setFontSize(10);
              pdf.setTextColor(isBlackSection ? 180 : 80, isBlackSection ? 180 : 80, isBlackSection ? 180 : 80);
              
              const cardText = cardP.textContent.trim();
              const contentLines = pdf.splitTextToSize(cardText, cardWidth - 10);
              pdf.text(contentLines, cardX, cardY + 12);
            }
          });
          
          yPosition += Math.ceil(conceptCards.length / 3) * 70 + 20;
        }
        
        // Lists
        const lists = content.querySelectorAll('ul, ol');
        lists.forEach(list => {
          if (yPosition < pdfHeight - 50) {
            const items = Array.from(list.querySelectorAll('li')).slice(0, 8);
            
            items.forEach(item => {
              const text = '• ' + item.textContent.trim();
              pdf.setFont('helvetica', 'normal'); // Helvetica for list items (Mulish)
              pdf.setFontSize(11);
              pdf.setTextColor(isBlackSection ? 200 : textDark[0], isBlackSection ? 200 : textDark[1], isBlackSection ? 200 : textDark[2]);
              
              const lines = pdf.splitTextToSize(text, contentWidth - 30);
              pdf.text(lines, margin + 15, yPosition);
              yPosition += lines.length * 4 + 3;
            });
            yPosition += 15;
          }
        });
        
        // Blockquotes
        const quotes = content.querySelectorAll('blockquote');
        quotes.forEach(quote => {
          if (yPosition < pdfHeight - 40) {
            const text = quote.textContent.trim();
            
            // Quote line
            pdf.setDrawColor(brandPurple[0], brandPurple[1], brandPurple[2]);
            pdf.setLineWidth(3);
            pdf.line(margin, yPosition - 5, margin + 10, yPosition - 5);
            
            pdf.setFont('helvetica', 'oblique'); // Italic style for quotes
            pdf.setFontSize(14);
            pdf.setTextColor(isBlackSection ? 180 : 100, isBlackSection ? 180 : 100, isBlackSection ? 180 : 100);
            
            const lines = pdf.splitTextToSize(text, contentWidth - 40);
            pdf.text(lines, margin + 20, yPosition);
            yPosition += lines.length * 6 + 20;
          }
        });
        
        // Footer - Using Mulish normal
        pdf.setFont('helvetica', 'normal'); // Helvetica for footer text
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`${index + 1}`, pdfWidth - margin, pdfHeight - 15, { align: 'right' });
        
        if (!isFullSection) {
          pdf.text('RA1 - Digitalització Aplicada', margin, pdfHeight - 15);
        }
      });

      // Save PDF
      const fileName = `RA1_Presentacio_Digitalitzacio_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generant el PDF. Si us plau, torna-ho a intentar.');
    } finally {
      // Reset button
      exportBtn.textContent = originalText;
      exportBtn.style.pointerEvents = 'auto';
    }
  }

  async ensureFontsLoaded() {
    // Wait for Google Fonts to load before generating PDF
    if (typeof FontFaceObserver !== 'undefined') {
      try {
        const mulish = new FontFaceObserver('Mulish');
        const newsreader = new FontFaceObserver('Newsreader');
        const kanit = new FontFaceObserver('Kanit');
        
        await Promise.all([
          mulish.load(null, 3000),
          newsreader.load(null, 3000),
          kanit.load(null, 3000)
        ]);
      } catch (e) {
        console.log('Some fonts may not have loaded completely');
      }
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
}

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.navbar__bars');
  const menu = document.querySelector('.navbar__menu');
  
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', function() {
      menu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const menuLinks = document.querySelectorAll('.navbar__menu--links');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        menu.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!menuToggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('active');
      }
    });
  }
});