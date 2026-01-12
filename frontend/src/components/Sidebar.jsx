import React from 'react';
import { LayoutDashboard, Receipt, Package, Settings, LogOut, Aperture, History } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navItems = [
        { icon: Receipt, label: 'Billing', path: '/' },
        { icon: Package, label: 'Stock Management', path: '/stocks' },
        { icon: History, label: 'History', path: '/history' },
    ];

    return (
        <div className="w-72 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0 shadow-2xl z-50 print:hidden">
            <div className="p-8 flex items-center space-x-3 border-b border-gray-800">
                <img src="/GH-logo.png" alt="Logo" className="h-10 w-10 object-contain bg-white rounded-lg p-1" />
                <div>
                    <h1 className="text-lg font-bold tracking-tight leading-tight">GH Brother<br />Workshop</h1>
                </div>
            </div>

            <div className="p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pl-2">Menu</p>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 translate-x-1'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-white text-gray-500'} />
                                    <span className="font-medium">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all duration-200 group"
                >
                    <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
