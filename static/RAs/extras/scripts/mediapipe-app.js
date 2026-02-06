// MediaPipe Camera Detection App
class MediaPipeApp {
  constructor() {
    // DOM Elements
    this.videoElement = document.getElementById('videoElement');
    this.canvasElement = document.getElementById('canvasElement');
    this.startButton = document.getElementById('startButton');
    this.stopButton = document.getElementById('stopButton');
    this.switchCameraButton = document.getElementById('switchCameraButton');
    this.recordButton = document.getElementById('recordButton');
    this.stopRecordButton = document.getElementById('stopRecordButton');
    this.downloadButton = document.getElementById('downloadButton');
    this.statusIndicator = document.getElementById('statusIndicator');
    this.recordingTime = document.getElementById('recordingTime');

    // Checkboxes
    this.poseCheckbox = document.getElementById('poseDetection');
    this.handCheckbox = document.getElementById('handDetection');
    this.faceCheckbox = document.getElementById('faceDetection');

    // State
    this.stream = null;
    this.camera = null;
    this.canvasCtx = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.recordingStartTime = null;
    this.recordingInterval = null;
    this.recordingMimeType = null;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.currentFacingMode = this.isMobile ? 'environment' : 'user'; // Start with back camera on mobile, front on desktop
    this.availableCameras = [];

    // MediaPipe instances
    this.pose = null;
    this.hands = null;
    this.faceMesh = null;

    // Detection results
    this.poseResults = null;
    this.handsResults = null;
    this.faceResults = null;

    this.init();
  }

  async init() {
    this.canvasCtx = this.canvasElement.getContext('2d');
    await this.checkAvailableCameras();
    this.setupEventListeners();
  }

  async checkAvailableCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices.filter(device => device.kind === 'videoinput');

      // Show switch camera button if multiple cameras are available or on mobile
      if (this.availableCameras.length > 1 || this.isMobile) {
        this.switchCameraButton.style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  }

  setupEventListeners() {
    this.startButton.addEventListener('click', () => this.startCamera());
    this.stopButton.addEventListener('click', () => this.stopCamera());
    this.switchCameraButton.addEventListener('click', () => this.switchCamera());
    this.recordButton.addEventListener('click', () => this.startRecording());
    this.stopRecordButton.addEventListener('click', () => this.stopRecording());
    this.downloadButton.addEventListener('click', () => this.downloadVideo());

    // Update detection models when checkboxes change
    this.poseCheckbox.addEventListener('change', () => this.updateDetectionModels());
    this.handCheckbox.addEventListener('change', () => this.updateDetectionModels());
    this.faceCheckbox.addEventListener('change', () => this.updateDetectionModels());
  }

