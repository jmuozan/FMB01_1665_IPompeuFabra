// Native PDF slideshow implementation using individual PDF files
let currentSlide = 0;
let totalSlides = 63; // Total number of slides

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

  // Format slide number with leading zeros (001, 002, etc.)
  const slideNumber = String(slideIndex + 1).padStart(3, '0');
  const pdfPath = `./slides/slide_${slideNumber}.pdf`;

  // Get the PDF embed element
  const pdfEmbed = document.getElementById('pdf-embed');

  // Update the PDF source
  pdfEmbed.src = pdfPath;

  // Update current slide
  currentSlide = slideIndex;
  updateSlideInfo();

  console.log(`Loading slide ${slideIndex + 1}: ${pdfPath}`);
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
  console.log('Native PDF slideshow loading...');
  updateSlideInfo();
  loadSlide(0); // Load first slide
});

// Add loading feedback
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

// Handle PDF load events
document.addEventListener('DOMContentLoaded', () => {
  const pdfEmbed = document.getElementById('pdf-embed');

  pdfEmbed.addEventListener('load', () => {
    hideLoading();
    console.log('PDF loaded successfully');
  });

  pdfEmbed.addEventListener('error', () => {
    console.error('Failed to load PDF');
    hideLoading();
  });
});