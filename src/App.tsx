import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { OrderHub } from './components/OrderHub';
import { InventoryManagement } from './components/InventoryManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { SalesAnalytics } from './components/SalesAnalytics';
import { SettingsPage } from './components/SettingsPage';
import { WhatsappSimulator } from './components/WhatsappSimulator';

const AppContent: React.FC = () => {
  const { viewMode } = useStore();

  const isMerchantView = ['orders', 'stock', 'customers', 'analytics', 'settings'].includes(viewMode);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D332F] flex flex-col font-sans">
      <Navbar />

      {isMerchantView ? (
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl">
            {viewMode === 'orders' && <OrderHub />}
            {viewMode === 'stock' && <InventoryManagement />}
            {viewMode === 'customers' && <CustomerManagement />}
            {viewMode === 'analytics' && <SalesAnalytics />}
            {viewMode === 'settings' && <SettingsPage />}
          </main>
        </div>
      ) : (
        <main className="flex-1">
          {viewMode === 'landing' && <LandingPage />}
          {viewMode === 'onboarding' && <OnboardingWizard />}
        </main>
      )}

      {/* Floating Interactive Customer WhatsApp AI Chatbot Simulator */}
      <WhatsappSimulator />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
