import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerTag } from '../types';
import {
  Users,
  Send,
  Tag,
  Gift,
  Search,
  Download,
  Plus,
  MessageSquare,
  BadgeIndianRupee,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Check
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { customers, updateCustomerTag, broadcasts, sendBroadcast, merchantProfile } = useStore();
  const [activeTab, setActiveTab] = useState<'directory' | 'broadcast' | 'loyalty'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');
  
  // New Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [targetSegment, setTargetSegment] = useState('All Customers');
  const [broadcastImageUrl, setBroadcastImageUrl] = useState('');
  const [broadcastNotice, setBroadcastNotice] = useState<{ success: boolean; message: string } | null>(null);

  // New Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustTag, setNewCustTag] = useState<CustomerTag>('Regular');

  // Filtered customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTagFilter === 'All' || c.tag === selectedTagFilter;
    return matchesSearch && matchesTag;
  });

  const totalPendingBalance = customers.reduce((sum, c) => sum + (c.pendingBalance || 0), 0);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) {
      setBroadcastNotice({ success: false, message: 'Please fill in both title and content' });
      return;
    }

    sendBroadcast({
      title: broadcastTitle,
      content: broadcastContent,
      targetTag: targetSegment,
      imageUrl: broadcastImageUrl || undefined,
    });

    setBroadcastNotice({
      success: true,
      message: `Broadcast message sent via WhatsApp API to ${targetSegment}!`,
    });

    setBroadcastTitle('');
    setBroadcastContent('');
    setBroadcastImageUrl('');

    setTimeout(() => setBroadcastNotice(null), 4000);
  };

  const exportToCSV = () => {
    const headers = ['ID,Name,Phone,Address,Orders Count,Total Spent (INR),Tag,Loyalty Punches,Pending Balance'];
    const rows = customers.map(
      (c) =>
        `"${c.id}","${c.name}","${c.phone}","${c.address}",${c.ordersCount},${c.totalSpent},"${c.tag}",${c.loyaltyPunches},${c.pendingBalance}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DukaanDost_Customers_${merchantProfile.shopName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#2D332F]">Customer Directory & CRM</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#7E9983]/10 text-[#7E9983] text-xs font-bold border border-[#7E9983]/20">
              <Users className="w-3.5 h-3.5" /> Auto-synced from WhatsApp
            </span>
          </div>
          <p className="text-xs text-[#7A756E] mt-1">
            Segment your neighborhood customers, send promotional WhatsApp broadcasts, and run loyalty rewards.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E5E0D8] bg-white text-[#2D332F] font-semibold text-xs hover:bg-[#F5F2ED] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-[#7A756E]" />
            <span>Export to CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7E9983] text-white font-bold text-xs hover:bg-[#6b8570] transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>New WhatsApp Broadcast</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7A756E]">Total Customers</p>
            <h3 className="text-2xl font-serif font-bold text-[#2D332F] mt-1">{customers.length}</h3>
            <span className="text-[10px] text-[#7E9983] font-bold">100% Verified Contacts</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F5F2ED] text-[#7E9983] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7A756E]">Pending Udhaar / Credit</p>
            <h3 className="text-2xl font-serif font-bold text-[#D97757] mt-1">₹{totalPendingBalance}</h3>
            <span className="text-[10px] text-[#7A756E]">Click to send payment link</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D97757]/10 text-[#D97757] flex items-center justify-center">
            <BadgeIndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7A756E]">Active Loyalty Members</p>
            <h3 className="text-2xl font-serif font-bold text-[#2D332F] mt-1">
              {customers.filter((c) => c.loyaltyPunches >= 5).length}
            </h3>
            <span className="text-[10px] text-[#7E9983] font-bold">Buy 10, Get 1 Free</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#7E9983]/10 text-[#7E9983] flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7A756E]">Broadcast Messages Sent</p>
            <h3 className="text-2xl font-serif font-bold text-[#2D332F] mt-1">{broadcasts.length}</h3>
            <span className="text-[10px] text-[#7E9983] font-bold">WhatsApp Direct API</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F5F2ED] text-[#7E9983] flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#E5E0D8] space-x-6">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 font-bold text-sm transition-colors relative ${
            activeTab === 'directory'
              ? 'text-[#2D332F] border-b-2 border-[#7E9983]'
              : 'text-[#7A756E] hover:text-[#2D332F]'
          }`}
        >
          Customer Directory ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-3 font-bold text-sm transition-colors relative ${
            activeTab === 'broadcast'
              ? 'text-[#2D332F] border-b-2 border-[#7E9983]'
              : 'text-[#7A756E] hover:text-[#2D332F]'
          }`}
        >
          Broadcast Composer
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`pb-3 font-bold text-sm transition-colors relative ${
            activeTab === 'loyalty'
              ? 'text-[#2D332F] border-b-2 border-[#7E9983]'
              : 'text-[#7A756E] hover:text-[#2D332F]'
          }`}
        >
          Loyalty Cards ("Buy 10, Get 1 Free")
        </button>
      </div>

      {/* TAB 1: Customer Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#7A756E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or colony..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E5E0D8] text-xs focus:outline-none focus:ring-2 focus:ring-[#7E9983] bg-[#FDFBF7]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs text-[#7A756E] font-medium shrink-0">Filter Tag:</span>
              {['All', 'Regular', 'Credit', 'VIP', 'Bulk Buyer'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                    selectedTagFilter === tag
                      ? 'bg-[#7E9983] text-white'
                      : 'bg-[#F5F2ED] text-[#2D332F] border border-[#E5E0D8] hover:bg-[#e2ded6]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-[#E5E0D8] p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-[#2D332F] text-base">{c.name}</h3>
                      <p className="text-xs text-[#7A756E] font-mono mt-0.5">{c.phone}</p>
                    </div>

                    {/* Customer Tag Selector */}
                    <select
                      value={c.tag}
                      onChange={(e) => updateCustomerTag(c.id, e.target.value as CustomerTag)}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold border focus:outline-none ${
                        c.tag === 'VIP'
                          ? 'bg-[#D97757]/10 text-[#D97757] border-[#D97757]/30'
                          : c.tag === 'Credit'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : c.tag === 'Bulk Buyer'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-[#7E9983]/10 text-[#7E9983] border-[#7E9983]/30'
                      }`}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Credit">Credit (Udhaar)</option>
                      <option value="VIP">VIP Customer</option>
                      <option value="Bulk Buyer">Bulk Buyer</option>
                    </select>
                  </div>

                  <p className="text-xs text-[#7A756E] mt-2 flex items-center gap-1">
                    <span>📍 {c.address}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-[#FDFBF7] rounded-2xl border border-[#E5E0D8] text-xs">
                    <div>
                      <span className="text-[10px] text-[#7A756E] block">Total Orders</span>
                      <strong className="text-[#2D332F]">{c.ordersCount} orders</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A756E] block">Total Spent</span>
                      <strong className="text-[#2D332F]">₹{c.totalSpent}</strong>
                    </div>
                  </div>

                  {/* Punch Card Preview */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#7A756E]">Punch Loyalty Card:</span>
                      <span className="font-bold text-[#7E9983]">{c.loyaltyPunches}/10 Orders</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-2 flex-1 rounded-full ${
                            idx < c.loyaltyPunches ? 'bg-[#7E9983]' : 'bg-[#E5E0D8]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {c.pendingBalance > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                      <span>Udhaar Due: <strong>₹{c.pendingBalance}</strong></span>
                      <button
                        onClick={() =>
                          alert(`WhatsApp UPI payment reminder link sent to ${c.name} (${c.phone})!`)
                        }
                        className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold hover:bg-amber-700"
                      >
                        Remind on WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#7A756E]">
                  <span>Last order: {c.lastOrderDate}</span>
                  <a
                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7E9983] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Message
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Broadcast Composer */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs space-y-4">
            <h2 className="text-lg font-serif font-bold text-[#2D332F] flex items-center gap-2">
              <Send className="w-5 h-5 text-[#7E9983]" /> Create New WhatsApp Broadcast
            </h2>
            <p className="text-xs text-[#7A756E]">
              Send festival offers, new stock arrivals, or special discounts to segmented customer lists without getting blocked.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7A756E] mb-1">Target Customer Segment</label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-xs focus:outline-none focus:ring-2 focus:ring-[#7E9983] bg-white"
                >
                  <option value="All Customers">All Customers ({customers.length})</option>
                  <option value="Regular">Regular Customers ({customers.filter((c) => c.tag === 'Regular').length})</option>
                  <option value="VIP">VIP Customers ({customers.filter((c) => c.tag === 'VIP').length})</option>
                  <option value="Bulk Buyer">Bulk Buyers ({customers.filter((c) => c.tag === 'Bulk Buyer').length})</option>
                  <option value="Credit">Credit Customers ({customers.filter((c) => c.tag === 'Credit').length})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A756E] mb-1">Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Festival Rice & Edible Oil Discount"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-xs focus:outline-none focus:ring-2 focus:ring-[#7E9983]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A756E] mb-1">WhatsApp Message Body</label>
                <textarea
                  rows={4}
                  placeholder="Namaste! Sharma Kirana store pe aaj Fortune Oil aur Basmati Rice pe 10% off. Reply on WhatsApp to deliver to your doorstep in 15 mins!"
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-xs focus:outline-none focus:ring-2 focus:ring-[#7E9983]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A756E] mb-1">Optional Banner Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={broadcastImageUrl}
                  onChange={(e) => setBroadcastImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-xs focus:outline-none focus:ring-2 focus:ring-[#7E9983]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#7E9983] text-white font-bold text-xs hover:bg-[#6b8570] transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send WhatsApp Broadcast Now</span>
              </button>

              {broadcastNotice && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    broadcastNotice.success ? 'bg-[#7E9983]/10 text-[#7E9983]' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {broadcastNotice.message}
                </div>
              )}
            </form>
          </div>

          {/* Past Broadcasts Feed */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#2D332F]">Sent Broadcast History</h3>

            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl border border-[#E5E0D8] bg-[#FDFBF7] space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[#2D332F] text-sm">{b.title}</h4>
                    <span className="text-[10px] bg-[#7E9983]/10 text-[#7E9983] font-bold px-2 py-0.5 rounded-full border border-[#7E9983]/20">
                      {b.targetTag}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A756E] leading-relaxed">{b.content}</p>
                  {b.imageUrl && (
                    <img src={b.imageUrl} alt="Banner" className="w-full h-28 object-cover rounded-xl border border-[#E5E0D8]" />
                  )}
                  <div className="flex justify-between items-center text-[11px] text-[#7A756E] pt-1">
                    <span>Sent at: {b.sentAt}</span>
                    <span className="font-bold text-[#2D332F]">Delivered to {b.recipientCount} customers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Loyalty Program */}
      {activeTab === 'loyalty' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2D332F] flex items-center gap-2">
                <Gift className="w-6 h-6 text-[#7E9983]" /> Kirana Punch-Card Loyalty ("Buy 10, Get 1 Free")
              </h2>
              <p className="text-xs text-[#7A756E] mt-1">
                Every completed WhatsApp order automatically punches 1 star on the customer's digital card.
              </p>
            </div>
            <span className="text-xs font-bold bg-[#F5F2ED] text-[#2D332F] px-4 py-2 rounded-full border border-[#E5E0D8]">
              Automated Reward: Free 1kg Sugar / Free Milk
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c) => {
              const isEligibleForReward = c.loyaltyPunches >= 10;

              return (
                <div
                  key={c.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isEligibleForReward
                      ? 'bg-[#FFF9F5] border-[#D97757] shadow-sm'
                      : 'bg-[#FDFBF7] border-[#E5E0D8]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-[#2D332F] text-sm">{c.name}</h4>
                      <p className="text-xs text-[#7A756E] font-mono">{c.phone}</p>
                    </div>
                    {isEligibleForReward && (
                      <span className="text-[10px] bg-[#D97757] text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                        Reward Ready! 🎉
                      </span>
                    )}
                  </div>

                  <div className="my-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#7A756E]">Loyalty Progress</span>
                      <span className="font-bold text-[#2D332F]">{c.loyaltyPunches}/10 Punches</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 mt-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            i < c.loyaltyPunches
                              ? 'bg-[#7E9983] text-white shadow-xs'
                              : 'bg-white border border-[#E5E0D8] text-[#7A756E]'
                          }`}
                        >
                          {i < c.loyaltyPunches ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {isEligibleForReward ? (
                    <button
                      onClick={() => alert(`Free gift claim voucher sent to ${c.name} on WhatsApp!`)}
                      className="w-full mt-2 py-2 rounded-xl bg-[#D97757] text-white font-bold text-xs hover:bg-[#c26243] transition-all shadow-xs"
                    >
                      Issue Free Gift Voucher on WhatsApp
                    </button>
                  ) : (
                    <p className="text-[11px] text-[#7A756E] mt-2 text-center">
                      {10 - c.loyaltyPunches} more orders needed for free gift reward
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
