"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import { FaBox, FaArrowRight, FaSpinner, FaShoppingBag, FaClock, FaCheck, FaTimes, FaFilter } from "react-icons/fa";
import Image from "next/image";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status && data.data) {
            setOrders(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <FaCheck className="text-green-600" />;
      case 'pending_payment':
        return <FaClock className="text-yellow-600" />;
      case 'cancelled':
        return <FaTimes className="text-red-600" />;
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

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const orderStats = {
    all: orders.length,
    paid: orders.filter(o => o.status === 'paid').length,
    pending_payment: orders.filter(o => o.status === 'pending_payment').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  return (
    <MainLayout>
      {/* Hero Section with Background Pattern */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop"
            alt="Latar belakang pesanan"
            fill
            className="object-cover object-center opacity-5"
            priority
            quality={90}
          />
          {/* Decorative Elements */}
          <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply blur-3xl opacity-30"></div>
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-stone-100 rounded-full mix-blend-multiply blur-3xl opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-green-700 text-sm font-medium mb-6">
              <FaShoppingBag className="mr-2" />
              {orders.length} {orders.length === 1 ? 'Pesanan' : 'Pesanan'} Total
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Riwayat Pesanan Saya
            </h1>
            <p className="text-lg text-gray-600">
              Lacak dan kelola semua pesanan Anda di satu tempat. Lihat detail pesanan, status, dan informasi pengiriman.
            </p>
          </div>
        </div>
      </section>

      {/* Order Filters */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-4 justify-center">
              {[
                { id: 'all', label: 'Semua Pesanan', count: orderStats.all },
                { id: 'paid', label: 'Selesai', count: orderStats.paid },
                { id: 'pending_payment', label: 'Menunggu Pembayaran', count: orderStats.pending_payment },
                { id: 'cancelled', label: 'Dibatalkan', count: orderStats.cancelled }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center px-6 py-3 rounded-full transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-green-600 text-white shadow-lg shadow-green-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{filter.label}</span>
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${
                    activeFilter === filter.id ? 'bg-green-700' : 'bg-gray-200'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Orders List */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FaSpinner className="animate-spin text-4xl text-green-600 mb-4" />
                <p className="text-gray-600">Memuat pesanan Anda...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pesanan #{order.id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-2">
                          {order.status === 'paid'
                            ? 'SELESAI'
                            : order.status === 'pending_payment'
                            ? 'MENUNGGU PEMBAYARAN'
                            : order.status === 'cancelled'
                            ? 'DIBATALKAN'
                            : order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-gray-600 mb-1">
                          Total:{" "}
                          <span className="font-semibold text-gray-900">
                            Rp{((order.total_amount / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items?.length || 0} {order.items?.length === 1 ? 'barang' : 'barang'}
                        </p>
                      </div>
                      <Link
                        href={`/my-orders/${order.id}/detail`}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200"
                      >
                        Lihat Detail
                        <FaArrowRight className="ml-2" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaBox className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeFilter === 'all' ? 'Belum Ada Pesanan' : `Tidak ada pesanan ${activeFilter === 'paid' ? 'selesai' : activeFilter === 'pending_payment' ? 'menunggu pembayaran' : activeFilter === 'cancelled' ? 'dibatalkan' : activeFilter.replace('_', ' ')}`}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {activeFilter === 'all' 
                    ? "Anda belum melakukan pesanan apapun. Mulai belanja untuk melihat pesanan Anda di sini."
                    : `Anda tidak memiliki pesanan dengan status "${activeFilter === 'paid' ? 'selesai' : activeFilter === 'pending_payment' ? 'menunggu pembayaran' : activeFilter === 'cancelled' ? 'dibatalkan' : activeFilter.replace('_', ' ')}".`}
                </p>
                {activeFilter === 'all' ? (
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-lg shadow-green-100"
                  >
                    <FaShoppingBag className="mr-2" />
                    Mulai Belanja
                  </Link>
                ) : (
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-medium rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <FaFilter className="mr-2" />
                    Tampilkan Semua Pesanan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
