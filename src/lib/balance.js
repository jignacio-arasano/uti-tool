// Calculadora de balance hídrico
// Suma ingresos y egresos, calcula balance neto y por categoría

export const categoriasBalance = {
  ingresos: [
    { id: 'cristaloides', label: 'Cristaloides (SF, Ringer)', factor: 1 },
    { id: 'coloides', label: 'Coloides (albúmina)', factor: 1 },
    { id: 'transfusiones', label: 'Hemoderivados', factor: 1 },
    { id: 'drogas', label: 'Drogas IV (vasoactivas, sedación)', factor: 1 },
    { id: 'nutricion', label: 'Nutrición (enteral/parenteral)', factor: 1 },
    { id: 'oral', label: 'Vía oral / SNG', factor: 1 },
    { id: 'agua_metabolica', label: 'Agua metabólica (~300ml/día)', factor: 1, sugerido: 300 }
  ],
  egresos: [
    { id: 'diuresis', label: 'Diuresis', factor: 1 },
    { id: 'sng', label: 'SNG / Vómitos', factor: 1 },
    { id: 'drenajes', label: 'Drenajes', factor: 1 },
    { id: 'sangrado', label: 'Sangrado', factor: 1 },
    { id: 'deposiciones', label: 'Deposiciones / diarrea', factor: 1 },
    { id: 'insensibles', label: 'Pérdidas insensibles (~600-900ml/día)', factor: 1, sugerido: 700 },
    { id: 'fiebre', label: 'Pérdidas por fiebre (10% por °C >37)', factor: 1 }
  ]
}

export function calcularBalance(ingresos, egresos) {
  const totalIngresos = Object.values(ingresos)
    .map(v => Number(v) || 0)
    .reduce((a, b) => a + b, 0)
  
  const totalEgresos = Object.values(egresos)
    .map(v => Number(v) || 0)
    .reduce((a, b) => a + b, 0)
  
  const balance = totalIngresos - totalEgresos
  
  let interpretacion
  if (Math.abs(balance) < 500) {
    interpretacion = 'Balance neutro/equilibrado'
  } else if (balance > 2000) {
    interpretacion = 'Balance muy positivo. Considerar restricción / diurético si congestión.'
  } else if (balance > 1000) {
    interpretacion = 'Balance positivo significativo. Vigilar signos de sobrecarga.'
  } else if (balance < -2000) {
    interpretacion = 'Balance muy negativo. Vigilar hipovolemia / hipoperfusión.'
  } else if (balance < -1000) {
    interpretacion = 'Balance negativo significativo.'
  } else {
    interpretacion = 'Balance ligeramente desviado.'
  }
  
  return {
    totalIngresos,
    totalEgresos,
    balance,
    interpretacion,
    signo: balance >= 0 ? '+' : ''
  }
}

// Estimación de pérdidas insensibles según peso
export function perdidasInsensibles(peso, temperaturaMaxima = 37, horasFiebre = 0) {
  const base = Number(peso) * 12  // ~12 ml/kg/día
  const fiebre = temperaturaMaxima > 37 
    ? base * 0.1 * (temperaturaMaxima - 37) * (horasFiebre / 24)
    : 0
  return Math.round(base + fiebre)
}
