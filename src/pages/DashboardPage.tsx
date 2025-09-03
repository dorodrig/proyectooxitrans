

import React from 'react';
import Header from '../components/ui/Header';
import AdvancedDashboard from '../components/dashboard/AdvancedDashboardNew';

export const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard">
      <Header />
      <main className="dashboard__main">
        <AdvancedDashboard />
      </main>
    </div>
  );
};
