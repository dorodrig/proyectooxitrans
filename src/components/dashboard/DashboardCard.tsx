import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardCard.scss';

const DashboardCard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="card-home bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group border border-oxitrans-red/30" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
      <div className="bg-oxitrans-red/10 rounded-full p-4 mb-4 flex items-center justify-center">
        <i className="icon-bar-chart-2 text-oxitrans-red" style={{fontSize: 40}}></i>
      </div>
      <h2 className="text-xl font-semibold mb-2 text-oxitrans-red">Panel de Dashboard</h2>
      <p className="text-gray-500 text-center">Visualiza gráficamente la información clave del sistema.</p>
      <button className="btn btn-primary mt-2">Ir al Dashboard</button>
    </div>
  );
};

export default DashboardCard;
