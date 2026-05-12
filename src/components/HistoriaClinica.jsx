import { useMemo, useState } from 'react'
import { crearReconocedor } from '../lib/voz'
import { generarHistoriaConGemini, guardarHistoriaClinicaSupabase } from '../lib/supabase'
import { obtenerHistorial } from '../lib/version'
import { getSessionMemory } from '../lib/sessionMemory'

export function HistoriaClinica({ apacheData, sofaData }) {
  const [pacienteId, setPacienteId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [dictado, setDictado] = useState('')
  const [historia, setHistoria] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const datosPaciente = useMemo(() => {
    const historial = obtenerHistorial()
    const ultimosScores = historial.slice(0, 10).map(item => ({
      tipo: item.tipo,
      score: item.score,
      categoria: item.categoria,
      timestamp: item.timestamp,
      datos: item.datos
    }))

    return {
      apache: apacheData,
      sofa: sofaData,
      otrosScores: ultimosScores,
      memoriaSesion: getSessionMemory()
    }
  }, [apacheData, sofaData])

  const iniciarDictado = () => {
    const rec = crearReconocedor(
      (texto) => setDictado(prev => `${prev} ${texto}`.trim()),
      (err) => setMsg(err)
    )
    rec?.start()
  }

  const generar = async () => {
    try {
      setLoading(true)
      const texto = await generarHistoriaConGemini({ apiKey, datosPaciente, dictado })
      setHistoria(texto)
      setMsg('Historia clínica generada')
    } catch (e) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  const guardar = async () => {
    try {
      setLoading(true)
      await guardarHistoriaClinicaSupabase({
        paciente_id: pacienteId,
        dictado,
        historia,
        datos_paciente: datosPaciente,
        created_at: new Date().toISOString()
      })
      setMsg('Historia clínica guardada en Supabase')
    } catch (e) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  const exportarDoc = () => {
    const contenido = `Historia Clínica\n\nPaciente: ${pacienteId}\n\n${historia}`
    const blob = new Blob([contenido], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historia-clinica-${pacienteId || 'paciente'}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="card">
        <div className="section-title">Historia clínica asistida</div>
        <label>ID de paciente</label>
        <input value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} placeholder="HC-1234" />
        <label style={{ marginTop: 10 }}>Gemini API Key</label>
        <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIza..." type="password" />
        <label style={{ marginTop: 10 }}>Dictado médico</label>
        <textarea value={dictado} onChange={(e) => setDictado(e.target.value)} placeholder="Dictar evolución, examen físico, conducta..." />

        <div className="wizard-nav">
          <button className="btn btn-secondary" onClick={iniciarDictado}>🎙 Dictar</button>
          <button className="btn btn-primary" onClick={generar} disabled={loading}>Generar historia</button>
        </div>
      </div>

      {historia && (
        <div className="card">
          <div className="section-title">Documento de historia clínica</div>
          <textarea value={historia} onChange={(e) => setHistoria(e.target.value)} />
          <div className="wizard-nav">
            <button className="btn btn-primary" onClick={guardar} disabled={loading}>Guardar en Supabase</button>
            <button className="btn btn-secondary" onClick={exportarDoc}>Exportar .doc</button>
          </div>
        </div>
      )}

      {msg && <div className="toast">{msg}</div>}
    </div>
  )
}
