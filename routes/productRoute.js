const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const LikeCollection = require("../models/Like");
const SellerCollection = require("../models/Seller");
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const Saved = require("../models/Saved");
const FollowedCollection = require("../models/Followed");


router.post("/create", async (req, res) => {
  try {
    const productData = req.body;
    const product = new Product({
      ...productData,
      vector: null
    });
    const savedProduct = await product.save();
    res.status(200).json({
      status: "success",
      product_id: savedProduct._id,
    });
    (async () => {
      try {
        const textForEmbedding = [
          productData?.title && `title is ${productData?.title}`,
          productData?.description && `description is ${productData?.description}`,
          productData?.productType && `product type is ${productData?.productType}`,
          productData?.price && `product price is ${productData?.price}`,
          productData?.tags && `product tags are ${productData?.tags.join(", ")}`,
          productData?.sellerName && `seller name is ${productData?.sellerName}`,
          productData?.sellerCity && `seller city is ${productData?.sellerCity}`,
          productData?.sellerState && `seller state is ${productData?.sellerState}`
        ].filter(Boolean).join(' ');
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: textForEmbedding
        });
        const vector = embeddingResponse.data[0].embedding;
        await Product.findByIdAndUpdate(savedProduct._id, { vector });
      } catch (err) {
        console.log("error is ", "++++++++ ", err)
      }
    })();
  } catch (error) {
    console.log("product logs ------ 4", error.message)
    res.status(500).json({ status: "error", message: error.message });
  }
});


router.put("/edit/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }

    const vectorFields = ["title", "description", "productType", "price", "tags"];
    const isVectorChanged = vectorFields.some(
      field => updatedData[field] && updatedData[field] !== existingProduct[field]?.toString()
    );

    Object.assign(existingProduct, updatedData);

    if (isVectorChanged) {
      const textForEmbedding = [
        existingProduct?.title && `title is ${existingProduct.title}`,
        existingProduct?.description && `description is ${existingProduct.description}`,
        existingProduct?.productType && `product type is ${existingProduct.productType}`,
        existingProduct?.price && `product price is ${existingProduct.price}`,
        existingProduct?.tags && `product tags are ${existingProduct.tags.join(", ")}`,
        existingProduct?.sellerName && `seller name is ${existingProduct.sellerName}`,
        existingProduct?.sellerCity && `seller city is ${existingProduct.sellerCity}`,
        existingProduct?.sellerState && `seller state is ${existingProduct.sellerState}`
      ].filter(Boolean).join(" ");

      try {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: textForEmbedding
        });
        existingProduct.vector = embeddingResponse.data[0].embedding;
      } catch (err) {
        console.log("Error generating new embedding: ", err);
      }
    }

    const savedProduct = await existingProduct.save();
    const productWithoutVector = savedProduct.toObject();
    delete productWithoutVector.vector;

    res.status(200).json({
      status: "success",
      product: productWithoutVector
    });
  } catch (error) {
    console.error("Error editing product: ", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});


function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

