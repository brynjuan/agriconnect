"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    FaBoxOpen,
    FaCalendarCheck,
    FaCreditCard,
    FaHeart,
    FaShoppingCart,
    FaTruck
} from 'react-icons/fa';
import AppLayout from '../../components/layout/AppLayout';

export default function Dashboard() {
  return (
    <AppLayout>
      {/* The AppLayout component now handles authentication checks */}
      {/* If user is not authenticated, AppLayout will redirect to login */}
      
      {/* Welcome Section - customized by props passed from AppLayout */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Selamat datang kembali!</h1>
        <p className="text-gray-600">Berikut adalah informasi terbaru tentang akun Anda hari ini.</p>
      </div>
    </AppLayout>
  );
}
