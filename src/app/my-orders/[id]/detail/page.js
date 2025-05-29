"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { FaArrowLeft, FaSpinner, FaCreditCard, FaBox, FaTruck } from "react-icons/fa";

export default function OrderDetailPage({ params }) {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/orders/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status && data.data) {
            setOrder(data.data);
          }
        } else {
          throw new Error('Failed to fetch order details');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchOrderDetail();
    }
  }, [params.id, router]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <FaTruck className="text-green-600" />;
      case 'pending_payment':
        return <FaCreditCard className="text-yellow-600" />;
      case 'cancelled':
        return <FaBox className="text-red-600" />;
      default:
        return <FaBox className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get image URL with fallback
  const getImageUrl = (product) => {
    if (imageErrors[product?.id] || !product?.image) {
      return '/placeholder.jpg';
    }
    return `http://localhost:5000${product.image}`;
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <FaSpinner className="animate-spin text-4xl text-green-600" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-2xl text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">
              Pesanan yang Anda cari tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.
            </p>
            <Link
              href="/my-orders"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              <FaArrowLeft className="mr-2" />
              Kembali ke Pesanan Saya
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/my-orders"
                className="inline-flex items-center text-green-600 hover:text-green-700"
              >
                <FaArrowLeft className="mr-2" />
                Kembali ke Pesanan Saya
              </Link>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pesanan #{order.id}
            </h1>
            <p className="text-gray-600">
              Dibuat pada {formatDate(order.created_at)}
            </p>
          </div>
        </div>
      </section>

      {/* Order Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Status Pesanan
                  </h3>
                  <p className="text-gray-600">
                    {order.status === 'paid'
                      ? 'Pesanan Anda telah dibayar dan sedang diproses'
                      : order.status === 'pending_payment'
                      ? 'Menunggu pembayaran'
                      : 'Pesanan telah dibatalkan'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Daftar Produk
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 flex items-start space-x-4"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={getImageUrl(item.product)}
                        alt={item.product?.name || 'Product'}
                        fill
                        className="object-cover rounded-lg"
                        onError={() => handleImageError(item.product?.id)}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900">
                        {item.product?.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Jumlah: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        Rp{((item.price * item.quantity / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ringkasan Pesanan
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rp{((order.total_amount / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkir</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>Rp{((order.total_amount / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
