/*
 * Simple QR Code Generator
 * Uses QR Server API (reliable free service)
 */

window.SimpleQR = {
    generateQR: function(container, text, options = {}) {
        const size = options.size || 120;
        const color = options.color || '0366d6';
        const bgcolor = options.bgcolor || 'ffffff';
        
        // Use QR Server - very reliable free QR API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${color}&bgcolor=${bgcolor}`;
        
        // Clear container
        container.innerHTML = '';
        
        // Create image element
        const img = document.createElement('img');
        img.src = qrUrl;
        img.alt = 'QR Code';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        // Add error handling
        img.onerror = function() {
            console.error('QR generation failed');
            container.innerHTML = `
                <div style="text-align: center; padding: 10px; border: 2px dashed #ccc; border-radius: 8px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Accedeix a:</div>
                    <div style="font-size: 10px; word-break: break-all; color: #0366d6;">${text}</div>
                </div>
            `;
        };
        
        img.onload = function() {
            console.log('QR Code generated successfully');
        };
        
        container.appendChild(img);
    }
};

// Initialize QR code when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const qrContainer = document.getElementById('qrContainer');
    if (qrContainer) {
        const currentUrl = window.location.href;
        SimpleQR.generateQR(qrContainer, currentUrl, {
            size: 120,
            color: '0366d6',
            bgcolor: 'ffffff'
        });
    }
});