import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, FileText, Calendar, User, ChevronLeft, ChevronRight, Printer, Trash2, Edit, MoreVertical, X, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../datepicker-custom.css';

const BillingHistoryPage = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuId && !event.target.closest('.action-menu-container')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        type: null, // 'delete' or 'edit'
        bill: null
    });

    const openConfirmModal = (type, bill) => {
        setConfirmModal({ show: true, type, bill });
        setOpenMenuId(null); // Close the action menu
    };

    const closeConfirmModal = () => {
        setConfirmModal({ show: false, type: null, bill: null });
    };

    const confirmAction = async () => {
        const { type, bill } = confirmModal;
        if (!bill) return;

        if (type === 'delete') {
            try {
                await api.delete(`/bills/${bill._id}`);
                fetchBills();
                closeConfirmModal();
            } catch (error) {
                console.error('Error deleting bill:', error);
                alert('Failed to delete bill');
            }
        } else if (type === 'edit') {
            navigate('/', { state: { billToEdit: bill } });
            closeConfirmModal();
        }
    };

    const handlePrint = (bill) => {
        setSelectedBill(bill);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const handleDelete = (bill) => {
        openConfirmModal('delete', bill);
    };

    const handleEdit = (bill) => {
        openConfirmModal('edit', bill);
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await api.get('/bills');
            setBills(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bills:', error);
            setLoading(false);
        }
    };

    // Custom Header for DatePicker
    const CustomHeader = ({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
    }) => (
        <div className="flex items-center justify-between px-2 py-2 mb-2">
            <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30">
                <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <div className="flex items-center space-x-2 font-bold text-gray-800">
                <span>{date.toLocaleString('default', { month: 'long' })}</span>
                <span>{date.getFullYear()}</span>
            </div>
            <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30">
                <ChevronRight size={18} className="text-gray-600" />
            </button>
        </div>
    );

    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.customerPhone.includes(searchTerm);

        const billDate = new Date(bill.date || bill.createdAt);

        let matchesDate = true;
        if (startDate) {
            matchesDate = matchesDate && billDate >= new Date(startDate);
        }
        if (endDate) {
            // Set end date to end of day to include the selected day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && billDate <= end;
        }

        return matchesSearch && matchesDate;
    });

    const downloadCSV = () => {
        const headers = ['Date', 'Customer Name', 'Customer Phone', 'Items', 'Total Amount'];
        const csvRows = [headers.join(',')];

        filteredBills.forEach(bill => {
            const date = new Date(bill.date || bill.createdAt).toLocaleDateString('en-GB');
            const items = bill.items.map(item => `${item.size} ${item.variant} (${item.quantity})`).join('; ');
            const row = [
                date,
                `"${bill.customerName}"`,
                `"${bill.customerPhone || ''}"`,
                `"${items}"`,
                bill.totalAmount
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `billing_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">Billing History</h2>
                    <p className="text-gray-500 mt-2">View and manage past transactions.</p>
                </div>
                <button
                    onClick={downloadCSV}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30 transition-all font-medium"
                >
                    <Download size={20} />
                    <span>Download CSV</span>
                </button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Bills Generated</p>
                        <h3 className="text-3xl font-extrabold text-gray-800">{bills.length}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-8">
                {/* Search Bar */}
                <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="pl-4 text-gray-400">
                        <Search size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by customer name or phone..."
                        className="w-full p-4 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Date Filters */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 px-6 z-20 relative" id="custom-datepicker-container">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-sm font-medium whitespace-nowrap">From:</span>
                        <div className="relative">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Start Date"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-32 cursor-pointer font-medium"
                                renderCustomHeader={CustomHeader}
                                dateFormat="dd/MM/yyyy"
                                calendarClassName="custom-calendar"
                                todayButton="Today"
                            />
                        </div>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-sm font-medium whitespace-nowrap">To:</span>
                        <div className="relative">
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                placeholderText="End Date"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-32 cursor-pointer font-medium"
                                renderCustomHeader={CustomHeader}
                                dateFormat="dd/MM/yyyy"
                                calendarClassName="custom-calendar"
                                todayButton="Today"
                            />
                        </div>
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(null); setEndDate(null); }}
                            className="ml-2 text-red-500 text-sm hover:underline font-medium"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Date</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Invoice No</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Customer</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Mobile Number</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Items</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Amount</th>
                            <th className="p-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredBills.map((bill) => (
                            <tr key={bill._id} className="hover:bg-blue-50/30 transition-colors duration-150">
                                <td className="p-6 text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>{new Date(bill.date || bill.createdAt).toLocaleDateString('en-GB')}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-gray-600 font-medium">
                                    {bill.invoiceNumber || '-'}
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{bill.customerName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className="text-gray-600 font-medium">{bill.customerPhone || 'N/A'}</span>
                                </td>
                                <td className="p-6">
                                    <div className="space-y-1">
                                        {bill.items.map((item, idx) => (
                                            <div key={idx} className="text-sm text-gray-600">
                                                <span className="font-medium">{item.size}</span>
                                                <span className="text-gray-400 mx-1">•</span>
                                                <span>{item.variant}</span>
                                                <span className="text-gray-400 mx-1">x</span>
                                                <span className="font-medium">{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <span className="font-bold text-lg text-gray-800">₹{bill.totalAmount}</span>
                                </td>
                                <td className="p-6 text-center relative action-menu-container">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === bill._id ? null : bill._id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {openMenuId === bill._id && (
                                        <div className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                                            <div className="flex flex-col py-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePrint(bill);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors w-full text-left"
                                                >
                                                    <Printer size={16} className="text-blue-500" />
                                                    <span className="font-medium text-sm">Print Invoice</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(bill);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors w-full text-left"
                                                >
                                                    <Edit size={16} className="text-yellow-500" />
                                                    <span className="font-medium text-sm">Edit Bill</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(bill);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors w-full text-left"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="font-medium text-sm">Delete Bill</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredBills.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <FileText size={48} className="mb-4 text-gray-300" />
                                        <p>No billing history found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Hidden Print Layout */}
            {
                selectedBill && (
                    <div className="hidden print:block fixed inset-0 bg-white z-[200] p-8">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                {/* Print Header */}
                                <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <img src="/GH-logo.png" alt="Logo" className="h-24 object-contain max-w-[200px]" />
                                        <div>
                                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">GH Brother Workshop</h1>
                                            <p className="text-sm text-gray-500 font-medium">Professional Photo Framing</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
                                        <div className="flex items-center justify-end space-x-2 text-gray-500">
                                            <span className="font-semibold">Date:</span>
                                            <span className="font-medium text-gray-800">{new Date(selectedBill.date || selectedBill.createdAt).toLocaleDateString('en-GB')}</span>
                                        </div>
                                        <div className="flex items-center justify-end space-x-2 text-gray-500 mt-1">
                                            <span className="font-semibold">Invoice #:</span>
                                            <span className="font-medium text-gray-800">{selectedBill.invoiceNumber || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer & Payable Details */}
                                <div className="flex justify-between mb-8">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Billed To</p>
                                        <h2 className="text-xl font-bold text-gray-800">{selectedBill.customerName}</h2>
                                        <p className="text-gray-600">{selectedBill.customerPhone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Payable To</p>
                                        <h2 className="text-xl font-bold text-gray-800">GH Brother workshop</h2>
                                        <p className="text-gray-600">Pillayar Kovil Street, Mambattu</p>
                                    </div>
                                </div>

                                {/* Items Table for Print */}
                                <table className="w-full text-left mb-8">
                                    <thead className="bg-transparent border-b border-gray-200">
                                        <tr>
                                            <th className="py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                            <th className="py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                            <th className="py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Price</th>
                                            <th className="py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedBill.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-3">
                                                    <div className="font-bold text-gray-800">{item.size}</div>
                                                    <div className="text-xs text-gray-500 uppercase tracking-wide">{item.variant}</div>
                                                </td>
                                                <td className="py-3 text-center text-gray-800 font-medium">{item.quantity}</td>
                                                <td className="py-3 text-right text-gray-800 font-medium">₹{item.price}</td>
                                                <td className="py-3 text-right font-bold text-gray-800">₹{item.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer */}
                            <div>
                                <div className="flex justify-between items-end pt-4 border-t-2 border-gray-800 mb-8">
                                    <span className="text-gray-600 font-medium uppercase tracking-wider text-base">Grand Total</span>
                                    <span className="text-5xl font-extrabold text-gray-900 tracking-tight">₹{selectedBill.totalAmount}</span>
                                </div>

                                <div className="text-center pt-8 border-t border-gray-100 mt-8">
                                    <div className="flex flex-col items-center justify-center mb-6">
                                        <p className="text-sm text-gray-800 font-semibold mb-2">Scan & Pay</p>
                                        <img src="/qr.jpeg" alt="Payment QR Code" className="w-32 h-32 object-contain border border-gray-200 rounded-lg" />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Thank you for choosing GH Brother Workshop!</p>
                                    <p className="mt-1 text-xs text-gray-400">Phone No: 9655108169</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                confirmModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in print:hidden">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                            <div className="p-8 text-center">
                                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${confirmModal.type === 'delete' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {confirmModal.type === 'delete' ? <Trash2 size={32} /> : <Edit size={32} />}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {confirmModal.type === 'delete' ? 'Delete Bill?' : 'Edit Bill?'}
                                </h3>
                                <p className="text-gray-500 mb-8">
                                    {confirmModal.type === 'delete'
                                        ? 'Are you sure you want to delete this bill? All items will be returned to stock. This action cannot be undone.'
                                        : 'Editing this bill will revert current quantities to stock and deduct new quantities once saved. Do you want to proceed?'
                                    }
                                </p>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={closeConfirmModal}
                                        className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmAction}
                                        className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg ${confirmModal.type === 'delete'
                                            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                            }`}
                                    >
                                        {confirmModal.type === 'delete' ? 'Yes, Delete' : 'Yes, Edit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default BillingHistoryPage;
