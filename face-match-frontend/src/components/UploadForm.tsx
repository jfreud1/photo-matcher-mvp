import React, { useState } from "react";

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setMessage("");
    } else {
      setMessage("Please upload a valid image file.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please choose an image to upload.");
      return;
    }

    setIsUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Image uploaded successfully!");
        console.log("Uploaded file path:", result.file_path);
      } else {
        setMessage(result.error || "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-md p-4 shadow-lg rounded-2xl">
        <p className="text-sm text-gray-500">Upload a photo to find matches</p>
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-contain rounded-lg border"
            />
          )}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-2 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
          {message && (
            <p className="text-sm text-center mt-2 text-gray-700">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
