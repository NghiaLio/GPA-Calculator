package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go-ssr/internal/config"
	"go-ssr/internal/database"
	"go-ssr/internal/handler"
	"go-ssr/internal/middleware"
	"go-ssr/internal/repository"
	"go-ssr/internal/service"
)

func main() {
	// 1. Tải cấu hình
	cfg := config.LoadConfig(".env")

	// 1.5. Khởi tạo Database (Firebase)
	_, err := database.InitFirebase(cfg.FirebaseCredentialsJSON)
	if err != nil {
		log.Fatalf("Lỗi cấu hình Firebase: %v", err)
	}

	// 2. Khởi tạo Dependencies (Repository, Service, Handler)
	userRepo := repository.NewUserRepository()
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	// 3. Thiết lập Router (ServeMux)
	mux := http.NewServeMux()

	// 3.1. Đăng ký Static Files
	fs := http.FileServer(http.Dir("web/static"))
	mux.Handle("/images/", middleware.NoCache(fs))
	mux.Handle("/assets/", middleware.NoCache(fs))

	// 3.2. Đăng ký Routes HTML Template
	mux.HandleFunc("/", userHandler.Home)

	// 3.3. Đăng ký Route API cơ bản
	mux.HandleFunc("/health", handler.HealthHandler)

	// 3.4. Đăng ký Route API có bảo vệ bằng Firebase Auth và Rate Limit (2 req/sec, burst 5)
	apiRateLimiter := middleware.RateLimit(2.0, 5)
	mux.Handle("/api/grades/save", apiRateLimiter(middleware.FirebaseAuthMiddleware(http.HandlerFunc(handler.SaveGradesHandler))))
	mux.Handle("/api/grades/load", apiRateLimiter(middleware.FirebaseAuthMiddleware(http.HandlerFunc(handler.LoadGradesHandler))))

	// 4. Bọc Middleware
	handlerWithMiddleware := middleware.Logging(mux)

	// 5. Cấu hình HTTP Server
	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: handlerWithMiddleware,
	}

	// 6. Chạy Server trong một goroutine để không block thread chính
	go func() {
		fmt.Printf("Server đang chạy tại http://localhost:%s\n", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Lỗi khởi chạy server: %v", err)
		}
	}()

	// 7. Cấu hình Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	fmt.Println("Đang tắt server (Graceful Shutdown)...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server buộc phải tắt vì lỗi: %v", err)
	}

	fmt.Println("Server đã tắt an toàn.")
}
