const Busboy = require("busboy");
const fs = require("fs");
const path = require("path");

const parseForm = (event) => {
  return new Promise((resolve, reject) => {
    const contentType =
      event.headers["Content-Type"] || event.headers["content-type"];
    const busboy = Busboy({ headers: { "content-type": contentType } });

    const result = { fields: {}, files: {} };

    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    busboy.on("file", (fieldname, file, filename) => {
      const savePath = path.join(
        uploadsDir,
        `${Date.now()}-${filename.filename}`
      );
      const writeStream = fs.createWriteStream(savePath);
      file.pipe(writeStream);
      result.files[fieldname] = {
        path: savePath,
        filename: filename,
        url: `${path.basename(savePath)}`,
      };
    });

    busboy.on("field", (fieldname, val) => {
      result.fields[fieldname] = val;
    });

    busboy.on("finish", () => resolve(result));
    busboy.on("error", (err) => reject(err));

    const buffer = Buffer.from(
      event.body,
      event.isBase64Encoded ? "base64" : "utf8"
    );
    busboy.end(buffer);
  });
};

const removeFile = async (avatarUrl) => {
  try {
    if (!avatarUrl) return;
    avatarUrl = avatarUrl.split("/")[avatarUrl.split("/").length - 1];
    const uploadsDir = path.join(__dirname, "..", "uploads");
    const filePath = path.join(uploadsDir, avatarUrl);

    // Check if file exists before attempting to delete
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error removing old avatar:", error);
  }
};
module.exports = { parseForm, removeFile };
