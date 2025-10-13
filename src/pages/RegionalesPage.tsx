import React from 'react';
import RegionalesCrud from '../components/RegionalesCrud';
import NavigationBar from '../components/common/NavigationBar';

// Aquí iría el componente de gestión de regionales
const RegionalesPage: React.FC = () => {
  return (
    <div className="regionales-page mx-auto py-8 px-4">
      <NavigationBar 
        title="Gestionar Regionales"
        showBackButton={true}
        showHomeButton={true}
        showBreadcrumb={true}
        showRefreshButton={true}
      />
      {/* <h1 className="text-2xl font-bold mb-6 text-oxitrans-red">Gestionar Regionaletts</h1> */}
      <RegionalesCrud />
    </div>
  );
};

export default RegionalesPage;
