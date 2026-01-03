const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const catalogPath = path.join(__dirname, '../files/product_catalog.json');
const businessPath = path.join(__dirname, '../files/businessTypes.json');
const interestPath = path.join(__dirname, '../files/interests.json');

// Loaders
const loadCatalog = () => {
  const rawData = fs.readFileSync(catalogPath);
  return JSON.parse(rawData);
};

const loadBusinessTypes = () => {
  const rawData = fs.readFileSync(businessPath);
  return JSON.parse(rawData);
};

const loadInterestTypes = () => {
  const rawData = fs.readFileSync(interestPath);
  return JSON.parse(rawData);
};

router.get('/product/types', (req, res) => {
  const data = loadCatalog();
  const labels = Object.keys(data).map(key => data[key].label);

  res.json({
    success: true,
    product_types: labels
  });
});

router.get('/interest/types', (req, res) => {
  const search = (req.query.search || "").toLowerCase();

  const dataAll = loadInterestTypes();

  const data = Object.keys(dataAll).map(key => ({
    type: key,
    label: dataAll[key].label
  }));

  if (!search) {
    return res.json({
      success: true,
      interests: data
    });
  }

  const filtered = data.filter(item =>
    item.type.toLowerCase().includes(search) ||
    item.label.toLowerCase().includes(search)
  );

  res.json({
    success: true,
    interests: filtered
  });
});

// ================= PRODUCT TAGS =================
router.get('/product/tags', (req, res) => {
  let { product_type } = req.query;

  if (!product_type) {
    return res.status(400).json({
      success: false,
      message: 'product_type is required'
    });
  }

  const data = loadCatalog();

  const normalizedType = product_type.toLowerCase().replace(/\s+/g, '_');

  if (!data[normalizedType]) {
    return res.status(404).json({
      success: false,
      message: 'Product type not found'
    });
  }

  res.json({
    success: true,
    product_type: normalizedType,
    label: data[normalizedType].label,
    tags: data[normalizedType].tags
  });
});

// ================= BUSINESS TYPES =================
router.get('/business/types', (req, res) => {
  const data = loadBusinessTypes();
  const labels = Object.values(data).map(item => item.label);

  res.json({
    success: true,
    business_types: labels
  });
});

module.exports = router;
