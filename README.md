# 🌟 Colmi - Red Social con IA

Red social innovadora que combina funcionalidades tradicionales con tecnología de inteligencia artificial avanzada para reconocimiento de gestos en tiempo real.

## ✨ Características

- **Red Social Completa**: Perfiles de usuario, conexiones, publicaciones y mensajería
- **Tecnología IA**: Videollamadas con reconocimiento de gestos en tiempo real
- **Demo Interactiva**: Prueba la detección de manos directamente en el navegador
- **Multiplataforma**: Disponible en web y dispositivos móviles
- **Diseño Minimalista**: Interfaz limpia y moderna

## 🚀 Inicio Rápido

### 1. Iniciar el servidor de detección de manos
```bash
.\start_server.bat
```

### 2. Abrir la aplicación web
- Abre `index.html` en tu navegador
- Navega a la sección "Demo"
- Haz clic en "📹 Activar Cámara para Demo"

## 🎯 Demo de Detección de Gestos

La demo incluye:
- ✅ 10 gestos reconocidos automáticamente
- ✅ Video en tiempo real con landmarks de manos
- ✅ Interfaz de videollamada realista
- ✅ API REST para integración

### Gestos disponibles:
1. Hola
2. Adiós  
3. Gracias
4. Por favor
5. Sí
6. No
7. Ayuda
8. Amor
9. Familia
10. Amigo

## 🔧 Tecnologías

### Frontend
- HTML5 semántico
- CSS3 con variables personalizadas y Grid/Flexbox
- JavaScript vanilla para interactividad
- Google Fonts (Inter) para tipografía

### Backend
- Python Flask para API
- OpenCV para procesamiento de video
- Detección de manos simulada (compatible con MediaPipe)
- CORS habilitado para frontend

## � Estructura del Proyecto

```
colmi/
├── index.html                    # Página principal
├── hand_detection_simple.py     # Servidor Flask
├── start_server.bat            # Script de inicio
├── assets/                     # Imágenes y logos
├── css/                        # Estilos CSS
├── js/
│   ├── script.js              # JavaScript principal
│   └── hand-detection.js      # Lógica de detección
├── gestos-env/                # Entorno virtual Python
└── README_DEMO_INTEGRADO.md   # Documentación detallada
```

## 🌐 API Endpoints

- `GET /health` - Estado del servidor
- `GET /hand_data` - Datos de detección en JSON
- `GET /video_feed` - Stream de video con landmarks

## 🎨 Paleta de Colores

- Primario: #6366f1 (Índigo)
- Secundario: #10b981 (Esmeralda)  
- Texto: #1f2937 (Gris oscuro)
- Fondo: #ffffff (Blanco)

## 📖 Documentación Adicional

Para información detallada sobre la demo y funcionalidades avanzadas, consulta `README_DEMO_INTEGRADO.md`.

## 🌟 Estado del Proyecto

✅ **Demo funcional** - Lista para presentaciones
✅ **Backend integrado** - Servidor Flask operativo  
✅ **Frontend responsivo** - Compatible con todos los dispositivos
✅ **API documentada** - Endpoints listos para integración

---
*Creado con ❤️ para revolucionar las comunicaciones digitales*
└── README.md
```

## 🎨 Diseño

El sitio web presenta un diseño minimalista y moderno con:

- **Paleta de Colores**: Índigo (#6366f1) como color primario y esmeralda (#10b981) como acento
- **Tipografía**: Inter para una legibilidad óptima
- **Responsive Design**: Adaptado para todos los dispositivos
- **Animaciones Sutiles**: Mejoran la experiencia de usuario sin ser intrusivas

## 📱 Secciones

1. **Hero**: Presentación principal con mockup de la aplicación
2. **Características**: Grid de 6 características principales
3. **Tecnología**: Demostración visual del reconocimiento de gestos
4. **Contacto**: Llamadas a la acción para descargar la app
5. **Footer**: Enlaces adicionales y información legal

## 🚀 Cómo Usar

1. Abre `index.html` en tu navegador web
2. El sitio es completamente funcional sin necesidad de servidor
3. Para desarrollo, puedes usar cualquier servidor local como Live Server de VS Code

## ✨ Características Técnicas

- **Performance**: Código optimizado para carga rápida
- **SEO Ready**: Meta tags y estructura preparada para motores de búsqueda
- **Accesibilidad**: Cumple con estándares WCAG
- **Interactividad**: Navegación suave, efectos hover y animaciones de entrada

## 📧 Contacto

Para más información sobre Colmi, visita la sección de contacto en el sitio web.

---

*Colmi - Conectando el futuro social* 🤝✨
