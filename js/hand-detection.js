// Hand Detection Demo - Conexión con servidor Flask
class HandDetectionDemo {
    constructor() {
        this.serverUrl = 'http://localhost:5000';
        this.isConnected = false;
        this.videoElement = null;
        this.canvasElement = null;
        this.ctx = null;
        this.detectionInterval = null;
        this.stream = null;
        
        // Elementos del DOM
        this.detectedWordElement = document.getElementById('detectedWord');
        this.confidenceLevelElement = document.getElementById('confidenceLevel');
        this.wordTags = document.querySelectorAll('.word-tag');
        this.cameraButton = document.querySelector('.camera-start-btn');
        this.cameraInitButton = document.getElementById('cameraInitButton');
        this.loadingState = document.getElementById('loadingState');
        this.detectionInfo = document.getElementById('detectionInfo');
        this.pythonStreamBtn = document.querySelector('.python-stream-btn');
        
        this.init();
    }
    
    init() {
        console.log('🚀 Inicializando HandDetectionDemo...');
        
        // Configurar eventos
        if (this.cameraButton) {
            this.cameraButton.addEventListener('click', () => this.startDemo());
        }
        
        if (this.pythonStreamBtn) {
            this.pythonStreamBtn.addEventListener('click', () => this.openPythonStream());
        }
        
        // Verificar si el servidor está funcionando
        this.checkServerStatus();
        
        // Configurar elementos de video
        this.setupVideoElements();
        
        // Iniciar polling inmediatamente para mostrar datos sin necesidad de cámara
        console.log('🔄 Iniciando polling de datos inmediatamente...');
        this.startDataPolling();
    }
    
