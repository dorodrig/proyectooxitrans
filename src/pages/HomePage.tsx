
import React from 'react';
import { Link } from 'react-router-dom';
import { UserCog } from 'lucide-react';
import DashboardCard from '../components/dashboard/DashboardCard';

const HomePage: React.FC = () => {
  return (
    <div className="home-page min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <h1 className="text-3xl font-bold mb-8 text-oxitrans-red">Bienvenido a OXITRANS Control de Acceso</h1>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-5xl">
  {/* Card de Dashboard */}
  <DashboardCard />

  {/* Card de Administración de Usuarios */}
        <Link to="/admin/usuarios" className="card-home bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group border border-gray-200">
          <div className="bg-oxitrans-red/10 rounded-full p-4 mb-4">
            <UserCog className="text-oxitrans-red w-10 h-10 group-hover:scale-110 transition" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Administrar Usuarios</h2>
          <p className="text-gray-500 text-center">Activa, desactiva o busca usuarios registrados en el sistema.</p>
        </Link>

        {/* Card de Control Maestro */}
        <Link to="/control-maestro" className="card-home bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group border border-blue-200">
          <div className="bg-blue-100 rounded-full p-4 mb-4 flex items-center justify-center">
            <i className="icon-settings text-blue-600" style={{fontSize: 40}}></i>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Control Maestro</h2>
          <p className="text-gray-500 text-center">Accede a la gestión de regionales, tipos de usuario y asignaciones avanzadas.</p>
        </Link>

        {/* Card de Novedades */}
        <Link to="/novedades" className="card-home bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group border border-pink-200">
          <div className="bg-pink-100 rounded-full p-4 mb-4 flex items-center justify-center">
            <i className="icon-notes text-pink-500" style={{fontSize: 40}}></i>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Agregar Novedades</h2>
          <p className="text-gray-500 text-center">Registra incapacidades, ausentismos, permisos y licencias para los empleados.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