  async startCamera() {
    try {
      const isPortrait = window.innerHeight > window.innerWidth;

      // Request camera access with appropriate constraints
      // Force portrait mode on mobile devices for better vertical video
      const constraints = {
        video: {
          facingMode: this.currentFacingMode,
          width: { ideal: this.isMobile ? 720 : 1280 },
          height: { ideal: this.isMobile ? 1280 : 720 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;

      // Wait for video metadata to load
      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          resolve();
        };
      });

      // Set canvas dimensions to match video
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasElement.height = this.videoElement.videoHeight;

      // Adjust video wrapper aspect ratio based on video orientation
      const videoWrapper = document.querySelector('.video-wrapper');
      const aspectRatio = this.videoElement.videoHeight / this.videoElement.videoWidth;

      if (aspectRatio > 1) {
        // Portrait orientation
        videoWrapper.classList.add('portrait');
        videoWrapper.style.paddingBottom = (aspectRatio * 100) + '%';
      } else {
        // Landscape orientation
        videoWrapper.classList.remove('portrait');
        videoWrapper.style.paddingBottom = (aspectRatio * 100) + '%';
      }

      // Initialize MediaPipe models
      await this.initializeMediaPipe();

      // Update UI
      this.startButton.disabled = true;
      this.stopButton.disabled = false;
      this.switchCameraButton.disabled = false;
      this.recordButton.disabled = false;
      this.statusIndicator.textContent = 'Càmera activa';
      this.statusIndicator.style.background = 'rgba(40, 167, 69, 0.9)';

      // Start detection loop
      this.detectFrame();

    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Error al accedir a la càmera. Assegura\'t que has donat permisos.');
    }
  }

  async switchCamera() {
    // Toggle between front and back camera
    this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';

    // Stop current camera
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    // Restart camera with new facing mode
    await this.startCamera();
  }

  async initializeMediaPipe() {
    // Initialize Pose Detection
    if (this.poseCheckbox.checked) {
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults((results) => {
        this.poseResults = results;
      });
    }

    // Initialize Hand Detection
    if (this.handCheckbox.checked) {
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults((results) => {
        this.handsResults = results;
      });
    }

    // Initialize Face Mesh
    if (this.faceCheckbox.checked) {
      this.faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.faceMesh.onResults((results) => {
        this.faceResults = results;
      });
    }
  }

  async updateDetectionModels() {
    if (!this.stream) return;

    // Reinitialize MediaPipe models based on checkbox states
    this.pose = null;
    this.hands = null;
    this.faceMesh = null;

    await this.initializeMediaPipe();
  }

  async detectFrame() {
    if (!this.stream) return;

    // Send frame to MediaPipe models
    if (this.pose && this.poseCheckbox.checked) {
      await this.pose.send({ image: this.videoElement });
    }

    if (this.hands && this.handCheckbox.checked) {
      await this.hands.send({ image: this.videoElement });
    }

    if (this.faceMesh && this.faceCheckbox.checked) {
      await this.faceMesh.send({ image: this.videoElement });
    }

    // Draw results
    this.drawResults();

    // Continue detection loop
    requestAnimationFrame(() => this.detectFrame());
  }

  drawResults() {
    // Clear canvas
    this.canvasCtx.save();
    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Draw video frame
    this.canvasCtx.drawImage(
      this.videoElement,
      0, 0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    // Draw pose landmarks
    if (this.poseResults && this.poseResults.poseLandmarks && this.poseCheckbox.checked) {
      this.drawPose(this.poseResults);
    }

    // Draw hand landmarks
    if (this.handsResults && this.handsResults.multiHandLandmarks && this.handCheckbox.checked) {
      for (const landmarks of this.handsResults.multiHandLandmarks) {
        this.drawHands(landmarks);
      }
    }

    // Draw face mesh
    if (this.faceResults && this.faceResults.multiFaceLandmarks && this.faceCheckbox.checked) {
      for (const landmarks of this.faceResults.multiFaceLandmarks) {
        this.drawFaceMesh(landmarks);
      }
    }

    this.canvasCtx.restore();
  }

  drawPose(results) {
    // Draw pose connections
    window.drawConnectors(this.canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 4
    });

    // Draw pose landmarks
    window.drawLandmarks(this.canvasCtx, results.poseLandmarks, {
      color: '#FF0000',
      lineWidth: 2,
      radius: 6
    });
  }

  drawHands(landmarks) {
    // Draw hand connections
    window.drawConnectors(this.canvasCtx, landmarks, window.HAND_CONNECTIONS, {
      color: '#00FFFF',
      lineWidth: 3
    });

    // Draw hand landmarks
    window.drawLandmarks(this.canvasCtx, landmarks, {
      color: '#FF00FF',
      lineWidth: 2,
      radius: 5
    });
  }

  drawFaceMesh(landmarks) {
    // Draw face mesh connections
    window.drawConnectors(this.canvasCtx, landmarks, window.FACEMESH_TESSELATION, {
      color: '#C0C0C070',
      lineWidth: 1
    });

    // Draw face contours
    window.drawConnectors(this.canvasCtx, landmarks, window.FACEMESH_RIGHT_EYE, {
      color: '#FF3030',
      lineWidth: 2
    });

    window.drawConnectors(this.canvasCtx, landmarks, window.FACEMESH_LEFT_EYE, {
      color: '#30FF30',
      lineWidth: 2
    });

    window.drawConnectors(this.canvasCtx, landmarks, window.FACEMESH_LIPS, {
      color: '#E0E0E0',
      lineWidth: 2
    });
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.stopRecording();
    }

    // Clear canvas
    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Reset MediaPipe instances
    this.pose = null;
    this.hands = null;
    this.faceMesh = null;
    this.poseResults = null;
    this.handsResults = null;
    this.faceResults = null;

    // Update UI
    this.startButton.disabled = false;
    this.stopButton.disabled = true;
    this.switchCameraButton.disabled = true;
    this.recordButton.disabled = true;
    this.statusIndicator.textContent = 'Càmera aturada';
    this.statusIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
  }

  startRecording() {
    try {
      // Create a stream from the canvas
      let canvasStream;
      try {
        // Try to capture stream with specified framerate
        canvasStream = this.canvasElement.captureStream(30); // 30 FPS
      } catch (e) {
        // Fallback for browsers that don't support framerate parameter
        console.warn('captureStream with framerate not supported, using default');
        canvasStream = this.canvasElement.captureStream();
      }

      // Check if we got a valid stream
      if (!canvasStream || canvasStream.getVideoTracks().length === 0) {
        throw new Error('Failed to capture canvas stream');
      }

      // Try different mimeTypes in order of preference
      // Firefox mobile prefers basic formats
      const mimeTypes = [
        'video/webm;codecs=vp8',        // WebM with VP8 (best Firefox mobile support)
        'video/webm',                   // Basic WebM (fallback for Firefox)
        'video/webm;codecs=vp9',        // WebM with VP9
        'video/webm;codecs=h264',       // WebM with H264
        'video/mp4',                    // MP4 format (iOS/Safari)
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('Using mimeType:', mimeType);
          break;
        }
      }

      if (!selectedMimeType) {
        // Last resort: try without specifying mimeType
        console.warn('No specific mimeType supported, using browser default');
        selectedMimeType = '';
      }

      // Configure MediaRecorder options
      const options = {};
      if (selectedMimeType) {
        options.mimeType = selectedMimeType;
      }
      // Use lower bitrate for mobile compatibility
      if (this.isMobile) {
        options.videoBitsPerSecond = 1500000; // 1.5 Mbps for mobile
      } else {
        options.videoBitsPerSecond = 2500000; // 2.5 Mbps for desktop
      }

      this.recordingMimeType = selectedMimeType || 'video/webm';
      this.mediaRecorder = new MediaRecorder(canvasStream, options);
      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          console.log('Recorded chunk:', event.data.size, 'bytes');
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('Error durant la gravació. Proveu de nou.');
        this.stopRecording();
      };

      this.mediaRecorder.onstop = () => {
        console.log('Recording stopped. Total chunks:', this.recordedChunks.length);
        this.downloadButton.disabled = false;
      };

      // Use larger timeslice for Firefox mobile compatibility
      const timeslice = this.isMobile ? 1000 : 100; // 1 second for mobile, 100ms for desktop
      this.mediaRecorder.start(timeslice);

      // Start recording timer
      this.recordingStartTime = Date.now();
      this.recordingInterval = setInterval(() => {
        const elapsed = Date.now() - this.recordingStartTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        this.recordingTime.textContent =
          `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
      }, 100);

      // Update UI
      this.recordButton.disabled = true;
      this.stopRecordButton.disabled = false;
      this.startButton.disabled = true;
      this.stopButton.disabled = true;
      this.statusIndicator.textContent = 'Gravant...';
      this.statusIndicator.classList.add('recording');
      this.recordingTime.classList.add('active');

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error al iniciar la gravació.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    // Stop recording timer
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    // Update UI
    this.recordButton.disabled = false;
    this.stopRecordButton.disabled = true;
    this.startButton.disabled = false;
    this.stopButton.disabled = false;
    this.statusIndicator.textContent = 'Càmera activa';
    this.statusIndicator.classList.remove('recording');
    this.recordingTime.classList.remove('active');
    this.recordingTime.textContent = '00:00';
  }

  downloadVideo() {
    if (this.recordedChunks.length === 0) {
      alert('No hi ha vídeo per descarregar.');
      return;
    }

    // Determine file extension based on MIME type
    let extension = 'webm';
    if (this.recordingMimeType) {
      if (this.recordingMimeType.includes('mp4')) {
        extension = 'mp4';
      } else if (this.recordingMimeType.includes('webm')) {
        extension = 'webm';
      }
    }

    const blob = new Blob(this.recordedChunks, { type: this.recordingMimeType || 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `mediapipe-recording-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    // Reset
    this.recordedChunks = [];
    this.downloadButton.disabled = true;
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MediaPipeApp();
});
