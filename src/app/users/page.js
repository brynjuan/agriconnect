"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEdit, FaPlus, FaSearch, FaSort, FaSortDown, FaSortUp, FaTrash, FaUserCog } from 'react-icons/fa';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button/Button';
import { FaUserCircle } from 'react-icons/fa';

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    setIsClient(true);
    fetchUsers();
  }, [currentPage, sortField, sortDirection, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        sort: sortField,
        direction: sortDirection,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`http://localhost:5000/api/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.status) {
        setUsers(data.data.users || []);
        setTotalPages(data.data.total_pages || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const data = await response.json();
      if (data.status) {
        // Remove deleted user from local state
        setUsers(users.filter(user => user.id !== userToDelete.id));
        setIsDeleting(false);
        setUserToDelete(null);
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again later.');
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setUserToDelete(null);
  };

  // Simple placeholder during server-side rendering
  if (!isClient) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-green-600" /> : <FaSortDown className="text-green-600" />;
  };

  // Use mock data if no users are fetched yet
  const displayUsers = users.length > 0 ? users : [];

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-stone-800">Manajemen Pengguna</h1>
            <Link href="/users/create">
              <Button variant="secondary" className="flex items-center gap-2 bg-white text-stone-900 border border-stone-200">
                <FaPlus size={16} />
                Tambah Pengguna
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
                    placeholder="Cari pengguna..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 h-10 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400"
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

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Nama</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Email</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Peran</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Tanggal Registrasi</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-stone-500">
                        Memuat pengguna...
                      </td>
                    </tr>
                  ) : displayUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-stone-500">
                        Tidak ada pengguna ditemukan.
                      </td>
                    </tr>
                  ) : (
                    displayUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-stone-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-lg bg-stone-100 flex items-center justify-center">
                              <FaUserCircle className="h-5 w-5 text-stone-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium text-stone-900">{user.first_name} {user.last_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-base text-stone-900">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'admin' ? 'bg-stone-200 text-stone-900' : 'bg-stone-100 text-stone-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'Pengguna'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-base text-stone-900">
                          {new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link href={`/users/${user.id}/edit`}>
                            <Button variant="secondary" size="sm" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                              <FaEdit size={14} />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => confirmDelete(user)}
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
                  Menampilkan {(currentPage - 1) * totalPages + 1} sampai {Math.min(currentPage * totalPages, totalPages)} dari {totalPages} entri
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
      {isDeleting && userToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaTrash className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Hapus Pengguna</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus {userToDelete.first_name} {userToDelete.last_name}? Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Hapus
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
