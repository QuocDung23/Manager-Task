export function getCloudinaryDisplayImageUrl(imageUrl?: string | null) {
    if (!imageUrl) return null;
  
    const cloudinaryUploadPath = "/image/upload/";
    const uploadPathIndex = imageUrl.indexOf(cloudinaryUploadPath);
  
    if (
      uploadPathIndex === -1 ||
      !imageUrl.includes("res.cloudinary.com") ||
      imageUrl.includes(`${cloudinaryUploadPath}f_auto`)
    ) {
      return imageUrl;
    }
  
    const beforeUploadPath = imageUrl.slice(
      0,
      uploadPathIndex + cloudinaryUploadPath.length,
    );
    const afterUploadPath = imageUrl.slice(
      uploadPathIndex + cloudinaryUploadPath.length,
    );
  
    return `${beforeUploadPath}f_auto,q_auto/${afterUploadPath}`;
  }