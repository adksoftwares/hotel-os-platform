"use client";
import { useEffect } from 'react';
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X, Filter } from 'lucide-react';

interface FoodVariant {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  basePrice: number;
  variants: FoodVariant[];
  available: boolean;
  image?: string;
}

const initialMenu: MenuItem[] = [
  {
    id: "M-001",
    category: "Main Course",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with asparagus and hollandaise",
    basePrice: 28.00,
    variants: [
      { id: "v1", name: "Standard", price: 28.00 },
      { id: "v2", name: "Large", price: 34.00 }
    ],
    available: true
  },
  {
    id: "M-002",
    category: "Appetizers",
    name: "Caesar Salad",
    description: "Crisp romaine, parmesan, croutons",
    basePrice: 12.00,
    variants: [
      { id: "v3", name: "No Chicken", price: 12.00 },
      { id: "v4", name: "With Chicken", price: 16.00 }
    ],
    available: true
  },
  {
    id: "M-003",
    category: "Main Course",
    name: "Truffle Pasta",
    description: "Handmade fettuccine, black truffle, cream",
    basePrice: 24.00,
    variants: [],
    available: false
  },
];

export default function MenuManagement() {
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    category: 'Main Course',
    description: '',
    basePrice: 0,
    available: true,
    variants: []
  });
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState("");

  const handleAddVariant = () => {
    if (!variantName || !variantPrice) return;
    setFormData(prev => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { id: Math.random().toString(), name: variantName, price: parseFloat(variantPrice) }
      ]
    }));
    setVariantName("");
    setVariantPrice("");
  };

  const handleRemoveVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: MenuItem = {
      id: `M-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: formData.name || 'Unnamed Item',
      category: formData.category || 'Uncategorized',
      description: formData.description || '',
      basePrice: Number(formData.basePrice) || 0,
      variants: formData.variants || [],
      available: formData.available ?? true,
    };
    setMenu([...menu, newItem]);
    setShowModal(false);
    setFormData({ name: '', category: 'Main Course', description: '', basePrice: 0, available: true, variants: [] });
  };

  const toggleAvailability = (id: string) => {
    setMenu(menu.map(item => item.id === id ? { ...item, available: !item.available } : item));
  };

  const deleteItem = (id: string) => {
    setMenu(menu.filter(item => item.id !== id));
  };

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Escape key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') { try { setShowModal(false); } catch(_){} } };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-slate-500 text-sm">Manage restaurant food items, prices, and availability</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} />
          Add Food Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search menu items or categories..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
            <Filter size={18} />
            Filter Categories
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">Item</th>
                <th className="p-4 font-semibold text-slate-700">Category</th>
                <th className="p-4 font-semibold text-slate-700">Base Price</th>
                <th className="p-4 font-semibold text-slate-700">Variants</th>
                <th className="p-4 font-semibold text-slate-700">Status</th>
                <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenu.map(item => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-sm text-slate-500 truncate max-w-xs">{item.description}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-900">${item.basePrice.toFixed(2)}</td>
                  <td className="p-4">
                    {item.variants.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.variants.map(v => (
                          <span key={v.id} className="text-xs text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded inline-block w-max">
                            {v.name}: ${v.price.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">No variants</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleAvailability(item.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${item.available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.available ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`ml-2 text-sm font-medium ${item.available ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {item.available ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMenu.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No menu items found.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Add New Food Item</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Name *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Appetizers</option>
                      <option>Main Course</option>
                      <option>Desserts</option>
                      <option>Beverages</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Base Price ($) *</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    min="0"
                    className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.basePrice || ''}
                    onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Variants / Options</h3>
                  <div className="flex gap-4 mb-4">
                    <input 
                      type="text" 
                      placeholder="Variant name (e.g. Large)" 
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={variantName}
                      onChange={e => setVariantName(e.target.value)}
                    />
                    <input 
                      type="number" 
                      placeholder="Price" 
                      step="0.01"
                      className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={variantPrice}
                      onChange={e => setVariantPrice(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={handleAddVariant}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {formData.variants && formData.variants.length > 0 && (
                    <ul className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {formData.variants.map(v => (
                        <li key={v.id} className="flex justify-between items-center bg-white p-2 border border-slate-200 rounded">
                          <span className="font-medium text-slate-800">{v.name} <span className="text-slate-500 font-normal">(${v.price.toFixed(2)})</span></span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t border-slate-200 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.available}
                      onChange={e => setFormData({...formData, available: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">Currently Available in Menu</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                >
                  <Check size={18} />
                  Save Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

