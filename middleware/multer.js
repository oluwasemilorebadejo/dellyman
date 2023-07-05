const multer = require("multer");
const path = require("path");

const multerStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      `company-${req.user.organisation}-${req.user.id}-${Date.now()}.${ext}`
    );
  },
});

const multerFilter = (req, file, cb) => {
  // console.log(file);

  let ext = path.extname(file.originalname);
  if (
    ext !== ".jpg" &&
    ext !== ".jpeg" &&
    ext !== ".png" &&
    ext !== ".pdf" &&
    ext !== ".doc"
  ) {
    cb(new Error("File type is not supported"), false);
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

uploadCompanyCac = upload.single("file");

module.exports = uploadCompanyCac;
