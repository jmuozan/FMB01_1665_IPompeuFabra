// PDF slideshow implementation using PDF.js
let currentSlide = 0;
let totalSlides = 63; // From header.json
let pdfDoc = null;
let scale = 2.0; // High quality scale

// Load PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function updateSlideInfo() {
  const slideInfo = document.getElementById('slide-info');
  const percentage = Math.round(((currentSlide + 1) / totalSlides) * 100);
  slideInfo.textContent = `${currentSlide + 1} / ${totalSlides} (${percentage}%)`;

  // Update button states
  document.getElementById('prev-btn').disabled = currentSlide === 0;
  document.getElementById('next-btn').disabled = currentSlide === totalSlides - 1;
}

async function loadPDF() {
  try {
    console.log('Loading PDF...');
    const loadingTask = pdfjsLib.getDocument('./RA1/RA1.pdf');
    pdfDoc = await loadingTask.promise;
    totalSlides = pdfDoc.numPages;
    console.log(`PDF loaded with ${totalSlides} pages`);

    // Update the slide info with correct total
    updateSlideInfo();

    // Load the first page
    await loadSlide(0);
  } catch (error) {
    console.error('Error loading PDF:', error);
    // Fallback to thumbnail system
    loadThumbnailFallback();
  }
}

async function loadSlide(slideIndex) {
  if (!pdfDoc || slideIndex < 0 || slideIndex >= totalSlides) return;

  try {
    const pageNum = slideIndex + 1; // PDF pages are 1-indexed
    const page = await pdfDoc.getPage(pageNum);

    // Get the canvas element
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');

    // Calculate scale to fit container while maintaining aspect ratio
    const viewport = page.getViewport({ scale: 1.0 });
    const container = document.querySelector('.slide-display');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight * 0.9; // Leave some space for controls

    const scaleX = containerWidth / viewport.width;
    const scaleY = containerHeight / viewport.height;
    const finalScale = Math.min(scaleX, scaleY) * 0.95; // 95% to leave some margin

    const scaledViewport = page.getViewport({ scale: finalScale });

    // Set canvas dimensions
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    // Render the page
    const renderContext = {
      canvasContext: ctx,
      viewport: scaledViewport
    };

    await page.render(renderContext).promise;

    currentSlide = slideIndex;
    updateSlideInfo();

    console.log(`Loaded slide ${pageNum}`);
  } catch (error) {
    console.error(`Error loading slide ${slideIndex}:`, error);
  }
}

function loadThumbnailFallback() {
  console.log('Using thumbnail fallback');
  // Hide canvas and show image fallback
  const canvas = document.getElementById('pdf-canvas');
  const img = document.getElementById('current-slide-img');

  canvas.style.display = 'none';
  img.style.display = 'block';
  img.src = './RA1/assets/754EBD94-49F3-4028-B98E-FFAD0C99AD36/thumbnail.jpeg';
}

function changeSlide(direction) {
  const newSlide = currentSlide + direction;
  if (newSlide >= 0 && newSlide < totalSlides) {
    loadSlide(newSlide);
  }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      changeSlide(-1);
      break;
    case 'ArrowRight':
      changeSlide(1);
      break;
  }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('PDF slideshow loading...');
  loadPDF();
});

// Handle window resize
window.addEventListener('resize', () => {
  if (pdfDoc) {
    loadSlide(currentSlide);
  }
});