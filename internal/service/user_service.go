package service

import (
	"go-ssr/internal/model"
	"go-ssr/internal/repository"
)

// UserService chứa logic nghiệp vụ cho User
type UserService struct {
	repo repository.UserRepository
}

// NewUserService khởi tạo một UserService mới
func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{
		repo: repo,
	}
}

// GetUsers lấy danh sách người dùng từ repository
func (s *UserService) GetUsers() ([]model.User, error) {
	// Tại đây có thể chứa thêm logic, ví dụ kiểm tra quyền, cache...
	return s.repo.GetAll()
}
