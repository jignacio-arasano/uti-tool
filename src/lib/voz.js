// Reconocimiento de voz con diccionario médico
// Usa Web Speech API nativa

// Diccionario de correcciones: variantes mal transcriptas → término correcto
const dictMedico = {
  'noradrenalina': ['nor adrenalina', 'noradrena lina', 'nora adrenalina', 'noradrena'],
  'adrenalina': ['a drenalina', 'adrenal ina'],
  'vasopresina': ['baso presina', 'vaso presina', 'vasopre sina'],
  'dobutamina': ['do butamina', 'dobuta mina'],
  'dopamina': ['do pamina', 'dopa mina'],
  'midazolam': ['mida zolam', 'midazo lam'],
  'fentanilo': ['fenta nilo', 'fentani lo'],
  'propofol': ['propo fol', 'pro pofol'],
  'rocuronio': ['rocu ronio', 'rocuro nio'],
  'apache': ['a pache', 'apachee', 'apatxe'],
  'glasgow': ['glas gow', 'glasco', 'glascow'],
  'peep': ['pip', 'pep', 'piip'],
  'fio2': ['fio dos', 'fi o dos', 'fio2'],
  'sdra': ['s d r a', 'sdra'],
  'pafi': ['pa fi', 'p a fi'],
  'sato2': ['sat o2', 'sato dos', 'saturación'],
  'sato2': ['sat o2', 'sato dos'],
  'sofa': ['so fa'],
  'pam': ['p a m', 'presión arterial media'],
  'pvc': ['p v c', 'presión venosa central'],
  'lactato': ['lac tato', 'lactacto'],
  'hemocultivo': ['hemo cultivo'],
  'urocultivo': ['uro cultivo'],
  'weaning': ['guining', 'wining', 'huining'],
  'extubación': ['ex tubación'],
  'traqueostomía': ['traqueo stomia', 'traqueostomia'],
  'sedoanalgesia': ['sedo analgesia'],
  'ramsay': ['ram sai', 'ramsei'],
  'rass': ['ras', 'r a s s']
}

export function corregirTexto(texto) {
  let resultado = texto.toLowerCase()
  for (const [correcto, variantes] of Object.entries(dictMedico)) {
    for (const v of variantes) {
      const regex = new RegExp('\\b' + v.replace(/\s+/g, '\\s*') + '\\b', 'gi')
      resultado = resultado.replace(regex, correcto)
    }
  }
  // Convertir números escritos a dígitos en contextos médicos comunes
  const numerosTexto = {
    'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
    'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9',
    'diez': '10', 'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14',
    'quince': '15', 'veinte': '20', 'treinta': '30', 'cuarenta': '40',
    'cincuenta': '50', 'sesenta': '60', 'setenta': '70', 'ochenta': '80',
    'noventa': '90', 'cien': '100', 'ciento': '100'
  }
  for (const [palabra, num] of Object.entries(numerosTexto)) {
    const regex = new RegExp('\\b' + palabra + '\\b', 'gi')
    resultado = resultado.replace(regex, num)
  }
  return resultado
}

export function crearReconocedor(onResultado, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    onError && onError('Tu navegador no soporta reconocimiento de voz. Usá Chrome.')
    return null
  }
  
  const recognition = new SpeechRecognition()
  recognition.lang = 'es-AR'
  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    const corregido = corregirTexto(transcript)
    onResultado(corregido)
  }
  
  recognition.onerror = (event) => {
    onError && onError(`Error: ${event.error}`)
  }
  
  return recognition
}

// Extraer un número de un texto dictado
export function extraerNumero(texto) {
  const match = texto.match(/(-?\d+([.,]\d+)?)/)
  if (match) {
    return parseFloat(match[1].replace(',', '.'))
  }
  return null
}
