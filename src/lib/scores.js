// Otros scores clínicos de uso frecuente

// === NEWS2 — National Early Warning Score 2 ===
// Royal College of Physicians, UK
export function calcularNEWS2(datos) {
  let score = 0
  const desglose = {}
  
  // FR
  if (datos.fr) {
    const v = Number(datos.fr)
    if (v <= 8) desglose.fr = 3
    else if (v <= 11) desglose.fr = 1
    else if (v <= 20) desglose.fr = 0
    else if (v <= 24) desglose.fr = 2
    else desglose.fr = 3
    score += desglose.fr
  }
  
  // SatO2 (escala 1, sin EPOC)
  if (datos.sato2) {
    const v = Number(datos.sato2)
    if (v <= 91) desglose.sato2 = 3
    else if (v <= 93) desglose.sato2 = 2
    else if (v <= 95) desglose.sato2 = 1
    else desglose.sato2 = 0
    score += desglose.sato2
  }
  
  // Aire u oxígeno
  if (datos.oxigenoSuplementario) {
    desglose.oxigeno = 2
    score += 2
  }
  
  // TAS
  if (datos.tas) {
    const v = Number(datos.tas)
    if (v <= 90) desglose.tas = 3
    else if (v <= 100) desglose.tas = 2
    else if (v <= 110) desglose.tas = 1
    else if (v <= 219) desglose.tas = 0
    else desglose.tas = 3
    score += desglose.tas
  }
  
  // FC
  if (datos.fc) {
    const v = Number(datos.fc)
    if (v <= 40) desglose.fc = 3
    else if (v <= 50) desglose.fc = 1
    else if (v <= 90) desglose.fc = 0
    else if (v <= 110) desglose.fc = 1
    else if (v <= 130) desglose.fc = 2
    else desglose.fc = 3
    score += desglose.fc
  }
  
  // Conciencia (alerta = 0, cualquier alteración = 3)
  if (datos.alteracionConciencia) {
    desglose.conciencia = 3
    score += 3
  }
  
  // Temperatura
  if (datos.temperatura) {
    const v = Number(datos.temperatura)
    if (v <= 35) desglose.temperatura = 3
    else if (v <= 36) desglose.temperatura = 1
    else if (v <= 38) desglose.temperatura = 0
    else if (v <= 39) desglose.temperatura = 1
    else desglose.temperatura = 2
    score += desglose.temperatura
  }
  
  let categoria, recomendacion
  if (score === 0) {
    categoria = 'verde'
    recomendacion = 'Riesgo bajo. Monitoreo cada 12hs.'
  } else if (score <= 4) {
    categoria = 'amarillo'
    recomendacion = 'Riesgo bajo-medio. Monitoreo cada 4-6hs. Evaluación por enfermería registrada.'
  } else if (score <= 6) {
    categoria = 'naranja'
    recomendacion = 'Riesgo medio. Revisión médica urgente. Considerar área de cuidado aumentada.'
  } else {
    categoria = 'rojo'
    recomendacion = 'Riesgo alto. Activar respuesta de emergencia. Considerar UTI.'
  }
  
  return { score, categoria, recomendacion, desglose }
}

