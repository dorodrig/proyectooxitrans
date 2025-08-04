import React from 'react';
import { Link } from 'react-router-dom';
import { UserCog } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="home-page min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <h1 className="text-3xl font-bold mb-8 text-oxitrans-red">Bienvenido a OXITRANS Control de Acceso</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Card de Administración de Usuarios */}
        <Link to="/admin/usuarios" className="card-home bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group border border-gray-200">
          <div className="bg-oxitrans-red/10 rounded-full p-4 mb-4">
            <UserCog className="text-oxitrans-red w-10 h-10 group-hover:scale-110 transition" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Administrar Usuarios</h2>
          <p className="text-gray-500 text-center">Activa, desactiva o busca usuarios registrados en el sistema.</p>
        </Link>
        {/* Aquí puedes agregar más cards para otros módulos en el futuro */}
      </div>
    </div>
  );
};

export default HomePage;
