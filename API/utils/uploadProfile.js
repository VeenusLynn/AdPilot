import multer from "multer";
import path from "path";
import fs from "fs";

const profileUploadDir = path.join("uploads", "profiles");

if (!fs.existsSync(path.join("uploads"))) {
  fs.mkdirSync(path.join("uploads"));
}
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadDir);
  },
  filename: function (req, file, cb) {
    // Prefix with userId so it's easy to locate and replace
    const userId = req.user?.userId ?? "unknown";
    const uniqueName =
      `profile-${userId}-${Date.now()}` + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const uploadProfile = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max for profile pictures
  fileFilter: function (req, file, cb) {
    // Only jpg and png — no gif for avatars
    const allowed = /jpeg|jpg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG and PNG files are allowed for profile images"));
    }
  },
});

export default uploadProfile;
