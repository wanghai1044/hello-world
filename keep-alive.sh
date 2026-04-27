#!/bin/bash
# keep-alive.sh - 保持服务活跃
# 每5分钟访问一次服务，防止休眠

URL="http://localhost:3000"
INTERVAL=300  # 5分钟

echo "保持活跃脚本已启动..."

while true; do
    curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null
    echo " [$(date '+%H:%M:%S')] 服务检查完成"
    sleep $INTERVAL
done
