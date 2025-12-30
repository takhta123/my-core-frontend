

export const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
  const image = await createImage(imageSrc); // Hàm tạo Image object từ URL
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // 1. Cài đặt kích thước canvas bằng kích thước vùng cắt
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 2. [QUAN TRỌNG] Vẽ một lớp nền màu trắng trước (để tránh bị đen nếu ảnh lỗi transparency)
  // Nếu bạn muốn avatar nền trắng thay vì trong suốt
  ctx.fillStyle = '#FFFFFF'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Vẽ ảnh lên canvas theo tọa độ cắt
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

  // 4. Xuất ra Blob để gửi lên Server
  return new Promise((resolve) => {
    // Nếu muốn giữ trong suốt: dùng 'image/png'
    // Nếu muốn file nhẹ và không cần trong suốt: dùng 'image/jpeg' (nhưng nhớ bước 2 tô nền trắng)
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9); // Chất lượng 90%
  });
};

// Hàm phụ trợ để load ảnh
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Cần thiết để tránh lỗi CORS khi vẽ lên canvas
    image.src = url;
  });