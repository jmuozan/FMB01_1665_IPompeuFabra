let currentSlide = 0;
let totalSlides = 126;
const isMobile = window.innerWidth <= 1023;

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

function updateSlideInfo() {
  const slideInfo = document.getElementById('slide-info');
  const percentage = Math.round(((currentSlide + 1) / totalSlides) * 100);
  slideInfo.textContent = `${currentSlide + 1} / ${totalSlides} (${percentage}%)`;
  document.getElementById('prev-btn').disabled = currentSlide === 0;
  document.getElementById('next-btn').disabled = currentSlide === totalSlides - 1;
}

async function renderPDFToCanvas(pdfPath) {
  const canvas = document.getElementById('pdf-canvas');
  const iframe = document.getElementById('pdf-iframe');
  const container = document.querySelector('.pdf-container');

  iframe.style.display = 'none';

  try {
    let attempts = 0;
    while (container.clientWidth === 0 && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    const containerWidth = container.clientWidth || window.innerWidth - 40;
    const containerHeight = container.clientHeight || window.innerHeight * 0.5;

    const pdf = await pdfjsLib.getDocument(pdfPath).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });
    const pixelRatio = window.devicePixelRatio || 1;

    const baseScale = Math.min(
      containerWidth / viewport.width,
      containerHeight / viewport.height
    ) * 0.9;

    const scaledViewport = page.getViewport({ scale: baseScale * pixelRatio });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    canvas.style.width = (scaledViewport.width / pixelRatio) + 'px';
    canvas.style.height = (scaledViewport.height / pixelRatio) + 'px';

    const context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
    canvas.style.display = 'block';
  } catch (error) {
    canvas.style.display = 'none';
    iframe.style.display = 'block';
    iframe.src = pdfPath;
  }
}

function loadSlide(slideIndex) {
  if (slideIndex < 0 || slideIndex >= totalSlides) return;

  const slideNumber = String(slideIndex + 1).padStart(3, '0');
  const pdfPath = `./slides/slide_${slideNumber}.pdf`;

  currentSlide = slideIndex;
  updateSlideInfo();

  if (isMobile && typeof pdfjsLib !== 'undefined') {
    renderPDFToCanvas(pdfPath);
  } else {
    showLoading();
    const pdfUrl = `${pdfPath}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=Fit&zoom=page-fit&pagemode=none&page=1`;
    const pdfIframe = document.getElementById('pdf-iframe');
    const canvas = document.getElementById('pdf-canvas');

    canvas.style.display = 'none';
    pdfIframe.style.display = 'block';
    pdfIframe.src = pdfUrl;
  }
}

function showLoading() {
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) loadingDiv.style.display = 'block';
}

function hideLoading() {
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) loadingDiv.style.display = 'none';
}

function changeSlide(direction) {
  const newSlide = currentSlide + direction;
  if (newSlide >= 0 && newSlide < totalSlides) {
    loadSlide(newSlide);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') changeSlide(-1);
  if (e.key === 'ArrowRight') changeSlide(1);
});

document.addEventListener('DOMContentLoaded', () => {
  updateSlideInfo();
  document.getElementById('pdf-iframe').addEventListener('load', hideLoading);
  loadSlide(0);
});
