import { api } from "./axios.js";

const filenameFromDisposition = (disposition, fallback) => {
  const match = disposition?.match(/filename="?(?<filename>[^"]+)"?/);
  return match?.groups?.filename || fallback;
};

export const downloadFile = async (url, fallbackFilename) => {
  const response = await api.get(url, {
    responseType: "blob",
  });

  const filename = filenameFromDisposition(
    response.headers["content-disposition"],
    fallbackFilename
  );

  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};
