// Funcionalidad del menú móvil
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Cerrar menú al hacer click en un enlace
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
});

// Scroll suave para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = 80;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Efectos de scroll para el header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.borderBottom = '1px solid rgba(229, 231, 235, 0.8)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.borderBottom = '1px solid #e5e7eb';
    }
});

// Animaciones de entrada para las tarjetas de características
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar las tarjetas de características
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Efectos para los botones
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Simulación de funcionalidad para los botones de descarga
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', function(e) {
        if (this.textContent.includes('Descargar')) {
            e.preventDefault();
            
            // Crear un elemento de notificación
            const notification = document.createElement('div');
            notification.textContent = 'Colmi estará disponible próximamente';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #6366f1;
                color: white;
                padding: 1rem 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            
            // Agregar la animación CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(notification);
            
            // Remover la notificación después de 3 segundos
            setTimeout(() => {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    document.body.removeChild(notification);
                    document.head.removeChild(style);
                }, 300);
            }, 3000);
        }
    });
});

// Efectos de partículas para el fondo del hero (opcional)
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        hero.appendChild(particle);
    }
    
    // Agregar la animación de flotación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
    `;
    document.head.appendChild(style);
}

// Inicializar partículas cuando la página esté cargada
document.addEventListener('DOMContentLoaded', createParticles);

// Funcionalidad para mostrar/ocultar el menú móvil con animación
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu {
            transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .nav-menu {
                position: fixed;
                top: 80px;
                left: -100%;
                width: 100%;
                height: calc(100vh - 80px);
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(10px);
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                padding-top: 2rem;
                transition: left 0.3s ease;
            }
            
            .nav-menu.active {
                left: 0;
            }
            
            .nav-menu li {
                margin: 1rem 0;
            }
            
            .nav-toggle.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .nav-toggle.active span:nth-child(2) {
                opacity: 0;
            }
            
            .nav-toggle.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }
        }
    `;
    document.head.appendChild(style);
});

// Funcionalidad de la Demo Interactiva
document.addEventListener('DOMContentLoaded', function() {
    // Palabras que la demo puede reconocer
    const recognizedWords = [
        'Hola', 'Adiós', 'Gracias', 'Por favor', 'Sí', 
        'No', 'Ayuda', 'Amor', 'Familia', 'Amigo'
    ];
    
    let currentWordIndex = 0;
    const detectedWordElement = document.getElementById('detectedWord');
    const confidenceLevelElement = document.getElementById('confidenceLevel');
    const wordTags = document.querySelectorAll('.word-tag');
    
    // Función para cambiar la palabra detectada
    function changeDetectedWord() {
        if (detectedWordElement && confidenceLevelElement && wordTags.length > 0) {
            // Remover clase active de todas las palabras
            wordTags.forEach(tag => tag.classList.remove('active'));
            
            // Actualizar palabra detectada
            const newWord = recognizedWords[currentWordIndex];
            detectedWordElement.textContent = newWord;
            
            // Simular nivel de confianza aleatorio entre 85% y 98%
            const confidence = Math.floor(Math.random() * 13) + 85;
            confidenceLevelElement.textContent = confidence + '%';
            
            // Activar la palabra correspondiente en las etiquetas
            const matchingTag = Array.from(wordTags).find(tag => tag.textContent === newWord);
            if (matchingTag) {
                matchingTag.classList.add('active');
            }
            
            // Avanzar al siguiente índice
            currentWordIndex = (currentWordIndex + 1) % recognizedWords.length;
        }
    }
    
    // Cambiar palabra cada 4 segundos
    setInterval(changeDetectedWord, 4000);
    
    // Funcionalidad de los controles de video
    const controlButtons = document.querySelectorAll('.control-btn');
    
    controlButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Agregar efecto visual al hacer click
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Simular funcionalidad según el tipo de botón
            if (this.classList.contains('mute-btn')) {
                this.style.background = this.style.background === 'rgb(239, 68, 68)' ? 
                    'rgba(255, 255, 255, 0.1)' : '#ef4444';
            } else if (this.classList.contains('camera-btn')) {
                this.style.background = this.style.background === 'rgb(239, 68, 68)' ? 
                    'rgba(255, 255, 255, 0.1)' : '#ef4444';
            } else if (this.classList.contains('end-btn')) {
                // Simular finalizar llamada
                showNotification('Llamada finalizada', 'success');
            } else if (this.classList.contains('settings-btn')) {
                showNotification('Configuración abierta', 'info');
            }
        });
    });
    
    // Interactividad con las palabras aprendidas
    wordTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const word = this.textContent;
            
            // Remover clase active de todas las palabras
            wordTags.forEach(t => t.classList.remove('active'));
            
            // Activar la palabra clickeada
            this.classList.add('active');
            
            // Actualizar la palabra detectada
            if (detectedWordElement) {
                detectedWordElement.textContent = word;
            }
            
            // Simular nueva confianza
            if (confidenceLevelElement) {
                const confidence = Math.floor(Math.random() * 13) + 85;
                confidenceLevelElement.textContent = confidence + '%';
            }
            
            // Mostrar notificación
            showNotification(`Gesto "${word}" seleccionado`, 'success');
        });
    });
    
    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        
        const colors = {
            success: '#10b981',
            info: '#3b82f6',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInNotification 0.3s ease;
            font-weight: 500;
            max-width: 300px;
        `;
        
        // Agregar animación CSS si no existe
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInNotification {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutNotification {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remover la notificación después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutNotification 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Animación de estadísticas
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.animation = 'pulse 0.6s ease';
            }, index * 200);
        });
    }
    
    // Observar cuando la sección demo entra en vista
    const demoSection = document.querySelector('.demo');
    if (demoSection) {
        const demoObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(animateStats, 500);
                    demoObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        demoObserver.observe(demoSection);
    }
    
    // Agregar animación pulse si no existe
    if (!document.querySelector('#pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
});
