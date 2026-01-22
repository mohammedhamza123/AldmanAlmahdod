# دليل نشر الموقع على الاستضافة المجانية

## خيارات الاستضافة المجانية الموصى بها:

### 1. Render.com (موصى به) ⭐

**المميزات:**
- ✅ مجاني بالكامل
- ✅ يدعم FastAPI
- ✅ SSL مجاني
- ✅ سهل الإعداد
- ✅ قاعدة بيانات مجانية

**خطوات النشر:**

1. **إنشاء حساب على Render:**
   - اذهب إلى: https://render.com
   - سجل حساب جديد (يمكن استخدام GitHub)

2. **رفع المشروع على GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. **إنشاء خدمة جديدة على Render:**
   - اضغط على "New +" → "Web Service"
   - اربط مستودع GitHub الخاص بك
   - اختر المستودع

4. **إعدادات الخدمة:**
   - **Name:** aldamanalmahdod (أو أي اسم تريده)
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python -c "import os; port = int(os.environ.get('PORT', 8000)); import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=port)"`

5. **إضافة متغيرات البيئة:**
   - اضغط على "Environment"
   - أضف: `SECRET_KEY` (قيمة عشوائية قوية)

6. **النشر:**
   - اضغط "Create Web Service"
   - انتظر حتى يكتمل البناء (5-10 دقائق)
   - ستحصل على رابط مثل: `https://aldamanalmahdod.onrender.com`

---

### 2. Railway.app

**المميزات:**
- ✅ مجاني (500 ساعة/شهر)
- ✅ سهل جداً
- ✅ SSL مجاني

**خطوات النشر:**

1. اذهب إلى: https://railway.app
2. سجل حساب (يمكن استخدام GitHub)
3. اضغط "New Project" → "Deploy from GitHub repo"
4. اختر المستودع
5. Railway سيكتشف المشروع تلقائياً
6. أضف متغير البيئة `SECRET_KEY`
7. ستحصل على رابط تلقائياً

---

### 3. Fly.io

**المميزات:**
- ✅ مجاني (3 تطبيقات)
- ✅ سريع
- ✅ SSL مجاني

**خطوات النشر:**

1. ثبت Fly CLI:
   ```bash
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. سجل حساب:
   ```bash
   fly auth signup
   ```

3. انشر المشروع:
   ```bash
   fly launch
   ```

---

### 4. PythonAnywhere

**المميزات:**
- ✅ مجاني (محدود)
- ✅ مخصص للـ Python
- ✅ سهل الاستخدام

**خطوات النشر:**

1. اذهب إلى: https://www.pythonanywhere.com
2. سجل حساب مجاني
3. ارفع الملفات عبر File Manager
4. أنشئ تطبيق ويب جديد
5. حدد مسار الملفات
6. أضف متغيرات البيئة

---

## ملاحظات مهمة:

### قبل النشر:

1. **تغيير SECRET_KEY:**
   - استخدم مولد كلمات مرور قوية
   - لا تشارك SECRET_KEY أبداً

2. **تحديث قاعدة البيانات:**
   - قاعدة البيانات SQLite ستعمل على الاستضافة
   - للاستخدام الكبير، استخدم PostgreSQL (متوفر على Render مجاناً)

3. **تحديث الروابط:**
   - بعد النشر، تأكد من أن جميع الروابط تعمل
   - اختبر جميع الصفحات

4. **الأمان:**
   - غير كلمة مرور المسؤول الافتراضية
   - استخدم HTTPS دائماً

---

## استكشاف الأخطاء:

### المشكلة: التطبيق لا يعمل
- تحقق من Logs في لوحة التحكم
- تأكد من أن جميع المكتبات مثبتة
- تحقق من Start Command

### المشكلة: قاعدة البيانات لا تعمل
- تأكد من أن ملف database.db موجود
- تحقق من الصلاحيات

### المشكلة: الصور لا تظهر
- تأكد من رفع مجلد static/images
- تحقق من المسارات

---

## روابط مفيدة:

- Render.com: https://render.com
- Railway.app: https://railway.app
- Fly.io: https://fly.io
- PythonAnywhere: https://www.pythonanywhere.com

---

**نصيحة:** ابدأ بـ Render.com لأنه الأسهل والأكثر استقراراً للمشاريع المجانية.

