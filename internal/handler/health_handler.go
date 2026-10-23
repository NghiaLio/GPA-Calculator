package handler

import (
	"encoding/json"
	"net/http"
	"time"
)

var serverStartTime = time.Now()

// HealthHandler xử lý kiểm tra sức khỏe hệ thống (hỗ trợ GET và HEAD).
// Thường dùng cho monitoring, health check probes của PaaS (Render, Fly, K8s).
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.WriteHeader(http.StatusOK)

	// Với method HEAD, HTTP client chỉ cần đọc headers và status code, không nhận message body
	if r.Method == http.MethodHead {
		return
	}

	resp := map[string]interface{}{
		"status":    "ok",
		"service":   "gpa-calculator",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"uptime":    time.Since(serverStartTime).Round(time.Second).String(),
	}
	_ = json.NewEncoder(w).Encode(resp)
}

// PingHandler xử lý kiểm tra độ phản hồi nhanh (hỗ trợ GET và HEAD).
// Thường dùng cho UptimeRobot, BetterUptime hoặc cron-job định kỳ giữ server hoạt động.
func PingHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.WriteHeader(http.StatusOK)

	// Với method HEAD, không gửi body
	if r.Method == http.MethodHead {
		return
	}

	resp := map[string]interface{}{
		"status":    "pong",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}
	_ = json.NewEncoder(w).Encode(resp)
}
