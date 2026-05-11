import { useState } from 'react'
import { CampoInput } from './CampoInput'
import { categoriasBalance, calcularBalance, perdidasInsensibles } from '../lib/balance'

export function BalanceHidrico() {
  const [ingresos, setIngresos] = useState({})
  const [egresos, setEgresos] = useState({})
  
  const setIng = (k, v) => setIngresos(prev => ({ ...prev, [k]: v }))
  const setEgr = (k, v) => setEgresos(prev => ({ ...prev, [k]: v }))
  
  const r = calcularBalance(ingresos, egresos)
  
  const reset = () => {
    setIngresos({})
    setEgresos({})
  }
  
  return (
    <div>
      <div className="card">
        <div className="section-title" style={{ color: 'var(--green)' }}>↑ Ingresos (mL)</div>
        {categoriasBalance.ingresos.map(c => (
          <CampoInput
            key={c.id}
            label={c.label}
            value={ingresos[c.id]}
            onChange={v => setIng(c.id, v)}
            withMic={false}
            placeholder={c.sugerido ? String(c.sugerido) : '0'}
          />
        ))}
      </div>
      
      <div className="card">
        <div className="section-title" style={{ color: 'var(--orange)' }}>↓ Egresos (mL)</div>
        {categoriasBalance.egresos.map(c => (
          <CampoInput
            key={c.id}
            label={c.label}
            value={egresos[c.id]}
            onChange={v => setEgr(c.id, v)}
            withMic={false}
            placeholder={c.sugerido ? String(c.sugerido) : '0'}
          />
        ))}
      </div>
      
      <div className="card">
        <div className="section-title">Resumen</div>
        <div className="balance-row">
          <span>Total ingresos</span>
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>+{r.totalIngresos} mL</span>
        </div>
        <div className="balance-row">
          <span>Total egresos</span>
          <span style={{ color: 'var(--orange)', fontWeight: 700 }}>−{r.totalEgresos} mL</span>
        </div>
        <div className="balance-row balance-total">
          <span>Balance neto</span>
          <span style={{ 
            color: Math.abs(r.balance) < 500 ? 'var(--text)' : r.balance > 0 ? 'var(--green)' : 'var(--orange)',
            fontWeight: 800,
            fontSize: 22
          }}>
            {r.signo}{r.balance} mL
          </span>
        </div>
      </div>
      
      <div className="interpretation-card amarillo" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
        <div className="interpretation-title">Interpretación</div>
        <div className="interpretation-message">{r.interpretacion}</div>
      </div>
      
      <button className="btn btn-secondary btn-block" onClick={reset}>
        Limpiar todo
      </button>
    </div>
  )
}
