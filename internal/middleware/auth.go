package middleware

import (
	"context"
	"net/http"
	"strings"

	"go-ssr/internal/database"
)

type contextKey string

const UserContextKey contextKey = "user"

// FirebaseAuthMiddleware kiểm tra ID Token được gửi lên từ Frontend
func FirebaseAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized: Vui lòng đăng nhập", http.StatusUnauthorized)
			return
		}

		idToken := strings.TrimPrefix(authHeader, "Bearer ")

		// Verify token thông qua Firebase Admin Auth
		token, err := database.FirebaseAuth.VerifyIDToken(context.Background(), idToken)
		if err != nil {
			http.Error(w, "Unauthorized: Token không hợp lệ hoặc đã hết hạn", http.StatusUnauthorized)
			return
		}

		// Truyền thông tin UID của người dùng vào Context của request
		ctx := context.WithValue(r.Context(), UserContextKey, token.UID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
