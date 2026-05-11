// SOFA — Sequential Organ Failure Assessment
// Vincent et al. 1996. Score de 0 a 24, evalúa 6 sistemas (0-4 c/u)

function entre(v, min, max) {
  return v >= min && v <= max
}

// Respiratorio: PaFi (PaO2/FiO2)
export function sofaRespiratorio(pao2, fio2, vm = false) {
  if (!pao2 || !fio2) return 0
  const fio2Num = Number(fio2)
  const pafi = Number(pao2) / fio2Num
  if (pafi >= 400) return 0
  if (pafi >= 300) return 1
  if (pafi >= 200) return 2
  if (pafi >= 100 && vm) return 3
  if (pafi < 100 && vm) return 4
  return pafi >= 200 ? 2 : 3 // sin VM, máximo 3
}

// Coagulación: plaquetas (×10³/μL)
export function sofaCoagulacion(plaq) {
  if (!plaq) return 0
  let v = Number(plaq)
  if (v > 1000) v = v / 1000 // permite valor absoluto
  if (v >= 150) return 0
  if (v >= 100) return 1
  if (v >= 50) return 2
  if (v >= 20) return 3
  return 4
}

// Hígado: bilirrubina total (mg/dL)
export function sofaHigado(bili) {
  if (!bili) return 0
  const v = Number(bili)
  if (v < 1.2) return 0
  if (v < 2) return 1
  if (v < 6) return 2
  if (v < 12) return 3
  return 4
}

// Cardiovascular: PAM y vasopresores (dosis en mcg/kg/min)
// dopamina y dobutamina son tratadas distinto en SOFA original
export function sofaCardiovascular(pam, dopamina = 0, dobutamina = 0, noradrenalina = 0, adrenalina = 0) {
  // Si hay vasopresores, dominan
  const dop = Number(dopamina) || 0
  const dobu = Number(dobutamina) || 0
  const nora = Number(noradrenalina) || 0
  const adre = Number(adrenalina) || 0
  
  if (nora > 0.1 || adre > 0.1 || dop > 15) return 4
  if (nora > 0 || adre > 0 || dop > 5) return 3
  if (dop > 0 || dobu > 0) return 2
  if (pam && Number(pam) < 70) return 1
  return 0
}

// Neurológico: Glasgow
export function sofaNeurologico(gcs) {
  if (!gcs) return 0
  const v = Number(gcs)
  if (v >= 15) return 0
  if (v >= 13) return 1
  if (v >= 10) return 2
  if (v >= 6) return 3
  return 4
}

// Renal: creatinina (mg/dL) o diuresis (ml/día)
export function sofaRenal(creat, diuresis = null) {
  let puntosCreat = 0
  let puntosDiuresis = 0
  
  if (creat) {
    const v = Number(creat)
    if (v < 1.2) puntosCreat = 0
    else if (v < 2) puntosCreat = 1
    else if (v < 3.5) puntosCreat = 2
    else if (v < 5) puntosCreat = 3
    else puntosCreat = 4
  }
  
  if (diuresis !== null && diuresis !== '') {
    const d = Number(diuresis)
    if (d < 200) puntosDiuresis = 4
    else if (d < 500) puntosDiuresis = 3
  }
  
  return Math.max(puntosCreat, puntosDiuresis)
}

export function calcularSOFA(datos) {
  const desglose = {
    respiratorio: sofaRespiratorio(datos.pao2, datos.fio2, datos.ventilacionMecanica),
    coagulacion: sofaCoagulacion(datos.plaquetas),
    higado: sofaHigado(datos.bilirrubina),
    cardiovascular: sofaCardiovascular(
      datos.pam, datos.dopamina, datos.dobutamina, 
      datos.noradrenalina, datos.adrenalina
    ),
    neurologico: sofaNeurologico(datos.glasgow),
    renal: sofaRenal(datos.creatinina, datos.diuresis)
  }
  
  const score = Object.values(desglose).reduce((a, b) => a + b, 0)
  
  // Mortalidad estimada según rango (datos publicados)
  let mortalidad
  if (score <= 6) mortalidad = '<10'
  else if (score <= 9) mortalidad = '15-20'
  else if (score <= 12) mortalidad = '40-50'
  else if (score <= 14) mortalidad = '50-60'
  else mortalidad = '>80'
  
  let categoria
  if (score <= 6) categoria = 'verde'
  else if (score <= 9) categoria = 'amarillo'
  else if (score <= 12) categoria = 'naranja'
  else categoria = 'rojo'
  
  return { score, mortalidad, categoria, desglose }
}

// qSOFA — versión rápida fuera de UTI
// 1 punto cada uno: alteración del estado mental (GCS<15), TAS≤100, FR≥22
// ≥2 puntos sugiere mayor riesgo de mortalidad por sepsis
export function calcularQSOFA(datos) {
  let score = 0
  const items = []
  
  if (datos.glasgow && Number(datos.glasgow) < 15) {
    score++
    items.push({ id: 'mental', label: 'Alteración del estado mental', activo: true })
  } else {
    items.push({ id: 'mental', label: 'Alteración del estado mental (GCS<15)', activo: false })
  }
  
  if (datos.tas && Number(datos.tas) <= 100) {
    score++
    items.push({ id: 'tas', label: 'TAS ≤ 100 mmHg', activo: true })
  } else {
    items.push({ id: 'tas', label: 'TAS ≤ 100 mmHg', activo: false })
  }
  
  if (datos.fr && Number(datos.fr) >= 22) {
    score++
    items.push({ id: 'fr', label: 'FR ≥ 22 rpm', activo: true })
  } else {
    items.push({ id: 'fr', label: 'FR ≥ 22 rpm', activo: false })
  }
  
  const positivo = score >= 2
  return { score, positivo, items }
}
