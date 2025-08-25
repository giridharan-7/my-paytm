require('dotenv').config();

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://gdeveloper101:dwKudEWLTRLzLI9G@cluster0.jiayfe9.mongodb.net/paytm",
    JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production",
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development'
}