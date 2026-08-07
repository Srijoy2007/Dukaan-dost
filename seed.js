// seed.js
require('dotenv').config();
const { connectDB } = require('./config/database');
const { Merchant, Product, Customer } = require('./models');

const MERCHANT_PHONE = '916297026779'; // Your WhatsApp number WITH country code, no +

const seed = async () => {
  await connectDB();

  // 1. Create Merchant (YOU)
  const [merchant, created] = await Merchant.findOrCreate({
    where: { phoneNumber: MERCHANT_PHONE },
    defaults: {
      phoneNumber: MERCHANT_PHONE,
      businessPhoneNumber: process.env.WHATSAPP_PHONE_NUMBER_ID || MERCHANT_PHONE, // WABA number or same
      name: 'Ramesh Bhaiya',
      storeName: 'Ramesh Kirana Store',
      upiId: 'ramesh@upi',
      isActive: true
    }
  });
  console.log(created ? '✅ Merchant created' : 'ℹ️ Merchant already exists', merchant.id);

  // 2. Add products with CANONICAL names (must match nlpService.js exactly)
  const products = [
    { name: 'potato', nameHindi: 'आलू', price: 30, unit: 'kg', stockQuantity: 50, lowStockThreshold: 10 },
    { name: 'atta', nameHindi: 'आटा', price: 45, unit: 'kg', stockQuantity: 100, lowStockThreshold: 20 },
    { name: 'oil', nameHindi: 'तेल', price: 120, unit: 'litre', stockQuantity: 30, lowStockThreshold: 5 },
    { name: 'sugar', nameHindi: 'चीनी', price: 42, unit: 'kg', stockQuantity: 80, lowStockThreshold: 15 },
    { name: 'rice', nameHindi: 'चावल', price: 60, unit: 'kg', stockQuantity: 60, lowStockThreshold: 10 },
    { name: 'dal', nameHindi: 'दाल', price: 90, unit: 'kg', stockQuantity: 40, lowStockThreshold: 8 },
    { name: 'milk', nameHindi: 'दूध', price: 55, unit: 'litre', stockQuantity: 25, lowStockThreshold: 5 },
    { name: 'chips', nameHindi: 'चिप्स', price: 20, unit: 'piece', stockQuantity: 100, lowStockThreshold: 20, brand: 'Lays' },
    { name: 'onion', nameHindi: 'प्याज', price: 35, unit: 'kg', stockQuantity: 45, lowStockThreshold: 10 },
    { name: 'tomato', nameHindi: 'टमाटर', price: 25, unit: 'kg', stockQuantity: 35, lowStockThreshold: 8 },
    { name: 'salt', nameHindi: 'नमक', price: 20, unit: 'kg', stockQuantity: 100, lowStockThreshold: 20 },
    { name: 'tea', nameHindi: 'चाय', price: 80, unit: 'piece', stockQuantity: 50, lowStockThreshold: 10 },
    { name: 'egg', nameHindi: 'अंडा', price: 7, unit: 'piece', stockQuantity: 200, lowStockThreshold: 30 },
    { name: 'paneer', nameHindi: 'पनीर', price: 280, unit: 'kg', stockQuantity: 15, lowStockThreshold: 3 },
    { name: 'biscuit', nameHindi: 'बिस्कुट', price: 35, unit: 'piece', stockQuantity: 80, lowStockThreshold: 15 },
  ];

  for (const p of products) {
    await Product.findOrCreate({
      where: { name: p.name, merchantId: merchant.id },
      defaults: { ...p, merchantId: merchant.id, isActive: true }
    });
  }
  console.log(`✅ ${products.length} products seeded`);

  // 3. Create a test customer (your friend's number or your second number)
  // Replace with a real number you want to test from
  const testCustomerPhone = '919999999999'; // CHANGE THIS to your test customer number
  await Customer.findOrCreate({
    where: { phoneNumber: testCustomerPhone },
    defaults: {
      phoneNumber: testCustomerPhone,
      merchantId: merchant.id,
      name: 'Test Customer',
      totalOrders: 0,
      totalSpent: 0
    }
  });
  console.log('✅ Test customer created');

  console.log('\n🎉 Seed complete! You can now test:');
  console.log(`   Merchant: ${MERCHANT_PHONE}`);
  console.log(`   Test Customer: ${testCustomerPhone}`);
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
