import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { InventoryItem, ShopCategory } from '../types';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  PackagePlus,
  X,
  Sparkles,
  Barcode
} from 'lucide-react';

interface InventoryProps {
  onAddNewOpen?: () => void;
}

export const InventoryManagement: React.FC<InventoryProps> = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<{
    name: string;
    category: ShopCategory;
    unit: string;
    stock: number;
    price: number;
    lowStockThreshold: number;
    image: string;
    barcode: string;
  }>({
    name: '',
    category: 'grocery',
    unit: '1kg',
    stock: 20,
    price: 100,
    lowStockThreshold: 5,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60',
    barcode: '',
  });

  // Edit Item Stock Modal
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLowStock = !filterLowStockOnly || item.stock <= item.lowStockThreshold;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    addInventoryItem({
      ...newItem,
      isPopular: false,
    });
    setIsAddModalOpen(false);
    setNewItem({
      name: '',
      category: 'grocery',
      unit: '1kg',
      stock: 20,
      price: 100,
      lowStockThreshold: 5,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60',
      barcode: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#becabd] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0b1c30]">Stock Management</h1>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#108548]/10 text-[#108548] text-xs font-bold border border-[#108548]/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Synced with WhatsApp AI Agent
            </span>
          </div>
          <p className="text-xs text-[#3e4a40] mt-1">
            Catalogue items are automatically checked when customers place orders on WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#108548] text-white font-bold text-sm hover:bg-[#005229] transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Stock Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#becabd]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by name or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#becabd] text-xs focus:outline-none focus:ring-2 focus:ring-[#006a37]"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {['all', 'grocery', 'vegetables', 'flowers', 'crockery', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-bold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-[#006a37] text-white shadow-sm'
                  : 'bg-gray-100 text-[#3e4a40] hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1 ${
              filterLowStockOnly
                ? 'bg-[#ffb61e] text-[#6c4a00] border border-[#ffb61e]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock</span>
          </button>
        </div>
      </div>

      {/* Bento Inventory Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isLowStock = item.stock <= item.lowStockThreshold;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative ${
                isLowStock ? 'border-2 border-[#ffb61e]' : 'border-[#becabd]'
              }`}
            >
              <div>
                {/* Image & Category Pill */}
                <div className="relative h-36 w-full rounded-xl overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-md capitalize">
                    {item.category}
                  </span>
                  {item.isPopular && (
                    <span className="absolute top-2 right-2 bg-[#ffb61e] text-[#6c4a00] font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Bestseller
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0b1c30] text-sm leading-tight">{item.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Unit: {item.unit}</p>

                {/* Stock Warning Badge */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400">Price</span>
                    <p className="text-lg font-black text-[#006a37]">₹{item.price}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Stock</span>
                    <p
                      className={`text-sm font-extrabold ${
                        isLowStock ? 'text-red-600 font-black flex items-center gap-1 justify-end' : 'text-[#0b1c30]'
                      }`}
                    >
                      {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                      {item.stock} left
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    updateInventoryItem(item.id, { stock: item.stock + 10 })
                  }
                  className="px-2.5 py-1.5 bg-[#eff4ff] text-[#006a37] text-xs font-bold rounded-lg hover:bg-[#dce9ff] flex items-center gap-1"
                  title="Add +10 stock"
                >
                  <PackagePlus className="w-3.5 h-3.5" /> +10 Stock
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 text-gray-500 hover:text-[#006a37] hover:bg-gray-100 rounded-lg"
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteInventoryItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#0b1c30] mb-4">Add New Item to Shop Catalog</h3>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#3e4a40] mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Sunflower Oil"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#006a37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3e4a40] mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ShopCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  >
                    <option value="grocery">Grocery</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="flowers">Flowers</option>
                    <option value="crockery">Crockery</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#3e4a40] mb-1">Unit / Size</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1L or 5kg"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3e4a40] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3e4a40] mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3e4a40] mb-1">Image URL</label>
                <input
                  type="text"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#108548] text-white rounded-xl font-bold text-sm hover:bg-[#005229] transition-all shadow-md"
                >
                  Save to WhatsApp Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#0b1c30] mb-2">Edit Stock: {editingItem.name}</h3>

            <div className="space-y-4 text-xs pt-2">
              <div>
                <label className="block font-bold text-gray-600 mb-1">Stock Count</label>
                <input
                  type="number"
                  value={editingItem.stock}
                  onChange={(e) => setEditingItem({ ...editingItem, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <button
                onClick={() => {
                  updateInventoryItem(editingItem.id, {
                    stock: editingItem.stock,
                    price: editingItem.price,
                  });
                  setEditingItem(null);
                }}
                className="w-full py-2.5 bg-[#006a37] text-white font-bold rounded-xl"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
