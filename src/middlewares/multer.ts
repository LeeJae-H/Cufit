import multer from 'multer'; // multipart/form-data

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;