router.get("/search/products", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ status: "error", message: "Query text is required" });
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query
    });
    const queryVector = embeddingResponse.data[0].embedding;
    const products = await Product.find({ vector: { $exists: true } });
    const productsWithScore = products.map(p => ({
      product: p,
      score: cosineSimilarity(queryVector, p.vector)
    }));
    productsWithScore.sort((a, b) => b.score - a.score);
    const topProducts = productsWithScore.slice(0, 9).map(p => ({
      title: p.product.title,
      description: p.product.description,
      images: p.product.images || [],
      score: p.score
    }));

    res.status(200).json({ status: "success", products: topProducts });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/like", async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    if (!user_id || !product_id) {
      return res.status(400).json({
        status: "error",
        message: "user_id and product_id required",
      });
    }

    const existingLike = await LikeCollection.findOne({ user_id, product_id });
    if (existingLike) {
      await LikeCollection.deleteOne({ _id: existingLike._id });
      await Product.findByIdAndUpdate(product_id, { $inc: { likeCount: -1 } });
      return res.status(200).json({
        status: "success",
        message: "Product unliked",
      });
    } else {
      const like = new LikeCollection({ user_id, product_id });
      await like.save();
      await Product.findByIdAndUpdate(product_id, { $inc: { likeCount: 1 } });

      (async () => {
        try {
          const product = await Product.findById(product_id);
          if (!product) return;

          const description = `Title: ${product.title || ""}
          Description: ${product.description || ""}
          Category: ${product.category || ""}
          Tags: ${(product.tags || []).join(", ")}`;

          const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: description,
          });

          const productVector = embeddingResponse.data[0].embedding;
          const user = await User.findById(user_id);

          if (user) {
            let updatedVector = productVector;

            if (Array.isArray(user.vector) && user.vector.length === productVector.length) {
              const weightUser = 0.7;
              const weightProduct = 0.3;
              updatedVector = user.vector.map((val, idx) => {
                const userVal = isNaN(val) ? 0 : val;
                const productVal = isNaN(productVector[idx]) ? 0 : productVector[idx];
                return (userVal * weightUser + productVal * weightProduct);
              });
            } else {
              updatedVector = productVector.map(v => (isNaN(v) ? 0 : v));
            }

            await User.findByIdAndUpdate(user_id, { vector: updatedVector });
          }
        } catch (err) {
          console.error("Vector update failed:", err.message);
        }
      })();

      return res.status(200).json({
        status: "success",
        message: "Product liked",
      });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.get("/all/products/for/customer", async (req, res) => {
  try {
    const { customerUserId: user_id, page = 1, limit = 5, search_text } = req.query;

    if (!user_id) {
      return res.status(400).json({ status: "error", message: "user_id is required" });
    }

    const user = await User.findById(user_id);
    if (!user || !user.vector) {
      return res.status(404).json({ status: "error", message: "User vector not found" });
    }

    let filter = { vector: { $exists: true } };
    if (search_text && search_text.trim() !== "") {
      filter.$or = [
        { name: { $regex: search_text, $options: "i" } },
        { description: { $regex: search_text, $options: "i" } }
      ];
    }

    const products = await Product.find(filter);

    const productsWithScore = products.map(p => ({
      product: p,
      score: cosineSimilarity(user.vector, p.vector)
    }));

    productsWithScore.sort((a, b) => b.score - a.score);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);

    const paginatedProducts = productsWithScore.slice(startIndex, endIndex).map(p => {
      const productObj = p.product.toObject ? p.product.toObject() : p.product;
      delete productObj.vector;
      return productObj;
    });

    const likedDocs = await LikeCollection.find({
      user_id,
      product_id: { $in: paginatedProducts.map(p => p._id) }
    }).select("product_id");

    const savedDocs = await Saved.find({
      user_id,
      product_id: { $in: paginatedProducts.map(p => p._id) }
    }).select("product_id");

    const likedProductIds = new Set(likedDocs.map(doc => doc.product_id.toString()));
    const savedProductIds = new Set(savedDocs.map(doc => doc.product_id.toString()));

    const finalProducts = await Promise.all(
      paginatedProducts.map(async (p) => {
        let seller_id = p.sellerId
        const isFollowing = await FollowedCollection.exists({
          user_id,
          seller_id
        });
        const sellerDetail = await SellerCollection.findById(seller_id);
        return {
          ...p,
          liked_me: likedProductIds.has(p._id.toString()),
          saved: savedProductIds.has(p._id.toString()),
          followed: !!isFollowing,
          sellerProfile: sellerDetail.profile_picture ?? ''
        };
      })
    );

    res.status(200).json({
      status: "success",
      page: parseInt(page),
      limit: parseInt(limit),
      total_products: productsWithScore.length,
      products: finalProducts
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


router.post("/save", async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    if (!user_id || !product_id) {
      return res.status(400).json({
        status: "error",
        message: "user_id and product_id required",
      });
    }
    const existingSave = await Saved.findOne({ user_id, product_id });
    if (existingSave) {
      await Saved.deleteOne({ _id: existingSave._id });
      return res.status(200).json({
        status: "success",
        message: "Product unsaved",
      });
    } else {
      const save = new Saved({ user_id, product_id });
      await save.save();
      (async () => {
        try {
          const product = await Product.findById(product_id);
          if (!product) return;
          const description = `Title: ${product.title || ""}
          Description: ${product.description || ""}
          Category: ${product.category || ""}
          Tags: ${(product.tags || []).join(", ")}`;
          const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: description,
          });
          const productVector = embeddingResponse.data[0].embedding;
          const user = await User.findById(user_id);
          if (user) {
            let updatedVector = productVector;
            if (Array.isArray(user.vector) && user.vector.length === productVector.length) {
              const weightUser = 0.85;
              const weightProduct = 0.15;
              updatedVector = user.vector.map((val, idx) => {
                const userVal = isNaN(val) ? 0 : val;
                const productVal = isNaN(productVector[idx]) ? 0 : productVector[idx];
                return (userVal * weightUser + productVal * weightProduct);
              });
            } else {
              updatedVector = productVector.map(v => (isNaN(v) ? 0 : v));
            }
            await User.findByIdAndUpdate(user_id, { vector: updatedVector });
          }
        } catch (err) {
          console.error("Vector update failed (save):", err.message);
        }
      })();

      return res.status(200).json({
        status: "success",
        message: "Product saved",
      });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.get("/seller/products", async (req, res) => {
  try {
    const { seller_id, filter = "newest", page = 1, limit = 10 } = req.query;
    if (!seller_id) {
      return res.status(400).json({ status: "error", message: "seller_id is required" });
    }
    const seller = await SellerCollection.findById(seller_id);
    if (!seller) {
      return res.status(404).json({ status: "error", message: "Seller not found" });
    }
    let query = { sellerId: seller_id, vector: { $exists: true } };
    let sortOption = {};
    if (filter === "newest") {
      sortOption = { createdAt: -1 };
    } else if (filter === "mostPopular" || !filter) {
      sortOption = { popularityScore: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let productsQuery = Product.find(query).select("-password -vector");
    console.log("sortOption ------ ", sortOption)
    if (filter === "all") {
      productsQuery = productsQuery.skip(skip).limit(parseInt(limit));
    } else if (filter === "newest") {
      productsQuery = productsQuery.sort(sortOption).skip(skip).limit(parseInt(limit));
    } else {
      productsQuery = productsQuery
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));
    }

    let products = await productsQuery.lean();

    if (filter === "mostPopular" || !filter) {
      products = products
        .map((p) => ({
          ...p,
          popularityScore: (p.likesCount || 0) + (p.savesCount || 0),
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(skip, skip + parseInt(limit));
    }

    res.status(200).json({
      status: "success",
      page: parseInt(page),
      limit: parseInt(limit),
      total: await Product.countDocuments(query),
      products,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/detail", async (req, res) => {
  try {
    const { user_id, product_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ status: "error", message: "user_id is required" });
    }
    if (!product_id) {
      return res.status(400).json({ status: "error", message: "product_id is required" });
    }
    const userDetail = await User.findById(user_id).select("-vector");
    if (!userDetail) {
      return res.status(404).json({ status: "error", message: "user not found" });
    }
    const productDetail = await Product.findById(product_id).select("-vector");
    if (!productDetail) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }
    const likedDoc = await LikeCollection.findOne({
      user_id,
      product_id
    });

    const savedDoc = await Saved.findOne({
      user_id,
      product_id
    });

    const seller = await SellerCollection.findById(productDetail?.sellerId).select("profile_picture");
    const followDoc = await FollowedCollection.findOne({
      user_id,
      seller_id: productDetail?.sellerId
    });

    const finalProduct = {
      ...productDetail.toObject(),
      liked_me: !!likedDoc,
      saved: !!savedDoc,
      seller_profile_picture: seller?.profile_picture || null,
      followed: !!followDoc
    };

    res.status(200).json({
      status: "success",
      product: finalProduct
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


router.delete("/delete/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      return res.status(400).json({ status: "error", message: "product_id is required" });
    }

    const deletedProduct = await Product.findByIdAndDelete(product_id);

    if (!deletedProduct) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/viewed", async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({
        status: "error",
        message: "product_id required",
      });
    }
    await Product.findByIdAndUpdate(product_id, { $inc: { viewCount: 1 } });
    return res.status(200).json({
      status: "success",
      message: "Product viewed",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.get("/seller/products/for/customer", async (req, res) => {
  try {
    const { user_id, seller_id, page = 1, limit = 5, search_text } = req.query;

    let sellerId = seller_id;


    if (!user_id) {
      return res.status(400).json({ status: "error", message: "user_id is required" });
    }
    if (!sellerId) {
      return res.status(400).json({ status: "error", message: "sellerId is required" });
    }

    const user = await User.findById(user_id);
    if (!user || !user.vector) {
      return res.status(404).json({ status: "error", message: "User vector not found" });
    }

    // ✅ filter by seller + optional search
    let filter = { sellerId, vector: { $exists: true } };
    if (search_text && search_text.trim() !== "") {
      filter.$or = [
        { name: { $regex: search_text, $options: "i" } },
        { description: { $regex: search_text, $options: "i" } }
      ];
    }

    const products = await Product.find(filter);

    // ✅ apply recommendation (cosine similarity)
    const productsWithScore = products.map(p => ({
      product: p,
      score: cosineSimilarity(user.vector, p.vector)
    }));

    productsWithScore.sort((a, b) => b.score - a.score);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);

    const paginatedProducts = productsWithScore.slice(startIndex, endIndex).map(p => {
      const productObj = p.product.toObject ? p.product.toObject() : p.product;
      delete productObj.vector;
      return productObj;
    });

    // ✅ check liked + saved
    const likedDocs = await LikeCollection.find({
      user_id,
      product_id: { $in: paginatedProducts.map(p => p._id) }
    }).select("product_id");

    const savedDocs = await Saved.find({
      user_id,
      product_id: { $in: paginatedProducts.map(p => p._id) }
    }).select("product_id");

    const likedProductIds = new Set(likedDocs.map(doc => doc.product_id.toString()));
    const savedProductIds = new Set(savedDocs.map(doc => doc.product_id.toString()));

    // ✅ enrich with seller info
    const sellerDetail = await SellerCollection.findById(sellerId);

    const finalProducts = await Promise.all(
      paginatedProducts.map(async (p) => {
        const isFollowing = await FollowedCollection.exists({
          user_id,
          seller_id: sellerId
        });

        return {
          ...p,
          liked_me: likedProductIds.has(p._id.toString()),
          saved: savedProductIds.has(p._id.toString()),
          followed: !!isFollowing,
          sellerProfile: sellerDetail?.profile_picture || null
        };
      })
    );

    res.status(200).json({
      status: "success",
      page: parseInt(page),
      limit: parseInt(limit),
      total_products: productsWithScore.length,
      products: finalProducts
    });

  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});



module.exports = router;