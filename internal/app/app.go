package app

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

// serveFile phục vụ một file tĩnh cố định với Content-Type và header tuỳ chỉnh.
// Dùng cho các file cần nằm ở scope gốc "/" như service worker và manifest.
func serveFile(path, contentType string, headers map[string]string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", contentType)
		for k, v := range headers {
			w.Header().Set(k, v)
		}
		http.ServeFile(w, r, path)
	}
}

// Run khởi tạo toàn bộ ứng dụng và chạy HTTP server cho tới khi nhận tín hiệu tắt.
func Run() {
	// 1. Tải cấu hình
	cfg := config.LoadConfig(".env")

	// 1.5. Khởi tạo Database (Firebase)
	if _, err := database.InitFirebase(cfg.FirebaseCredentialsJSON); err != nil {
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

	// 3.1.1. PWA: service worker phải được phục vụ ở scope gốc để kiểm soát toàn bộ trang
	mux.HandleFunc("/sw.js", serveFile("web/static/sw.js", "application/javascript; charset=utf-8", map[string]string{
		"Service-Worker-Allowed": "/",
		"Cache-Control":          "no-cache",
	}))
	mux.HandleFunc("/manifest.webmanifest", serveFile("web/static/manifest.webmanifest", "application/manifest+json; charset=utf-8", map[string]string{
		"Cache-Control": "no-cache",
	}))

	// 3.2. Đăng ký Routes HTML Template
	mux.HandleFunc("/", userHandler.Home)

	// 3.3. Đăng ký các Route API kiểm tra hoạt động (Health check & Ping) hỗ trợ GET và HEAD
	mux.HandleFunc("/health", handler.HealthHandler)
	mux.HandleFunc("/api/health", handler.HealthHandler)
	mux.HandleFunc("/ping", handler.PingHandler)
	mux.HandleFunc("/api/ping", handler.PingHandler)

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
	// Tạo kênh lắng nghe tín hiệu ngắt từ hệ điều hành (Ctrl+C, Docker stop)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Block main thread cho đến khi nhận được tín hiệu
	<-quit
	fmt.Println("Đang tắt server (Graceful Shutdown)...")

	// Cấu hình timeout 5 giây cho quá trình shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server buộc phải tắt vì lỗi: %v", err)
	}

	fmt.Println("Server đã tắt an toàn.")
}
