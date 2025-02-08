package main

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

var (
	maxUploadSize = 10 << 20 // Default: 10 MB
	uploadDir     = "./uploads"
)

func main() {
	// Load environment variables from .env (optional)
	_ = godotenv.Load(".env")

	// Ensure the local uploads directory exists
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		log.Fatalf("Failed to create upload directory: %v", err)
	}

	// Initialize Gin router
	r := gin.Default()

	// Test route
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to the Face Match API"})
	})

	// File upload route
	r.POST("/uploads", uploadFileLocally)

	// Start the server on port 8080
	r.Run(":8080")
}

// uploadFileLocally handles the file upload and saves it to the local filesystem
func uploadFileLocally(c *gin.Context) {
	// Limit file size
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, int64(maxUploadSize)) // Convert maxUploadSize to int64

	// Parse the uploaded file
	file, fileHeader, err := c.Request.FormFile("file")
	if err != nil {
		log.Printf("Error retrieving file: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file upload"})
		return
	}
	defer file.Close()

	// Validate file type
	allowedTypes := map[string]bool{"image/jpeg": true, "image/png": true, "image/gif": true}
	fileExt := filepath.Ext(fileHeader.Filename)
	allowedExtensions := map[string]bool{".jpeg": true, ".jpg": true, ".png": true, ".gif": true}

	if !allowedTypes[fileHeader.Header.Get("Content-Type")] || !allowedExtensions[fileExt] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type or extension"})
		return
	}

	// Generate a unique filename
	fileName := fmt.Sprintf("%s%s", uuid.New().String(), fileExt)

	// Read file content into a buffer
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}

	// Save the file locally
	filePath := filepath.Join(uploadDir, fileName)
	if err := os.WriteFile(filePath, buf.Bytes(), 0644); err != nil {
		log.Printf("Failed to save file locally: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file locally"})
		return
	}

	// Respond with success
	c.JSON(http.StatusOK, gin.H{
		"message":   "File uploaded successfully!",
		"file_path": filePath,
	})
}