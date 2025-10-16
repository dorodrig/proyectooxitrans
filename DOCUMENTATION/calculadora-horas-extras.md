# ⏰ Calculadora de Horas Extras - Legislación Colombiana

## 📋 **Resumen del Módulo**

Se ha implementado una calculadora completa de horas extras que cumple con la legislación laboral colombiana según el Código Sustantivo del Trabajo (Artículos 159-164).

---

## 🏛️ **Marco Legal Colombiano**

### **Jornada Laboral Ordinaria**
- **Máximo diario**: 8 horas
- **Máximo semanal**: 48 horas
- **Distribución**: Lunes a Sábado

### **Clasificación de Horarios**
- **Diurno**: 6:00 AM - 10:00 PM
- **Nocturno**: 10:00 PM - 6:00 AM

### **Recargos por Horas Extras**
- **Diurnas**: +25% sobre valor hora ordinaria
- **Nocturnas**: +75% sobre valor hora ordinaria
- **Dominicales y festivos**: +75% (futuro desarrollo)

### **Límites Legales**
- **Horas extras diarias**: Máximo 2 horas
- **Horas extras semanales**: Máximo 12 horas
- **Autorización**: Requerida del Ministerio de Trabajo para exceder límites

---

## 🏗️ **Arquitectura Técnica**

### **1. CalculadoraHorasExtras.ts (Servicio)**
```typescript
interface JornadaDiaria {
  fecha: string;
  entrada: string;
  salida: string;
  descanso_minutos?: number;
  observaciones?: string;
}

interface CalculoDetallado {
  // Datos básicos
  fecha: string;
  entrada: string;
  salida: string;
  
  // Cálculos principales
  horas_trabajadas: number;
  horas_ordinarias: number;
  horas_extras_diurnas: number;
  horas_extras_nocturnas: number;
  
  // Valores monetarios
  valor_extras_diurnas?: number;
  valor_extras_nocturnas?: number;
  total_dia?: number;
  
  // Desglose detallado
  desglose: DesglosePorHoras;
  observaciones?: string[];
}
```

### **2. Algoritmo de Cálculo**

#### **Paso 1: Análisis Temporal**
1. Convertir horarios a decimales (HH:MM → horas.minutos)
2. Calcular tiempo total trabajado
3. Descontar períodos de descanso
4. Manejar jornadas que cruzan medianoche

#### **Paso 2: Clasificación de Horas**
```typescript
// Primeras 8 horas = Ordinarias
const horasOrdinarias = Math.min(totalTrabajadas, 8);

// Exceso sobre 8 horas = Extras
const horasExtras = Math.max(0, totalTrabajadas - 8);

// Clasificar extras por horario
if (horaEnRango(6, 22)) {
  horasExtrasDiurnas += horas;
} else {
  horasExtrasNocturnas += horas;
}
```

#### **Paso 3: Cálculo Monetario**
```typescript
const valorHoraDiurnaExtra = valorHoraOrdinaria * 1.25;
const valorHoraNocturnaExtra = valorHoraOrdinaria * 1.75;

const totalDia = 
  (horasOrdinarias * valorHoraOrdinaria) +
  (horasExtrasDiurnas * valorHoraDiurnaExtra) +
  (horasExtrasNocturnas * valorHoraNocturnaExtra);
```

---

## 📊 **Componente Visual**

### **Funcionalidades Implementadas**
- ✅ **Configuración de tarifa**: Input para valor hora ordinaria
- ✅ **Filtrado por fecha**: Dropdown con fechas disponibles
- ✅ **Vista resumen**: Cards con totales del período
- ✅ **Tabla detallada**: Desglose día por día
- ✅ **Vista expandida**: Desglose completo por tipo de hora
- ✅ **Alertas legales**: Avisos por incumplimiento de límites
- ✅ **Información legal**: Referencia al marco normativo

### **Estados del Componente**
```typescript
const [calculos, setCalculos] = useState<CalculoDetallado[]>([]);
const [resumen, setResumen] = useState<ResumenPeriodo | null>(null);
const [valorHoraOrdinaria, setValorHoraOrdinaria] = useState<number>(4200);
const [mostrarDetalles, setMostrarDetalles] = useState(false);
const [filtroFecha, setFiltroFecha] = useState<string>('');
```

---

## 🎨 **Diseño Visual**

