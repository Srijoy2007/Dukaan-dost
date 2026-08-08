import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Package, BarChart3, Settings, Plus, HelpCircle, PhoneCall, Smartphone, Users } from 'lucide-react';

interface SidebarProps {
  onAddNewItemOpen?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddNewItemOpen }) => {
  const { viewMode, setViewMode, merchantProfile, setIsWhatsappDrawerOpen } = useStore();

  return (
    <>
      {/* SideNavBar (Desktop) */}
      <aside className="hidden md:flex flex-col bg-white border-r border-[#E5E0D8] shadow-sm w-64 h-screen fixed left-0 top-0 pt-24 pb-8 px-4 z-40">
        <div className="flex items-center gap-3 mb-6 px-2 p-3 bg-[#F5F2ED] rounded-2xl border border-[#E5E0D8]">
          <div className="w-10 h-10 rounded-xl bg-[#7E9983] text-white flex items-center justify-center font-serif font-bold text-lg shadow-xs shrink-0">
            {merchantProfile.shopName ? merchantProfile.shopName.slice(0, 2).toUpperCase() : 'DD'}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-serif font-bold text-[#2D332F] truncate">{merchantProfile.shopName || 'Dukaan Dost'}</h2>
            <p className="text-xs text-[#7A756E] flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${merchantProfile.isAgentActive ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`}></span>
              <span className="truncate">{merchantProfile.isAgentActive ? 'Agent Active' : 'Paused'}</span>
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A756E] px-3 mb-2">Management</p>

          <button
            onClick={() => setViewMode('orders')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              viewMode === 'orders'
                ? 'bg-[#7E9983] text-white shadow-sm'
                : 'text-[#2D332F] hover:bg-[#F5F2ED]'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Orders Hub</span>
          </button>

          <button
            onClick={() => setViewMode('stock')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              viewMode === 'stock'
                ? 'bg-[#7E9983] text-white shadow-sm'
                : 'text-[#2D332F] hover:bg-[#F5F2ED]'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Catalog & Stock</span>
          </button>

          <button
            onClick={() => setViewMode('customers')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              viewMode === 'customers'
                ? 'bg-[#7E9983] text-white shadow-sm'
                : 'text-[#2D332F] hover:bg-[#F5F2ED]'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Customers & CRM</span>
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              viewMode === 'analytics'
                ? 'bg-[#7E9983] text-white shadow-sm'
                : 'text-[#2D332F] hover:bg-[#F5F2ED]'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Sales Analytics</span>
          </button>

          <button
            onClick={() => setViewMode('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              viewMode === 'settings'
                ? 'bg-[#7E9983] text-white shadow-sm'
                : 'text-[#2D332F] hover:bg-[#F5F2ED]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings & AI Config</span>
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-[#E5E0D8] space-y-2.5">
          {onAddNewItemOpen && (
            <button
              onClick={onAddNewItemOpen}
              className="w-full flex items-center justify-center gap-2 bg-[#D97757] text-white h-10 rounded-xl text-xs font-bold hover:bg-[#c26547] transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Item</span>
            </button>
          )}

          <button
            onClick={() => setIsWhatsappDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#7E9983]/15 text-[#2D332F] border border-[#7E9983]/30 h-10 rounded-xl text-xs font-semibold hover:bg-[#7E9983]/25 transition-all"
          >
            <Smartphone className="w-4 h-4 text-[#7E9983]" />
            <span>Test Customer AI Bot</span>
          </button>

          <div className="pt-2 text-xs text-[#7A756E] space-y-1">
            <a href="#help" className="flex items-center gap-2 p-1.5 hover:bg-[#F5F2ED] rounded-lg transition-colors">
              <HelpCircle className="w-4 h-4 text-[#7A756E]" />
              <span>Help & Tutorials</span>
            </a>
            <a href="#support" className="flex items-center gap-2 p-1.5 hover:bg-[#F5F2ED] rounded-lg transition-colors">
              <PhoneCall className="w-4 h-4 text-[#7A756E]" />
              <span>Merchant Support</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-[#E5E0D8] flex justify-around items-center h-16 pb-1 z-50 shadow-lg">
        <button
          onClick={() => setViewMode('orders')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium ${
            viewMode === 'orders' ? 'text-[#7E9983] font-bold' : 'text-[#7A756E]'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="mt-0.5">Orders</span>
        </button>

        <button
          onClick={() => setViewMode('stock')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium ${
            viewMode === 'stock' ? 'text-[#7E9983] font-bold' : 'text-[#7A756E]'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="mt-0.5">Stock</span>
        </button>

        <button
          onClick={() => setViewMode('analytics')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium ${
            viewMode === 'analytics' ? 'text-[#7E9983] font-bold' : 'text-[#7A756E]'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="mt-0.5">Analytics</span>
        </button>

        <button
          onClick={() => setIsWhatsappDrawerOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full text-xs font-medium text-[#7E9983]"
        >
          <Smartphone className="w-5 h-5" />
          <span className="mt-0.5">Bot Test</span>
        </button>
      </nav>
    </>
  );
};
