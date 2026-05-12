import { useState, useRef, useEffect } from 'react'
import { CampoInput } from './CampoInput'
import { calcularApacheII } from '../lib/apache'
import { interpretar } from '../lib/interpretacion'
import { guardarHistorial } from '../lib/version'
import { parsearDictadoCompleto } from '../lib/dictadoBloque'
import { crearReconocedor } from '../lib/voz'
import { validarCoherencia } from '../lib/validacion'
import { seedFromMemory, updateSessionMemory } from '../lib/sessionMemory'

const PASOS = [
  'signos', 'oxigeno', 'gases', 'electrolitos', 'sangre', 'edad', 'resultado'
]

const TIPOS_INGRESO = [
  { id: 'general', label: 'General' },
  { id: 'sepsis', label: 'Sepsis / Shock séptico' },
  { id: 'neurocritico', label: 'Neurocrítico' },
  { id: 'sdra', label: 'SDRA / Insuf. respiratoria' },
  { id: 'postquirurgico', label: 'Postquirúrgico' }
]

export function CalculadoraApache({ onResultado }) {
  const [modo, setModo] = useState('wizard')  // 'wizard' o 'experto'
  const [paso, setPaso] = useState(0)
  const [datos, setDatos] = useState(() => {
    const guardado = sessionStorage.getItem('apacheWIP')
    return seedFromMemory(guardado ? JSON.parse(guardado) : { tipoIngreso: 'general' })
  })
  const [dictando, setDictando] = useState(false)
  const [mensajeDictado, setMensajeDictado] = useState('')
  const [guardadoOK, setGuardadoOK] = useState(false)
  const recognitionRef = useRef(null)
  
  const update = (key, value) => {
    const nuevo = { ...datos, [key]: value }
    setDatos(nuevo)
    sessionStorage.setItem('apacheWIP', JSON.stringify(nuevo))
    updateSessionMemory(nuevo)
  }
  
  const updateMultiple = (campos) => {
    const nuevo = { ...datos, ...campos }
    setDatos(nuevo)
    sessionStorage.setItem('apacheWIP', JSON.stringify(nuevo))
    updateSessionMemory(nuevo)
  }
  
  const dictarBloque = () => {
    if (dictando) {
      recognitionRef.current?.stop()
      setDictando(false)
      return
    }
    
    const rec = crearReconocedor(
      (texto) => {
        const { datos: parsed, noReconocido } = parsearDictadoCompleto(texto)
        if (Object.keys(parsed).length > 0) {
          updateMultiple(parsed)
          const campos = Object.keys(parsed).join(', ')
          setMensajeDictado(`✓ Cargados: ${campos}`)
        } else {
          setMensajeDictado('No se pudo identificar campos. Probá con frases como "frecuencia cardíaca 90, presión media 72".')
        }
        setDictando(false)
        setTimeout(() => setMensajeDictado(''), 4000)
      },
      (err) => {
        setMensajeDictado(`Error: ${err}`)
        setDictando(false)
      }
    )
    
    if (rec) {
      // Modo continuo y largo para dictado completo
      rec.continuous = false
      rec.maxAlternatives = 1
      recognitionRef.current = rec
      rec.start()
      setDictando(true)
    }
  }
  
  const siguiente = () => paso < PASOS.length - 1 && setPaso(paso + 1)
  const anterior = () => paso > 0 && setPaso(paso - 1)
  
  const reset = () => {
    sessionStorage.removeItem('apacheWIP')
    setDatos({ tipoIngreso: 'general' })
    setPaso(0)
  }
  
  const resultado = (modo === 'experto' || paso === PASOS.length - 1) ? calcularApacheII(datos) : null
  const interp = resultado ? interpretar(resultado.score, datos.tipoIngreso) : null
  const alertasCoherencia = validarCoherencia(datos)
  
  // Notificar al padre solo cuando cambia el resultado, no en cada render
  useEffect(() => {
    if (resultado && onResultado) {
      onResultado({ ...datos, ...resultado, interpretacion: interp })
    }
  }, [resultado?.score, interp?.color, datos.tipoIngreso, datos.etiqueta])
  
  const guardar = () => {
    if (!resultado) return
    guardarHistorial({
      tipo: 'apache2',
      etiqueta: datos.etiqueta || `APACHE ${datos.tipoIngreso || 'general'}`,
      score: resultado.score,
      categoria: resultado.categoria,
      datos: { ...datos, mortalidad: resultado.mortalidad }
    })
    setGuardadoOK(true)
    setTimeout(() => setGuardadoOK(false), 2000)
  }
  
  return (
    <div>
      <div className="vista-toggle">
        <button 
          className={`vista-btn ${modo === 'wizard' ? 'active' : ''}`}
          onClick={() => setModo('wizard')}
        >
          Paso a paso
        </button>
        <button 
          className={`vista-btn ${modo === 'experto' ? 'active' : ''}`}
          onClick={() => setModo('experto')}
        >
          Modo experto
        </button>
      </div>
      
      <div className="dictado-bloque">
        <button 
          className={`btn-dictado ${dictando ? 'listening' : ''}`}
          onClick={dictarBloque}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          </svg>
          {dictando ? 'Escuchando... (decí todos los datos juntos)' : 'Dictar varios campos'}
        </button>
        {mensajeDictado && (
          <div className="dictado-mensaje">{mensajeDictado}</div>
        )}
      </div>
      
      {alertasCoherencia.length > 0 && (
        <div className="warning-banner">
          <strong>⚠ Posibles inconsistencias:</strong>
          {alertasCoherencia.map((a, i) => (
            <div key={i}>• {a.mensaje}</div>
          ))}
        </div>
      )}
      
      {modo === 'wizard' && (
        <>
          <div className="progress">
            {PASOS.map((_, i) => (
              <div key={i} 
                className={`progress-step ${i < paso ? 'completed' : i === paso ? 'current' : ''}`} />
            ))}
          </div>
          
          {paso === 0 && (
            <div className="card">
              <div className="section-title">Etiqueta (opcional)</div>
              <CampoInput
                label="Identificador del paciente"
                value={datos.etiqueta || ''}
                onChange={v => update('etiqueta', v)}
                type="text" inputMode="text" withMic={false}
                placeholder="Ej: Cama 7, HC 1234"
              />
              
              <div className="section-title" style={{ marginTop: 16 }}>Tipo de ingreso</div>
              <select value={datos.tipoIngreso || 'general'}
                onChange={e => update('tipoIngreso', e.target.value)} style={{ marginBottom: 20 }}>
                {TIPOS_INGRESO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              
              <div className="section-title">Signos vitales</div>
              <CampoInput label="Frecuencia cardíaca" hint="lpm" value={datos.fc} 
                onChange={v => update('fc', v)} campo="fc" />
              <CampoInput label="Presión arterial media" hint="mmHg" value={datos.pam} 
                onChange={v => update('pam', v)} campo="pam" />
              <CampoInput label="Frecuencia respiratoria" hint="rpm" value={datos.fr} 
                onChange={v => update('fr', v)} campo="fr" />
              <CampoInput label="Temperatura" hint="°C rectal" value={datos.temperatura} 
                onChange={v => update('temperatura', v)} campo="temperatura" />
            </div>
          )}
          
          {paso === 1 && (
            <div className="card">
              <div className="section-title">Oxigenación</div>
              <CampoInput label="FiO2" hint="0.21 a 1.0" value={datos.fio2} 
                onChange={v => update('fio2', v)} campo="fio2" />
              <CampoInput label="PaO2" hint="mmHg" value={datos.pao2} 
                onChange={v => update('pao2', v)} campo="pao2" />
              {datos.fio2 && Number(datos.fio2) >= 0.5 && (
                <CampoInput label="PaCO2" hint="mmHg (para A-aDO2)" value={datos.paco2} 
                  onChange={v => update('paco2', v)} campo="paco2" />
              )}
              <CampoInput label="Glasgow" hint="3 a 15" value={datos.glasgow} 
                onChange={v => update('glasgow', v)} campo="glasgow" />
            </div>
          )}
          
          {paso === 2 && (
            <div className="card">
              <div className="section-title">Gases en sangre</div>
              <CampoInput label="pH arterial" value={datos.ph} 
                onChange={v => update('ph', v)} campo="ph" placeholder="7.40" />
            </div>
          )}
          
          {paso === 3 && (
            <div className="card">
              <div className="section-title">Electrolitos y función renal</div>
              <CampoInput label="Sodio sérico" hint="mEq/L" value={datos.sodio} 
                onChange={v => update('sodio', v)} campo="sodio" />
              <CampoInput label="Potasio sérico" hint="mEq/L" value={datos.potasio} 
                onChange={v => update('potasio', v)} campo="potasio" />
              <CampoInput label="Creatinina" hint="mg/dL" value={datos.creatinina} 
                onChange={v => update('creatinina', v)} campo="creatinina" />
              <div className="toggle-row">
                <span className="toggle-label">Insuficiencia renal aguda</span>
                <input type="checkbox" checked={!!datos.ira} 
                  onChange={e => update('ira', e.target.checked)} />
              </div>
            </div>
          )}
          
          {paso === 4 && (
            <div className="card">
              <div className="section-title">Hematología</div>
              <CampoInput label="Hematocrito" hint="%" value={datos.hematocrito} 
                onChange={v => update('hematocrito', v)} campo="hematocrito" />
              <CampoInput label="Leucocitos" hint="×1000/mm³ o valor absoluto" 
                value={datos.leucocitos} onChange={v => update('leucocitos', v)} campo="leucocitos" />
            </div>
          )}
          
          {paso === 5 && (
            <div className="card">
              <div className="section-title">Edad y comorbilidades</div>
              <CampoInput label="Edad" hint="años" value={datos.edad} 
                onChange={v => update('edad', v)} campo="edad" />
              <div className="toggle-row">
                <span className="toggle-label">
                  Comorbilidad crónica severa<br/>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Cirrosis, NYHA IV, EPOC severo, diálisis, inmunocompromiso
                  </span>
                </span>
                <input type="checkbox" checked={!!datos.comorbilidades} 
                  onChange={e => update('comorbilidades', e.target.checked)} />
              </div>
            </div>
          )}
        </>
      )}
      
      {modo === 'experto' && (
        <div className="card experto-grid">
          <div className="section-title">Modo experto — todos los campos</div>
          
          <CampoInput
            label="Etiqueta"
            value={datos.etiqueta || ''}
            onChange={v => update('etiqueta', v)}
            type="text" inputMode="text" withMic={false}
            placeholder="Ej: Cama 7"
          />
          
          <div className="field">
            <label className="field-label">Tipo de ingreso</label>
            <select value={datos.tipoIngreso || 'general'}
              onChange={e => update('tipoIngreso', e.target.value)}>
              {TIPOS_INGRESO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          
          <CampoInput label="FC" hint="lpm" value={datos.fc} onChange={v => update('fc', v)} campo="fc" />
          <CampoInput label="PAM" hint="mmHg" value={datos.pam} onChange={v => update('pam', v)} campo="pam" />
          <CampoInput label="FR" hint="rpm" value={datos.fr} onChange={v => update('fr', v)} campo="fr" />
          <CampoInput label="Temp" hint="°C" value={datos.temperatura} onChange={v => update('temperatura', v)} campo="temperatura" />
          <CampoInput label="FiO2" value={datos.fio2} onChange={v => update('fio2', v)} campo="fio2" />
          <CampoInput label="PaO2" hint="mmHg" value={datos.pao2} onChange={v => update('pao2', v)} campo="pao2" />
          <CampoInput label="PaCO2" hint="mmHg" value={datos.paco2} onChange={v => update('paco2', v)} campo="paco2" />
          <CampoInput label="pH" value={datos.ph} onChange={v => update('ph', v)} campo="ph" />
          <CampoInput label="Na" hint="mEq/L" value={datos.sodio} onChange={v => update('sodio', v)} campo="sodio" />
          <CampoInput label="K" hint="mEq/L" value={datos.potasio} onChange={v => update('potasio', v)} campo="potasio" />
          <CampoInput label="Creat" hint="mg/dL" value={datos.creatinina} onChange={v => update('creatinina', v)} campo="creatinina" />
          <CampoInput label="Hto" hint="%" value={datos.hematocrito} onChange={v => update('hematocrito', v)} campo="hematocrito" />
          <CampoInput label="Leucos" hint="×10³" value={datos.leucocitos} onChange={v => update('leucocitos', v)} campo="leucocitos" />
          <CampoInput label="GCS" hint="3-15" value={datos.glasgow} onChange={v => update('glasgow', v)} campo="glasgow" />
          <CampoInput label="Edad" hint="años" value={datos.edad} onChange={v => update('edad', v)} campo="edad" />
          
          <div className="toggle-row">
            <span className="toggle-label">IRA</span>
            <input type="checkbox" checked={!!datos.ira} onChange={e => update('ira', e.target.checked)} />
          </div>
          <div className="toggle-row">
            <span className="toggle-label">Comorbilidad crónica</span>
            <input type="checkbox" checked={!!datos.comorbilidades} onChange={e => update('comorbilidades', e.target.checked)} />
          </div>
        </div>
      )}
      
      {resultado && interp && (modo === 'experto' || paso === PASOS.length - 1) && (
        <>
          <div className={`score-display ${interp.color}`}>
            <div className="score-label">APACHE II</div>
            <div className="score-number">{resultado.score}</div>
            <div className="score-mortality">
              Mortalidad estimada: {resultado.mortalidad}%
            </div>
          </div>
          
          <div className={`interpretation-card ${interp.color}`}>
            <div className="interpretation-title">{interp.titulo}</div>
            <div className="interpretation-message">{interp.mensaje}</div>
          </div>
          
          {modo === 'wizard' && (
            <div className="card">
              <div className="section-title">Desglose</div>
              <div className="breakdown">
                {Object.entries(resultado.desglose).map(([k, v]) => (
                  <div className="breakdown-row" key={k}>
                    <span className="breakdown-label">{labelsDesglose[k] || k}</span>
                    <span className="breakdown-value">{v} pts</span>
                  </div>
                ))}
                <div className="breakdown-row">
                  <span>Total</span><span>{resultado.score} pts</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="wizard-nav">
        {modo === 'wizard' && paso > 0 && (
          <button className="btn btn-secondary" onClick={anterior}>← Atrás</button>
        )}
        {modo === 'wizard' && paso < PASOS.length - 1 && (
          <button className="btn btn-primary" onClick={siguiente}>Siguiente →</button>
        )}
        {modo === 'wizard' && paso === PASOS.length - 1 && (
          <>
            <button className="btn btn-secondary" onClick={reset}>Nuevo</button>
            <button className="btn btn-primary" onClick={guardar}>
              {guardadoOK ? '✓ Guardado' : '💾 Guardar'}
            </button>
          </>
        )}
        {modo === 'experto' && (
          <>
            <button className="btn btn-secondary" onClick={reset}>Limpiar</button>
            <button className="btn btn-primary" onClick={guardar} disabled={!resultado}>
              {guardadoOK ? '✓ Guardado' : '💾 Guardar'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const labelsDesglose = {
  temperatura: 'Temperatura', pam: 'PAM', fc: 'Frec. cardíaca', fr: 'Frec. respiratoria',
  oxigenacion: 'Oxigenación', ph: 'pH', sodio: 'Sodio', potasio: 'Potasio',
  creatinina: 'Creatinina', hematocrito: 'Hematocrito', leucocitos: 'Leucocitos',
  glasgow: 'Glasgow', edad: 'Edad', comorbilidades: 'Comorbilidades'
}
