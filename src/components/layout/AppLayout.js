"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FaBars,
    FaBell,
    FaBoxOpen,
    FaChevronDown,
    FaChartBar,
    FaUsers,
    FaLayerGroup,
    FaBox,
    FaClipboardList,
    FaSignOutAlt,
    FaTimes,
    FaUserCircle,
    FaLock,
    FaExclamationCircle
} from "react-icons/fa";

const AppLayout = ({ children }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Handle initial mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication after component mounts
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/');
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        
        if (data.status === true) {
          setUser(data.data);
          setIsAuthenticated(true);
          
          // Check if user is admin
          if (data.data.role !== 'admin') {
            router.push('/');
            return;
          }
          setIsAdmin(true);
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [mounted, router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  // Show loading state until component is mounted and authentication is checked
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-stone-300 border-r-stone-600"></div>
          <h2 className="mt-4 text-lg font-medium text-stone-600">Memuat...</h2>
        </div>
      </div>
    );
  }

  // Show unauthorized message for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="h-8 w-8 text-stone-400" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Akses Ditolak</h2>
          <p className="text-stone-600 mb-4">Anda tidak memiliki izin untuk mengakses area ini</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-stone-800 hover:bg-stone-900 transition-colors duration-200"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Main layout render
  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-100 shadow-sm transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-stone-100">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-8 h-8 bg-gradient-to-br from-stone-100 to-stone-50 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-600 group-hover:text-stone-800 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent">
              AgriConnect
            </span>
          </Link>
          <button 
            className="p-1.5 rounded-lg md:hidden hover:bg-stone-100 text-stone-600"
            onClick={toggleSidebar}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-3">
          <ul className="space-y-0.5">
            <li>
              <Link 
                href="/dashboard" 
                className="flex items-center px-3 py-2.5 text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 group"
              >
                <FaChartBar className="w-5 h-5 mr-3 text-stone-400 group-hover:text-stone-600" />
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/users" 
                className="flex items-center px-3 py-2.5 text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 group"
              >
                <FaUsers className="w-5 h-5 mr-3 text-stone-400 group-hover:text-stone-600" />
                <span className="font-medium">Pengguna</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/product-categories" 
                className="flex items-center px-3 py-2.5 text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 group"
              >
                <FaLayerGroup className="w-5 h-5 mr-3 text-stone-400 group-hover:text-stone-600" />
                <span className="font-medium">Kategori</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/products" 
                className="flex items-center px-3 py-2.5 text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 group"
              >
                <FaBox className="w-5 h-5 mr-3 text-stone-400 group-hover:text-stone-600" />
                <span className="font-medium">Produk</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/product-stock-logs" 
                className="flex items-center px-3 py-2.5 text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 group"
              >
                <FaClipboardList className="w-5 h-5 mr-3 text-stone-400 group-hover:text-stone-600" />
                <span className="font-medium">Manajemen Stok</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 w-full p-3 border-t border-stone-100">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 group"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3 text-stone-400 group-hover:text-stone-600" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-stone-100">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button 
                className="p-1.5 mr-4 text-stone-600 rounded-lg md:hidden hover:bg-stone-50"
                onClick={toggleSidebar}
              >
                <FaBars size={18} />
              </button>
              <h1 className="text-lg font-semibold text-stone-800">ADMIN</h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button className="p-1.5 text-stone-600 rounded-lg hover:bg-stone-50">
                  <FaBell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-1 text-stone-600 rounded-lg hover:bg-stone-50 p-1.5 pr-3"
                  onClick={toggleUserMenu}
                >
                  <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
                    <FaUserCircle size={20} className="text-stone-600" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user ? `${user.first_name} ${user.last_name}` : 'Pengguna'}</span>
                  <FaChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-stone-100">
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-hidden min-w-0">
          <div className="max-w-[2000px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
