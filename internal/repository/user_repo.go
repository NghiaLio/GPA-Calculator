package repository

import "go-ssr/internal/model"

// UserRepository định nghĩa các thao tác với dữ liệu User
type UserRepository interface {
	GetAll() ([]model.User, error)
}

// userRepoMock là implementation tạm thời của UserRepository
type userRepoMock struct{}

// NewUserRepository trả về một instance của UserRepository
func NewUserRepository() UserRepository {
	return &userRepoMock{}
}

// GetAll trả về dữ liệu giả lập
func (r *userRepoMock) GetAll() ([]model.User, error) {
	// Dữ liệu hard-code trả về (sau này thay bằng DB thực tế)
	users := []model.User{
		{ID: 1, Username: "admin", Email: "admin@example.com", Role: "Admin"},
		{ID: 2, Username: "john_doe", Email: "john@example.com", Role: "User"},
		{ID: 3, Username: "jane_doe", Email: "jane@example.com", Role: "Editor"},
	}
	return users, nil
}
