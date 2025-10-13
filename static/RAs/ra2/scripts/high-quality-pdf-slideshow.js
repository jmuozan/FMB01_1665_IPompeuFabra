// High-quality PDF slideshow using individual PDFs with PDF.js for clean rendering
let currentSlide = 0;
let totalSlides = 63;
let pdfDoc = null;
let scale = 3.0; // Very high quality scale

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

async function loadSlide(slideIndex) {
  if (slideIndex < 0 || slideIndex >= totalSlides) return;

  try {
    // Format slide number with leading zeros
    const slideNumber = String(slideIndex + 1).padStart(3, '0');
    const pdfPath = `./slides/slide_${slideNumber}.pdf`;

    console.log(`Loading slide ${slideIndex + 1}: ${pdfPath}`);

    // Load the individual PDF
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    pdfDoc = await loadingTask.promise;

    // Get the first (and only) page
    const page = await pdfDoc.getPage(1);

    // Get the canvas element
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');

    // Calculate scale to fit container while maintaining aspect ratio
    const viewport = page.getViewport({ scale: 1.0 });
    const container = document.querySelector('.slide-display');
    const containerWidth = container.clientWidth - 40; // Account for padding
    const containerHeight = container.clientHeight - 80; // Account for controls

    const scaleX = containerWidth / viewport.width;
    const scaleY = containerHeight / viewport.height;
    const finalScale = Math.min(scaleX, scaleY, 4.0); // Max scale of 4.0 for very high quality

    const scaledViewport = page.getViewport({ scale: finalScale });

    // Set canvas dimensions
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    // High quality rendering options
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Render the page
    const renderContext = {
      canvasContext: ctx,
      viewport: scaledViewport,
      intent: 'display',
      renderInteractiveForms: true
    };

    await page.render(renderContext).promise;

    currentSlide = slideIndex;
    updateSlideInfo();

    // Hide loading indicator
    hideLoading();

    console.log(`Successfully loaded slide ${slideIndex + 1}`);
  } catch (error) {
    console.error(`Error loading slide ${slideIndex + 1}:`, error);
    hideLoading();
  }
}

function showLoading() {
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) {
    loadingDiv.style.display = 'block';
  }
}

function hideLoading() {
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }
}

function changeSlide(direction) {
  const newSlide = currentSlide + direction;
  if (newSlide >= 0 && newSlide < totalSlides) {
    showLoading();
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
  console.log('High-quality PDF slideshow loading...');
  updateSlideInfo();
  showLoading();
  loadSlide(0); // Load first slide
});

// Handle window resize
window.addEventListener('resize', () => {
  if (currentSlide >= 0) {
    loadSlide(currentSlide);
  }
});