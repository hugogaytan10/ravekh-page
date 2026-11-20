export type OfficialPaidPlan = 'ESSENTIAL' | 'START' | 'PRO';
export const OFFICIAL_MONTHLY_PRICES: Record<OfficialPaidPlan, number> = {ESSENTIAL:89,START:199,PRO:399};

export const PLAN_DETAILS = {
  GRATUITO: {
    benefits: [
      'Catálogo en línea y punto de venta',
      '50 productos · 1 imagen por producto',
      '100 ventas POS al mes',
      '50 visitas al catálogo al mes',
      '1 empleado · 1 matriz',
      'Reportes del día',
      'Sin variantes, mesas ni cupones',
      'Carga con IA y Excel no incluidas',
      'Marca RAVEKH destacada',
    ],
    banner: ['50 productos · 1 imagen por producto', '100 ventas POS y 50 visitas al mes', '1 empleado · 1 matriz', 'Catálogo, POS y reportes del día'],
  },
  ESSENTIAL: {
    benefits: [
      'Catálogo en línea y punto de venta',
      'Productos, ventas y visitas ilimitados',
      '1 imagen por producto',
      '1 empleado · 1 matriz',
      'Reportes del día',
      'Sin variantes, mesas ni cupones',
      'Carga con IA y Excel no incluidas',
      'Marca RAVEKH destacada',
    ],
    banner: ['Productos, ventas y visitas ilimitados', '1 imagen por producto', '1 empleado · 1 matriz', 'Catálogo, POS y reportes del día'],
  },
  START: {
    benefits: [
      'Catálogo en línea y punto de venta',
      'Productos, ventas, visitas y clientes ilimitados',
      '3 imágenes y 10 variantes por producto',
      '2 empleados más el dueño · 1 matriz',
      '4 mesas · 5 cupones activos',
      'Excel: 2 lotes de hasta 50 productos al mes',
      'IA: 100 productos al mes (2 lotes de 50)',
      'Cupo IA compartido entre carga masiva y chat',
      'Reportes básicos por día, semana, mes y rango personalizado',
      'Finanzas con reportes básicos',
      'Alertas inteligentes cada 15 días',
      'Marca RAVEKH visible',
    ],
    banner: ['Productos ilimitados · 3 imágenes · 10 variantes', '2 empleados + dueño · 4 mesas · 5 cupones', 'IA: 100 productos/mes · Excel: 2 lotes/mes', 'Reportes básicos · Alertas cada 15 días'],
  },
  PRO: {
    benefits: [
      'Catálogo en línea y punto de venta',
      'Productos, ventas, visitas y clientes ilimitados',
      '5 imágenes por producto · Variantes ilimitadas',
      '5 empleados más el dueño · Matriz y 1 sucursal',
      'Mesas ilimitadas · 50 cupones activos',
      'Excel: 5 lotes de hasta 50 productos al mes',
      'IA: 250 productos al mes (5 lotes de 50)',
      'Cupo IA compartido entre carga masiva y chat',
      'Reportes detallados y análisis del negocio',
      'Predicciones y recomendaciones avanzadas',
      'Alertas inteligentes dos veces por semana',
      'Marca RAVEKH discreta',
    ],
    banner: ['Productos ilimitados · 5 imágenes · Variantes ilimitadas', '5 empleados + dueño · Matriz y 1 sucursal', 'IA: 250 productos/mes · Excel: 5 lotes/mes', 'Análisis avanzado · 50 cupones activos'],
  },
};
