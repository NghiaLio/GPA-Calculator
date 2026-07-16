package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"go-ssr/internal/database"
	"go-ssr/internal/middleware"
)

// UserData chứa cấu trúc tổng hợp bảng điểm và cài đặt của user
type UserData struct {
	Subjects []interface{} `json:"subjects" firestore:"subjects"`
	Weights  interface{}   `json:"weights" firestore:"weights"`
	Scale    []interface{} `json:"scale" firestore:"scale"`
}

// SaveGradesHandler lưu dữ liệu lên Firestore
func SaveGradesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// Lấy UID từ Context (được middleware đưa vào)
	uid := r.Context().Value(middleware.UserContextKey).(string)

	var payload UserData
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	// Ghi đè hoặc tạo mới dữ liệu tại collection 'users', document ID = UID
	_, err := database.FirestoreClient.Collection("users").Doc(uid).Set(ctx, map[string]interface{}{
		"data": payload,
	})

	if err != nil {
		log.Printf("Lỗi lưu Firestore cho UID %s: %v", uid, err)
		http.Error(w, "Lỗi khi lưu vào Firestore", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Đã lưu dữ liệu thành công"})
}

// LoadGradesHandler tải dữ liệu từ Firestore
func LoadGradesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	uid := r.Context().Value(middleware.UserContextKey).(string)
	ctx := context.Background()

	doc, err := database.FirestoreClient.Collection("users").Doc(uid).Get(ctx)
	if err != nil {
		log.Printf("Lỗi tải Firestore cho UID %s (có thể user mới): %v", uid, err)
		// Có thể document chưa tồn tại (user mới)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"data": nil, // Trả về nil nếu chưa có dữ liệu
		})
		return
	}

	data := doc.Data()["data"]

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": data,
	})
}
