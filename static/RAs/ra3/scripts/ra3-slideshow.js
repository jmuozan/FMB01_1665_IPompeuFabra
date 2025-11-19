let currentSlide = 0;
let totalSlides = 44;

function updateSlideInfo() {
  const slideInfo = document.getElementById('slide-info');
  const percentage = Math.round(((currentSlide + 1) / totalSlides) * 100);
  slideInfo.textContent = `${currentSlide + 1} / ${totalSlides} (${percentage}%)`;

  // Update button states
  document.getElementById('prev-btn').disabled = currentSlide === 0;
  document.getElementById('next-btn').disabled = currentSlide === totalSlides - 1;
}

function loadSlide(slideIndex) {
  if (slideIndex < 0 || slideIndex >= totalSlides) return;

  // Format slide number with leading zeros
  const slideNumber = String(slideIndex + 1).padStart(3, '0');
  const pdfPath = `./slides/slide_${slideNumber}.pdf`;

  // PDF embedding with parameters to forceorientation
  const pdfUrl = `${pdfPath}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&zoom=page-width&pagemode=none&page=1&nameddest=&rotation=0`;

  // iframe
  const pdfIframe = document.getElementById('pdf-iframe');

  // loading
  showLoading();
  pdfIframe.src = pdfUrl;

  currentSlide = slideIndex;
  updateSlideInfo();

  console.log(`Loading slide ${slideIndex + 1}: ${pdfPath}`);
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

// Keyboard keys usage
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

// wait until DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Native clean PDF slideshow loading...');
  updateSlideInfo();

  // Event listener
  const pdfIframe = document.getElementById('pdf-iframe');

  pdfIframe.addEventListener('load', () => {
    hideLoading();
    console.log('PDF iframe loaded successfully');

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

        // Force horizontal layout for slideshow
        if (viewerContainer) {
          viewerContainer.style.writingMode = 'horizontal-tb';
          viewerContainer.style.direction = 'ltr';
          viewerContainer.style.overflowX = 'auto';
          viewerContainer.style.overflowY = 'hidden';
          viewerContainer.style.whiteSpace = 'nowrap';
          console.log('Applied horizontal layout to viewerContainer');
        }
      } catch (e) {
        console.log('Using URL parameters for layout control:', e.message);
      }
    }, 1000);
  });

  // first slide :)))
  loadSlide(0);
});
