# Portfolio — plan de ejecución

Actualizado: 2026-09-30. Documento interno; no renderizar en el portfolio.

## Fase 1 — cerrada

- [x] Contenido alineado con el CV y afirmaciones sin evidencia retiradas.
- [x] Contacto sin promesa de envío de emails.
- [x] Validación, smoke test y push confirmados en el cierre anterior: `4b402db`.

## Fases 2 + 3 — ejecución conjunta

Objetivo: mejorar los casos con el material disponible, sin pedir nuevos aportes a Lia.

### Decisiones aprobadas

1. Cookie Classification: revisión humana y origen de sugerencias.
2. Enterprise Systems: reglas heredadas, niveles y excepciones.
3. illow — Brand to Product: resolución de conflictos.
4. illow — Brand System: reutilización entre canales.

Integrar el contexto útil del caso general de illow y retirar su tarjeta duplicada.
No crear Entity Experience. No modificar Papelito, CV, contacto ni backend.
Mantener el contenido público en inglés y la estética actual.

### Reglas de veracidad

- El CV es la fuente profesional aceptada; la narrativa previa no es evidencia independiente.
- No inventar métricas, investigación, citas, autoría, permisos ni estado de lanzamiento.
- Una demo o diagrama explica una interacción; no demuestra implementación histórica.
- Etiquetar visuales generadas también en las tarjetas.
- Omitir información sin respaldo o formularla como intención de diseño.
- Conservar referencias útiles sin presentarlas como capturas aprobadas.

### Estructura

Resumen → contexto y contribución → restricciones → decisiones → demostración visual
→ resultado de diseño → qué validar después.

### Implementación

- [x] Consolidar cuatro casos y eliminar repetición.
- [x] Revisar atribución, resultados y estado de entrega sin afirmar implementación.
- [x] Crear visuales locales coherentes con cada caso.
- [x] Mantener el prototipo externo de cookies como complemento opcional.
- [x] Separar recursos existentes de material ilustrativo.
- [x] Actualizar el registro de fuentes y limitaciones.
- [x] Revisar los archivos modificados y sus referencias.
- [ ] Ejecutar y confirmar lint, build y pruebas disponibles.
- [ ] Commit y push sin forzar; comparar local y remoto.

### Instrucción de ejecución

Ejecutar sin aprobaciones intermedias. Ante información faltante, omitir, reformular
como intención o generar una explicación claramente identificada. No ampliar el
alcance ni agregar dependencias. No asumir que una prueba o comando se ejecutó.

## Fase 4 — revisión integral posterior

- [ ] Revisar todo el sitio visualmente en desktop y móvil.
- [ ] Auditar navegación, teclado, foco, contraste y movimiento reducido.
- [ ] Revisar recursos, enlaces y descarga del CV.
- [ ] Evaluar envío real del contacto solo si se decide ampliar su alcance.

## Fase 5 — publicación y comprobación pública

- [ ] Confirmar despliegue del nuevo commit en el dominio público.
- [ ] Revisar los cuatro casos publicados en navegador.
- [ ] Registrar pendientes no bloqueantes.

## Criterios de cierre de fases 2 + 3

Cuatro casos diferenciados; decisiones y visuales coherentes; ningún impacto
inventado; material generado identificado; recursos externos no bloqueantes;
validaciones y límites registrados. Git y despliegue se confirman por separado.

## Estado de esta ejecución

- Código y documentos revisados por lectura y búsqueda de referencias.
- HTML alternativo y datos estructurados alineados con los cuatro casos de React.
- Pruebas añadidas: estructura de casos, estados de las demos, renderizado React
  y smoke HTTP del build/CV en un puerto libre.
- La terminal integrada no produce salida ni archivos de resultados observables.
  Por tanto, lint, build, pruebas, commit y push de este cambio siguen sin confirmar.
- No hay una herramienta de navegador disponible para validar visualmente desktop,
  móvil, foco o interacción real; esa revisión permanece en fase 4.
- Cierre preparado en `/Users/liangely/holis/scripts/close-phases23.sh`:
  valida antes de publicar, no fuerza el push y compara hashes con GitHub.