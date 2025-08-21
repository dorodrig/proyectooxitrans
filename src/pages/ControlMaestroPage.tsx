

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, MapPin } from 'lucide-react';
import '../styles/pages/controlMaestroPage.scss';

const ControlMaestroPage: React.FC = () => {
  return (
    <div className="control-maestro-page">
      <div className="page-header">
        <h1>Panel de Control Maestro</h1>
        <p>Administra regionales, tipos de usuario y asignaciones avanzadas para empleados y visitantes de OXITRANS S.A.S.</p>
        <div className="divider" />
      </div>
      <div className="card-grid">
        {/* Card: Asignar Regional y Tipo de Usuario */}
        <Link to="/admin/asignar-regional" className="card-home">
          <div className="icon">
            <MapPin />
          </div>
          <h2>Asignar Regional y Tipo</h2>
          <p>Asigna regionales y tipos de usuario a empleados o visitantes.</p>
        </Link>
        {/* Card: Gestión de Regionales */}
        <Link to="/admin/regionales" className="card-home">
          <div className="icon">
            <ShieldCheck />
          </div>
          <h2>Gestionar Regionales</h2>
          <p>Crea, edita o elimina regionales de la empresa.</p>
        </Link>
        {/* Card: Gestión de Usuarios */}
        <Link to="/admin/usuarios" className="card-home">
          <div className="icon">
            <Users />
          </div>
          <h2>Usuarios</h2>
          <p>Acceso rápido a la administración de usuarios.</p>
        </Link>
        {/* Card: Gestión de Cargos */}
        <Link to="/admin/cargos" className="card-home">
          <div className="icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
          </div>
          <h2>Gestionar Cargos</h2>
          <p>Agrega, edita y asigna cargos a los usuarios.</p>
        </Link>
      </div>
    </div>
  );
};

export default ControlMaestroPage;
