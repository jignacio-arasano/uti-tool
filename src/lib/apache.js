// APACHE II — Knaus et al. 1985
// Acute Physiology And Chronic Health Evaluation II

// Función auxiliar: encuentra el puntaje según rangos
function puntuarRango(valor, rangos) {
  if (valor === null || valor === undefined || valor === '') return 0
  const v = Number(valor)
  if (isNaN(v)) return 0
  for (const r of rangos) {
    if (v >= r.min && v <= r.max) return r.puntos
  }
  return 0
}

// 1. Temperatura rectal (°C)
function puntuarTemperatura(temp) {
  return puntuarRango(temp, [
    { min: 41, max: 999, puntos: 4 },
    { min: 39, max: 40.9, puntos: 3 },
    { min: 38.5, max: 38.9, puntos: 1 },
    { min: 36, max: 38.4, puntos: 0 },
    { min: 34, max: 35.9, puntos: 1 },
    { min: 32, max: 33.9, puntos: 2 },
    { min: 30, max: 31.9, puntos: 3 },
    { min: -999, max: 29.9, puntos: 4 }
  ])
}

// 2. Presión Arterial Media (mmHg)
function puntuarPAM(pam) {
  return puntuarRango(pam, [
    { min: 160, max: 999, puntos: 4 },
    { min: 130, max: 159, puntos: 3 },
    { min: 110, max: 129, puntos: 2 },
    { min: 70, max: 109, puntos: 0 },
    { min: 50, max: 69, puntos: 2 },
    { min: -999, max: 49, puntos: 4 }
  ])
}

// 3. Frecuencia Cardíaca (lpm)
function puntuarFC(fc) {
  return puntuarRango(fc, [
    { min: 180, max: 999, puntos: 4 },
    { min: 140, max: 179, puntos: 3 },
    { min: 110, max: 139, puntos: 2 },
    { min: 70, max: 109, puntos: 0 },
    { min: 55, max: 69, puntos: 2 },
    { min: 40, max: 54, puntos: 3 },
    { min: -999, max: 39, puntos: 4 }
  ])
}

// 4. Frecuencia Respiratoria (rpm)
function puntuarFR(fr) {
  return puntuarRango(fr, [
    { min: 50, max: 999, puntos: 4 },
    { min: 35, max: 49, puntos: 3 },
    { min: 25, max: 34, puntos: 1 },
    { min: 12, max: 24, puntos: 0 },
    { min: 10, max: 11, puntos: 1 },
    { min: 6, max: 9, puntos: 2 },
    { min: -999, max: 5, puntos: 4 }
  ])
}

// 5. Oxigenación
// Si FiO2 >= 0.5: usar A-aDO2
// Si FiO2 < 0.5: usar PaO2
function puntuarOxigenacion(fio2, pao2, paco2) {
  if (!fio2 || !pao2) return 0
  const fio2Num = Number(fio2)
  const pao2Num = Number(pao2)
  
  if (fio2Num >= 0.5) {
    // Calcular A-aDO2 = (FiO2 * 713) - (PaCO2 / 0.8) - PaO2
    const paco2Num = Number(paco2) || 40
    const aado2 = (fio2Num * 713) - (paco2Num / 0.8) - pao2Num
    return puntuarRango(aado2, [
      { min: 500, max: 9999, puntos: 4 },
      { min: 350, max: 499, puntos: 3 },
      { min: 200, max: 349, puntos: 2 },
      { min: -999, max: 199, puntos: 0 }
    ])
  } else {
    return puntuarRango(pao2Num, [
      { min: 70, max: 999, puntos: 0 },
      { min: 61, max: 69, puntos: 1 },
      { min: 55, max: 60, puntos: 3 },
      { min: -999, max: 54, puntos: 4 }
    ])
  }
}

// 6. pH arterial
function puntuarPH(ph) {
  return puntuarRango(ph, [
    { min: 7.7, max: 99, puntos: 4 },
    { min: 7.6, max: 7.69, puntos: 3 },
    { min: 7.5, max: 7.59, puntos: 1 },
    { min: 7.33, max: 7.49, puntos: 0 },
    { min: 7.25, max: 7.32, puntos: 2 },
    { min: 7.15, max: 7.24, puntos: 3 },
    { min: -99, max: 7.14, puntos: 4 }
  ])
}

// 7. Sodio sérico (mEq/L)
function puntuarSodio(na) {
  return puntuarRango(na, [
    { min: 180, max: 999, puntos: 4 },
    { min: 160, max: 179, puntos: 3 },
    { min: 155, max: 159, puntos: 2 },
    { min: 150, max: 154, puntos: 1 },
    { min: 130, max: 149, puntos: 0 },
    { min: 120, max: 129, puntos: 2 },
    { min: 111, max: 119, puntos: 3 },
    { min: -999, max: 110, puntos: 4 }
  ])
}

// 8. Potasio sérico (mEq/L)
function puntuarPotasio(k) {
  return puntuarRango(k, [
    { min: 7, max: 99, puntos: 4 },
    { min: 6, max: 6.9, puntos: 3 },
    { min: 5.5, max: 5.9, puntos: 1 },
    { min: 3.5, max: 5.4, puntos: 0 },
    { min: 3, max: 3.4, puntos: 1 },
    { min: 2.5, max: 2.9, puntos: 2 },
    { min: -99, max: 2.4, puntos: 4 }
  ])
}

