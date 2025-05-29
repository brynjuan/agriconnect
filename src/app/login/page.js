"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import Input from '@/components/form/Input/Input';
import AuthLayout from "../../components/layout/AuthLayout";
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button/Button';
import { signIn, getSession } from 'next-auth/react';

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Handle client-side initialization
  useEffect(() => {
    setMounted(true);
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
    
    // Check if there's a remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous API error
    setApiError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.status === true && data.data.token) {
        // Save auth token
        localStorage.setItem('token', data.data.token);
        
        // Save user info if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setApiError(error.message || 'An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign in...');
      
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      });
      
      console.log('Sign in result:', result);
      
      if (result?.error) {
        setApiError('Failed to sign in with Google');
        console.error('Google sign in error:', result.error);
      } else {
        // Get the session after successful sign in
        const session = await getSession();
        console.log('Session after sign in:', session);
        
        if (session?.accessToken) {
          localStorage.setItem('token', session.accessToken);
          console.log('Token stored in localStorage');
          router.push('/dashboard');
        } else {
          setApiError('Failed to get session after Google sign in');
          console.error('No access token in session');
        }
      }
    } catch (error) {
      setApiError('Failed to sign in with Google');
      console.error('Google sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything until mounted
  if (!mounted) {
    return null;
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
            <h1 className="text-2xl font-bold">Selamat Datang Kembali</h1>
            <p className="mt-2 text-accent-50/90">Masuk ke akun AgriConnect Anda</p>
          </CardHeader>
          
          {/* Login Form */}
          <CardContent>
            {apiError && (
              <div className="mb-6 p-4 border-l-4 border-accent-500 bg-accent-50 text-accent-700">
                <p className="text-sm">{apiError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
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
                autoComplete="current-password"
              />
              
              <div className="flex items-center justify-between mt-1 mb-6">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-accent-500 border-accent-200 rounded focus:ring-accent-400"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                    Ingat saya
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-accent-500 hover:text-accent-600">
                    Lupa kata sandi?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                outline
                fullWidth
                disabled={loading}
              >
                {loading ? 'Sedang masuk...' : 'Masuk'}
              </Button>
            </form>
            
            {/* Google OAuth */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-accent-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-800 font-medium">Atau masuk dengan</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="secondary"
                outline
                fullWidth
                className="mt-6"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <FaGoogle className="h-5 w-5 mr-3 text-accent-500" />
                Lanjutkan dengan Google
              </Button>
            </div>
          </CardContent>
          
          {/* Footer */}
          <CardFooter className="text-center">
            <p className="text-sm text-gray-800">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-accent-500 hover:text-accent-600 underline">
                Daftar Akun
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
