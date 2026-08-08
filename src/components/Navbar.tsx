import React from 'react';
import { useStore } from '../context/StoreContext';
import { Store, MessageSquare, Menu, ArrowRight, Smartphone } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { viewMode, setViewMode, merchantProfile, setIsWhatsappDrawerOpen } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav
      id="navbar"
      className="bg-white text-[#2D332F] border-b border-[#E5E0D8] docked full-width top-0 flex justify-between items-center w-full px-4 md:px-8 h-20 fixed z-50 transition-all duration-300 shadow-sm"
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode('landing')}>
        <div className="w-10 h-10 rounded-xl bg-[#7E9983] text-white flex items-center justify-center font-serif font-bold text-xl shadow-sm">
          DD
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-serif font-bold tracking-tight text-[#2D332F]">Dukaan Dost</span>
          <span className="text-xs text-[#7A756E] font-medium hidden sm:inline-block">Empowering Kirana Stores</span>
        </div>
      </div>

      {/* Center Links (Web) */}
      <div className="hidden md:flex items-center gap-6">
        <button
          onClick={() => setViewMode('landing')}
          className={`font-semibold pb-1 transition-colors ${
            viewMode === 'landing'
              ? 'text-[#7E9983] border-b-2 border-[#7E9983]'
              : 'text-[#7A756E] hover:text-[#2D332F]'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => {
            setViewMode('landing');
            setTimeout(() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="text-[#7A756E] font-medium hover:text-[#2D332F] transition-colors"
        >
          Features
        </button>
        <button
          onClick={() => {
            setViewMode('landing');
            setTimeout(() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="text-[#7A756E] font-medium hover:text-[#2D332F] transition-colors"
        >
          How it Works
        </button>
        <button
          onClick={() => setViewMode('orders')}
          className={`font-semibold pb-1 transition-colors ${
            viewMode === 'orders' || viewMode === 'stock' || viewMode === 'analytics' || viewMode === 'settings'
              ? 'text-[#7E9983] border-b-2 border-[#7E9983]'
              : 'text-[#7A756E] hover:text-[#2D332F]'
          }`}
        >
          Merchant Hub
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Customer WhatsApp Bot Demo Trigger */}
        <button
          onClick={() => setIsWhatsappDrawerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F5F2ED] border border-[#E5E0D8] text-[#2D332F] font-medium text-xs md:text-sm hover:bg-[#e8e3d9] transition-all shadow-xs"
          title="Try Customer WhatsApp Ordering AI"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
          <Smartphone className="w-4 h-4 text-[#7E9983]" />
          <span>WhatsApp Customer Simulator</span>
        </button>

        {merchantProfile.onboardingCompleted ? (
          <button
            onClick={() => setViewMode('orders')}
            className="hidden md:flex items-center gap-2 h-10 px-5 rounded-xl bg-[#7E9983] text-white font-semibold text-sm hover:bg-[#6b8570] transition-colors shadow-sm"
          >
            <span>Merchant Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setViewMode('onboarding')}
            className="hidden md:flex items-center justify-center h-10 px-6 rounded-xl bg-[#7E9983] text-white font-semibold text-sm hover:bg-[#6b8570] transition-colors shadow-sm"
          >
            Register Shop
          </button>
        )}

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#2D332F] p-2 rounded-lg hover:bg-[#F5F2ED]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-[#E5E0D8] p-4 flex flex-col gap-3 shadow-lg z-50">
          <button
            onClick={() => {
              setViewMode('landing');
              setMobileMenuOpen(false);
            }}
            className="text-left font-medium py-2 px-3 hover:bg-[#F5F2ED] rounded-lg text-[#2D332F]"
          >
            Home
          </button>
          <button
            onClick={() => {
              setViewMode('onboarding');
              setMobileMenuOpen(false);
            }}
            className="text-left font-medium py-2 px-3 hover:bg-[#F5F2ED] rounded-lg text-[#2D332F]"
          >
            Register Your Shop
          </button>
          <button
            onClick={() => {
              setViewMode('orders');
              setMobileMenuOpen(false);
            }}
            className="text-left font-medium py-2 px-3 hover:bg-[#F5F2ED] rounded-lg text-[#2D332F]"
          >
            Order Hub (Merchant)
          </button>
          <button
            onClick={() => {
              setViewMode('stock');
              setMobileMenuOpen(false);
            }}
            className="text-left font-medium py-2 px-3 hover:bg-[#F5F2ED] rounded-lg text-[#2D332F]"
          >
            Inventory Management
          </button>
          <button
            onClick={() => {
              setIsWhatsappDrawerOpen(true);
              setMobileMenuOpen(false);
            }}
            className="text-left font-medium py-2 px-3 bg-[#7E9983]/10 text-[#7E9983] font-semibold rounded-lg flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-[#7E9983]" />
            Test WhatsApp Customer Ordering
          </button>
        </div>
      )}
    </nav>
  );
};
