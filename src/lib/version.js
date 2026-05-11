// Información de versión clínica
// Cada cambio en lógica de scoring o reglas debe incrementar la versión

export const VERSION = {
  app: '2.0.0',
  fechaBuild: '2026-05-06',
  scores: {
    apache2: { version: '1.0.0', referencia: 'Knaus et al. 1985' },
    sofa: { version: '1.0.0', referencia: 'Vincent et al. 1996' },
    qsofa: { version: '1.0.0', referencia: 'Singer et al. 2016 (Sepsis-3)' },
    news2: { version: '1.0.0', referencia: 'Royal College of Physicians 2017' },
    curb65: { version: '1.0.0', referencia: 'Lim et al. 2003' },
    wells: { version: '1.0.0', referencia: 'Wells et al. 2000' },
    glasgow: { version: '1.0.0', referencia: 'Teasdale & Jennett 1974' }
  },
  ultimoCambio: 'Adición de SOFA, qSOFA, NEWS2, CURB-65, Wells, GCS detallado, índices derivados, validación de rangos, conversor de unidades, antibióticos empíricos, calculadora de balance hídrico, historial de sesión y modo experto.'
}

// === Historial de sesión ===
// Guardamos los últimos N cálculos en sessionStorage
// Se borra al cerrar la pestaña (intencional)

const KEY_HISTORIAL = 'icu_historial_sesion'
const MAX_HISTORIAL = 20

export function guardarHistorial(entrada) {
  try {
    const actual = JSON.parse(sessionStorage.getItem(KEY_HISTORIAL) || '[]')
    const nueva = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...entrada
    }
    actual.unshift(nueva)
    const limitado = actual.slice(0, MAX_HISTORIAL)
    sessionStorage.setItem(KEY_HISTORIAL, JSON.stringify(limitado))
    return nueva
  } catch (err) {
    console.error('Error guardando historial:', err)
    return null
  }
}

export function obtenerHistorial() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY_HISTORIAL) || '[]')
  } catch {
    return []
  }
}

export function eliminarDelHistorial(id) {
  try {
    const actual = obtenerHistorial()
    const filtrado = actual.filter(e => e.id !== id)
    sessionStorage.setItem(KEY_HISTORIAL, JSON.stringify(filtrado))
  } catch (err) {
    console.error(err)
  }
}

export function limpiarHistorial() {
  sessionStorage.removeItem(KEY_HISTORIAL)
}

// Generar identificador de cálculo (para auditoría / versionado)
export function generarIdCalculo(tipoScore, score) {
  return {
    score: tipoScore,
    valor: score,
    versionScore: VERSION.scores[tipoScore]?.version || '?',
    versionApp: VERSION.app,
    timestamp: new Date().toISOString()
  }
}
