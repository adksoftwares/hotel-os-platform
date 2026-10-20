"use client";
import { useEffect } from 'react';
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X, Filter, Utensils, AlertTriangle } from 'lucide-react';

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

const FAKE_FOOD_IDS = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'M-001', 'M-002', 'M-003']);
const FAKE_FOOD_NAMES = new Set([
  'steak frites (250g)',
  'caesar salad with bacon',
  'truffle parmesan fries',
  'artisan craft cola',
  'wagyu burger deluxe',
  'ny baked cheesecake',
  'margherita woodfire pizza',
  'garlic tomato bruschetta',
  'grilled atlantic salmon',
  'crispy calamari rings',
  'espresso martini',
  'lava chocolate cake',
  'warm lava chocolate cake',
  'grilled salmon',
  'caesar salad',
  'truffle pasta',
]);

const SAMPLE_MENU: MenuItem[] = [];

export default function MenuManagement() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

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

  const loadMenu = () => {
    try {
      const saved = localStorage.getItem('hotel_menu_items') || localStorage.getItem('restaurant_menu_items');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const nonFake = parsed.filter(item => 
            !FAKE_FOOD_IDS.has(String(item.id)) && 
            !FAKE_FOOD_NAMES.has((item.name || '').toLowerCase().trim())
          );
          if (nonFake.length !== parsed.length) {
            localStorage.setItem('hotel_menu_items', JSON.stringify(nonFake));
            localStorage.setItem('restaurant_menu_items', JSON.stringify(nonFake));
          }
          setMenu(nonFake);
          return;
        }
      }
      setMenu([]);
    } catch (e) {
      setMenu([]);
    }
  };

  useEffect(() => {
    loadMenu();
    const handleUpdate = () => loadMenu();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('hotel_menu_changed', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('hotel_menu_changed', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const getEmojiForDish = (name: string, category: string = ''): string => {
    const n = (name || '').toLowerCase();
    const c = (category || '').toLowerCase();
    if (n.includes('rice') || n.includes('biryani') || n.includes('fried rice') || n.includes('pulao')) return '🍚';
    if (n.includes('burger')) return '🍔';
    if (n.includes('pizza')) return '🍕';
    if (n.includes('salad')) return '🥗';
    if (n.includes('soup')) return '🍲';
    if (n.includes('pasta') || n.includes('noodle') || n.includes('spaghetti')) return '🍝';
    if (n.includes('fish') || n.includes('salmon') || n.includes('seafood') || n.includes('crab') || n.includes('prawn')) return '🐟';
    if (n.includes('chicken') || n.includes('meat') || n.includes('steak') || n.includes('curry') || n.includes('mutton') || n.includes('beef')) return '🍗';
    if (n.includes('fries') || n.includes('potato') || n.includes('chip')) return '🍟';
    if (n.includes('cake') || n.includes('dessert') || n.includes('sweet') || n.includes('ice cream') || n.includes('chocolate')) return '🍰';
    if (n.includes('tea') || n.includes('coffee') || n.includes('espresso') || n.includes('cappuccino')) return '☕';
    if (n.includes('juice') || n.includes('drink') || n.includes('beverage') || n.includes('coke') || n.includes('mojito') || n.includes('water') || n.includes('soda')) return '🥤';
    if (n.includes('bread') || n.includes('roti') || n.includes('naan') || n.includes('toast')) return '🍞';
    if (n.includes('taco') || n.includes('wrap') || n.includes('burrito')) return '🌮';
    if (n.includes('sushi')) return '🍣';
    if (c.includes('beverage')) return '🥤';
    if (c.includes('dessert')) return '🍰';
    if (c.includes('starter') || c.includes('appetizer')) return '🥗';
    return '🍽️';
  };

  const saveMenu = (newMenu: MenuItem[]) => {
    setMenu(newMenu);
    try {
      localStorage.setItem('hotel_menu_items', JSON.stringify(newMenu));
      localStorage.setItem('restaurant_menu_items', JSON.stringify(newMenu));

      // Also sync to POS catalog so POS immediately reflects edits/adds with clean emojis
      const existingPos = JSON.parse(localStorage.getItem('pos_all_menu_items') || '[]');
      const categoryMap: Record<string, string> = {
        'Appetizers': 'Starters',
        'Main Course': 'Mains',
        'Desserts': 'Desserts',
        'Beverages': 'Beverages'
      };
      const syncedPos = newMenu.map(m => {
        const found = Array.isArray(existingPos) ? existingPos.find((p: any) => p.name === m.name || p.id === m.id) : null;
        const assignedEmoji = (found?.img && !found.img.startsWith('http')) ? found.img : getEmojiForDish(m.name, m.category);
        return {
          id: m.id,
          name: m.name,
          category: categoryMap[m.category] || m.category || 'Mains',
          price: m.basePrice || (m.variants && m.variants[0]?.price) || 0,
          course: m.category === 'Appetizers' ? 'Starters' : m.category === 'Desserts' ? 'Desserts' : m.category === 'Beverages' ? 'Beverages' : 'Main Course',
          img: assignedEmoji,
          station: m.category === 'Beverages' ? 'Bar' : 'Kitchen'
        };
      });
      localStorage.setItem('pos_all_menu_items', JSON.stringify(syncedPos));
      window.dispatchEvent(new Event('hotel_menu_changed'));
    } catch (e) {}
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Main Course',
      description: '',
      basePrice: 0,
      available: true,
      variants: []
    });
    setVariantName("");
    setVariantPrice("");
    setShowModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      basePrice: item.basePrice,
      available: item.available,
      variants: item.variants ? [...item.variants] : []
    });
    setVariantName("");
    setVariantPrice("");
    setShowModal(true);
  };

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
    if (!formData.name?.trim()) return;

    if (editingId) {
      const updated = menu.map(item => item.id === editingId ? {
        ...item,
        name: formData.name!.trim(),
        category: formData.category || 'Main Course',
        description: formData.description || '',
        basePrice: Number(formData.basePrice) || 0,
        variants: formData.variants || [],
        available: formData.available ?? true,
      } : item);
      saveMenu(updated);
    } else {
      const newItem: MenuItem = {
        id: `M-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: formData.name.trim(),
        category: formData.category || 'Main Course',
        description: formData.description || '',
        basePrice: Number(formData.basePrice) || 0,
        variants: formData.variants || [],
        available: formData.available ?? true,
      };
      saveMenu([...menu, newItem]);
    }

    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', category: 'Main Course', description: '', basePrice: 0, available: true, variants: [] });
  };

  const toggleAvailability = (id: string) => {
    const updated = menu.map(item => item.id === id ? { ...item, available: !item.available } : item);
    saveMenu(updated);
  };

  const deleteItem = (id: string) => {
    const updated = menu.filter(item => item.id !== id);
    saveMenu(updated);
    setItemToDelete(null);
  };

  const handleClearAll = () => {
    saveMenu([]);
    setShowClearConfirm(false);
  };

  const handleLoadSampleMenu = () => {
    saveMenu(SAMPLE_MENU);
  };

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Escape key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') { try { setShowModal(false); setShowClearConfirm(false); } catch(_){} } };
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
        <div className="flex items-center gap-2">
          {menu.length > 0 && (
            <button 
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 font-medium text-xs transition-colors"
            >
              <Trash2 size={15} />
              Clear All Items
            </button>
          )}
          <button 
            type="button"
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm"
          >
            <Plus size={18} />
            Add Food Item
          </button>
        </div>
      </div>

      {menu.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto my-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">No Food Items in Menu</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              All demo food items have been cleared. Add your first dish to build your restaurant catalog.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Dish</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSampleMenu}
              className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
            >
              <span>Load Sample Dishes</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search menu items or categories..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">
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
                      {item.description && (
                        <div className="text-sm text-slate-500 truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-900">Rs. {item.basePrice.toFixed(2)}</td>
                    <td className="p-4">
                      {item.variants && item.variants.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {item.variants.map(v => (
                            <span key={v.id} className="text-xs text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded inline-block w-max">
                              {v.name}: Rs. {v.price.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">No variants</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button 
                        type="button"
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
                        <button 
                          type="button"
                          onClick={() => handleEditItem(item)}
                          className="p-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                          title={`Edit ${item.name}`}
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title={`Delete ${item.name}`}
                          aria-label={`Delete ${item.name}`}
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
              <div className="p-8 text-center text-slate-500 text-xs">
                No menu items match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300"
            onClick={() => { setShowModal(false); setEditingId(null); }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200 z-10 border border-slate-100">
            {/* Modal Header - Pinned at Top */}
            <div className="flex justify-between items-center p-5 px-6 border-b border-slate-200 shrink-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? `Edit Food Details - ${formData.name || ''}` : 'Add New Food Item'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingId(null); }} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Base Price (Rs.) *</label>
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
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {formData.variants && formData.variants.length > 0 && (
                    <ul className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {formData.variants.map(v => (
                        <li key={v.id} className="flex justify-between items-center bg-white p-2 border border-slate-200 rounded">
                          <span className="font-medium text-slate-800">{v.name} <span className="text-slate-500 font-normal">(Rs. {v.price.toFixed(2)})</span></span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
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

              {/* Sticky Footer - Always Visible on Screen */}
              <div className="p-4 px-6 flex justify-end items-center gap-3 border-t border-slate-200 bg-slate-50 shrink-0">
                <button 
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-white font-semibold transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer text-sm"
                >
                  <Check size={18} />
                  {editingId ? 'Save Changes' : 'Save Food Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300"
            onClick={() => setItemToDelete(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-sm w-full p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setItemToDelete(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50/80 shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Delete Food Item?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-800">&quot;{itemToDelete.name}&quot;</span> (Rs. {itemToDelete.basePrice.toFixed(2)}) from the food catalog?
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => deleteItem(itemToDelete.id)}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Yes, Delete Dish
              </button>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Keep Dish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Menu Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-sm w-full p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 ring-8 ring-amber-50/80 shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Clear Entire Menu?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              This will remove all {menu.length} food items currently in your catalog.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleClearAll}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Yes, Clear All Items
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