// === CURB-65 — Severidad de neumonía ===
export function calcularCURB65(datos) {
  let score = 0
  const items = []
  
  const c = !!datos.confusion
  const u = datos.urea && Number(datos.urea) > 7  // mmol/L (= BUN > 19 mg/dL)
  const r = datos.fr && Number(datos.fr) >= 30
  const b = datos.tas && Number(datos.tas) < 90 || datos.pad && Number(datos.pad) <= 60
  const e = datos.edad && Number(datos.edad) >= 65
  
  if (c) score++; items.push({ id: 'C', label: 'Confusión', activo: c })
  if (u) score++; items.push({ id: 'U', label: 'Urea > 7 mmol/L (>42 mg/dL)', activo: !!u })
  if (r) score++; items.push({ id: 'R', label: 'FR ≥ 30', activo: !!r })
  if (b) score++; items.push({ id: 'B', label: 'TAS<90 o PAD≤60', activo: !!b })
  if (e) score++; items.push({ id: '65', label: 'Edad ≥ 65', activo: !!e })
  
  // Re-armar items con conteo correcto
  const itemsLimpios = [
    { id: 'C', label: 'Confusión', activo: c },
    { id: 'U', label: 'Urea > 7 mmol/L (>42 mg/dL)', activo: !!u },
    { id: 'R', label: 'FR ≥ 30', activo: !!r },
    { id: 'B', label: 'TAS<90 o PAD≤60', activo: !!b },
    { id: '65', label: 'Edad ≥ 65', activo: !!e }
  ]
  
  const scoreReal = itemsLimpios.filter(i => i.activo).length
  
  let categoria, recomendacion, mortalidad
  if (scoreReal <= 1) {
    categoria = 'verde'
    mortalidad = '<3'
    recomendacion = 'Bajo riesgo. Considerar manejo ambulatorio.'
  } else if (scoreReal === 2) {
    categoria = 'amarillo'
    mortalidad = '~9'
    recomendacion = 'Riesgo intermedio. Internación en sala general.'
  } else {
    categoria = 'rojo'
    mortalidad = scoreReal === 3 ? '15-22' : '>40'
    recomendacion = 'Alto riesgo. Internación con monitoreo. Considerar UTI si ≥4.'
  }
  
  return { score: scoreReal, categoria, recomendacion, mortalidad, items: itemsLimpios }
}

// === Wells score — TEP (Tromboembolismo pulmonar) ===
export function calcularWells(datos) {
  let score = 0
  const items = [
    { id: 'tvp', label: 'Signos clínicos de TVP', puntos: 3, activo: !!datos.tvp },
    { id: 'tepProb', label: 'TEP es el diagnóstico más probable', puntos: 3, activo: !!datos.tepProbable },
    { id: 'fc', label: 'FC > 100', puntos: 1.5, activo: datos.fc && Number(datos.fc) > 100 },
    { id: 'inmov', label: 'Inmovilización o cirugía reciente (4 sem)', puntos: 1.5, activo: !!datos.inmovilizacion },
    { id: 'tepPrev', label: 'TEP/TVP previo', puntos: 1.5, activo: !!datos.tepPrevio },
    { id: 'hemo', label: 'Hemoptisis', puntos: 1, activo: !!datos.hemoptisis },
    { id: 'ca', label: 'Cáncer activo', puntos: 1, activo: !!datos.cancerActivo }
  ]
  
  score = items.filter(i => i.activo).reduce((sum, i) => sum + i.puntos, 0)
  
  let categoria, recomendacion, probabilidad
  if (score < 2) {
    categoria = 'verde'
    probabilidad = 'Baja (~3.6%)'
    recomendacion = 'Considerar D-dímero. Si negativo, descarta TEP.'
  } else if (score <= 6) {
    categoria = 'amarillo'
    probabilidad = 'Moderada (~20.5%)'
    recomendacion = 'Solicitar AngioTAC de tórax. Anticoagular si alta sospecha y demora en imagen.'
  } else {
    categoria = 'rojo'
    probabilidad = 'Alta (~66.7%)'
    recomendacion = 'AngioTAC urgente. Iniciar anticoagulación empírica si no hay contraindicación.'
  }
  
  return { score, categoria, recomendacion, probabilidad, items }
}

// === Glasgow Coma Scale detallado ===
export function calcularGlasgow(ocular, verbal, motor) {
  const o = Number(ocular) || 0
  const v = Number(verbal) || 0
  const m = Number(motor) || 0
  const score = o + v + m
  
  let interpretacion
  if (score === 15) interpretacion = 'Normal'
  else if (score >= 13) interpretacion = 'Alteración leve'
  else if (score >= 9) interpretacion = 'Alteración moderada — considerar TIM'
  else if (score >= 6) interpretacion = 'Alteración severa — considerar VAA'
  else interpretacion = 'Coma profundo'
  
  return { score, interpretacion, ocular: o, verbal: v, motor: m }
}

