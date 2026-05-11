// Calculadora de drogas vasoactivas
// Convierte dosis (mcg/kg/min) a velocidad de infusión (mL/h)

export const drogasVasoactivas = {
  noradrenalina: {
    nombre: 'Noradrenalina',
    dosisMin: 0.01,
    dosisMax: 3.0,
    dosisInicial: 0.05,
    dilucionEstandar: { mg: 8, ml: 250 },  // 8mg en 250ml SG5%
    notas: 'Vasopresor de primera línea en shock séptico'
  },
  adrenalina: {
    nombre: 'Adrenalina',
    dosisMin: 0.01,
    dosisMax: 2.0,
    dosisInicial: 0.05,
    dilucionEstandar: { mg: 4, ml: 250 },
    notas: 'Segunda línea o shock cardiogénico'
  },
  dobutamina: {
    nombre: 'Dobutamina',
    dosisMin: 2,
    dosisMax: 20,
    dosisInicial: 5,
    dilucionEstandar: { mg: 250, ml: 250 },
    notas: 'Inotrópico β1 selectivo'
  },
  dopamina: {
    nombre: 'Dopamina',
    dosisMin: 2,
    dosisMax: 20,
    dosisInicial: 5,
    dilucionEstandar: { mg: 200, ml: 250 },
    notas: 'Uso decreciente; reservar casos puntuales'
  },
  vasopresina: {
    nombre: 'Vasopresina',
    dosisMin: 0.01,
    dosisMax: 0.04,
    dosisInicial: 0.03,
    unidad: 'U/min',  // unidades por minuto, no mcg/kg/min
    dilucionEstandar: { mg: 20, ml: 100 },  // 20U en 100ml
    notas: 'Adyuvante a noradrenalina en shock séptico refractario'
  },
  milrinona: {
    nombre: 'Milrinona',
    dosisMin: 0.125,
    dosisMax: 0.75,
    dosisInicial: 0.375,
    dilucionEstandar: { mg: 20, ml: 100 },
    notas: 'Inodilatador, falla cardíaca con HTP'
  }
}

// Calcular mL/h
export function calcularInfusion(droga, dosis, peso) {
  const config = drogasVasoactivas[droga]
  if (!config) return null
  
  const concentracionMgPorMl = config.dilucionEstandar.mg / config.dilucionEstandar.ml
  
  if (config.unidad === 'U/min') {
    // Vasopresina: dosis en U/min, dilución en U/ml
    const concentracionUPorMl = config.dilucionEstandar.mg / config.dilucionEstandar.ml
    const mlPorHora = (Number(dosis) * 60) / concentracionUPorMl
    return mlPorHora.toFixed(1)
  }
  
  // mcg/kg/min → mL/h
  const dosisMcgMin = Number(dosis) * Number(peso)
  const dosisMgMin = dosisMcgMin / 1000
  const mlPorHora = (dosisMgMin * 60) / concentracionMgPorMl
  return mlPorHora.toFixed(1)
}
