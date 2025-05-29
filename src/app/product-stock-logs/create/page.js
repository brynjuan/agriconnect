"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button/Button';

export default function CreateProductStockLog() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    type: 'in'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchProducts();
  }, []);

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
      setError(`Error: ${error.message}`);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/product-stock-logs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.status) {
        setSuccess('Stock log created successfully');
        setTimeout(() => {
          router.push('/product-stock-logs');
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to create stock log');
      }
    } catch (error) {
      console.error('Error creating stock log:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-white text-stone-900 border border-stone-200"
            >
              <FaArrowLeft size={16} />
              Kembali
            </Button>
            <h1 className="text-2xl font-semibold text-stone-800">Buat Log Stok</h1>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              {/* Success message */}
              {success && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">{success || "Log stok berhasil dibuat"}</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error || "Terjadi kesalahan"}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Selection */}
                <div>
                  <label htmlFor="product_id" className="block text-sm font-medium text-stone-700 mb-1">
                    Produk
                  </label>
                  <select
                    id="product_id"
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleChange}
                    className="w-full h-10 pl-3 pr-10 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 focus:ring-stone-400"
                    disabled={productsLoading}
                    required
                  >
                    <option value="">Pilih produk</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-stone-700 mb-1">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 focus:ring-stone-400"
                    min="1"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-stone-700 mb-1">
                    Tipe
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full h-10 pl-3 pr-10 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 focus:ring-stone-400"
                    required
                  >
                    <option value="in">Stok Masuk</option>
                    <option value="out">Stok Keluar</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="bg-white text-stone-900 border border-stone-200"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-stone-900 text-white hover:bg-stone-800"
                >
                  {saving ? 'Membuat...' : 'Buat Log Stok'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
