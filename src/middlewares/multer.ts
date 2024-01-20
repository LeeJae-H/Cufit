import multer from 'multer'; // multipart/form-data

const storage = multer.memoryStorage();
const multerMiddleware = multer({ storage: storage });

export default multerMiddleware;