/* ==========================================================================
   CANVAS COLLABORATION SYSTEM
   Local storage-based real-time collaboration for word canvas
   ========================================================================== */

class CanvasCollaboration {
    constructor(canvasId, inputId, addBtnId, clearBtnId, qrCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.studentInput = document.getElementById(inputId);
        this.addTextBtn = document.getElementById(addBtnId);
        this.clearCanvasBtn = document.getElementById(clearBtnId);
        this.qrCanvas = document.getElementById(qrCanvasId);
        
        this.sessionKey = 'canvas_session_' + this.getSessionId();
        this.lastUpdateTime = 0;
        this.pollInterval = null;
        
        this.colors = ['#0366d6', '#db4a38', '#28a745', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'];
        this.fonts = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Helvetica'];
        
        this.init();
    }
    
    init() {
        if (!this.canvas || !this.ctx) return;
        
        this.setupCanvas();
        this.bindEvents();
        this.generateQRCode();
        this.startPolling();
        
        console.log('Canvas Collaboration initialized');
    }
    
    getSessionId() {
        // Create a session ID based on current date (same day = same session)
        const today = new Date().toDateString();
        return btoa(today).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    }
    
    setupCanvas() {
        // Set canvas size
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = Math.min(800, container.clientWidth - 40);
            this.canvas.height = 400;
        }
        
        this.clearCanvas();
        this.loadExistingTexts();
    }
    
    bindEvents() {
        this.addTextBtn?.addEventListener('click', () => this.addText());
        this.clearCanvasBtn?.addEventListener('click', () => this.clearCanvas(true));
        this.studentInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addText();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    addText() {
        const text = this.studentInput.value.trim();
        if (!text) return;
        
        // Clear input
        this.studentInput.value = '';
        
        // Create text data
        const textData = {
            id: Date.now() + '_' + Math.random().toString(36).substring(2, 9),
            text: text,
            timestamp: Date.now(),
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            font: this.fonts[Math.floor(Math.random() * this.fonts.length)],
            size: Math.floor(Math.random() * 30) + 16,
            rotation: (Math.random() - 0.5) * 60,
            x: Math.floor(Math.random() * (this.canvas.width - 100)) + 50,
            y: Math.floor(Math.random() * (this.canvas.height - 100)) + 50
        };
        
        // Save to localStorage
        this.saveTextData(textData);
        
        // Render immediately
        this.renderText(textData);
    }
    
    saveTextData(textData) {
        try {
            const existingData = JSON.parse(localStorage.getItem(this.sessionKey) || '{"texts": [], "lastClear": 0}');
            existingData.texts.push(textData);
            existingData.lastUpdate = Date.now();
            localStorage.setItem(this.sessionKey, JSON.stringify(existingData));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    loadExistingTexts() {
        try {
            const data = JSON.parse(localStorage.getItem(this.sessionKey) || '{"texts": [], "lastClear": 0}');
            
            // Check if canvas was cleared after our last update
            if (data.lastClear > this.lastUpdateTime) {
                this.clearCanvas(false);
            }
            
            // Render all texts that are newer than our last update
            data.texts.forEach(textData => {
                if (textData.timestamp > this.lastUpdateTime) {
                    this.renderText(textData);
                }
            });
            
            this.lastUpdateTime = data.lastUpdate || 0;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    renderText(textData) {
        if (!this.ctx) return;
        
        const { text, color, font, size, rotation, x, y } = textData;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation * Math.PI / 180);
        this.ctx.font = `${size}px ${font}`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add text shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
    }
    
    clearCanvas(syncToStorage = false) {
        if (!this.ctx) return;
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add background
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add border
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (syncToStorage) {
            // Clear localStorage and notify other instances
            const clearData = {
                texts: [],
                lastClear: Date.now(),
                lastUpdate: Date.now()
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(clearData));
            this.lastUpdateTime = clearData.lastUpdate;
        }
    }
    
    startPolling() {
        // Poll localStorage every 2 seconds for new content
        this.pollInterval = setInterval(() => {
            this.loadExistingTexts();
        }, 2000);
    }
    
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
    
    generateQRCode() {
        if (!this.qrCanvas || typeof QRCode === 'undefined') return;
        
        const currentUrl = window.location.href;
        
        QRCode.toCanvas(this.qrCanvas, currentUrl, {
            width: 120,
            height: 120,
            colorDark: '#0366d6',
            colorLight: '#ffffff',
            margin: 1
        }, (error) => {
            if (error) {
                console.error('QR Code generation failed:', error);
            } else {
                console.log('QR Code generated successfully');
            }
        });
    }
    
    // Cleanup method
    destroy() {
        this.stopPolling();
        
        // Remove event listeners
        this.addTextBtn?.removeEventListener('click', this.addText);
        this.clearCanvasBtn?.removeEventListener('click', this.clearCanvas);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas collaboration if elements exist
    const canvasExists = document.getElementById('wordCanvas');
    if (canvasExists) {
        window.canvasCollaboration = new CanvasCollaboration(
            'wordCanvas',
            'studentInput', 
            'addTextBtn',
            'clearCanvasBtn',
            'qrCanvas'
        );
    }
});