/* ==========================================================================
   DATA INTERACTIVE VISUALIZATIONS
   Multiple educational data concept demonstrations
   ========================================================================== */

class DataInteractiveApp {
    constructor() {
        // Clustering
        this.clusterCanvas = null;
        this.clusterCtx = null;
        this.clusterData = [];
        this.centroids = [];
        this.isAnimating = false;

        // Charts
        this.chartCanvas = null;
        this.chartCtx = null;
        this.chartData = [];
        this.currentChartType = 'bar';

        // Data table
        this.tableData = [];
        this.filteredData = [];

        this.colors = ['#0366d6', '#28a745', '#dc3545', '#ffc107', '#6f42c1'];

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAll());
        } else {
            this.setupAll();
        }
    }

    setupAll() {
        this.setupClustering();
        this.setupCharts();
        this.setupDataTable();
        this.setupPhotoUpload();
    }

    // ========================================================================
    // CLUSTERING FUNCTIONALITY
    // ========================================================================

    setupClustering() {
        this.clusterCanvas = document.getElementById('dataCanvas');
        if (!this.clusterCanvas) return;

        this.clusterCtx = this.clusterCanvas.getContext('2d');

        // Bind clustering events
        const generateBtn = document.getElementById('generateData');
        const clusterBtn = document.getElementById('clusterData');
        const resetBtn = document.getElementById('resetClustering');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateClusterData();
                this.drawClustering();
            });
        }

        if (clusterBtn) {
            clusterBtn.addEventListener('click', () => {
                if (!this.isAnimating) {
                    this.performClustering();
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetClustering();
            });
        }

        // Generate initial data
        this.generateClusterData();
        this.drawClustering();
    }

    generateClusterData() {
        this.clusterData = [];
        this.centroids = [];

        const numPoints = 30;
        const width = this.clusterCanvas.width;
        const height = this.clusterCanvas.height;

        // Generate random data points
        for (let i = 0; i < numPoints; i++) {
            this.clusterData.push({
                x: Math.random() * (width - 40) + 20,
                y: Math.random() * (height - 40) + 20,
                cluster: -1
            });
        }
    }

    performClustering() {
        const k = 3;
        this.isAnimating = true;

        // Initialize centroids randomly
        this.centroids = [];
        for (let i = 0; i < k; i++) {
            this.centroids.push({
                x: Math.random() * (this.clusterCanvas.width - 40) + 20,
                y: Math.random() * (this.clusterCanvas.height - 40) + 20,
                color: this.colors[i]
            });
        }

        // Perform K-means iterations
        this.runKMeansIterations(4);
    }

    runKMeansIterations(maxIterations) {
        let iteration = 0;

        const iterate = () => {
            if (iteration >= maxIterations) {
                this.isAnimating = false;
                return;
            }

            // Assign points to nearest centroid
            this.clusterData.forEach(point => {
                let minDistance = Infinity;
                let nearestCentroid = 0;

                this.centroids.forEach((centroid, index) => {
                    const distance = this.calculateDistance(point, centroid);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestCentroid = index;
                    }
                });

                point.cluster = nearestCentroid;
            });

            // Update centroids
            this.centroids.forEach((centroid, index) => {
                const clusterPoints = this.clusterData.filter(point => point.cluster === index);

                if (clusterPoints.length > 0) {
                    const avgX = clusterPoints.reduce((sum, point) => sum + point.x, 0) / clusterPoints.length;
                    const avgY = clusterPoints.reduce((sum, point) => sum + point.y, 0) / clusterPoints.length;

                    centroid.x += (avgX - centroid.x) * 0.3;
                    centroid.y += (avgY - centroid.y) * 0.3;
                }
            });

            this.drawClustering();
            iteration++;

            setTimeout(iterate, 600);
        };

        iterate();
    }

    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    resetClustering() {
        this.clusterData.forEach(point => {
            point.cluster = -1;
        });
        this.centroids = [];
        this.isAnimating = false;
        this.drawClustering();
    }

    drawClustering() {
        if (!this.clusterCtx) return;

        // Clear canvas
        this.clusterCtx.fillStyle = '#fafafa';
        this.clusterCtx.fillRect(0, 0, this.clusterCanvas.width, this.clusterCanvas.height);

        // Draw data points
        this.clusterData.forEach(point => {
            this.clusterCtx.beginPath();
            this.clusterCtx.arc(point.x, point.y, 3, 0, 2 * Math.PI);

            if (point.cluster >= 0) {
                this.clusterCtx.fillStyle = this.colors[point.cluster];
            } else {
                this.clusterCtx.fillStyle = '#666';
            }

            this.clusterCtx.fill();
            this.clusterCtx.strokeStyle = '#333';
            this.clusterCtx.lineWidth = 1;
            this.clusterCtx.stroke();
        });

        // Draw centroids
        this.centroids.forEach((centroid, index) => {
            this.clusterCtx.beginPath();
            this.clusterCtx.arc(centroid.x, centroid.y, 6, 0, 2 * Math.PI);
            this.clusterCtx.fillStyle = this.colors[index];
            this.clusterCtx.fill();
            this.clusterCtx.strokeStyle = '#fff';
            this.clusterCtx.lineWidth = 2;
            this.clusterCtx.stroke();
        });
    }

    // ========================================================================
    // CHART VISUALIZATION FUNCTIONALITY
    // ========================================================================

    setupCharts() {
        this.chartCanvas = document.getElementById('chartCanvas');
        if (!this.chartCanvas) return;

        this.chartCtx = this.chartCanvas.getContext('2d');

        // Bind chart events
        const generateChartBtn = document.getElementById('generateChart');
        const barBtn = document.getElementById('chartTypeBar');
        const lineBtn = document.getElementById('chartTypeLine');
        const pieBtn = document.getElementById('chartTypePie');

        if (generateChartBtn) {
            generateChartBtn.addEventListener('click', () => {
                this.generateChartData();
                this.drawChart();
            });
        }

        if (barBtn) {
            barBtn.addEventListener('click', () => {
                this.currentChartType = 'bar';
                this.drawChart();
            });
        }

        if (lineBtn) {
            lineBtn.addEventListener('click', () => {
                this.currentChartType = 'line';
                this.drawChart();
            });
        }

        if (pieBtn) {
            pieBtn.addEventListener('click', () => {
                this.currentChartType = 'pie';
                this.drawChart();
            });
        }

        // Generate initial chart data
        this.generateChartData();
        this.drawChart();
    }

    generateChartData() {
        this.chartData = [];
        const categories = ['Gen', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun'];

        categories.forEach((category, index) => {
            this.chartData.push({
                label: category,
                value: Math.floor(Math.random() * 100) + 10,
                color: this.colors[index % this.colors.length]
            });
        });
    }

    drawChart() {
        if (!this.chartCtx) return;

        // Clear canvas
        this.chartCtx.fillStyle = '#fafafa';
        this.chartCtx.fillRect(0, 0, this.chartCanvas.width, this.chartCanvas.height);

        switch (this.currentChartType) {
            case 'bar':
                this.drawBarChart();
                break;
            case 'line':
                this.drawLineChart();
                break;
            case 'pie':
                this.drawPieChart();
                break;
        }
    }

    drawBarChart() {
        const padding = 40;
        const barWidth = (this.chartCanvas.width - padding * 2) / this.chartData.length - 10;
        const maxValue = Math.max(...this.chartData.map(d => d.value));
        const chartHeight = this.chartCanvas.height - padding * 2;

        this.chartData.forEach((data, index) => {
            const barHeight = (data.value / maxValue) * chartHeight;
            const x = padding + index * (barWidth + 10);
            const y = this.chartCanvas.height - padding - barHeight;

            // Draw bar
            this.chartCtx.fillStyle = data.color;
            this.chartCtx.fillRect(x, y, barWidth, barHeight);

            // Draw label
            this.chartCtx.fillStyle = '#333';
            this.chartCtx.font = '12px Arial';
            this.chartCtx.textAlign = 'center';
            this.chartCtx.fillText(data.label, x + barWidth / 2, this.chartCanvas.height - 10);
            this.chartCtx.fillText(data.value, x + barWidth / 2, y - 5);
        });
    }

    drawLineChart() {
        const padding = 40;
        const maxValue = Math.max(...this.chartData.map(d => d.value));
        const chartWidth = this.chartCanvas.width - padding * 2;
        const chartHeight = this.chartCanvas.height - padding * 2;

        // Draw line
        this.chartCtx.strokeStyle = this.colors[0];
        this.chartCtx.lineWidth = 3;
        this.chartCtx.beginPath();

        this.chartData.forEach((data, index) => {
            const x = padding + (index / (this.chartData.length - 1)) * chartWidth;
            const y = this.chartCanvas.height - padding - (data.value / maxValue) * chartHeight;

            if (index === 0) {
                this.chartCtx.moveTo(x, y);
            } else {
                this.chartCtx.lineTo(x, y);
            }
        });

        // Draw the line
        this.chartCtx.stroke();

        // Draw points and labels
        this.chartData.forEach((data, index) => {
            const x = padding + (index / (this.chartData.length - 1)) * chartWidth;
            const y = this.chartCanvas.height - padding - (data.value / maxValue) * chartHeight;

            // Draw points
            this.chartCtx.fillStyle = this.colors[0];
            this.chartCtx.beginPath();
            this.chartCtx.arc(x, y, 4, 0, 2 * Math.PI);
            this.chartCtx.fill();
            this.chartCtx.strokeStyle = '#fff';
            this.chartCtx.lineWidth = 1;
            this.chartCtx.stroke();

            // Draw labels
            this.chartCtx.fillStyle = '#333';
            this.chartCtx.font = '12px Arial';
            this.chartCtx.textAlign = 'center';
            this.chartCtx.fillText(data.label, x, this.chartCanvas.height - 10);
        });
    }

    drawPieChart() {
        const centerX = this.chartCanvas.width / 2;
        const centerY = this.chartCanvas.height / 2;
        const radius = 80;
        const total = this.chartData.reduce((sum, data) => sum + data.value, 0);

        let currentAngle = 0;

        this.chartData.forEach((data, index) => {
            const sliceAngle = (data.value / total) * 2 * Math.PI;

            // Draw slice
            this.chartCtx.beginPath();
            this.chartCtx.moveTo(centerX, centerY);
            this.chartCtx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            this.chartCtx.closePath();
            this.chartCtx.fillStyle = data.color;
            this.chartCtx.fill();
            this.chartCtx.strokeStyle = '#fff';
            this.chartCtx.lineWidth = 2;
            this.chartCtx.stroke();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

            this.chartCtx.fillStyle = '#333';
            this.chartCtx.font = '12px Arial';
            this.chartCtx.textAlign = 'center';
            this.chartCtx.fillText(`${data.label}: ${data.value}`, labelX, labelY);

            currentAngle += sliceAngle;
        });
    }

    // ========================================================================
    // PHOTO UPLOAD FUNCTIONALITY
    // ========================================================================

    setupPhotoUpload() {
        this.photoContainer = document.getElementById('photoContainer');
        this.photoUpload = document.getElementById('photoUpload');
        this.uploadBtn = document.getElementById('uploadBtn');

        if (!this.photoContainer || !this.photoUpload || !this.uploadBtn) return;

        // Initialize photo storage
        this.uploadedPhotos = [];

        // Bind upload events
        this.uploadBtn.addEventListener('click', () => {
            this.photoUpload.click();
        });

        this.photoUpload.addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });

        // Add clear photos button functionality
        const clearBtn = document.getElementById('clearPhotos');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearPhotos();
            });
        }
    }

    handlePhotoUpload(event) {
        const files = event.target.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.type.startsWith('image/')) {
                this.processPhoto(file);
            }
        }

        // Clear the input so the same file can be uploaded again if needed
        event.target.value = '';
    }

    processPhoto(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const photoData = {
                id: Date.now() + Math.random(),
                src: e.target.result,
                name: file.name,
                size: this.formatFileSize(file.size),
                type: file.type,
                timestamp: new Date().toLocaleString('ca-ES'),
                metadata: this.extractBasicMetadata(file)
            };

            this.uploadedPhotos.push(photoData);
            this.displayPhoto(photoData);
        };

        reader.readAsDataURL(file);
    }

    displayPhoto(photoData) {
        const photoElement = document.createElement('div');
        photoElement.className = 'photo-item';
        photoElement.setAttribute('data-photo-id', photoData.id);

        photoElement.innerHTML = `
            <div class="photo-wrapper">
                <img src="${photoData.src}" alt="${photoData.name}" class="photo-image">
                <div class="photo-overlay">
                    <div class="photo-info">
                        <div class="photo-name">${photoData.name}</div>
                        <div class="photo-meta">${photoData.size} • ${photoData.timestamp}</div>
                    </div>
                    <button class="photo-remove" onclick="window.dataInteractiveApp.removePhoto('${photoData.id}')">&times;</button>
                </div>
            </div>
        `;

        this.photoContainer.appendChild(photoElement);

        // Add entrance animation
        setTimeout(() => {
            photoElement.classList.add('photo-loaded');
        }, 100);
    }

    removePhoto(photoId) {
        // Remove from storage
        this.uploadedPhotos = this.uploadedPhotos.filter(photo => photo.id !== photoId);

        // Remove from DOM
        const photoElement = document.querySelector(`[data-photo-id="${photoId}"]`);
        if (photoElement) {
            photoElement.classList.add('photo-removing');
            setTimeout(() => {
                photoElement.remove();
            }, 300);
        }
    }

    clearPhotos() {
        this.uploadedPhotos = [];
        if (this.photoContainer) {
            // Add fade out animation
            this.photoContainer.style.opacity = '0.3';
            setTimeout(() => {
                this.photoContainer.innerHTML = '';
                this.photoContainer.style.opacity = '1';
            }, 300);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    extractBasicMetadata(file) {
        return {
            lastModified: file.lastModified,
            size: file.size,
            type: file.type
        };
    }

    // ========================================================================
    // DATA TABLE FUNCTIONALITY
    // ========================================================================

    setupDataTable() {
        // Bind table events
        const loadBtn = document.getElementById('loadDataset');
        const filterHighBtn = document.getElementById('filterHigh');
        const filterLowBtn = document.getElementById('filterLow');
        const sortBtn = document.getElementById('sortData');
        const resetFilterBtn = document.getElementById('resetFilter');

        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.generateTableData();
                this.renderTable();
            });
        }

        if (filterHighBtn) {
            filterHighBtn.addEventListener('click', () => {
                this.filterData('high');
            });
        }

        if (filterLowBtn) {
            filterLowBtn.addEventListener('click', () => {
                this.filterData('low');
            });
        }

        if (sortBtn) {
            sortBtn.addEventListener('click', () => {
                this.sortData();
            });
        }

        if (resetFilterBtn) {
            resetFilterBtn.addEventListener('click', () => {
                this.resetFilter();
            });
        }
    }

    generateTableData() {
        this.tableData = [];
        const clients = ['Empresa A', 'Empresa B', 'Empresa C', 'Empresa D', 'Empresa E', 'Empresa F', 'Empresa G', 'Empresa H'];
        const regions = ['Catalunya', 'Madrid', 'Andalusia', 'Valencia'];

        clients.forEach(client => {
            this.tableData.push({
                client: client,
                sales: Math.floor(Math.random() * 10000) + 1000,
                region: regions[Math.floor(Math.random() * regions.length)]
            });
        });

        this.filteredData = [...this.tableData];
    }

    renderTable() {
        const tableBody = document.getElementById('dataTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        this.filteredData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.client}</td>
                <td>${row.sales}€</td>
                <td>${row.region}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    filterData(type) {
        const threshold = 5000;

        if (type === 'high') {
            this.filteredData = this.tableData.filter(row => row.sales > threshold);
        } else if (type === 'low') {
            this.filteredData = this.tableData.filter(row => row.sales <= threshold);
        }

        this.renderTable();
    }

    sortData() {
        this.filteredData.sort((a, b) => b.sales - a.sales);
        this.renderTable();
    }

    resetFilter() {
        this.filteredData = [...this.tableData];
        this.renderTable();
    }
}

// Initialize the data interactive app when the script loads
if (typeof window !== 'undefined') {
    window.dataInteractiveApp = new DataInteractiveApp();
}