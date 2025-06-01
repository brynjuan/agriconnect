"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaSearch, FaFilter, FaShoppingCart, FaSpinner, FaTimes, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import MainLayout from '../../components/layout/MainLayout';
import Button from '@/components/ui/Button/Button';

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: { min: 0, max: 1000 },
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch('http://localhost:5000/api/products');
        if (productsResponse.ok) {
          const data = await productsResponse.json();
          if (data.status && Array.isArray(data.products)) {
            setProducts(data.products);
          } else if (data.status && data.data && Array.isArray(data.data.products)) {
            setProducts(data.data.products);
          }
        }

        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:5000/api/categories');
        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json();
          if (data.status && Array.isArray(data.data)) {
            setCategories(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check authentication
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    fetchData();
    checkAuth();
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filters.category || 
                          (product.category?.name === filters.category) || 
                          (String(product.category_id) === filters.category);
    const productPrice = parseFloat(product.price);
    const minPrice = filters.priceRange.min ? parseFloat(filters.priceRange.min) * 1000 : null;
    const maxPrice = filters.priceRange.max ? parseFloat(filters.priceRange.max) * 1000 : null;
    const matchesPrice = (!minPrice || productPrice >= minPrice) && 
                        (!maxPrice || productPrice <= maxPrice);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low-high':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high-low':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      case 'newest':
      default:
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
  });

  // Add to cart function
  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsAddingToCart(prev => ({ ...prev, [productId]: true }));
    
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
          quantity: 1
        })
      });
      
      if (response.ok) {
        showNotification('Produk berhasil ditambahkan ke keranjang!', 'success');
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Gagal menambahkan produk ke keranjang', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Error menambahkan produk ke keranjang', 'error');
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const getImageUrl = (product) => {
    if (imageErrors[product.id]) {
      return '/placeholder.jpg';
    }
    return product.image ? `http://localhost:5000${product.image}` : '/placeholder.jpg';
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1716524875766-fdebfb275fd3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Latar belakang toko"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900/50"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Produk Segar Lokal
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Produk berkualitas langsung dari petani lokal
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/95 backdrop-blur-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 shadow-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua Produk
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-gray-50/50">
        <div className="container mx-auto px-4">
          {/* Filters and Sort */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 border border-gray-200 shadow-sm"
              >
                <FaFilter className="mr-2" />
                Filter
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).filter(f => f && (typeof f === 'string' ? f !== '' : true)).length}
                </span>
              </button>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="newest">Terbaru</option>
                <option value="price-low-high">Harga: Termurah</option>
                <option value="price-high-low">Harga: Termahal</option>
                <option value="name-a-z">Nama: A-Z</option>
                <option value="name-z-a">Nama: Z-A</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Harga</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name="min"
                      placeholder="Min"
                      value={filters.priceRange.min || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">sampai</span>
                    <input
                      type="number"
                      name="max"
                      placeholder="Max"
                      value={filters.priceRange.max || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      category: '',
                      priceRange: { min: 0, max: 1000 },
                      sortBy: 'newest'
                    })}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
              <p className="text-gray-600">Memuat produk...</p>
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedProducts.map(product => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="relative aspect-square">
                      <Image
                        src={getImageUrl(product)}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        onError={() => handleImageError(product.id)}
                        priority={false}
                        quality={75}
                      />
                      {product.category?.name && (
                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-md">
                          {product.category.name}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-2 space-y-2">
                      <div className="text-lg font-bold text-gray-900">
                        Rp{((parseFloat(product.price) / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        outline={!isAuthenticated}
                        onClick={() => isAuthenticated ? addToCart(product.id) : router.push('/login')}
                        disabled={isAddingToCart[product.id]}
                        className="w-full justify-center bg-blue-500 hover:bg-blue-600 text-white border-0"
                      >
                        {isAddingToCart[product.id] ? (
                          <>
                            <FaSpinner className="animate-spin w-4 h-4" />
                            <span className="ml-2">Menambahkan...</span>
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="w-4 h-4" />
                            <span className="ml-2">{isAuthenticated ? 'Tambah ke Keranjang' : 'Login untuk Membeli'}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Produk tidak ditemukan</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm ? `Tidak ada produk yang cocok dengan pencarian "${searchTerm}"` : 'Tidak ada produk yang tersedia dengan filter yang dipilih'}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    category: '',
                    priceRange: { min: 0, max: 1000 },
                    sortBy: 'newest'
                  });
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white text-base font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Hapus Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-4 px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'error' ? (
              <FaExclamationCircle className="text-xl" />
            ) : (
              <FaCheck className="text-xl" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
