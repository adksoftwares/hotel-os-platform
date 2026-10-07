"use client";
import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ReceiptModal } from '@/components/ui/ReceiptModal';
import { Settings, Utensils, Bed, Search, Tag, Percent, ArrowRight, Minus, Plus, Edit2, Trash2 } from 'lucide-react';

export default function RestaurantPOS() {
  const categories = ['All', 'Starters', 'Mains', 'Sides', 'Beverages', 'Desserts'];
  const menuItems = [
    { id: '1', name: 'Steak Frites', category: 'Mains', price: 50.00, img: '🥩' },
    { id: '2', name: 'Caesar Salad', category: 'Starters', price: 15.00, img: '🥗' },
    { id: '3', name: 'Truffle Fries', category: 'Sides', price: 12.00, img: '🍟' },
    { id: '4', name: 'Craft Cola', category: 'Beverages', price: 5.00, img: '🥤' },
    { id: '5', name: 'Wagyu Burger', category: 'Mains', price: 25.00, img: '🍔' },
    { id: '6', name: 'Cheesecake', category: 'Desserts', price: 10.00, img: '🍰' },
    { id: '7', name: 'Margherita Pizza', category: 'Mains', price: 18.00, img: '🍕' },
    { id: '8', name: 'Bruschetta', category: 'Starters', price: 9.00, img: '🥖' },
  ];

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [orderType, setOrderType] = useState<'Table' | 'Room'>('Table');
  const [tableOrRoom, setTableOrRoom] = useState('T1');
  
  const [orderItems, setOrderItems] = useState<any[]>([]);
  
  // Modals
  const [modalMessage, setModalMessage] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  
  // Item Discount Modal
  const [itemDiscountModal, setItemDiscountModal] = useState<{ isOpen: boolean, itemIndex: number, type: 'percent' | 'fixed' | 'none', value: number | '' }>({ isOpen: false, itemIndex: -1, type: 'percent', value: '' });
  
  // Order Discount Modal
  const [orderDiscountModal, setOrderDiscountModal] = useState<{ isOpen: boolean, type: 'percent' | 'fixed' | 'none', value: number | '' }>({ isOpen: false, type: 'percent', value: '' });
  const [orderDiscount, setOrderDiscount] = useState<{ type: 'percent' | 'fixed' | 'none', value: number }>({ type: 'none', value: 0 });

  // Qty Modal
  const [qtyModal, setQtyModal] = useState<{ isOpen: boolean, itemIndex: number, value: string | number }>({ isOpen: false, itemIndex: -1, value: '' });

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleAddItem = (item: any) => {
    const existingIndex = orderItems.findIndex(o => o.id === item.id);
    if (existingIndex >= 0) {
      const newItems = [...orderItems];
      newItems[existingIndex].qty += 1;
      setOrderItems(newItems);
    } else {
      setOrderItems([...orderItems, { ...item, qty: 1, discountType: 'none', discountValue: 0 }]);
    }
  };

  const updateItemQty = (index: number, newQty: number) => {
    const newItems = [...orderItems];
    if (newQty <= 0) {
      newItems.splice(index, 1);
    } else {
      newItems[index].qty = newQty;
    }
    setOrderItems(newItems);
  };

  const applyItemDiscount = () => {
    const { itemIndex, type, value } = itemDiscountModal;
    if (itemIndex >= 0 && value !== '') {
      const newItems = [...orderItems];
      newItems[itemIndex].discountType = type;
      newItems[itemIndex].discountValue = Number(value);
      setOrderItems(newItems);
    }
    setItemDiscountModal({ isOpen: false, itemIndex: -1, type: 'percent', value: '' });
  };

  const applyOrderDiscount = () => {
    const { type, value } = orderDiscountModal;
    if (value !== '') {
      setOrderDiscount({ type, value: Number(value) });
    }
    setOrderDiscountModal({ isOpen: false, type: 'percent', value: '' });
  };

  const applyQty = () => {
    const { itemIndex, value } = qtyModal;
    const numValue = Number(value);
    if (itemIndex >= 0 && !isNaN(numValue) && numValue > 0) {
      updateItemQty(itemIndex, numValue);
    } else if (numValue === 0) {
      const newItems = [...orderItems];
      newItems.splice(itemIndex, 1);
      setOrderItems(newItems);
    }
    setQtyModal({ isOpen: false, itemIndex: -1, value: '' });
  };

  const handleFireKOT = () => {
    if (orderItems.length === 0) return setModalMessage("Order is empty! Please add items first.");
    
    const newKot = {
      id: `KOT-${Math.floor(Math.random() * 9000) + 1000}`,
      table: tableOrRoom || 'Counter',
      type: orderType,
      server: 'Admin',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'NEW',
      items: orderItems.map(item => ({ name: item.name, qty: item.qty, notes: '' }))
    };

    const existingKots = JSON.parse(localStorage.getItem('kds_kots') || '[]');
    localStorage.setItem('kds_kots', JSON.stringify([newKot, ...existingKots]));
    window.dispatchEvent(new Event('kots_updated'));

    setModalMessage(`KOT Fired to Kitchen Successfully! (${newKot.id})`);
  };

  // Calculations
  const calculateItemTotal = (item: any) => {
    const base = item.price * item.qty;
    if (item.discountType === 'percent') return base - (base * (item.discountValue / 100));
    if (item.discountType === 'fixed') return Math.max(0, base - item.discountValue);
    return base;
  };

  const subtotal = orderItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  
  let totalOrderDiscount = 0;
  if (orderDiscount.type === 'percent') {
    totalOrderDiscount = subtotal * (orderDiscount.value / 100);
  } else if (orderDiscount.type === 'fixed') {
    totalOrderDiscount = orderDiscount.value;
  }

  const postDiscountTotal = Math.max(0, subtotal - totalOrderDiscount);
  const tax = postDiscountTotal * 0.10; // 10% tax
  const grandTotal = postDiscountTotal + tax;

  const mockInvoice = {
    invoiceNumber: 'ORD-2091',
    createdAt: new Date().toISOString(),
    paymentMethod: 'PENDING',
    status: 'UNPAID',
    subtotal: subtotal,
    totalDiscount: totalOrderDiscount,
    grandTotal: grandTotal,
    amountReceived: 0,
    balance: grandTotal,
    items: orderItems.map(item => {
      const lineTotal = calculateItemTotal(item);
      return {
        id: item.id,
        companyName: 'The Steakhouse',
        productName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        finalTotal: lineTotal,
        discount: (item.price * item.qty) - lineTotal
      };
    })
  };

  const mockUser = {
    shopName: 'Hotel OS - The Steakhouse',
    shopAddress: '123 Grand Ave, New York',
    shopPhone: '+1 (555) 123-4567',
    name: 'Admin'
  };

  return (
    <div className="flex h-full gap-4 bg-slate-50 p-2 rounded-xl">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Menu</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500 w-64 outline-none"
              />
            </div>
          </div>
          
          {/* Order Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setOrderType('Table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${orderType === 'Table' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Utensils className="w-4 h-4" /> Table
            </button>
            <button 
              onClick={() => setOrderType('Room')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${orderType === 'Room' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Bed className="w-4 h-4" /> Room Service
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat 
                  ? 'bg-slate-800 text-white shadow-md scale-105' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleAddItem(item)} 
                className="group bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-primary-300 hover:shadow-md cursor-pointer transition-all active:scale-95 flex flex-col h-44 relative overflow-hidden"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform origin-bottom-left">{item.img}</div>
                <div className="mt-auto">
                  <h3 className="font-bold text-slate-800 leading-tight mb-1">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{item.category}</span>
                    <span className="font-extrabold text-primary-600">${item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Search className="w-12 h-12 opacity-20" />
              <p>No items found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart / Ticket Area */}
      <div className="w-[420px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-lg">Current Order</h2>
              <span className="px-2 py-0.5 bg-slate-700 rounded text-xs font-semibold">{orderType}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <span>{orderType === 'Table' ? 'Table No:' : 'Room No:'}</span>
              <input 
                type="text" 
                value={tableOrRoom}
                onChange={e => setTableOrRoom(e.target.value)}
                className="bg-slate-700 text-white px-2 py-1 rounded w-16 text-center outline-none focus:ring-1 focus:ring-primary-400"
              />
            </div>
          </div>
          <button 
            onClick={() => { setOrderItems([]); setOrderDiscount({ type: 'none', value: 0 }); }} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Clear Order"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
          {orderItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Utensils className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">Cart is empty</p>
            </div>
          ) : (
            orderItems.map((item, idx) => {
              const itemTotal = calculateItemTotal(item);
              const hasDiscount = item.discountType !== 'none';
              
              return (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 group relative">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                      <div className="text-xs text-slate-500 font-medium">${item.price.toFixed(2)} each</div>
                      {hasDiscount && (
                        <div className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Discount: {item.discountType === 'percent' ? `${item.discountValue}%` : `$${item.discountValue}`}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">${itemTotal.toFixed(2)}</div>
                      {hasDiscount && (
                        <div className="text-xs text-slate-400 line-through">${(item.price * item.qty).toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                      <button onClick={() => updateItemQty(idx, item.qty - 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"><Minus className="w-3 h-3" /></button>
                      <button 
                        onClick={() => setQtyModal({ isOpen: true, itemIndex: idx, value: item.qty })}
                        className="w-10 h-7 flex items-center justify-center font-bold text-slate-800 text-sm hover:bg-slate-200 rounded transition-colors"
                      >
                        {item.qty}
                      </button>
                      <button onClick={() => updateItemQty(idx, item.qty + 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"><Plus className="w-3 h-3" /></button>
                    </div>
                    
                    <button 
                      onClick={() => setItemDiscountModal({ isOpen: true, itemIndex: idx, type: item.discountType !== 'none' ? item.discountType : 'percent', value: item.discountType !== 'none' ? item.discountValue : '' })}
                      className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <Percent className="w-3 h-3" /> Discount
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals & Actions */}
        <div className="bg-white border-t border-slate-200 flex flex-col">
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {totalOrderDiscount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                <span>Order Discount ({orderDiscount.type === 'percent' ? `${orderDiscount.value}%` : `$${orderDiscount.value}`})</span>
                <span>-${totalOrderDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
              <span className="font-bold text-slate-800 text-lg">Total</span>
              <span className="font-extrabold text-primary-600 text-2xl">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex gap-2">
              <button 
                onClick={() => setOrderDiscountModal({ isOpen: true, type: orderDiscount.type !== 'none' ? orderDiscount.type : 'percent', value: orderDiscount.type !== 'none' ? orderDiscount.value : '' })}
                className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2"
              >
                <Tag className="w-4 h-4" /> Apply Discount
              </button>
            </div>
            
            <div className="flex gap-2">
              <button onClick={handleFireKOT} className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex flex-col items-center justify-center leading-none">
                <span className="text-lg">KOT</span>
                <span className="text-xs font-medium opacity-80 mt-1">Send to Kitchen</span>
              </button>
              <button 
                onClick={() => {
                  if (orderItems.length === 0) return setModalMessage("Order is empty!");
                  setShowReceipt(true);
                }} 
                className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex flex-col items-center justify-center leading-none"
              >
                <span className="text-lg">PAY</span>
                <span className="text-xs font-medium opacity-80 mt-1">${grandTotal.toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Discount Modal */}
      <Modal isOpen={itemDiscountModal.isOpen} onClose={() => setItemDiscountModal({ ...itemDiscountModal, isOpen: false })} title="Item Discount">
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            <button 
              onClick={() => setItemDiscountModal({...itemDiscountModal, type: 'percent'})}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${itemDiscountModal.type === 'percent' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Percentage (%)
            </button>
            <button 
              onClick={() => setItemDiscountModal({...itemDiscountModal, type: 'fixed'})}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${itemDiscountModal.type === 'fixed' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Fixed Amount ($)
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Discount Value</label>
            <input 
              type="number" 
              value={itemDiscountModal.value} 
              onChange={e => setItemDiscountModal({...itemDiscountModal, value: e.target.value === '' ? '' : Number(e.target.value)})}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-3 outline-none border text-lg"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => {
               const newItems = [...orderItems];
               newItems[itemDiscountModal.itemIndex].discountType = 'none';
               newItems[itemDiscountModal.itemIndex].discountValue = 0;
               setOrderItems(newItems);
               setItemDiscountModal({ isOpen: false, itemIndex: -1, type: 'percent', value: '' });
            }} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Remove</button>
            <button onClick={() => setItemDiscountModal({ ...itemDiscountModal, isOpen: false })} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={applyItemDiscount} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm">Apply</button>
          </div>
        </div>
      </Modal>

      {/* Order Discount Modal */}
      <Modal isOpen={orderDiscountModal.isOpen} onClose={() => setOrderDiscountModal({ ...orderDiscountModal, isOpen: false })} title="Order Discount">
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            <button 
              onClick={() => setOrderDiscountModal({...orderDiscountModal, type: 'percent'})}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${orderDiscountModal.type === 'percent' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Percentage (%)
            </button>
            <button 
              onClick={() => setOrderDiscountModal({...orderDiscountModal, type: 'fixed'})}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${orderDiscountModal.type === 'fixed' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Fixed Amount ($)
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Discount Value</label>
            <input 
              type="number" 
              value={orderDiscountModal.value} 
              onChange={e => setOrderDiscountModal({...orderDiscountModal, value: e.target.value === '' ? '' : Number(e.target.value)})}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-3 outline-none border text-lg"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => {
               setOrderDiscount({ type: 'none', value: 0 });
               setOrderDiscountModal({ isOpen: false, type: 'percent', value: '' });
            }} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Remove</button>
            <button onClick={() => setOrderDiscountModal({ ...orderDiscountModal, isOpen: false })} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={applyOrderDiscount} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm">Apply</button>
          </div>
        </div>
      </Modal>

      {/* Manual Quantity Modal */}
      <Modal isOpen={qtyModal.isOpen} onClose={() => setQtyModal({ ...qtyModal, isOpen: false })} title="Set Quantity">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input 
              type="number" 
              step="any"
              value={qtyModal.value} 
              onChange={e => setQtyModal({...qtyModal, value: e.target.value})}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-3 outline-none border text-lg"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setQtyModal({ ...qtyModal, isOpen: false })} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={applyQty} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm">Set</button>
          </div>
        </div>
      </Modal>

      {/* Generic Notification Modal */}
      <Modal isOpen={!!modalMessage} onClose={() => setModalMessage('')} title="POS Notification">
        <div className="space-y-6">
          <p className="text-slate-700 font-medium text-lg text-center py-4">{modalMessage}</p>
          <div className="flex justify-end">
            <button onClick={() => {
              setModalMessage('');
              if (modalMessage.includes("Fired")) {
                setOrderItems([]);
                setOrderDiscount({ type: 'none', value: 0 });
              }
            }} className="w-full py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm">OK</button>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal 
          invoice={mockInvoice} 
          user={mockUser} 
          onClose={() => {
            setShowReceipt(false);
            setOrderItems([]);
            setOrderDiscount({ type: 'none', value: 0 });
          }} 
        />
      )}
    </div>
  );
}
