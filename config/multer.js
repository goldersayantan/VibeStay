const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if(allowedTypes.includes(file.mimetype))    {
            cb(null, true);
        }else   {
            cb(new Error("Only JPG, JPEG, PNG files are allowed!"), false);
        }
    }
});
module.exports = upload;