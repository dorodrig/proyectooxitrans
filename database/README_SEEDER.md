# 🗄️ Seeder de Jornadas Laborales - OXITRANS S.A.S

Este seeder genera datos de prueba realistas para el módulo de **Jornadas Laborales** basado en la funcionalidad del `JornadaLaboralPage.tsx`.

## 📋 Contenido Generado

### 🧑‍💼 **Datos de Empleados Simulados**
El script genera jornadas para diferentes perfiles de empleados:

1. **Juan Pérez (ID 1)** - Empleado puntual y completo
2. **María García (ID 2)** - Empleada con variaciones normales  
3. **Carlos Rodríguez (ID 3)** - Empleado con horario flexible
4. **Ana López (ID 4)** - Supervisora con jornada extendida
5. **Roberto Sánchez (ID 5)** - Empleado que a veces omite descansos

### 📅 **Período de Datos**
- **Últimos 30 días**: Datos históricos completos
- **Día actual**: Jornadas en diferentes estados (entrada, almuerzo, descansos, etc.)
- **Casos especiales**: Jornadas auto-cerradas, incompletas, horas extras

### ⏰ **Estados de Jornada Simulados**

Basado en `JornadaLaboralPage.tsx`, se incluyen todos los estados posibles:

#### ✅ **Jornadas Completas**
```
Entrada → Descanso AM → Almuerzo → Descanso PM → Salida
08:00   → 10:15-10:30 → 12:00-13:00 → 15:30-15:45 → 17:00
```

#### 🔄 **Jornadas En Curso** (Para pruebas en tiempo real)
- Solo entrada registrada
- Después del descanso de mañana
- En almuerzo (inicio sin fin)
- Después del almuerzo
- En descanso de tarde

#### ⚠️ **Casos Especiales**
- **Auto-cerradas**: Jornadas cerradas automáticamente por el sistema
- **Incompletas**: Empleados que no completaron su jornada
- **Sin descansos**: Empleados que omitieron algunos descansos
- **Horas extras**: Jornadas extendidas

## 🚀 Ejecución

### **Método 1: Script Automático (Recomendado)**
```bash
# Ejecutar el archivo batch
./database/ejecutar_seeder.bat
```

### **Método 2: Manual con Node.js**
```bash
# Desde la carpeta database
cd database
node run_seeder.js
```

### **Método 3: SQL Directo**
```bash
# Ejecutar directamente en MySQL
mysql -u usuario -p database_name < seed_jornadas_laborales.sql
```

## 📊 **Estadísticas Generadas**

Después de la ejecución, verás:

```
📈 ESTADÍSTICAS GENERALES:
   - Total de jornadas: ~50-60
   - Empleados con registros: 10
   - Promedio de horas: 8.05
   - Fecha más reciente: 2025-09-29
   - Fecha más antigua: 2025-08-30

👥 DISTRIBUCIÓN POR EMPLEADO:
   - Juan Pérez: 12 jornadas, 8.02h promedio
   - María García: 11 jornadas, 7.84h promedio
   - Carlos Rodríguez: 10 jornadas, 7.98h promedio
   ...

📅 JORNADAS DE HOY:
   - Juan Pérez: 08:00 - 17:00 (Completa)
   - María García: 08:15 - 17:30 (Completa)  
   - Roberto Sánchez: 08:00 - --:-- (En curso)
   ...
```

## 🎯 **Casos de Prueba Cubiertos**

### **Para JornadaLaboralPage.tsx**

1. **✅ Funcionalidad Completa**
   - Todos los botones en orden correcto
   - Estados de botones según progreso
   - Cálculo de tiempo transcurrido
   - Formateo de hora colombiana

2. **🔄 Estados Dinámicos**
   - Botones habilitados/deshabilitados según reglas
   - Transiciones entre estados
   - Validación de secuencia de eventos

3. **📱 Casos de Uso Reales**
   - Empleados puntuales vs tardíos
   - Jornadas con/sin descansos
   - Horarios flexibles vs fijos
   - Supervisores con jornadas extendidas

4. **⚠️ Manejo de Errores**
   - Jornadas auto-cerradas
   - Registros incompletos
   - Validación de ubicación GPS

## 🔧 **Configuración Requerida**

### **Variables de Entorno**
Asegúrate de tener configurado `server/.env`:
```env
DB_HOST=tu-host-mysql
DB_USER=tu-usuario
DB_PASS=tu-contraseña
DB_NAME=oxitrans_control_acceso
DB_PORT=3306
```

### **Dependencias**
```bash
# En la carpeta server
npm install mysql2 dotenv
```

## 📝 **Estructura de Datos**

### **Tabla: jornadas_laborales**
```sql
- id (PRIMARY KEY)
- usuario_id (FOREIGN KEY → usuarios.id)
- fecha (DATE)
- entrada (TIME)
- descanso_manana_inicio (TIME)
- descanso_manana_fin (TIME)  
- almuerzo_inicio (TIME)
- almuerzo_fin (TIME)
- descanso_tarde_inicio (TIME)
- descanso_tarde_fin (TIME)
- salida (TIME)
- horas_trabajadas (DECIMAL)
- auto_cerrada (BOOLEAN)
- observaciones (TEXT)
```

## 🧪 **Pruebas Sugeridas**

Después de ejecutar el seeder:

1. **Frontend (JornadaLaboralPage.tsx)**
   ```
   http://localhost:5174/jornada-laboral
   ```
   - Login con diferentes usuarios (IDs 1-10)
   - Verificar estados de botones
   - Probar secuencia completa de jornada

2. **Backend (API)**
   ```
   GET http://localhost:3001/api/jornadas/actual
   POST http://localhost:3001/api/jornadas/registrar
   ```

3. **Base de Datos**
   ```sql
   SELECT * FROM jornadas_laborales WHERE DATE(fecha) = CURDATE();
   SELECT * FROM jornadas_laborales WHERE usuario_id = 1 ORDER BY fecha DESC;
   ```

## 🎉 **¡Listo para Probar!**

Con estos datos de prueba podrás:
- ✅ Probar todos los casos de uso del `JornadaLaboralPage.tsx`
- ✅ Verificar la lógica de estados y transiciones
- ✅ Testear el formato de horarios colombianos
- ✅ Validar el cálculo de tiempo transcurrido
- ✅ Comprobar la funcionalidad completa del sistema

---

**🔗 Archivos Relacionados:**
- `seed_jornadas_laborales.sql` - Script SQL principal
- `run_seeder.js` - Ejecutor Node.js
- `ejecutar_seeder.bat` - Script batch para Windows
- `JornadaLaboralPage.tsx` - Componente frontend objetivo