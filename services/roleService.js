const { Op } = require('sequelize');
const { Merchant, Customer } = require('../models');

const normalizePhone = (phone) => {
  if (!phone) return '';
  // Remove ALL non-digits: spaces, +, -, ()
  return phone.replace(/\D/g, '');
};

const detectRole = async (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return { role: 'unknown', merchantId: null, user: null };
  
  const merchant = await Merchant.findOne({ 
    where: { phoneNumber: normalized } 
  });
  if (merchant) return { role: 'merchant', merchantId: merchant.id, user: merchant };
  
  const customer = await Customer.findOne({ 
    where: { phoneNumber: normalized } 
  });
  if (customer) return { role: 'customer', merchantId: customer.merchantId, user: customer };
  
  return { role: 'unknown', merchantId: null, user: null };
};

const getMerchantById = async (id) => {
  return await Merchant.findByPk(id);
};

const getMerchantByPhone = async (phone) => {
  return await Merchant.findOne({ where: { phoneNumber: normalizePhone(phone) } });
};

const getMerchantByBusinessPhone = async (businessPhone) => {
  const normalized = normalizePhone(businessPhone);
  return await Merchant.findOne({ 
    where: { 
      [Op.or]: [
        { businessPhoneNumber: normalized },
        { phoneNumber: normalized }
      ]
    } 
  });
};

module.exports = {
  detectRole,
  getMerchantById,
  getMerchantByPhone,
  getMerchantByBusinessPhone,
  normalizePhone
};
