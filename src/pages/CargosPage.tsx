import React from 'react';
// import { Briefcase } from 'lucide-react';
import CargosCrud from '../components/CargosCrud';
import NavigationBar from '../components/common/NavigationBar';

const CargosPage: React.FC = () => {
  return (
    <div className="cargos-page max-w-2xl mx-auto py-8">
      <NavigationBar 
        title="Gestión de Cargos"
        showBackButton={true}
        showHomeButton={true}
        showBreadcrumb={true}
        showRefreshButton={true}
      />
      {/* <h1 className="text-2xl font-bold mb-6 text-oxitrans-red flex items-center gap-2">
        <Briefcase size={28} />
        Gestión de Cargos
      </h1>
      <p className="mb-4 text-gray-700">Agrega, edita y asigna cargos a los usuarios de OXITRANS S.A.S.</p> */}
      <CargosCrud />
    </div>
  );
};

export default CargosPage;
