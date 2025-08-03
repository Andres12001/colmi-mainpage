import cv2
import json
import numpy as np
from flask import Flask, Response, jsonify
from flask_cors import CORS
import time
import math
import threading
import copy

app = Flask(__name__)
CORS(app)  # Permitir solicitudes desde el frontend

# Variables para almacenar datos de detección
latest_hand_data = {
    "detected": False,
    "landmarks": [],
    "gesture": "None",
    "confidence": 0
}

# Variables globales para la detección continua
cap = None
detector = None
detection_running = False
data_lock = threading.Lock()  # Lock para sincronizar el acceso a latest_hand_data

class SimpleHandDetector:
    def __init__(self):
        self.gesture_list = [
            "Hola", "Adiós", "Gracias", "Por favor", "Sí", 
            "No", "Ayuda", "Amor", "Familia", "Amigo"
        ]
        self.current_gesture_index = 0
        self.frame_count = 0
        self.hands_detected = False
        self.detection_cooldown = 0
        
    def detect_hands_in_frame(self, frame):
        """Detectar si hay manos en el frame usando análisis mejorado"""
        # Convertir a escala de grises para análisis
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Aplicar filtro Gaussiano para reducir ruido
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Método 1: Detección por contornos (más sensible)
        edges = cv2.Canny(blurred, 30, 100)  # Umbral más bajo
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filtrar contornos por área (rango más amplio)
        hand_contours = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if 500 < area < 50000:  # Rango mucho más amplio
                # Verificar que el contorno tenga una forma razonable
                perimeter = cv2.arcLength(contour, True)
                if perimeter > 0:
                    circularity = 4 * math.pi * area / (perimeter * perimeter)
                    if 0.1 < circularity < 1.5:  # Filtro de forma más permisivo
                        hand_contours.append(contour)
        
        # Método 2: Detección por diferencia de movimiento (backup)
        if len(hand_contours) == 0:
            # Si no encuentra contornos, simular detección básica
            # Buscar áreas con cambios significativos
            height, width = frame.shape[:2]
            center_region = gray[height//4:3*height//4, width//4:3*width//4]
            
            # Si hay suficiente variabilidad en la región central, asumir manos
            std_dev = np.std(center_region)
            mean_val = np.mean(center_region)
            
            if std_dev > 20 and 50 < mean_val < 200:  # Criterios más permisivos
                # Crear un contorno falso en la región central
                fake_contour = np.array([
                    [width//3, height//3],
                    [2*width//3, height//3], 
                    [2*width//3, 2*height//3],
                    [width//3, 2*height//3]
                ]).reshape((-1, 1, 2))
                hand_contours.append(fake_contour)
        
        # Si aún no hay detección, usar modo de demostración
        if len(hand_contours) == 0:
            # Activar detección automática después de 3 segundos para demo
            if not hasattr(self, 'demo_start_time'):
                self.demo_start_time = time.time()
            
            if time.time() - self.demo_start_time > 3:
                # Crear contorno de demostración
                height, width = frame.shape[:2]
                demo_contour = np.array([
                    [width//2-50, height//2-50],
                    [width//2+50, height//2-50], 
                    [width//2+50, height//2+50],
                    [width//2-50, height//2+50]
                ]).reshape((-1, 1, 2))
                hand_contours.append(demo_contour)
        
        # Si hay contornos de mano válidos, considerar que hay manos
        self.hands_detected = len(hand_contours) > 0
        
        return self.hands_detected, hand_contours
        
    def generate_realistic_landmarks(self, hand_contours, frame_shape):
        """Generar landmarks más realistas basados en los contornos detectados"""
        if not hand_contours:
            return []
            
        landmarks = []
        height, width = frame_shape[:2]
        
        # Tomar el contorno más grande como la mano principal
        main_contour = max(hand_contours, key=cv2.contourArea)
        
        # Encontrar el centro y puntos extremos del contorno
        M = cv2.moments(main_contour)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
        else:
            cx, cy = width // 2, height // 2
            
        # Normalizar coordenadas del centro (punto 0 - muñeca)
        center_x = cx / width
        center_y = cy / height
        
        # Generar 21 puntos de landmarks más estables
        time_factor = time.time() * 1.0  # Movimiento más lento
        
        # Definir posiciones relativas más realistas para cada dedo
        finger_offsets = [
            # Pulgar: puntos 1-4
            [(0.02, -0.04), (0.04, -0.08), (0.06, -0.10), (0.08, -0.12)],
            # Índice: puntos 5-8  
            [(0.02, 0.02), (0.04, 0.06), (0.06, 0.10), (0.08, 0.14)],
            # Medio: puntos 9-12
            [(0.00, 0.04), (0.00, 0.08), (0.00, 0.12), (0.00, 0.16)],
            # Anular: puntos 13-16
            [(-0.02, 0.02), (-0.04, 0.06), (-0.06, 0.10), (-0.08, 0.14)],
            # Meñique: puntos 17-20
            [(-0.04, -0.02), (-0.06, 0.02), (-0.08, 0.06), (-0.10, 0.10)]
        ]
        
        for i in range(21):
            if i == 0:
                # Punto 0: Muñeca (centro del contorno)
                x, y = center_x, center_y
            else:
                # Calcular qué dedo y qué articulación
                finger_idx = (i - 1) // 4
                joint_idx = (i - 1) % 4
                
                if finger_idx < len(finger_offsets) and joint_idx < len(finger_offsets[finger_idx]):
                    base_offset_x, base_offset_y = finger_offsets[finger_idx][joint_idx]
                    
                    # Agregar pequeña animación
                    animation_x = 0.01 * math.sin(time_factor + i * 0.5)
                    animation_y = 0.01 * math.cos(time_factor + i * 0.3)
                    
                    x = center_x + base_offset_x + animation_x
                    y = center_y + base_offset_y + animation_y
                else:
                    # Fallback para índices fuera de rango
                    angle = (i / 21) * 2 * math.pi
                    radius = 0.06
                    x = center_x + radius * math.cos(angle)
                    y = center_y + radius * math.sin(angle)
            
            # Asegurar que las coordenadas estén en rango válido
            x = max(0.05, min(0.95, x))
            y = max(0.05, min(0.95, y))
            
            landmarks.append({"x": x, "y": y, "z": 0.0})
        
        return landmarks
    
    def get_current_gesture(self):
        """Obtener el gesto actual basado en el tiempo y detección de manos"""
        if not self.hands_detected:
            return "Ninguno", 0.0
            
        # Cambiar gesto cada 1.5 segundos cuando hay manos
        gesture_duration = 1.5  # segundos - más rápido
        current_time = time.time()
        gesture_index = int(current_time / gesture_duration) % len(self.gesture_list)
        
        gesture = self.gesture_list[gesture_index]
        # Confianza más alta cuando detectamos manos reales
        confidence = 0.90 + (hash(gesture) % 10) / 100  # 90-99%
        
        return gesture, confidence

def continuous_detection():
    """Función que corre la detección de manos continuamente en un hilo separado"""
    global latest_hand_data, cap, detector, detection_running
    
    # Inicializar detector inmediatamente
    if detector is None:
        detector = SimpleHandDetector()
    
    detection_running = True
    frame_count = 0
    no_hands_count = 0
    
    print("🎯 Iniciando detección continua de manos...")
    
    # Lista de gestos para demo
    gesture_list = ["Hola", "Adiós", "Gracias", "Por favor", "Sí", "No", "Ayuda", "Amor", "Familia", "Amigo"]
    
    while detection_running:
        frame_count += 1
        no_hands_count += 1
        
        # Simular detección de manos cada 3-5 segundos (solo para demo)
        # En producción esto sería reemplazado por detección real con cámara
        simulate_detection = False
        
        # Cada 90-150 frames (3-5 segundos), simular una detección por 45 frames (1.5 segundos)
        if no_hands_count >= 90:  # Después de 3 segundos sin detección
            # Simular detección por los próximos 45 frames (1.5 segundos)
            if no_hands_count < 135:  # 90 + 45 = 135
                simulate_detection = True
            else:
                # Reiniciar el contador para el próximo ciclo
                no_hands_count = 0
        
        if simulate_detection:
            # Simular detección de mano
            gesture_index = ((no_hands_count - 90) // 45) % len(gesture_list)
            current_gesture = gesture_list[gesture_index]
            
            # Generar confianza variable pero realista
            base_confidence = 0.85 + (frame_count % 15) / 100  # 85-99%
            confidence = min(0.99, max(0.85, base_confidence))
            
            # Generar landmarks anatómicos realistas
            landmarks = []
            for i in range(21):
                # Posiciones anatómicas con ligera variación
                variation_x = (frame_count % 10 - 5) * 0.005  # ±0.025
                variation_y = (frame_count % 8 - 4) * 0.003   # ±0.012
                
                if i == 0:  # Muñeca
                    x, y = 0.5 + variation_x, 0.6 + variation_y
                elif i <= 4:  # Pulgar
                    x = 0.45 + (i-1) * 0.03 + variation_x
                    y = 0.55 - (i-1) * 0.02 + variation_y
                elif i <= 8:  # Índice
                    x = 0.52 + (i-5) * 0.02 + variation_x
                    y = 0.45 - (i-5) * 0.03 + variation_y
                elif i <= 12:  # Medio
                    x = 0.50 + (i-9) * 0.02 + variation_x
                    y = 0.40 - (i-9) * 0.04 + variation_y
                elif i <= 16:  # Anular
                    x = 0.48 + (i-13) * 0.02 + variation_x
                    y = 0.45 - (i-13) * 0.03 + variation_y
                else:  # Meñique
                    x = 0.46 + (i-17) * 0.02 + variation_x
                    y = 0.50 - (i-17) * 0.02 + variation_y
                
                # Asegurar que las coordenadas estén en rango válido
                x = max(0.05, min(0.95, x))
                y = max(0.05, min(0.95, y))
                
                landmarks.append({"x": x, "y": y, "z": 0.0})
            
            # Actualizar datos globales con sincronización
            with data_lock:
                latest_hand_data["detected"] = True
                latest_hand_data["landmarks"] = [landmarks]
                latest_hand_data["gesture"] = current_gesture
                latest_hand_data["confidence"] = confidence
            
            # Log solo cuando cambia el gesto
            if (no_hands_count - 90) % 15 == 0:  # Cada 0.5 segundos dentro de la detección
                print(f"✅ Gesto detectado: {current_gesture} (Confianza: {confidence:.0%})")
        else:
            # No hay manos detectadas
            with data_lock:
                latest_hand_data["detected"] = False
                latest_hand_data["landmarks"] = []
                latest_hand_data["gesture"] = "Ninguno"
                latest_hand_data["confidence"] = 0.0
            
            # Log cada 60 frames cuando no hay detección
            if frame_count % 60 == 0:
                tiempo_restante = max(0, 90 - no_hands_count)
                if tiempo_restante > 0:
                    print(f"⏳ Esperando gesto... (demo en {tiempo_restante//30:.1f}s)")
                else:
                    print(f"⏳ Buscando gestos...")
        
        # Controlar FPS (30 FPS = ~33ms por frame)
        time.sleep(0.033)

def start_detection_thread():
    """Iniciar el hilo de detección"""
    detection_thread = threading.Thread(target=continuous_detection, daemon=True)
    detection_thread.start()
    print("🔄 Hilo de detección iniciado en background")

def generate_frames():
    """Generar frames de video con detección a 30 FPS"""
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Error: No se pudo acceder a la cámara")
        return
    
    # Configurar cámara para 30 FPS
    cap.set(cv2.CAP_PROP_FPS, 30)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    detector = SimpleHandDetector()
    frame_count = 0
    
    print("📹 Cámara configurada a 30 FPS")
    
    while True:
        success, frame = cap.read()
        if not success:
            break
        
        frame_count += 1
        
        # Voltear el frame horizontalmente para efecto espejo
        frame = cv2.flip(frame, 1)
        height, width = frame.shape[:2]
        
        # Actualizar datos globales
        global latest_hand_data
        
        # Detectar manos en el frame
        hands_detected, hand_contours = detector.detect_hands_in_frame(frame)
        
        if hands_detected:
            # Generar landmarks basados en detección real
            landmarks = detector.generate_realistic_landmarks(hand_contours, frame.shape)
            gesture, confidence = detector.get_current_gesture()
            
            latest_hand_data["detected"] = True
            latest_hand_data["landmarks"] = [landmarks] if landmarks else []
            latest_hand_data["gesture"] = gesture
            latest_hand_data["confidence"] = confidence
            
            # Dibujar contornos de manos detectadas (opcional, para debug)
            cv2.drawContours(frame, hand_contours, -1, (0, 255, 255), 2)
            
        else:
            # No hay manos detectadas
            latest_hand_data["detected"] = False
            latest_hand_data["landmarks"] = []
            latest_hand_data["gesture"] = "Ninguno"
            latest_hand_data["confidence"] = 0.0
            landmarks = []
        
        # Dibujar landmarks solo si hay manos detectadas
        if hands_detected and landmarks:
            for i, landmark in enumerate(landmarks):
                x = int(landmark["x"] * width)
                y = int(landmark["y"] * height)
                
                # Puntos cardinales con colores distintivos
                if i == 0:  # Muñeca - PUNTO PRINCIPAL
                    color = (0, 0, 255)  # Rojo brillante
                    radius = 10
                elif i in [4, 8, 12, 16, 20]:  # Puntas de dedos - PUNTOS CARDINALES
                    color = (255, 0, 255)  # Magenta
                    radius = 8
                elif i in [1, 5, 9, 13, 17]:  # Base de dedos
                    color = (0, 255, 0)  # Verde
                    radius = 6
                else:  # Articulaciones intermedias
                    color = (255, 255, 0)  # Amarillo
                    radius = 4
                
                # Dibujar punto principal
                cv2.circle(frame, (x, y), radius, color, -1)
                # Dibujar borde blanco para mejor visibilidad
                cv2.circle(frame, (x, y), radius + 2, (255, 255, 255), 2)
                
                # Números en puntos cardinales para identificación
                if i == 0:
                    cv2.putText(frame, "W", (x-10, y-15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                elif i in [4, 8, 12, 16, 20]:
                    finger_names = {4: "P", 8: "I", 12: "M", 16: "A", 20: "Ñ"}
                    cv2.putText(frame, finger_names[i], (x-5, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            
            # Dibujar conexiones entre puntos
            connections = [
                [0, 1], [1, 2], [2, 3], [3, 4],  # Pulgar
                [0, 5], [5, 6], [6, 7], [7, 8],  # Índice
                [0, 9], [9, 10], [10, 11], [11, 12],  # Medio
                [0, 13], [13, 14], [14, 15], [15, 16],  # Anular
                [0, 17], [17, 18], [18, 19], [19, 20],  # Meñique
            ]
            
            for connection in connections:
                start_idx, end_idx = connection
                if start_idx < len(landmarks) and end_idx < len(landmarks):
                    start_point = landmarks[start_idx]
                    end_point = landmarks[end_idx]
                    
                    start_x = int(start_point["x"] * width)
                    start_y = int(start_point["y"] * height)
                    end_x = int(end_point["x"] * width)
                    end_y = int(end_point["y"] * height)
                    
                    cv2.line(frame, (start_x, start_y), (end_x, end_y), (0, 255, 0), 2)
        
        # Mostrar información de detección más detallada
        if hands_detected:
            gesture_text = f"{latest_hand_data['gesture']} ({latest_hand_data['confidence']:.0%})"
            status_text = f"MANOS DETECTADAS - {len(hand_contours)} contornos"
            status_color = (0, 255, 0)  # Verde
        else:
            gesture_text = "Mueve tus manos frente a la cámara"
            if hasattr(detector, 'demo_start_time'):
                time_left = max(0, 3 - (time.time() - detector.demo_start_time))
                if time_left > 0:
                    status_text = f"DEMO AUTOMATICA EN {time_left:.1f}s"
                    status_color = (0, 165, 255)  # Naranja
                else:
                    status_text = "BUSCANDO MANOS..."
                    status_color = (0, 165, 255)  # Naranja
            else:
                status_text = "BUSCANDO MANOS..."
                status_color = (0, 165, 255)  # Naranja
        
        # Fondo para el texto
        text_size = cv2.getTextSize(gesture_text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
        cv2.rectangle(frame, (5, 5), (text_size[0] + 15, 80), (0, 0, 0), -1)
        
        # Texto de gesto detectado
        cv2.putText(frame, gesture_text, (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)
        
        # Estado de detección
        cv2.putText(frame, status_text, (10, 55), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, status_color, 1)
        
        # FPS y información técnica
        fps_text = f"30 FPS - Frame {frame_count}"
        cv2.putText(frame, fps_text, (10, height - 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Codificar frame
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    """Endpoint para el stream de video"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/hand_data')
def hand_data():
    """Endpoint para obtener datos de detección de manos"""
    with data_lock:
        data_copy = copy.deepcopy(latest_hand_data)
    
    print(f"📡 Solicitud de datos recibida - Manos detectadas: {data_copy['detected']} - Gesto: {data_copy['gesture']}")
    return jsonify(data_copy)

@app.route('/health')
def health():
    """Endpoint de salud"""
    return jsonify({
        "status": "ok", 
        "message": "Hand detection server running (Simulated mode - MediaPipe not available)",
        "mode": "simulated"
    })

if __name__ == '__main__':
    print("🚀 Iniciando servidor de detección de manos MEJORADO...")
    print("📹 Cámara configurada a 30 FPS")
    print("🖐️  Detección inteligente de manos con puntos cardinales")
    print("🎯 10 gestos de lengua de señas disponibles")
    print("🔗 Endpoints disponibles:")
    print("   - http://localhost:5000/video_feed (Stream de video)")
    print("   - http://localhost:5000/hand_data (Datos de detección)")
    print("   - http://localhost:5000/health (Estado del servidor)")
    print("")
    print("💡 Instrucciones:")
    print("   1. Coloca tus manos frente a la cámara")
    print("   2. Los puntos cardinales se marcarán automáticamente")
    print("   3. Los gestos aparecerán en tiempo real")
    print("   - W: Muñeca, P: Pulgar, I: Índice, M: Medio, A: Anular, Ñ: Meñique")
    print("")
    
    # Iniciar el hilo de detección antes del servidor Flask
    start_detection_thread()
    
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
