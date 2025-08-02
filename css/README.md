# Estructura CSS de Colmi

Este proyecto utiliza una arquitectura CSS modular para mejor mantenibilidad y organización.

## 📁 Estructura de Carpetas

```
css/
├── main.css                    # Archivo principal que importa todos los módulos
├── components/                 # Componentes reutilizables
│   ├── header.css             # Navegación y header
│   ├── buttons.css            # Estilos de botones
│   ├── cards.css              # Tarjetas de características
│   ├── phone-mockup.css       # Mockup del teléfono
│   └── ai-demo.css            # Demostración de IA con mano
├── sections/                   # Secciones específicas de la página
│   ├── hero.css               # Sección principal/hero
│   ├── features.css           # Sección de características
│   ├── technology.css         # Sección de tecnología
│   ├── contact.css            # Sección de contacto
│   └── footer.css             # Footer
└── utils/                      # Utilidades y herramientas
    ├── variables.css          # Variables CSS y reset
    ├── animations.css         # Todas las animaciones
    └── responsive.css         # Media queries y responsive design
```

## 🎯 Beneficios de esta Estructura

### ✅ **Mantenibilidad**
- Cada archivo tiene una responsabilidad específica
- Fácil localizar y modificar estilos específicos
- Cambios aislados que no afectan otros componentes

### ✅ **Escalabilidad**
- Fácil agregar nuevos componentes o secciones
- Arquitectura preparada para crecimiento del proyecto
- Reutilización de componentes

### ✅ **Colaboración**
- Múltiples desarrolladores pueden trabajar sin conflictos
- Estructura clara y predecible
- Código autodocumentado

### ✅ **Performance**
- Carga modular según necesidades
- Fácil optimización y minificación
- Cacheo granular de archivos

## 🔧 Uso

El archivo `main.css` importa todos los módulos en el orden correcto:

1. **Variables y reset** - Base del sistema de diseño
2. **Animaciones** - Keyframes y transiciones
3. **Componentes** - Elementos reutilizables
4. **Secciones** - Layout específico de páginas
5. **Responsive** - Adaptaciones para dispositivos

## 📝 Convenciones

- **Variables CSS**: Definidas en `utils/variables.css`
- **Nomenclatura BEM**: Para clases específicas
- **Mobile-first**: Responsive design desde móvil hacia desktop
- **Comentarios**: Cada archivo inicia con su propósito

## 🚀 Desarrollo

Para agregar nuevos estilos:

1. **Componente nuevo**: Crear archivo en `components/`
2. **Sección nueva**: Crear archivo en `sections/`
3. **Utilidad nueva**: Agregar a `utils/`
4. **Importar**: Actualizar `main.css` con la nueva importación

Esta estructura hace que el CSS sea más profesional, mantenible y escalable.
