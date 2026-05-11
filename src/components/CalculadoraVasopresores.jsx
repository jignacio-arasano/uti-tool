import { useState, useEffect } from 'react'
import { CampoInput } from './CampoInput'
import { drogasVasoactivas, calcularInfusion } from '../lib/vasopresores'

export function CalculadoraVasopresores({ activos, setActivos }) {
  const [peso, setPeso] = useState(() => sessionStorage.getItem('peso') || '')
  const [drogaSel, setDrogaSel] = useState('noradrenalina')
  const [dosis, setDosis] = useState(drogasVasoactivas.noradrenalina.dosisInicial)
  
  useEffect(() => {
    if (peso) sessionStorage.setItem('peso', peso)
  }, [peso])
  
  useEffect(() => {
    setDosis(drogasVasoactivas[drogaSel].dosisInicial)
  }, [drogaSel])
  
  const config = drogasVasoactivas[drogaSel]
  const mlph = peso ? calcularInfusion(drogaSel, dosis, peso) : null
  const unidad = config.unidad || 'mcg/kg/min'
  
  const agregar = () => {
    if (!peso || !mlph) return
    const nuevo = {
      id: Date.now(),
      droga: drogaSel,
      nombre: config.nombre,
      dosis: Number(dosis),
      unidad,
      mlph,
      dilucion: `${config.dilucionEstandar.mg}${unidad === 'U/min' ? 'U' : 'mg'} en ${config.dilucionEstandar.ml}ml`
    }
    setActivos([...activos, nuevo])
  }
  
  const quitar = (id) => {
    setActivos(activos.filter(v => v.id !== id))
  }
  
  return (
    <div>
      <div className="card">
        <div className="section-title">Datos del paciente</div>
        <CampoInput 
          label="Peso del paciente" 
          hint="kg" 
          value={peso} 
          onChange={setPeso} 
        />
      </div>
      
      <div className="card">
        <div className="section-title">Calcular dosis</div>
        
        <div className="field">
          <div className="field-label">Droga</div>
          <select value={drogaSel} onChange={(e) => setDrogaSel(e.target.value)}>
            {Object.entries(drogasVasoactivas).map(([id, d]) => (
              <option key={id} value={id}>{d.nombre}</option>
            ))}
          </select>
        </div>
        
        <div className="field">
          <div className="field-label">
            <span>Dosis</span>
            <span className="field-hint">{unidad}</span>
          </div>
          <div className="range-display">
            <span>{config.dosisMin}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>
              {Number(dosis).toFixed(unidad === 'U/min' ? 3 : 2)}
            </span>
            <span>{config.dosisMax}</span>
          </div>
          <input
            type="range"
            min={config.dosisMin}
            max={config.dosisMax}
            step={unidad === 'U/min' ? 0.005 : 0.01}
            value={dosis}
            onChange={(e) => setDosis(e.target.value)}
          />
          <input
            type="number"
            step="any"
            value={dosis}
            onChange={(e) => setDosis(e.target.value)}
            style={{ marginTop: 12 }}
          />
        </div>
        
        {!peso && (
          <div className="warning-banner">
            Ingresá el peso para calcular la velocidad de infusión.
          </div>
        )}
        
        {mlph && (
          <div className="dose-display">
            <div className="dose-value">{mlph}</div>
            <div className="dose-unit">mL / hora</div>
            <div className="dose-detail">
              Dilución: {config.dilucionEstandar.mg}{unidad === 'U/min' ? 'U' : 'mg'} en {config.dilucionEstandar.ml}ml
            </div>
          </div>
        )}
        
        {config.notas && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            {config.notas}
          </div>
        )}
        
        <button 
          className="btn btn-primary btn-block" 
          onClick={agregar}
          disabled={!peso}
          style={{ marginTop: 16, opacity: peso ? 1 : 0.5 }}
        >
          + Agregar a activos
        </button>
      </div>
      
      <div className="card">
        <div className="section-title">Vasopresores activos</div>
        {activos.length === 0 ? (
          <div className="empty-state">Sin vasopresores cargados</div>
        ) : (
          activos.map(v => (
            <div className="vaso-active" key={v.id}>
              <div className="vaso-active-info">
                <div className="vaso-name">{v.nombre} — {v.dosis} {v.unidad}</div>
                <div className="vaso-rate">
                  {v.mlph} mL/h ({v.dilucion})
                </div>
              </div>
              <button className="vaso-remove" onClick={() => quitar(v.id)} aria-label="Quitar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
