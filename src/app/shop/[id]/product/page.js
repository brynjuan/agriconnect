"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaMinus, FaPlus, FaShoppingCart, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button/Button';

export default function ProductDetail({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use?.(params) || params;
  const productId = unwrappedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status && data.data.product) {
            setProduct(data.data.product);
          } else {
            throw new Error('Produk tidak ditemukan');
          }
        } else {
          throw new Error('Gagal mengambil produk');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        showNotification(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    fetchProduct();
    checkAuth();
  }, [productId]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(99, value));
    setQuantity(newQuantity);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/carts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      });
      
      if (response.ok) {
        showNotification('Produk berhasil ditambahkan ke keranjang!');
        
        // Refresh cart by triggering a custom event
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Gagal menambahkan ke keranjang', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Error menambahkan ke keranjang', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getImageUrl = () => {
    if (imageError || !product?.image) {
      return '/placeholder.jpg';
    }
    return `http://localhost:5000${product.image}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-t-2 border-b-2 border-green-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Memuat detail produk...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Produk Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-8">Produk yang Anda cari tidak ada atau telah dihapus.</p>
            <Link 
              href="/shop" 
              className="inline-flex items-center text-green-600 hover:text-green-700"
            >
              <FaArrowLeft className="mr-2" />
              Kembali ke Toko
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <style jsx global>{`
        /* Hide number input spinners */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-4 px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in ${
          notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {notification.message}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <Link href="/shop" className="text-gray-600 hover:text-gray-900">Toko</Link>
          <span className="mx-2 text-gray-400">/</span>
          {product.category && (
            <>
              <Link href={`/shop?category=${product.category.id}`} className="text-gray-600 hover:text-gray-900">
                {product.category.name}
              </Link>
              <span className="mx-2 text-gray-400">/</span>
            </>
          )}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={getImageUrl()}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={() => setImageError(true)}
              priority
              quality={85}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col h-full">
            {/* Top Section - Product Info */}
            <div className="flex-grow space-y-6">
              {product.category && (
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  Rp{((parseFloat(product.price) / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-green-600">{product.stock > 0 ? 'Tersedia' : 'Habis'}</span>
              </div>
            </div>

            {/* Bottom Section - Actions */}
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Jumlah:</span>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-300"
                  >
                    <FaMinus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-12 text-center py-2 focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 99 || quantity >= product.stock}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock} unit tersedia
                </span>
              </div>

              {/* Add to Cart Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={addToCart}
                disabled={isAddingToCart || product.stock === 0}
                className="w-full"
                outline={!isAuthenticated}
              >
                {isAddingToCart ? (
                  <>
                    <div className="h-5 w-5 border-t-2 border-b-2 border-current rounded-full animate-spin mr-2"></div>
                    Menambahkan ke Keranjang...
                  </>
                ) : (
                  <>
                    <FaShoppingCart className="w-5 h-5 mr-2" />
                    {isAuthenticated ? 'Tambahkan ke Keranjang' : 'Login untuk Membeli'}
                  </>
                )}
              </Button>

              {/* Shipping & Returns */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center">
                    <FaTruck className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-sm font-medium">Pengiriman Gratis</span>
                    <span className="text-xs text-gray-500">Di atas Rp500.000</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <FaShieldAlt className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-sm font-medium">Pembayaran Aman</span>
                    <span className="text-xs text-gray-500">100% Terlindungi</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <FaUndo className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-sm font-medium">Pengembalian Mudah</span>
                    <span className="text-xs text-gray-500">Dalam 24 jam</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
