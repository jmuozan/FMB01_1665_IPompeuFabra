/**
 * Clean RA1 Interactive Content with proper PDF generation and 3:2 aspect ratio
 */

class RAContentManager {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = 0;
    this.isPresentationMode = false;
    this.slides = [];
    
    this.init();
  }

  init() {
    this.slides = Array.from(document.querySelectorAll('.content-block'));
    this.totalSlides = this.slides.length;
    
    this.setupEventListeners();
    this.updateSlideCounter();
  }

  setupEventListeners() {
    // Presentation mode toggle
    const presentationBtn = document.getElementById('presentationBtn');
    if (presentationBtn) {
      presentationBtn.addEventListener('click', () => {
        this.togglePresentationMode();
      });
    }

    // PDF export
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToPDF();
      });
    }

    // Navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousSlide());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });
  }

  handleKeyPress(e) {
    switch(e.key.toLowerCase()) {
      case 'p':
        e.preventDefault();
        this.togglePresentationMode();
        break;
      case 'escape':
        if (this.isPresentationMode) {
          e.preventDefault();
          this.exitPresentationMode();
        }
        break;
      case 'arrowright':
      case ' ':
        if (this.isPresentationMode) {
          e.preventDefault();
          this.nextSlide();
        }
        break;
      case 'arrowleft':
        if (this.isPresentationMode) {
          e.preventDefault();
          this.previousSlide();
        }
        break;
    }
  }

  togglePresentationMode() {
    if (this.isPresentationMode) {
      this.exitPresentationMode();
    } else {
      this.enterPresentationMode();
    }
  }

  enterPresentationMode() {
    this.isPresentationMode = true;
    
    // Add presentation mode class
    document.body.classList.add('presentation-mode');
    
    // Convert content blocks to presentation slides
    this.slides.forEach((slide, index) => {
      slide.classList.add('presentation-slide');
      if (index === this.currentSlide) {
        slide.classList.add('active');
      }
    });

    // Show navigation
    document.getElementById('slideNavigation').classList.add('visible');
    
    // Update mode indicator
    this.updateModeIndicator();
    
    // Update presentation button
    const presentationBtn = document.getElementById('presentationBtn');
    if (presentationBtn) {
      presentationBtn.innerHTML = '<i class="fas fa-eye"></i> Sortir presentació';
    }
  }

  exitPresentationMode() {
    this.isPresentationMode = false;
    
    // Remove presentation mode class
    document.body.classList.remove('presentation-mode');
    
    // Remove presentation slide classes
    this.slides.forEach(slide => {
      slide.classList.remove('presentation-slide', 'active');
    });

    // Hide navigation
    document.getElementById('slideNavigation').classList.remove('visible');
    
    // Update mode indicator
    this.updateModeIndicator();
    
    // Update presentation button
    const presentationBtn = document.getElementById('presentationBtn');
    if (presentationBtn) {
      presentationBtn.innerHTML = '<i class="fas fa-presentation"></i> Presentació';
    }
  }

  nextSlide() {
    if (!this.isPresentationMode) return;
    
    if (this.currentSlide < this.totalSlides - 1) {
      this.slides[this.currentSlide].classList.remove('active');
      this.currentSlide++;
      this.slides[this.currentSlide].classList.add('active');
      this.updateSlideCounter();
      this.updateNavigationButtons();
    }
  }

  previousSlide() {
    if (!this.isPresentationMode) return;
    
    if (this.currentSlide > 0) {
      this.slides[this.currentSlide].classList.remove('active');
      this.currentSlide--;
      this.slides[this.currentSlide].classList.add('active');
      this.updateSlideCounter();
      this.updateNavigationButtons();
    }
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

  updateModeIndicator() {
    const modeText = document.querySelector('.mode-text');
    const modeHint = document.querySelector('.mode-hint');
    
    if (this.isPresentationMode) {
      modeText.textContent = 'Mode presentació';
      modeHint.textContent = 'ESC per sortir • ←→ per navegar';
    } else {
      modeText.textContent = 'Mode navegació';
      modeHint.textContent = 'Prem P per mode presentació';
    }
  }

  async exportToPDF() {
    const exportBtn = document.getElementById('exportBtn');
    const originalText = exportBtn.innerHTML;
    
    try {
      // Show loading state
      exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generant PDF...';
      exportBtn.disabled = true;

      // Create PDF with proper text content (not screenshots)
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('landscape', 'mm', 'a4'); // 3:2 aspect ratio similar
      
      // PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);

      // Process each slide
      for (let i = 0; i < this.slides.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const slide = this.slides[i];
        let yPosition = margin + 10;

        // Extract text content from slide
        const title = slide.querySelector('h1, h2');
        if (title) {
          pdf.setFontSize(24);
          pdf.setTextColor(133, 0, 204); // Purple color
          const titleText = title.textContent.trim();
          const titleLines = pdf.splitTextToSize(titleText, contentWidth);
          pdf.text(titleLines, margin, yPosition);
          yPosition += titleLines.length * 10 + 10;
        }

        // Extract cards and content
        const cards = slide.querySelectorAll('.card');
        if (cards.length > 0) {
          cards.forEach((card, cardIndex) => {
            // Card title
            const cardTitle = card.querySelector('h3');
            if (cardTitle) {
              pdf.setFontSize(14);
              pdf.setTextColor(133, 0, 204);
              pdf.text(cardTitle.textContent.trim(), margin + (cardIndex % 2) * (contentWidth / 2), yPosition);
            }

            // Card content
            const cardContent = card.querySelector('p');
            if (cardContent) {
              pdf.setFontSize(11);
              pdf.setTextColor(34, 33, 33);
              const contentText = cardContent.textContent.trim();
              const contentLines = pdf.splitTextToSize(contentText, (contentWidth / 2) - 10);
              pdf.text(contentLines, margin + (cardIndex % 2) * (contentWidth / 2), yPosition + 8);
            }

            // Card lists
            const cardList = card.querySelector('ul, ol');
            if (cardList) {
              pdf.setFontSize(10);
              pdf.setTextColor(34, 33, 33);
              const listItems = Array.from(cardList.querySelectorAll('li'));
              let listY = yPosition + 8;
              
              listItems.forEach(item => {
                const itemText = '• ' + item.textContent.trim();
                const itemLines = pdf.splitTextToSize(itemText, (contentWidth / 2) - 10);
                pdf.text(itemLines, margin + (cardIndex % 2) * (contentWidth / 2), listY);
                listY += itemLines.length * 4;
              });
            }

            if (cardIndex % 2 === 1 || cardIndex === cards.length - 1) {
              yPosition += 60; // Move to next row
            }
          });
        } else {
          // Handle non-card content
          const paragraphs = slide.querySelectorAll('p');
          paragraphs.forEach(p => {
            pdf.setFontSize(12);
            pdf.setTextColor(34, 33, 33);
            const pText = p.textContent.trim();
            if (pText) {
              const pLines = pdf.splitTextToSize(pText, contentWidth);
              pdf.text(pLines, margin, yPosition);
              yPosition += pLines.length * 6 + 5;
            }
          });

          const lists = slide.querySelectorAll('ul, ol');
          lists.forEach(list => {
            const listItems = Array.from(list.querySelectorAll('li'));
            pdf.setFontSize(11);
            pdf.setTextColor(34, 33, 33);
            
            listItems.forEach(item => {
              const itemText = '• ' + item.textContent.trim();
              const itemLines = pdf.splitTextToSize(itemText, contentWidth - 20);
              pdf.text(itemLines, margin + 10, yPosition);
              yPosition += itemLines.length * 5;
            });
            yPosition += 5;
          });
        }

        // Add footer
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`RA1 - Digitalització Aplicada - Pàgina ${i + 1}/${this.slides.length}`, 
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RAContentManager();
});