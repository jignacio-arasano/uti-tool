// Tests manuales y automatizados del cálculo APACHE II
// Ejecutar con: node tests.js

import { calcularApacheII } from './src/lib/apache.js'
import { interpretar } from './src/lib/interpretacion.js'
import { calcularInfusion } from './src/lib/vasopresores.js'
import { calcularSOFA, calcularQSOFA } from './src/lib/sofa.js'
import { calcularNEWS2, calcularCURB65, calcularWells, calcularGlasgow, indicesDerivados } from './src/lib/scores.js'
import { validar, validarCoherencia } from './src/lib/validacion.js'
import { convertir } from './src/lib/unidades.js'
import { calcularBalance } from './src/lib/balance.js'
import { parsearDictadoCompleto } from './src/lib/dictadoBloque.js'

let pasados = 0
let fallidos = 0

function test(nombre, fn) {
  try {
    fn()
    console.log(`✓ ${nombre}`)
    pasados++
  } catch (err) {
    console.log(`✗ ${nombre}`)
    console.log(`  ${err.message}`)
    fallidos++
  }
}

function asertar(actual, esperado, msg = '') {
  if (actual !== esperado) {
    throw new Error(`${msg} Esperaba ${esperado}, recibí ${actual}`)
  }
}

// === TESTS APACHE II ===

test('Paciente sano debería tener score bajo', () => {
  const r = calcularApacheII({
    temperatura: 37, pam: 90, fc: 80, fr: 16,
    fio2: 0.21, pao2: 95, ph: 7.4,
    sodio: 140, potasio: 4.0, creatinina: 1.0,
    hematocrito: 42, leucocitos: 8, glasgow: 15,
    edad: 30, comorbilidades: false
  })
  asertar(r.score, 0, 'Score de paciente sano:')
  asertar(r.categoria, 'verde')
})

test('Paciente crítico — múltiples puntos', () => {
  const r = calcularApacheII({
    temperatura: 39.5,    // 3
    pam: 45,              // 4
    fc: 145,              // 3
    fr: 36,               // 3
    fio2: 0.6, pao2: 80, paco2: 40,  // A-aDO2 = 0.6*713 - 50 - 80 = 297.8 → 2
    ph: 7.2,              // 3
    sodio: 152,           // 1
    potasio: 5.8,         // 1
    creatinina: 2.5,      // 3
    hematocrito: 28,      // 2
    leucocitos: 18,       // 1
    glasgow: 8,           // 7
    edad: 70,             // 5
    comorbilidades: true, // 5
    tipoIngreso: 'medico'
  })
  // Total esperado: 3+4+3+3+2+3+1+1+3+2+1+7+5+5 = 43
  asertar(r.score, 43, 'Score paciente crítico:')
  asertar(r.categoria, 'rojo')
})

test('Creatinina con IRA duplica puntos', () => {
  const sinIRA = calcularApacheII({
    creatinina: 2.5, ira: false, edad: 30, glasgow: 15
  })
  const conIRA = calcularApacheII({
    creatinina: 2.5, ira: true, edad: 30, glasgow: 15
  })
  asertar(conIRA.score - sinIRA.score, 3, 'Diferencia con IRA:')
})

test('Glasgow se calcula como 15 - GCS', () => {
  const r = calcularApacheII({ glasgow: 8, edad: 30 })
  asertar(r.desglose.glasgow, 7)
})

test('Comorbilidades: 5 puntos en médico, 2 en postop electivo', () => {
  const medico = calcularApacheII({ 
    comorbilidades: true, tipoIngreso: 'medico', edad: 30, glasgow: 15
  })
  const postop = calcularApacheII({ 
    comorbilidades: true, tipoIngreso: 'postop_electivo', edad: 30, glasgow: 15
  })
  asertar(medico.desglose.comorbilidades, 5)
  asertar(postop.desglose.comorbilidades, 2)
})

test('Leucocitos acepta 14 y 14000', () => {
  const r1 = calcularApacheII({ leucocitos: 14, edad: 30, glasgow: 15 })
  const r2 = calcularApacheII({ leucocitos: 14000, edad: 30, glasgow: 15 })
  asertar(r1.desglose.leucocitos, r2.desglose.leucocitos)
})

test('Categoría correcta por rangos', () => {
  asertar(calcularApacheII({ glasgow: 15, edad: 30 }).categoria, 'verde')  // 0
  // Forzar score moderado: edad 50 (2) + comorbilidades (5) + glasgow 12 (3) = 10
  const r = calcularApacheII({ 
    glasgow: 12, edad: 50, comorbilidades: true, tipoIngreso: 'medico'
  })
  asertar(r.score >= 10 && r.score < 20, true, `Esperaba 10-19, recibí ${r.score}`)
  asertar(r.categoria, 'amarillo')
})

