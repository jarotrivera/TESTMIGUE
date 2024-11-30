const express = require('express');
const { searchAddress } = require('../controllers/proxyController'); // Importar solo la función

const router = express.Router();
router.get('/api/address', searchAddress); // Usar searchAddress directamente como callback

module.exports = router;