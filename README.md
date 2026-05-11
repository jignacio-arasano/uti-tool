# ICU Copilot v2.0

Asistente clínico web para UTI: scores de gravedad, cálculo de infusiones, balance hídrico, evolución SOAP, dictado por voz y OCR de monitores. Todo del lado del cliente — sin servidor, sin persistencia entre sesiones, sin datos del paciente que salgan del navegador.

---

## Funcionalidad por pestaña

### 1. APACHE II
Cálculo del score Knaus 1985 con los 12 parámetros fisiológicos + edad + comorbilidades.
- **Modo asistente** — wizard de 7 pasos, ideal para residentes
- **Modo experto** — todos los campos en una sola pantalla, para uso rápido
- **Dictado en bloque** — botón único que abre el micrófono y parsea "FC 90, PAM 72, temperatura 37" rellenando todos los campos a la vez
- Interpretación adaptada por tipo de ingreso (sepsis / neurocrítico / SDRA / postquirúrgico)
- Validación de rangos: alerta si algún valor es fisiológicamente imposible o sospechoso
- Alertas de coherencia: detecta PAM incoherente con TAS/PAD, FiO2 mal escala (% vs decimal), pH/HCO3 incompatibles

### 2. SOFA / qSOFA
Score Sequential Organ Failure Assessment (Vincent 1996), 6 sistemas, 0–24 puntos.
Incluye qSOFA (Sepsis-3) como toggle.

### 3. Otros scores
- **Glasgow detallado** con botones por respuesta (ocular / verbal / motora)
- **NEWS2** — National Early Warning Score
- **CURB-65** — gravedad de neumonía
- **Wells (TEP)** — probabilidad pre-test de tromboembolismo pulmonar

### 4. Vasopresores
Calculadora de infusiones para noradrenalina, adrenalina, dobutamina, dopamina, vasopresina y milrinona. Diluciones estándar editables, slider de dosis, lista de drogas activas con dosis equivalente.

### 5. Balance hídrico
Cuenta ingresos (cristaloides, coloides, hemoderivados, drogas IV, nutrición, agua metabólica) y egresos (diuresis, SNG, drenajes, sangrado, deposiciones, insensibles, fiebre). Interpretación automática del balance neto.

### 6. Evolución SOAP
Genera plantilla SOAP autocompletada con los datos del último APACHE/SOFA cargado. Copiable al portapapeles para pegar en HCE.

### 7. Herramientas
- **Conversor de unidades**: creatinina, urea, glucemia, lactato, bilirrubina, calcio, hemoglobina, temperatura, peso
- **Índices derivados**: PaFi, A-aDO2, índice de shock, driving pressure, BUN, anion gap, calcio corregido, FGe (CKD-EPI)
- **Antibióticos empíricos**: 10 esquemas por foco (sepsis sin foco, sepsis abdominal comunitaria/nosocomial, neumonía CAP/HAP, meningitis, ITU complicada, partes blandas, endocarditis, neutropenia febril)

### 8. OCR de monitor
Toma una foto del monitor (Philips IntelliVue, Dräger, etc.) o sube una imagen. Tesseract.js corre en el navegador, extrae los valores numéricos y los aplica al APACHE/SOFA con un click.

### 9. Historial
Últimos 20 cálculos de la sesión actual (sessionStorage). Cada uno con etiqueta tipo "Cama 7" y timestamp. Se borra al cerrar el navegador. No persiste nada después de la sesión.

---

## Stack técnico

- **React 18** + **Vite 5** (PWA)
- **Web Speech API** (es-AR) con diccionario médico de corrección
- **Tesseract.js 5** cargado por CDN bajo demanda (no infla el bundle inicial)
- **sessionStorage** únicamente — nunca localStorage, nunca cookies, nunca servidor
- **Sin tracking, sin analytics, sin terceros más que CDN de Tesseract**
- 224 KB JS / 69 KB gzipped, build de ~2 segundos

## Privacidad y datos

- Cero datos viajan a un servidor. Todo se calcula en el navegador.
- Cero datos persisten más allá de la pestaña. Cerrar el navegador = todo borrado.
- Sin login, sin cuentas, sin identificación del usuario o del paciente.
- Etiquetas tipo "Cama 7" o "HC 1234" son responsabilidad del médico — se recomienda no usar nombres ni DNI.

## Versionado clínico

Cada cálculo guarda la versión del software (`VERSION` en `src/lib/version.js`) y la fecha. Si se modifica una regla de interpretación, los cálculos antiguos siguen marcados con la versión bajo la que se generaron. Para uso institucional serio, mantener el changelog clínico documentado.

## Accesibilidad

- Etiquetas ARIA (`aria-invalid`, `aria-describedby`, `aria-label`, `aria-pressed`) en inputs y controles
- Outlines visibles con `:focus-visible`
- Respeta `prefers-reduced-motion`
- Contraste verificado en tema oscuro

## i18n

Preparado para múltiples locales en `src/lib/i18n.js`. Por defecto es-AR; agregar es-ES, pt-BR, en-US es cuestión de extender el diccionario.

---

## Cómo correrlo

```bash
npm install
npm run dev       # localhost:5173
npm run build     # produce dist/ listo para deploy
npm run preview   # sirve el build localmente
node tests.js     # 35 tests de lógica clínica
```

## Deploy

`dist/` es estático. Sirve desde Vercel, Netlify, GitHub Pages, S3, o cualquier hosting estático. Funciona offline después de la primera visita (Service Worker registrado por `vite-plugin-pwa`).

## Tests

`tests.js` cubre:
- APACHE II: 6 tests (casos sano/crítico, ajuste por IRA, GCS, comorbilidades, leucocitos absolutos vs relativos)
- Interpretación: 4 tests (rangos, sepsis, fallback)
- Vasopresores: 4 tests (noradrenalina, dobutamina, vasopresina, droga inválida)
- SOFA y qSOFA: 3 tests
- Otros scores: 6 tests (NEWS2, CURB-65, Wells, Glasgow, PaFi, índice de shock)
- Validación: 4 tests (rango fisiológico, coherencia PAM/TAS)
- Conversión de unidades: 3 tests
- Balance hídrico: 2 tests
- Dictado en bloque: 2 tests

**Total: 35 tests, 100% pasando.**

---

## ⚠️ Disclaimer

Herramienta de soporte a la decisión clínica. **No sustituye el juicio médico.** Antes de uso institucional requiere:
- Validación contra cohortes propias
- Aprobación del comité de calidad / farmacia
- Revisión legal según jurisdicción (en Argentina: Ley 26.529; en UE: MDR clase IIa)
- Capacitación de los usuarios
- Plan de versionado y rollback de reglas clínicas

Los autores no se responsabilizan por decisiones tomadas en base a esta herramienta.

## Roadmap futuro

- Integración FHIR con HCE
- Modo offline robusto (Capacitor)
- Telemetría anónima de uso (Plausible/Umami)
- Más scores: SAPS II, MELD, Child-Pugh, FOUR, RASS, CAM-ICU
- Calculadora de TRR y dosis ajustadas a función renal
- Modo entrenamiento con casos clínicos