// === TESTS INTERPRETACIÓN ===

test('Interpretación general según score', () => {
  asertar(interpretar(5).color, 'verde')
  asertar(interpretar(15).color, 'amarillo')
  asertar(interpretar(25).color, 'naranja')
  asertar(interpretar(35).color, 'rojo')
})

test('Interpretación de sepsis trae mensaje específico', () => {
  const r = interpretar(15, 'sepsis')
  asertar(r.color, 'amarillo')
  if (!r.mensaje.toLowerCase().includes('bundle')) {
    throw new Error('Mensaje de sepsis debería mencionar bundle')
  }
})

test('Tipo de ingreso desconocido cae a general', () => {
  const r = interpretar(15, 'tipoQueNoExiste')
  asertar(r.color, 'amarillo')
})

// === TESTS VASOPRESORES ===

test('Cálculo noradrenalina — caso clásico', () => {
  // 8mg en 250ml = 32 mcg/ml
  // 70kg * 0.1 mcg/kg/min = 7 mcg/min = 0.007 mg/min
  // 0.007 * 60 = 0.42 mg/h
  // 0.42 / 0.032 = 13.125 ml/h
  const ml = calcularInfusion('noradrenalina', 0.1, 70)
  asertar(ml, '13.1')
})

test('Cálculo dobutamina', () => {
  // 250mg en 250ml = 1 mg/ml
  // 80kg * 5 mcg/kg/min = 400 mcg/min = 0.4 mg/min = 24 mg/h
  // 24 / 1 = 24 ml/h
  const ml = calcularInfusion('dobutamina', 5, 80)
  asertar(ml, '24.0')
})

test('Cálculo vasopresina (U/min)', () => {
  // 20U en 100ml = 0.2 U/ml
  // 0.03 U/min * 60 = 1.8 U/h
  // 1.8 / 0.2 = 9 ml/h
  const ml = calcularInfusion('vasopresina', 0.03, 70)
  asertar(ml, '9.0')
})

test('Droga inexistente devuelve null', () => {
  const r = calcularInfusion('drogaQueNoExiste', 0.1, 70)
  asertar(r, null)
})

// === TESTS SOFA ===

test('SOFA paciente sin disfunción → score 0', () => {
  const r = calcularSOFA({
    pao2: 95, fio2: 0.21, ventilacionMecanica: false,
    plaquetas: 250, bilirrubina: 0.8,
    pam: 80, dopamina: 0, dobutamina: 0, noradrenalina: 0, adrenalina: 0,
    glasgow: 15, creatinina: 0.9, diuresis: 1500
  })
  asertar(r.score, 0)
})

test('SOFA paciente con sepsis grave acumula puntos', () => {
  const r = calcularSOFA({
    pao2: 80, fio2: 0.6, ventilacionMecanica: true,
    plaquetas: 80, bilirrubina: 3,
    pam: 60, noradrenalina: 0.05,
    glasgow: 12, creatinina: 2.5, diuresis: 400
  })
  if (r.score < 8) throw new Error(`Esperaba SOFA ≥ 8, recibí ${r.score}`)
})

test('qSOFA con 2 criterios es positivo', () => {
  const r = calcularQSOFA({ fr: 24, tas: 95, glasgow: 14 })
  asertar(r.score, 3)
  asertar(r.positivo, true)
})

// === TESTS OTROS SCORES ===

test('NEWS2 paciente estable score bajo', () => {
  const r = calcularNEWS2({
    fr: 16, spo2: 97, oxigeno: false,
    tas: 120, fc: 75, conciencia: 'alerta', temp: 36.8
  })
  if (r.score > 1) throw new Error(`Esperaba NEWS2 ≤ 1, recibí ${r.score}`)
})

test('NEWS2 detecta deterioro crítico', () => {
  const r = calcularNEWS2({
    fr: 26, spo2: 90, oxigeno: true,
    tas: 88, fc: 135, conciencia: 'confuso', temp: 39
  })
  if (r.score < 7) throw new Error(`Esperaba NEWS2 ≥ 7 (alto), recibí ${r.score}`)
})

test('CURB-65 anciano con criterios completos', () => {
  const r = calcularCURB65({
    confusion: true, urea: 50, fr: 32, pas: 85, edad: 78
  })
  if (r.score < 4) throw new Error(`Esperaba CURB-65 ≥ 4, recibí ${r.score}`)
})

