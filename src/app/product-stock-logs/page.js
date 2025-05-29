"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEdit, FaPlus, FaSearch, FaSort, FaSortDown, FaSortUp, FaTrash } from 'react-icons/fa';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button/Button';

export default function ProductStockLogs() {
  const router = useRouter();
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [productId, setProductId] = useState('');
  const [logType, setLogType] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchProducts();
    fetchStockLogs();
  }, [currentPage, sortField, sortDirection, productId, logType]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/products?limit=100', {
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
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use mock data as fallback
      setProducts([
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
        { id: 3, name: 'Product 3' }
      ]);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchStockLogs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      let url = `http://localhost:5000/api/product-stock-logs?page=${currentPage}&limit=10&sort=${sortField}&direction=${sortDirection}`;
      
      if (productId) {
        url += `&product_id=${encodeURIComponent(productId)}`;
      }
      
      if (logType) {
        url += `&type=${encodeURIComponent(logType)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock logs: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status) {
        setStockLogs(data.data.stockLogs || []);
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.total_pages || 1);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch stock logs');
      }
    } catch (error) {
      console.error('Error fetching stock logs:', error);
      setError(`Error: ${error.message}`);
      
      // For development, use mock data when API fails
      setStockLogs([
        { id: 1, product: { name: 'Product 1' }, quantity: 10, type: 'in', created_at: '2023-07-15T10:30:00Z' },
        { id: 2, product: { name: 'Product 2' }, quantity: 5, type: 'out', created_at: '2023-07-14T10:30:00Z' },
        { id: 3, product: { name: 'Product 3' }, quantity: 15, type: 'in', created_at: '2023-07-13T10:30:00Z' }
      ]);
      setTotalPages(5);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStockLogs();
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-stone-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-stone-600" /> : <FaSortDown className="text-stone-600" />;
  };

  const openDeleteModal = (log) => {
    setLogToDelete(log);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setLogToDelete(null);
  };

  const confirmDelete = async () => {
    if (!logToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/product-stock-logs/${logToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ revertStock: true })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete stock log');
      }
      
      const data = await response.json();
      
      if (data.status) {
        setStockLogs(stockLogs.filter(log => log.id !== logToDelete.id));
        closeDeleteModal();
      } else {
        throw new Error(data.message || 'Failed to delete stock log');
      }
    } catch (error) {
      console.error('Error deleting stock log:', error);
      setError(`Error deleting stock log: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTypeClass = (type) => {
    return type === 'in' 
      ? 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800' 
      : 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800';
  };

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-stone-800">Manajemen Log Stok</h1>
            <Link href="/product-stock-logs/create">
              <Button variant="secondary" className="flex items-center gap-2 bg-white text-stone-900 border border-stone-200">
                <FaPlus size={16} />
                Tambah Log Stok
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="p-4">
              <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="product" className="block text-sm font-medium text-stone-700 mb-1">
                    Produk
                  </label>
                  <select
                    id="product"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 focus:ring-stone-400"
                    disabled={productsLoading}
                  >
                    <option value="">Semua Produk</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-stone-700 mb-1">
                    Tipe Log
                  </label>
                  <select
                    id="type"
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 focus:ring-stone-400"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="in">Stok Masuk</option>
                    <option value="out">Stok Keluar</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="secondary" 
                    type="submit"
                    className="w-full h-10"
                  >
                    <FaSearch className="mr-2" size={16} />
                    Cari
                  </Button>
                </div>
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

          {/* Stock Logs Table */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('product.name')}>
                        Produk {getSortIcon('product.name')}
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('quantity')}>
                        Jumlah {getSortIcon('quantity')}
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('type')}>
                        Tipe {getSortIcon('type')}
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('created_at')}>
                        Tanggal {getSortIcon('created_at')}
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
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-stone-500">
                        Memuat log stok...
                      </td>
                    </tr>
                  ) : stockLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-stone-500">
                        Tidak ada log stok ditemukan. {!productId && !logType ? 'Klik "Tambah Log Stok" untuk membuat.' : 'Coba filter lain.'}
                      </td>
                    </tr>
                  ) : (
                    stockLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="text-base font-medium text-stone-900">
                            {log.product?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-base text-stone-900">
                          {log.quantity}
                        </td>
                        <td className="px-6 py-4">
                          <span className={getTypeClass(log.type)}>
                            {log.type === 'in' ? 'Stok Masuk' : 'Stok Keluar'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-base text-stone-900">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link href={`/product-stock-logs/${log.id}/edit`}>
                            <Button variant="secondary" size="sm" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                              <FaEdit size={14} />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => openDeleteModal(log)}
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
                    Berikutnya
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && logToDelete && (
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
                    <h3 className="text-lg leading-6 font-medium text-stone-900">Hapus Log Stok</h3>
                    <div className="mt-2">
                      <p className="text-sm text-stone-500">
                        Apakah Anda yakin ingin menghapus log stok untuk {logToDelete.product?.name}? Tindakan ini akan mengembalikan perubahan stok.
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
