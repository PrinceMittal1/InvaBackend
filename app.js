const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("✅ API is working!");
});

// Import and use route files
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoute");
const sellerRoutes = require("./routes/sellerRoute");
const contentRoutes = require("./routes/contentRoutes");

app.use("/api/users", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/content", contentRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
