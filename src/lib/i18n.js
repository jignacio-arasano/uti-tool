// i18n minimalista
// Cargamos los strings que cambian entre regiones / idiomas

const idiomas = {
  'es-AR': {
    app: { nombre: 'ICU Copilot', tagline: 'Asistente clínico de UTI' },
    tabs: {
      apache: 'APACHE II',
      sofa: 'SOFA / qSOFA',
      otros: 'Otros scores',
      vaso: 'Vasopresores',
      balance: 'Balance',
      evol: 'Evolución',
      utiles: 'Útiles',
      historial: 'Historial'
    },
    botones: {
      siguiente: 'Siguiente',
      atras: 'Atrás',
      copiar: 'Copiar al portapapeles',
      copiado: 'Copiado',
      generar: 'Generar',
      calcular: 'Calcular',
      nuevo: 'Nuevo',
      guardar: 'Guardar',
      eliminar: 'Eliminar',
      cancelar: 'Cancelar',
      confirmar: 'Confirmar'
    },
    unidades: {
      lpm: 'lpm', rpm: 'rpm', mmHg: 'mmHg', anos: 'años', kg: 'kg',
      mlh: 'mL/h', mlkgmin: 'mcg/kg/min'
    }
  },
  'es-ES': {
    app: { nombre: 'ICU Copilot', tagline: 'Asistente clínico de UCI' },
    tabs: {
      apache: 'APACHE II',
      sofa: 'SOFA / qSOFA',
      otros: 'Otros scores',
      vaso: 'Vasoactivos',
      balance: 'Balance',
      evol: 'Evolución',
      utiles: 'Útiles',
      historial: 'Historial'
    },
    botones: {
      siguiente: 'Siguiente',
      atras: 'Atrás',
      copiar: 'Copiar al portapapeles',
      copiado: 'Copiado',
      generar: 'Generar',
      calcular: 'Calcular',
      nuevo: 'Nuevo',
      guardar: 'Guardar',
      eliminar: 'Eliminar',
      cancelar: 'Cancelar',
      confirmar: 'Confirmar'
    },
    unidades: {
      lpm: 'lpm', rpm: 'rpm', mmHg: 'mmHg', anos: 'años', kg: 'kg',
      mlh: 'mL/h', mlkgmin: 'µg/kg/min'
    }
  }
}

let idiomaActual = 'es-AR'

export function setIdioma(id) {
  if (idiomas[id]) {
    idiomaActual = id
    localStorage.setItem('idioma', id)
  }
}

export function getIdioma() {
  return localStorage.getItem('idioma') || idiomaActual
}

export function t(path) {
  const parts = path.split('.')
  let v = idiomas[getIdioma()]
  for (const p of parts) {
    v = v?.[p]
    if (v === undefined) return path
  }
  return v
}

export const idiomasDisponibles = [
  { id: 'es-AR', label: 'Español (Argentina)' },
  { id: 'es-ES', label: 'Español (España)' }
]
