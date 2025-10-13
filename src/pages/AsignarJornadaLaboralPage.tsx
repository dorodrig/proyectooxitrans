import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import NavigationBar from '../components/common/NavigationBar';
import { Clock, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jornadaConfigService } from '../services/jornadaConfigService';
import '../styles/pages/asignarJornadaLaboral.scss';

interface TiempoLaboralGlobal {
  id?: number;
  horaInicio: string;
  horasTrabajo: number;
  horaSalida: string;
  fechaActualizacion?: string;
}

const AsignarJornadaLaboralPage: React.FC = () => {
  const { usuario } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Debug: Verificar estado del usuario solo cuando cambie
  useEffect(() => {
    console.log('👤 [AsignarJornada] Usuario actual:', usuario);
    console.log('🔑 [AsignarJornada] Token en localStorage:', localStorage.getItem('auth_token'));
  }, [usuario]);
  
  // Estados del formulario - TIEMPO LABORAL GLOBAL
  const [formData, setFormData] = useState<TiempoLaboralGlobal>({
    horaInicio: '08:00',
    horasTrabajo: 8,
    horaSalida: '17:00' // Se calcula automáticamente
  });
  
  // Configuración única global para toda la empresa OXITRANS
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Query para obtener tiempo laboral global existente
  const { data: configExistente, isLoading } = useQuery({
    queryKey: ['tiempo-laboral-global'],
    queryFn: () => {
      return jornadaConfigService.obtenerTiempoLaboralGlobal();
    },
    enabled: !!usuario && usuario.rol === 'admin' && !!localStorage.getItem('auth_token'),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });

  // Mutation para actualizar tiempo laboral global
  const guardarConfigMutation = useMutation({
    mutationFn: (data: TiempoLaboralGlobal) => {
      console.log('💾 [TiempoLaboral] Actualizando tiempo laboral global OXITRANS:', data);
      
      // Transformar de formato UI a formato BD
      const dataBD = {
        hora_entrada: data.horaInicio,
        tiempo_trabajo_dia: data.horasTrabajo,
        fin_jornada_laboral: data.horaSalida
      };
      
      return jornadaConfigService.actualizarTiempoLaboralGlobal(dataBD);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiempo-laboral-global'] });
      setSuccessMessage('✅ Tiempo laboral global actualizado exitosamente - Aplica a todos los empleados');
      setErrors({});
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: (error: Error) => {
      console.error('❌ [TiempoLaboral] Error guardando configuración:', error);
      console.error('❌ [TiempoLaboral] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      let errorMessage = 'Error al guardar el tiempo laboral';
      if (error.message.includes('400')) {
        errorMessage = 'Datos inválidos. Verifique los horarios ingresados.';
      } else if (error.message.includes('403')) {
        errorMessage = 'No tiene permisos para realizar esta acción.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error interno del servidor. Contacte al administrador.';
      }
      
      setErrors({ general: errorMessage });
      queryClient.invalidateQueries({ queryKey: ['tiempo-laboral-global'] });
    }
  });

  // Cargar datos existentes cuando se obtengan
  useEffect(() => {
    if (configExistente && configExistente.id) {
      console.log('📝 [TiempoLaboral] Cargando configuración global existente:', configExistente);
      // Transformar desde formato BD a formato UI con parsing seguro
      setFormData({
        id: configExistente.id,
        horaInicio: configExistente.hora_entrada || '08:00',
        horasTrabajo: parseFloat(configExistente.tiempo_trabajo_dia?.toString() || '8'),
        horaSalida: configExistente.fin_jornada_laboral || '17:00',
        fechaActualizacion: configExistente.fecha_actualizacion
      });
    }
  }, [configExistente]);

  // Calcular automáticamente la hora de salida basada en hora inicio + horas trabajo
  useEffect(() => {
    if (formData.horaInicio && formData.horasTrabajo && !isNaN(formData.horasTrabajo)) {
      try {
        const [horas, minutos] = formData.horaInicio.split(':').map(Number);
        const fechaInicio = new Date();
        fechaInicio.setHours(horas, minutos, 0, 0);
        
        // Agregar horas de trabajo + 1 hora de almuerzo
        const horasTrabajoNum = parseFloat(formData.horasTrabajo.toString());
        const tiempoTotalMs = (horasTrabajoNum + 1) * 60 * 60 * 1000;
        const fechaFin = new Date(fechaInicio.getTime() + tiempoTotalMs);
        
        const horaSalida = `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}`;
        
        console.log('🕐 [TiempoLaboral] Calculando hora salida:', {
          horaInicio: formData.horaInicio,
          horasTrabajo: horasTrabajoNum,
          horaSalida
        });
        
        setFormData(prev => ({
          ...prev,
          horaSalida: horaSalida
        }));
      } catch (error) {
        console.error('❌ [TiempoLaboral] Error calculando hora de salida:', error);
      }
    }
  }, [formData.horaInicio, formData.horasTrabajo]);

  // Validaciones de negocio para tiempo laboral
  const validarFormulario = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.horaInicio) {
      newErrors.horaInicio = 'La hora de inicio es requerida';
    }

    if (!formData.horasTrabajo || formData.horasTrabajo <= 0) {
      newErrors.horasTrabajo = 'Las horas de trabajo deben ser mayor a 0';
    }

    if (formData.horasTrabajo < 4) {
      newErrors.horasTrabajo = 'Mínimo 4 horas de trabajo por jornada laboral';
    }

    if (formData.horasTrabajo > 10) {
      newErrors.horasTrabajo = 'Máximo 10 horas de trabajo por regulaciones laborales';
    }

    if (formData.horasTrabajo > 8) {
      newErrors.horasTrabajo = 'ADVERTENCIA: Más de 8 horas generará horas extras automáticamente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof TiempoLaboralGlobal, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (validarFormulario()) {
      guardarConfigMutation.mutate(formData);
    }
  };

  // Verificar autenticación y permisos
  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar title="Configuración Empresarial - Jornada Laboral" />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800">Usuario no autenticado</h3>
                <p className="text-yellow-600 mt-1">
                  Debes iniciar sesión para acceder a esta página.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar permisos - Solo Admin puede modificar configuración empresarial
  if (usuario.rol !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar title="Configuración Empresarial - Jornada Laboral" />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Acceso Restringido</h3>
                <p className="text-red-600 mt-1">
                  Solo los administradores pueden modificar los parámetros maestros empresariales.
                </p>
                <p className="text-red-500 text-sm mt-2">
                  Esta configuración afecta a todos los empleados de la empresa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar title="Asignar Jornada Laboral" />
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando configuración empresarial...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="asignar-jornada-laboral">
        <NavigationBar title="Tiempo Laboral Global - OXITRANS" />
        <div className="asignar-jornada-laboral__container">
        {/* Header */}
        <div className="asignar-jornada-laboral__header">
          <h1>
            <Clock className="h-8 w-8" />
            Configurar Tiempo Laboral Global OXITRANS
          </h1>
          <p className="subtitle">
            Establece el horario laboral que aplicará a todos los trabajadores de la empresa
          </p>
          <div className="info-banner">
            🏢 Esta configuración global afecta a todos los empleados de OXITRANS
          </div>
        </div>

        {/* Formulario */}
        <div className="asignar-jornada-laboral__form-container">
          <form onSubmit={handleSubmit} className="asignar-jornada-laboral__form">
            
            {/* Mensajes de éxito/error globales */}
            {successMessage && (
              <div className="asignar-jornada-laboral__success-message">
                <CheckCircle2 className="h-5 w-5" />
                {successMessage}
              </div>
            )}
            
            {errors.general && (
              <div className="asignar-jornada-laboral__error-message">
                <AlertTriangle className="h-5 w-5" />
                {errors.general}
              </div>
            )}

            {/* Campo 1: Hora de Inicio */}
            <div className="asignar-jornada-laboral__field">
              <label htmlFor="horaInicio" className="asignar-jornada-laboral__label">
                <Clock className="h-5 w-5" />
                Hora de Inicio de Jornada Laboral
              </label>
              <input
                id="horaInicio"
                type="time"
                value={formData.horaInicio}
                onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                className={`asignar-jornada-laboral__input ${errors.horaInicio ? 'error' : ''}`}
                required
              />
              {errors.horaInicio && (
                <span className="asignar-jornada-laboral__error">{errors.horaInicio}</span>
              )}
              <p className="asignar-jornada-laboral__help">
                Hora de inicio de la jornada laboral para todos los trabajadores
              </p>
            </div>

            {/* Campo 2: Horas de Trabajo */}
            <div className="asignar-jornada-laboral__field">
              <label htmlFor="horasTrabajo" className="asignar-jornada-laboral__label">
                <Clock className="h-5 w-5" />
                Horas de Trabajo por Jornada
              </label>
              <input
                id="horasTrabajo"
                type="number"
                min="4"
                max="10"
                step="0.5"
                value={formData.horasTrabajo}
                onChange={(e) => handleInputChange('horasTrabajo', parseFloat(e.target.value) || 0)}
                className={`asignar-jornada-laboral__input ${errors.horasTrabajo ? 'error' : ''}`}
                required
              />
              {errors.horasTrabajo && (
                <span className="asignar-jornada-laboral__error">{errors.horasTrabajo}</span>
              )}
              <p className="asignar-jornada-laboral__help">
                Cantidad de horas efectivas de trabajo (sin incluir almuerzo). Mínimo 4h, Máximo 10h.
              </p>
            </div>

            {/* Campo 3: Hora de Salida (Calculado automáticamente) */}
            <div className="asignar-jornada-laboral__field">
              <label htmlFor="horaSalida" className="asignar-jornada-laboral__label">
                <Clock className="h-5 w-5" />
                Hora de Salida (Calculada)
              </label>
              <input
                id="horaSalida"
                type="time"
                value={formData.horaSalida}
                className="asignar-jornada-laboral__input readonly"
                readOnly
              />
              <p className="asignar-jornada-laboral__help calculated">
                📊 Calculado automáticamente: Inicio + Horas trabajo + 1h almuerzo
              </p>
            </div>

            {/* Resumen de la configuración */}
            <div className="asignar-jornada-laboral__summary">
              <h3>🏭 Configuración Empresarial Maestros</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Entrada:</span>
                  <span className="value">{formData.horaInicio}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Trabajo efectivo:</span>
                  <span className="value">{formData.horasTrabajo}h</span>
                </div>
                <div className="summary-item">
                  <span className="label">Almuerzo (incluido):</span>
                  <span className="value">1h</span>
                </div>
                <div className="summary-item">
                  <span className="label">Salida esperada:</span>
                  <span className="value">{formData.horaSalida}</span>
                </div>
                {formData.horasTrabajo > 8 && (
                  <div className="summary-item warning">
                    <span className="label">⚠️ Horas extras:</span>
                    <span className="value">{(formData.horasTrabajo - 8).toFixed(1)}h</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="asignar-jornada-laboral__actions">
              <button
                type="submit"
                disabled={guardarConfigMutation.isPending}
                className="asignar-jornada-laboral__btn-guardar"
              >
                <Save className="h-5 w-5" />
                {guardarConfigMutation.isPending 
                  ? 'Guardando Tiempo Laboral...' 
                  : configExistente?.id 
                    ? 'Actualizar Tiempo Laboral Global' 
                    : 'Establecer Tiempo Laboral'
                }
              </button>
              <p className="help-text">
                📝 Este horario se aplicará a todos los empleados para reportes, entradas, salidas y dashboard.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AsignarJornadaLaboralPage;