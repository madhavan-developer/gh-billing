import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="flex bg-gray-100 min-h-screen font-sans">
            <Sidebar />
            <div className="flex-1 ml-72 p-8 overflow-y-auto w-full">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
