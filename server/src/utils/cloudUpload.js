import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const publicIdFromFilename = (filename, resourceType) => {
  if (!filename) return undefined;

  const safeName = filename.replace(/\.[^/.]+$/, "");
  const extension = filename.includes(".") ? filename.split(".").pop() : "";

  if (resourceType === "raw" && extension) {
    return `${safeName}.${extension}`;
  }

  return safeName;
};

export const uploadBuffer = ({ buffer, folder, resourceType = "image", filename }) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicIdFromFilename(filename, resourceType),
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
};
