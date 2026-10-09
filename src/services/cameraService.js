import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export { CameraSource };

// Réduit l'image pour rester très en dessous de la limite de 1 Mo par document Firestore
const resizeDataUrl = (dataUrl, maxSize = 400, quality = 0.7) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });

export const takePhoto = async (source = CameraSource.Camera) => {
  const photo = await Camera.getPhoto({
    quality: 70,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source, // Camera = prendre une photo, Photos = galerie
  });
  return resizeDataUrl(photo.dataUrl);
};