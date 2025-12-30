// src/utils/cropImage.ts

export const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // 1. Cài đặt kích thước canvas bằng kích thước vùng cắt
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 2. Xóa sạch canvas trước khi vẽ (đảm bảo không bị nhiễu)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // [TÙY CHỌN] Nếu bạn muốn bắt buộc avatar phải có nền trắng (ví dụ ảnh thẻ), hãy bỏ comment 2 dòng dưới:
  // ctx.fillStyle = '#FFFFFF';
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Vẽ ảnh lên canvas theo tọa độ cắt
  // Sử dụng image smoothing để ảnh cắt mượt hơn
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // 4. Xuất ra Blob dưới dạng PNG để hỗ trợ trong suốt và tránh lỗi nền đen
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 1.0); // PNG chất lượng tối đa
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    // Quan trọng: Cần thiết để vẽ ảnh từ URL ngoài (Cloudinary, Firebase...) lên canvas mà không lỗi bảo mật
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });