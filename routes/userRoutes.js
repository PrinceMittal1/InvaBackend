const express = require("express");
const router = express.Router();
const User = require("../models/User");
const LikeCollection = require("../models/Like");
const SellerCollection = require("../models/Seller");
const Saved = require("../models/Saved");
const FollowedCollection = require("../models/Followed");
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


router.post("/create", async (req, res) => {
  try {
    console.log("user dtaa is --- 0")

    console.log("user dtaa is --- 001", req.body)
    const userData = req.body;

    console.log("user dtaa is --- 1")
    const conditions = [];
    if (userData.email) {
      conditions.push({ email: userData.email });
    }
    if (userData.phoneNumber) {
      conditions.push({ phoneNumber: userData.phoneNumber });
    }
    console.log("user dtaa is --- 2")
    let existingUser = null;
    if (conditions.length > 0) {
      existingUser = await User.findOne({ $or: conditions }).select("-password -vector");
    }
    console.log("user dtaa is --- 3")
    if (existingUser) {
      if (userData.email && existingUser.email === userData.email) {
        res.status(200).json({
          status: "success",
          user: existingUser,
        });
      }
      if (userData.phoneNumber && existingUser.phoneNumber === userData.phoneNumber) {
        res.status(200).json({
          status: "success",
          user: existingUser,
        });
      }
    }
    console.log("user dtaa is --- 4")
    const user = new User({
      ...userData,
      vector: null
    });
    const savedUser = await user.save();
    if (!savedUser.user_id) {
      savedUser.user_id = savedUser._id.toString();
      await savedUser.save();
    }
    console.log("user dtaa is --- 5")
    res.status(200).json({
      status: "success",
      user: savedUser,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


router.post("/updating", async (req, res) => {
  try {
    const userData = req.body;
    if (!userData._id) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userData._id,
      { $set: userData },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({
      status: "success",
      user_id: updatedUser._id,
      userData : updatedUser
    });

    (async () => {
      try {
        const description = `Name: ${userData.name || ""}, Age: ${userData.age || ""}, Gender: ${userData.gender || ""}, City: ${userData.city || ""}, State: ${userData.state || ""}, Interests: ${userData.interests?.join(", ") || ""}`;
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: description,
        });
        const vector = embeddingResponse.data[0].embedding;
        await User.findByIdAndUpdate(updatedUser._id, { vector });
      } catch (err) {
        console.error("Vector update failed:", err.message);
      }
    })();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
});

router.post("/following/seller", async (req, res) => {
  try {
    const { user_id, seller_id } = req.body;
    if (!seller_id || !product_id) {
      return res.status(400).json({
        status: "error",
        message: "seller_id and user_id required",
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

router.get("/wishlist", async (req, res) => {
  try {
    const { user_id, page = 1, limit = 5 } = req.query;
    if (!user_id) {
      return res.status(400).json({ status: "error", message: "user_id is required" });
    }
    const savedDocs = await Saved.find({ user_id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate({
        path: "product_id",
        model: "Product",
        select: "-vector"
      });

    if (!savedDocs || savedDocs.length === 0) {
      return res.status(200).json({
        status: "success",
        page: parseInt(page),
        limit: parseInt(limit),
        total_products: 0,
        products: []
      });
    }

    const products = savedDocs
      .filter(doc => doc.product_id)
      .map(doc => doc.product_id.toObject());

    const productIds = products.map(p => p._id);

    const likedDocs = await LikeCollection.find({
      user_id,
      product_id: { $in: productIds }
    }).select("product_id");

    const savedProductIds = new Set(productIds.map(id => id.toString()));
    const likedProductIds = new Set(likedDocs.map(doc => doc.product_id.toString()));

    const finalProducts = await Promise.all(
      products.map(async (p) => {
        const seller_id = p.sellerId;
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
          sellerProfile: sellerDetail.profile_picture || null
        };
      })
    );

    const total_products = await Saved.countDocuments({ user_id });

    res.status(200).json({
      status: "success",
      page: parseInt(page),
      limit: parseInt(limit),
      total_products,
      products: finalProducts
    });

  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.get("/detail", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ status: "error", message: "user_id is required" });
    }
    existingUser = await User.findOne({ user_id }).select("-vector");
    res.status(200).json({
      data : existingUser
    })
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


router.delete("/delete", async (req, res) => {
  try {
    console.log("existing user is ------ user_id", req.body)
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ status: "error", message: "user_id is required" });
    }
    await Promise.all([
      LikeCollection.deleteMany({ user_id }),
      Saved.deleteMany({ user_id }),
      FollowedCollection.deleteMany({ user_id }),
      SellerCollection.deleteMany({ user_id })
    ]);
    const deletedUser = await User.findOneAndDelete({ user_id });
    if (!deletedUser) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Account deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});




module.exports = router;
