"use client";

import Button from '@/components/ui/Button/Button';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { FaShoppingCart, FaSignOutAlt, FaClock } from 'react-icons/fa';
import Image from 'next/image';

const MainLayout = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const cartDropdownRef = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

  // Handle click outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartDropdownRef]);

  const fetchCartData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      try {
        const response = await fetch('http://localhost:5000/api/carts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status && data.data) {
            setCartItems(data.data);
            
            // Calculate total
            const total = data.data.reduce((sum, item) => {
              return sum + (parseFloat(item.product?.price || 0) * item.quantity);
            }, 0);
            
            setCartTotal(total);
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    }
    setIsLoading(false);
  };

  // Check authentication and fetch cart data
  useEffect(() => {
    fetchCartData();
  }, []);

  // Listen for cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartData();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Handle remove item from cart
  const handleRemoveItem = async (cartItemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/carts/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Update local cart state
        const updatedCart = cartItems.filter(item => item.id !== cartItemId);
        setCartItems(updatedCart);
        
        // Recalculate total
        const total = updatedCart.reduce((sum, item) => {
          return sum + (parseFloat(item.product?.price || 0) * item.quantity);
        }, 0);
        
        setCartTotal(total);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  // Function to get image URL with fallback
  const getImageUrl = (product) => {
    if (imageErrors[product?.id] || !product?.image) {
      return '/placeholder.jpg';
    }
    return `http://localhost:5000${product.image}`;
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCartItems([]);
    setCartTotal(0);
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-stone-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative w-8 h-8 bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-700 group-hover:text-stone-900 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <span className="text-lg font-bold text-stone-800">
                  AgriConnect
                </span>
              </Link>

              {/* Main Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all duration-200 font-medium"
                >
                  Beranda
                </Link>
                <Link 
                  href="/shop" 
                  className="px-4 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all duration-200 font-medium"
                >
                  Belanja
                </Link>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Shopping Cart */}
              <div className="relative" ref={cartDropdownRef}>
                <button 
                  onClick={() => setIsCartOpen(!isCartOpen)} 
                  className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all duration-200"
                >
                  <FaShoppingCart className="w-5 h-5" />
                  {!isLoading && cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </button>
                
                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-lg overflow-hidden z-20 border border-stone-100 transform transition duration-200 ease-in-out">
                    <div className="py-3 px-4 bg-gradient-to-b from-white to-stone-50 border-b border-stone-100">
                      <h3 className="text-base font-semibold text-stone-800">Keranjang Belanja</h3>
                    </div>
                    
                    {isLoading ? (
                      <div className="p-6 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-stone-600"></div>
                        <p className="mt-2 text-sm text-stone-500">Memuat keranjang Anda...</p>
                      </div>
                    ) : isAuthenticated ? (
                      <>
                        <div className="max-h-80 overflow-y-auto">
                          {cartItems.length > 0 ? (
                            <ul className="divide-y divide-stone-100">
                              {cartItems.map((item) => (
                                <li key={item.id} className="flex p-4 hover:bg-stone-50 transition duration-150 ease-in-out">
                                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-stone-100">
                                    <Image 
                                      src={getImageUrl(item.product)}
                                      alt={item.product?.name || 'Product'} 
                                      width={80}
                                      height={80}
                                      className="h-full w-full object-cover object-center"
                                      onError={() => handleImageError(item.product?.id)}
                                    />
                                  </div>
                                  
                                  <div className="ml-4 flex flex-1 flex-col justify-between">
                                    <div>
                                      <div className="flex justify-between">
                                        <h3 className="text-sm font-medium text-stone-800 hover:text-green-700 transition line-clamp-2">
                                          <Link href={`/shop/${item.product_id}/product`}>
                                            {item.product?.name || 'Produk'}
                                          </Link>
                                        </h3>
                                        <p className="ml-4 text-sm font-medium text-green-700">
                                          Rp{((parseFloat(item.product?.price || 0) / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <p className="text-stone-500">Jumlah {item.quantity}</p>
                                      <button 
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-stone-400 hover:text-red-500 transition duration-150"
                                      >
                                        <FaShoppingCart size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="p-6 text-center">
                              <div className="mb-3 text-stone-400">
                                <FaShoppingCart size={24} className="mx-auto" />
                              </div>
                              <p className="text-stone-500">Keranjang Anda kosong</p>
                            </div>
                          )}
                        </div>
                        
                        {cartItems.length > 0 && (
                          <div className="p-4 bg-gradient-to-b from-white to-stone-50 border-t border-stone-100">
                            <div className="flex justify-between text-sm font-medium text-stone-800 mb-4">
                              <p>Subtotal</p>
                              <p>Rp{((cartTotal / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
                            </div>
                            <Link href="/cart" onClick={() => setIsCartOpen(false)}>
                              <Button variant="primary" fullWidth>
                                Lihat Keranjang
                              </Button>
                            </Link>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-6">
                        <div className="mb-4 text-center text-stone-400">
                          <FaShoppingCart size={24} className="mx-auto mb-2" />
                          <p className="text-sm text-stone-500">
                            Masuk untuk melihat keranjang Anda
                          </p>
                        </div>
                        <Link href="/login" onClick={() => setIsCartOpen(false)}>
                          <Button variant="secondary" fullWidth>
                            Masuk
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* My Orders Button - Only show when authenticated */}
              {isAuthenticated && (
                <Link
                  href="/my-orders"
                  className="flex items-center px-3 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200 text-sm font-medium"
                >
                  <FaClock className="w-4 h-4 mr-1.5" />
                  Pesanan
                </Link>
              )}

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200 text-sm font-medium"
                >
                  <FaSignOutAlt className="w-4 h-4 mr-1.5" />
                  Keluar
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center px-3 py-1.5 rounded-lg bg-stone-100 text-stone-900 hover:bg-stone-200 transition-all duration-200 text-sm font-medium"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-accent-400 mb-4">AgriConnect</h3>
              <p className="text-gray-300 mb-4">Hasil pertanian segar diantar ke pintu rumah Anda.</p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/bryn_juan" className="text-gray-400 hover:text-accent-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" /></svg>
                </a>
                <a href="https://www.instagram.com/bryn_juan" className="text-gray-400 hover:text-accent-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.059 10.059 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59l-.047-.02z" /></svg>
                </a>
                <a href="https://www.instagram.com/bryn_juan" className="text-gray-400 hover:text-accent-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-accent-400 mb-4">Tautan Cepat</h3>
              <ul className="text-gray-300 space-y-2">
                <li><Link href="/shop" className="hover:text-accent-400 transition">Semua Produk</Link></li>
                <li><Link href="/featured" className="hover:text-accent-400 transition">Produk Unggulan</Link></li>
                <li><Link href="/new" className="hover:text-accent-400 transition">Produk Terbaru</Link></li>
                <li><Link href="/sale" className="hover:text-accent-400 transition">Diskon</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold text-accent-400 mb-4">Layanan Pelanggan</h3>
              <ul className="text-gray-300 space-y-2">
                <li><Link href="/contact" className="hover:text-accent-400 transition">Hubungi Kami</Link></li>
                <li><Link href="/shipping" className="hover:text-accent-400 transition">Pengiriman & Pengembalian</Link></li>
                <li><Link href="/faq" className="hover:text-accent-400 transition">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-accent-400 transition">Kebijakan Privasi</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold text-accent-400 mb-4">Buletin</h3>
              <p className="text-gray-300 mb-4">Berlangganan untuk menerima info terbaru dan penawaran spesial.</p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="px-4 py-2 w-full bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent rounded-l"
                />
                <button
                  type="submit"
                  className="bg-accent-600 text-white px-4 py-2 rounded-r hover:bg-accent-500 transition"
                >
                  Berlangganan
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} AgriConnect. Hak cipta dilindungi undang-undang.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;