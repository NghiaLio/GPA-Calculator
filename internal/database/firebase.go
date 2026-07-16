package database

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

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

	// Xóa khoảng trắng thừa và dấu nháy đơn/kép bị dư do copy/paste sai trên Heroku
	credentialsJSON = strings.TrimSpace(credentialsJSON)
	if strings.HasPrefix(credentialsJSON, "'") && strings.HasSuffix(credentialsJSON, "'") {
		credentialsJSON = strings.Trim(credentialsJSON, "'")
	}
	if strings.HasPrefix(credentialsJSON, "\"") && strings.HasSuffix(credentialsJSON, "\"") {
		credentialsJSON = strings.Trim(credentialsJSON, "\"")
		// Xử lý các escape character nếu có (Vd: {\"type\":...})
		credentialsJSON = strings.ReplaceAll(credentialsJSON, "\\\"", "\"")
	}

	ctx := context.Background()

	// Trích xuất ProjectID từ JSON để gán tường minh (Tránh lỗi project id is required)
	var cred struct {
		ProjectID string `json:"project_id"`
	}
	if err := json.Unmarshal([]byte(credentialsJSON), &cred); err != nil {
		log.Printf("⚠️ Cảnh báo: Lỗi parse JSON Firebase: %v. Có thể Config Vars trên Heroku nhập sai định dạng.", err)
	} else {
		log.Printf("✅ Parse Firebase JSON thành công, ProjectID: %s", cred.ProjectID)
	}

	// Sử dụng option.WithCredentialsJSON thay vì đọc từ file
	opt := option.WithCredentialsJSON([]byte(credentialsJSON))
	
	config := &firebase.Config{}
	if cred.ProjectID != "" {
		config.ProjectID = cred.ProjectID
	}

	app, err := firebase.NewApp(ctx, config, opt)
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
