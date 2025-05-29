"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaEnvelope, FaLock, FaPhone, FaUser, FaUserTag } from 'react-icons/fa';
import Input from '@/components/form/Input/Input';
import AppLayout from '@/components/layout/AppLayout';

export default function CreateUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsClient(true);
    
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

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
    
    // Validasi password
    if (!formData.password) {
      newErrors.password = 'Kata sandi wajib diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Kata sandi minimal 8 karakter';
    }
    
    // Validasi konfirmasi password
    if (formData.password && !formData.confirm_password) {
      newErrors.confirm_password = 'Konfirmasi kata sandi wajib diisi';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Kata sandi tidak cocok';
    }
    
    // Validasi nomor telepon (opsional)
    if (formData.phone && !/^[0-9+\- ]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }
    
    // Validasi peran
    if (!['admin', 'user'].includes(formData.role)) {
      newErrors.role = 'Peran harus admin atau user';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear messages
    setApiError('');
    setSuccessMessage('');
    
    // Validate form
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

      // Prepare request payload
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      // Only include phone if provided
      if (formData.phone) {
        userData.phone = formData.phone;
      }

      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal membuat pengguna');
      }

      if (data.status) {
        setSuccessMessage('Pengguna berhasil dibuat!');
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirm_password: '',
          phone: '',
          role: 'user',
        });
        
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push('/users');
        }, 2000);
      } else {
        throw new Error(data.message || 'Gagal membuat pengguna');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setApiError(error.message || 'Terjadi kesalahan saat membuat pengguna');
    } finally {
      setLoading(false);
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
            <div className="flex items-center gap-4">
              <Link 
                href="/users" 
                className="inline-flex items-center text-stone-600 hover:text-stone-900"
              >
                <FaArrowLeft className="mr-2" /> Kembali
              </Link>
              <h1 className="text-2xl font-semibold text-stone-800">Tambah Pengguna Baru</h1>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="p-6">
              {/* Success message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-stone-50 border-l-4 border-stone-600 text-stone-600">
                  <p className="text-sm">{successMessage}</p>
                </div>
              )}

              {/* Error message */}
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
                    label="Kata Sandi"
                    placeholder="••••••••"
                    required
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
                    required
                    icon={FaLock}
                    error={errors.confirm_password}
                    autoComplete="new-password"
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
                    {loading ? 'Membuat...' : 'Buat Pengguna'}
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
