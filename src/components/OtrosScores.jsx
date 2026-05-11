import { useState } from 'react'
import { CampoInput } from './CampoInput'
import { calcularNEWS2, calcularCURB65, calcularWells, calcularGlasgow } from '../lib/scores'

const SCORES = [
  { id: 'glasgow', label: 'Glasgow detallado', icon: '🧠' },
  { id: 'news2', label: 'NEWS2', icon: '⚡' },
  { id: 'curb65', label: 'CURB-65', icon: '🫁' },
  { id: 'wells', label: 'Wells (TEP)', icon: '💉' }
]

export function OtrosScores() {
  const [activo, setActivo] = useState(null)
  
  if (!activo) {
    return (
      <div className="card">
        <div className="section-title">Elegí un score</div>
        <div className="score-grid">
          {SCORES.map(s => (
            <button key={s.id} className="score-card" onClick={() => setActivo(s.id)}>
              <div className="score-icon">{s.icon}</div>
              <div className="score-card-label">{s.label}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <button className="btn btn-secondary btn-block" onClick={() => setActivo(null)}
        style={{ marginBottom: 16 }}>
        ← Volver
      </button>
      {activo === 'glasgow' && <GlasgowDetallado />}
      {activo === 'news2' && <NEWS2Form />}
      {activo === 'curb65' && <CURB65Form />}
      {activo === 'wells' && <WellsForm />}
    </div>
  )
}

function GlasgowDetallado() {
  const [ocular, setOcular] = useState('4')
  const [verbal, setVerbal] = useState('5')
  const [motor, setMotor] = useState('6')
  const r = calcularGlasgow(ocular, verbal, motor)
  
  return (
    <>
      <div className="card">
        <div className="section-title">Apertura ocular (E)</div>
        {[
          { v: '4', label: 'Espontánea' },
          { v: '3', label: 'A la voz' },
          { v: '2', label: 'Al dolor' },
          { v: '1', label: 'Sin respuesta' }
        ].map(o => (
          <button 
            key={o.v}
            className={`opcion-btn ${ocular === o.v ? 'selected' : ''}`}
            onClick={() => setOcular(o.v)}
          >
            <span className="opcion-num">{o.v}</span>
            <span className="opcion-label">{o.label}</span>
          </button>
        ))}
      </div>
      
      <div className="card">
        <div className="section-title">Respuesta verbal (V)</div>
        {[
          { v: '5', label: 'Orientada' },
          { v: '4', label: 'Confusa' },
          { v: '3', label: 'Palabras inapropiadas' },
          { v: '2', label: 'Sonidos incomprensibles' },
          { v: '1', label: 'Sin respuesta' }
        ].map(o => (
          <button 
            key={o.v}
            className={`opcion-btn ${verbal === o.v ? 'selected' : ''}`}
            onClick={() => setVerbal(o.v)}
          >
            <span className="opcion-num">{o.v}</span>
            <span className="opcion-label">{o.label}</span>
          </button>
        ))}
      </div>
      
      <div className="card">
        <div className="section-title">Respuesta motora (M)</div>
        {[
          { v: '6', label: 'Obedece órdenes' },
          { v: '5', label: 'Localiza dolor' },
          { v: '4', label: 'Retira al dolor' },
          { v: '3', label: 'Flexión anormal (decorticación)' },
          { v: '2', label: 'Extensión anormal (descerebración)' },
          { v: '1', label: 'Sin respuesta' }
        ].map(o => (
          <button 
            key={o.v}
            className={`opcion-btn ${motor === o.v ? 'selected' : ''}`}
            onClick={() => setMotor(o.v)}
          >
            <span className="opcion-num">{o.v}</span>
            <span className="opcion-label">{o.label}</span>
          </button>
        ))}
      </div>
      
      <div className={`score-display ${r.score >= 13 ? 'verde' : r.score >= 9 ? 'amarillo' : r.score >= 6 ? 'naranja' : 'rojo'}`}>
        <div className="score-label">Glasgow</div>
        <div className="score-number">{r.score}</div>
        <div className="score-mortality">E{r.ocular} V{r.verbal} M{r.motor} — {r.interpretacion}</div>
      </div>
    </>
  )
}

function NEWS2Form() {
  const [datos, setDatos] = useState({})
  const r = calcularNEWS2(datos)
  const update = (k, v) => setDatos(prev => ({ ...prev, [k]: v }))
  
  return (
    <>
      <div className="card">
        <div className="section-title">NEWS2 — Detección temprana de deterioro</div>
        <CampoInput label="Frecuencia respiratoria" suffix="rpm" 
          value={datos.fr} onChange={v => update('fr', v)} campo="fr" />
        <CampoInput label="Saturación O2" suffix="%" 
          value={datos.sato2} onChange={v => update('sato2', v)} campo="sato2" />
        <div className="toggle-row">
          <span className="toggle-label">Recibe oxígeno suplementario</span>
          <input type="checkbox" checked={!!datos.oxigenoSuplementario}
            onChange={e => update('oxigenoSuplementario', e.target.checked)} />
        </div>
        <CampoInput label="TAS" suffix="mmHg" 
          value={datos.tas} onChange={v => update('tas', v)} campo="tas" />
        <CampoInput label="Frecuencia cardíaca" suffix="lpm" 
          value={datos.fc} onChange={v => update('fc', v)} campo="fc" />
        <div className="toggle-row">
          <span className="toggle-label">Alteración del estado de conciencia</span>
          <input type="checkbox" checked={!!datos.alteracionConciencia}
            onChange={e => update('alteracionConciencia', e.target.checked)} />
        </div>
        <CampoInput label="Temperatura" suffix="°C" 
          value={datos.temperatura} onChange={v => update('temperatura', v)} campo="temperatura" />
      </div>
      
      <div className={`score-display ${r.categoria}`}>
        <div className="score-label">NEWS2</div>
        <div className="score-number">{r.score}</div>
      </div>
      
      <div className={`interpretation-card ${r.categoria}`}>
        <div className="interpretation-title">Recomendación</div>
        <div className="interpretation-message">{r.recomendacion}</div>
      </div>
    </>
  )
}

function CURB65Form() {
  const [datos, setDatos] = useState({})
  const r = calcularCURB65(datos)
  const update = (k, v) => setDatos(prev => ({ ...prev, [k]: v }))
  
  return (
    <>
      <div className="card">
        <div className="section-title">CURB-65 — Severidad de neumonía</div>
        <div className="toggle-row">
          <span className="toggle-label">Confusión (nuevo)</span>
          <input type="checkbox" checked={!!datos.confusion}
            onChange={e => update('confusion', e.target.checked)} />
        </div>
        <CampoInput label="Urea" suffix="mmol/L" hint="(>7 = positivo)"
          value={datos.urea} onChange={v => update('urea', v)} />
        <CampoInput label="Frecuencia respiratoria" suffix="rpm" 
          value={datos.fr} onChange={v => update('fr', v)} campo="fr" />
        <CampoInput label="TAS" suffix="mmHg" 
          value={datos.tas} onChange={v => update('tas', v)} campo="tas" />
        <CampoInput label="PAD" suffix="mmHg" 
          value={datos.pad} onChange={v => update('pad', v)} campo="pad" />
        <CampoInput label="Edad" suffix="años" 
          value={datos.edad} onChange={v => update('edad', v)} campo="edad" />
      </div>
      
      <div className={`score-display ${r.categoria}`}>
        <div className="score-label">CURB-65</div>
        <div className="score-number">{r.score}</div>
        <div className="score-mortality">Mortalidad ~{r.mortalidad}%</div>
      </div>
      
      <div className={`interpretation-card ${r.categoria}`}>
        <div className="interpretation-message">{r.recomendacion}</div>
      </div>
      
      <div className="card">
        <div className="section-title">Criterios</div>
        {r.items.map(i => (
          <div key={i.id} className="criterio-row">
            <div className={`criterio-dot ${i.activo ? 'activo' : ''}`}></div>
            <span style={{ color: i.activo ? 'var(--text)' : 'var(--text-dim)' }}>
              <strong>{i.id}:</strong> {i.label}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

function WellsForm() {
  const [datos, setDatos] = useState({})
  const r = calcularWells(datos)
  const update = (k, v) => setDatos(prev => ({ ...prev, [k]: v }))
  
  return (
    <>
      <div className="card">
        <div className="section-title">Wells — Probabilidad de TEP</div>
        <CampoInput label="Frecuencia cardíaca" suffix="lpm" 
          value={datos.fc} onChange={v => update('fc', v)} campo="fc" />
        {[
          { k: 'tvp', label: 'Signos clínicos de TVP' },
          { k: 'tepProbable', label: 'TEP es el dx más probable' },
          { k: 'inmovilizacion', label: 'Inmovilización o cirugía reciente' },
          { k: 'tepPrevio', label: 'TEP/TVP previo' },
          { k: 'hemoptisis', label: 'Hemoptisis' },
          { k: 'cancerActivo', label: 'Cáncer activo' }
        ].map(i => (
          <div className="toggle-row" key={i.k}>
            <span className="toggle-label">{i.label}</span>
            <input type="checkbox" checked={!!datos[i.k]}
              onChange={e => update(i.k, e.target.checked)} />
          </div>
        ))}
      </div>
      
      <div className={`score-display ${r.categoria}`}>
        <div className="score-label">Wells</div>
        <div className="score-number">{r.score}</div>
        <div className="score-mortality">{r.probabilidad}</div>
      </div>
      
      <div className={`interpretation-card ${r.categoria}`}>
        <div className="interpretation-message">{r.recomendacion}</div>
      </div>
    </>
  )
}
