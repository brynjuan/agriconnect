"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function CreateCategory() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama kategori wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setApiError('');
    setSuccessMessage('');
    
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

      const response = await fetch('http://localhost:5000/api/product-categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Gagal membuat kategori: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status) {
        setSuccessMessage('Kategori berhasil dibuat!');
        setTimeout(() => {
          router.push('/product-categories');
        }, 2000);
      } else {
        throw new Error(data.message || 'Gagal membuat kategori');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setApiError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/product-categories" className="text-stone-600 hover:text-stone-800">
              <FaArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-semibold text-stone-800">Buat Kategori</h1>
          </div>

          <Card>
            <CardHeader title="Informasi Kategori" subtitle="Masukkan detail kategori" className="border-b border-stone-200" />
            
            <CardContent>
              {successMessage && (
                <div className="mb-6 p-4 border-l-4 border-stone-600 bg-stone-50 text-stone-600">
                  <p className="text-sm">Kategori berhasil dibuat!</p>
                </div>
              )}

              {apiError && (
                <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700">
                  <p className="text-sm">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                      Nama Kategori <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 border ${
                        errors.name ? 'border-red-500' : 'border-stone-200'
                      } rounded-lg text-base text-stone-900 focus:outline-none focus:ring-stone-400 focus:border-stone-400`}
                      placeholder="Masukkan nama kategori"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-stone-200 rounded-lg text-base text-stone-900 focus:outline-none focus:ring-stone-400 focus:border-stone-400"
                      placeholder="Masukkan deskripsi kategori (opsional)"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <Link href="/product-categories">
                    <button type="button" className="px-4 py-2 bg-white text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                      Batal
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Membuat...' : 'Buat Kategori'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
