// Validación de rangos clínicamente razonables
// Devuelve null si OK, o un objeto con tipo y mensaje si hay problema

export const RANGOS = {
  // Signos vitales
  fc: { min: 20, max: 250, sospechoso: { min: 30, max: 220 }, unidad: 'lpm', label: 'Frecuencia cardíaca' },
  pam: { min: 20, max: 200, sospechoso: { min: 30, max: 180 }, unidad: 'mmHg', label: 'PAM' },
  tas: { min: 40, max: 300, sospechoso: { min: 50, max: 250 }, unidad: 'mmHg', label: 'TAS' },
  pad: { min: 20, max: 200, sospechoso: { min: 30, max: 150 }, unidad: 'mmHg', label: 'PAD' },
  fr: { min: 4, max: 80, sospechoso: { min: 6, max: 60 }, unidad: 'rpm', label: 'Frecuencia respiratoria' },
  temperatura: { min: 25, max: 45, sospechoso: { min: 32, max: 42 }, unidad: '°C', label: 'Temperatura' },
  sato2: { min: 50, max: 100, sospechoso: { min: 70, max: 100 }, unidad: '%', label: 'Saturación O2' },
  glasgow: { min: 3, max: 15, sospechoso: { min: 3, max: 15 }, unidad: '', label: 'Glasgow' },
  edad: { min: 0, max: 120, sospechoso: { min: 14, max: 110 }, unidad: 'años', label: 'Edad' },
  peso: { min: 1, max: 300, sospechoso: { min: 30, max: 200 }, unidad: 'kg', label: 'Peso' },
  
  // Gases
  pao2: { min: 30, max: 600, sospechoso: { min: 40, max: 500 }, unidad: 'mmHg', label: 'PaO2' },
  paco2: { min: 10, max: 150, sospechoso: { min: 20, max: 100 }, unidad: 'mmHg', label: 'PaCO2' },
  ph: { min: 6.7, max: 7.8, sospechoso: { min: 6.9, max: 7.7 }, unidad: '', label: 'pH' },
  fio2: { min: 0.21, max: 1.0, sospechoso: { min: 0.21, max: 1.0 }, unidad: '', label: 'FiO2' },
  hco3: { min: 5, max: 50, sospechoso: { min: 10, max: 40 }, unidad: 'mEq/L', label: 'HCO3' },
  
  // Electrolitos
  sodio: { min: 100, max: 200, sospechoso: { min: 110, max: 180 }, unidad: 'mEq/L', label: 'Sodio' },
  potasio: { min: 1.5, max: 10, sospechoso: { min: 2, max: 8 }, unidad: 'mEq/L', label: 'Potasio' },
  cloro: { min: 70, max: 140, sospechoso: { min: 80, max: 130 }, unidad: 'mEq/L', label: 'Cloro' },
  calcio: { min: 4, max: 18, sospechoso: { min: 6, max: 14 }, unidad: 'mg/dL', label: 'Calcio' },
  
  // Función renal
  creatinina: { min: 0.1, max: 20, sospechoso: { min: 0.2, max: 15 }, unidad: 'mg/dL', label: 'Creatinina' },
  urea: { min: 5, max: 300, sospechoso: { min: 10, max: 250 }, unidad: 'mg/dL', label: 'Urea' },
  
  // Hematología
  hematocrito: { min: 10, max: 70, sospechoso: { min: 15, max: 65 }, unidad: '%', label: 'Hematocrito' },
  hemoglobina: { min: 3, max: 25, sospechoso: { min: 5, max: 20 }, unidad: 'g/dL', label: 'Hemoglobina' },
  leucocitos: { min: 0.1, max: 100, sospechoso: { min: 0.5, max: 80 }, unidad: '×10³/μL', label: 'Leucocitos' },
  plaquetas: { min: 5, max: 1500, sospechoso: { min: 10, max: 1200 }, unidad: '×10³/μL', label: 'Plaquetas' },
  
  // Otros
  bilirrubina: { min: 0.1, max: 50, sospechoso: { min: 0.2, max: 30 }, unidad: 'mg/dL', label: 'Bilirrubina' },
  lactato: { min: 0.5, max: 30, sospechoso: { min: 0.5, max: 20 }, unidad: 'mmol/L', label: 'Lactato' },
  glucemia: { min: 20, max: 1000, sospechoso: { min: 30, max: 800 }, unidad: 'mg/dL', label: 'Glucemia' },
  albumina: { min: 0.5, max: 6, sospechoso: { min: 1, max: 5.5 }, unidad: 'g/dL', label: 'Albúmina' },
  
  // Ventilación
  peep: { min: 0, max: 30, sospechoso: { min: 0, max: 25 }, unidad: 'cmH2O', label: 'PEEP' },
  vt: { min: 50, max: 1500, sospechoso: { min: 100, max: 1000 }, unidad: 'ml', label: 'Volumen tidal' },
  plateau: { min: 5, max: 60, sospechoso: { min: 10, max: 50 }, unidad: 'cmH2O', label: 'Presión plateau' }
}

