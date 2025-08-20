import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, MapPin } from 'lucide-react';

const ControlMaestroPage: React.FC = () => {
  return (
    <div className="control-maestro-page min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <h1 className="text-2xl font-bold mb-8 text-blue-700">Panel de Control Maestro</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Card: Asignar Regional y Tipo de Usuario */}
        <Link to="/admin/asignar-regional" className="card-home bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group border border-blue-200">
          <div className="bg-blue-100 rounded-full p-4 mb-4">
            <MapPin className="text-blue-600 w-10 h-10 group-hover:scale-110 transition" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Asignar Regional y Tipo</h2>
          <p className="text-gray-500 text-center">Asigna regionales y tipos de usuario a empleados o visitantes.</p>
        </Link>
        {/* Card: Gestión de Regionales */}
        <Link to="/admin/regionales" className="card-home bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group border border-blue-200">
          <div className="bg-blue-100 rounded-full p-4 mb-4">
            <ShieldCheck className="text-blue-600 w-10 h-10 group-hover:scale-110 transition" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Gestionar Regionales</h2>
          <p className="text-gray-500 text-center">Crea, edita o elimina regionales de la empresa.</p>
        </Link>
        {/* Card: Gestión de Usuarios */}
        <Link to="/admin/usuarios" className="card-home bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group border border-blue-200">
          <div className="bg-blue-100 rounded-full p-4 mb-4">
            <Users className="text-blue-600 w-10 h-10 group-hover:scale-110 transition" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Usuarios</h2>
          <p className="text-gray-500 text-center">Acceso rápido a la administración de usuarios.</p>
        </Link>
      </div>
    </div>
  );
};

export default ControlMaestroPage;
