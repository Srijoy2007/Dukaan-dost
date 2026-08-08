import React, { createContext, useContext, useState, useEffect } from 'react';
import { InventoryItem, Order, MerchantProfile, WholesalerAlert, ViewMode, OrderStatus, Customer, BroadcastMessage, CustomerTag } from '../types';
import { initialInventory, initialOrders, initialMerchantProfile, initialWholesalerAlerts, initialCustomers, initialBroadcasts } from '../data/mockData';

interface StoreContextType {
  viewMode: ViewMode;
  setViewMode: (view: ViewMode) => void;
  merchantProfile: MerchantProfile;
  updateMerchantProfile: (updates: Partial<MerchantProfile>) => void;
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  syncOfflineSale: (itemId: string, qty: number) => { success: boolean; message: string };
  orders: Order[];
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  placeWhatsappOrder: (orderData: Partial<Order>) => Order;
  wholesalerAlerts: WholesalerAlert[];
  triggerWholesalerRestock: (alertId: string) => void;
  confirmWholesalerRestock: (alertId: string, addedQty: number) => void;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomerTag: (id: string, tag: CustomerTag) => void;
  broadcasts: BroadcastMessage[];
  sendBroadcast: (broadcast: Omit<BroadcastMessage, 'id' | 'sentAt' | 'recipientCount'>) => void;
  isWhatsappDrawerOpen: boolean;
  setIsWhatsappDrawerOpen: (open: boolean) => void;
  todayStats: {
    revenue: number;
    totalOrders: number;
    topSelling: { name: string; count: number }[];
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile>(() => {
    const saved = localStorage.getItem('dukaan_merchant');
    return saved ? JSON.parse(saved) : initialMerchantProfile;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('dukaan_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dukaan_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [wholesalerAlerts, setWholesalerAlerts] = useState<WholesalerAlert[]>(() => {
    const saved = localStorage.getItem('dukaan_alerts');
    return saved ? JSON.parse(saved) : initialWholesalerAlerts;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('dukaan_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(() => {
    const saved = localStorage.getItem('dukaan_broadcasts');
    return saved ? JSON.parse(saved) : initialBroadcasts;
  });

  const [isWhatsappDrawerOpen, setIsWhatsappDrawerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dukaan_merchant', JSON.stringify(merchantProfile));
  }, [merchantProfile]);

  useEffect(() => {
    localStorage.setItem('dukaan_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('dukaan_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dukaan_alerts', JSON.stringify(wholesalerAlerts));
  }, [wholesalerAlerts]);

  useEffect(() => {
    localStorage.setItem('dukaan_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('dukaan_broadcasts', JSON.stringify(broadcasts));
  }, [broadcasts]);

  // Check low stock triggers automatically
  const checkStockAlerts = (updatedInventory: InventoryItem[]) => {
    updatedInventory.forEach((item) => {
      if (item.stock <= item.lowStockThreshold) {
        setWholesalerAlerts((prev) => {
          const exists = prev.find((a) => a.itemId === item.id && a.status === 'alert');
          if (!exists) {
            return [
              {
                id: `alert-${Date.now()}-${item.id}`,
                itemId: item.id,
                itemName: item.name,
                currentStock: item.stock,
                suggestedRestockQty: 25,
                unit: item.unit,
                wholesalerName: 'Delhi Central FMCG Wholesalers',
                wholesalerPhone: '+91 98100 11223',
                status: 'alert',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
              ...prev,
            ];
          }
          return prev;
        });
      }
    });
  };

  const updateMerchantProfile = (updates: Partial<MerchantProfile>) => {
    setMerchantProfile((prev) => ({ ...prev, ...updates }));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    const updated = [newItem, ...inventory];
    setInventory(updated);
    checkStockAlerts(updated);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    const updated = inventory.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setInventory(updated);
    checkStockAlerts(updated);
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const syncOfflineSale = (itemId: string, qty: number) => {
    const target = inventory.find((i) => i.id === itemId);
    if (!target) return { success: false, message: 'Item not found' };
    if (target.stock < qty) {
      return { success: false, message: `Only ${target.stock} units left in stock` };
    }

    const updated = inventory.map((item) =>
      item.id === itemId ? { ...item, stock: item.stock - qty } : item
    );
    setInventory(updated);
    checkStockAlerts(updated);

    return { success: true, message: `Successfully deducted ${qty} ${target.unit} of ${target.name}` };
  };

  const acceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'accepted' } : o))
    );
  };

  const rejectOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'rejected' } : o))
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const placeWhatsappOrder = (orderData: Partial<Order>): Order => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderData.customerName || 'Local Customer',
      customerPhone: orderData.customerPhone || '+91 98765 12345',
      address: orderData.address || 'Near Store Radius',
      distance: '300m away',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      status: 'pending',
      paymentStatus: orderData.paymentStatus || 'unpaid',
      paymentMethod: orderData.paymentMethod || 'cod',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
      receiptId: `REC-${Date.now().toString().slice(-6)}`,
      whatsappMessage: orderData.whatsappMessage,
      handwrittenListUrl: orderData.handwrittenListUrl,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Deduct stock for placed items automatically
    const updatedInventory = inventory.map((item) => {
      const orderedItem = newOrder.items.find((oi) => oi.itemId === item.id || oi.name === item.name);
      if (orderedItem) {
        return {
          ...item,
          stock: Math.max(0, item.stock - orderedItem.qty),
        };
      }
      return item;
    });

    setInventory(updatedInventory);
    checkStockAlerts(updatedInventory);

    return newOrder;
  };

  const triggerWholesalerRestock = (alertId: string) => {
    setWholesalerAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'contacted' } : a))
    );
  };

  const confirmWholesalerRestock = (alertId: string, addedQty: number) => {
    const alert = wholesalerAlerts.find((a) => a.id === alertId);
    if (alert) {
      updateInventoryItem(alert.itemId, {
        stock: (inventory.find((i) => i.id === alert.itemId)?.stock || 0) + addedQty,
      });
      setWholesalerAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'delivered' } : a))
      );
    }
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
    };
    setCustomers((prev) => [newCust, ...prev]);
  };

  const updateCustomerTag = (id: string, tag: CustomerTag) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, tag } : c))
    );
  };

  const sendBroadcast = (broadcast: Omit<BroadcastMessage, 'id' | 'sentAt' | 'recipientCount'>) => {
    const newBroad: BroadcastMessage = {
      ...broadcast,
      id: `broad-${Date.now()}`,
      sentAt: 'Just Now',
      recipientCount: broadcast.targetTag === 'All Customers' ? customers.length : customers.filter(c => c.tag === broadcast.targetTag).length || 15,
    };
    setBroadcasts((prev) => [newBroad, ...prev]);
  };

  // Compute stats
  const revenue = orders
    .filter((o) => o.status !== 'rejected')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrders = orders.filter((o) => o.status !== 'rejected').length;

  const itemCounts: Record<string, number> = {};
  orders.forEach((o) => {
    if (o.status !== 'rejected') {
      o.items.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
      });
    }
  });

  const topSelling = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <StoreContext.Provider
      value={{
        viewMode,
        setViewMode,
        merchantProfile,
        updateMerchantProfile,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        syncOfflineSale,
        orders,
        acceptOrder,
        rejectOrder,
        updateOrderStatus,
        placeWhatsappOrder,
        wholesalerAlerts,
        triggerWholesalerRestock,
        confirmWholesalerRestock,
        customers,
        addCustomer,
        updateCustomerTag,
        broadcasts,
        sendBroadcast,
        isWhatsappDrawerOpen,
        setIsWhatsappDrawerOpen,
        todayStats: {
          revenue,
          totalOrders,
          topSelling,
        },
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
