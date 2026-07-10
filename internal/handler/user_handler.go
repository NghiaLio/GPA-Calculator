package handler

import (
	"go-ssr/internal/service"
	"go-ssr/internal/utils"
	"html/template"
	"net/http"
	"path/filepath"
)

// UserHandler xử lý các route liên quan đến User và giao diện
type UserHandler struct {
	userService *service.UserService
}

// NewUserHandler khởi tạo UserHandler
func NewUserHandler(us *service.UserService) *UserHandler {
	return &UserHandler{
		userService: us,
	}
}

// PageData dữ liệu truyền xuống HTML Template
type PageData struct {
	Title string
	Users interface{}
}

// Home xử lý route GET /
func (h *UserHandler) Home(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		utils.NotFound(w, r)
		return
	}

	// Lấy danh sách users từ Service
	users, err := h.userService.GetUsers()
	if err != nil {
		utils.InternalServerError(w, r)
		return
	}

	data := PageData{
		Title: "Trang chủ - Bảng điểm",
		Users: users,
	}

	renderTemplate(w, "bang_diem.html", data)
}

// renderTemplate giúp tái sử dụng logic parse HTML
func renderTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
	tmplPath := filepath.Join("web", "templates", tmpl)
	t, err := template.ParseFiles(tmplPath)
	if err != nil {
		utils.InternalServerError(w, nil)
		return
	}

	if err := t.Execute(w, data); err != nil {
		utils.InternalServerError(w, nil)
	}
}
