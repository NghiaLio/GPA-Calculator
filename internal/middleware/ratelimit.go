package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// IPTracker holds the rate limiter for each IP address
type IPTracker struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	// mu protects the ips map
	mu sync.Mutex
	// ips maps IP addresses to their rate limiters
	ips = make(map[string]*IPTracker)
)

// init starts a background goroutine to clean up old IP entries every 5 minutes
func init() {
	go func() {
		for {
			time.Sleep(5 * time.Minute)
			cleanupOldIPs()
		}
	}()
}

func cleanupOldIPs() {
	mu.Lock()
	defer mu.Unlock()
	
	// Remove IPs that haven't been seen in the last 10 minutes
	for ip, tracker := range ips {
		if time.Since(tracker.lastSeen) > 10*time.Minute {
			delete(ips, ip)
		}
	}
}

// getLimiter returns the rate limiter for a specific IP.
// rps = requests per second, burst = max burst size
func getLimiter(ip string, rps rate.Limit, burst int) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	tracker, exists := ips[ip]
	if !exists {
		limiter := rate.NewLimiter(rps, burst)
		ips[ip] = &IPTracker{limiter: limiter, lastSeen: time.Now()}
		return limiter
	}

	tracker.lastSeen = time.Now()
	return tracker.limiter
}

// RateLimit middleware applies IP-based rate limiting.
func RateLimit(rps float64, burst int) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract IP Address
			ip, _, err := net.SplitHostPort(r.RemoteAddr)
			if err != nil {
				ip = r.RemoteAddr
			}

			limiter := getLimiter(ip, rate.Limit(rps), burst)
			
			if !limiter.Allow() {
				http.Error(w, "Too Many Requests - Please try again later", http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
