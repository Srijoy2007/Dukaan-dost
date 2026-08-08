import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, QrCode, Smartphone, CheckCircle2, ShieldCheck, Save, Copy, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { merchantProfile, updateMerchantProfile, setIsWhatsappDrawerOpen } = useStore();
  const [profile, setProfile] = useState(merchantProfile);
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMerchantProfile(profile);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const whatsappLink = `https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}?text=Namaste%20bhaiya%2C%20mujhe%20grocery%20bhej%20do`;

  const copyLink = () => {
    navigator.clipboard.writeText(whatsappLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-[#becabd] shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30]">Settings & WhatsApp AI Agent</h1>
          <p className="text-xs text-[#3e4a40] mt-1">
            Configure your shop profile, WhatsApp Business agent, and store QR code poster.
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            profile.isAgentActive ? 'bg-[#108548]/10 text-[#108548]' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {profile.isAgentActive ? '● WhatsApp Agent Active' : '○ Paused'}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* WhatsApp Business QR & Poster Link */}
        <div className="bg-white p-6 rounded-2xl border border-[#becabd] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <QrCode className="w-5 h-5 text-[#006a37]" />
            <h3 className="font-bold text-[#0b1c30] text-base">Store Counter WhatsApp QR Code</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 bg-[#eff4ff] border-2 border-[#006a37] rounded-2xl flex flex-col items-center justify-center shrink-0">
              {/* Simulated QR Code */}
              <div className="w-32 h-32 bg-white rounded-xl p-2 border border-gray-300 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(whatsappLink)}`}
                  alt="WhatsApp Order QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] text-[#006a37] font-bold mt-2 text-center">
                Scan to Order on WhatsApp
              </span>
            </div>

            <div className="space-y-3 flex-1 text-xs">
              <h4 className="font-bold text-[#0b1c30] text-sm">Print this QR for your Kirana Counter</h4>
              <p className="text-[#3e4a40]">
                Customers scan this QR code with any phone camera or WhatsApp to open direct AI chat ordering with your shop.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={whatsappLink}
                  className="flex-1 px-3 py-2 bg-gray-50 border rounded-xl text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="px-3 py-2 bg-[#006a37] text-white font-bold rounded-xl flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsWhatsappDrawerOpen(true)}
                className="px-4 py-2 bg-[#25D366] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test WhatsApp Chatbot Simulator Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Shop Settings */}
        <div className="bg-white p-6 rounded-2xl border border-[#becabd] shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-[#0b1c30] text-base border-b border-gray-100 pb-2">Shop Profile</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#3e4a40] mb-1">Shop Name</label>
              <input
                type="text"
                value={profile.shopName}
                onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006a37]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3e4a40] mb-1">Owner Name</label>
              <input
                type="text"
                value={profile.ownerName}
                onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006a37]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3e4a40] mb-1">WhatsApp Business Phone</label>
              <input
                type="text"
                value={profile.whatsappNumber}
                onChange={(e) => setProfile({ ...profile, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006a37]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#3e4a40] mb-1">Verified Aadhar ID</label>
              <input
                type="text"
                readOnly
                value={profile.aadhar}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 font-mono text-gray-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block font-bold text-[#3e4a40] mb-1">Store Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006a37]"
            />
          </div>

          {/* AI Toggle */}
          <div className="p-4 bg-[#eff4ff] rounded-xl border border-[#becabd] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#0b1c30]">Enable WhatsApp AI Auto-Parser</p>
              <p className="text-[11px] text-[#3e4a40]">
                AI will automatically read customer text and handwritten photos to price items from your stock.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.isAgentActive}
                onChange={(e) => setProfile({ ...profile, isAgentActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#108548]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4">
            {savedNotice ? (
              <span className="text-[#108548] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings updated successfully
              </span>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#108548] text-white font-bold hover:bg-[#005229] transition-all shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
