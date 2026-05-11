// Conversor de unidades médicas comunes

export const conversiones = {
  creatinina: {
    // 1 mg/dL = 88.4 μmol/L
    'mg/dL → μmol/L': v => (Number(v) * 88.4).toFixed(0),
    'μmol/L → mg/dL': v => (Number(v) / 88.4).toFixed(2)
  },
  urea: {
    // 1 mmol/L = 6.0 mg/dL (BUN)
    // Urea (mg/dL) = BUN (mg/dL) × 2.14
    'mmol/L → mg/dL (urea)': v => (Number(v) * 6).toFixed(0),
    'mg/dL → mmol/L': v => (Number(v) / 6).toFixed(2),
    'BUN (mg/dL) → urea (mg/dL)': v => (Number(v) * 2.14).toFixed(0)
  },
  glucemia: {
    // 1 mmol/L = 18 mg/dL
    'mg/dL → mmol/L': v => (Number(v) / 18).toFixed(1),
    'mmol/L → mg/dL': v => (Number(v) * 18).toFixed(0)
  },
  lactato: {
    // 1 mmol/L = 9 mg/dL
    'mg/dL → mmol/L': v => (Number(v) / 9).toFixed(1),
    'mmol/L → mg/dL': v => (Number(v) * 9).toFixed(0)
  },
  bilirrubina: {
    // 1 mg/dL = 17.1 μmol/L
    'mg/dL → μmol/L': v => (Number(v) * 17.1).toFixed(0),
    'μmol/L → mg/dL': v => (Number(v) / 17.1).toFixed(2)
  },
  calcio: {
    'mg/dL → mmol/L': v => (Number(v) / 4).toFixed(2),
    'mmol/L → mg/dL': v => (Number(v) * 4).toFixed(2)
  },
  hemoglobina: {
    'g/dL → g/L': v => (Number(v) * 10).toFixed(0),
    'g/L → g/dL': v => (Number(v) / 10).toFixed(1)
  },
  temperatura: {
    '°C → °F': v => ((Number(v) * 9/5) + 32).toFixed(1),
    '°F → °C': v => ((Number(v) - 32) * 5/9).toFixed(1)
  },
  peso: {
    'kg → lb': v => (Number(v) * 2.205).toFixed(1),
    'lb → kg': v => (Number(v) / 2.205).toFixed(1)
  }
}

// Catálogo de unidades para mostrar en UI
export const catalogoConversores = [
  { id: 'creatinina', label: 'Creatinina', conversiones: ['mg/dL → μmol/L', 'μmol/L → mg/dL'] },
  { id: 'urea', label: 'Urea / BUN', conversiones: ['mmol/L → mg/dL (urea)', 'mg/dL → mmol/L', 'BUN (mg/dL) → urea (mg/dL)'] },
  { id: 'glucemia', label: 'Glucemia', conversiones: ['mg/dL → mmol/L', 'mmol/L → mg/dL'] },
  { id: 'lactato', label: 'Lactato', conversiones: ['mg/dL → mmol/L', 'mmol/L → mg/dL'] },
  { id: 'bilirrubina', label: 'Bilirrubina', conversiones: ['mg/dL → μmol/L', 'μmol/L → mg/dL'] },
  { id: 'calcio', label: 'Calcio', conversiones: ['mg/dL → mmol/L', 'mmol/L → mg/dL'] },
  { id: 'hemoglobina', label: 'Hemoglobina', conversiones: ['g/dL → g/L', 'g/L → g/dL'] },
  { id: 'temperatura', label: 'Temperatura', conversiones: ['°C → °F', '°F → °C'] },
  { id: 'peso', label: 'Peso', conversiones: ['kg → lb', 'lb → kg'] }
]

export function convertir(categoria, tipoConversion, valor) {
  const fn = conversiones[categoria]?.[tipoConversion]
  if (!fn) return null
  try {
    return fn(valor)
  } catch {
    return null
  }
}
