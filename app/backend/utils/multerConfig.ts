import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb:multer.FileFilterCallback) => {
    console.log('📁 Multer FileFilter called, ', file.mimetype);

    if(file.mimetype === 'application/pdf') {
        console.log('✅ File type approved (PDF)');
        cb(null, true);
    }
    else {
        console.log('❌ File type rejected:', file.mimetype);
        cb(new Error('Only PDF files are allowed!'));
    }
}

export const uploadPrescription = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10
    }
})