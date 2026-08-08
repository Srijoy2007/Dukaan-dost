import React from 'react';
import { useStore } from '../context/StoreContext';
import { TrendingUp, ShoppingBag, Users, Zap, CheckCircle2, DollarSign } from 'lucide-react';

export const SalesAnalytics: React.FC = () => {
  const { todayStats, orders, inventory } = useStore();

  const totalCatalogValue = inventory.reduce((sum, item) => sum + item.stock * item.price, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#becabd] shadow-sm">
        <h1 className="text-2xl font-black text-[#0b1c30]">Sales & Growth Analytics</h1>
        <p className="text-xs text-[#3e4a40] mt-1">
          Track revenue, fast-moving neighborhood bestsellers, and online vs offline customer trends.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#becabd] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3e4a40]">Total Sales Revenue</span>
            <div className="p-2 bg-[#108548]/10 text-[#108548] rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#006a37] mt-2">₹{todayStats.revenue}</p>
          <span className="text-[10px] text-[#108548] font-bold">↑ 100% Retained (₹0 platform fees)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#becabd] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3e4a40]">Completed Orders</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0b1c30] mt-2">{todayStats.totalOrders}</p>
          <span className="text-[10px] text-gray-500">Average ticket size: ₹{Math.round(todayStats.revenue / (todayStats.totalOrders || 1))}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#becabd] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3e4a40]">Catalog Value</span>
            <div className="p-2 bg-[#ffb61e]/20 text-[#6c4a00] rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0b1c30] mt-2">₹{totalCatalogValue}</p>
          <span className="text-[10px] text-gray-500">{inventory.length} total SKUs active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#becabd] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3e4a40]">Neighborhood Radius</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0b1c30] mt-2">1.5 km</p>
          <span className="text-[10px] text-[#108548] font-bold">10-15 min hyper-local delivery</span>
        </div>
      </div>

      {/* Bestsellers and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#becabd] shadow-sm space-y-4">
          <h3 className="font-bold text-[#0b1c30] text-base">Top Bestsellers This Week</h3>
          <div className="space-y-3">
            {todayStats.topSelling.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#108548] text-white font-bold flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="font-bold text-[#0b1c30]">{item.name}</span>
                </div>
                <span className="font-extrabold text-[#006a37]">{item.count} units ordered</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#becabd] shadow-sm space-y-4">
          <h3 className="font-bold text-[#0b1c30] text-base">Platform Comparison vs Quick Commerce</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#108548]/10 rounded-xl border border-[#108548]/30">
              <p className="font-bold text-[#108548]">Dukaan Dost (Your Store)</p>
              <p className="text-[#3e4a40] mt-1">₹0 platform fee • 100% customer ownership • Instant direct UPI/Cash</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="font-bold text-red-700">Quick-Commerce Platforms (Blinkit/Instamart)</p>
              <p className="text-gray-600 mt-1">15-30% commission • ₹25 delivery fees • Takes control of neighborhood customer relationships</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
