import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Truck,
  PackageCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Plus,
  QrCode,
  Smartphone,
  Check,
  Receipt,
  Phone,
  MapPin,
  TrendingUp,
  Store,
  LayoutGrid,
  List,
  FileText,
  Printer,
  Share2,
  X,
  BadgeIndianRupee
} from 'lucide-react';

export const OrderHub: React.FC = () => {
  const {
    orders,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    wholesalerAlerts,
    triggerWholesalerRestock,
    confirmWholesalerRestock,
    inventory,
    syncOfflineSale,
    todayStats,
    merchantProfile,
    setIsWhatsappDrawerOpen,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed' | 'all'>('pending');
  const [viewLayout, setViewLayout] = useState<'list' | 'kanban'>('list');
  const [offlineItemId, setOfflineItemId] = useState(inventory[0]?.id || '');
  const [offlineQty, setOfflineQty] = useState(1);
  const [offlineNotice, setOfflineNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Invoice Modal State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Settlement Report Modal State
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'pending') return o.status === 'pending';
    if (activeTab === 'active') return ['accepted', 'packing', 'out_for_delivery'].includes(o.status);
    if (activeTab === 'completed') return o.status === 'delivered';
    return true;
  });

  const handleSyncOffline = (e: React.FormEvent) => {
    e.preventDefault();
    const res = syncOfflineSale(offlineItemId, offlineQty);
    setOfflineNotice(res);
    setTimeout(() => setOfflineNotice(null), 4000);
  };

  // Settlement metrics
  const totalSales = orders.filter((o) => o.status !== 'rejected').reduce((acc, o) => acc + o.totalAmount, 0);
  const upiSales = orders.filter((o) => o.status !== 'rejected' && o.paymentMethod === 'upi').reduce((acc, o) => acc + o.totalAmount, 0);
  const cashSales = orders.filter((o) => o.status !== 'rejected' && o.paymentMethod === 'cod').reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'unpaid' && o.status !== 'rejected').reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#2D332F]">Order Hub</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#7E9983]/10 text-[#7E9983] text-xs font-bold border border-[#7E9983]/20">
              <span className="w-2 h-2 rounded-full bg-[#7E9983] animate-pulse"></span>
              Live WhatsApp Agent Active
            </span>
          </div>
          <p className="text-xs text-[#7A756E] mt-1">
            Real-time orders coming from WhatsApp Business number: <strong className="text-[#2D332F]">{merchantProfile.whatsappNumber}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowSettlementModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E5E0D8] bg-[#F5F2ED] text-[#2D332F] font-semibold text-xs hover:bg-[#e8e4dc] transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4 text-[#D97757]" />
            <span>Daily Settlement Summary</span>
          </button>

          <button
            onClick={() => setIsWhatsappDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#7E9983] text-white font-bold text-xs hover:bg-[#6b8570] transition-all shadow-xs"
          >
            <Smartphone className="w-4 h-4" />
            <span>Customer WhatsApp Simulator</span>
          </button>
        </div>
      </div>

      {/* Wholesaler Low Stock AI Alert Banner */}
      {wholesalerAlerts.filter((a) => a.status !== 'delivered').length > 0 && (
        <div className="space-y-3">
          {wholesalerAlerts
            .filter((a) => a.status !== 'delivered')
            .map((alert) => (
              <div
                key={alert.id}
                className="bg-[#F5F2ED] border-2 border-[#D97757] rounded-3xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#D97757] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-[#2D332F] text-sm md:text-base">
                        AI Stock Alert: {alert.itemName} Critically Low!
                      </h3>
                      <span className="text-[10px] bg-[#D97757] text-white font-bold px-2 py-0.5 rounded-md">
                        Only {alert.currentStock} left
                      </span>
                    </div>
                    <p className="text-xs text-[#7A756E] mt-0.5">
                      Wholesaler: <strong className="text-[#2D332F]">{alert.wholesalerName}</strong> ({alert.wholesalerPhone})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  {alert.status === 'alert' ? (
                    <button
                      onClick={() => triggerWholesalerRestock(alert.id)}
                      className="w-full md:w-auto px-5 py-2.5 rounded-full bg-[#7E9983] text-white font-bold text-xs hover:bg-[#6b8570] transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-4 h-4" />
                      <span>1-Click Restock {alert.suggestedRestockQty} {alert.unit}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => confirmWholesalerRestock(alert.id, alert.suggestedRestockQty)}
                      className="w-full md:w-auto px-5 py-2.5 rounded-full bg-[#D97757] text-white font-bold text-xs hover:bg-[#c26243] transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Shipment Delivered (+{alert.suggestedRestockQty})</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Today's Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7A756E]">Today's Sales Revenue</p>
            <h3 className="text-2xl font-serif font-bold text-[#2D332F] mt-1">₹{todayStats.revenue}</h3>
            <span className="text-[10px] text-[#7A756E]">₹0 platform fee deducted</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F5F2ED] text-[#7E9983] flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7A756E]">Active Orders</p>
            <h3 className="text-2xl font-serif font-bold text-[#2D332F] mt-1">{todayStats.totalOrders}</h3>
            <span className="text-[10px] text-[#7E9983] font-bold">100% WhatsApp Direct</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#7E9983]/10 text-[#7E9983] flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7A756E]">Top Kirana Bestseller</p>
            <h3 className="text-lg font-bold text-[#2D332F] mt-1 truncate max-w-[150px]">
              {todayStats.topSelling[0]?.name || 'India Gate Rice'}
            </h3>
            <span className="text-[10px] text-[#7A756E]">Fast neighborhood dispatch</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D97757]/10 text-[#D97757] flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Orders & Offline Walk-in Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Orders Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-[#E5E0D8] space-x-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 font-bold text-sm transition-colors relative ${
                activeTab === 'pending'
                  ? 'text-[#2D332F] border-b-2 border-[#7E9983]'
                  : 'text-[#7A756E] hover:text-[#2D332F]'
              }`}
            >
              Pending Approval ({orders.filter((o) => o.status === 'pending').length})
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={`pb-3 font-bold text-sm transition-colors ${
                activeTab === 'active'
                  ? 'text-[#2D332F] border-b-2 border-[#7E9983]'
                  : 'text-[#7A756E] hover:text-[#2D332F]'
              }`}
            >
              In Progress ({orders.filter((o) => ['accepted', 'packing', 'out_for_delivery'].includes(o.status)).length})
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 font-bold text-sm transition-colors ${
                activeTab === 'completed'
                  ? 'text-[#2D332F] border-b-2 border-[#7E9983]'
                  : 'text-[#7A756E] hover:text-[#2D332F]'
              }`}
            >
              Delivered ({orders.filter((o) => o.status === 'delivered').length})
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 font-bold text-sm transition-colors ${
                activeTab === 'all'
                  ? 'text-[#2D332F] border-b-2 border-[#7E9983]'
                  : 'text-[#7A756E] hover:text-[#2D332F]'
              }`}
            >
              All Orders ({orders.length})
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E0D8]">
              <MessageSquare className="w-12 h-12 text-[#7A756E]/40 mx-auto mb-3" />
              <h3 className="text-base font-serif font-bold text-[#2D332F]">No orders in this tab</h3>
              <p className="text-xs text-[#7A756E] mt-1">
                Try sending a message in the Customer WhatsApp Simulator to generate a new live order!
              </p>
              <button
                onClick={() => setIsWhatsappDrawerOpen(true)}
                className="mt-4 px-5 py-2.5 bg-[#7E9983] text-white rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:bg-[#6b8570]"
              >
                <Smartphone className="w-4 h-4" /> Open Simulator
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#E5E0D8] p-5 shadow-xs hover:shadow-sm transition-shadow space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2D332F] text-sm md:text-base">{order.id}</span>
                      <span className="text-xs text-[#7A756E]">• {order.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${
                          order.status === 'pending'
                            ? 'bg-[#D97757]/10 text-[#D97757] border border-[#D97757]/30'
                            : order.status === 'accepted' || order.status === 'packing'
                            ? 'bg-[#7E9983]/10 text-[#7E9983] border border-[#7E9983]/30'
                            : order.status === 'out_for_delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'delivered'
                            ? 'bg-[#7E9983]/20 text-[#7E9983]'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>

                      <span className="text-xs bg-[#F5F2ED] px-2.5 py-1 rounded-md font-semibold text-[#2D332F]">
                        {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-start justify-between text-xs text-[#7A756E]">
                    <div>
                      <p className="font-bold text-[#2D332F] text-sm">{order.customerName}</p>
                      <p className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#7E9983]" /> {order.address} ({order.distance})
                      </p>
                      <p className="text-[#7A756E] mt-0.5">Phone: {order.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#7A756E]">Total Payable</p>
                      <p className="text-xl font-serif font-bold text-[#2D332F]">₹{order.totalAmount}</p>
                    </div>
                  </div>

                  {/* WhatsApp Message preview */}
                  {order.whatsappMessage && (
                    <div className="bg-[#F5F2ED] p-3 rounded-2xl border border-[#E5E0D8] text-xs italic text-[#2D332F] flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-[#7E9983] shrink-0 mt-0.5" />
                      <span>"{order.whatsappMessage}"</span>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="bg-[#FDFBF7] rounded-2xl p-3 space-y-1 text-xs border border-[#E5E0D8]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-[#E5E0D8] last:border-none">
                        <span className="font-medium text-[#2D332F]">
                          {item.name} ({item.unit}) × {item.qty}
                        </span>
                        <span className="font-bold text-[#2D332F]">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="text-[11px] text-[#7E9983] font-bold hover:underline flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" /> View Invoice & UPI QR
                    </button>

                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => rejectOrder(order.id)}
                            className="px-3 py-1.5 rounded-full border border-red-300 text-red-600 font-bold text-xs hover:bg-red-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => acceptOrder(order.id)}
                            className="px-5 py-1.5 rounded-full bg-[#7E9983] text-white font-bold text-xs hover:bg-[#6b8570] shadow-xs flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" /> Accept & Pack
                          </button>
                        </>
                      )}

                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'packing')}
                          className="px-4 py-1.5 rounded-full bg-[#D97757] text-white font-bold text-xs hover:bg-[#c26243]"
                        >
                          Mark as Packing
                        </button>
                      )}

                      {order.status === 'packing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                          className="px-4 py-1.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Truck className="w-4 h-4" /> Dispatch to Home
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <span className="text-xs text-[#7E9983] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Offline Counter Sales Quick Sync */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
              <QrCode className="w-5 h-5 text-[#7E9983]" />
              <h3 className="font-serif font-bold text-[#2D332F] text-base">Record Walk-in Counter Sale</h3>
            </div>

            <p className="text-xs text-[#7A756E]">
              Deduct offline cash sales immediately so stock availability on WhatsApp stays accurate.
            </p>

            <form onSubmit={handleSyncOffline} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#7A756E] mb-1">Select Item Sold</label>
                <select
                  value={offlineItemId}
                  onChange={(e) => setOfflineItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] text-xs focus:outline-none focus:ring-2 focus:ring-[#7E9983] bg-white"
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.stock} left in stock) - ₹{item.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A756E] mb-1">Quantity Sold Counter</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={offlineQty}
                  onChange={(e) => setOfflineQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] text-xs focus:outline-none focus:ring-2 focus:ring-[#7E9983] bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#7E9983] text-white font-bold text-xs hover:bg-[#6b8570] transition-all shadow-xs"
              >
                Deduct Offline Counter Stock
              </button>
            </form>

            {offlineNotice && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  offlineNotice.success ? 'bg-[#7E9983]/10 text-[#7E9983]' : 'bg-red-100 text-red-700'
                }`}
              >
                {offlineNotice.message}
              </div>
            )}
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-[#F5F2ED] p-5 rounded-3xl border border-[#E5E0D8] space-y-2 text-xs">
            <h4 className="font-bold text-[#2D332F] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> Zero Platform Fee Guarantee
            </h4>
            <p className="text-[#7A756E] leading-relaxed">
              Dukaan Dost does not charge commission on any delivery or offline sales. You collect payment directly via Cash or UPI QR.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Auto-Invoice & UPI QR Code Generator */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-[#E5E0D8] font-sans">
            <button
              onClick={() => setSelectedInvoiceOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F5F2ED] text-[#7A756E]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-[#E5E0D8] pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7E9983] text-white font-serif font-bold text-xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                {merchantProfile.shopName.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2D332F]">{merchantProfile.shopName}</h3>
              <p className="text-xs text-[#7A756E]">{merchantProfile.address}, {merchantProfile.city}</p>
              <p className="text-[11px] text-[#7A756E] font-mono mt-0.5">UPI ID: {merchantProfile.phone}@upi</p>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div className="flex justify-between font-semibold border-b border-[#E5E0D8] pb-2">
                <span>Invoice #: {selectedInvoiceOrder.receiptId || selectedInvoiceOrder.id}</span>
                <span>Date: Today</span>
              </div>
              <div className="flex justify-between text-[#7A756E]">
                <span>Customer: <strong>{selectedInvoiceOrder.customerName}</strong></span>
                <span>Phone: {selectedInvoiceOrder.customerPhone}</span>
              </div>

              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#E5E0D8] space-y-1">
                {selectedInvoiceOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <span>{it.name} ({it.unit}) × {it.qty}</span>
                    <span className="font-bold">₹{it.price * it.qty}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-[#2D332F] pt-1">
                <span>Total Payable Amount</span>
                <span className="text-xl font-serif text-[#7E9983]">₹{selectedInvoiceOrder.totalAmount}</span>
              </div>
            </div>

            {/* UPI QR Code Mockup */}
            <div className="bg-[#F5F2ED] p-4 rounded-2xl border border-[#E5E0D8] text-center space-y-2 mb-4">
              <p className="text-xs font-bold text-[#2D332F]">Scan with BHIM / Google Pay / PhonePe</p>
              <div className="w-32 h-32 bg-white rounded-xl mx-auto p-2 border border-[#E5E0D8] flex items-center justify-center shadow-xs">
                <QrCode className="w-24 h-24 text-[#2D332F]" />
              </div>
              <a
                href={`upi://pay?pa=${merchantProfile.phone}@upi&pn=${encodeURIComponent(merchantProfile.shopName)}&am=${selectedInvoiceOrder.totalAmount}&cu=INR`}
                className="text-[11px] text-[#7E9983] font-bold underline block"
              >
                Click for UPI Direct Pay Deep Link
              </a>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert('Receipt Invoice sent to customer on WhatsApp!');
                  setSelectedInvoiceOrder(null);
                }}
                className="flex-1 py-2.5 rounded-full bg-[#7E9983] text-white font-bold text-xs hover:bg-[#6b8570] flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Share2 className="w-4 h-4" /> Send Invoice on WhatsApp
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-full border border-[#E5E0D8] text-[#2D332F] font-semibold text-xs hover:bg-[#F5F2ED]"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Daily Settlement Report (EOD) */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E5E0D8] font-sans space-y-5">
            <button
              onClick={() => setShowSettlementModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F5F2ED] text-[#7A756E]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#E5E0D8] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#D97757] text-white flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2D332F]">Daily End-of-Day Settlement Report</h3>
                <p className="text-xs text-[#7A756E]">{merchantProfile.shopName} • Today's Summary</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E5E0D8]">
                <span className="text-[#7A756E] block text-[11px]">Total Revenue Collected</span>
                <strong className="text-xl font-serif text-[#2D332F]">₹{totalSales}</strong>
              </div>

              <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E5E0D8]">
                <span className="text-[#7A756E] block text-[11px]">Pending Udhaar / Credit</span>
                <strong className="text-xl font-serif text-[#D97757]">₹{pendingPayments}</strong>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-emerald-800 block text-[11px]">UPI Digital Payments</span>
                <strong className="text-lg font-bold text-emerald-900">₹{upiSales}</strong>
              </div>

              <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200">
                <span className="text-blue-800 block text-[11px]">Cash on Delivery (COD)</span>
                <strong className="text-lg font-bold text-blue-900">₹{cashSales}</strong>
              </div>
            </div>

            <div className="bg-[#F5F2ED] p-4 rounded-2xl border border-[#E5E0D8] space-y-2 text-xs">
              <h4 className="font-bold text-[#2D332F] flex items-center gap-1.5">
                <BadgeIndianRupee className="w-4 h-4 text-[#7E9983]" /> Bank Reconciliation Status
              </h4>
              <p className="text-[#7A756E]">
                All UPI payments settled directly to shop account <strong className="text-[#2D332F]">{merchantProfile.phone}@upi</strong> with ₹0 deduction.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`Daily settlement report auto-sent to owner WhatsApp (${merchantProfile.phone})!`);
                  setShowSettlementModal(false);
                }}
                className="w-full py-3 rounded-full bg-[#7E9983] text-white font-bold text-xs hover:bg-[#6b8570] flex items-center justify-center gap-2 shadow-xs"
              >
                <Share2 className="w-4 h-4" /> Send Settlement Report to Owner WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
