package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	Port                    string
	FirebaseCredentialsJSON string
}

func LoadConfig(envFile string) *AppConfig {
	err := godotenv.Load(envFile)
	if err != nil {
		log.Println("⚠️ Không tìm thấy file .env, sẽ sử dụng biến môi trường hệ thống")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fbJSON := os.Getenv("FIREBASE_CREDENTIALS_JSON")
	if fbJSON == "" {
		log.Println("⚠️ Cảnh báo: FIREBASE_CREDENTIALS_JSON chưa được thiết lập")
	}

	return &AppConfig{
		Port:                    port,
		FirebaseCredentialsJSON: fbJSON,
	}
}
