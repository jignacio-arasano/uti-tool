import { useState, useEffect } from 'react'
import { CampoInput } from './CampoInput'
import { calcularSOFA, calcularQSOFA } from '../lib/sofa'
import { guardarHistorial } from '../lib/version'
import { seedFromMemory, updateSessionMemory } from '../lib/sessionMemory'

export function CalculadoraSOFA({ onResultado }) {
  const [vista, setVista] = useState('sofa')  // 'sofa' o 'qsofa'
  const [datos, setDatos] = useState(() => {
    const guardado = sessionStorage.getItem('sofaWIP')
    return seedFromMemory(guardado ? JSON.parse(guardado) : {})
  })
  const [guardado, setGuardado] = useState(false)
  
  const update = (k, v) => {
    const nuevo = { ...datos, [k]: v }
    setDatos(nuevo)
    sessionStorage.setItem('sofaWIP', JSON.stringify(nuevo))
    updateSessionMemory(nuevo)
  }
  
  const sofa = calcularSOFA(datos)
  const qsofa = calcularQSOFA({ glasgow: datos.glasgow, tas: datos.tas, fr: datos.fr })
  
  useEffect(() => {
    if (onResultado) onResultado({ sofa, qsofa, datos })
  }, [datos])
  
  const guardarEnHistorial = () => {
    guardarHistorial({
      tipo: 'sofa',
      etiqueta: datos.etiqueta || 'Cálculo SOFA',
      score: sofa.score,
      categoria: sofa.categoria,
      datos: { ...datos }
    })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }
  
  const reset = () => {
    sessionStorage.removeItem('sofaWIP')
    setDatos({})
  }
  
  return (
    <div>
      <div className="vista-toggle">
        <button 
          className={`vista-btn ${vista === 'sofa' ? 'active' : ''}`}
          onClick={() => setVista('sofa')}
        >
          SOFA completo
        </button>
        <button 
          className={`vista-btn ${vista === 'qsofa' ? 'active' : ''}`}
          onClick={() => setVista('qsofa')}
        >
          qSOFA rápido
        </button>
      </div>
      
      {vista === 'qsofa' && (
        <>
          <div className="card">
            <div className="section-title">qSOFA — sepsis fuera de UTI</div>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
              ≥2 puntos sugiere mayor riesgo de mortalidad por sepsis.
            </p>
            <CampoInput label="Glasgow" hint="3-15" value={datos.glasgow} 
              onChange={v => update('glasgow', v)} campo="glasgow" />
            <CampoInput label="TAS" suffix="mmHg" value={datos.tas} 
              onChange={v => update('tas', v)} campo="tas" />
            <CampoInput label="Frecuencia respiratoria" suffix="rpm" value={datos.fr} 
              onChange={v => update('fr', v)} campo="fr" />
          </div>
          
          <div className={`score-display ${qsofa.positivo ? 'rojo' : 'verde'}`}>
            <div className="score-label">qSOFA</div>
            <div className="score-number">{qsofa.score}</div>
            <div className="score-mortality">
              {qsofa.positivo ? '⚠ Positivo (≥2)' : 'Negativo (<2)'}
            </div>
          </div>
          
          <div className="card">
            <div className="section-title">Criterios</div>
            {qsofa.items.map(i => (
              <div key={i.id} className="criterio-row">
                <div className={`criterio-dot ${i.activo ? 'activo' : ''}`}></div>
                <span style={{ color: i.activo ? 'var(--text)' : 'var(--text-dim)' }}>
                  {i.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      
      {vista === 'sofa' && (
        <>
          <div className="card">
            <div className="section-title">Etiqueta (opcional)</div>
            <CampoInput
              label="Identificador del paciente"
              value={datos.etiqueta || ''}
              onChange={v => update('etiqueta', v)}
              type="text"
              inputMode="text"
              placeholder="Ej: Cama 7, HC 1234"
              withMic={false}
              hint="Solo se guarda en sesión"
            />
          </div>
          
          <div className="card">
            <div className="section-title">1. Respiratorio (PaO2/FiO2)</div>
            <CampoInput label="PaO2" suffix="mmHg" value={datos.pao2} 
              onChange={v => update('pao2', v)} campo="pao2" />
            <CampoInput label="FiO2" hint="0.21 a 1.0" value={datos.fio2} 
              onChange={v => update('fio2', v)} campo="fio2" />
            <div className="toggle-row">
              <span className="toggle-label">Ventilación mecánica</span>
              <input type="checkbox" checked={!!datos.ventilacionMecanica}
                onChange={e => update('ventilacionMecanica', e.target.checked)} />
            </div>
            <div className="puntos-actuales">{sofa.desglose.respiratorio} pts</div>
          </div>
          
          <div className="card">
            <div className="section-title">2. Coagulación</div>
            <CampoInput label="Plaquetas" hint="×10³/μL o absoluto" 
              value={datos.plaquetas} onChange={v => update('plaquetas', v)} campo="plaquetas" />
            <div className="puntos-actuales">{sofa.desglose.coagulacion} pts</div>
          </div>
          
          <div className="card">
            <div className="section-title">3. Hígado</div>
            <CampoInput label="Bilirrubina total" suffix="mg/dL" 
              value={datos.bilirrubina} onChange={v => update('bilirrubina', v)} campo="bilirrubina" />
            <div className="puntos-actuales">{sofa.desglose.higado} pts</div>
          </div>
          
          <div className="card">
            <div className="section-title">4. Cardiovascular</div>
            <CampoInput label="PAM" suffix="mmHg" value={datos.pam} 
              onChange={v => update('pam', v)} campo="pam" />
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
              Vasopresores activos (mcg/kg/min):
            </div>
            <CampoInput label="Noradrenalina" value={datos.noradrenalina} 
              onChange={v => update('noradrenalina', v)} withMic={false} />
            <CampoInput label="Adrenalina" value={datos.adrenalina} 
              onChange={v => update('adrenalina', v)} withMic={false} />
            <CampoInput label="Dopamina" value={datos.dopamina} 
              onChange={v => update('dopamina', v)} withMic={false} />
            <CampoInput label="Dobutamina" value={datos.dobutamina} 
              onChange={v => update('dobutamina', v)} withMic={false} />
            <div className="puntos-actuales">{sofa.desglose.cardiovascular} pts</div>
          </div>
          
          <div className="card">
            <div className="section-title">5. Neurológico</div>
            <CampoInput label="Glasgow" hint="3-15" value={datos.glasgow} 
              onChange={v => update('glasgow', v)} campo="glasgow" />
            <div className="puntos-actuales">{sofa.desglose.neurologico} pts</div>
          </div>
          
          <div className="card">
            <div className="section-title">6. Renal</div>
            <CampoInput label="Creatinina" suffix="mg/dL" 
              value={datos.creatinina} onChange={v => update('creatinina', v)} campo="creatinina" />
            <CampoInput label="Diuresis 24hs" suffix="ml/día" 
              value={datos.diuresis} onChange={v => update('diuresis', v)} />
            <div className="puntos-actuales">{sofa.desglose.renal} pts</div>
          </div>
          
          <div className={`score-display ${sofa.categoria}`}>
            <div className="score-label">SOFA</div>
            <div className="score-number">{sofa.score}</div>
            <div className="score-mortality">
              Mortalidad estimada: {sofa.mortalidad}%
            </div>
          </div>
          
          <div className="wizard-nav">
            <button className="btn btn-secondary" onClick={reset}>Limpiar</button>
            <button className="btn btn-primary" onClick={guardarEnHistorial}>
              {guardado ? '✓ Guardado' : '💾 Guardar en historial'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
