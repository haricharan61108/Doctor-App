import multer from "multer";
import path from "path";
import fs from "fs";

// Use absolute path for uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads', 'prescriptions');
console.log('📂 Uploads directory path:', uploadsDir);

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
    console.log('⚠️  Directory does not exist, creating:', uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true });
} else {
    console.log('✅ Directory exists');
}

const storage  = multer.diskStorage({
    destination: (req,file,cb)=> {
        console.log('📁 Multer destination callback called');
        console.log('📄 File info:', file.originalname, file.mimetype);
        cb(null, uploadsDir);
    },
    filename: (req,file,cb) => {
        console.log('🔤 Multer filename callback called');
        const uniqueSiffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'prescription-'+uniqueSiffix+path.extname(file.originalname);
        console.log('💾 Generated filename:', filename);
        cb(null, filename);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb:multer.FileFilterCallback) => {
    console.log('🔍 Multer fileFilter called, mimetype:', file.mimetype);
    if(file.mimetype === 'application/pdf'){
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
        fileSize: 1024 * 1024 * 10 //10Mb limit
    }
})