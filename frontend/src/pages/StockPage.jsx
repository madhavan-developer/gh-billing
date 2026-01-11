import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Package, Edit2, Check, Download } from 'lucide-react';
import api from '../lib/api';

const StockPage = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStock, setEditingStock] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [stockToDelete, setStockToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ size: '', variant: '', price: '', quantity: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const res = await api.get('/stocks');
            setStocks(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStock) {
                await api.put(`/stocks/${editingStock._id}`, formData);
                showNotification('Stock updated successfully', 'success');
            } else {
                await api.post('/stocks', formData);
                showNotification('Stock added successfully', 'success');
            }
            fetchStocks();
            handleCloseModal();
        } catch (error) {
            showNotification('Error saving stock');
        }
    };

    const handleDeleteClick = (stock) => {
        setStockToDelete(stock);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!stockToDelete) return;
        try {
            await api.delete(`/stocks/${stockToDelete._id}`);
            fetchStocks();
            setIsDeleteModalOpen(false);
            setStockToDelete(null);
            showNotification('Stock deleted successfully', 'success');
        } catch (error) {
            showNotification('Error deleting stock');
        }
    };

    const handleEditClick = (stock) => {
        setEditingStock(stock);
        setFormData({ size: stock.size, variant: stock.variant, price: stock.price, quantity: stock.quantity });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStock(null);
        setFormData({ size: '', variant: '', price: '', quantity: '' });
    };

    const filteredStocks = stocks.filter(stock =>
        stock.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.variant.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadCSV = () => {
        const headers = ['Size', 'Variant', 'Price', 'Quantity'];
        const csvRows = [headers.join(',')];

        filteredStocks.forEach(stock => {
            const row = [
                `"${stock.size}"`,
                `"${stock.variant}"`,
                stock.price,
                stock.quantity
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="max-w-7xl mx-auto relative">
            {/* Notification Popup */}
            {notification.show && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 transform translate-y-0 animate-slide-in ${notification.type === 'success' ? 'bg-green-500 text-white' :
                    notification.type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {notification.type === 'success' && <Check size={20} />}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">Inventory</h2>
                    <p className="text-gray-500 mt-2">Manage your frames, prices, and stock levels.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                    >
                        <Download size={20} />
                        <span>Download CSV</span>
                    </button>
                    <button
                        onClick={() => { setIsModalOpen(true); setEditingStock(null); setFormData({ size: '', variant: '', price: '', quantity: '' }); }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium"
                    >
                        <Plus size={20} />
                        <span>Add New Stock</span>
                    </button>
                </div>
            </div>

            {/* ... (Search Bar) ... */}

            {/* ... (Table) ... */}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{editingStock ? 'Edit Inventory' : 'Add Inventory'}</h3>
                                <p className="text-gray-500 text-sm mt-1">{editingStock ? 'Update existing stock details.' : 'Add a new frame variant to your database.'}</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ... (Form Inputs) ... */}

                            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                                >
                                    {editingStock ? 'Update Item' : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Search & Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Items</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stocks.length}</h3>
                    </div>
                </div>
                {/* Search Bar - Spanning 3 cols */}
                <div className="md:col-span-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="pl-4 text-gray-400">
                        <Search size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search stock by size or variant..."
                        className="w-full p-4 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Size</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Variant</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Price</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Quantity</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredStocks.map((stock) => (
                            <tr key={stock._id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                                <td className="p-6 font-medium text-gray-900">{stock.size}</td>
                                <td className="p-6 text-gray-600">{stock.variant}</td>
                                <td className="p-6 font-semibold text-green-600">₹{stock.price}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stock.quantity > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {stock.quantity} in stock
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <button onClick={() => handleEditClick(stock)} className="text-blue-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors mr-2">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(stock)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredStocks.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <Package size={48} className="mb-4 text-gray-300" />
                                        <p>No stock items found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100">
                        <div className="text-center">
                            <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
                                <Trash2 size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Item?</h3>
                            <p className="text-gray-500 mb-8">
                                Are you sure you want to delete <span className="font-bold text-gray-700">"{stockToDelete?.size} - {stockToDelete?.variant}"</span>? This action cannot be undone.
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-5 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-5 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{editingStock ? 'Edit Inventory' : 'Add Inventory'}</h3>
                                <p className="text-gray-500 text-sm mt-1">{editingStock ? 'Update details for this item.' : 'Add a new frame variant to your database.'}</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 4x6"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={formData.size}
                                        onChange={e => setFormData({ ...formData, size: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Variant</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Black"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={formData.variant}
                                        onChange={e => setFormData({ ...formData, variant: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                                >
                                    {editingStock ? 'Update Item' : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockPage;
