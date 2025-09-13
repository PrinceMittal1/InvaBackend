const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const SellerCollection = require("../models/Seller");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const User = require("../models/User");
const Followed = require("../models/Followed");


router.post("/create", async (req, res) => {
  try {
    const userData = req.body;
    const conditions = [];

    if (userData.email) {
      conditions.push({ email: userData.email });
    }
    if (userData.phoneNumber) {
      conditions.push({ phoneNumber: userData.phoneNumber });
    }
    let existingUser = null;
    if (conditions.length > 0) {
      existingUser = await SellerCollection.findOne({ $or: conditions }).select("-password -vector");
    }
    if (existingUser) {
      if (userData.email && existingUser.email === userData.email) {
        res.status(201).json({
          status: "success",
          user: existingUser,
        });
      }
      if (userData.phoneNumber && existingUser.phoneNumber === userData.phoneNumber) {
        res.status(201).json({
          status: "success",
          user: existingUser,
        });
      }
    }
    const user = new SellerCollection({
      ...userData,
      vector: null
    });
    const savedUser = await user.save();

    if (!savedUser.seller_id) {
      savedUser.seller_id = savedUser._id.toString();
      await savedUser.save();
    }


    res.status(200).json({
      status: "success",
      user : savedUser,
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
    const updatedUser = await SellerCollection.findByIdAndUpdate(
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
    });
    (async () => {
      try {
       const description = `businessName: ${userData.businessName || ""}
          businessType: ${userData.businessType || ""}
          state: ${userData.state || ""}
          city : ${userData.city || ""}
          products deals in : ${(userData.products || []).join(", ")}`;
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: description,
        });
        const vector = embeddingResponse.data[0].embedding;
        await SellerCollection.findByIdAndUpdate(updatedUser._id, { vector });
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


router.get("/detail", async (req, res) => {
  try {
    const { user_id: seller_id } = req.query;

    if (!seller_id) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const seller = await SellerCollection.findById(seller_id)
      .select("-password -vector");
    if (!seller) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    return res.status(200).json({
      status: "success",
      seller,
    });
  } catch (error) {
    console.error("Error fetching seller:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
});


router.get("/profile", async (req, res) => {
  try {
    const { id : seller_id } = req.query;
    if (!seller_id) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const seller = await SellerCollection.findById(seller_id)
      .select("-password -vector");
    if (!seller) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    return res.status(200).json({
      status: "success",
      seller,
    });
  } catch (error) {
    console.error("Error fetching seller:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
});


router.post("/follow", async (req, res) => {
  try {
    const { user_id, seller_id } = req.body;

    if (!user_id || !seller_id) {
      return res.status(400).json({ status: "error", message: "user_id and seller_id are required" });
    }

    const existingFollow = await Followed.findOne({ user_id, seller_id });

    if (existingFollow) {
      await Followed.deleteOne({ _id: existingFollow._id });
      await SellerCollection.findByIdAndUpdate(seller_id, { $inc: { followers: -1 } });

      return res.status(201).json({
        status: "success",
        message: "Seller unfollowed",
      });
    } else {
      const follow = new Followed({ user_id, seller_id });
      await follow.save();
      await SellerCollection.findByIdAndUpdate(seller_id, { $inc: { followers: 1 } });
      (async () => {
        try {
          const seller = await SellerCollection.findById(seller_id);
          if (!seller) return;
          const description = `Business: ${seller.businessName || ""}
          Type: ${seller.businessType || ""}
          City: ${seller.city || ""}
          State: ${seller.state || ""}
          Products: ${(seller.products || []).join(", ")}`;

          const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: description,
          });

          const sellerVector = embeddingResponse.data[0].embedding;
          const user = await User.findById(user_id);

          if (user) {
            let updatedVector = sellerVector;

            if (Array.isArray(user.vector) && user.vector.length === sellerVector.length) {
              const weightUser = 0.7;
              const weightSeller = 0.3;
              updatedVector = user.vector.map((val, idx) => {
                const userVal = isNaN(val) ? 0 : val;
                const sellerVal = isNaN(sellerVector[idx]) ? 0 : sellerVector[idx];
                return userVal * weightUser + sellerVal * weightSeller;
              });
            } else {
              updatedVector = sellerVector.map(v => (isNaN(v) ? 0 : v));
            }

            await User.findByIdAndUpdate(user_id, { vector: updatedVector });
          }
        } catch (err) {
          console.error("Vector update failed (follow):", err.message);
        }
      })();

      return res.status(200).json({
        status: "success",
        message: "Seller followed",
      });
    }
  } catch (error) {
    console.error("Error in follow API:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});




module.exports = router;