// Validar un campo
// Retorna: null (OK), { tipo: 'error', mensaje } (rechazar), { tipo: 'sospechoso', mensaje } (advertir)
export function validar(campo, valor) {
  if (valor === '' || valor === null || valor === undefined) return null
  
  const v = Number(valor)
  if (isNaN(v)) return { tipo: 'error', mensaje: 'No es un número válido' }
  
  const rango = RANGOS[campo]
  if (!rango) return null
  
  // Caso especial: leucocitos y plaquetas — el usuario puede ingresar valor absoluto
  let normalizado = v
  if (campo === 'leucocitos' && v > 1000) normalizado = v / 1000
  if (campo === 'plaquetas' && v > 5000) normalizado = v / 1000
  
  if (normalizado < rango.min || normalizado > rango.max) {
    return { 
      tipo: 'error', 
      mensaje: `Fuera de rango fisiológico (${rango.min}-${rango.max} ${rango.unidad}). ¿Es un typo?` 
    }
  }
  
  if (normalizado < rango.sospechoso.min || normalizado > rango.sospechoso.max) {
    return { 
      tipo: 'sospechoso', 
      mensaje: `Valor inusual. Verificar.` 
    }
  }
  
  return null
}

// Validar coherencia entre campos
export function validarCoherencia(datos) {
  const alertas = []
  
  // PAM debe ser razonable respecto a TAS y PAD
  if (datos.tas && datos.pad) {
    const pamCalculada = (Number(datos.tas) + 2 * Number(datos.pad)) / 3
    if (datos.pam) {
      const dif = Math.abs(Number(datos.pam) - pamCalculada)
      if (dif > 15) {
        alertas.push({
          campos: ['pam', 'tas', 'pad'],
          mensaje: `PAM ingresada (${datos.pam}) difiere de la calculada (${pamCalculada.toFixed(0)}). Verificar.`
        })
      }
    }
  }
  
  // FiO2 baja con PaO2 muy alta es raro
  if (datos.fio2 && datos.pao2) {
    const fio2 = Number(datos.fio2)
    const pao2 = Number(datos.pao2)
    const pafiTeorica = pao2 / fio2
    if (pafiTeorica > 600) {
      alertas.push({
        campos: ['fio2', 'pao2'],
        mensaje: `PaO2/FiO2 = ${pafiTeorica.toFixed(0)} es muy alto. Verificar FiO2 (¿está en decimal?)`
      })
    }
  }
  
  // pH y HCO3 incoherentes
  if (datos.ph && datos.hco3) {
    const ph = Number(datos.ph)
    const hco3 = Number(datos.hco3)
    if (ph < 7.2 && hco3 > 30) {
      alertas.push({
        campos: ['ph', 'hco3'],
        mensaje: 'pH muy ácido con HCO3 elevado es incoherente. Verificar valores.'
      })
    }
    if (ph > 7.55 && hco3 < 18) {
      alertas.push({
        campos: ['ph', 'hco3'],
        mensaje: 'pH alcalino con HCO3 bajo es incoherente. Verificar.'
      })
    }
  }
  
  return alertas
}
