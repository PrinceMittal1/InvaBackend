const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Basic test route
app.get("/", (req, res) => {
  res.send("API is working!");
});

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoute");
const sellerRoutes = require("./routes/sellerRoute");

app.use("/api/users", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/seller", sellerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
