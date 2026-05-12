const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash').replace('models/', '')

function getHeaders() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
  }

  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
  }
}

export async function listarPacientesSupabase() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/pacientes?select=id,nombre,apodo&order=updated_at.desc.nullslast,nombre.asc`, {
    headers: getHeaders()
  })

  if (!response.ok) throw new Error(`No se pudieron cargar pacientes (${response.status})`)
  return response.json()
}

export async function eliminarPacienteSupabase(id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/pacientes?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      ...getHeaders(),
      Prefer: 'return=minimal'
    }
  })

  if (!response.ok) throw new Error(`No se pudo eliminar el paciente (${response.status})`)
}

export async function guardarHistoriaClinicaSupabase(payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/historias_clinicas`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Supabase error: ${response.status} ${errText}`)
  }

  return response.json()
}

async function modelosCompatibles() {
  const candidatosDefault = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash']
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`)
    if (!response.ok) return [GEMINI_MODEL, ...candidatosDefault]
    const data = await response.json()
    const compatibles = (data.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => m.name.replace('models/', ''))
    return Array.from(new Set([GEMINI_MODEL, ...compatibles, ...candidatosDefault]))
  } catch {
    return [GEMINI_MODEL, ...candidatosDefault]
  }
}

export async function generarHistoriaConGemini({ datosPaciente, dictado }) {
  if (!GEMINI_API_KEY) throw new Error('Configurar VITE_GEMINI_API_KEY')

  const prompt = `Sos un médico intensivista. Generá una historia clínica breve y estructurada en español rioplatense.\nDatos de paciente: ${JSON.stringify(datosPaciente)}\nDictado del médico: ${dictado}\n\nFormato:\n1) Motivo de internación\n2) Estado actual (hemodinámico, respiratorio, neurológico, renal)\n3) Estudios relevantes\n4) Impresión diagnóstica\n5) Plan`

  const modelos = await modelosCompatibles()
  let ultimoError = ''

  for (const model of modelos) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }

    ultimoError = await response.text()
    if (response.status !== 404) {
      throw new Error(`Gemini error: ${response.status} ${ultimoError}`)
    }
  }

  throw new Error(`Gemini error: 404 Ningún modelo disponible para generateContent. Último detalle: ${ultimoError}`)
}
