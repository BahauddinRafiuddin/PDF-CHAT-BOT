import toast from "react-hot-toast";
import API from "./api";

// Upload PDF
export const uploadPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await API.post("/pdf/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      docId: res.data.docId,
      fileName: res.data.fileName,
      totalChunks: res.data.totalChunks,
      message: res.data.message,
    };
  } catch (error) {
    console.log(error)
    toast.error("PDF UPLOAD FAILED!")
    throw new Error("PDF upload failed");
  }
};

export const deletePDF = async ({ docId, fileName }) => {
  const res = await API.delete("/pdf/delete", {
    data: { docId, fileName },
  });

  return {
    message: res.data.message
  }
};