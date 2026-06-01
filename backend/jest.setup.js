// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.GEMINI_API_KEY = 'test-gemini-key';

// Map MONGODB_URI to the MONGO_URI set by @shelf/jest-mongodb memory server
if (process.env.MONGO_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
} else {
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/creatorflow-test';
}

// Global mocks if needed
jest.setTimeout(30000); // 30s timeout for memory server start
