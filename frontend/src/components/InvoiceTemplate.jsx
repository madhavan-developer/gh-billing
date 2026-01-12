import React from 'react';

const InvoiceTemplate = ({
    customerName,
    customerPhone,
    invoiceNumber,
    date,
    items,
    totalAmount
}) => {
    return (
        <div className="hidden print:flex flex-col absolute top-0 left-0 w-full min-h-screen bg-white z-[200] p-8">
            <div className="flex flex-col min-h-full justify-between">
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
                                <span className="font-medium text-gray-800 text-right">{new Date(date).toLocaleDateString('en-GB')}</span>
                            </div>
                            {invoiceNumber && (
                                <div className="flex items-center justify-end space-x-2 text-gray-500 mt-1">
                                    <span className="font-semibold">Invoice #:</span>
                                    <span className="font-medium text-gray-800">{invoiceNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="flex justify-between mb-8">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Billed To</p>
                            <h2 className="text-xl font-bold text-gray-800">{customerName}</h2>
                            <p className="text-gray-600">{customerPhone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Payable To</p>
                            <h2 className="text-xl font-bold text-gray-800">GH Brother workshop</h2>
                            <p className="text-gray-600">Pillayar Kovil Street, Mambattu</p>
                        </div>
                    </div>

                    {/* Scrollable Cart Items */}
                    <div className="flex-1 overflow-visible p-0 mb-8">
                        <table className="w-full text-left">
                            <thead className="bg-transparent border-b border-gray-200">
                                <tr>
                                    <th className="py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                    <th className="py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                    <th className="py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Price</th>
                                    <th className="py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-3">
                                            <div className="font-bold text-gray-800">{item.size}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">{item.variant}</div>
                                        </td>
                                        <td className="py-3 text-center text-gray-800 font-medium">
                                            {item.quantity}
                                        </td>
                                        <td className="py-3 text-right text-gray-800 font-medium">
                                            ₹{item.price}
                                        </td>
                                        <td className="py-3 text-right font-bold text-gray-800">₹{item.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer / Totals */}
                <div>
                    <div className="flex justify-between items-end pt-4 border-t-2 border-gray-800 mb-8">
                        <span className="text-gray-600 font-medium uppercase tracking-wider text-base">Grand Total</span>
                        <span className="text-5xl font-extrabold text-gray-900 tracking-tight">₹{totalAmount}</span>
                    </div>

                    {/* Print Footer */}
                    <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-8">
                        <div className="flex flex-col items-start">
                            <p className="text-sm text-gray-800 font-semibold mb-2">Scan & Pay</p>
                            <img src="/qr.jpeg" alt="Payment QR Code" className="w-32 h-32 object-contain border border-gray-200 rounded-lg" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium">Thank you for choosing GH Brother Workshop!</p>
                            <p className="mt-1 text-xs text-gray-400">Phone No: 9655108169</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
