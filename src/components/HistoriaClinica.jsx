import { useEffect, useMemo, useState } from 'react'
import { crearReconocedor } from '../lib/voz'
import {
  eliminarPacienteSupabase,
  generarHistoriaConGemini,
  guardarHistoriaClinicaSupabase,
  listarPacientesSupabase
} from '../lib/supabase'
import { obtenerHistorial } from '../lib/version'
import { getSessionMemory } from '../lib/sessionMemory'

export function HistoriaClinica({ apacheData, sofaData }) {
  const [pacientes, setPacientes] = useState([])
  const [pacienteId, setPacienteId] = useState('')
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

  const cargarPacientes = async () => {
    try {
      const rows = await listarPacientesSupabase()
      setPacientes(rows)
      if (!pacienteId && rows.length > 0) setPacienteId(String(rows[0].id))
    } catch (e) {
      setMsg(e.message)
    }
  }

  useEffect(() => {
    cargarPacientes()
  }, [])

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
      const texto = await generarHistoriaConGemini({ datosPaciente, dictado })
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
      if (!pacienteId) throw new Error('Seleccioná un paciente')
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

  const eliminarPaciente = async (id) => {
    if (!window.confirm('¿Eliminar paciente de la base?')) return
    try {
      await eliminarPacienteSupabase(id)
      setMsg('Paciente eliminado')
      await cargarPacientes()
    } catch (e) {
      setMsg(e.message)
    }
  }

  const exportarDoc = () => {
    const paciente = pacientes.find(p => String(p.id) === String(pacienteId))
    const nombre = paciente?.apodo || paciente?.nombre || 'paciente'
    const contenido = `Historia Clínica\n\nPaciente: ${nombre}\n\n${historia}`
    const blob = new Blob([contenido], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historia-clinica-${nombre}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="card">
        <div className="section-title">Historia clínica asistida</div>
        <label>Paciente</label>
        <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
          <option value="">Seleccionar paciente...</option>
          {pacientes.map(p => (
            <option key={p.id} value={p.id}>{p.apodo || p.nombre || `Paciente ${p.id}`}</option>
          ))}
        </select>

        <label style={{ marginTop: 10 }}>Dictado médico</label>
        <textarea value={dictado} onChange={(e) => setDictado(e.target.value)} placeholder="Dictar evolución, examen físico, conducta..." />

        <div className="wizard-nav">
          <button className="btn btn-secondary" onClick={iniciarDictado}>🎙 Dictar</button>
          <button className="btn btn-primary" onClick={generar} disabled={loading}>Generar historia</button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Gestión de pacientes</div>
        {pacientes.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No hay pacientes cargados.</div>}
        {pacientes.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>{p.apodo || p.nombre || `Paciente ${p.id}`}</div>
            <button className="btn btn-secondary" onClick={() => eliminarPaciente(p.id)}>Eliminar</button>
          </div>
        ))}
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
