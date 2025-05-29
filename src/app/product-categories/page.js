"use client";

import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaSearch, FaSort, FaSortDown, FaSortUp, FaTrash } from 'react-icons/fa';

export default function ProductCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    setIsClient(true);
    
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchCategories();
  }, [currentPage, sortField, sortDirection, searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Token tidak ditemukan, redirect ke login');
        router.push('/login');
        return;
      }
      
      // Build query parameters - persis seperti di users
      const params = new URLSearchParams({
        page: currentPage,
        sort: sortField,
        direction: sortDirection,
        ...(searchTerm && { search: searchTerm })
      });
      
      const url = `http://localhost:5000/api/product-categories?${params.toString()}`; 
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error text:', errorText);
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        if (data.status) {  
          // Fleksibel dalam menangani struktur data respon
          let categories;
          let pagination;
          
          if (data.data.productCategories) {
            // Struktur baru: data.data.productCategories
            categories = data.data.productCategories;
            pagination = data.data.pagination || {};
          } else if (Array.isArray(data.data)) {
            // Jika data.data adalah array langsung
            categories = data.data;
            pagination = { total_pages: 1 };
          } else if (data.data.rows) {
            // Mungkin backend mengembalikan format Sequelize findAndCountAll
            categories = data.data.rows;
            // Menghitung total_pages dari count
            const count = data.data.count || categories.length;
            const limit = itemsPerPage || 10;
            pagination = { 
              total_pages: Math.ceil(count / limit) || 1
            };
          } else {
            // Fallback - gunakan objek kosong
            categories = [];
            pagination = { total_pages: 1 };
            console.warn('Unexpected data structure from API:', data);
          }
          
          setCategories(categories);
          setTotalPages(pagination.total_pages || 1);
        } else {
          console.error('API returned status false:', data.message);
          throw new Error(data.message || 'Failed to fetch categories');
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError.message);
        throw fetchError;
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(`Failed to load categories: ${error.message}`);
      
      // Gunakan data mock seperti di halaman users
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCategories();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-stone-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-stone-600" /> : <FaSortDown className="text-stone-600" />;
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/product-categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      const data = await response.json();

      if (data.status) {
        // Remove from local state
        setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
        setIsDeleting(false);
        setCategoryToDelete(null);
      } else {
        throw new Error(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category. Please try again later.');
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setCategoryToDelete(null);
  };

  // Simple placeholder during server-side rendering
  if (!isClient) {
    return <div className="min-h-screen bg-stone-50"></div>;
  }

  // Use mock data if no categories are fetched yet
  const displayCategories = categories.length > 0 ? categories : [];

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-stone-800">Kategori Produk</h1>
            <Link href="/product-categories/create">
              <Button variant="secondary" className="flex items-center gap-2 bg-white text-stone-900 border border-stone-200">
                <FaPlus size={16} />
                Tambah Kategori
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
                    placeholder="Cari kategori..."
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

          {/* Categories Table */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('id')}>
                        ID {getSortIcon('id')}
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('name')}>
                        Nama {getSortIcon('name')}
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      Deskripsi
                    </th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
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
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-stone-500">
                        Memuat kategori...
                      </td>
                    </tr>
                  ) : displayCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-stone-500">
                        Tidak ada kategori ditemukan. {!searchTerm ? 'Klik "Tambah Kategori" untuk membuat.' : 'Coba kata kunci pencarian lain.'}
                      </td>
                    </tr>
                  ) : (
                    displayCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-stone-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-base text-stone-900">
                          {category.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-base font-medium text-stone-900">
                            {category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-base text-stone-500">
                          <div className="max-w-xs truncate">
                            {category.description || 'Tidak ada deskripsi'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-base text-stone-900">
                          {new Date(category.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link href={`/product-categories/${category.id}/edit`}>
                            <Button variant="secondary" size="sm" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                              <FaEdit size={14} />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => confirmDelete(category)}
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
      {isDeleting && categoryToDelete && (
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
                    <h3 className="text-lg leading-6 font-medium text-stone-900">Hapus Kategori</h3>
                    <div className="mt-2">
                      <p className="text-sm text-stone-500">
                        Apakah Anda yakin ingin menghapus {categoryToDelete.name}? Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-stone-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Hapus
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={cancelDelete}
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
