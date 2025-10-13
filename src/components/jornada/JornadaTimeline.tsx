import React from 'react';
import { type RegistroJornada } from '../../services/jornadasService';
import { formatearHoraUI } from '../../services/tiempoLaboralService';
import './JornadaTimeline.css';

interface JornadaTimelineProps {
  jornada: RegistroJornada | null;
}

/**
 * Componente de línea de tiempo visual para la jornada laboral
 * Muestra una representación gráfica de los eventos de la jornada
 */
export const JornadaTimeline: React.FC<JornadaTimelineProps> = ({ jornada }) => {
  if (!jornada || !jornada.entrada) {
    return (
      <div className="jornada-timeline">
        <div className="timeline-message">
          No hay jornada activa para mostrar
        </div>
      </div>
    );
  }

  // Definir los eventos en orden cronológico
  const eventos = [];
  
  // Entrada (siempre presente si hay jornada)
  eventos.push({
    tipo: 'entrada',
    titulo: 'Entrada',
    icono: '▶️',
    tiempo: jornada.entrada,
    completado: true
  });
  
  // Descanso mañana
  if (jornada.descansoMananaInicio) {
    eventos.push({
      tipo: 'descanso_manana_inicio',
      titulo: 'Descanso AM',
      icono: '☕',
      tiempo: jornada.descansoMananaInicio,
      completado: true
    });
    
    if (jornada.descansoMananaFin) {
      eventos.push({
        tipo: 'descanso_manana_fin',
        titulo: 'Fin Descanso AM',
        icono: '🔙',
        tiempo: jornada.descansoMananaFin,
        completado: true
      });
    } else {
      eventos.push({
        tipo: 'descanso_manana_fin',
        titulo: 'Fin Descanso AM',
        icono: '⏳',
        tiempo: '',
        completado: false
      });
    }
  }
  
  // Almuerzo
  if (jornada.almuerzoInicio) {
    eventos.push({
      tipo: 'almuerzo_inicio',
      titulo: 'Almuerzo',
      icono: '🍽️',
      tiempo: jornada.almuerzoInicio,
      completado: true
    });
    
    if (jornada.almuerzoFin) {
      eventos.push({
        tipo: 'almuerzo_fin',
        titulo: 'Fin Almuerzo',
        icono: '🔙',
        tiempo: jornada.almuerzoFin,
        completado: true
      });
    } else {
      eventos.push({
        tipo: 'almuerzo_fin',
        titulo: 'Fin Almuerzo',
        icono: '⏳',
        tiempo: '',
        completado: false
      });
    }
  }
  
  // Descanso tarde
  if (jornada.descansoTardeInicio) {
    eventos.push({
      tipo: 'descanso_tarde_inicio',
      titulo: 'Descanso PM',
      icono: '☕',
      tiempo: jornada.descansoTardeInicio,
      completado: true
    });
    
    if (jornada.descansoTardeFin) {
      eventos.push({
        tipo: 'descanso_tarde_fin',
        titulo: 'Fin Descanso PM',
        icono: '🔙',
        tiempo: jornada.descansoTardeFin,
        completado: true
      });
    } else {
      eventos.push({
        tipo: 'descanso_tarde_fin',
        titulo: 'Fin Descanso PM',
        icono: '⏳',
        tiempo: '',
        completado: false
      });
    }
  }
  
  // Salida
  if (jornada.salida) {
    eventos.push({
      tipo: 'salida',
      titulo: 'Salida',
      icono: '⏹️',
      tiempo: jornada.salida,
      completado: true
    });
  }
  
  // Ordenar eventos cronológicamente
  eventos.sort((a, b) => {
    if (!a.tiempo) return 1;
    if (!b.tiempo) return -1;
    return new Date(a.tiempo).getTime() - new Date(b.tiempo).getTime();
  });

  return (
    <div className="jornada-timeline">
      <h3 className="timeline-title">Línea de Tiempo</h3>
      
      <div className="timeline">
        {eventos.map((evento, index) => (
          <div 
            key={`${evento.tipo}-${index}`} 
            className={`timeline-event ${evento.completado ? 'completado' : 'pendiente'}`}
          >
            <div className="timeline-dot">
              <span className="timeline-icon">{evento.icono}</span>
            </div>
            
            <div className="timeline-content">
              <div className="timeline-header">
                <h4 className="event-title">{evento.titulo}</h4>
                <span className="event-time">
                  {evento.tiempo ? formatearHoraUI(evento.tiempo) : '-- : --'}
                </span>
              </div>
            </div>
            
            {index < eventos.length - 1 && (
              <div className="timeline-line" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JornadaTimeline;