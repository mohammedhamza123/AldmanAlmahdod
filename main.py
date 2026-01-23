from fastapi import FastAPI, Request, Form, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from itsdangerous import URLSafeTimedSerializer
from datetime import datetime
import database

app = FastAPI(title="شركة الضمان المحدود")

# إعداد المجلدات
BASE_DIR = Path(__file__).parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory="static"), name="static")

# تهيئة قاعدة البيانات
database.init_db()

# إعداد الجلسات
import os
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production-2024")
serializer = URLSafeTimedSerializer(SECRET_KEY)

# دالة للتحقق من تسجيل الدخول
def get_current_user(request: Request):
    """التحقق من تسجيل الدخول"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        return None
    try:
        username = serializer.loads(session_token, max_age=86400)  # 24 ساعة
        return username
    except Exception as e:
        print(f"Error loading session: {e}")  # للتشخيص
        return None

def require_auth(request: Request):
    """يتطلب تسجيل الدخول - إرجاع RedirectResponse مباشرة"""
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/admin/login", status_code=303)
    return user

# بيانات الشركة
company_data = {
    "name": "شركة الضمان المحدود لاستيراد المواد الغذائية والفواكه الطازجة",
    "address": "الزاوية – بالقرب من الإشارة الضوئية – الضمان",
    "phone1": "0910409689",
    "phone2": "0915776719",
    "email": "aldamanalmahdod@gmail.com"
}

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "company": company_data
    })

# ========== Keep-Alive Endpoints (لإبقاء الاستضافة نشطة) ==========

@app.get("/health")
async def health_check():
    """Health check endpoint لإبقاء الاستضافة نشطة"""
    return {"status": "ok", "message": "Server is running"}

@app.get("/ping")
async def ping():
    """Ping endpoint لإبقاء الاستضافة نشطة"""
    return {"status": "pong", "timestamp": datetime.now().isoformat()}

@app.get("/keep-alive")
async def keep_alive():
    """Keep-alive endpoint لإبقاء الاستضافة نشطة"""
    return {"status": "alive", "message": "Server is active", "timestamp": datetime.now().isoformat()}

@app.get("/about", response_class=HTMLResponse)
async def about(request: Request):
    return templates.TemplateResponse("about.html", {
        "request": request,
        "company": company_data
    })

@app.get("/services", response_class=HTMLResponse)
async def services(request: Request):
    return templates.TemplateResponse("services.html", {
        "request": request,
        "company": company_data
    })

@app.get("/contact", response_class=HTMLResponse)
async def contact(request: Request):
    return templates.TemplateResponse("contact.html", {
        "request": request,
        "company": company_data
    })

@app.post("/contact", response_class=HTMLResponse)
async def submit_contact(
    request: Request,
    name: str = Form(...),
    phone: str = Form(...),
    email: str = Form(""),
    message: str = Form(...)
):
    """حفظ رسالة التواصل"""
    try:
        database.save_message(name, phone, email, message)
        return templates.TemplateResponse("contact.html", {
            "request": request,
            "company": company_data,
            "success": True,
            "message": "شكراً لك! تم إرسال رسالتك بنجاح. سنتواصل معك قريباً."
        })
    except Exception as e:
        return templates.TemplateResponse("contact.html", {
            "request": request,
            "company": company_data,
            "error": True,
            "message": "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى."
        })

@app.get("/privacy", response_class=HTMLResponse)
async def privacy(request: Request):
    return templates.TemplateResponse("privacy.html", {
        "request": request,
        "company": company_data
    })

# ========== صفحات الإدارة ==========

@app.get("/admin/login", response_class=HTMLResponse)
async def admin_login_page(request: Request):
    """صفحة تسجيل الدخول"""
    user = get_current_user(request)
    if user:
        return RedirectResponse(url="/admin/dashboard", status_code=303)
    
    return templates.TemplateResponse("admin/login.html", {
        "request": request
    })

@app.post("/admin/login")
async def admin_login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...)
):
    """تسجيل الدخول"""
    if database.verify_password(username, password):
        # إنشاء جلسة
        try:
            session_token = serializer.dumps(username)
            response = RedirectResponse(url="/admin/dashboard", status_code=303)
            response.set_cookie(
                key="session_token",
                value=session_token,
                max_age=86400,  # 24 ساعة
                httponly=True,
                samesite="lax",
                secure=False  # True في الإنتاج مع HTTPS
            )
            return response
        except Exception as e:
            print(f"Error creating session: {e}")
            return templates.TemplateResponse("admin/login.html", {
                "request": request,
                "error": "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى."
            })
    else:
        return templates.TemplateResponse("admin/login.html", {
            "request": request,
            "error": "اسم المستخدم أو كلمة المرور غير صحيحة"
        })

@app.get("/admin/logout")
async def admin_logout():
    """تسجيل الخروج"""
    response = RedirectResponse(url="/admin/login", status_code=303)
    response.delete_cookie("session_token")
    return response

@app.get("/admin/dashboard", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    """لوحة التحكم - عرض الرسائل"""
    # التحقق من تسجيل الدخول
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/admin/login", status_code=303)
    
    messages = database.get_messages()
    unread_count = database.get_unread_count()
    
    return templates.TemplateResponse("admin/dashboard.html", {
        "request": request,
        "messages": messages,
        "unread_count": unread_count,
        "total_messages": len(messages)
    })

@app.post("/admin/message/{message_id}/read")
async def mark_message_read(message_id: int, request: Request):
    """تحديد الرسالة كمقروءة"""
    user = get_current_user(request)
    if not user:
        return JSONResponse({"status": "error", "message": "Unauthorized"}, status_code=401)
    
    database.mark_as_read(message_id)
    return {"status": "success"}

@app.post("/admin/message/{message_id}/delete")
async def delete_message(message_id: int, request: Request):
    """حذف رسالة"""
    user = get_current_user(request)
    if not user:
        return JSONResponse({"status": "error", "message": "Unauthorized"}, status_code=401)
    
    database.delete_message(message_id)
    return {"status": "success"}

@app.get("/admin/api/messages")
async def get_messages_api(request: Request):
    """API للحصول على الرسائل (للتحديث التلقائي)"""
    user = get_current_user(request)
    if not user:
        return JSONResponse({"status": "error", "message": "Unauthorized"}, status_code=401)
    
    messages = database.get_messages()
    unread_count = database.get_unread_count()
    
    return JSONResponse({
        "messages": messages,
        "unread_count": unread_count,
        "total_messages": len(messages)
    })

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

