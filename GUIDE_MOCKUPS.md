# Guía de Modificación y Adición de Experiencias (Mockups) 📝🚀

Esta guía explica detalladamente la arquitectura implementada en el repositorio para que puedas editar, duplicar y agregar nuevos casos de estudio ("cards" o experiencias) y personalizar sus respectivas áreas de mockup interactivo directamente en el código.

---

## 1. Arquitectura de las Experiencias

El sistema de visualización de trabajos utiliza una arquitectura desacoplada basada en tres componentes clave del directorio `/src`:

1. **`src/data/useCases.ts`** (La fuente de datos):
   * Contiene un array de objetos JSON con la información textual completa de cada experiencia (Título, Rol, Reto, Resultados, Tags, Ícono, etc.).
   * Cada elemento incluye una propiedad clave: `"mockupType"`. El valor de este campo (por ejemplo: `'analytics'`, `'wireframe'`, `'design-tokens'`) define qué simulación visual interactiva se mostrará dentro de la card cuando esta sea expandida por el usuario.

2. **`src/components/ProjectMockups.tsx`** (Las plantillas visuales):
   * Contiene los componentes listos para usar que renderizan interfaces simuladas realistas (paneles de métricas de analítica, esquemas de diseño y tablas de tokens tipográficos/gráficos).

3. **`src/App.tsx`** (El motor de renderizado dinámico):
   * Modula y gestiona selecciones, animación de colapso/expansión y lee automáticamente el valor del campo `mockupType` para renderizar el mockup correspondiente de manera reactiva.

---

## 2. Cómo Copiar y Pegar para Añadir una Nueva Experiencia

No tienes que modificar nada de código de lógica o diseño complejo de `src/App.tsx` para agregar una nueva tarjeta. Todo el flujo está automatizado para que solo tengas que duplicar un objeto dentro de la lista de datos.

### Paso a paso:

1. Abre el archivo **`src/data/useCases.ts`**.
2. Identifica un objeto completo del array (los delimitados por llaves `{ ... }`). por ejemplo:
   ```typescript
   {
     id: "nuevo-proyecto",
     title: "Rediseño de Plataforma Educativa",
     role: "Lead Product Designer",
     challenge: "Resolver el abandono de cursos optimizando la retención...",
     result: "Aumento de un 38% en la finalización de módulos curriculares...",
     tags: ["UX Research", "B2B", "SaaS", "Optimización"],
     icon: "school", // Usa cualquier identificador de Google Material Symbol
     client: "EdTech Corporation",
     date: "Q1 2026",
     impact: [
       { label: "Módulos completados", value: "+38%" },
       { label: "Satisfacción estudiantil", value: "4.9/5" }
     ],
     deepDive: "¿Cómo logramos esto? Diseñamos rutas personalizadas interactivas...",
     mockupType: "analytics" // Elige 'analytics', 'wireframe', o 'design-tokens'
   },
   ```
3. Pega este bloque al final del array (asegúrate de separar cada objeto con una coma `,`).
4. Al guardar el archivo, **la nueva tarjeta aparecerá automáticamente** en la sección de Experiencias de tu portafolio, con todas las animaciones, filtros por tags y la sección expandible completamente listos y funcionales.

---

## 3. Cómo Editar o Crear Nuevos Diseños de Mockups

Si deseas personalizar el contenido simulado o crear un nuevo tipo de interfaz interactiva, debes modificar el archivo **`src/components/ProjectMockups.tsx`**.

Actualmente cuentas con tres tipos por defecto:
* **AnalyticsMockup (`mockupType: 'analytics'`)**: Ideal para proyectos científicos, SaaS financieros o de conversión (gráficos de líneas continuas, barras e informes numéricos).
* **WireframeMockup (`mockupType: 'wireframe'`)**: Ideal para proyectos en fases tempranas, mapas mentales, arquitecturas de información o layouts funcionales (esqueletos limpios, selectores interactivos).
* **DesignTokensMockup (`mockupType: 'design-tokens'`)**: Perfecto para proyectos donde lidiaste con el escalado de sistemas de diseño (paneles tipográficos de Inter, JetBrains Mono y colores estructurados).

### Para añadir un cuarto (4°) tipo de Mockup personalizado:

1. Abre **`src/components/ProjectMockups.tsx`**.
2. Define un nuevo componente funcional en la parte inferior del archivo utilizando clases de Tailwind CSS:
   ```tsx
   export function MobileUiMockup() {
     return (
       <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 space-y-4">
         <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
           <span className="text-xs font-black tracking-widest text-[#be123c]">DEMO MÓVIL</span>
           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
         </div>
         {/* Tu HTML/JSX personalizado con Tailwind */}
         <p className="text-xs text-neutral-400">Inserte aquí la representación gráfica de su experiencia...</p>
       </div>
     );
   }
   ```
3. Asegúrate de exportar este nuevo componente.
4. Abre **`src/App.tsx`**, localiza la función donde se renderizan dinámicamente los mockups (usa buscar en archivo por `ProjectMockups` o busca la importación correspondiente) y agrega la lógica en el puente selector:
   
   Asegúrate de importar tu componente en la cabecera si no está automatizado:
   ```typescript
   import { AnalyticsMockup, WireframeMockup, DesignTokensMockup, MobileUiMockup } from './components/ProjectMockups';
   ```
   Y actualiza la función de mapeo (usualmente llamada dentro de la expansión de detalles del proyecto):
   ```tsx
   const renderMockup = (type?: string) => {
     switch (type) {
       case 'analytics':
         return <AnalyticsMockup />;
       case 'wireframe':
         return <WireframeMockup />;
       case 'design-tokens':
         return <DesignTokensMockup />;
       case 'mobile-ui': // Tu nuevo identificador clave
         return <MobileUiMockup />;
       default:
         return <AnalyticsMockup />;
     }
   };
   ```
5. ¡Listo! Ahora solo vincula cualquier tarjeta en `src/data/useCases.ts` asignándole `"mockupType": "mobile-ui"`.

---

## 4. Flujo de Trabajo Recomendado en GitHub

Para mantener tu repositorio principal limpio y escalable, te recomendamos el siguiente flujo cuando decidas modificar o ampliar tu portafolio:

1. **Crear una rama para cambios de contenido**:
   ```bash
   git checkout -b feature/actualizar-portafolio
   ```
2. **Realizar modificaciones**:
   * Agrega tus experiencias en `src/data/useCases.ts`.
   * Agrega o edita las vistas en `src/components/ProjectMockups.tsx`.
3. **Probar localmente**:
   * Asegúrate de compilar y correr el entorno para corroborar que no haya errores de sintaxis TypeScript usando `npm run build`.
4. **Hacer commit y subir a GitHub**:
   ```bash
   git add .
   git commit -m "feat: agregar nuevas experiencias de diseño y refinar mockups"
   git push origin feature/actualizar-portafolio
   ```
5. **Crear un Pull Request**: Integra los cambios en la rama `main` y observa cómo se actualiza tu portafolio de producción de manera impecable.
