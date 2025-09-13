/*
 * True Cross-Device Collaboration
 * Uses Firebase Realtime Database (free tier) for actual cross-device sync
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
        
        // Simple cloud storage endpoint (using a free service)
        this.cloudEndpoint = `https://api.jsonbin.io/v3/b/66e4a8b5e41b4d34e4251c8a`;
        this.apiKey = '$2a$10$tOvKDGrlgr.7YydpCGGZceCDSCRIqQJJHN5KWZPb0WN5zOLy0gDDC';
        
        this.colors = ['#0366d6', '#db4a38', '#28a745', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'];
        this.fonts = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Helvetica'];
        
        this.lastKnownTimestamp = 0;
        this.pollInterval = null;
        
        this.init();
    }
    
    init() {
        if (this.canvas && this.ctx) {
            this.setupCanvas();
            this.bindEvents();
            this.loadExistingData();
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
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            font: this.fonts[Math.floor(Math.random() * this.fonts.length)],
            size: Math.floor(Math.random() * 30) + 16,
            rotation: (Math.random() - 0.5) * 60,
            x: Math.floor(Math.random() * (this.canvas.width - 100)) + 50,
            y: Math.floor(Math.random() * (this.canvas.height - 100)) + 50
        };
        
        // Render immediately for better UX
        this.renderText(textData);
        
        // Save to cloud
        await this.saveToCloud(textData);
        
        console.log('Text added to cloud:', text);
    }
    
    async saveToCloud(textData) {
        try {
            // Get current data
            const currentData = await this.getCloudData();
            currentData.texts.push(textData);
            currentData.lastUpdate = Date.now();
            
            // Save back to cloud
            const response = await fetch(this.cloudEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(currentData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save to cloud');
            }
            
            console.log('Successfully saved to cloud');
        } catch (error) {
            console.error('Error saving to cloud:', error);
        }
    }
    
    async getCloudData() {
        try {
            const response = await fetch(this.cloudEndpoint + '/latest', {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.record || { texts: [], lastUpdate: 0, lastClear: 0 };
            }
        } catch (error) {
            console.error('Error getting cloud data:', error);
        }
        
        return { texts: [], lastUpdate: 0, lastClear: 0 };
    }
    
    async loadExistingData() {
        try {
            const data = await this.getCloudData();
            
            // Check if canvas was cleared
            if (data.lastClear > this.lastKnownTimestamp) {
                this.clearCanvasVisually();
            }
            
            // Load all texts newer than our last known timestamp
            const newTexts = data.texts.filter(textData => 
                textData.timestamp > this.lastKnownTimestamp
            );
            
            newTexts.forEach(textData => {
                this.renderText(textData);
            });
            
            this.lastKnownTimestamp = data.lastUpdate || 0;
            
            if (newTexts.length > 0) {
                console.log(`Loaded ${newTexts.length} new texts from cloud`);
            }
        } catch (error) {
            console.error('Error loading existing data:', error);
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
            
            // Clear cloud data
            const clearData = {
                texts: [],
                lastUpdate: Date.now(),
                lastClear: Date.now()
            };
            
            const response = await fetch(this.cloudEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(clearData)
            });
            
            if (response.ok) {
                this.lastKnownTimestamp = clearData.lastUpdate;
                console.log('Canvas cleared on all devices');
            }
        } catch (error) {
            console.error('Error clearing cloud data:', error);
        }
    }
    
    startPolling() {
        // Poll cloud every 2 seconds for updates
        this.pollInterval = setInterval(async () => {
            await this.loadExistingData();
        }, 2000);
        
        console.log('Started polling for cross-device updates');
    }
    
    stopPolling() {
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