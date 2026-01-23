"""
سكريبت لإبقاء الاستضافة نشطة
يمكن تشغيله على جهازك أو على خدمة مجانية مثل UptimeRobot
"""
import requests
import time
from datetime import datetime

# رابط موقعك (غيّره بعد النشر)
SITE_URL = "https://aldmanalmahdod.onrender.com/"  # غيّر هذا برابط موقعك

# Endpoints للإبقاء على الاستضافة نشطة
ENDPOINTS = [
    "/",
    "/health",
    "/ping",
    "/keep-alive"
]

def ping_site():
    """إرسال طلب لإبقاء الموقع نشطاً"""
    for endpoint in ENDPOINTS:
        try:
            url = f"{SITE_URL}{endpoint}"
            response = requests.get(url, timeout=10)
            print(f"[{datetime.now()}] {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"[{datetime.now()}] Error pinging {endpoint}: {e}")

if __name__ == "__main__":
    print("Starting keep-alive service...")
    print(f"Target: {SITE_URL}")
    
    while True:
        ping_site()
        # انتظر 10 دقائق قبل الطلب التالي
        time.sleep(600)  # 600 ثانية = 10 دقائق

