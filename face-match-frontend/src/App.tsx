import React, { useState, useEffect } from "react";

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setMessage(null);
        setApiResponse(null);
      } else {
        setMessage("Invalid file type. Please upload an image file.");
        setSelectedFile(null);
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please choose an image to upload.");
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setApiResponse(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8080/uploads", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || "Image uploaded successfully!");
        setApiResponse(result.file_path || "No file path returned.");
      } else {
        setMessage(result.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error parsing backend response:", error);
      setMessage("An unexpected error occurred while processing the server response.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-md p-6 shadow-lg rounded-xl bg-white">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Upload Your Image
        </h2>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Upload a photo to find matches.
        </p>
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input w-full text-sm border rounded-lg p-2"
          />
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border shadow-sm"
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                  setMessage(null);
                }}
                className="absolute top-0 right-0 p-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`mt-2 w-full py-2 rounded-lg ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
          {message && (
            <p
              className={`text-sm text-center mt-2 ${
                apiResponse ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
          {apiResponse && (
            <p className="text-sm text-center mt-2 text-blue-600">
              Uploaded File Path: <a href={apiResponse}>{apiResponse}</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the UploadForm component as the default export
export default UploadForm;