"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEdit, FaPlus, FaSearch, FaSort, FaSortDown, FaSortUp, FaTrash } from 'react-icons/fa';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import { FaShoppingCart } from 'react-icons/fa';

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: { min: 0, max: 1000 },
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Set isClient to true only after component is mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Separate useEffect for fetching data after we confirm we're on the client
  useEffect(() => {
    if (!isClient) return;
    
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchProducts();
  }, [isClient, currentPage, sortField, sortDirection, router]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      let url = `http://localhost:5000/api/products?page=${currentPage}&limit=10&sort=${sortField}&direction=${sortDirection}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status) {
        setProducts(data.data.products || []);
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.total_pages || 1);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(`Error: ${error.message}`);
      
      // For development, use mock data when API fails
      setProducts([
        { id: 1, name: 'Organic Tomatoes', price: 15000, stock: 50, category: { name: 'Vegetables' }, created_at: '2023-07-15T10:30:00Z' },
        { id: 2, name: 'Fresh Apples', price: 20000, stock: 100, category: { name: 'Fruits' }, created_at: '2023-07-14T10:30:00Z' },
        { id: 3, name: 'Organic Milk', price: 25000, stock: 30, category: { name: 'Dairy' }, created_at: '2023-07-13T10:30:00Z' }
      ]);
      setTotalPages(5);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchProducts();
  };

  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status) {
        // Remove the deleted product from the local state
        setProducts(products.filter(p => p.id !== productToDelete.id));
        closeDeleteModal();
      } else {
        throw new Error(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(`Error deleting product: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filters.category || product.category === filters.category;
    
    const matchesPrice = (!filters.priceRange.min || product.price >= filters.priceRange.min) && 
                         (!filters.priceRange.max || product.price <= filters.priceRange.max);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low-high':
        return a.price - b.price;
      case 'price-high-low':
        return b.price - a.price;
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  // Get unique categories from products
  const categories = [...new Set(products.map(product => product.category))].filter(Boolean);

  // Add to cart function
  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
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
        showNotification('Produk berhasil ditambahkan ke keranjang!');
        
        // Refresh cart by triggering a custom event that MainLayout will listen for
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Gagal menambahkan ke keranjang');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Error adding to cart');
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'min' || name === 'max') {
      setFilters(prev => ({
        ...prev,
        priceRange: {
          ...prev.priceRange,
          [name]: value ? Number(value) : null
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Simple placeholder during server-side rendering
  if (!isClient) {
    return <div className="min-h-screen bg-stone-50"></div>;
  }

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-stone-800">Manajemen Produk</h1>
            <Link href="/products/create">
              <Button variant="secondary" className="flex items-center gap-2 bg-white text-stone-900 border border-stone-200">
                <FaPlus size={16} />
                Tambah Produk
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="p-4">
              <form onSubmit={handleSearch} className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 h-10 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 focus:ring-stone-400"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                </div>
                <Button 
                  variant="secondary" 
                  type="submit"
                  className="h-10 px-6"
                >
                  Cari
                </Button>
              </form>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('name')}>
                        Produk {getSortIcon('name')}
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('category')}>
                        Kategori {getSortIcon('category')}
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('price')}>
                        Harga {getSortIcon('price')}
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('stock')}>
                        Stok {getSortIcon('stock')}
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('created_at')}>
                        Dibuat Pada {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-stone-500">
                        Memuat produk...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-stone-500">
                        Tidak ada produk ditemukan. {!searchTerm ? 'Klik "Tambah Produk" untuk membuat produk baru.' : 'Coba kata kunci pencarian lain.'}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-stone-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-lg bg-stone-100 flex items-center justify-center">
                              {product.image ? (
                                <Image
                                  src={`http://localhost:5000${product.image}`}
                                  alt={product.name}
                                  width={36}
                                  height={36}
                                  className="rounded-lg object-cover"
                                />
                              ) : (
                                <FaShoppingCart className="h-5 w-5 text-stone-400" />
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium text-stone-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-stone-100 text-stone-800`}>
                            {product.category?.name || 'Tanpa Kategori'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-base text-stone-900">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(product.price)}
                        </td>
                        <td className="px-6 py-4 text-base text-stone-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 text-base text-stone-900">
                          {new Date(product.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link href={`/products/${product.id}/edit`}>
                            <Button variant="secondary" size="sm" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                              <FaEdit size={14} />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => openDeleteModal(product)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm"
                          >
                            <FaTrash size={14} />
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-stone-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="text-sm text-stone-600">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} sampai {Math.min(currentPage * itemsPerPage, totalPages)} dari {totalPages} entri
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-stone-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaTrash className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-stone-900">Hapus Produk</h3>
                    <div className="mt-2">
                      <p className="text-sm text-stone-500">
                        Apakah Anda yakin ingin menghapus {productToDelete.name}? Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-stone-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  {deleteLoading ? 'Menghapus...' : 'Hapus'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={closeDeleteModal}
                  className="mt-3 sm:mt-0 w-full sm:w-auto"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