// 9. Creatinina sérica (mg/dL) — duplicar puntos si IRA
function puntuarCreatinina(creat, ira) {
  const base = puntuarRango(creat, [
    { min: 3.5, max: 999, puntos: 4 },
    { min: 2, max: 3.4, puntos: 3 },
    { min: 1.5, max: 1.9, puntos: 2 },
    { min: 0.6, max: 1.4, puntos: 0 },
    { min: -99, max: 0.59, puntos: 2 }
  ])
  return ira ? base * 2 : base
}

// 10. Hematocrito (%)
function puntuarHematocrito(hto) {
  return puntuarRango(hto, [
    { min: 60, max: 999, puntos: 4 },
    { min: 50, max: 59.9, puntos: 2 },
    { min: 46, max: 49.9, puntos: 1 },
    { min: 30, max: 45.9, puntos: 0 },
    { min: 20, max: 29.9, puntos: 2 },
    { min: -99, max: 19.9, puntos: 4 }
  ])
}

// 11. Leucocitos (x1000/mm3)
function puntuarLeucocitos(leuco) {
  // Aceptar tanto 14000 como 14
  let v = Number(leuco)
  if (v > 1000) v = v / 1000
  return puntuarRango(v, [
    { min: 40, max: 9999, puntos: 4 },
    { min: 20, max: 39.9, puntos: 2 },
    { min: 15, max: 19.9, puntos: 1 },
    { min: 3, max: 14.9, puntos: 0 },
    { min: 1, max: 2.9, puntos: 2 },
    { min: -99, max: 0.9, puntos: 4 }
  ])
}

// 12. Glasgow Coma Scale: puntos = 15 - GCS
function puntuarGlasgow(gcs) {
  if (!gcs) return 0
  const v = Number(gcs)
  if (isNaN(v) || v < 3 || v > 15) return 0
  return 15 - v
}

// Edad
function puntuarEdad(edad) {
  return puntuarRango(edad, [
    { min: 75, max: 999, puntos: 6 },
    { min: 65, max: 74, puntos: 5 },
    { min: 55, max: 64, puntos: 3 },
    { min: 45, max: 54, puntos: 2 },
    { min: -99, max: 44, puntos: 0 }
  ])
}

// Comorbilidades crónicas (Knaus 1985):
// - Cirrosis con hipertensión portal
// - NYHA IV
// - EPOC severo (hipercapnia, dependencia O2)
// - Diálisis crónica
// - Inmunocompromiso
function puntuarComorbilidades(tieneComorbilidad, tipoIngreso) {
  if (!tieneComorbilidad) return 0
  // Postoperatorio electivo: 2 puntos
  // Médico o postoperatorio de urgencia: 5 puntos
  return tipoIngreso === 'postop_electivo' ? 2 : 5
}

// Tabla de mortalidad estimada (Knaus 1985, pacientes médicos no quirúrgicos)
const tablaMortalidad = {
  '0-4': 4,
  '5-9': 8,
  '10-14': 15,
  '15-19': 25,
  '20-24': 40,
  '25-29': 55,
  '30-34': 75,
  '35+': 85
}

function obtenerMortalidadEstimada(score) {
  if (score <= 4) return tablaMortalidad['0-4']
  if (score <= 9) return tablaMortalidad['5-9']
  if (score <= 14) return tablaMortalidad['10-14']
  if (score <= 19) return tablaMortalidad['15-19']
  if (score <= 24) return tablaMortalidad['20-24']
  if (score <= 29) return tablaMortalidad['25-29']
  if (score <= 34) return tablaMortalidad['30-34']
  return tablaMortalidad['35+']
}

// Función principal
export function calcularApacheII(datos) {
  const desglose = {
    temperatura: puntuarTemperatura(datos.temperatura),
    pam: puntuarPAM(datos.pam),
    fc: puntuarFC(datos.fc),
    fr: puntuarFR(datos.fr),
    oxigenacion: puntuarOxigenacion(datos.fio2, datos.pao2, datos.paco2),
    ph: puntuarPH(datos.ph),
    sodio: puntuarSodio(datos.sodio),
    potasio: puntuarPotasio(datos.potasio),
    creatinina: puntuarCreatinina(datos.creatinina, datos.ira),
    hematocrito: puntuarHematocrito(datos.hematocrito),
    leucocitos: puntuarLeucocitos(datos.leucocitos),
    glasgow: puntuarGlasgow(datos.glasgow),
    edad: puntuarEdad(datos.edad),
    comorbilidades: puntuarComorbilidades(datos.comorbilidades, datos.tipoIngreso)
  }
  
  const score = Object.values(desglose).reduce((a, b) => a + b, 0)
  const mortalidad = obtenerMortalidadEstimada(score)
  
  let categoria
  if (score < 10) categoria = 'verde'
  else if (score < 20) categoria = 'amarillo'
  else if (score < 30) categoria = 'naranja'
  else categoria = 'rojo'
  
  return { score, mortalidad, categoria, desglose }
}
