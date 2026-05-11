// Motor de reglas de interpretación clínica
// Configurable: el médico puede editar este JSON sin tocar otra cosa

export const reglasInterpretacion = {
  general: [
    { min: 0, max: 9, color: 'verde', titulo: 'Riesgo bajo',
      mensaje: 'Continuar monitoreo estándar. Evaluación seriada cada 6-8 horas.' },
    { min: 10, max: 19, color: 'amarillo', titulo: 'Riesgo moderado',
      mensaje: 'Vigilancia estrecha. Reevaluar metas hemodinámicas y ventilatorias cada 4 horas.' },
    { min: 20, max: 29, color: 'naranja', titulo: 'Riesgo alto',
      mensaje: 'Revisar urgentemente metas terapéuticas. Considerar escalada de soporte.' },
    { min: 30, max: 999, color: 'rojo', titulo: 'Riesgo extremo',
      mensaje: 'Pronóstico reservado. Considerar reunión familiar y definición de límites terapéuticos.' }
  ],
  sepsis: [
    { min: 0, max: 9, color: 'verde', titulo: 'Sepsis controlada',
      mensaje: 'Continuar bundle. Verificar de-escalada antibiótica según cultivos.' },
    { min: 10, max: 19, color: 'amarillo', titulo: 'Sepsis activa',
      mensaje: 'Verificar cumplimiento del bundle. Metas: PAM ≥ 65 mmHg, lac < 2 mmol/L, diuresis > 0.5 ml/kg/h.' },
    { min: 20, max: 29, color: 'naranja', titulo: 'Shock séptico',
      mensaje: 'Optimizar vasopresores. Evaluar cortisol. Considerar control de foco quirúrgico si aplica.' },
    { min: 30, max: 999, color: 'rojo', titulo: 'Shock séptico refractario',
      mensaje: 'Mortalidad elevada. Reevaluar foco. Considerar terapias de rescate y reunión con familia.' }
  ],
  neurocritico: [
    { min: 0, max: 9, color: 'verde', titulo: 'Estable',
      mensaje: 'Continuar neuroprotección estándar. Vigilancia neurológica horaria.' },
    { min: 10, max: 19, color: 'amarillo', titulo: 'Vigilancia activa',
      mensaje: 'Mantener PAM > 80, PIC < 20 si monitoreo. Cabecera 30°. Normotermia.' },
    { min: 20, max: 29, color: 'naranja', titulo: 'Deterioro neurológico',
      mensaje: 'Considerar neuroimagen urgente. Optimizar PPC > 60. Evaluar hipertensión endocraneana.' },
    { min: 30, max: 999, color: 'rojo', titulo: 'Crítico neurológico',
      mensaje: 'Riesgo vital. Considerar craniectomía descompresiva si aplica. Discutir pronóstico con familia.' }
  ],
  sdra: [
    { min: 0, max: 9, color: 'verde', titulo: 'SDRA leve',
      mensaje: 'Mantener Vt 6 ml/kg peso ideal, plateau < 30 cmH2O, driving pressure < 15.' },
    { min: 10, max: 19, color: 'amarillo', titulo: 'SDRA moderado',
      mensaje: 'Optimizar PEEP. Considerar prono si PaFi < 150. Bloqueo neuromuscular si asincronía.' },
    { min: 20, max: 29, color: 'naranja', titulo: 'SDRA severo',
      mensaje: 'Prono 16h/día indicado. Evaluar reclutamiento. Considerar derivación para ECMO.' },
    { min: 30, max: 999, color: 'rojo', titulo: 'Hipoxemia refractaria',
      mensaje: 'Considerar ECMO veno-venoso urgente. Reevaluar todas las terapias de rescate.' }
  ],
  postquirurgico: [
    { min: 0, max: 9, color: 'verde', titulo: 'Recuperación favorable',
      mensaje: 'Continuar analgesia multimodal. Considerar extubación temprana y movilización.' },
    { min: 10, max: 19, color: 'amarillo', titulo: 'Vigilancia postop',
      mensaje: 'Control de sangrado, balance estricto. Profilaxis TEV. Verificar drenajes.' },
    { min: 20, max: 29, color: 'naranja', titulo: 'Postop complicado',
      mensaje: 'Buscar activamente complicación quirúrgica. Considerar reexploración o imagen.' },
    { min: 30, max: 999, color: 'rojo', titulo: 'Falla multiorgánica postop',
      mensaje: 'Reevaluar urgentemente con cirugía. Pronóstico reservado.' }
  ]
}

export function interpretar(score, tipoIngreso = 'general') {
  const reglas = reglasInterpretacion[tipoIngreso] || reglasInterpretacion.general
  const resultado = reglas.find(r => score >= r.min && score <= r.max)
  return resultado || reglas[0]
}