    setupVideoElements() {
        this.videoElement = document.getElementById('cameraVideo');
        this.canvasElement = document.getElementById('detectionCanvas');
        
        if (this.canvasElement) {
            this.ctx = this.canvasElement.getContext('2d');
        }
    }
    
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.serverUrl}/health`);
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.isConnected = true;
                this.showServerStatus('✅ Servidor conectado', 'success');
                
                // Actualizar las palabras disponibles si vienen del servidor
                if (data.gestures) {
                    this.updateAvailableWords(data.gestures);
                }
            }
        } catch (error) {
            this.isConnected = false;
            this.showServerStatus('❌ Servidor desconectado - Ejecuta start_demo.bat', 'error');
            console.error('Error conectando con el servidor:', error);
        }
    }
    
    showServerStatus(message, type) {
        // Crear o actualizar indicador de estado del servidor
        let statusIndicator = document.querySelector('.server-status');
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.className = 'server-status';
            statusIndicator.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 14px;
                z-index: 1000;
                transition: all 0.3s ease;
                max-width: 300px;
            `;
            document.body.appendChild(statusIndicator);
        }
        
        statusIndicator.textContent = message;
        statusIndicator.className = `server-status ${type}`;
        
        // Aplicar estilos según el tipo
        if (type === 'success') {
            statusIndicator.style.background = '#10b981';
            statusIndicator.style.color = 'white';
        } else {
            statusIndicator.style.background = '#ef4444';
            statusIndicator.style.color = 'white';
        }
        
        // Auto-ocultar después de 5 segundos si es exitoso
        if (type === 'success') {
            setTimeout(() => {
                statusIndicator.style.opacity = '0';
                setTimeout(() => statusIndicator.remove(), 300);
            }, 5000);
        }
    }
    
    updateAvailableWords(gestures) {
        // Actualizar las etiquetas de palabras con los gestos del servidor
        this.wordTags.forEach((tag, index) => {
            if (gestures[index]) {
                // Limpiar emojis para mostrar solo el texto
                const cleanGesture = gestures[index].replace(/[^\w\s]/gi, '').trim();
                if (cleanGesture) {
                    tag.textContent = cleanGesture;
                }
            }
        });
    }
    
    async startDemo() {
        if (!this.isConnected) {
            this.showServerStatus('⚠️ Primero inicia el servidor: ejecuta start_server.bat', 'error');
            return;
        }
        
        // Mostrar estado de carga
        this.showLoading(true);
        
        try {
            // Iniciar cámara local para mostrar en la interfaz
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            
            if (this.videoElement) {
                this.videoElement.srcObject = this.stream;
                await this.videoElement.play();
                
                // Mostrar el video
                this.videoElement.style.display = 'block';
                
                // Configurar canvas para que coincida con el video
                if (this.canvasElement) {
                    this.canvasElement.width = this.videoElement.videoWidth || 640;
                    this.canvasElement.height = this.videoElement.videoHeight || 480;
                    
                    // Mostrar el canvas
                    this.canvasElement.style.display = 'block';
                    
                    // Posicionar canvas sobre el video
                    this.canvasElement.style.position = 'absolute';
                    this.canvasElement.style.top = '0';
                    this.canvasElement.style.left = '0';
                    this.canvasElement.style.pointerEvents = 'none';
                }
            }
            
            // Ocultar botón de inicio y mostrar interfaz
            if (this.cameraInitButton) {
                this.cameraInitButton.style.display = 'none';
            }
            
            this.showLoading(false);
            this.showDetectionInfo(true);
            
            // Iniciar polling de datos del servidor
            this.startDataPolling();
            
            // Iniciar dibujo de landmarks en el canvas
            this.startLandmarkDrawing();
            
            this.showServerStatus('🎯 Demo iniciado correctamente', 'success');
            
        } catch (error) {
            this.showLoading(false);
            this.showServerStatus('❌ Error accediendo a la cámara', 'error');
            console.error('Error iniciando la cámara:', error);
        }
    }
    
    startDataPolling() {
        console.log('📊 Iniciando polling de datos cada 33ms (30 FPS)...');
        
        // Polling más frecuente para 30 FPS de detección
        this.detectionInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.serverUrl}/hand_data`);
                const data = await response.json();
                
                console.log('📡 Datos recibidos:', data);
                this.updateDetectionDisplay(data);
                
            } catch (error) {
                console.error('❌ Error obteniendo datos del servidor:', error);
                this.isConnected = false;
            }
        }, 33); // ~30 FPS (1000ms / 30 = 33ms)
    }
    
    updateDetectionDisplay(data) {
        // Solo actualizar si hay una detección real
        if (data.detected && data.gesture && data.gesture !== 'None' && data.gesture !== 'Ninguno') {
            // Actualizar palabra detectada
            if (this.detectedWordElement) {
                // Limpiar emojis del gesto para mostrar solo texto
                const cleanGesture = data.gesture.replace(/[^\w\s]/gi, '').trim();
                this.detectedWordElement.textContent = cleanGesture || data.gesture;
                this.detectedWordElement.style.color = '#10b981'; // Verde para detección activa
                this.detectedWordElement.style.fontWeight = 'bold';
                this.detectedWordElement.style.fontSize = '2rem';
            }
            
            // Actualizar nivel de confianza con la precisión real
            if (this.confidenceLevelElement) {
                const confidence = Math.round(data.confidence * 100);
                this.confidenceLevelElement.textContent = confidence + '%';
                
                // Color según nivel de confianza
                if (data.confidence > 0.9) {
                    this.confidenceLevelElement.style.color = '#10b981'; // Verde alto
                } else if (data.confidence > 0.8) {
                    this.confidenceLevelElement.style.color = '#f59e0b'; // Naranja medio
                } else {
                    this.confidenceLevelElement.style.color = '#ef4444'; // Rojo bajo
                }
                this.confidenceLevelElement.style.fontWeight = 'bold';
            }
            
            // Actualizar las etiquetas de palabras - resaltar solo la detectada
            this.updateActiveWordTag(data.gesture);
            
            // Actualizar estado de detección
            this.updateDetectionStatus(true);
            
        } else {
            // No hay detección - mostrar estado de espera
            if (this.detectedWordElement) {
                this.detectedWordElement.textContent = 'Esperando gesto...';
                this.detectedWordElement.style.color = '#6b7280'; // Gris
                this.detectedWordElement.style.fontWeight = 'normal';
                this.detectedWordElement.style.fontSize = '1.5rem';
            }
            
            if (this.confidenceLevelElement) {
                this.confidenceLevelElement.textContent = '--';
                this.confidenceLevelElement.style.color = '#6b7280';
                this.confidenceLevelElement.style.fontWeight = 'normal';
            }
            
            // Quitar resaltado de todas las palabras
            this.updateActiveWordTag(null);
            
            // Mostrar estado de espera
            this.updateDetectionStatus(false);
        }
        
        // Dibujar landmarks si están disponibles
        if (data.landmarks && data.landmarks.length > 0) {
            this.drawHandLandmarks(data.landmarks[0]);
        } else {
            this.clearCanvas();
        }
    }
    
    updateActiveWordTag(gesture) {
        // Remover clase active de todas las etiquetas
        this.wordTags.forEach(tag => tag.classList.remove('active'));
        
        // Solo buscar coincidencia si hay un gesto válido
        if (gesture && gesture !== 'None' && gesture !== 'Ninguno') {
            // Encontrar y activar la etiqueta correspondiente
            const cleanGesture = gesture.replace(/[^\w\s]/gi, '').trim();
            const matchingTag = Array.from(this.wordTags).find(tag => 
                tag.textContent.toLowerCase().includes(cleanGesture.toLowerCase()) ||
                cleanGesture.toLowerCase().includes(tag.textContent.toLowerCase())
            );
            
            if (matchingTag) {
                matchingTag.classList.add('active');
            }
        }
    }
    
    updateDetectionStatus(isDetecting) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (statusDot && statusText) {
            if (isDetecting) {
                statusDot.style.background = '#10b981';
                statusText.textContent = 'Mano detectada';
            } else {
                statusDot.style.background = '#6b7280';
                statusText.textContent = 'Esperando mano...';
            }
        }
    }
    
    openPythonStream() {
        if (!this.isConnected) {
            this.showServerStatus('⚠️ Servidor no disponible - Ejecuta start_demo.bat', 'error');
            return;
        }
        
        // Abrir el stream de video de Python en una nueva ventana
        const streamUrl = `${this.serverUrl}/video_feed`;
        window.open(streamUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    }
    
    showLoading(show) {
        if (this.loadingState) {
            this.loadingState.style.display = show ? 'flex' : 'none';
        }
    }
    
    showDetectionInfo(show) {
        if (this.detectionInfo) {
            this.detectionInfo.style.display = show ? 'block' : 'none';
        }
    }
    
    stopDemo() {
        // Detener polling
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        // Detener cámara
        if (this.videoElement && this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
        
        // Mostrar botón de inicio
        if (this.cameraInitButton) {
            this.cameraInitButton.style.display = 'flex';
        }
        
        this.showDetectionInfo(false);
    }
    
    startLandmarkDrawing() {
        // Variable global para almacenar datos de detección
        window.latest_hand_data = { detected: false, landmarks: [] };
        
        // Obtener datos del servidor más frecuentemente para dibujo fluido
        const updateHandData = async () => {
            try {
                const response = await fetch(`${this.serverUrl}/hand_data`);
                const data = await response.json();
                window.latest_hand_data = data;
            } catch (error) {
                console.error('Error obteniendo datos:', error);
            }
        };
        
        // Actualizar datos cada 33ms para 30 FPS de dibujo
        setInterval(updateHandData, 33);
        
        // Dibujar landmarks en tiempo real en el canvas
        const drawLandmarks = () => {
            if (!this.ctx || !this.videoElement) {
                requestAnimationFrame(drawLandmarks);
                return;
            }
            
            // Limpiar canvas
            this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            
            // Si hay datos de detección, dibujar landmarks
            if (window.latest_hand_data && window.latest_hand_data.detected && window.latest_hand_data.landmarks.length > 0) {
                this.drawHandLandmarks(window.latest_hand_data.landmarks[0]);
                
                // Mostrar estado de detección en canvas
                this.ctx.fillStyle = '#10b981';
                this.ctx.font = '16px Inter, sans-serif';
                this.ctx.fillText('✓ Manos detectadas', 10, 25);
            } else {
                // Mostrar mensaje de búsqueda
                this.ctx.fillStyle = '#f59e0b';
                this.ctx.font = '16px Inter, sans-serif';
                this.ctx.fillText('🖐️ Muestra tus manos...', 10, 25);
            }
            
            requestAnimationFrame(drawLandmarks);
        };
        
        drawLandmarks();
    }
    
    drawHandLandmarks(landmarks) {
        if (!landmarks || !this.ctx) return;
        
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;
        
        // Dibujar puntos de landmarks con colores cardinales
        landmarks.forEach((landmark, i) => {
            const x = landmark.x * width;
            const y = landmark.y * height;
            
            // Colores y tamaños según tipo de punto (igual que en Python)
            let color, radius, label;
            if (i === 0) { // Muñeca - PUNTO PRINCIPAL
                color = '#ef4444'; // Rojo brillante
                radius = 10;
                label = 'W';
            } else if ([4, 8, 12, 16, 20].includes(i)) { // Puntas de dedos - PUNTOS CARDINALES
                color = '#ec4899'; // Magenta
                radius = 8;
                const fingerLabels = {4: 'P', 8: 'I', 12: 'M', 16: 'A', 20: 'Ñ'};
                label = fingerLabels[i];
            } else if ([1, 5, 9, 13, 17].includes(i)) { // Base de dedos
                color = '#10b981'; // Verde
                radius = 6;
                label = '';
            } else { // Articulaciones intermedias
                color = '#eab308'; // Amarillo
                radius = 4;
                label = '';
            }
            
            // Dibujar punto principal
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            
            // Dibujar borde blanco para mejor visibilidad
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + 2, 0, 2 * Math.PI);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Dibujar etiquetas en puntos cardinales
            if (label) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 12px Inter, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(label, x, y - radius - 8);
            }
        });
        
        // Dibujar conexiones entre puntos
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],  // Pulgar
            [0, 5], [5, 6], [6, 7], [7, 8],  // Índice
            [0, 9], [9, 10], [10, 11], [11, 12],  // Medio
            [0, 13], [13, 14], [14, 15], [15, 16],  // Anular
            [0, 17], [17, 18], [18, 19], [19, 20],  // Meñique
        ];
        
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 2;
        
        connections.forEach(([start, end]) => {
            if (start < landmarks.length && end < landmarks.length) {
                const startPoint = landmarks[start];
                const endPoint = landmarks[end];
                
                this.ctx.beginPath();
                this.ctx.moveTo(startPoint.x * width, startPoint.y * height);
                this.ctx.lineTo(endPoint.x * width, endPoint.y * height);
                this.ctx.stroke();
            }
        });
        
        // Información adicional de los puntos cardinales
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(width - 200, 10, 190, 80);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Puntos Cardinales:', width - 195, 30);
        this.ctx.fillText('W: Muñeca (rojo)', width - 195, 45);
        this.ctx.fillText('P,I,M,A,Ñ: Dedos (magenta)', width - 195, 60);
        this.ctx.fillText('Verde: Bases, Amarillo: Nudillos', width - 195, 75);
    }

    stopDemo() {
        // Detener polling
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        // Detener cámara
        if (this.videoElement && this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
            
            // Ocultar video
            this.videoElement.style.display = 'none';
        }
        
        // Ocultar canvas
        if (this.canvasElement) {
            this.canvasElement.style.display = 'none';
        }
        
        // Mostrar botón de inicio
        if (this.cameraInitButton) {
            this.cameraInitButton.style.display = 'flex';
        }
        
        this.showDetectionInfo(false);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const handDetectionDemo = new HandDetectionDemo();
    
    // Hacer la instancia global para depuración
    window.handDetectionDemo = handDetectionDemo;
});
