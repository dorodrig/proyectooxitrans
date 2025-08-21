import React from 'react';
import RegionalesCrud from '../components/RegionalesCrud';
// Aquí iría el componente de gestión de regionales
const RegionalesPage: React.FC = () => {
  return (
    <div className="regionales-page max-w-2xl mx-auto py-8">
  {/* <h1 className="text-2xl font-bold mb-6 text-oxitrans-red">Gestionar Regionaletts</h1> */}
  <RegionalesCrud />
    </div>
  );
};

export default RegionalesPage;
