import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Printer, Check, ShoppingCart, User, Smartphone, Calendar, FileText } from 'lucide-react';
import api from '../lib/api';
import InvoiceTemplate from '../components/InvoiceTemplate';

const BillingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [showPrintConfirm, setShowPrintConfirm] = useState(false);
    const [editingId, setEditingId] = useState(null);


    const [billSaved, setBillSaved] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    };

    useEffect(() => {
        fetchStocks();
        if (location.state?.billToEdit) {
            const bill = location.state.billToEdit;
            setCustomerName(bill.customerName);
            setCustomerPhone(bill.customerPhone);
            setCart(bill.items);
            setEditingId(bill._id);
            setInvoiceNumber(bill.invoiceNumber); // Show existing invoice number
            if (bill.date) {
                setInvoiceDate(new Date(bill.date).toISOString().split('T')[0]);
            }
            // Clear location state so refresh doesn't keep us in edit mode forever
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    useEffect(() => {
        const filtered = stocks.filter(stock =>
            stock.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.variant.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStocks(filtered);
    }, [searchTerm, stocks]);

    const fetchStocks = async () => {
        try {
            const res = await api.get('/stocks');
            setStocks(res.data);
            setFilteredStocks(res.data);
        } catch (error) {
            console.error('Error fetching stocks', error);
        }
    };

    const addToCart = (stock) => {
        const existingItem = cart.find(item => item.stockId === stock._id);

        if (existingItem) {
            if (existingItem.quantity + 1 > stock.quantity) {
                showNotification(`Only ${stock.quantity} items available in stock!`);
                return;
            }
            setCart(cart.map(item =>
                item.stockId === stock._id
                    ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * item.price }
                    : item
            ));
        } else {
            setCart([...cart, {
                stockId: stock._id,
                size: stock.size,
                variant: stock.variant,
                price: stock.price,
                quantity: 1,
                amount: stock.price
            }]);
        }
    };

    const updateQuantity = (stockId, newQty) => {
        if (newQty < 1) return;

        const stockItem = stocks.find(s => s._id === stockId);
        if (stockItem && newQty > stockItem.quantity) {
            showNotification(`Only ${stockItem.quantity} items available in stock!`);
            return;
        }

        setCart(cart.map(item =>
            item.stockId === stockId
                ? { ...item, quantity: newQty, amount: newQty * item.price }
                : item
        ));
    };

    const updatePrice = (stockId, newPrice) => {
        const price = parseFloat(newPrice) || 0;
        setCart(cart.map(item =>
            item.stockId === stockId
                ? { ...item, price: price, amount: item.quantity * price }
                : item
        ));
    };

    const removeFromCart = (stockId) => {
        setCart(cart.filter(item => item.stockId !== stockId));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.amount, 0);
    };

    const handleSaveBill = () => {
        if (!customerName || cart.length === 0) {
            showNotification('Please enter customer name and add items', 'warning');
            return;
        }
        setShowPrintConfirm(true);
    };

    const executePrint = async () => {
        setShowPrintConfirm(false);
        try {
            const billData = {
                customerName,
                customerPhone,
                items: cart,
                totalAmount: calculateTotal(),
                date: invoiceDate
            };

            let res;
            if (editingId) {
                res = await api.put(`/bills/${editingId}`, billData);
                showNotification('Bill updated successfully!', 'success');
            } else {
                res = await api.post('/bills', billData);
                showNotification('Bill saved successfully!', 'success');
            }

            if (res.data && res.data.invoiceNumber) {
                setInvoiceNumber(res.data.invoiceNumber);
            } else if (editingId) {
                // Keep existing number if update didn't return one (it should though)
            }
            setBillSaved(true);

            setTimeout(() => {
                window.print();
            }, 500);
        } catch (error) {
            console.error(error);
            showNotification('Error saving bill');
        }
    };

    const handleNewBill = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setBillSaved(false);
        setInvoiceNumber('');
        setInvoiceNumber('');
        setEditingId(null);
        fetchStocks();
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden gap-8 max-w-7xl mx-auto relative">
            {/* Print Confirmation Popup */}
            {showPrintConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 transform transition-all scale-100 animate-scale-in">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-blue-50 p-4 rounded-full mb-4">
                                <Printer size={32} className="text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{editingId ? 'Confirm Update?' : 'Confirm Print?'}</h3>
                            <p className="text-gray-500 mb-8">
                                {editingId ? 'This will update the existing bill and stock.' : 'This will save the bill and open the print dialog.'} Are you sure you want to proceed?
                            </p>
                            <div className="flex space-x-3 w-full">
                                <button
                                    onClick={() => setShowPrintConfirm(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executePrint}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Yes, Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Popup */}
            {notification.show && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 transform translate-y-0 animate-slide-in print:hidden ${notification.type === 'success' ? 'bg-green-500 text-white' :
                    notification.type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {notification.type === 'success' && <Check size={20} />}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Left Panel: Stock Selection */}
            <div className="w-1/2 flex flex-col print:hidden space-y-6">
                <div>
                    <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">New Bill</h2>
                    <p className="text-gray-500 mt-2">Add items to the cart to generate a bill.</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={22} />
                    <input
                        type="text"
                        placeholder="Search frame size or variant..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {filteredStocks.map(stock => (
                        <div key={stock._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-blue-100 transition-all group">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{stock.size}</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase font-semibold">{stock.variant}</span>
                                    <span>•</span>
                                    <span>{stock.quantity} in stock</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-5">
                                <span className="font-bold text-xl text-gray-700">₹{stock.price}</span>
                                <button
                                    onClick={() => addToCart(stock)}
                                    disabled={stock.quantity === 0}
                                    className={`p-3 rounded-xl transition-all ${stock.quantity > 0
                                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Plus size={22} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Cart & Billing */}
            <div className="w-1/2 flex flex-col bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden print:overflow-visible print:w-full print:shadow-none print:border-none print:absolute print:top-0 print:left-0 print:z-50 print:bg-white print:min-h-screen print:h-auto">

                {/* Cart Interface Header */}
                <div className="p-6 bg-gray-50 border-b border-gray-100 print:hidden">
                    <div className="flex items-center space-x-3 text-gray-800 mb-6">
                        <ShoppingCart size={24} className="text-blue-600" />
                        <h3 className="text-xl font-bold">Current Order</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Customer Phone (Optional)"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                            />
                        </div>

                        {/* Date Picker for Cart Interface */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-600"
                                value={invoiceDate}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Scrollable Cart Items */}
                <div className="flex-1 overflow-y-auto print:overflow-visible p-0">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 print:bg-transparent border-b border-gray-200">
                            <tr>
                                <th className="py-4 px-6 print:px-8 text-sm font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="py-4 px-6 print:px-8 text-sm font-semibold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                <th className="py-4 px-6 print:px-8 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Price</th>
                                <th className="py-4 px-6 print:px-8 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                <th className="py-4 px-6 print:hidden w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 print:divide-gray-200">
                            {cart.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6 print:px-8">
                                        <div className="font-bold text-gray-800">{item.size}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">{item.variant}</div>
                                    </td>
                                    <td className="py-4 px-6 print:px-8 text-center">
                                        <div className="flex items-center justify-center space-x-3 print:hidden">
                                            <button onClick={() => updateQuantity(item.stockId, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors">-</button>
                                            <span className="font-medium w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.stockId, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors">+</button>
                                        </div>
                                        <span className="hidden print:block font-medium">{item.quantity}</span>
                                    </td>
                                    <td className="py-4 px-6 print:px-8 text-right text-gray-600">
                                        <div className="flex items-center justify-end space-x-1 print:hidden">
                                            <span className="text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                className="w-20 p-1 border-b border-gray-300 text-right focus:border-blue-500 focus:outline-none bg-transparent"
                                                value={item.price}
                                                onChange={(e) => updatePrice(item.stockId, e.target.value)}
                                            />
                                        </div>
                                        <span className="hidden print:block">₹{item.price}</span>
                                    </td>
                                    <td className="py-4 px-6 print:px-8 text-right font-bold text-gray-800">₹{item.amount}</td>
                                    <td className="py-4 px-6 print:hidden text-right">
                                        <button onClick={() => removeFromCart(item.stockId)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {cart.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400 print:hidden">
                                        Cart is empty
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Totals */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 print:bg-white print:border-t-2 print:border-gray-800 print:mt-auto">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-gray-500 font-medium uppercase tracking-wider text-sm print:text-base">Grand Total</span>
                        <span className="text-4xl font-extrabold text-gray-900 tracking-tight print:text-5xl">₹{calculateTotal()}</span>
                    </div>

                    <div className="flex space-x-4 print:hidden">
                        {billSaved ? (
                            <button
                                onClick={handleNewBill}
                                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex justify-center items-center space-x-2 shadow-lg shadow-green-500/30"
                            >
                                <Check size={20} />
                                <span>Start New Bill</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSaveBill}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/40 transition-all flex justify-center items-center space-x-2"
                            >
                                <Printer size={20} />
                                <span>{editingId ? 'Update & Print' : 'Print Invoice'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Invoice Print Template */}
                <InvoiceTemplate
                    customerName={customerName}
                    customerPhone={customerPhone}
                    invoiceNumber={invoiceNumber}
                    date={invoiceDate}
                    items={cart}
                    totalAmount={calculateTotal()}
                />
            </div>

        </div>
    );
};

export default BillingPage;
