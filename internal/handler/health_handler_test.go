package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthHandler_GetAndHead(t *testing.T) {
	// Test GET
	reqGet := httptest.NewRequest(http.MethodGet, "/health", nil)
	rrGet := httptest.NewRecorder()
	HealthHandler(rrGet, reqGet)

	if rrGet.Code != http.StatusOK {
		t.Fatalf("Expected status 200 on GET, got %d", rrGet.Code)
	}
	var dataGet map[string]interface{}
	if err := json.Unmarshal(rrGet.Body.Bytes(), &dataGet); err != nil {
		t.Fatalf("Failed to parse JSON body on GET: %v", err)
	}
	if dataGet["status"] != "ok" {
		t.Errorf("Expected status 'ok', got %v", dataGet["status"])
	}

	// Test HEAD
	reqHead := httptest.NewRequest(http.MethodHead, "/health", nil)
	rrHead := httptest.NewRecorder()
	HealthHandler(rrHead, reqHead)

	if rrHead.Code != http.StatusOK {
		t.Fatalf("Expected status 200 on HEAD, got %d", rrHead.Code)
	}
	if rrHead.Body.Len() != 0 {
		t.Errorf("Expected empty body on HEAD, got %d bytes: %s", rrHead.Body.Len(), rrHead.Body.String())
	}
}

func TestPingHandler_GetAndHead(t *testing.T) {
	// Test GET
	reqGet := httptest.NewRequest(http.MethodGet, "/ping", nil)
	rrGet := httptest.NewRecorder()
	PingHandler(rrGet, reqGet)

	if rrGet.Code != http.StatusOK {
		t.Fatalf("Expected status 200 on GET, got %d", rrGet.Code)
	}
	var dataGet map[string]interface{}
	if err := json.Unmarshal(rrGet.Body.Bytes(), &dataGet); err != nil {
		t.Fatalf("Failed to parse JSON body on GET: %v", err)
	}
	if dataGet["status"] != "pong" {
		t.Errorf("Expected status 'pong', got %v", dataGet["status"])
	}

	// Test HEAD
	reqHead := httptest.NewRequest(http.MethodHead, "/ping", nil)
	rrHead := httptest.NewRecorder()
	PingHandler(rrHead, reqHead)

	if rrHead.Code != http.StatusOK {
		t.Fatalf("Expected status 200 on HEAD, got %d", rrHead.Code)
	}
	if rrHead.Body.Len() != 0 {
		t.Errorf("Expected empty body on HEAD, got %d bytes: %s", rrHead.Body.Len(), rrHead.Body.String())
	}

	// Test Disallowed method (e.g. POST)
	reqPost := httptest.NewRequest(http.MethodPost, "/ping", nil)
	rrPost := httptest.NewRecorder()
	PingHandler(rrPost, reqPost)

	if rrPost.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected status 405 on POST, got %d", rrPost.Code)
	}
}
