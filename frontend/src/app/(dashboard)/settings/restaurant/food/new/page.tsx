"use client";
import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Save, CheckCircle2, ArrowRight, Utensils, Sparkles, X, IndianRupee, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddFoodPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    price: '',
    cost: '',
    tax: '',
    isAvailable: true,
  });

  const [variants, setVariants] = useState([{ id: 1, name: 'Regular', priceAdjustment: '0' }]);
  const [modifiers, setModifiers] = useState([{ id: 1, name: 'Extra Cheese', price: '1.50' }]);

  const handleAddVariant = () => {
    setVariants([...variants, { id: Date.now(), name: '', priceAdjustment: '0' }]);
  };

  const handleRemoveVariant = (id: number) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleAddModifier = () => {
    setModifiers([...modifiers, { id: Date.now(), name: '', price: '0' }]);
  };

  const handleRemoveModifier = (id: number) => {
    setModifiers(modifiers.filter(m => m.id !== id));
  };

  const handleSave = () => {
    const itemName = formData.name.trim();
    if (!itemName) return;

    try {
      const existingMenu = JSON.parse(localStorage.getItem('hotel_menu_items') || localStorage.getItem('restaurant_menu_items') || '[]');
      const newItem = {
        id: `M-${Date.now().toString().slice(-4)}`,
        name: itemName,
        code: formData.code || `F-${Math.floor(100 + Math.random() * 900)}`,
        category: formData.category || 'Main Course',
        description: '',
        basePrice: parseFloat(formData.price) || 0,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        tax: parseFloat(formData.tax) || 0,
        available: formData.isAvailable,
        isAvailable: formData.isAvailable,
        variants: variants.map(v => ({ id: String(v.id), name: v.name, price: (parseFloat(formData.price) || 0) + (parseFloat(v.priceAdjustment) || 0) })),
        modifiers,
      };
      const filtered = Array.isArray(existingMenu) ? existingMenu.filter((m: any) => m.name !== itemName) : [];
      const updated = [...filtered, newItem];
      localStorage.setItem('hotel_menu_items', JSON.stringify(updated));
      localStorage.setItem('restaurant_menu_items', JSON.stringify(updated));

      // Also sync to POS and Waiter POS catalog
      const existingPos = JSON.parse(localStorage.getItem('pos_all_menu_items') || '[]');
      const newPosItem = {
        id: newItem.id,
        name: newItem.name,
        price: newItem.price,
        category: newItem.category,
        status: newItem.available ? 'AVAILABLE' : '86',
        rating: 4.8,
        description: '',
      };
      const filteredPos = Array.isArray(existingPos) ? existingPos.filter((p: any) => p.name !== itemName) : [];
      localStorage.setItem('pos_all_menu_items', JSON.stringify([...filteredPos, newPosItem]));

      window.dispatchEvent(new Event('hotel_menu_changed'));
    } catch (_) {}

    setShowSuccessModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/restaurant/menu" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Add New Menu Item</h1>
        </div>
        <button onClick={handleSave} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" />
          Save Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. Classic Cheeseburger"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Code / SKU</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. BURG-001"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="starters">Starters</option>
                  <option value="mains">Mains</option>
                  <option value="desserts">Desserts</option>
                  <option value="beverages">Beverages</option>
                </select>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-lg font-semibold text-slate-800">Variants / Sizes</h2>
              <button onClick={handleAddVariant} className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Variant
              </button>
            </div>
            
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={variant.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Variant Name (e.g. Small, Large)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      value={variant.name}
                      onChange={e => {
                        const newV = [...variants];
                        newV[index].name = e.target.value;
                        setVariants(newV);
                      }}
                    />
                  </div>
                  <div className="w-36">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-semibold">Rs.</span>
                      <input 
                        type="number" min="0" 
                        placeholder="Price Adj."
                        className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        value={variant.priceAdjustment}
                        onChange={e => {
                          const newV = [...variants];
                          newV[index].priceAdjustment = e.target.value.includes("-") ? "0" : e.target.value;
                          setVariants(newV);
                        }}
                      />
                    </div>
                  </div>
                  <button onClick={() => handleRemoveVariant(variant.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {variants.length === 0 && (
                <p className="text-sm text-slate-500 italic">No variants added. Item will have a single fixed price.</p>
              )}
            </div>
          </div>

          {/* Modifiers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-lg font-semibold text-slate-800">Modifiers & Add-ons</h2>
              <button onClick={handleAddModifier} className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Modifier
              </button>
            </div>
            
            <div className="space-y-3">
              {modifiers.map((mod, index) => (
                <div key={mod.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Modifier Name (e.g. Extra Cheese)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      value={mod.name}
                      onChange={e => {
                        const newM = [...modifiers];
                        newM[index].name = e.target.value;
                        setModifiers(newM);
                      }}
                    />
                  </div>
                  <div className="w-36">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-semibold">Rs.</span>
                      <input 
                        type="number" min="0" 
                        placeholder="Add Price"
                        className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        value={mod.price}
                        onChange={e => {
                          const newM = [...modifiers];
                          newM[index].price = e.target.value.includes("-") ? "0" : e.target.value;
                          setModifiers(newM);
                        }}
                      />
                    </div>
                  </div>
                  <button onClick={() => handleRemoveModifier(mod.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {modifiers.length === 0 && (
                <p className="text-sm text-slate-500 italic">No modifiers added.</p>
              )}
            </div>
          </div>

        </div>

        {/* Pricing & Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Pricing</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-bold">Rs.</span>
                  <input 
                    type="number" min="0" 
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value.includes("-") ? "0" : e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-bold">Rs.</span>
                  <input 
                    type="number" min="0" 
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: e.target.value.includes("-") ? "0" : e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                <input 
                  type="number" min="0" 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. 15"
                  value={formData.tax}
                  onChange={e => setFormData({...formData, tax: e.target.value.includes("-") ? "0" : e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Settings</h2>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={formData.isAvailable}
                  onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isAvailable ? 'bg-primary-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isAvailable ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-medium text-slate-700">Item is Available for Sale</span>
            </label>
          </div>
        </div>
      </div>

      {/* Success Popup Window with Background Blur */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Background Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300"
            onClick={() => router.push('/restaurant/menu')}
          />

          {/* Popup Window Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 sm:p-8 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => router.push('/restaurant/menu')}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50/80 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              Food Item Saved Successfully!
            </h3>
            
            <p className="text-xs text-slate-500 mb-5">
              <span className="font-bold text-slate-800">{formData.name || 'Menu item'}</span> has been configured and added to your restaurant catalogue.
            </p>

            {/* Item Attribute Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left mb-6 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-slate-400" />
                  Item Name
                </span>
                <span className="font-bold text-slate-800">{formData.name || 'Unnamed Dish'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Category
                </span>
                <span className="font-semibold text-slate-700">{formData.category || 'General'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                  Selling Price
                </span>
                <span className="font-bold text-slate-800">Rs. {parseFloat(formData.price || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  Availability Status
                </span>
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[11px] border ${
                  formData.isAvailable 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200/80' 
                    : 'text-amber-700 bg-amber-50 border-amber-200/80'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${formData.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  {formData.isAvailable ? 'Available for Sale' : 'Unavailable / Sold Out'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => router.push('/restaurant/menu')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>Go to Menu Management</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setFormData({
                    name: '',
                    code: '',
                    category: '',
                    price: '',
                    cost: '',
                    tax: '',
                    isAvailable: true,
                  });
                  setVariants([{ id: 1, name: 'Regular', priceAdjustment: '0' }]);
                  setModifiers([{ id: 1, name: 'Extra Cheese', price: '1.50' }]);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Add Another Food Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





