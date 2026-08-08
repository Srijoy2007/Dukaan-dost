import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  BadgeIndianRupee,
  Footprints,
  PackageSearch,
  Store,
  Bell,
  Play,
  X,
  Smartphone,
  CheckCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setViewMode, setIsWhatsappDrawerOpen } = useStore();
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D332F] flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-4 md:px-8 bg-gradient-to-b from-white to-[#F5F2ED] overflow-hidden border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex flex-col gap-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#7E9983] text-xs font-semibold w-fit border border-[#E5E0D8] shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#7E9983]" />
              <span>Trusted by 10,000+ local Kirana & neighborhood shops</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2D332F] tracking-tight leading-tight">
              Empower Your <span className="text-[#7E9983]">Local Shop.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#7A756E] leading-relaxed">
              Take orders directly on WhatsApp, manage inventory effortlessly, and pay <strong className="text-[#2D332F] font-bold">zero platform fees</strong>. Fight back against quick-commerce giants with modern tools built for your neighborhood Dukaan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => setViewMode('onboarding')}
                className="flex items-center justify-center h-12 px-8 rounded-full bg-[#7E9983] text-white font-bold text-base hover:bg-[#6b8570] transition-all shadow-md hover:-translate-y-0.5"
              >
                <span>Register Your Shop Now</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center justify-center h-12 px-8 rounded-full border border-[#E5E0D8] bg-white text-[#2D332F] font-semibold text-base hover:bg-[#F5F2ED] transition-colors shadow-xs"
              >
                <Play className="w-4 h-4 mr-2 text-[#D97757]" />
                <span>Watch Interactive Demo</span>
              </button>
            </div>

            {/* Micro value props */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5E0D8] text-xs text-[#7A756E] font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7E9983]" />
                <span>₹0 Platform Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7E9983]" />
                <span>No Min. Order Value</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7E9983]" />
                <span>Instant Stock Sync</span>
              </div>
            </div>
          </div>

          {/* Hero Image & Floating Element */}
          <div className="relative h-[440px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-lg border border-[#E5E0D8] bg-white">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7TMM_Kne6jqRzUfWkUrNll8YfQvxsh6S1kBAButwby04h3WO0y9Wk1vcibP8cyZKNqDoEJpTZga7UbOOkyaNvmrEz0j3cD4-VC66zX9GrufhbovGZ3m1AmwCmvWJEhlFkmoBSRAI_JYGy9w1AVc3x8oOHenPb7X0GsQVZfsrcSR5H7gr_kPNgaa3YQphQ8tpiW5Av9_LGFvVDKXAbe9Hbu1q3zZOgvdUjhDTsaeW6GGgRebFEjgjY"
              alt="Indian Kirana Store Owner"
              className="w-full h-full object-cover"
            />
            
            {/* Floating Order Notification Card */}
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#E5E0D8] flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="w-12 h-12 rounded-xl bg-[#D97757] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#7A756E] font-medium">New Order Received!</p>
                <p className="text-base font-bold text-[#2D332F]">₹450 via WhatsApp</p>
                <span className="text-[10px] text-[#7E9983] font-bold uppercase tracking-wider">Accepted • Auto Stock Updated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid Section */}
      <section className="py-20 px-4 md:px-8 bg-[#FDFBF7]" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D332F] mb-4">
              Everything you need to compete and win
            </h2>
            <p className="text-base md:text-lg text-[#7A756E] max-w-2xl mx-auto">
              Simple, powerful tools designed specifically for high-volume, neighborhood Indian stores & vendors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {/* Feature 1: WhatsApp AI Agent */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#E5E0D8] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 rounded-xl bg-[#7E9983] text-white flex items-center justify-center mb-4 shadow-xs">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#2D332F] mb-2">WhatsApp AI Agent</h3>
                <p className="text-sm md:text-base text-[#7A756E]">
                  Automated ordering for your customers. They send text messages or snap photos of handwritten lists; our AI reads the list, calculates prices from your stock, and populates your order hub instantly.
                </p>
                <button
                  onClick={() => setIsWhatsappDrawerOpen(true)}
                  className="mt-4 inline-flex items-center text-xs font-bold text-[#7E9983] hover:underline"
                >
                  <Smartphone className="w-4 h-4 mr-1 text-[#7E9983]" />
                  <span>Try Customer Bot Simulator</span>
                </button>
              </div>

              <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-30 group-hover:opacity-50 transition-opacity hidden sm:block">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIRN6V9Ua2F-oPCUTyeMZrpgVD97pjvK-ttuodSCerPSJZKVronq0zBLsXj6wW0gDPTwV5xzzic2b_bBQu2sCKbtRqoa8axrXrjVT19OxDSAoJ3x3ROprxzD5wOvHbn3AEDI5Mf0WNHfsUtXyQgwEupXqBUGOzdgIgYcDsCPDwnVZB5Br7ZV_Qg_38kEno9996stl6KGasfmnglNiOgNqoYaUFxqGzvPZ2-fWzWaGWy2QTCibv8maj"
                  alt="WhatsApp AI"
                  className="w-full h-full object-cover object-left-bottom"
                />
              </div>
            </div>

            {/* Feature 2: Zero Fees */}
            <div className="bg-[#FFF9F5] rounded-3xl p-6 border border-[#FFE7D6] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#D97757] text-white flex items-center justify-center mb-4 shadow-xs">
                  <span className="text-2xl font-black">₹0</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2D332F] mb-2">Zero Platform Fees</h3>
                <p className="text-sm text-[#7A756E]">
                  Keep 100% of your earnings. No search fees, no delivery cuts, and no hidden charges on small orders under ₹200.
                </p>
              </div>
            </div>

            {/* Feature 3: Hyper-local Delivery */}
            <div className="bg-[#F5F2ED] rounded-3xl p-6 border border-[#E5E0D8] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#7E9983] text-white flex items-center justify-center mb-4 shadow-xs">
                  <Footprints className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2D332F] mb-2">Hyper-local Coverage</h3>
                <p className="text-sm text-[#7A756E]">
                  Serve your immediate colony, apartment, or street within walking distance. Fast 10-15 min delivery with zero overhead.
                </p>
              </div>
            </div>

            {/* Feature 4: AI Stock Alerts & Wholesaler Sync */}
            <div className="md:col-span-2 bg-[#2D332F] text-white rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-[#7E9983] text-white flex items-center justify-center mb-4 shadow-xs">
                  <PackageSearch className="w-6 h-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-2">AI Stock Alerts & Wholesaler Sync</h3>
                <p className="text-sm opacity-80">
                  Never run out of bestsellers. When inventory drops low, the AI agent prompts you to place a 1-click order directly to your wholesaler.
                </p>
              </div>
              <div className="w-full md:w-1/3 h-full min-h-[140px] rounded-2xl overflow-hidden border border-white/20 opacity-90">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUtgyMW8Twd2z6Nc5tyqOUkjQRJuRp6IOkcQ1qEHZIyQssiTflQOhvpBmlC6F1w6esdvfogn_Rpxx-cG7XnsEn4HYOnhff86XaCy7IRiHX3-giH4yWDtpr420rBYWSx-tXQ4rMCPF8dVvERa8c6Dy2J5RHIen7SBV2wCgYgBCZkmvZMYSuKGAADNFjXzA3cB5rxG1qKmW_QrBspY2uOiwr_Ny09oFWN-pic9G07NWSFVq5xltBpWNP"
                  alt="AI Stock Analytics Chart"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 md:px-8 bg-[#F5F2ED] border-y border-[#E5E0D8]" id="how-it-works">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* WhatsApp Frame Mockup */}
          <div className="flex justify-center relative">
            <div className="w-[320px] h-[620px] bg-[#2D332F] rounded-[40px] p-3 shadow-2xl border-4 border-[#E5E0D8] relative z-10">
              <div className="w-full h-full bg-white rounded-[28px] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-[#7E9983] text-white p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white text-[#7E9983] font-serif font-bold flex items-center justify-center shadow-xs">
                    SK
                  </div>
                  <div>
                    <div className="font-bold text-sm">Sharma Kirana Store</div>
                    <div className="text-[11px] opacity-90 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                      <span>Dukaan Dost WhatsApp Agent</span>
                    </div>
                  </div>
                </div>

                {/* Chat Stream */}
                <div className="flex-1 bg-[#FDFBF7] p-3 flex flex-col gap-3 overflow-y-auto text-xs">
                  <div className="bg-[#F5F2ED] rounded-xl rounded-tl-none p-3 max-w-[85%] shadow-xs self-start text-[#2D332F]">
                    Bhaiya, 2kg Aashirvaad Atta, 1L Amul Milk, aur 500g Toor Dal bhej do.
                    <div className="text-[9px] text-[#7A756E] text-right mt-1">10:30 AM</div>
                  </div>

                  <div className="bg-[#7E9983] text-white rounded-xl rounded-tr-none p-3 max-w-[85%] shadow-xs self-end">
                    Namaste! Aapka order mil gaya hai:
                    <br />
                    1. Aashirvaad Atta (2kg) - ₹110
                    <br />
                    2. Amul Milk (1L) - ₹66
                    <br />
                    3. Toor Dal (500g) - ₹85
                    <br />
                    <br />
                    <strong>Total: ₹261.</strong> Delivery 15 min mein.
                    <div className="text-[9px] opacity-80 text-right mt-1 flex items-center justify-end gap-1">
                      <span>10:31 AM</span>
                      <CheckCheck className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <div className="bg-[#F5F2ED] rounded-xl rounded-tl-none p-3 max-w-[85%] shadow-xs self-start text-[#2D332F]">
                    Theek hai, cash on delivery.
                    <div className="text-[9px] text-[#7A756E] text-right mt-1">10:32 AM</div>
                  </div>

                  <div className="bg-[#7E9983] text-white rounded-xl rounded-tr-none p-3 max-w-[85%] shadow-xs self-end">
                    Order confirmed! 🙏 Sharma Kirana Store ki taraf se dhanyawad.
                    <div className="text-[9px] opacity-80 text-right mt-1 flex items-center justify-end gap-1">
                      <span>10:32 AM</span>
                      <CheckCheck className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="bg-white p-2 flex items-center gap-2 border-t border-[#E5E0D8]">
                  <div className="flex-1 bg-[#F5F2ED] rounded-full px-3 py-1.5 text-xs text-[#7A756E] border border-[#E5E0D8]">
                    Type order or attach list photo...
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#7E9983] text-white flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Steps description */}
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D332F]">
              As easy as sending a message.
            </h2>
            <p className="text-base md:text-lg text-[#7A756E]">
              Your customers don't need to download another bulky app. They order through your verified WhatsApp Business number—just like they always have. Our AI instantly translates messages into organized orders for your shop.
            </p>

            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-[#E5E0D8]">
                <div className="w-8 h-8 rounded-full bg-[#7E9983] text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-serif font-bold text-[#2D332F]">Customer sends a text or photo</h4>
                  <p className="text-sm text-[#7A756E]">In English, Hindi, or Hinglish, or even a picture of a paper list.</p>
                </div>
              </li>

              <li className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-[#E5E0D8]">
                <div className="w-8 h-8 rounded-full bg-[#7E9983] text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-serif font-bold text-[#2D332F]">AI reads catalog & calculates price</h4>
                  <p className="text-sm text-[#7A756E]">Automatically matches requested items to your live shop stock.</p>
                </div>
              </li>

              <li className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-[#E5E0D8]">
                <div className="w-8 h-8 rounded-full bg-[#7E9983] text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-serif font-bold text-[#2D332F]">You pack & deliver hyper-locally</h4>
                  <p className="text-sm text-[#7A756E]">Accept with one click on your Dukaan Dost hub and dispatch to your neighbor.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Trust Badges (Below Hero) - Section 6.3 */}
      <section className="py-12 px-4 md:px-8 bg-white border-y border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#FDFBF7] border border-[#E5E0D8] space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#7E9983]/10 text-[#7E9983] flex items-center justify-center font-bold text-lg">
              📱
            </div>
            <h3 className="font-serif font-bold text-[#2D332F] text-lg">No App Install Needed</h3>
            <p className="text-xs text-[#7A756E] leading-relaxed">
              "Works entirely on WhatsApp. Your customers don't need to download anything new or register on complex web apps."
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FDFBF7] border border-[#E5E0D8] space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#7E9983]/10 text-[#7E9983] flex items-center justify-center font-bold text-lg">
              🇮🇳
            </div>
            <h3 className="font-serif font-bold text-[#2D332F] text-lg">Hindi, Hinglish & English</h3>
            <p className="text-xs text-[#7A756E] leading-relaxed">
              "Talk to the AI bot in your natural language—Hinglish, Hindi, or English. It understands voice notes and paper lists too!"
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FDFBF7] border border-[#E5E0D8] space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#D97757]/10 text-[#D97757] flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <h3 className="font-serif font-bold text-[#2D332F] text-lg">Free to Start (₹0)</h3>
            <p className="text-xs text-[#7A756E] leading-relaxed">
              "No upfront cost. No credit card required. Start selling and taking WhatsApp orders in less than 2 minutes."
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table Section - Section 6.4 */}
      <section className="py-20 px-4 md:px-8 bg-[#FDFBF7]" id="pricing">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D332F]">
              Transparent, Merchant-Friendly Pricing
            </h2>
            <p className="text-base text-[#7A756E] max-w-xl mx-auto">
              Start completely free. Upgrade to Pro only when your order volume grows beyond 100 orders/month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-8 border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7E9983] bg-[#7E9983]/10 px-3 py-1 rounded-full border border-[#7E9983]/20">
                  Starter Plan
                </span>
                <h3 className="text-3xl font-serif font-bold text-[#2D332F] mt-4">Free Forever</h3>
                <p className="text-xs text-[#7A756E] mt-1">Perfect for new neighborhood dukaans & local sellers</p>

                <ul className="mt-6 space-y-3 text-xs text-[#2D332F] font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> Up to 100 orders / month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> WhatsApp AI Order Capture
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> Auto Digital UPI Invoice + QR
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> Paper List Photo OCR Scanner
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> Basic Inventory Tracker
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setViewMode('onboarding')}
                className="w-full py-3.5 rounded-full border-2 border-[#7E9983] text-[#7E9983] font-bold text-xs hover:bg-[#7E9983] hover:text-white transition-all text-center"
              >
                Start Free Now
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-[#2D332F] text-white rounded-3xl p-8 shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-white bg-[#D97757] px-3 py-1 rounded-full shadow-xs">
                  Most Popular for Kiranas
                </span>
                <div className="flex items-baseline gap-2 mt-4">
                  <h3 className="text-4xl font-serif font-bold text-white">₹299</h3>
                  <span className="text-xs text-gray-300">/ month</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">Unlimited scale for busy neighborhood merchants</p>

                <ul className="mt-6 space-y-3 text-xs text-gray-200 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> <strong>Unlimited</strong> orders / month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> Broadcast Offers & Festival Campaigns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> Customer CRM & Udhaar Ledger Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> Automated Wholesaler Stock Alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9983]" /> Priority 24/7 Merchant Support
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setViewMode('onboarding')}
                className="w-full py-3.5 rounded-full bg-[#7E9983] text-white font-bold text-xs hover:bg-[#6b8570] transition-all shadow-md relative z-10"
              >
                Upgrade to Pro Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 md:px-8 bg-white border-t border-[#E5E0D8]" id="faq">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold text-[#2D332F]">Frequently Asked Questions</h2>
            <p className="text-xs text-[#7A756E]">Got questions? We've got answers for Indian store owners.</p>
          </div>

          <div className="space-y-4 text-xs text-[#2D332F]">
            <details className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E5E0D8] group">
              <summary className="font-bold cursor-pointer text-sm text-[#2D332F] list-none flex justify-between items-center">
                <span>Do my customers need to download any app?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-[#7A756E] leading-relaxed">
                No! Your customers send WhatsApp messages or list photos directly to your store's WhatsApp Business number. No app download required for them.
              </p>
            </details>

            <details className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E5E0D8] group">
              <summary className="font-bold cursor-pointer text-sm text-[#2D332F] list-none flex justify-between items-center">
                <span>How do payments work? Do you take commission?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-[#7A756E] leading-relaxed">
                Dukaan Dost takes 0% commission. Customers pay you directly via Cash on Delivery or UPI QR code. The money lands directly in your bank account.
              </p>
            </details>

            <details className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E5E0D8] group">
              <summary className="font-bold cursor-pointer text-sm text-[#2D332F] list-none flex justify-between items-center">
                <span>Can the AI understand handwritten paper lists in Hindi or English?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-[#7A756E] leading-relaxed">
                Yes! Our AI OCR reads photos of handwritten lists or audio voice notes in Hinglish, Hindi, or regional scripts and matches items to your store stock.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-[#FDFBF7] relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10 bg-white p-10 md:p-14 rounded-3xl border border-[#E5E0D8] shadow-md">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D332F] mb-4">
            Ready to modernize your Dukaan?
          </h2>
          <p className="text-base md:text-lg text-[#7A756E] mb-8">
            Join thousands of smart shopkeepers who are taking back control of their neighborhood business with WhatsApp AI.
          </p>
          <button
            onClick={() => setViewMode('onboarding')}
            className="inline-flex items-center justify-center h-12 px-10 rounded-full bg-[#7E9983] text-white font-bold text-base hover:bg-[#6b8570] transition-all transform hover:scale-105 shadow-md"
          >
            <span>Register Your Shop Now</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          <p className="mt-4 text-xs text-[#7A756E]">Takes less than 2 minutes. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E0D8] py-8 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto text-xs text-[#7A756E]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#7E9983] text-white font-serif font-bold text-xs flex items-center justify-center">DD</div>
          <span className="font-bold text-[#2D332F]">© 2026 Dukaan Dost. Empowering Local Commerce.</span>
        </div>
        <div className="flex flex-wrap gap-6 justify-center font-medium">
          <a href="#privacy" className="hover:text-[#7E9983] hover:underline">Privacy Policy</a>
          <a href="#terms" className="hover:text-[#7E9983] hover:underline">Terms of Service</a>
          <a href="#support" className="hover:text-[#7E9983] hover:underline">Merchant Support</a>
          <button onClick={() => setIsWhatsappDrawerOpen(true)} className="text-[#7E9983] font-bold hover:underline">
            Test WhatsApp Bot Simulator
          </button>
        </div>
      </footer>

      {/* Watch Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-[#E5E0D8]">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F5F2ED] text-[#7A756E]"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-serif font-bold text-[#2D332F] mb-2">Dukaan Dost - Platform Overview</h3>
            <p className="text-sm text-[#7A756E] mb-4">
              Watch how local shopkeepers receive orders on WhatsApp Business and sync stock automatically.
            </p>
            <div className="aspect-video bg-[#2D332F] rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7TMM_Kne6jqRzUfWkUrNll8YfQvxsh6S1kBAButwby04h3WO0y9Wk1vcibP8cyZKNqDoEJpTZga7UbOOkyaNvmrEz0j3cD4-VC66zX9GrufhbovGZ3m1AmwCmvWJEhlFkmoBSRAI_JYGy9w1AVc3x8oOHenPb7X0GsQVZfsrcSR5H7gr_kPNgaa3YQphQ8tpiW5Av9_LGFvVDKXAbe9Hbu1q3zZOgvdUjhDTsaeW6GGgRebFEjgjY"
                alt="Demo Thumbnail"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/40">
                <button
                  onClick={() => {
                    setShowDemoModal(false);
                    setIsWhatsappDrawerOpen(true);
                  }}
                  className="w-16 h-16 rounded-full bg-[#7E9983] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform mb-3"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
                <p className="font-serif font-bold text-lg">Launch Live Customer WhatsApp Simulator</p>
                <p className="text-xs text-gray-200 mt-1">Test real-time ordering, photo list reading, and automated receipts!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
