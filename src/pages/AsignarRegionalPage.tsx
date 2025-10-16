import React from 'react';
import '../styles/pages/asignarRegionalPage.scss';
import AsignarRegionalUsuario from '../components/AsignarRegionalUsuario';
import NavigationBar from '../components/common/NavigationBar';
import { useQuery } from '@tanstack/react-query';
import { regionalesService } from '../services/regionalesService.ts';

const AsignarRegionalPage: React.FC = () => {
  // Obtener regionales
  const { data: regionales, isLoading } = useQuery({
    queryKey: ['regionales'],
    queryFn: () => regionalesService.getAll(),
  });

  return (
    <div className="asignar-regional-page">
      <NavigationBar 
        title="Asignar Regional y Tipo de Usuario"
        showBackButton={true}
        showHomeButton={true}
        showBreadcrumb={true}
        showRefreshButton={true}
      />
      <div className="max-w-2xl mx-auto py-8">
        {isLoading ? (
          <div>Cargando regionales...</div>
        ) : (
          <AsignarRegionalUsuario regionales={regionales || []} />
        )}
      </div>
    </div>
  );
};

export default AsignarRegionalPage;
