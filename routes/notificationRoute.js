const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/User");
const Notification = require("../models/notification");

if (!admin.apps.length) {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

router.post("/fire/dummy", async (req, res) => {
  try {
    const { user_id, product_id, screen } = req.body;

    if (!user_id) {
      return res.status(400).json({
        status: "error",
        message: "user_id is required",
      });
    }

    const user = await User.findById(user_id);
    if (!user || !user.notification_token) {
      return res.status(404).json({
        status: "error",
        message: "User not found or missing notification token",
      });
    }

    // normalize values (avoid empty strings — send "none" if not provided)
    const payloadScreen = screen ? String(screen) : "product_detail";
    const payloadProductId = product_id ? String(product_id) : "none";

    const message = {
      token: user.notification_token,
      android: {
        notification: {
          title: "🔥 Dummy Notification",
          body: "This is a test push notification from backend!"
        }
      },
      // ALWAYS send keys as strings; avoid empty string values
      data: {
        screen: payloadScreen,         // e.g. "product_detail" or "chat"
        productId: payloadProductId,   // e.g. "12345" or "none"
        userId: String(user._id)       // keep key name consistent: userId
      }
    };

    const response = await admin.messaging().send(message);

    res.status(200).json({
      status: "success",
      message: "Dummy notification sent successfully",
      fcm_response: response,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send dummy notification",
      error: error.message,
    });
  }
});

module.exports = router;
