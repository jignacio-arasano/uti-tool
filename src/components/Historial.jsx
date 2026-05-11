import { useState, useEffect } from 'react'
import { obtenerHistorial, eliminarDelHistorial, limpiarHistorial } from '../lib/version'

export function Historial() {
  const [items, setItems] = useState([])
  const [confirmando, setConfirmando] = useState(false)
  
  const refrescar = () => setItems(obtenerHistorial())
  
  useEffect(() => {
    refrescar()
    // Refrescar cada vez que se vuelva al tab
    const onFocus = () => refrescar()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])
  
  const eliminar = (id) => {
    eliminarDelHistorial(id)
    refrescar()
  }
  
  const limpiarTodo = () => {
    limpiarHistorial()
    refrescar()
    setConfirmando(false)
  }
  
  if (items.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>
            Sin cálculos guardados
          </div>
          <div>Los cálculos que guardes aparecerán acá hasta que cierres la pestaña.</div>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="card">
        <div className="section-title">Cálculos de esta sesión ({items.length})</div>
        {items.map(item => (
          <ItemHistorial key={item.id} item={item} onEliminar={() => eliminar(item.id)} />
        ))}
      </div>
      
      {confirmando ? (
        <div className="card" style={{ borderColor: 'var(--red)' }}>
          <div style={{ marginBottom: 12, fontWeight: 600 }}>
            ¿Borrar todo el historial?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, background: 'var(--red)', color: 'white' }}
              onClick={limpiarTodo}
            >
              Sí, borrar
            </button>
          </div>
        </div>
      ) : (
        <button className="btn btn-secondary btn-block" onClick={() => setConfirmando(true)}>
          🗑 Limpiar historial
        </button>
      )}
      
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
        El historial se borra automáticamente al cerrar la pestaña.
      </div>
    </div>
  )
}

function ItemHistorial({ item, onEliminar }) {
  const [expandido, setExpandido] = useState(false)
  
  const fecha = new Date(item.timestamp).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
  
  const colorClase = item.categoria || 'amarillo'
  
  return (
    <div className="historial-item">
      <button className="historial-header" onClick={() => setExpandido(!expandido)}>
        <div className="historial-info">
          <div className="historial-etiqueta">
            {item.etiqueta || item.tipo.toUpperCase()}
          </div>
          <div className="historial-meta">
            {item.tipo.toUpperCase()} = {item.score} · {fecha}
          </div>
        </div>
        <div className={`historial-badge ${colorClase}`}>
          {item.score}
        </div>
      </button>
      
      {expandido && (
        <div className="historial-detalle">
          <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            Datos cargados:
          </div>
          {Object.entries(item.datos || {}).map(([k, v]) => v !== undefined && v !== '' && (
            <div key={k} className="historial-dato">
              <span style={{ color: 'var(--text-dim)' }}>{k}:</span> <strong>{String(v)}</strong>
            </div>
          ))}
          <button 
            className="btn btn-secondary btn-block"
            onClick={onEliminar}
            style={{ marginTop: 12, fontSize: 13, color: 'var(--red)' }}
          >
            Eliminar este cálculo
          </button>
        </div>
      )}
    </div>
  )
}
