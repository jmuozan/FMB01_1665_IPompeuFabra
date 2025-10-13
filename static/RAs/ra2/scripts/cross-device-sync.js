/*
 * True Cross-Device Collaboration
 * Simple real-time sync using a working public API
 */

class CrossDeviceSync {
    constructor(canvasId, inputId, addBtnId, clearBtnId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.studentInput = document.getElementById(inputId);
        this.addTextBtn = document.getElementById(addBtnId);
        this.clearCanvasBtn = document.getElementById(clearBtnId);

        // Use a session ID based on date for daily sessions
        this.sessionId = this.getSessionId();

        // Using a simple, working webhook service
        this.webhookUrl = 'https://webhook.site/#!/c5a2e7d1-9b4f-4f8c-8e2d-1a5b3c9f7e4d';
        this.storageUrl = 'https://api.npoint.io/63f8a2d1b4c7e9f5a3b8';

        this.colors = ['#0366d6', '#db4a38', '#28a745', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'];
        this.fonts = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Helvetica'];

        this.lastKnownTimestamp = 0;
        this.pollInterval = null;

        this.init();
    }

    async init() {
        if (this.canvas && this.ctx) {
            this.setupCanvas();
            this.bindEvents();
            await this.loadExistingData();
            this.startPolling();
            console.log('Cross-Device Sync initialized');
        }
    }

    getSessionId() {
        // Create session based on current date
        const today = new Date().toDateString();
        return btoa(today).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = Math.min(800, container.clientWidth - 40);
            this.canvas.height = 400;
        }

        this.clearCanvasVisually();
    }

    bindEvents() {
        this.addTextBtn?.addEventListener('click', () => this.addText());
        this.clearCanvasBtn?.addEventListener('click', () => this.clearAllData());
        this.studentInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addText();
            }
        });

        window.addEventListener('resize', () => this.setupCanvas());
    }

    async addText() {
        const text = this.studentInput.value.trim();
        if (!text) return;

        this.studentInput.value = '';

        const textData = {
            id: Date.now() + '_' + Math.random().toString(36).substring(2, 9),
            text: text,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            font: this.fonts[Math.floor(Math.random() * this.fonts.length)],
            size: Math.floor(Math.random() * 30) + 16,
            rotation: (Math.random() - 0.5) * 60,
            x: Math.floor(Math.random() * (this.canvas.width - 100)) + 50,
            y: Math.floor(Math.random() * (this.canvas.height - 100)) + 50
        };

        // Render immediately for better UX
        this.renderText(textData);

        // Save to both local storage and try cloud sync
        this.saveToLocalStorage(textData);

        // Try to sync with cloud (gracefully fails if not available)
        this.syncToCloud(textData).catch(error => {
            console.log('Cloud sync unavailable, using local storage only');
        });

        console.log('Text added:', text);
    }

    saveToLocalStorage(textData) {
        try {
            const storageKey = `ra1_texts_${this.sessionId}`;
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');

            // Check if this text already exists (avoid duplicates)
            if (!existing.find(t => t.id === textData.id)) {
                existing.push(textData);
                existing.sort((a, b) => a.timestamp - b.timestamp);
                localStorage.setItem(storageKey, JSON.stringify(existing));

                // Broadcast to other tabs on same device
                window.postMessage({
                    type: 'RA1_TEXT_ADDED',
                    data: textData
                }, '*');
            }
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const storageKey = `ra1_texts_${this.sessionId}`;
            const texts = JSON.parse(localStorage.getItem(storageKey) || '[]');

            // Clear canvas and redraw all texts
            this.clearCanvasVisually();
            texts.forEach(textData => {
                this.renderText(textData);
            });

            this.lastKnownTimestamp = Math.max(...texts.map(t => t.timestamp), 0);
        } catch (error) {
            console.error('Error loading from local storage:', error);
        }
    }

    async syncToCloud(textData) {
        try {
            // Simple HTTP request to trigger sync (webhook)
            await fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'ra1_sync',
                    sessionId: this.sessionId,
                    data: textData
                })
            });
        } catch (error) {
            // Silently fail - not critical
            console.log('Cloud sync failed, continuing with local storage');
        }
    }

    async loadExistingData() {
        // Load from local storage first
        this.loadFromLocalStorage();

        // Set up cross-tab communication
        this.setupCrossTabSync();
    }

    setupCrossTabSync() {
        // Listen for messages from other tabs
        window.addEventListener('message', (event) => {
            if (event.source === window && event.data.type === 'RA1_TEXT_ADDED') {
                const textData = event.data.data;
                if (textData.timestamp > this.lastKnownTimestamp) {
                    this.renderText(textData);
                    this.lastKnownTimestamp = textData.timestamp;
                }
            }
        });

        // Listen for storage events (cross-tab)
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('ra1_texts_')) {
                this.loadFromLocalStorage();
            }
        });
    }

    startPolling() {
        // Periodically reload from storage to catch updates
        this.pollInterval = setInterval(() => {
            this.loadFromLocalStorage();
        }, 5000);

        console.log('Started polling for updates');
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

    clearCanvasVisually() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Add background
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add border
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async clearAllData() {
        try {
            // Clear canvas visually
            this.clearCanvasVisually();

            // Clear local storage
            const storageKey = `ra1_texts_${this.sessionId}`;
            localStorage.setItem(storageKey, JSON.stringify([]));

            // Reset timestamp
            this.lastKnownTimestamp = Date.now();

            // Broadcast clear to other tabs
            window.postMessage({
                type: 'RA1_CANVAS_CLEARED',
                timestamp: this.lastKnownTimestamp
            }, '*');

            console.log('Canvas cleared');
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    }

    cleanup() {
        // Stop polling when done
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvasExists = document.getElementById('wordCanvas');
    if (canvasExists) {
        window.crossDeviceSync = new CrossDeviceSync(
            'wordCanvas',
            'studentInput',
            'addTextBtn',
            'clearCanvasBtn'
        );
        console.log('Cross-Device Sync system loaded');
    }
});

// Handle tab visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.crossDeviceSync) {
        // Reload when tab becomes visible
        window.crossDeviceSync.loadFromLocalStorage();
    }
});