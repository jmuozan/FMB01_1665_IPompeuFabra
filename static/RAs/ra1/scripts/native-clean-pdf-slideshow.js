// Native PDF slideshow with clean design using iframes and PDF.js viewer
let currentSlide = 0;
let totalSlides = 63;
const isMobile = window.innerWidth <= 1023;
let debugMessages = [];

// Debug logging function
function debugLog(message) {
  debugMessages.push(message);
  console.log(message);
  // Debug div disabled - logs only go to console
}

// Configure PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  debugLog('PDF.js loaded successfully');
} else {
  debugLog('ERROR: PDF.js not loaded!');
}

function updateSlideInfo() {
  const slideInfo = document.getElementById('slide-info');
  const percentage = Math.round(((currentSlide + 1) / totalSlides) * 100);
  slideInfo.textContent = `${currentSlide + 1} / ${totalSlides} (${percentage}%)`;

  // Update button states
  document.getElementById('prev-btn').disabled = currentSlide === 0;
  document.getElementById('next-btn').disabled = currentSlide === totalSlides - 1;
}

async function renderPDFToCanvas(pdfPath) {
  const canvas = document.getElementById('pdf-canvas');
  const iframe = document.getElementById('pdf-iframe');
  const container = document.querySelector('.pdf-container');

  try {
    debugLog('Starting PDF render: ' + pdfPath);

    // Wait for container to have dimensions
    let attempts = 0;
    while (container.clientWidth === 0 && attempts < 10) {
      debugLog('Waiting for container... attempt ' + attempts);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    debugLog('Container: ' + container.clientWidth + 'x' + container.clientHeight);

    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    debugLog('PDF loaded, pages: ' + pdf.numPages);

    const page = await pdf.getPage(1);
    debugLog('Page 1 loaded');

    // Use window width if container width is still 0
    let containerWidth = container.clientWidth || window.innerWidth - 20;
    let containerHeight = container.clientHeight || window.innerHeight * 0.6;

    debugLog('Using dimensions: ' + containerWidth + 'x' + containerHeight);

    const viewport = page.getViewport({ scale: 1.0 });
    debugLog('Viewport: ' + viewport.width + 'x' + viewport.height);

    const scale = Math.min(
      containerWidth / viewport.width,
      containerHeight / viewport.height
    ) * 0.95;

    debugLog('Scale: ' + scale.toFixed(2));

    const scaledViewport = page.getViewport({ scale: scale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    debugLog('Canvas: ' + canvas.width + 'x' + canvas.height);

    const context = canvas.getContext('2d');

    // Fill with white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    };

    await page.render(renderContext).promise;

    // Show canvas, hide iframe
    canvas.style.display = 'block';
    iframe.style.display = 'none';

    debugLog('✓ PDF rendered successfully!');
  } catch (error) {
    debugLog('ERROR: ' + error.message);
    // Fallback to iframe with minimal parameters
    canvas.style.display = 'none';
    iframe.style.display = 'block';
    const simplePdfUrl = `${pdfPath}`;
    iframe.src = simplePdfUrl;
    debugLog('Fallback to iframe: ' + simplePdfUrl);
  }
}

function loadSlide(slideIndex) {
  if (slideIndex < 0 || slideIndex >= totalSlides) return;

  // Format slide number with leading zeros
  const slideNumber = String(slideIndex + 1).padStart(3, '0');
  const pdfPath = `./slides/slide_${slideNumber}.pdf`;

  // Update current slide
  currentSlide = slideIndex;
  updateSlideInfo();

  debugLog('--- Loading slide ' + (slideIndex + 1) + ' ---');
  debugLog('Path: ' + pdfPath);
  debugLog('Mobile: ' + isMobile);
  debugLog('Window width: ' + window.innerWidth);

  if (isMobile && typeof pdfjsLib !== 'undefined') {
    // Use canvas rendering for mobile
    debugLog('Using canvas rendering');
    renderPDFToCanvas(pdfPath);
  } else {
    // Use iframe for desktop
    showLoading();
    const pdfUrl = `${pdfPath}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=Fit&zoom=page-fit&pagemode=none&page=1&nameddest=&rotation=0`;
    const pdfIframe = document.getElementById('pdf-iframe');
    const canvas = document.getElementById('pdf-canvas');

    debugLog('Using iframe method');
    canvas.style.display = 'none';
    pdfIframe.style.display = 'block';
    pdfIframe.src = pdfUrl;
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
  console.log('Native clean PDF slideshow loading...');
  updateSlideInfo();

  // Add event listener for iframe load
  const pdfIframe = document.getElementById('pdf-iframe');

  pdfIframe.addEventListener('load', () => {
    hideLoading();
    console.log('PDF iframe loaded successfully');

    // Try to modify PDF viewer layout after load
    setTimeout(() => {
      try {
        const iframeDoc = pdfIframe.contentDocument || pdfIframe.contentWindow.document;
        const toolbar = iframeDoc.querySelector('#toolbar');
        const secondaryToolbar = iframeDoc.querySelector('#secondaryToolbar');
        const sidebarContainer = iframeDoc.querySelector('#sidebarContainer');
        const viewerContainer = iframeDoc.querySelector('#viewerContainer');

        if (toolbar) toolbar.style.display = 'none';
        if (secondaryToolbar) secondaryToolbar.style.display = 'none';
        if (sidebarContainer) sidebarContainer.style.display = 'none';

        // Force horizontal layout for viewerContainer
        if (viewerContainer) {
          viewerContainer.style.writingMode = 'horizontal-tb';
          viewerContainer.style.direction = 'ltr';
          viewerContainer.style.overflowX = 'auto';
          viewerContainer.style.overflowY = 'hidden';
          viewerContainer.style.whiteSpace = 'nowrap';
          console.log('Applied horizontal layout to viewerContainer');
        }
      } catch (e) {
        // Cross-origin restrictions, URL parameters should handle it
        console.log('Using URL parameters for layout control:', e.message);
      }
    }, 1000);
  });

  // Load first slide
  loadSlide(0);
});