process.env.NODE_ENV = "test";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/placeholder-overridden-by-memory-server";
process.env.JWT_ACCESS_SECRET = "test_access_secret_at_least_16_chars";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_at_least_16_chars";
process.env.COOKIE_DOMAIN = "localhost";