test('Wells TEP probabilidad alta', () => {
  // 3 + 3 + 1.5 + 1.5 + 1 + 1 = 11 (alta, >6)
  const r = calcularWells({
    tvp: true, tepProbable: true, fc: 110,
    inmovilizacion: true, tepPrevio: false,
    hemoptisis: true, cancerActivo: true
  })
  asertar(r.categoria, 'rojo')
})

test('Glasgow 3+5+6 = 14', () => {
  const r = calcularGlasgow(3, 5, 6)
  asertar(r.score, 14)
})

test('PaFi se calcula bien', () => {
  // 80 / 0.4 = 200
  const r = indicesDerivados.pafi(80, 0.4)
  asertar(r.valor, '200')
})

test('Índice de shock detecta hipoperfusión', () => {
  // 120/90 = 1.33
  const r = indicesDerivados.indiceShock(120, 90)
  if (parseFloat(r.valor) < 1.3) throw new Error(`Esperaba IS > 1.3, recibí ${r.valor}`)
})

// === TESTS VALIDACIÓN DE RANGOS ===

test('FC=5 marca error (imposible)', () => {
  const r = validar('fc', 5)
  if (!r || r.tipo !== 'error') throw new Error('Debería marcar error')
})

test('FC=125 es válido', () => {
  const r = validar('fc', 125)
  asertar(r, null)
})

test('Potasio=14 marca error', () => {
  const r = validar('potasio', 14)
  if (!r || r.tipo !== 'error') throw new Error('Debería marcar error')
})

test('Coherencia: PAM > TAS marca alerta', () => {
  const alertas = validarCoherencia({ tas: 100, pad: 60, pam: 110 })
  if (alertas.length === 0) throw new Error('Debería detectar incoherencia PAM/TAS')
})

// === TESTS CONVERSIÓN DE UNIDADES ===

test('Creatinina mg/dL → μmol/L', () => {
  const r = convertir('creatinina', 'mg/dL → μmol/L', 1)
  // 1 × 88.4 ≈ 88
  if (Math.abs(parseFloat(r) - 88.4) > 1) throw new Error(`Esperaba ~88, recibí ${r}`)
})

test('Glucemia mmol/L → mg/dL', () => {
  const r = convertir('glucemia', 'mmol/L → mg/dL', 5.5)
  // 5.5 × 18 = 99
  if (Math.abs(parseFloat(r) - 99) > 1) throw new Error(`Esperaba ~99, recibí ${r}`)
})

test('Temperatura F → C', () => {
  const r = convertir('temperatura', '°F → °C', 98.6)
  if (Math.abs(parseFloat(r) - 37) > 0.1) throw new Error(`Esperaba 37, recibí ${r}`)
})

// === TESTS BALANCE HÍDRICO ===

test('Balance positivo simple', () => {
  const r = calcularBalance(
    { cristaloides: 2000, drogas: 500 },
    { diuresis: 1500, drenajes: 0 }
  )
  asertar(r.balance, 1000)
})

test('Balance negativo', () => {
  const r = calcularBalance(
    { cristaloides: 1000 },
    { diuresis: 2000, sangrado: 500 }
  )
  asertar(r.balance, -1500)
})

// === TESTS DICTADO EN BLOQUE ===

test('Dictado parsea múltiples campos', () => {
  const r = parsearDictadoCompleto('frecuencia cardíaca 90, presión media 72, temperatura 37')
  if (r.datos.fc !== 90) throw new Error(`FC esperada 90, recibí ${r.datos.fc}`)
  if (r.datos.pam !== 72) throw new Error(`PAM esperada 72, recibí ${r.datos.pam}`)
  if (r.datos.temperatura !== 37) throw new Error(`Temp esperada 37, recibí ${r.datos.temperatura}`)
})

test('Dictado tolera sinónimos cortos', () => {
  const r = parsearDictadoCompleto('FC 80, saturación 95, temp 36.5')
  if (r.datos.fc !== 80) throw new Error('FC no parseada')
  if (r.datos.sato2 !== 95) throw new Error('Saturación no parseada')
})

// === RESUMEN ===
console.log(`\n${'='.repeat(40)}`)
console.log(`Pasados: ${pasados}`)
console.log(`Fallidos: ${fallidos}`)
console.log(`Total: ${pasados + fallidos}`)
console.log('='.repeat(40))

if (fallidos > 0) process.exit(1)