### **Paleta de Colores**
- 🟢 **Verde (#22c55e)**: Horas ordinarias
- 🟡 **Amarillo (#f59e0b)**: Horas extras diurnas
- 🔵 **Azul (#6366f1)**: Horas extras nocturnas
- 🔴 **Rojo (#ef4444)**: Alertas de cumplimiento
- 💚 **Verde dinero (#10b981)**: Valores monetarios

### **Componentes UI**
1. **Panel de Control**: Configuración de tarifa y filtros
2. **Resumen Ejecutivo**: Cards con métricas principales
3. **Desglose Extras**: Breakdown visual diurnas vs nocturnas
4. **Tabla Detallada**: Registro día por día con expansión
5. **Alertas Legales**: Avisos de cumplimiento normativo
6. **Marco Legal**: Información referencial desplegable

---

## 💡 **Ejemplos de Uso**

### **Caso 1: Jornada Normal**
```
Entrada: 08:00 AM
Salida: 17:00 PM
Descanso: 60 minutos
---------------------
Horas trabajadas: 8h
Horas ordinarias: 8h (100%)
Horas extras: 0h
Total día: $33,600 (8h × $4,200)
```

### **Caso 2: Jornada con Extras Diurnas**
```
Entrada: 07:00 AM  
Salida: 19:00 PM
Descanso: 60 minutos
---------------------
Horas trabajadas: 11h
Horas ordinarias: 8h
Horas extras diurnas: 3h (25% recargo)
Total día: $49,350 
  - Ordinarias: $33,600 (8h × $4,200)
  - Extras: $15,750 (3h × $5,250)
```

### **Caso 3: Jornada con Extras Nocturnas**
```
Entrada: 14:00 PM
Salida: 02:00 AM (siguiente día)
Descanso: 60 minutos  
---------------------
Horas trabajadas: 11h
Horas ordinarias: 8h
Horas extras nocturnas: 3h (75% recargo)
Total día: $55,650
  - Ordinarias: $33,600 (8h × $4,200)
  - Extras nocturnas: $22,050 (3h × $7,350)
```

---

## ⚠️ **Alertas de Cumplimiento**

### **Alertas Automáticas**
- 🚨 **Jornada excesiva**: >10 horas/día
- ⚡ **Límite extras**: >4 horas extras/día  
- 📊 **Patrón frecuente**: >60% días con extras
- 🌙 **Trabajo nocturno**: Registro de horario nocturno

### **Acciones Recomendadas**
1. Revisar autorización Ministerio de Trabajo
2. Verificar compensación adecuada
3. Evaluar redistribución de cargas
4. Documentar justificaciones

---

## 🔧 **Configuración y Uso**

### **Integración en Página**
```tsx
<CalculadoraHorasExtrasComponent
  jornadas={jornadasColaborador}
  loading={loadingDetalle}
/>
```

### **Valor Hora por Defecto (2025)**
```typescript
// Salario mínimo 2025: $1,008,000
// Horas mensuales: 240h (8h × 30 días)
// Valor hora base: $4,200
const valorHoraOrdinaria = 4200;
```

### **Personalización de Tarifa**
- Input numérico para ajuste manual
- Formateo automático de moneda (COP)
- Cálculo dinámico en tiempo real
- Validación de rangos mínimos

---

## 📈 **Métricas y Reportes**

### **Resumen de Período**
- Total días laborados
- Horas ordinarias acumuladas
- Horas extras por tipo
- Promedio horas/día
- Valor total del período

### **Indicadores de Cumplimiento**
- % días con extras
- Tendencia semanal
- Distribución diurno/nocturno
- Proyección mensual

---

## 🚀 **Optimizaciones Implementadas**

### **Performance**
- Cálculos memoizados por cambio de datos
- Renderizado condicional de detalles
- Formateo lazy de valores monetarios
- Estados de carga granulares

### **UX/UI**
- Feedback visual inmediato
- Estados de carga contextuales
- Validación en tiempo real
- Responsive design completo

---

## 🔮 **Futuras Mejoras**

### **Funcionalidades Pendientes**
- [ ] Cálculo de dominicales y festivos
- [ ] Exportación a Excel/PDF
- [ ] Gráficos de tendencias temporales
- [ ] Comparativas entre colaboradores
- [ ] Integración con nómina
- [ ] Alertas proactivas por email
- [ ] Dashboard gerencial

### **Mejoras Técnicas**
- [ ] Cache de cálculos complejos
- [ ] Worker threads para períodos largos
- [ ] Validación contra API DIAN
- [ ] Integración con calendario laboral
- [ ] Soporte para múltiples contratos

---

## 📚 **Referencias Legales**

### **Código Sustantivo del Trabajo**
- **Artículo 159**: Jornada de trabajo
- **Artículo 160**: Duración máxima
- **Artículo 161**: Trabajo suplementario
- **Artículo 162**: Remuneración horas extras
- **Artículo 163**: Trabajo nocturno
- **Artículo 164**: Descanso dominical

### **Normativa Relacionada**
- Decreto 1072 de 2015 (Decreto Único Reglamentario)
- Resolución 2400 de 1979 (Estatuto de Seguridad)
- Ley 789 de 2002 (Flexibilización laboral)

---

*Calculadora desarrollada para OXITRANS S.A.S siguiendo estrictamente la legislación laboral colombiana vigente - Octubre 2025*