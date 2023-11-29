import multer from 'multer';

// setup multer upload
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  // dest: 'uploads/',
  limits: {
    fileSize: 1000000, // 1MB limit
  },
});
