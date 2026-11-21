package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"duitku-backend/handlers"
	"duitku-backend/services"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	ctx := context.Background()

	// Initialize Google Clients (if credentials.json exists)
	var sheetsService *services.SheetsService
	var driveService *services.DriveService

	credFile := "credentials.json"
	if _, err := os.Stat(credFile); err == nil {
		sSrv, err := sheets.NewService(ctx, option.WithCredentialsFile(credFile))
		if err == nil {
			sheetsService = services.NewSheetsService(sSrv)
			fmt.Println("✓ Google Sheets API berhasil diinisialisasi")
		} else {
			fmt.Printf("! Gagal memuat Sheets service: %v\n", err)
		}

		dSrv, err := drive.NewService(ctx, option.WithCredentialsFile(credFile))
		if err == nil {
			driveService = services.NewDriveService(dSrv)
			fmt.Println("✓ Google Drive API berhasil diinisialisasi")
		} else {
			fmt.Printf("! Gagal memuat Drive service: %v\n", err)
		}
	} else {
		fmt.Println("ℹ File credentials.json belum ditemukan.")
		fmt.Println("ℹ Backend berjalan dalam mode offline/fallback ready.")
		fmt.Println("ℹ Anda dapat menambahkan credentials.json nanti untuk mengaktifkan direct Google Sheets sync.")
	}

	syncHandler := handlers.NewSyncHandler(sheetsService, driveService)

	r := mux.NewRouter()

	// Health Check
	r.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "healthy",
			"app":       "DuitKu Go Backend",
			"timestamp": time.Now().Format(time.RFC3339),
			"googleApi": sheetsService != nil,
		})
	}).Methods(http.MethodGet)

	// Sync routes
	r.HandleFunc("/api/sync/push", syncHandler.PushHandler).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/sync/pull", syncHandler.PullHandler).Methods(http.MethodGet, http.MethodOptions)

	// CORS Setup for Vue Frontend
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "X-Requested-With"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		fmt.Printf("\n🚀 DuitKu Golang Backend berjalan di http://localhost:%s\n", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	fmt.Println("\nMematikan server dengan aman...")
	ctxShut, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctxShut); err != nil {
		log.Fatalf("Error saat mematikan server: %v", err)
	}
	fmt.Println("Server berhasil dimatikan.")
}
