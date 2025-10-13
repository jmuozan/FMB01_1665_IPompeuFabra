class KeynoteSlideshow {
  constructor(containerSelector, slidesData) {
    console.log('Initializing KeynoteSlideshow...');
    this.container = document.querySelector(containerSelector);
    this.slidesData = slidesData;
    this.currentSlide = 0;
    this.totalSlides = slidesData.slideList.length;
    console.log(`Found ${this.totalSlides} slides`);
    this.init();
  }

  init() {
    this.createHTML();
    this.loadSlide(0);
    this.setupEventListeners();
  }

  createHTML() {
    this.container.innerHTML = `
      <div class="keynote-player">
        <div class="keynote-slide-container">
          <img id="keynote-current-slide" src="" alt="Slide" />
        </div>
        <div class="keynote-controls">
          <button id="keynote-prev" class="keynote-btn">&#8249;</button>
          <span id="keynote-counter">${this.currentSlide + 1} / ${this.totalSlides}</span>
          <span id="keynote-percentage">(0%)</span>
          <button id="keynote-next" class="keynote-btn">&#8250;</button>
        </div>
      </div>
    `;

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .keynote-player {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        overflow: hidden;
      }

      .keynote-slide-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: transparent;
      }

      #keynote-current-slide {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 8px;
      }

      .keynote-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        padding: 15px;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 10px;
        margin-top: 10px;
      }

      .keynote-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 20px;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .keynote-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .keynote-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      #keynote-counter {
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        min-width: 60px;
        text-align: center;
      }

      #keynote-percentage {
        color: rgba(255, 255, 255, 0.8);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        margin-left: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  loadSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;

    const slideId = this.slidesData.slideList[index];
    const slideImg = document.getElementById('keynote-current-slide');

    // Try to load PNG first, fallback to PDF thumbnail if needed
    const pngPath = `./RA1_key/assets/${slideId}/assets/${slideId}-0.png`;
    const thumbnailPath = `./RA1_key/assets/${slideId}/thumbnail.jpeg`;

    slideImg.onload = () => {
      this.updateControls();
    };

    slideImg.onerror = () => {
      // Fallback to thumbnail if PNG doesn't exist
      slideImg.src = thumbnailPath;
      slideImg.onerror = () => {
        console.warn(`Could not load slide ${index + 1}`);
      };
    };

    slideImg.src = pngPath;
    this.currentSlide = index;
  }

  updateControls() {
    document.getElementById('keynote-counter').textContent =
      `${this.currentSlide + 1} / ${this.totalSlides}`;

    const percentage = Math.round(((this.currentSlide + 1) / this.totalSlides) * 100);
    document.getElementById('keynote-percentage').textContent = `(${percentage}%)`;

    document.getElementById('keynote-prev').disabled = this.currentSlide === 0;
    document.getElementById('keynote-next').disabled = this.currentSlide === this.totalSlides - 1;
  }

  setupEventListeners() {
    document.getElementById('keynote-prev').addEventListener('click', () => {
      if (this.currentSlide > 0) {
        this.loadSlide(this.currentSlide - 1);
      }
    });

    document.getElementById('keynote-next').addEventListener('click', () => {
      if (this.currentSlide < this.totalSlides - 1) {
        this.loadSlide(this.currentSlide + 1);
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && this.currentSlide > 0) {
        this.loadSlide(this.currentSlide - 1);
      } else if (e.key === 'ArrowRight' && this.currentSlide < this.totalSlides - 1) {
        this.loadSlide(this.currentSlide + 1);
      }
    });
  }
}

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing slideshow...');

  const container = document.querySelector('.slideshow-container');
  if (!container) {
    console.error('Slideshow container not found');
    return;
  }

  try {
    console.log('Fetching header.json...');
    const response = await fetch('./RA1_key/assets/header.json');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const slidesData = await response.json();
    console.log('Slides data loaded:', slidesData);

    new KeynoteSlideshow('.slideshow-container', slidesData);
  } catch (error) {
    console.error('Error loading slideshow:', error);
    document.querySelector('.slideshow-container').innerHTML =
      '<div style="color: #333; text-align: center; padding: 50px; background: #f5f5f5; border-radius: 10px;">Error loading slideshow: ' + error.message + '</div>';
  }
});