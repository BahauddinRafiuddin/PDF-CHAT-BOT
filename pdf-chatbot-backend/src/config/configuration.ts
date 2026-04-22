export default () => ({
  port: parseInt(process.env.PORT || '5000', 10),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  MONGODB_URL:process.env.MONGODB_URL
});