const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();


const catalogPath = path.join(__dirname, '../files/product_catalog.json');

const businessPath = path.join(__dirname, '../files/businessTypes.json');

const loadBusinessTypes = () => {
  const rawData = fs.readFileSync(businessPath);
  return JSON.parse(rawData);
};

const loadCatalog = () => {
  const rawData = fs.readFileSync(catalogPath);
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


router.get('/product/tags', (req, res) => {
  let { product_type } = req.query;

  console.log("/product/tags are ----- ", product_type);

  if (!product_type) {
    return res.status(400).json({
      success: false,
      message: 'product_type is required'
    });
  }

  const data = loadCatalog();

  // normalize input (Electronics → electronics)
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

router.get('/business/types', (req, res) => {
  const data = loadBusinessTypes();
  const labels = Object.values(data).map(item => item.label);
  res.json(labels);
});


module.exports = router;