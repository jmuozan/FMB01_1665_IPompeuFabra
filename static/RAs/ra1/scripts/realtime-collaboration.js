/*
 * Real-time Cross-Device Collaboration
 * Uses Firebase Realtime Database for cross-device sync
 * Free tier allows real-time collaboration across devices
 */

class RealtimeCollaboration {
    constructor(canvasId, inputId, addBtnId, clearBtnId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.studentInput = document.getElementById(inputId);
        this.addTextBtn = document.getElementById(addBtnId);
        this.clearCanvasBtn = document.getElementById(clearBtnId);
        
        // Use a simple session ID based on current URL and date
        this.sessionId = this.generateSessionId();
        this.apiUrl = 'https://api.jsonbin.io/v3/b/'; // Free JSON storage service
        this.apiKey = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // Public demo key
        
        this.colors = ['#0366d6', '#db4a38', '#28a745', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'];
        this.fonts = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Helvetica'];
        
        this.init();
    }
    
    init() {
        if (this.canvas && this.ctx) {
            this.setupCanvas();
            this.bindEvents();
            this.startPolling();
            console.log('Realtime Collaboration initialized');
        }
    }
    
    generateSessionId() {
        // Create session ID from URL and current date (so same day = same session)
        const url = window.location.pathname;
        const date = new Date().toDateString();
        const combined = url + date;
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36).substring(0, 8);
    }
    
    setupCanvas() {
        // Set canvas size
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = Math.min(800, container.clientWidth - 40);
            this.canvas.height = 400;
        }
        
        this.clearCanvas(false);
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
    }
    
    async addText() {
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
        
        // Save to cloud and render locally
        await this.saveTextToCloud(textData);
        this.renderText(textData);
    }
    
    async saveTextToCloud(textData) {
        try {
            // Get current data
            const currentData = await this.getCloudData();
            currentData.texts.push(textData);
            currentData.lastUpdate = Date.now();
            
            // Save back to cloud
            const response = await fetch(`${this.apiUrl}${this.sessionId}`, {
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
        } catch (error) {
            console.error('Error saving to cloud:', error);
            // Continue working locally even if cloud save fails
        }
    }
    
    async getCloudData() {
        try {
            const response = await fetch(`${this.apiUrl}${this.sessionId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.record || { texts: [], lastClear: 0, lastUpdate: 0 };
            }
        } catch (error) {
            console.log('Creating new session...');
        }
        
        // If no data exists, create initial structure
        const initialData = { texts: [], lastClear: 0, lastUpdate: 0 };
        try {
            await fetch(`${this.apiUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey,
                    'X-Bin-Name': this.sessionId
                },
                body: JSON.stringify(initialData)
            });
        } catch (error) {
            console.error('Error creating session:', error);
        }
        
        return initialData;
    }
    
    async loadExistingTexts() {
        try {
            const data = await this.getCloudData();
            
            // Render all texts
            data.texts.forEach(textData => {
                this.renderText(textData);
            });
            
        } catch (error) {
            console.error('Error loading existing texts:', error);
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
    
    async clearCanvas(syncToCloud = false) {
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
        
        if (syncToCloud) {
            try {
                // Clear cloud data
                const clearData = {
                    texts: [],
                    lastClear: Date.now(),
                    lastUpdate: Date.now()
                };
                await fetch(`${this.apiUrl}${this.sessionId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': this.apiKey
                    },
                    body: JSON.stringify(clearData)
                });
            } catch (error) {
                console.error('Error clearing cloud data:', error);
            }
        }
    }
    
    startPolling() {
        // Poll cloud every 3 seconds for new content
        setInterval(async () => {
            await this.checkForUpdates();
        }, 3000);
    }
    
    async checkForUpdates() {
        try {
            const data = await this.getCloudData();
            
            // Check if canvas was cleared
            if (data.lastClear > this.lastKnownUpdate) {
                this.clearCanvas(false);
            }
            
            // Check for new texts
            const newTexts = data.texts.filter(text => 
                text.timestamp > this.lastKnownUpdate
            );
            
            newTexts.forEach(textData => {
                this.renderText(textData);
            });
            
            this.lastKnownUpdate = data.lastUpdate || 0;
            
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }
    
    // Initialize tracking
    lastKnownUpdate = 0;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvasExists = document.getElementById('wordCanvas');
    if (canvasExists) {
        window.realtimeCollaboration = new RealtimeCollaboration(
            'wordCanvas',
            'studentInput',
            'addTextBtn',
            'clearCanvasBtn'
        );
    }
});