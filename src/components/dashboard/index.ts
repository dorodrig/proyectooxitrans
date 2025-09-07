// 🎯 EXPORTACIONES DASHBOARD PREMIUM
// Archivo de exportación centralizada para componentes del dashboard

// export { default as Header } from './Header';
// export { default as Sidebar } from './Sidebar';
export { default as StatCard } from './StatCard';
export { default as OverviewCard } from './OverviewCard';
export { default as SalesMetric } from './SalesMetric';
export { default as MetricItem } from './MetricItem';
export { default as Breadcrumb } from './Breadcrumb';
export { 
  DashboardContent, 
  CardGrid, 
  OverviewSection, 
  PageContainer, 
  AppWrapper 
} from './Layout';

// Tipos compartidos
export interface DashboardStats {
  employees: number;
  todayRecords: number;
  totalAccess: number;
  pendingAlerts: number;
}

export interface AccessByArea {
  area: string;
  count: number;
  percentage: number;
  color: string;
}
