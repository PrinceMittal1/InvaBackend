const admin = require("firebase-admin");
const User = require("../models/User");
const SellerCollection = require("../models/Seller");
const Notification = require("../models/notification");

// Initialize Firebase Admin (safe check to prevent re-initialization)
if (!admin.apps.length) {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendNotification = async (userId, title, body, data = {}, sellerId = null) => {
  try {
    // --- Prepare notification DB entry ---
    const notificationData = {
      type: data.type || null,
      heading: title,
      message: body,
      clicked: false, // default false
      seller_id: sellerId || null,
      user_id: userId || null,
    };


    console.log("✅ Like notification sent to seller:---- first ", notificationData);

    const notification = await Notification.create(notificationData);

    let notificationToken = ''

    if (userId) {
      const user = await User.findById(userId);
      notificationToken = user.notification_token
      if (!user || !user.notification_token) {
        console.log(`❌ Notification not sent: user ${userId} missing token`);
        return false;
      }
    } else if (sellerId) {
      const seller = await SellerCollection.findOne({ seller_id: sellerId }); // ✅ Correct method
      console.log("✅ Like notification sent to seller (found):", seller.notification_token);
      if (!seller || !seller.notification_token) {
        console.log(`❌ Notification not sent: seller ${sellerId} missing token`);
        return false;
      }
      notificationToken = seller.notification_token;
    }


    const message = {
      token: notificationToken,
      notification: {
        title,
        body,
      },
      data: {
        notification_id: String(notification._id),
        ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Push notification sent:", response);

    return true;
  } catch (error) {
    console.error("❌ Notification error:", error.message);
    return false;
  }
};

module.exports = sendNotification;
