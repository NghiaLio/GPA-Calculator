package handler

import (
	"go-ssr/internal/utils"
	"net/http"
)

// HealthHandler xử lý route /health
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	utils.SendJSONResponse(w, http.StatusOK, map[string]string{
		"status": "ok",
	})
}
