export const midtransConfig = {
  merchantId: process.env.NEXT_PUBLIC_MIDTRANS_MERCHANT_ID,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  currency: 'IDR',
  language: 'en',
  paymentMethods: [
    'gopay',
    'bank_transfer',
    'credit_card',
    'bca_va',
    'bni_va',
    'bri_va',
    'cimb_va',
    'permata_va',
    'danamon_va',
    'ovo',
    'dana',
    'linkaja',
    'shopeepay'
  ]
};