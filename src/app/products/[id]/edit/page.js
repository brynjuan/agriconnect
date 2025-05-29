"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function EditProduct({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use?.(params) || params;
  const productId = unwrappedParams.id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil produk');
      }

      const data = await response.json();

      if (data.status) {
        const product = data.data.product;
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          category_id: product.category_id,
          image: product.image || ''
        });
        if (product.image) {
          setImagePreview(`http://localhost:5000${product.image}`);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setApiError('Gagal mengambil detail produk');
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/product-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil kategori');
      }

      const data = await response.json();

      if (data.status) {
        let categoriesList = [];
        if (data.data.productCategories) {
          categoriesList = data.data.productCategories;
        } else if (Array.isArray(data.data)) {
          categoriesList = data.data;
        } else if (data.data.rows) {
          categoriesList = data.data.rows;
        }
        setCategories(categoriesList);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      if (name === 'price') {
        setFormData(prev => ({
          ...prev,
          [name]: value === '' ? '' : parseFloat(value) || 0
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value === '' ? '' : parseInt(value, 10) || 0
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setApiError('Ukuran gambar harus kurang dari 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setApiError('Silakan unggah file gambar');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setApiError('');
    }
  };

  const handleImageDelete = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama produk wajib diisi';
    }
    
    if (!formData.price && formData.price !== 0) {
      newErrors.price = 'Harga wajib diisi';
    } else if (parseFloat(formData.price) < 0) {
      newErrors.price = 'Harga tidak boleh negatif';
    }
    
    if (!formData.stock && formData.stock !== 0) {
      newErrors.stock = 'Stok wajib diisi';
    } else if (parseInt(formData.stock, 10) < 0) {
      newErrors.stock = 'Stok tidak boleh negatif';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Kategori wajib dipilih';
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

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('category_id', formData.category_id);
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error(`Gagal memperbarui produk: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status) {
        setSuccessMessage('Produk berhasil diperbarui!');
        setTimeout(() => {
          router.push('/products');
        }, 2000);
      } else {
        throw new Error(data.message || 'Gagal memperbarui produk');
      }
    } catch (error) {
      console.error('Error updating product:', error);
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
            <Link href="/products" className="text-stone-600 hover:text-stone-800">
              <FaArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-semibold text-stone-800">Edit Produk</h1>
          </div>

          <Card>
            <CardHeader title="Informasi Produk" subtitle="Perbarui detail produk" className="border-b border-stone-200" />
            
            <CardContent>
              {successMessage && (
                <div className="mb-6 p-4 border-l-4 border-stone-600 bg-stone-50 text-stone-600">
                  <p className="text-sm">{successMessage}</p>
                </div>
              )}

              {apiError && (
                <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700">
                  <p className="text-sm">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                      Nama Produk <span className="text-red-500">*</span>
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
                      placeholder="Masukkan nama produk"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-stone-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 border ${
                        errors.category_id ? 'border-red-500' : 'border-stone-200'
                      } rounded-lg text-base text-stone-900 focus:outline-none focus:ring-stone-400 focus:border-stone-400`}
                      disabled={categoriesLoading}
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="mt-2 text-sm text-red-600">{errors.category_id}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-stone-700 mb-1">
                      Harga (IDR) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-stone-500 sm:text-sm">Rp</span>
                      </div>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        min="0"
                        step="1000"
                        value={formData.price}
                        onChange={handleChange}
                        className={`block w-full pl-12 pr-4 py-2.5 border ${
                          errors.price ? 'border-red-500' : 'border-stone-200'
                        } rounded-lg text-base text-stone-900 focus:outline-none focus:ring-stone-400 focus:border-stone-400`}
                        placeholder="0"
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-2 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="col-span-2">
                    <label htmlFor="image" className="block text-sm font-medium text-stone-700 mb-1">
                      Gambar Produk
                    </label>
                    <div className="mt-1 flex flex-col items-center justify-center">
                      {imagePreview || formData.image ? (
                        <div className="w-full max-w-md mb-4">
                          <div className="relative aspect-square">
                            <Image
                              src={imagePreview || `http://localhost:5000${formData.image}`}
                              alt="Preview"
                              fill
                              className="rounded-lg object-contain"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <button
                              type="button"
                              onClick={handleImageDelete}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <div className="mt-4">
                            <label
                              htmlFor="image-upload"
                              className="flex justify-center px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 cursor-pointer transition-colors"
                            >
                              Ganti Gambar
                              <input
                                id="image-upload"
                                name="image"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-stone-200 border-dashed rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-8 h-8 mb-4 text-stone-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                              </svg>
                              <p className="mb-2 text-sm text-stone-500"><span className="font-semibold">Klik untuk unggah</span> atau seret dan lepas</p>
                              <p className="text-xs text-stone-500">PNG, JPG atau JPEG (MAKS. 5MB)</p>
                            </div>
                            <input
                              id="image"
                              name="image"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
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
                      placeholder="Masukkan deskripsi produk (opsional)"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <Link href="/products">
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
                    {loading ? 'Memperbarui...' : 'Perbarui Produk'}
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