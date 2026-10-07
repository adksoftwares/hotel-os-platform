"use client";
import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddFoodPage() {
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
    console.log('Saved data:', { formData, variants, modifiers });
    alert('Food item saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings/restaurant" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
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
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                      <input 
                        type="number" 
                        placeholder="Price Adj."
                        className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        value={variant.priceAdjustment}
                        onChange={e => {
                          const newV = [...variants];
                          newV[index].priceAdjustment = e.target.value;
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
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                      <input 
                        type="number" 
                        placeholder="Add Price"
                        className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        value={mod.price}
                        onChange={e => {
                          const newM = [...modifiers];
                          newM[index].price = e.target.value;
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
                  <span className="absolute left-3 top-2 text-slate-500 font-medium">$</span>
                  <input 
                    type="number" 
                    className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-medium">$</span>
                  <input 
                    type="number" 
                    className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                <input 
                  type="number" 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. 15"
                  value={formData.tax}
                  onChange={e => setFormData({...formData, tax: e.target.value})}
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
    </div>
  );
}
