import { useState, useRef, useEffect } from 'react'
import { crearReconocedor, extraerNumero } from '../lib/voz'
import { validar } from '../lib/validacion'
import { getSessionMemory, updateSessionMemory } from '../lib/sessionMemory'

export function CampoInput({ 
  label, 
  hint, 
  value, 
  onChange, 
  suffix, 
  type = 'number', 
  step = 'any',
  inputMode = 'decimal',
  withMic = true,
  placeholder = '',
  campo = null,
  id = null,
  required = false
}) {
  const [listening, setListening] = useState(false)
  const [validacion, setValidacion] = useState(null)
  const recognitionRef = useRef(null)
  const inputId = id || `campo-${label?.replace(/\s/g, '-').toLowerCase()}`
  
  useEffect(() => {
    if (campo && value) {
      setValidacion(validar(campo, value))
    } else {
      setValidacion(null)
    }
  }, [campo, value])
  
  const iniciarVoz = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    
    const rec = crearReconocedor(
      (texto) => {
        if (type === 'number') {
          const num = extraerNumero(texto)
          if (num !== null) handleChange(String(num))
        } else {
          handleChange(texto)
        }
        setListening(false)
      },
      (err) => {
        console.warn(err)
        setListening(false)
      }
    )
    
    if (rec) {
      recognitionRef.current = rec
      rec.start()
      setListening(true)
    }
  }
  

  useEffect(() => {
    if (!campo) return
    if (value !== undefined && value !== null && String(value) !== '') return
    const mem = getSessionMemory()
    if (mem[campo] !== undefined && mem[campo] !== null && String(mem[campo]) !== '') {
      onChange(String(mem[campo]))
    }
  }, [campo])

  const handleChange = (nextValue) => {
    onChange(nextValue)
    if (campo) updateSessionMemory({ [campo]: nextValue })
  }

  const borderColor = validacion?.tipo === 'error' ? 'var(--red)' 
                    : validacion?.tipo === 'sospechoso' ? 'var(--yellow)'
                    : null
  
  return (
    <div className="field">
      <label className="field-label" htmlFor={inputId}>
        <span>
          {label}
          {required && <span style={{ color: 'var(--red)', marginLeft: 4 }} aria-label="requerido">*</span>}
        </span>
        {hint && <span className="field-hint">{hint}</span>}
      </label>
      <div className="field-input-group">
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            id={inputId}
            type={type}
            step={step}
            inputMode={inputMode}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            aria-invalid={validacion?.tipo === 'error'}
            aria-describedby={validacion ? `${inputId}-msg` : undefined}
            style={{
              ...(suffix ? { paddingRight: 56 } : {}),
              ...(borderColor ? { borderColor } : {})
            }}
          />
          {suffix && <span className="field-suffix" aria-hidden="true">{suffix}</span>}
        </div>
        {withMic && (
          <button
            type="button"
            className={`mic-btn ${listening ? 'listening' : ''}`}
            onClick={iniciarVoz}
            aria-label={`Dictar por voz para ${label}`}
            aria-pressed={listening}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        )}
      </div>
      {validacion && (
        <div 
          id={`${inputId}-msg`}
          className={`field-message ${validacion.tipo}`}
          role={validacion.tipo === 'error' ? 'alert' : 'status'}
        >
          {validacion.mensaje}
        </div>
      )}
    </div>
  )
}
