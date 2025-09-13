/*
 * Simple QR Code Generator using Google Charts API
 * Fallback for when external QR libraries fail to load
 */

window.SimpleQRCode = {
    toCanvas: function(canvas, text, options, callback) {
        options = options || {};
        const size = options.width || 120;
        const errorCorrectionLevel = 'L';
        const encoding = 'UTF-8';
        
        // Create Google Charts QR Code URL
        const qrUrl = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(text)}&choe=${encoding}&chld=${errorCorrectionLevel}|0`;
        
        // Create an image and draw it to canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;
            
            // Clear canvas
            ctx.clearRect(0, 0, size, size);
            
            // Set background color if specified
            if (options.colorLight) {
                ctx.fillStyle = options.colorLight;
                ctx.fillRect(0, 0, size, size);
            }
            
            // Draw the QR code image
            ctx.drawImage(img, 0, 0, size, size);
            
            if (callback) callback(null);
        };
        
        img.onerror = function() {
            // Fallback: show text URL instead
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;
            
            ctx.fillStyle = options.colorLight || '#ffffff';
            ctx.fillRect(0, 0, size, size);
            
            ctx.fillStyle = options.colorDark || '#000000';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Split URL into multiple lines if too long
            const maxWidth = size - 10;
            const words = text.split('');
            let line = '';
            let y = size / 2 - 20;
            
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n];
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, size / 2, y);
                    line = words[n];
                    y += 12;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, size / 2, y);
            
            if (callback) callback(null);
        };
        
        img.src = qrUrl;
    }
};

// Make it compatible with the original QRCode library interface
if (typeof QRCode === 'undefined') {
    window.QRCode = window.SimpleQRCode;
}