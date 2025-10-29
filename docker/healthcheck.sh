#!/bin/sh

# Health check script for Docker container

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "nginx is not running"
    exit 1
fi

# Check if the application responds to HTTP requests
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health)

if [ "$response" != "200" ]; then
    echo "Health check failed with HTTP status: $response"
    exit 1
fi

# Check if critical files exist
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "index.html not found"
    exit 1
fi

# Check if static assets are accessible
css_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/assets/index.css)
if [ "$css_response" != "200" ]; then
    echo "CSS assets not accessible: $css_response"
    exit 1
fi

echo "Health check passed"
exit 0