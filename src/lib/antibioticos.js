// Sugerencias de antibióticos empíricos según foco
// SOLO REFERENCIAL — siempre validar con guías locales y resistencias institucionales

export const antibioticosEmpiricos = {
  sepsis_sin_foco: {
    nombre: 'Sepsis sin foco evidente',
    primeralinea: ['Piperacilina-tazobactam 4.5g c/6h IV', 'o Cefepime 2g c/8h IV'],
    coberturaAdicional: ['Considerar vancomicina 25-30mg/kg carga si sospecha SAMR', 'Echinocandina si inmunosuprimido'],
    notas: 'Tomar hemocultivos antes de iniciar. Reevaluar a las 48-72h con cultivos.'
  },
  sepsis_abdominal_comunitaria: {
    nombre: 'Sepsis abdominal comunitaria',
    primeralinea: ['Piperacilina-tazobactam 4.5g c/6h IV', 'o Ceftriaxona 2g/día + Metronidazol 500mg c/8h'],
    coberturaAdicional: ['Si shock séptico o severidad: Meropenem 1g c/8h'],
    notas: 'Control quirúrgico de foco es prioritario. Cubrir anaerobios y enterobacterias.'
  },
  sepsis_abdominal_nosocomial: {
    nombre: 'Sepsis abdominal nosocomial',
    primeralinea: ['Meropenem 1g c/8h IV', 'o Piperacilina-tazobactam 4.5g c/6h en infusión extendida'],
    coberturaAdicional: ['Vancomicina si sospecha enterococo', 'Echinocandina (caspofungina/anidulafungina) si Candida es probable'],
    notas: 'Alta sospecha de gérmenes multirresistentes y Candida. Considerar reintervención quirúrgica.'
  },
  neumonia_comunitaria_grave: {
    nombre: 'Neumonía comunitaria grave (UTI)',
    primeralinea: ['Ceftriaxona 2g/día + Azitromicina 500mg/día', 'o Levofloxacina 750mg/día'],
    coberturaAdicional: ['Oseltamivir 75mg c/12h en época de gripe', 'Vancomicina si sospecha SAMR'],
    notas: 'Cubrir Streptococcus pneumoniae, Legionella, atípicos. CURB-65 ≥3 = UTI.'
  },
  neumonia_nosocomial: {
    nombre: 'Neumonía nosocomial / asociada a VM',
    primeralinea: ['Piperacilina-tazobactam 4.5g c/6h', 'o Cefepime 2g c/8h', 'o Meropenem 1g c/8h'],
    coberturaAdicional: ['+ Vancomicina o Linezolid si SAMR probable', '+ Amikacina/Colistin si Pseudomonas MDR'],
    notas: 'Considerar resistencias institucionales. Desescalar con cultivos.'
  },
  meningitis_bacteriana: {
    nombre: 'Meningitis bacteriana aguda',
    primeralinea: ['Ceftriaxona 2g c/12h + Vancomicina 15-20mg/kg c/8-12h'],
    coberturaAdicional: ['+ Ampicilina 2g c/4h si > 50 años o inmunocompromiso (Listeria)', 'Dexametasona 0.15mg/kg c/6h x 4 días antes o con primer ATB'],
    notas: 'No demorar ATB por TAC o PL. Iniciar dentro de la 1ra hora.'
  },
  itu_complicada: {
    nombre: 'ITU complicada / Pielonefritis grave',
    primeralinea: ['Ceftriaxona 2g/día IV', 'o Piperacilina-tazobactam si sospecha BLEE'],
    coberturaAdicional: ['Meropenem si shock o BLEE conocido'],
    notas: 'Tomar urocultivo y hemocultivos. Imágenes si no mejora en 48-72h.'
  },
  partes_blandas_grave: {
    nombre: 'Infección de partes blandas grave / Fascitis necrotizante',
    primeralinea: ['Piperacilina-tazobactam + Clindamicina 600-900mg c/8h + Vancomicina'],
    coberturaAdicional: ['Considerar IgIV en shock tóxico'],
    notas: 'EMERGENCIA QUIRÚRGICA. Desbridamiento es prioridad. Clindamicina como antitoxina.'
  },
  endocarditis: {
    nombre: 'Endocarditis bacteriana',
    primeralinea: ['Vancomicina 25-30mg/kg carga + Ceftriaxona 2g c/12h + Gentamicina 1mg/kg c/8h'],
    coberturaAdicional: ['Ajustar según hemocultivos (3 muestras separadas)'],
    notas: 'Ecocardiograma TT/TE. Interconsulta a cardiología y cirugía cardiovascular.'
  },
  neutropenia_febril: {
    nombre: 'Neutropenia febril (PMN < 500)',
    primeralinea: ['Cefepime 2g c/8h', 'o Piperacilina-tazobactam 4.5g c/6h', 'o Meropenem si severidad'],
    coberturaAdicional: ['+ Vancomicina si: mucositis severa, sospecha de catéter, hipotensión, neumonía', 'Anfotericina B / Voriconazol si fiebre persiste >4-7 días'],
    notas: 'Iniciar dentro de la primera hora. No esperar cultivos.'
  }
}

export function buscarAntibiotico(query) {
  const q = query.toLowerCase()
  return Object.entries(antibioticosEmpiricos)
    .filter(([id, data]) => 
      id.includes(q) || 
      data.nombre.toLowerCase().includes(q)
    )
    .map(([id, data]) => ({ id, ...data }))
}
