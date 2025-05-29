"use client";

import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button/Button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaCreditCard, FaShieldAlt, FaShoppingBag, FaTrash, FaTruck } from "react-icons/fa";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

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

  // Fetch cart data
  useEffect(() => {
    const fetchCartData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/carts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status && data.data) {
            setCartItems(data.data);
            
            // Calculate total
            const total = data.data.reduce((sum, item) => {
              return sum + (parseFloat(item.product?.price || 0) * item.quantity);
            }, 0);
            
            setCartTotal(total);
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [router]);

  // Handle remove item from cart
  const handleRemoveItem = async (cartItemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/carts/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Update local cart state
        const updatedCart = cartItems.filter(item => item.id !== cartItemId);
        setCartItems(updatedCart);
        
        // Recalculate total
        const total = updatedCart.reduce((sum, item) => {
          return sum + (parseFloat(item.product?.price || 0) * item.quantity);
        }, 0);
        
        setCartTotal(total);

        // Trigger cart update event for MainLayout
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  // Handle proceed to checkout
  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      
      // Create order first
      const orderResponse = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      
      if (orderData.status && orderData.data) {
        // Create payment with Midtrans
        const paymentResponse = await fetch('http://localhost:5000/api/payments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            order_id: orderData.data.id
          })
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.message || 'Failed to create payment');
        }

        const paymentData = await paymentResponse.json();
        
        if (paymentData.status && paymentData.data?.payment_token) {
          // Wait for Midtrans script to be loaded
          if (typeof window.snap === 'undefined') {
            throw new Error('Payment service is not ready. Please try again.');
          }

          // Open Midtrans Snap popup
          window.snap.pay(paymentData.data.payment_token, {
            onSuccess: async function(result) {
              try {
                // Update payment status in our backend
                const updateResponse = await fetch('http://localhost:5000/api/payments/update-status', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    order_id: orderData.data.id,
                    transaction_status: result.transaction_status,
                    transaction_id: result.transaction_id
                  })
                });

                if (!updateResponse.ok) {
                  throw new Error('Failed to update payment status');
                }

                // Redirect to order detail page
                window.location.href = `/my-orders/${orderData.data.id}/detail`;
              } catch (error) {
                console.error('Error updating payment status:', error);
                alert('Payment successful but failed to update status. Please contact support.');
              }
            },
            onPending: async function(result) {
              try {
                // Update payment status in our backend
                await fetch('http://localhost:5000/api/payments/update-status', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    order_id: orderData.data.id,
                    transaction_status: result.transaction_status,
                    transaction_id: result.transaction_id
                  })
                });
              } catch (error) {
                console.error('Error updating payment status:', error);
              }
              // Redirect to order detail page
              window.location.href = `/orders/${orderData.data.id}`;
            },
            onError: async function(result) {
              try {
                // Update payment status in our backend
                await fetch('http://localhost:5000/api/payments/update-status', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    order_id: orderData.data.id,
                    transaction_status: 'deny',
                    transaction_id: result.transaction_id
                  })
                });
              } catch (error) {
                console.error('Error updating payment status:', error);
              }
              alert('Payment failed. Please try again.');
            },
            onClose: async function() {
              try {
                // Update payment status in our backend
                await fetch('http://localhost:5000/api/payments/update-status', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    order_id: orderData.data.id,
                    transaction_status: 'cancel',
                    transaction_id: null
                  })
                });
              } catch (error) {
                console.error('Error updating payment status:', error);
              }
              alert('You closed the payment window without completing the payment.');
            }
          });
        } else {
          throw new Error('No payment token received from payment service');
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert(error.message || 'An error occurred during checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-stone-100 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop"
            alt="Latar belakang keranjang belanja"
            fill
            className="object-cover object-center opacity-10"
            priority
            quality={90}
          />
          {/* Decorative Elements */}
          <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply blur-3xl opacity-30"></div>
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-stone-100 rounded-full mix-blend-multiply blur-3xl opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-green-700 text-sm font-medium mb-6">
              <FaShoppingBag className="mr-2" />
              {cartItems.length} {cartItems.length === 1 ? 'Barang' : 'Barang'} di Keranjang
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Keranjang Belanja Anda
            </h1>
            <p className="text-lg text-gray-600">
              Tinjau dan kelola barang yang Anda pilih sebelum melanjutkan ke pembayaran.
            </p>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16 bg-gradient-to-b from-white to-stone-50">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mb-4"></div>
              <p className="text-stone-600">Memuat keranjang Anda...</p>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                  <div className="p-6 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Barang di Keranjang ({cartItems.length})
                      </h2>
                      <Link 
                        href="/shop"
                        className="text-sm text-green-700 hover:text-green-800 flex items-center"
                      >
                        <FaArrowLeft className="mr-1" />
                        Lanjut Belanja
                      </Link>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-stone-100">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-6 flex items-start space-x-4 group hover:bg-stone-50 transition-colors duration-200">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={getImageUrl(item.product)}
                            alt={item.product?.name || 'Produk'}
                            fill
                            className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
                            onError={() => handleImageError(item.product?.id)}
                          />
                          <div className="absolute inset-0 bg-black/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                                {item.product?.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Jumlah: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                Rp{((parseFloat(item.product?.price || 0) * item.quantity / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                              </p>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-sm text-red-500 hover:text-red-600 mt-2 flex items-center"
                              >
                                <FaTrash className="mr-1" />
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sticky top-24">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Ringkasan Pesanan
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>Rp{((cartTotal / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Ongkir</span>
                      <span className="text-green-600 font-medium">Gratis</span>
                    </div>
                    <div className="border-t border-stone-100 pt-4">
                      <div className="flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total</span>
                        <span>Rp{((cartTotal / 1000).toFixed(3)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaTruck className="mr-2 text-green-600" />
                      <span>Gratis ongkir ke seluruh Indonesia</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaShieldAlt className="mr-2 text-green-600" />
                      <span>Pembayaran aman dengan Midtrans</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCreditCard className="mr-2 text-green-600" />
                      <span>Banyak metode pembayaran tersedia</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    className="mt-8"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Memproses...
                      </div>
                    ) : (
                      'Lanjut ke Pembayaran'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-16">
              <div className="mb-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
                  <FaShoppingBag className="absolute inset-0 flex items-center justify-center text-4xl text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Keranjang Anda kosong
              </h3>
              <p className="text-gray-500 mb-8">
                Sepertinya Anda belum menambahkan barang ke keranjang.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/shop')}
                className="min-w-[200px]"
              >
                Lanjut Belanja
              </Button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default CartPage;