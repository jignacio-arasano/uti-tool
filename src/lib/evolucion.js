// Generador de evolución médica formato SOAP

export function generarEvolucion(datos) {
  const fecha = new Date().toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
  
  // Subjetivo
  const subjetivo = datos.subjetivo || 
    `Paciente ${datos.glasgow && datos.glasgow < 15 ? 'sedoanalgesiado' : 'vigil, orientado'}, ${datos.estabilidad || 'hemodinámicamente estable'}.`
  
  // Objetivo: signos vitales
  const sv = []
  if (datos.fc) sv.push(`FC ${datos.fc}`)
  if (datos.pam) sv.push(`PAM ${datos.pam}`)
  if (datos.fr) sv.push(`FR ${datos.fr}`)
  if (datos.sato2) sv.push(`SatO2 ${datos.sato2}%`)
  if (datos.fio2) sv.push(`FiO2 ${datos.fio2}`)
  if (datos.temperatura) sv.push(`T ${datos.temperatura}°C`)
  
  let objetivo = sv.join(' - ') + '.'
  
  // Glasgow / sedación
  if (datos.glasgow) {
    objetivo += ` Glasgow ${datos.glasgow}${datos.intubado ? 'T' : ''}.`
  }
  
  // Ventilación mecánica
  if (datos.intubado) {
    const vmParts = []
    if (datos.modoVent) vmParts.push(datos.modoVent)
    if (datos.peep) vmParts.push(`PEEP ${datos.peep}`)
    if (datos.vt) vmParts.push(`Vt ${datos.vt}`)
    if (vmParts.length > 0) {
      objetivo += ` ARM en ${vmParts.join(', ')}.`
    }
  }
  
  // Balance
  if (datos.balance !== undefined && datos.balance !== '') {
    const signo = Number(datos.balance) >= 0 ? '+' : ''
    objetivo += ` Balance hídrico: ${signo}${datos.balance} ml.`
  }
  
  // Laboratorio
  const lab = []
  if (datos.lactato) lab.push(`Lactato ${datos.lactato}`)
  if (datos.creatinina) lab.push(`Creat ${datos.creatinina}`)
  if (datos.leucocitos) {
    const leu = Number(datos.leucocitos) > 1000 ? datos.leucocitos : `${datos.leucocitos}.000`
    lab.push(`Leucocitos ${leu}`)
  }
  if (datos.ph) lab.push(`pH ${datos.ph}`)
  if (lab.length > 0) {
    objetivo += ` Laboratorio: ${lab.join(', ')}.`
  }
  
  // Vasopresores activos
  if (datos.vasopresores && datos.vasopresores.length > 0) {
    const vasoTexto = datos.vasopresores
      .map(v => `${v.nombre} ${v.dosis} ${v.unidad || 'mcg/kg/min'}`)
      .join(', ')
    objetivo += ` Soporte vasoactivo: ${vasoTexto}.`
  }
  
  // Apreciación
  let apreciacion = datos.diagnostico || 'Paciente en UTI bajo monitoreo continuo'
  apreciacion += '.'
  if (datos.apache !== undefined && datos.apache !== null) {
    apreciacion += ` APACHE II ${datos.apache} (mortalidad estimada ${datos.mortalidad}%).`
  }
  if (datos.interpretacion) {
    apreciacion += ` ${datos.interpretacion}`
  }
  
  // Plan
  const planList = datos.plan && datos.plan.length > 0 
    ? datos.plan 
    : ['Continuar manejo actual', 'Reevaluación en próxima ronda']
  
  const plan = planList.map((p, i) => `${i + 1}. ${p}`).join('\n')
  
  return `EVOLUCIÓN UTI - ${fecha}

S: ${subjetivo}

O: ${objetivo}

A: ${apreciacion}

P:
${plan}`
}
