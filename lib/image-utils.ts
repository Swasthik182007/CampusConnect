/**
 * Client-side image compression and EXIF metadata stripping.
 * Resizes image to a max width (default 1280px) and compresses to WebP/JPEG (0.8 quality).
 * Drawing onto an HTML5 canvas automatically strips EXIF GPS/location data for privacy.
 */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  quality = 0.8
): Promise<File> {
  // If not an image or in SSR, return as is
  if (typeof window === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp with target quality, stripping EXIF
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const cleanFileName = file.name.replace(/\.[^.]+$/, ".webp");
              const compressedFile = new File([blob], cleanFileName, {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

