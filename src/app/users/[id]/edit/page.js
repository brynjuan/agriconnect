"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaEnvelope, FaLock, FaPhone, FaUser, FaUserTag } from 'react-icons/fa';
import Input from '@/components/form/Input/Input';
import AppLayout from '@/components/layout/AppLayout';

export default function EditUser({ params }) {
  const userId = params.id;
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    role: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsClient(true);
    
    // Cek autentikasi
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Ambil data user
    fetchUserData(token);
  }, [router, userId]);

  const fetchUserData = async (token) => {
    try {
      setFetchLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengambil data pengguna');
      }

      if (data.status && data.data.user) {
        const userData = data.data.user;
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          password: '',
          confirm_password: '',
          phone: userData.phone || '',
          role: userData.role || 'user'
        });
        setOriginalData(userData);
      } else {
        throw new Error(data.message || 'Data pengguna tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setApiError(error.message || 'Terjadi kesalahan saat mengambil data pengguna');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error when user starts typing again
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validasi nama depan
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nama depan wajib diisi';
    }
    
    // Validasi nama belakang
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nama belakang wajib diisi';
    }
    
    // Validasi email
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // Validasi password (hanya jika diisi)
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Kata sandi minimal 8 karakter';
      }
      
      // Validasi konfirmasi password
      if (!formData.confirm_password) {
        newErrors.confirm_password = 'Konfirmasi kata sandi wajib diisi';
      } else if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Kata sandi tidak cocok';
      }
    }
    
    // Validasi telepon (opsional)
    if (formData.phone && !/^[0-9+\- ]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }
    
    // Validasi role
    if (!['admin', 'user'].includes(formData.role)) {
      newErrors.role = 'Peran harus admin atau user';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Hapus pesan
    setApiError('');
    setSuccessMessage('');
    
    // Validasi form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Siapkan data update - hanya field yang berubah
      const updateData = {};
      
      if (formData.first_name !== originalData.first_name) {
        updateData.first_name = formData.first_name;
      }
      
      if (formData.last_name !== originalData.last_name) {
        updateData.last_name = formData.last_name;
      }
      
      if (formData.email !== originalData.email) {
        updateData.email = formData.email;
      }
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      if (formData.phone !== originalData.phone) {
        updateData.phone = formData.phone;
      }
      
      if (formData.role !== originalData.role) {
        updateData.role = formData.role;
      }

      // Tidak ada perubahan
      if (Object.keys(updateData).length === 0) {
        setSuccessMessage('Tidak ada perubahan untuk disimpan');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal memperbarui pengguna');
      }

      if (data.status) {
        setSuccessMessage('Pengguna berhasil diperbarui!');
        
        // Reset field password
        setFormData(prev => ({
          ...prev,
          password: '',
          confirm_password: ''
        }));
        
        // Update original data
        if (data.data.user) {
          setOriginalData(data.data.user);
        }
        
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push('/users');
        }, 2000);
      } else {
        throw new Error(data.message || 'Gagal memperbarui pengguna');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setApiError(error.message || 'Terjadi kesalahan saat memperbarui pengguna');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder loading
  if (!isClient || fetchLoading) {
    return <div className="min-h-screen bg-stone-50 flex justify-center items-center">
      <div className="animate-pulse text-stone-600">Memuat data pengguna...</div>
    </div>;
  }

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/users" 
                className="inline-flex items-center text-stone-600 hover:text-stone-900"
              >
                <FaArrowLeft className="mr-2" /> Kembali
              </Link>
              <h1 className="text-2xl font-semibold text-stone-800">Edit Pengguna</h1>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="p-6">
              {/* Pesan sukses */}
              {successMessage && (
                <div className="mb-6 p-4 bg-stone-50 border-l-4 border-stone-600 text-stone-600">
                  <p className="text-sm">{successMessage}</p>
                </div>
              )}

              {/* Pesan error */}
              {apiError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <p className="text-sm">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Input 
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    label="Nama Depan"
                    placeholder="Budi"
                    required
                    icon={FaUser}
                    error={errors.first_name}
                    className="focus:border-stone-400 focus:ring-stone-400"
                  />
                  
                  <Input 
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    label="Nama Belakang"
                    placeholder="Santoso"
                    required
                    icon={FaUser}
                    error={errors.last_name}
                    className="focus:border-stone-400 focus:ring-stone-400"
                  />
                </div>

                <div className="mb-6">
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    label="Alamat Email"
                    placeholder="budi.santoso@email.com"
                    required
                    icon={FaEnvelope}
                    error={errors.email}
                    autoComplete="email"
                    className="focus:border-stone-400 focus:ring-stone-400"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Input 
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    label="Kata Sandi (biarkan kosong jika tidak ingin mengubah)"
                    placeholder="••••••••"
                    icon={FaLock}
                    error={errors.password}
                    autoComplete="new-password"
                    className="focus:border-stone-400 focus:ring-stone-400"
                  />
                  
                  <Input 
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    label="Konfirmasi Kata Sandi"
                    placeholder="••••••••"
                    icon={FaLock}
                    error={errors.confirm_password}
                    autoComplete="new-password"
                    disabled={!formData.password}
                    className="focus:border-stone-400 focus:ring-stone-400"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Input 
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    label="Nomor Telepon (Opsional)"
                    placeholder="+62 812-3456-7890"
                    icon={FaPhone}
                    error={errors.phone}
                    autoComplete="tel"
                    className="focus:border-stone-400 focus:ring-stone-400"
                  />
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-stone-700 mb-1">
                      Peran Pengguna
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserTag className="h-5 w-5 text-stone-400" />
                      </div>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 text-stone-900 text-sm"
                      >
                        <option value="user">Pengguna</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    {errors.role && (
                      <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Link 
                    href="/users" 
                    className="px-4 py-2 bg-white text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors duration-150"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors duration-150 ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}