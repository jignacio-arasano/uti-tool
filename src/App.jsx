import { useState } from 'react'
import { CalculadoraApache } from './components/CalculadoraApache'
import { CalculadoraSOFA } from './components/CalculadoraSOFA'
import { OtrosScores } from './components/OtrosScores'
import { CalculadoraVasopresores } from './components/CalculadoraVasopresores'
import { BalanceHidrico } from './components/BalanceHidrico'
import { GeneradorEvolucion } from './components/GeneradorEvolucion'
import { HerramientasUtiles } from './components/HerramientasUtiles'
import { Historial } from './components/Historial'
import { CapturaOCR } from './components/CapturaOCR'
import { VERSION } from './lib/version'

const TABS = [
  { id: 'apache', label: 'APACHE II' },
  { id: 'sofa', label: 'SOFA' },
  { id: 'otros', label: 'Otros' },
  { id: 'vaso', label: 'Vasopresores' },
  { id: 'balance', label: 'Balance' },
  { id: 'evol', label: 'Evolución' },
  { id: 'utiles', label: 'Útiles' },
  { id: 'ocr', label: '📷 OCR' },
  { id: 'historial', label: 'Historial' }
]

export default function App() {
  const [tab, setTab] = useState('apache')
  const [apacheData, setApacheData] = useState(null)
  const [sofaData, setSofaData] = useState(null)
  const [vasopresores, setVasopresores] = useState([])
  const [showVersion, setShowVersion] = useState(false)
  
  const aplicarOCR = (valores) => {
    // Guardar los valores en sessionStorage para que APACHE / SOFA los lean
    const apacheActual = JSON.parse(sessionStorage.getItem('apacheWIP') || '{}')
    const merged = { ...apacheActual, ...valores }
    sessionStorage.setItem('apacheWIP', JSON.stringify(merged))
    
    const sofaActual = JSON.parse(sessionStorage.getItem('sofaWIP') || '{}')
    const sofaMerged = { ...sofaActual, ...valores }
    sessionStorage.setItem('sofaWIP', JSON.stringify(sofaMerged))
    
    // Ir a APACHE para que el médico vea los datos cargados
    setTab('apache')
    // Forzar reload del componente
    window.location.reload()
  }
  
  return (
    <div className="app">
      <header className="header" role="banner">
        <div className="header-content">
          <div className="logo">
            <svg className="logo-icon" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <path 
                d="M5 50 L25 50 L30 30 L42 70 L52 35 L62 65 L70 50 L95 50" 
                stroke="currentColor" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <div className="logo-text">
              ICU <span>Copilot</span>
            </div>
          </div>
          <button 
            className="version-btn" 
            onClick={() => setShowVersion(!showVersion)}
            aria-label="Información de versión"
          >
            v{VERSION.app}
          </button>
        </div>
      </header>
      
      {showVersion && (
        <div className="version-info">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Versión {VERSION.app}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Build: {VERSION.fechaBuild}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Scores: APACHE II {VERSION.scores.apache2.version} · 
            SOFA {VERSION.scores.sofa.version} · 
            NEWS2 {VERSION.scores.news2.version}
          </div>
          <button onClick={() => setShowVersion(false)} 
            style={{ marginTop: 8, fontSize: 12, color: 'var(--accent)' }}>
            Cerrar
          </button>
        </div>
      )}
      
      <nav className="tabs" role="tablist">
        {TABS.map(t => (
          <button 
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      
      <main className="content" role="tabpanel" id={`panel-${tab}`}>
        {tab === 'apache' && <CalculadoraApache onResultado={setApacheData} />}
        {tab === 'sofa' && <CalculadoraSOFA onResultado={setSofaData} />}
        {tab === 'otros' && <OtrosScores />}
        {tab === 'vaso' && <CalculadoraVasopresores activos={vasopresores} setActivos={setVasopresores} />}
        {tab === 'balance' && <BalanceHidrico />}
        {tab === 'evol' && <GeneradorEvolucion apacheData={apacheData} vasopresores={vasopresores} />}
        {tab === 'utiles' && <HerramientasUtiles />}
        {tab === 'ocr' && <CapturaOCR onValores={aplicarOCR} />}
        {tab === 'historial' && <Historial />}
      </main>
      
      <footer style={{ padding: '20px', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', marginTop: 40 }}>
        Herramienta de apoyo a la decisión clínica. Validar resultados antes de tomar decisiones.
      </footer>
    </div>
  )
}
