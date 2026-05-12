const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function guardarHistoriaClinicaSupabase(payload) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/historias_clinicas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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

export async function generarHistoriaConGemini({ apiKey, datosPaciente, dictado }) {
  if (!apiKey) throw new Error('Falta API key de Gemini')

  const prompt = `Sos un médico intensivista. Generá una historia clínica breve y estructurada en español rioplatense.\nDatos de paciente: ${JSON.stringify(datosPaciente)}\nDictado del médico: ${dictado}\n\nFormato:\n1) Motivo de internación\n2) Estado actual (hemodinámico, respiratorio, neurológico, renal)\n3) Estudios relevantes\n4) Impresión diagnóstica\n5) Plan`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini error: ${response.status} ${errText}`)
  }

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
