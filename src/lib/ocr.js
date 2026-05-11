// OCR de monitores e impresos de laboratorio
// Usa Tesseract.js cargado dinámicamente desde CDN

let tesseractCargado = false
let workerInstance = null

async function cargarTesseract() {
  if (tesseractCargado) return window.Tesseract
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
    script.onload = () => {
      tesseractCargado = true
      resolve(window.Tesseract)
    }
    script.onerror = () => reject(new Error('No se pudo cargar Tesseract.js'))
    document.head.appendChild(script)
  })
}

export async function reconocerImagen(imageDataUrl, onProgress) {
  const Tesseract = await cargarTesseract()
  
  if (!workerInstance) {
    workerInstance = await Tesseract.createWorker('spa', 1, {
      logger: m => onProgress && onProgress(m)
    })
  }
  
  const { data } = await workerInstance.recognize(imageDataUrl)
  return data.text
}

// Extraer valores numéricos típicos de un monitor de signos vitales
export function extraerValoresSignos(textoOCR) {
  const resultado = {}
  
  // Patrones esperados en monitores
  const patrones = {
    fc: /(?:HR|FC|PULSE|PULSO)[:\s]*(\d{2,3})/i,
    sato2: /(?:SpO2|SAT|SATO2|O2SAT)[:\s]*(\d{2,3})/i,
    fr: /(?:RR|FR|RESP)[:\s]*(\d{1,2})/i,
    tas: /(\d{2,3})\s*\/\s*\d{2,3}/,  // "120/80" → toma 120
    pad: /\d{2,3}\s*\/\s*(\d{2,3})/,  // "120/80" → toma 80
    pam: /(?:MAP|PAM)[:\s]*(\d{2,3})/i,
    temperatura: /(?:T|TEMP|TEMPERATURA)[:\s]*(\d{2}[.,]?\d?)/i,
    pao2: /(?:pO2|PaO2)[:\s]*(\d{2,3})/i,
    paco2: /(?:pCO2|PaCO2)[:\s]*(\d{2,3})/i,
    ph: /(?:pH)[:\s]*(\d[.,]\d{1,2})/i,
    lactato: /(?:Lac|Lactato|Lactate)[:\s]*(\d[.,]?\d?)/i,
    glucemia: /(?:Gluc|Glucose|Glucemia)[:\s]*(\d{2,3})/i,
    sodio: /(?:Na)[:\s]*(\d{3})/,
    potasio: /(?:K)[:\s]*(\d[.,]\d)/,
    creatinina: /(?:Creat|Cr)[:\s]*(\d[.,]\d{1,2})/i,
    hematocrito: /(?:Hct|Hto|HCT)[:\s]*(\d{2})/i,
    hemoglobina: /(?:Hb|Hgb)[:\s]*(\d{1,2}[.,]?\d?)/i
  }
  
  for (const [campo, regex] of Object.entries(patrones)) {
    const match = textoOCR.match(regex)
    if (match) {
      const valor = match[1].replace(',', '.')
      const num = parseFloat(valor)
      if (!isNaN(num)) {
        resultado[campo] = num
      }
    }
  }
  
  return resultado
}

export async function liberar() {
  if (workerInstance) {
    await workerInstance.terminate()
    workerInstance = null
  }
}
