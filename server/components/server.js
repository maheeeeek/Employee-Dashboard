require('dotenv').config();  // ← MUST be first line!

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await connectDB(MONGO_URI);
    console.log('MongoDB connected successfully');

    const server = app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });

    server.setTimeout(120000);

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
})();