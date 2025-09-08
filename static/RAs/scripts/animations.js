/**
 * Animation utilities for interactive elements
 */
export class AnimationUtils {
  static observeElements() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe all animatable elements
    const elements = document.querySelectorAll('.concept-item, .department-card, .benefit-item, .comparison-side');
    elements.forEach((el, index) => {
      // Initial state
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `all 0.6s ease ${index * 0.1}s`;
      
      observer.observe(el);
    });
  }

  static addHoverEffects() {
    // Add enhanced hover effects
    const cards = document.querySelectorAll('.concept-item, .department-card, .benefit-item');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  static createKeyboardHints() {
    // Add keyboard hints
    const keyboardHints = document.createElement('div');
    keyboardHints.className = 'keyboard-hints';
    keyboardHints.innerHTML = `
      <div class="hint-item">↑↓ Mode presentació</div>
      <div class="hint-item">ESC Sortir</div>
      <div class="hint-item">→← Navegar</div>
    `;
    
    // Style the hints
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-hints {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        padding: 10px;
        border-radius: 10px;
        font-size: 0.8rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 998;
        transition: all 0.3s ease;
        opacity: 0.7;
      }
      
      .keyboard-hints:hover {
        opacity: 1;
      }
      
      .hint-item {
        margin: 2px 0;
        color: #222121;
      }
      
      @media screen and (max-width: 768px) {
        .keyboard-hints {
          display: none;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(keyboardHints);
  }
}