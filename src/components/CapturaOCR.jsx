import { useState, useRef } from 'react'
import { reconocerImagen, extraerValoresSignos } from '../lib/ocr'

export function CapturaOCR({ onValores }) {
  const [progreso, setProgreso] = useState(0)
  const [estado, setEstado] = useState('idle')  // idle, procesando, listo
  const [imagen, setImagen] = useState(null)
  const [textoOCR, setTextoOCR] = useState('')
  const [valoresExtraidos, setValoresExtraidos] = useState({})
  const fileRef = useRef(null)
  
  const onSeleccionarFoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      setImagen(dataUrl)
      setEstado('procesando')
      setProgreso(0)
      
      try {
        const texto = await reconocerImagen(dataUrl, (m) => {
          if (m.status === 'recognizing text') {
            setProgreso(Math.round(m.progress * 100))
          }
        })
        setTextoOCR(texto)
        const valores = extraerValoresSignos(texto)
        setValoresExtraidos(valores)
        setEstado('listo')
      } catch (err) {
        console.error(err)
        setEstado('error')
      }
    }
    reader.readAsDataURL(file)
  }
  
  const aplicar = () => {
    if (onValores) onValores(valoresExtraidos)
    reset()
  }
  
  const reset = () => {
    setImagen(null)
    setTextoOCR('')
    setValoresExtraidos({})
    setEstado('idle')
    setProgreso(0)
    if (fileRef.current) fileRef.current.value = ''
  }
  
  return (
    <div className="card">
      <div className="section-title">OCR — Capturar valores de monitor</div>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
        Sacá una foto bien enfocada de la pantalla del monitor o del laboratorio. 
        Solo el área de los números, sin reflejos.
      </p>
      
      {estado === 'idle' && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onSeleccionarFoto}
            style={{ display: 'none' }}
          />
          <button 
            className="btn btn-primary btn-block"
            onClick={() => fileRef.current?.click()}
          >
            📷 Tomar foto / elegir imagen
          </button>
        </>
      )}
      
      {estado === 'procesando' && (
        <div className="ocr-procesando">
          {imagen && <img src={imagen} alt="Imagen capturada" className="ocr-preview" />}
          <div className="ocr-progress">
            <div className="ocr-progress-bar" style={{ width: `${progreso}%` }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-dim)', marginTop: 8 }}>
            Analizando imagen... {progreso}%
          </div>
        </div>
      )}
      
      {estado === 'listo' && (
        <div>
          {imagen && <img src={imagen} alt="Imagen capturada" className="ocr-preview" />}
          
          <div className="section-title" style={{ marginTop: 16 }}>
            Valores detectados ({Object.keys(valoresExtraidos).length})
          </div>
          
          {Object.keys(valoresExtraidos).length === 0 ? (
            <div className="empty-state">
              No se pudieron extraer valores. Probá con una foto más clara.
            </div>
          ) : (
            <>
              {Object.entries(valoresExtraidos).map(([k, v]) => (
                <div key={k} className="ocr-valor-row">
                  <span className="ocr-valor-key">{k}</span>
                  <span className="ocr-valor-value">{v}</span>
                </div>
              ))}
              <button className="btn btn-primary btn-block" onClick={aplicar}
                style={{ marginTop: 16 }}>
                Usar estos valores
              </button>
            </>
          )}
          
          <details style={{ marginTop: 16 }}>
            <summary style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
              Ver texto OCR completo
            </summary>
            <pre style={{ fontSize: 11, marginTop: 8, color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>
              {textoOCR}
            </pre>
          </details>
          
          <button className="btn btn-secondary btn-block" onClick={reset}
            style={{ marginTop: 12 }}>
            Tomar otra foto
          </button>
        </div>
      )}
      
      {estado === 'error' && (
        <div className="warning-banner" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--red)' }}>
          Error al procesar la imagen. <button onClick={reset} style={{ textDecoration: 'underline' }}>Intentar de nuevo</button>
        </div>
      )}
    </div>
  )
}
