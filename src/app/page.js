"use client";

import Image from "next/image";
import Link from "next/link";
import MainLayout from "../components/layout/MainLayout";
import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "@/components/ui/Button/Button";
import { useRouter } from "next/navigation";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [imageErrors, setImageErrors] = useState({});
  const router = useRouter();

  // Function to get image URL with fallback
  const getImageUrl = (product) => {
    if (imageErrors[product.id] || !product?.image) {
      return '/placeholder.jpg';
    }
    return `http://localhost:5000${product.image}`;
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (response.ok) {
          const data = await response.json();
          if (data.status && data.data && data.data.products) {
            // Take first 4 products for featured section
            setFeaturedProducts(data.data.products.slice(0, 4));
          } else if (data.status && Array.isArray(data.data)) {
            // If data.data is directly an array
            setFeaturedProducts(data.data.slice(0, 4));
          } else {
            console.error('Unexpected data structure:', data);
            setFeaturedProducts([]);
          }
        } else {
          console.error('Failed to fetch products');
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Add to cart function
  const addToCart = async (productId) => {
    setIsAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('Silakan login untuk menambahkan barang ke keranjang');
        setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/carts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      });
      
      if (response.ok) {
        showNotification('Produk berhasil ditambahkan ke keranjang!');
        
        // Refresh cart by triggering a custom event that MainLayout will listen for
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Gagal menambahkan ke keranjang');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Error menambahkan ke keranjang');
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  // Use mock data if API failed or is loading
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : [];

  return (
    <MainLayout>
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-4 bg-green-700 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in">
          {notification.message}
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-stone-100 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1716524875766-fdebfb275fd3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // contoh gambar sawah
            alt="Sawah dan beras"
            fill
            className="object-cover object-center opacity-10"
            priority
            quality={90}
          />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                Hasil Pertanian Segar <br />
                <span className="text-green-700">Diantar ke Pintu Rumah Anda</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
                Belanja beras organik berkualitas dengan harga terjangkau.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="min-w-[160px]"
                  onClick={() => router.push('/shop')}
                >
                  Belanja Sekarang
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="min-w-[160px]"
                  onClick={() => router.push('/about')}
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
            
            {/* Featured Image */}
            <div className="flex-1 relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <Image
                  src="https://images.unsplash.com/photo-1614091066096-4c6521fbea3f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Keranjang beras organik"
                  fill
                  className="object-cover rounded-2xl shadow-2xl"
                  priority
                  quality={90}
                />
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-100 rounded-full -z-10"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-50 rounded-full -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-gradient-to-b from-white to-stone-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="text-stone-600 font-medium mb-4">Pilihan Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Produk Unggulan</h2>
            <div className="w-20 h-1 bg-stone-200 rounded-full mb-6"></div>
            <p className="text-stone-600 max-w-2xl text-center">
              Temukan pilihan produk premium kami yang dipilih langsung dari petani lokal terpercaya.
            </p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mb-4"></div>
              <p className="text-stone-600">Memuat produk terbaik...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 overflow-hidden"
                  >
                    <Link href={`/shop/${product.id}/product`} className="block relative">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={getImageUrl(product)}
                          alt={product.name}
                          fill
                          className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                          onError={() => handleImageError(product.id)}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          priority={false}
                          quality={90}
                        />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-stone-800 backdrop-blur-sm">
                          {typeof product.category === 'object' ? product.category?.name : product.category}
                        </span>
                      </div>
                    </Link>

                    <div className="p-6">
                      <Link href={`/shop/${product.id}/product`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-stone-700 transition-colors duration-200">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-stone-500">Harga</span>
                          <span className="text-xl font-semibold text-stone-900">
                            Rp{((parseFloat(product.price) / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          </span>
                        </div>
                        
                        <Button 
                          variant="secondary"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product.id);
                          }}
                          disabled={isAddingToCart[product.id]}
                          className="rounded-xl hover:bg-stone-100"
                        >
                          {isAddingToCart[product.id] ? (
                            <div className="h-5 w-5 border-2 border-stone-400 border-t-stone-600 rounded-full animate-spin"></div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-16">
                <Link
                  href="/shop"
                  className="inline-flex items-center px-6 py-3 rounded-xl text-stone-800 hover:text-stone-900 font-medium hover:bg-stone-100 transition-colors duration-200"
                >
                  Lihat Semua Produk
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1686820740687-426a7b9b2043?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Latar belakang sayuran segar"
            fill
            className="object-cover object-center"
            quality={90}
          />
          <div className="absolute inset-0 bg-stone-900/80"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full backdrop-blur-sm">
              Penawaran Spesial
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Dapatkan Diskon 10% untuk Pesanan Pertama Anda
            </h2>
            <p className="text-lg text-stone-200 mb-10">
              Berlangganan newsletter kami dan dapatkan penawaran eksklusif, resep, serta info panen terbaru.
            </p>

            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Masukkan alamat email Anda"
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm text-white placeholder-stone-300 border border-white/20 rounded-xl hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:bg-white/20"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="whitespace-nowrap bg-white hover:bg-stone-100 text-stone-900 border-0 rounded-xl px-8"
              >
                Berlangganan
              </Button>
            </form>

            <p className="mt-4 text-sm text-stone-400">
              Dengan berlangganan, Anda setuju menerima komunikasi pemasaran dari kami.
              <br />
              Tenang saja, kami tidak akan spam! 🌱
            </p>

            {/* Decorative Elements */}
            <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-stone-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -right-24 -top-24 w-64 h-64 bg-stone-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-stone-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute -left-24 top-24 w-96 h-96 bg-green-50 rounded-full mix-blend-multiply blur-3xl opacity-30"></div>
          <div className="absolute -right-24 bottom-24 w-96 h-96 bg-stone-50 rounded-full mix-blend-multiply blur-3xl opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-stone-600 font-medium mb-4 block">Mengapa Memilih Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Keunggulan AgriConnect</h2>
            <div className="w-20 h-1 bg-stone-200 rounded-full mx-auto mb-6"></div>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Rasakan perbedaan dengan komitmen kami terhadap kualitas, keberlanjutan, dan kepuasan pelanggan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fast Delivery */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
              <div className="relative">
                <div className="bg-stone-100 group-hover:bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stone-700 group-hover:text-green-600 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="absolute -right-2 -top-2">
                  <span className="flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-100"></span>
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-700 transition-colors duration-300">Pengiriman Cepat</h3>
              <p className="text-stone-600 leading-relaxed">
                Gratis ongkir untuk pembelian di atas Rp75000. Pengiriman cepat 24-48 jam, produk segar sampai di rumah Anda.
              </p>
            </div>

            {/* Organic & Fresh */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
              <div className="relative">
                <div className="bg-stone-100 group-hover:bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stone-700 group-hover:text-green-600 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="absolute -right-2 -top-2">
                  <span className="flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75 animation-delay-200"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-100"></span>
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-700 transition-colors duration-300">Organik & Segar</h3>
              <p className="text-stone-600 leading-relaxed">
                Semua produk bersertifikat organik dan dipanen setiap hari. Kami bekerja sama dengan petani lokal untuk memastikan kesegaran dan kualitas terbaik.
              </p>
            </div>

            {/* Secure Payment */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
              <div className="relative">
                <div className="bg-stone-100 group-hover:bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stone-700 group-hover:text-green-600 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div className="absolute -right-2 -top-2">
                  <span className="flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75 animation-delay-400"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-100"></span>
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-700 transition-colors duration-300">Pembayaran Aman</h3>
              <p className="text-stone-600 leading-relaxed">
                Belanja dengan nyaman menggunakan berbagai metode pembayaran aman dan proses checkout terenkripsi. Keamanan Anda prioritas kami.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
