package database

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var (
	FirebaseApp     *firebase.App
	FirebaseAuth    *auth.Client
	FirestoreClient *firestore.Client
)

// InitFirebase khởi tạo kết nối đến Firebase thông qua chuỗi JSON Service Account
func InitFirebase(credentialsJSON string) (*firebase.App, error) {
	if credentialsJSON == "" {
		return nil, fmt.Errorf("Chuỗi JSON cấu hình Firebase trống")
	}

	ctx := context.Background()

	// Sử dụng option.WithCredentialsJSON thay vì đọc từ file
	opt := option.WithCredentialsJSON([]byte(credentialsJSON))
	
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, fmt.Errorf("Lỗi khởi tạo Firebase App: %v", err)
	}

	// Khởi tạo Firestore Client
	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("Lỗi khởi tạo Firestore Client: %v", err)
	}
	
	// Khởi tạo Auth Client
	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("Lỗi khởi tạo Auth Client: %v", err)
	}

	log.Println("✅ Khởi tạo Firebase Admin SDK thành công!")
	FirebaseApp = app
	FirebaseAuth = authClient
	FirestoreClient = client
	return app, nil
}
