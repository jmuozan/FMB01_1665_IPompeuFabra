/**
 * Main entry point for RA1 interactive content
 */
import { SlideshowManager } from './slideshow.js';
import { PDFExporter } from './pdf-export.js';
import { AnimationUtils } from './animations.js';

class InteractiveContent {
  constructor() {
    this.slideshowManager = new SlideshowManager();
    this.pdfExporter = new PDFExporter(this.slideshowManager);
  }

  init() {
    // Initialize slideshow functionality
    this.slideshowManager.init();
    
    // Initialize PDF export
    this.pdfExporter.init();
    
    // Initialize animations
    AnimationUtils.observeElements();
    AnimationUtils.addHoverEffects();
    AnimationUtils.createKeyboardHints();
    
    // Add loading state management
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new InteractiveContent();
  app.init();
});