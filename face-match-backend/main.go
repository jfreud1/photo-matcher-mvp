package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

const uploadPath = "./uploads" // Folder for uploaded files

func main() {
	// Ensure the uploads directory exists
	if err := os.MkdirAll(uploadPath, os.ModePerm); err != nil {
		log.Fatalf("Failed to create upload directory: %v", err)
	}

	// Initialize the router
	r := gin.Default()

	// Test route
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to the Face Match API",
		})
	})

	// File upload route
	r.POST("/upload", uploadFile)

	// Start the server on port 8080
	r.Run(":8080")
}

// Function to handle file uploads
func uploadFile(c *gin.Context) {
	file, err := c.FormFile("file") // Retrieve the uploaded file
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file upload"})
		return
	}

	// Save the uploaded file to the uploads folder
	filePath := filepath.Join(uploadPath, file.Filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Respond with the file path and a success message
	c.JSON(http.StatusOK, gin.H{
		"message":   "File uploaded successfully!",
		"file_path": filePath,
	})
}
