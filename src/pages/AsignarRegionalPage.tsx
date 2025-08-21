import React from 'react';
import '../styles/pages/asignarRegionalPage.scss';
import AsignarRegionalUsuario from '../components/AsignarRegionalUsuario';
import { useQuery } from '@tanstack/react-query';
import { regionalesService } from '../services/regionalesService.ts';

const AsignarRegionalPage: React.FC = () => {
  // Obtener regionales
  const { data: regionales, isLoading } = useQuery({
    queryKey: ['regionales'],
    queryFn: () => regionalesService.getAll(),
  });

  return (
    <div className="asignar-regional-page max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-oxitrans-red">Asignar Regional y Tipo de Usuario</h1>
      {isLoading ? (
        <div>Cargando regionales...</div>
      ) : (
        <AsignarRegionalUsuario regionales={regionales || []} />
      )}
    </div>
  );
};

export default AsignarRegionalPage;
