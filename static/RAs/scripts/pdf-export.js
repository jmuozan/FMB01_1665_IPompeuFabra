/**
 * PDF Export functionality for content slides
 */
export class PDFExporter {
  constructor(slideshowManager) {
    this.slideshowManager = slideshowManager;
  }

  init() {
    this.setupPDFExport();
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

      // Get jsPDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
      
      // PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Temporarily enter slide mode for consistent rendering
      const wasInSlideMode = this.slideshowManager.isSlideMode;
      if (!wasInSlideMode) {
        this.slideshowManager.enterSlideMode();
      }

      // Process each slide
      for (let i = 0; i < this.slideshowManager.blocks.length; i++) {
        // Navigate to slide
        this.slideshowManager.currentSlide = i;
        this.slideshowManager.updateSlideView();
        
        // Wait for transitions
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Get the current active slide
        const activeSlide = document.querySelector('.content-block.active');
        
        if (activeSlide) {
          try {
            // Capture the slide
            const canvas = await html2canvas(activeSlide, {
              useCORS: true,
              allowTaint: true,
              scale: 2,
              width: activeSlide.offsetWidth,
              height: activeSlide.offsetHeight,
              backgroundColor: '#f7f7f7'
            });
            
            // Calculate dimensions to fit PDF page
            const canvasAspectRatio = canvas.width / canvas.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;
            
            let imgWidth, imgHeight, imgX, imgY;
            
            if (canvasAspectRatio > pdfAspectRatio) {
              // Canvas is wider, fit to width
              imgWidth = pdfWidth - 20; // 10mm margin on each side
              imgHeight = imgWidth / canvasAspectRatio;
              imgX = 10;
              imgY = (pdfHeight - imgHeight) / 2;
            } else {
              // Canvas is taller, fit to height
              imgHeight = pdfHeight - 20; // 10mm margin on top and bottom
              imgWidth = imgHeight * canvasAspectRatio;
              imgX = (pdfWidth - imgWidth) / 2;
              imgY = 10;
            }
            
            // Add image to PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);
            
            // Add next page if not last slide
            if (i < this.slideshowManager.blocks.length - 1) {
              pdf.addPage();
            }
            
          } catch (error) {
            console.error(`Error capturing slide ${i + 1}:`, error);
          }
        }
      }

      // Restore original mode
      if (!wasInSlideMode) {
        this.slideshowManager.exitSlideMode();
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