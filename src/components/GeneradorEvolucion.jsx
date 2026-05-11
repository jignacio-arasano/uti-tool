import { useState, useEffect } from 'react'
import { CampoInput } from './CampoInput'
import { generarEvolucion } from '../lib/evolucion'

export function GeneradorEvolucion({ apacheData, vasopresores }) {
  const [datos, setDatos] = useState({
    diagnostico: '',
    intubado: false,
    modoVent: '',
    peep: '',
    vt: '',
    balance: '',
    lactato: '',
    plan: ['']
  })
  
  const [textoGenerado, setTextoGenerado] = useState('')
  const [showToast, setShowToast] = useState(false)
  
  // Auto-llenar datos del APACHE si existe
  useEffect(() => {
    if (apacheData) {
      setDatos(prev => ({
        ...prev,
        fc: apacheData.fc,
        pam: apacheData.pam,
        fr: apacheData.fr,
        sato2: prev.sato2,
        fio2: apacheData.fio2,
        temperatura: apacheData.temperatura,
        glasgow: apacheData.glasgow,
        creatinina: apacheData.creatinina,
        leucocitos: apacheData.leucocitos,
        ph: apacheData.ph,
        apache: apacheData.score,
        mortalidad: apacheData.mortalidad,
        interpretacion: apacheData.interpretacion?.mensaje
      }))
    }
  }, [apacheData])
  
  const update = (k, v) => setDatos(prev => ({ ...prev, [k]: v }))
  
  const updatePlan = (i, v) => {
    const nuevoPlan = [...datos.plan]
    nuevoPlan[i] = v
    setDatos(prev => ({ ...prev, plan: nuevoPlan }))
  }
  
  const agregarPlan = () => {
    setDatos(prev => ({ ...prev, plan: [...prev.plan, ''] }))
  }
  
  const quitarPlan = (i) => {
    setDatos(prev => ({ 
      ...prev, 
      plan: prev.plan.filter((_, idx) => idx !== i) 
    }))
  }
  
  const generar = () => {
    const datosCompletos = {
      ...datos,
      vasopresores: vasopresores.map(v => ({
        nombre: v.nombre,
        dosis: v.dosis,
        unidad: v.unidad
      })),
      plan: datos.plan.filter(p => p.trim())
    }
    setTextoGenerado(generarEvolucion(datosCompletos))
  }
  
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoGenerado)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = textoGenerado
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    }
  }
  
  return (
    <div>
      <div className="card">
        <div className="section-title">Datos clínicos</div>
        <CampoInput 
          label="Diagnóstico principal" 
          value={datos.diagnostico} 
          onChange={(v) => update('diagnostico', v)} 
          type="text" 
          inputMode="text" 
          placeholder="Ej: Shock séptico de foco abdominal"
        />
        
        <div className="toggle-row" style={{ marginTop: 12 }}>
          <span className="toggle-label">Paciente intubado</span>
          <input 
            type="checkbox" 
            checked={datos.intubado} 
            onChange={(e) => update('intubado', e.target.checked)}
          />
        </div>
        
        {datos.intubado && (
          <div style={{ marginTop: 16 }}>
            <CampoInput 
              label="Modo ventilatorio" 
              value={datos.modoVent} 
              onChange={(v) => update('modoVent', v)} 
              type="text" 
              inputMode="text"
              placeholder="VC, PSV, SIMV..."
            />
            <CampoInput 
              label="PEEP" 
              suffix="cmH2O" 
              value={datos.peep} 
              onChange={(v) => update('peep', v)} 
            />
            <CampoInput 
              label="Volumen tidal" 
              suffix="ml" 
              value={datos.vt} 
              onChange={(v) => update('vt', v)} 
            />
          </div>
        )}
        
        <CampoInput 
          label="SatO2" 
          suffix="%" 
          value={datos.sato2} 
          onChange={(v) => update('sato2', v)} 
        />
        <CampoInput 
          label="Balance hídrico 24hs" 
          suffix="ml" 
          value={datos.balance} 
          onChange={(v) => update('balance', v)} 
        />
        <CampoInput 
          label="Lactato" 
          suffix="mmol/L" 
          value={datos.lactato} 
          onChange={(v) => update('lactato', v)} 
        />
      </div>
      
      <div className="card">
        <div className="section-title">Plan</div>
        {datos.plan.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={p}
              onChange={(e) => updatePlan(i, e.target.value)}
              placeholder={`Punto del plan ${i + 1}`}
            />
            {datos.plan.length > 1 && (
              <button 
                className="vaso-remove"
                onClick={() => quitarPlan(i)}
                style={{ width: 48, height: 48, flexShrink: 0 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        ))}
        <button 
          className="btn btn-secondary btn-block" 
          onClick={agregarPlan}
          style={{ marginTop: 8 }}
        >
          + Agregar punto
        </button>
      </div>
      
      <button 
        className="btn btn-primary btn-block" 
        onClick={generar}
        style={{ marginBottom: 16 }}
      >
        Generar evolución
      </button>
      
      {textoGenerado && (
        <div className="card">
          <div className="section-title">Evolución generada</div>
          <textarea 
            value={textoGenerado}
            onChange={(e) => setTextoGenerado(e.target.value)}
          />
          <button 
            className="btn btn-primary btn-block"
            onClick={copiar}
            style={{ marginTop: 12 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copiar al portapapeles
          </button>
        </div>
      )}
      
      {showToast && <div className="toast">✓ Copiado al portapapeles</div>}
    </div>
  )
}
