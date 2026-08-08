import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChatMessage, OrderItem, Order } from '../types';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  CheckCheck,
  X,
  Store,
  QrCode,
  CreditCard,
  CheckCircle2,
  Receipt as ReceiptIcon,
  Truck,
  Sparkles,
  Phone,
  Camera,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

export const WhatsappSimulator: React.FC = () => {
  const {
    merchantProfile,
    inventory,
    placeWhatsappOrder,
    isWhatsappDrawerOpen,
    setIsWhatsappDrawerOpen,
    orders,
  } = useStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Active chat history
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai_bot',
      text: `Namaste! 🙏 Welcome to ${merchantProfile.shopName} official WhatsApp Ordering. You can type items in Hindi, English or Hinglish, OR upload a photo of your handwritten paper list. Zero platform fees, delivery in 15 mins!`,
      timestamp: '10:30 AM',
    },
  ]);

  // Temporary pending order being confirmed
  const [pendingParsedItems, setPendingParsedItems] = useState<OrderItem[]>([]);
  const [pendingTotal, setPendingTotal] = useState<number>(0);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Modal controls
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  if (!isWhatsappDrawerOpen) return null;

  // Function to call Gemini server API to parse list
  const processUserOrderTextOrImage = async (userText: string, imageBase64?: string) => {
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/gemini/parse-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          imageBase64: imageBase64 || null,
          availableItems: inventory,
        }),
      });

      const data = await response.json();

      let extractedItems: OrderItem[] = [];

      if (data.success && data.parsed && data.parsed.parsedItems?.length > 0) {
        extractedItems = data.parsed.parsedItems.map((pi: any) => {
          const invMatch = inventory.find(
            (i) => i.name.toLowerCase() === pi.matchedCatalogName?.toLowerCase()
          ) || inventory.find((i) => i.name.toLowerCase().includes(pi.requestedName?.toLowerCase()));

          return {
            itemId: invMatch?.id || `custom-${Date.now()}`,
            name: invMatch?.name || pi.requestedName || 'Grocery Item',
            qty: pi.quantity || 1,
            price: invMatch?.price || pi.estimatedPrice || 50,
            unit: invMatch?.unit || pi.unit || '1 unit',
          };
        });
      } else {
        // Fallback matching against local inventory
        const lower = userText.toLowerCase();
        inventory.forEach((item) => {
          const parts = item.name.toLowerCase().split(' ');
          if (lower.includes(parts[0])) {
            extractedItems.push({
              itemId: item.id,
              name: item.name,
              qty: 1,
              price: item.price,
              unit: item.unit,
            });
          }
        });

        if (extractedItems.length === 0) {
          // Add default popular items as a friendly suggestion
          extractedItems = [
            { itemId: inventory[0].id, name: inventory[0].name, qty: 1, price: inventory[0].price, unit: inventory[0].unit },
            { itemId: inventory[1].id, name: inventory[1].name, qty: 1, price: inventory[1].price, unit: inventory[1].unit },
          ];
        }
      }

      const total = extractedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      setPendingParsedItems(extractedItems);
      setPendingTotal(total);

      // AI Response message
      const itemsFormattedText = extractedItems
        .map((i, idx) => `${idx + 1}. ${i.name} (${i.unit}) × ${i.qty} = ₹${i.price * i.qty}`)
        .join('\n');

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'ai_bot',
        text: `Namaste! I parsed your grocery list:\n\n${itemsFormattedText}\n\nTotal Amount: ₹${total}\n\nPlease confirm: Click "YES - Confirm Order" below to dispatch!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        orderSummary: {
          orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          items: extractedItems,
          total,
          status: 'pending',
        },
      };

      setChatMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Parsing error', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'customer',
      text: inputMessage,
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const currentText = inputMessage;
    const currentImg = selectedImage;
    setInputMessage('');
    setSelectedImage(null);

    processUserOrderTextOrImage(currentText, currentImg || undefined);
  };

  const handleConfirmOrderPlacement = (paymentMethod: 'cod' | 'upi' = 'cod') => {
    if (pendingParsedItems.length === 0) return;

    const newOrder = placeWhatsappOrder({
      customerName: 'Aarav Gupta',
      customerPhone: '+91 98912 34567',
      address: 'Flat 402, Royal Palms, Block B',
      items: pendingParsedItems,
      totalAmount: pendingTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'upi' ? 'paid' : 'unpaid',
      whatsappMessage: chatMessages[chatMessages.length - 2]?.text || 'Order placed via WhatsApp AI',
    });

    setLastPlacedOrder(newOrder);

    const botConfirmMessage: ChatMessage = {
      id: `bot-confirm-${Date.now()}`,
      sender: 'ai_bot',
      text: `Order Confirmed! 🎉\nOrder ID: ${newOrder.id}\nPayment: ${paymentMethod.toUpperCase()}\nEstimated Delivery: 12 minutes.\n\n${merchantProfile.ownerName} from ${merchantProfile.shopName} has received your order on their Dukaan Dost Hub!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      receipt: {
        receiptNo: newOrder.receiptId || 'REC-9921',
        shopName: merchantProfile.shopName,
        date: new Date().toLocaleDateString(),
        items: pendingParsedItems,
        total: pendingTotal,
        paymentMethod: paymentMethod.toUpperCase(),
      },
    };

    setChatMessages((prev) => [...prev, botConfirmMessage]);
    setPendingParsedItems([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample handwritten paper list preset
  const loadHandwrittenSample = () => {
    const sampleImg = 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop&q=60';
    setSelectedImage(sampleImg);
    setInputMessage('Photo of handwritten paper grocery list');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      {/* WhatsApp Frame Wrapper */}
      <div className="bg-[#0b1c30] rounded-[32px] p-2.5 sm:p-3 w-full max-w-md h-[92vh] max-h-[720px] shadow-2xl border-4 border-[#becabd] flex flex-col relative overflow-hidden">
        
        {/* WhatsApp Top Header */}
        <div className="bg-[#075E54] text-white p-3 rounded-t-[22px] flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#075E54] font-bold flex items-center justify-center shrink-0 shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">{merchantProfile.shopName}</h3>
              <div className="text-[11px] text-green-200 flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>Verified Dukaan Dost AI Agent</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWhatsappDrawerOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 bg-[#ECE5DD] p-3 overflow-y-auto space-y-3 font-sans text-xs">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'customer';

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div
                  className={`p-3 rounded-xl shadow-sm space-y-2 relative ${
                    isUser
                      ? 'bg-[#DCF8C6] text-gray-900 rounded-tr-none'
                      : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
                  }`}
                >
                  {msg.image && (
                    <div className="rounded-lg overflow-hidden max-h-40 mb-1 border border-gray-300">
                      <img src={msg.image} alt="Handwritten list photo" className="w-full h-full object-cover" />
                      <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 block text-center font-bold">
                        📷 Scanned List Photo
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* If this message contains order confirmation summary */}
                  {msg.orderSummary && pendingParsedItems.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/80 space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmOrderPlacement('cod')}
                          className="flex-1 py-2 bg-[#108548] text-white rounded-lg font-bold text-xs hover:bg-[#005229] shadow-sm flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" /> YES - COD (₹{pendingTotal})
                        </button>

                        <button
                          onClick={() => {
                            setShowPaymentModal(true);
                          }}
                          className="flex-1 py-2 bg-[#25D366] text-white rounded-lg font-bold text-xs hover:bg-[#1ebd59] shadow-sm flex items-center justify-center gap-1"
                        >
                          <QrCode className="w-4 h-4" /> Pay via UPI
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Receipt Trigger */}
                  {msg.receipt && (
                    <div className="pt-2 border-t border-gray-200">
                      <button
                        onClick={() => setShowReceiptModal(true)}
                        className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-[#075E54] font-bold rounded-lg text-[11px] flex items-center justify-center gap-1"
                      >
                        <ReceiptIcon className="w-4 h-4" /> View Official Digital Receipt
                      </button>
                    </div>
                  )}

                  <div className="text-[9px] text-gray-400 text-right flex items-center justify-end gap-1 mt-1">
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Thinking Animation */}
          {isAiThinking && (
            <div className="mr-auto max-w-[70%] bg-white p-3 rounded-xl rounded-tl-none shadow-sm flex items-center gap-2 text-xs text-gray-500">
              <Sparkles className="w-4 h-4 text-[#075E54] animate-spin" />
              <span>Dukaan Dost AI is reading your list catalog...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Action Presets */}
        <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 overflow-x-auto text-[11px] border-t border-gray-300 shrink-0">
          <button
            onClick={() => {
              const voiceMsg = "🎙️ [Voice Note 0:12s] 'Bhaiya, 2kg Aashirvaad Atta, 1L Fortune Oil, aur 500g Toor Dal bhej do'";
              const userMsg: ChatMessage = {
                id: `user-${Date.now()}`,
                sender: 'customer',
                text: voiceMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
              setChatMessages((prev) => [...prev, userMsg]);
              processUserOrderTextOrImage("2kg Aashirvaad Atta, 1L Fortune Oil, 500g Toor Dal");
            }}
            className="px-2.5 py-1 bg-[#075E54] text-white hover:bg-[#064e46] rounded-full font-bold shrink-0 flex items-center gap-1 shadow-xs"
          >
            <span>🎙️ Speak Voice Note</span>
          </button>
          <button
            onClick={() => {
              setInputMessage('Same as last time');
            }}
            className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-full font-semibold text-gray-700 shrink-0"
          >
            🔄 "Same as last time"
          </button>
          <button
            onClick={loadHandwrittenSample}
            className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-full font-semibold text-[#075E54] shrink-0 flex items-center gap-1"
          >
            <Camera className="w-3 h-3 text-[#25D366]" /> Attach Paper List
          </button>
        </div>

        {/* Selected Image Thumbnail Preview */}
        {selectedImage && (
          <div className="bg-gray-100 px-3 py-1.5 flex items-center justify-between border-t border-gray-200 text-xs shrink-0">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <ImageIcon className="w-4 h-4 text-[#075E54]" /> Photo attached ready to scan
            </span>
            <button onClick={() => setSelectedImage(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Input Controls */}
        <form onSubmit={handleSendMessage} className="bg-[#f0f2f5] p-2 flex items-center gap-2 rounded-b-[22px] shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:text-[#075E54] hover:bg-gray-200 rounded-full"
            title="Upload handwritten list photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type items or order..."
            className="flex-1 px-3 py-2 bg-white rounded-full text-xs text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#075E54]"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() && !selectedImage}
            className="w-9 h-9 rounded-full bg-[#075E54] text-white flex items-center justify-center hover:bg-[#128C7E] disabled:opacity-40 transition-colors shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Payment Gateway Simulation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#25D366]/20 text-[#25D366] mx-auto flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#0b1c30]">Zero-Fee Instant UPI Payment</h3>
            <p className="text-xs text-gray-500">Scan QR or select your preferred UPI app</p>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=sharma.kirana@upi&pn=${encodeURIComponent(merchantProfile.shopName)}&am=${pendingTotal}&cu=INR`}
                alt="UPI QR Code"
                className="w-36 h-36 object-contain border rounded-lg bg-white p-1"
              />
              <p className="text-xs font-bold text-[#006a37] mt-2">Payable Amount: ₹{pendingTotal}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-bold text-gray-700">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  handleConfirmOrderPlacement('upi');
                }}
                className="p-2 border rounded-xl hover:bg-gray-100 flex flex-col items-center gap-1"
              >
                <span className="text-blue-600 font-extrabold text-sm">GPay</span>
                <span className="text-[9px]">Google Pay</span>
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  handleConfirmOrderPlacement('upi');
                }}
                className="p-2 border rounded-xl hover:bg-gray-100 flex flex-col items-center gap-1"
              >
                <span className="text-purple-600 font-extrabold text-sm">PhonePe</span>
                <span className="text-[9px]">UPI Instant</span>
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  handleConfirmOrderPlacement('upi');
                }}
                className="p-2 border rounded-xl hover:bg-gray-100 flex flex-col items-center gap-1"
              >
                <span className="text-[#25D366] font-extrabold text-sm">Paytm</span>
                <span className="text-[9px]">Direct QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 border border-[#becabd]">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-gray-200 pb-4">
              <h3 className="text-lg font-black text-[#006a37]">{merchantProfile.shopName}</h3>
              <p className="text-xs text-gray-500">{merchantProfile.address}</p>
              <p className="text-[10px] text-gray-400 font-mono mt-1">
                Receipt ID: {lastPlacedOrder?.receiptId || 'REC-99410'} • {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold border-b pb-1 text-gray-700">
                <span>Item</span>
                <span>Qty × Price</span>
              </div>
              {lastPlacedOrder?.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-dashed border-gray-200">
                  <span>{item.name} ({item.unit})</span>
                  <span className="font-mono">
                    {item.qty} × ₹{item.price} = ₹{item.qty * item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-300 flex justify-between items-center text-sm font-black">
              <span>Total Paid ({lastPlacedOrder?.paymentMethod.toUpperCase()})</span>
              <span className="text-[#006a37] text-lg">₹{lastPlacedOrder?.totalAmount || pendingTotal}</span>
            </div>

            <div className="bg-[#eff4ff] p-3 rounded-xl text-[10px] text-center text-[#3e4a40] space-y-1">
              <p className="font-bold text-[#006a37]">Zero Platform Fees Charged</p>
              <p>Thank you for shopping at your local neighborhood Kirana store! 🙏</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
