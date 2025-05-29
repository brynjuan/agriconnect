"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaGoogle, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import Input from '@/components/form/Input/Input';
import Checkbox from '@/components/form/Checkbox/Checkbox';
import AuthLayout from "../../components/layout/AuthLayout";
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button/Button';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Check if already logged in
  useEffect(() => {
    setIsClient(true);
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validasi Nama Depan
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nama depan wajib diisi';
    }
    
    // Validasi Nama Belakang
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nama belakang wajib diisi';
    }
    
    // Validasi Email
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // Validasi Password
    if (!formData.password) {
      newErrors.password = 'Kata sandi wajib diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Kata sandi minimal 8 karakter';
    }
    
    // Validasi Konfirmasi Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi kata sandi wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Kata sandi tidak cocok';
    }
    
    // Validasi Persetujuan Syarat
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Anda harus menyetujui syarat dan ketentuan';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.status === true && data.data.token) {
        // Save auth token
        localStorage.setItem('token', data.data.token);
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setApiError(error.message || 'An error occurred during registration');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple render during server-side rendering
  if (!isClient) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-accent-600">AgriConnect</span>
          </Link>
        </div>
        
        <Card>
          {/* Header */}
          <CardHeader className="bg-accent-500 text-accent-50 text-center">
            <h1 className="text-2xl font-bold">Buat Akun</h1>
            <p className="mt-2 text-accent-50/90">Bergabunglah dengan AgriConnect untuk pengiriman hasil pertanian segar</p>
          </CardHeader>
          
          {/* Registration Form */}
          <CardContent>
            {apiError && (
              <div className="mb-6 p-4 border-l-4 border-accent-500 bg-accent-50 text-accent-700">
                <p className="text-sm">{apiError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <Input 
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  label="Nama Depan"
                  placeholder="Budi"
                  required
                  icon={FaUser}
                  error={errors.firstName}
                />
                
                <Input 
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  label="Nama Belakang"
                  placeholder="Santoso"
                  required
                  icon={FaUser}
                  error={errors.lastName}
                />
              </div>

              <Input 
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                label="Alamat Email"
                placeholder="email@anda.com"
                required
                icon={FaEnvelope}
                error={errors.email}
                autoComplete="email"
              />
              
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
              />
              {!errors.password && (
                <p className="-mt-2 mb-4 text-xs text-gray-700">Kata sandi minimal 8 karakter</p>
              )}
              
              <Input 
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                label="Konfirmasi Kata Sandi"
                placeholder="••••••••"
                required
                icon={FaLock}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
              
              <Checkbox
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
                error={errors.agreeTerms}
                className="mb-6"
                label={
                  <>
                    Saya setuju dengan{" "}
                    <Link href="/terms" className="text-accent-500 hover:text-accent-600">
                      Syarat Layanan
                    </Link>{" "}
                    dan{" "}
                    <Link href="/privacy" className="text-accent-500 hover:text-accent-600">
                      Kebijakan Privasi
                    </Link>
                  </>
                }
              />
              
              <Button
                type="submit"
                variant="secondary"
                outline
                fullWidth
                disabled={loading}
              >
                {loading ? 'Membuat Akun...' : 'Buat Akun'}
              </Button>
            </form>
            
            {/* Google OAuth */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-accent-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-800 font-medium">Atau daftar dengan</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="secondary"
                outline
                fullWidth
                className="mt-6"
              >
                <FaGoogle className="h-5 w-5 mr-3 text-accent-500" />
                Lanjutkan dengan Google
              </Button>
            </div>
          </CardContent>
          
          {/* Footer */}
          <CardFooter className="text-center">
            <p className="text-sm text-gray-800">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-medium text-accent-500 hover:text-accent-600 underline">
                Masuk
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-gray-800 text-sm">
          <p>&copy; {new Date().getFullYear()} AgriConnect. Hak cipta dilindungi undang-undang.</p>
        </div>
      </div>
    </AuthLayout>
  );
}
