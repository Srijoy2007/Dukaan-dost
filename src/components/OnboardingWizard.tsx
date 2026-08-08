import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShopCategory, InventoryItem } from '../types';
import {
  CheckCircle2,
  Store,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
  Check,
  Package,
  Plus,
  Trash2,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { merchantProfile, updateMerchantProfile, setViewMode, inventory, addInventoryItem } = useStore();

  const [step, setStep] = useState<number>(1);
  const [googleSignedIn, setGoogleSignedIn] = useState(true);
  const [whatsappAppChecked, setWhatsappAppChecked] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    ownerName: merchantProfile.ownerName || 'Ramprasad Sharma',
    gmail: merchantProfile.gmail || 'sharma.kirana@gmail.com',
    age: merchantProfile.age || 42,
    phone: merchantProfile.phone || '+91 98765 43210',
    shopName: merchantProfile.shopName || 'Sharma Kirana Store',
    category: (merchantProfile.category || 'grocery') as ShopCategory,
    address: merchantProfile.address || 'Shop No. 4, Block B Market, Green Park',
    city: merchantProfile.city || 'New Delhi',
    pincode: merchantProfile.pincode || '110016',
    aadhar: merchantProfile.aadhar || '5829-4910-4829',
    whatsappNumber: merchantProfile.whatsappNumber || '+91 98765 43210',
    coverageRadiusKm: merchantProfile.coverageRadiusKm || 1.5,
  });

  const [verificationOtpSent, setVerificationOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('4829');
  const [isVerified, setIsVerified] = useState(true);

  // Custom item being added in Step 4
  const [customItem, setCustomItem] = useState({
    name: '',
    unit: '1kg',
    price: 50,
    stock: 20,
    category: 'grocery' as ShopCategory,
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinishOnboarding = () => {
    updateMerchantProfile({
      ...formData,
      onboardingCompleted: true,
      isWhatsappVerified: true,
      isAgentActive: true,
    });
    setViewMode('orders');
  };

  const categoriesList: { id: ShopCategory; label: string; icon: string }[] = [
    { id: 'grocery', label: 'Kirana & Grocery', icon: '🛒' },
    { id: 'vegetables', label: 'Fresh Fruits & Vegetables', icon: '🥬' },
    { id: 'flowers', label: 'Flowers & Puja Items', icon: '🌺' },
    { id: 'crockery', label: 'Crockery & Utensils', icon: '🍽️' },
    { id: 'general', label: 'General Store & Stationers', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D332F] pt-28 pb-16 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#2D332F]">Register Your Shop</h1>
          <p className="text-sm text-[#7A756E] mt-1">
            Setup your WhatsApp AI agent & inventory in under 2 minutes.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between mb-8 px-2 md:px-8 relative">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-[#E5E0D8] -z-10 -translate-y-1/2"></div>
          
          {[
            { num: 1, label: 'Account' },
            { num: 2, label: 'Business' },
            { num: 3, label: 'Identity' },
            { num: 4, label: 'Inventory' },
          ].map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;

            return (
              <div key={s.num} className="flex flex-col items-center bg-[#FDFBF7] px-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs ${
                    isDone
                      ? 'bg-[#7E9983] text-white'
                      : isActive
                      ? 'bg-[#D97757] text-white font-serif'
                      : 'bg-[#F5F2ED] text-[#7A756E] border border-[#E5E0D8]'
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#2D332F] font-bold' : 'text-[#7A756E]'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Card Content Container */}
        <div className="bg-white rounded-3xl border border-[#E5E0D8] p-6 md:p-8 shadow-sm">
          {/* STEP 1: Account (Gmail & Basic Info) */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#E5E0D8] pb-4">
                <h2 className="text-xl font-serif font-bold text-[#2D332F]">Step 1: Account Setup</h2>
                <p className="text-xs text-[#7A756E]">Sign in with your official store Gmail to receive daily sales summaries.</p>
              </div>

              {/* Gmail Auto-fill Box */}
              <div className="p-4 rounded-2xl bg-[#F5F2ED] border border-[#E5E0D8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D97757] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                    G
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2D332F]">{formData.gmail}</p>
                    <p className="text-xs text-[#7E9983] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Google Account Linked
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-white px-3 py-1 rounded-full border border-[#E5E0D8] font-medium text-[#7A756E]">
                  Auto-verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#7A756E] mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#7E9983]"
                    placeholder="e.g. Ramprasad Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7A756E] mb-1">Owner Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#7E9983]"
                    placeholder="e.g. 42"
                  />
                </div>
              </div>

              {/* WhatsApp Business Requirement Banner */}
              <div className="p-4 rounded-2xl bg-[#7E9983]/10 border border-[#7E9983]/20 flex items-start gap-3">
                <Smartphone className="w-6 h-6 text-[#7E9983] shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#2D332F]">WhatsApp Business Required</h4>
                  <p className="text-xs text-[#7A756E]">
                    Dukaan Dost integrates directly with your WhatsApp Business account to automate catalogue parsing, order confirmation, and digital receipt generation.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={whatsappAppChecked}
                      onChange={(e) => setWhatsappAppChecked(e.target.checked)}
                      className="rounded text-[#7E9983] focus:ring-[#7E9983] w-4 h-4"
                    />
                    <span className="text-xs font-bold text-[#2D332F]">
                      I have WhatsApp Business installed on my smartphone
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7E9983] text-white font-bold text-sm hover:bg-[#6b8570] transition-all shadow-sm"
                >
                  <span>Continue to Business Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Business Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#E5E0D8] pb-4">
                <h2 className="text-xl font-serif font-bold text-[#2D332F]">Step 2: Business Information</h2>
                <p className="text-xs text-[#7A756E]">Tell us about your shop name, category, and physical location.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A756E] mb-1">Shop / Dukaan Name</label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#7E9983]"
                  placeholder="e.g. Sharma Kirana Store"
                />
              </div>

              {/* Category Selector Chips */}
              <div>
                <label className="block text-xs font-bold text-[#7A756E] mb-2">Shop Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoriesList.map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#7E9983] text-white border-[#7E9983] font-bold shadow-xs'
                            : 'border-[#E5E0D8] hover:bg-[#F5F2ED] text-[#2D332F]'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-xs md:text-sm">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#7A756E] mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#7E9983]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7A756E] mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#7E9983]"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E0D8] text-sm font-semibold hover:bg-[#F5F2ED]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7E9983] text-white font-bold text-sm hover:bg-[#6b8570] transition-all shadow-sm"
                >
                  <span>Continue to Identity Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Identity & WhatsApp Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#E5E0D8] pb-4">
                <h2 className="text-xl font-serif font-bold text-[#2D332F]">Step 3: Identity & WhatsApp Verification</h2>
                <p className="text-xs text-[#7A756E]">Aadhar verification protects your shop and guarantees zero fraud.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F2ED] border border-[#E5E0D8] space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#7A756E] mb-1 flex items-center justify-between">
                    <span>Aadhar Card Number</span>
                    <span className="text-[10px] text-[#7E9983] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted Government Check
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.aadhar}
                    onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#7E9983] bg-white"
                    placeholder="XXXX-XXXX-4829"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7A756E] mb-1">WhatsApp Business Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#7E9983] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setVerificationOtpSent(true)}
                      className="px-4 py-2.5 rounded-xl bg-[#7E9983] text-white text-xs font-bold hover:bg-[#6b8570] transition-colors shadow-xs"
                    >
                      {verificationOtpSent ? 'Resend OTP' : 'Verify OTP'}
                    </button>
                  </div>
                </div>

                {verificationOtpSent && (
                  <div className="p-3 bg-white rounded-xl border border-[#7E9983]/40 flex items-center justify-between animate-fade-in">
                    <div>
                      <p className="text-xs font-bold text-[#2D332F]">OTP sent to {formData.whatsappNumber}</p>
                      <p className="text-[10px] text-[#7A756E]">Auto-detecting code...</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-20 px-2 py-1 text-center font-mono font-bold text-sm border border-[#E5E0D8] rounded-lg"
                      />
                      <span className="text-xs bg-[#7E9983] text-white px-2 py-1 rounded-md font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Walking Radius */}
              <div>
                <label className="block text-xs font-bold text-[#7A756E] mb-1 flex justify-between">
                  <span>Home Delivery Radius</span>
                  <span className="text-[#7E9983] font-bold">{formData.coverageRadiusKm} km (Colony & Apartments)</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={formData.coverageRadiusKm}
                  onChange={(e) => setFormData({ ...formData, coverageRadiusKm: Number(e.target.value) })}
                  className="w-full accent-[#7E9983] cursor-pointer"
                />
                <p className="text-[11px] text-[#7A756E] mt-1">
                  Orders outside this walking radius will be automatically rejected by your WhatsApp AI agent.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E0D8] text-sm font-semibold hover:bg-[#F5F2ED]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7E9983] text-white font-bold text-sm hover:bg-[#6b8570] transition-all shadow-sm"
                >
                  <span>Continue to Inventory Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Initial Inventory Setup */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#E5E0D8] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#2D332F]">Step 4: Stock & Inventory Preset</h2>
                  <p className="text-xs text-[#7A756E]">We loaded starter Kirana products. Adjust prices or add your own.</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs bg-[#F5F2ED] text-[#7E9983] font-bold px-3 py-1 rounded-full border border-[#E5E0D8]">
                  <Sparkles className="w-3.5 h-3.5" /> {inventory.length} Catalog Items Ready
                </span>
              </div>

              {/* Preset Stock Preview Grid */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-[#E5E0D8] rounded-2xl p-3 bg-[#FDFBF7]">
                {inventory.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-[#E5E0D8] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-[#E5E0D8]" />
                      <div>
                        <p className="font-bold text-[#2D332F]">{item.name}</p>
                        <p className="text-[10px] text-[#7A756E]">{item.unit} • Category: {item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-[#7A756E]">Stock: {item.stock}</span>
                      <span className="font-bold text-[#2D332F] text-sm">₹{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Item Form */}
              <div className="p-4 bg-[#F5F2ED] rounded-2xl border border-[#E5E0D8] space-y-3">
                <h4 className="text-xs font-bold text-[#2D332F] flex items-center gap-1">
                  <Plus className="w-4 h-4 text-[#7E9983]" /> Add Custom Product
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Product name (e.g. Fortune Oil)"
                    value={customItem.name}
                    onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E5E0D8] text-xs col-span-2 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. 1L)"
                    value={customItem.unit}
                    onChange={(e) => setCustomItem({ ...customItem, unit: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E5E0D8] text-xs bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={customItem.price}
                    onChange={(e) => setCustomItem({ ...customItem, price: Number(e.target.value) })}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E5E0D8] text-xs bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (customItem.name) {
                      addInventoryItem({
                        name: customItem.name,
                        unit: customItem.unit,
                        price: customItem.price,
                        stock: customItem.stock,
                        category: customItem.category,
                        lowStockThreshold: 5,
                        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60',
                      });
                      setCustomItem({ name: '', unit: '1kg', price: 50, stock: 20, category: 'grocery' });
                    }
                  }}
                  className="px-3.5 py-1.5 bg-[#7E9983] text-white text-xs font-bold rounded-lg hover:bg-[#6b8570]"
                >
                  Add to Catalog
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E0D8] text-sm font-semibold hover:bg-[#F5F2ED]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleFinishOnboarding}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#7E9983] text-white font-extrabold text-base hover:bg-[#6b8570] transition-all shadow-md"
                >
                  <Store className="w-5 h-5" />
                  <span>Launch My WhatsApp Dukaan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