// === Índices derivados clínicos ===
export const indicesDerivados = {
  pafi: (pao2, fio2) => {
    if (!pao2 || !fio2) return null
    const r = Number(pao2) / Number(fio2)
    return {
      valor: r.toFixed(0),
      unidad: '',
      interpretacion: r < 100 ? 'SDRA severo' : r < 200 ? 'SDRA moderado' : r < 300 ? 'SDRA leve' : 'Normal'
    }
  },
  
  aado2: (pao2, fio2, paco2 = 40) => {
    if (!pao2 || !fio2) return null
    const aado2 = (Number(fio2) * 713) - (Number(paco2) / 0.8) - Number(pao2)
    return {
      valor: aado2.toFixed(0),
      unidad: 'mmHg',
      interpretacion: aado2 > 100 ? 'Trastorno V/Q severo' : aado2 > 30 ? 'Alterado' : 'Normal'
    }
  },
  
  indiceShock: (fc, tas) => {
    if (!fc || !tas) return null
    const is = Number(fc) / Number(tas)
    return {
      valor: is.toFixed(2),
      unidad: '',
      interpretacion: is > 1 ? 'Shock probable' : is > 0.7 ? 'Compensación' : 'Normal'
    }
  },
  
  drivingPressure: (plateau, peep) => {
    if (!plateau || !peep) return null
    const dp = Number(plateau) - Number(peep)
    return {
      valor: dp.toFixed(0),
      unidad: 'cmH2O',
      interpretacion: dp > 15 ? 'Elevada — riesgo de VILI' : 'Aceptable'
    }
  },
  
  bun: (urea_mgdl) => {
    if (!urea_mgdl) return null
    const bun = Number(urea_mgdl) / 2.14
    return { valor: bun.toFixed(1), unidad: 'mg/dL' }
  },
  
  // Anion gap = Na - (Cl + HCO3)
  anionGap: (na, cl, hco3) => {
    if (!na || !cl || !hco3) return null
    const ag = Number(na) - (Number(cl) + Number(hco3))
    return {
      valor: ag.toFixed(0),
      unidad: 'mEq/L',
      interpretacion: ag > 12 ? 'AG aumentado — buscar acidosis metabólica' : 'Normal'
    }
  },
  
  // Corrected calcium
  calcioCorregido: (ca, alb) => {
    if (!ca || !alb) return null
    const cc = Number(ca) + 0.8 * (4 - Number(alb))
    return {
      valor: cc.toFixed(2),
      unidad: 'mg/dL',
      interpretacion: cc < 8.5 ? 'Hipocalcemia' : cc > 10.5 ? 'Hipercalcemia' : 'Normal'
    }
  },
  
  // Filtrado glomerular estimado (CKD-EPI simplificado)
  fge: (creat, edad, sexo) => {
    if (!creat || !edad || !sexo) return null
    const c = Number(creat)
    const e = Number(edad)
    let k, alpha, factor
    if (sexo === 'F') {
      k = 0.7
      alpha = c <= 0.7 ? -0.241 : -1.2
      factor = 1.012
    } else {
      k = 0.9
      alpha = c <= 0.9 ? -0.302 : -1.2
      factor = 1
    }
    const fge = 142 * Math.pow(Math.min(c/k, 1), alpha) * Math.pow(Math.max(c/k, 1), -1.2) * Math.pow(0.9938, e) * factor
    return {
      valor: fge.toFixed(0),
      unidad: 'ml/min/1.73m²',
      interpretacion: fge < 15 ? 'IRC G5' : fge < 30 ? 'IRC G4' : fge < 60 ? 'IRC G3' : fge < 90 ? 'IRC G2' : 'Normal'
    }
  }
}
