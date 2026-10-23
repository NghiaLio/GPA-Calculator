package main

import "go-ssr/internal/app"

// Entrypoint ở thư mục gốc để các nền tảng PaaS (Render...) build được bằng lệnh mặc định.
func main() {
	app.Run()
}
