import sqlite3
import hashlib
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "database.db"

def init_db():
    """تهيئة قاعدة البيانات وإنشاء الجداول"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # جدول المسؤولين (حساب واحد فقط)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # جدول الرسائل
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read INTEGER DEFAULT 0
        )
    ''')
    
    # إنشاء حساب المسؤول الافتراضي إذا لم يكن موجوداً
    # اسم المستخدم: admin
    # كلمة المرور: admin123 (يجب تغييرها في الإنتاج!)
    default_password = hashlib.sha256("admin123".encode()).hexdigest()
    cursor.execute('''
        INSERT OR IGNORE INTO admin (username, password_hash)
        VALUES (?, ?)
    ''', ("admin", default_password))
    
    conn.commit()
    conn.close()

def verify_password(username: str, password: str) -> bool:
    """التحقق من اسم المستخدم وكلمة المرور"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    cursor.execute('''
        SELECT id FROM admin 
        WHERE username = ? AND password_hash = ?
    ''', (username, password_hash))
    
    result = cursor.fetchone()
    conn.close()
    
    return result is not None

def save_message(name: str, phone: str, email: str, message: str):
    """حفظ رسالة جديدة"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO messages (name, phone, email, message)
        VALUES (?, ?, ?, ?)
    ''', (name, phone, email, message))
    
    conn.commit()
    conn.close()

def get_messages():
    """الحصول على جميع الرسائل"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM messages 
        ORDER BY created_at DESC
    ''')
    
    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return messages

def mark_as_read(message_id: int):
    """تحديد الرسالة كمقروءة"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE messages 
        SET is_read = 1 
        WHERE id = ?
    ''', (message_id,))
    
    conn.commit()
    conn.close()

def delete_message(message_id: int):
    """حذف رسالة"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM messages WHERE id = ?', (message_id,))
    
    conn.commit()
    conn.close()

def get_unread_count():
    """الحصول على عدد الرسائل غير المقروءة"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM messages WHERE is_read = 0')
    count = cursor.fetchone()[0]
    conn.close()
    
    return count



