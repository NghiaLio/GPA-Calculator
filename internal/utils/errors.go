package utils

import (
	"encoding/json"
	"net/http"
)

// SendJSONResponse gửi phản hồi JSON
func SendJSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

// NotFound xử lý lỗi 404 - Not Found
func NotFound(w http.ResponseWriter, r *http.Request) {
	SendJSONResponse(w, http.StatusNotFound, map[string]string{
		"error": "Not Found",
	})
}

// InternalServerError xử lý lỗi 500
func InternalServerError(w http.ResponseWriter, r *http.Request) {
	SendJSONResponse(w, http.StatusInternalServerError, map[string]string{
		"error": "Internal Server Error",
	})
}
