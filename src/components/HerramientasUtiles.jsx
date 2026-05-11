import { useState } from 'react'
import { CampoInput } from './CampoInput'
import { catalogoConversores, convertir } from '../lib/unidades'
import { indicesDerivados } from '../lib/scores'
import { antibioticosEmpiricos } from '../lib/antibioticos'

const HERRAMIENTAS = [
  { id: 'conversor', label: 'Conversor de unidades', icon: '🔄' },
  { id: 'indices', label: 'Índices derivados', icon: '📊' },
  { id: 'antibioticos', label: 'Antibióticos empíricos', icon: '💊' }
]

export function HerramientasUtiles() {
  const [activo, setActivo] = useState(null)
  
  if (!activo) {
    return (
      <div className="card">
        <div className="section-title">Herramientas</div>
        <div className="score-grid">
          {HERRAMIENTAS.map(h => (
            <button key={h.id} className="score-card" onClick={() => setActivo(h.id)}>
              <div className="score-icon">{h.icon}</div>
              <div className="score-card-label">{h.label}</div>
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
      {activo === 'conversor' && <ConversorUnidades />}
      {activo === 'indices' && <IndicesDerivados />}
      {activo === 'antibioticos' && <Antibioticos />}
    </div>
  )
}

function ConversorUnidades() {
  const [categoria, setCategoria] = useState('creatinina')
  const cat = catalogoConversores.find(c => c.id === categoria)
  const [conv, setConv] = useState(cat.conversiones[0])
  const [valor, setValor] = useState('')
  
  const resultado = valor ? convertir(categoria, conv, valor) : null
  
  return (
    <div className="card">
      <div className="section-title">Conversor de unidades</div>
      
      <div className="field">
        <label className="field-label">Magnitud</label>
        <select value={categoria} onChange={e => {
          setCategoria(e.target.value)
          setConv(catalogoConversores.find(c => c.id === e.target.value).conversiones[0])
        }}>
          {catalogoConversores.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
      
      <div className="field">
        <label className="field-label">Conversión</label>
        <select value={conv} onChange={e => setConv(e.target.value)}>
          {cat.conversiones.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      
      <CampoInput 
        label="Valor a convertir" 
        value={valor} 
        onChange={setValor}
        withMic={false}
      />
      
      {resultado !== null && (
        <div className="dose-display">
          <div className="dose-value">{resultado}</div>
          <div className="dose-unit">{conv.split('→')[1]?.trim()}</div>
        </div>
      )}
    </div>
  )
}

function IndicesDerivados() {
  const [datos, setDatos] = useState({})
  const update = (k, v) => setDatos(prev => ({ ...prev, [k]: v }))
  
  const indices = [
    { id: 'pafi', label: 'PaO2/FiO2 (PaFi)', fn: () => indicesDerivados.pafi(datos.pao2, datos.fio2),
      campos: [['pao2', 'PaO2', 'mmHg'], ['fio2', 'FiO2', '0.21-1.0']] },
    { id: 'aado2', label: 'Gradiente A-aDO2', fn: () => indicesDerivados.aado2(datos.pao2, datos.fio2, datos.paco2),
      campos: [['pao2', 'PaO2', 'mmHg'], ['fio2', 'FiO2', ''], ['paco2', 'PaCO2', 'mmHg']] },
    { id: 'shock', label: 'Índice de shock (FC/TAS)', fn: () => indicesDerivados.indiceShock(datos.fc, datos.tas),
      campos: [['fc', 'FC', 'lpm'], ['tas', 'TAS', 'mmHg']] },
    { id: 'dp', label: 'Driving Pressure', fn: () => indicesDerivados.drivingPressure(datos.plateau, datos.peep),
      campos: [['plateau', 'Plateau', 'cmH2O'], ['peep', 'PEEP', 'cmH2O']] },
    { id: 'ag', label: 'Anion Gap', fn: () => indicesDerivados.anionGap(datos.sodio, datos.cloro, datos.hco3),
      campos: [['sodio', 'Na', 'mEq/L'], ['cloro', 'Cl', 'mEq/L'], ['hco3', 'HCO3', 'mEq/L']] },
    { id: 'cac', label: 'Calcio corregido', fn: () => indicesDerivados.calcioCorregido(datos.calcio, datos.albumina),
      campos: [['calcio', 'Calcio', 'mg/dL'], ['albumina', 'Albúmina', 'g/dL']] },
    { id: 'fge', label: 'Filtrado glomerular (CKD-EPI)', fn: () => indicesDerivados.fge(datos.creatinina, datos.edad, datos.sexo),
      campos: [['creatinina', 'Creatinina', 'mg/dL'], ['edad', 'Edad', 'años']] }
  ]
  
  return (
    <div>
      {indices.map(idx => {
        const r = idx.fn()
        return (
          <div className="card" key={idx.id}>
            <div className="section-title">{idx.label}</div>
            {idx.campos.map(([campo, label, unidad]) => (
              <CampoInput
                key={campo}
                label={label}
                hint={unidad}
                value={datos[campo]}
                onChange={v => update(campo, v)}
                campo={campo}
              />
            ))}
            {idx.id === 'fge' && (
              <div className="field">
                <label className="field-label">Sexo</label>
                <select value={datos.sexo || ''} onChange={e => update('sexo', e.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            )}
            {r && (
              <div className="indice-resultado">
                <div className="indice-valor">
                  {r.valor} <span className="indice-unidad">{r.unidad}</span>
                </div>
                {r.interpretacion && (
                  <div className="indice-interpretacion">{r.interpretacion}</div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Antibioticos() {
  const [seleccionado, setSeleccionado] = useState(null)
  
  if (seleccionado) {
    const ab = antibioticosEmpiricos[seleccionado]
    return (
      <div>
        <button className="btn btn-secondary btn-block" 
          onClick={() => setSeleccionado(null)} style={{ marginBottom: 16 }}>
          ← Volver
        </button>
        <div className="card">
          <div className="section-title">{ab.nombre}</div>
          
          <h4 style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 8, marginTop: 8 }}>
            Primera línea
          </h4>
          {ab.primeralinea.map((l, i) => (
            <div key={i} className="ab-linea">→ {l}</div>
          ))}
          
          {ab.coberturaAdicional?.length > 0 && (
            <>
              <h4 style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 8, marginTop: 16 }}>
                Cobertura adicional
              </h4>
              {ab.coberturaAdicional.map((l, i) => (
                <div key={i} className="ab-linea">→ {l}</div>
              ))}
            </>
          )}
          
          {ab.notas && (
            <div className="warning-banner" style={{ marginTop: 16 }}>
              {ab.notas}
            </div>
          )}
        </div>
        
        <div className="warning-banner" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--red)' }}>
          ⚠ Esquemas referenciales. Validar con guías locales y patrones de resistencia institucional.
        </div>
      </div>
    )
  }
  
  return (
    <div className="card">
      <div className="section-title">Esquemas empíricos por foco</div>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
        Solo orientativos. Siempre validar con guías locales.
      </p>
      {Object.entries(antibioticosEmpiricos).map(([id, ab]) => (
        <button key={id} className="ab-btn" onClick={() => setSeleccionado(id)}>
          {ab.nombre}
        </button>
      ))}
    </div>
  )
}
