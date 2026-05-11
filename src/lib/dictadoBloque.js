// Parser para dictado en bloque
// Convierte "frecuencia cardíaca 90, presión media 72, temperatura 37" 
// en { fc: 90, pam: 72, temperatura: 37 }

import { corregirTexto } from './voz.js'

// Mapeo de palabras clave a campos
const sinónimos = {
  fc: ['frecuencia cardíaca', 'frecuencia cardiaca', 'fc', 'pulso', 'cardíaca', 'cardiaca'],
  fr: ['frecuencia respiratoria', 'fr', 'respiratoria'],
  pam: ['presión arterial media', 'presion arterial media', 'pam', 'presión media', 'presion media'],
  tas: ['presión sistólica', 'presion sistolica', 'tas', 'sistólica', 'sistolica'],
  pad: ['presión diastólica', 'presion diastolica', 'pad', 'diastólica', 'diastolica'],
  temperatura: ['temperatura', 'temp'],
  sato2: ['saturación', 'saturacion', 'sato2', 'sato dos', 'sat'],
  fio2: ['fio2', 'fio dos', 'fi o2'],
  pao2: ['pao2', 'pao dos', 'pa o dos', 'oxígeno arterial', 'oxigeno arterial'],
  paco2: ['paco2', 'paco dos', 'co2', 'dióxido de carbono'],
  ph: ['pe hache', 'ph', 'pehache'],
  glasgow: ['glasgow', 'gcs'],
  sodio: ['sodio', 'na', 'natremia'],
  potasio: ['potasio', 'k', 'kalemia'],
  cloro: ['cloro', 'cl'],
  calcio: ['calcio', 'ca'],
  creatinina: ['creatinina', 'creat'],
  urea: ['urea'],
  hematocrito: ['hematocrito', 'hto'],
  hemoglobina: ['hemoglobina', 'hb'],
  leucocitos: ['leucocitos', 'gb', 'glóbulos blancos', 'globulos blancos'],
  plaquetas: ['plaquetas', 'plt'],
  bilirrubina: ['bilirrubina', 'bili'],
  lactato: ['lactato'],
  glucemia: ['glucemia', 'glucosa', 'glicemia'],
  edad: ['edad', 'años'],
  peso: ['peso', 'kilos'],
  peep: ['peep'],
  vt: ['volumen tidal', 'volumen corriente', 'vt'],
  balance: ['balance', 'balance hídrico', 'balance hidrico'],
  diuresis: ['diuresis']
}

// Buscar el campo más probable en una frase
function identificarCampo(frase) {
  const fraseNorm = frase.toLowerCase().trim()
  let mejorMatch = null
  let mejorLongitud = 0
  
  for (const [campo, variantes] of Object.entries(sinónimos)) {
    for (const v of variantes) {
      if (fraseNorm.includes(v) && v.length > mejorLongitud) {
        mejorMatch = campo
        mejorLongitud = v.length
      }
    }
  }
  return mejorMatch
}

// Extraer número (con punto o coma decimal)
function extraerNumero(texto) {
  const match = texto.match(/(-?\d+(?:[.,]\d+)?)/)
  if (match) return parseFloat(match[1].replace(',', '.'))
  return null
}

// Función principal
export function parsearDictadoCompleto(textoCrudo) {
  if (!textoCrudo) return {}
  
  const corregido = corregirTexto(textoCrudo)
  
  // Dividir por separadores (coma, punto, "y", saltos)
  const partes = corregido.split(/[,;.]|\s+y\s+/g).map(s => s.trim()).filter(Boolean)
  
  const resultado = {}
  const errores = []
  
  for (const parte of partes) {
    const campo = identificarCampo(parte)
    const numero = extraerNumero(parte)
    
    if (campo && numero !== null) {
      resultado[campo] = numero
    } else if (parte.length > 3) {
      errores.push(parte)
    }
  }
  
  return { datos: resultado, noReconocido: errores }
}
