const axios = require('axios');
const crypto = require('crypto');

const baseURL = process.env.KHIPU_API_BASE_URL;
const merchantId = process.env.KHIPU_MERCHANT_ID;
const secretKey = process.env.KHIPU_SECRET_KEY;

const khipuClient = axios.create({
  baseURL,
  auth: {
    username: merchantId,
    password: secretKey,
  },
});

module.exports = khipuClient;
