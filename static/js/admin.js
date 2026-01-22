// لوحة التحكم - إدارة الرسائل
document.addEventListener('DOMContentLoaded', function() {
    // تحديد الرسالة كمقروءة
    document.querySelectorAll('.mark-read').forEach(btn => {
        btn.addEventListener('click', async function() {
            const messageId = this.getAttribute('data-id');
            const messageCard = this.closest('.message-card');
            
            try {
                const response = await fetch(`/admin/message/${messageId}/read`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    messageCard.classList.remove('unread');
                    this.remove();
                    
                    // تحديث العداد
                    updateUnreadCount();
                }
            } catch (error) {
                console.error('Error:', error);
                alert('حدث خطأ أثناء تحديث الرسالة');
            }
        });
    });
    
    // حذف الرسالة
    document.querySelectorAll('.delete-msg').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
                return;
            }
            
            const messageId = this.getAttribute('data-id');
            const messageCard = this.closest('.message-card');
            
            try {
                const response = await fetch(`/admin/message/${messageId}/delete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // تأثير الحذف
                    messageCard.style.transition = 'all 0.3s ease';
                    messageCard.style.opacity = '0';
                    messageCard.style.transform = 'translateX(100px)';
                    
                    setTimeout(() => {
                        messageCard.remove();
                        
                        // التحقق من وجود رسائل
                        const messagesList = document.querySelector('.messages-list');
                        if (messagesList && messagesList.children.length === 0) {
                            location.reload();
                        }
                    }, 300);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('حدث خطأ أثناء حذف الرسالة');
            }
        });
    });
    
    // تحديث عداد الرسائل غير المقروءة
    function updateUnreadCount() {
        const unreadCards = document.querySelectorAll('.message-card.unread');
        const unreadCountElement = document.querySelector('.stat-card.unread .stat-info h3');
        
        if (unreadCountElement) {
            unreadCountElement.textContent = unreadCards.length;
        }
    }
    
    // تأثيرات الظهور
    const messageCards = document.querySelectorAll('.message-card');
    messageCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // ========== تحديث تلقائي للرسائل (Real-time) ==========
    let lastMessageCount = parseInt(document.getElementById('total-messages').textContent) || 0;
    let isUpdating = false;

    async function updateMessages() {
        if (isUpdating) return;
        
        try {
            isUpdating = true;
            const refreshIcon = document.querySelector('.refresh-icon');
            if (refreshIcon) {
                refreshIcon.style.animation = 'spin 1s linear';
            }

            const response = await fetch('/admin/api/messages');
            const data = await response.json();

            // تحديث الإحصائيات
            document.getElementById('total-messages').textContent = data.total_messages;
            document.getElementById('unread-count').textContent = data.unread_count;

            // التحقق من وجود رسائل جديدة
            if (data.total_messages > lastMessageCount) {
                // هناك رسائل جديدة - إعادة تحميل القائمة
                renderMessages(data.messages);
                lastMessageCount = data.total_messages;
                
                // إشعار بصوت (اختياري)
                if (data.unread_count > 0) {
                    showNotification('رسالة جديدة!', 'تم استلام ' + (data.total_messages - lastMessageCount) + ' رسالة جديدة');
                }
            } else if (data.total_messages < lastMessageCount) {
                // تم حذف رسائل - إعادة تحميل القائمة
                renderMessages(data.messages);
                lastMessageCount = data.total_messages;
            } else {
                // تحديث حالة الرسائل الموجودة (مقروءة/غير مقروءة)
                updateExistingMessages(data.messages);
            }

            if (refreshIcon) {
                setTimeout(() => {
                    refreshIcon.style.animation = '';
                }, 1000);
            }
        } catch (error) {
            console.error('خطأ في تحديث الرسائل:', error);
        } finally {
            isUpdating = false;
        }
    }

    function renderMessages(messages) {
        const container = document.getElementById('messages-container');
        const messagesList = document.getElementById('messages-list');
        const emptyState = document.getElementById('empty-state');

        if (messages.length === 0) {
            if (messagesList) messagesList.remove();
            if (!emptyState) {
                container.innerHTML = `
                    <div class="empty-state" id="empty-state">
                        <div class="empty-icon">📭</div>
                        <h2>لا توجد رسائل</h2>
                        <p>لم يتم استلام أي رسائل حتى الآن</p>
                    </div>
                `;
            }
            return;
        }

        if (emptyState) emptyState.remove();

        let html = '<div class="messages-list" id="messages-list">';
        
        messages.forEach(msg => {
            const isRead = msg.is_read === 1 || msg.is_read === '1';
            const readClass = isRead ? '' : 'unread';
            const readButton = isRead ? '' : `
                <button class="btn-icon mark-read" data-id="${msg.id}" title="تحديد كمقروء">
                    ✓
                </button>
            `;
            
            const avatar = msg.name ? msg.name[0].toUpperCase() : '?';
            const phone = msg.phone ? `
                <div class="detail-item">
                    <span class="detail-icon">📱</span>
                    <span>${msg.phone}</span>
                </div>
            ` : '';
            const email = msg.email ? `
                <div class="detail-item">
                    <span class="detail-icon">✉️</span>
                    <span>${msg.email}</span>
                </div>
            ` : '';

            html += `
                <div class="message-card ${readClass}" data-id="${msg.id}">
                    <div class="message-header">
                        <div class="message-sender">
                            <div class="sender-avatar">${avatar}</div>
                            <div class="sender-info">
                                <h3>${escapeHtml(msg.name)}</h3>
                                <p class="message-time">${msg.created_at}</p>
                            </div>
                        </div>
                        <div class="message-actions">
                            ${readButton}
                            <button class="btn-icon delete-msg" data-id="${msg.id}" title="حذف">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="message-content">
                        <div class="message-details">
                            ${phone}
                            ${email}
                        </div>
                        <div class="message-text">
                            <p>${escapeHtml(msg.message)}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // إعادة ربط الأحداث
        attachEventListeners();
        
        // تأثيرات الظهور
        animateMessages();
    }

    function updateExistingMessages(messages) {
        messages.forEach(msg => {
            const card = document.querySelector(`.message-card[data-id="${msg.id}"]`);
            if (!card) return;

            const isRead = msg.is_read === 1 || msg.is_read === '1';
            const readButton = card.querySelector('.mark-read');

            if (isRead && !card.classList.contains('read-updated')) {
                card.classList.remove('unread');
                if (readButton) readButton.remove();
                card.classList.add('read-updated');
            }
        });
    }

    function attachEventListeners() {
        // إعادة ربط أحداث تحديد كمقروء
        document.querySelectorAll('.mark-read').forEach(btn => {
            btn.addEventListener('click', async function() {
                const messageId = this.getAttribute('data-id');
                const messageCard = this.closest('.message-card');
                
                try {
                    const response = await fetch(`/admin/message/${messageId}/read`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (response.ok) {
                        messageCard.classList.remove('unread');
                        this.remove();
                        updateUnreadCount();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('حدث خطأ أثناء تحديث الرسالة');
                }
            });
        });

        // إعادة ربط أحداث الحذف
        document.querySelectorAll('.delete-msg').forEach(btn => {
            btn.addEventListener('click', async function() {
                if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
                    return;
                }
                
                const messageId = this.getAttribute('data-id');
                const messageCard = this.closest('.message-card');
                
                try {
                    const response = await fetch(`/admin/message/${messageId}/delete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (response.ok) {
                        messageCard.style.transition = 'all 0.3s ease';
                        messageCard.style.opacity = '0';
                        messageCard.style.transform = 'translateX(100px)';
                        
                        setTimeout(() => {
                            messageCard.remove();
                            const messagesList = document.querySelector('.messages-list');
                            if (messagesList && messagesList.children.length === 0) {
                                updateMessages();
                            }
                        }, 300);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('حدث خطأ أثناء حذف الرسالة');
                }
            });
        });
    }

    function animateMessages() {
        const messageCards = document.querySelectorAll('.message-card');
        messageCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(title, message) {
        // إنشاء إشعار بسيط
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // تحديث كل 5 ثوان
    setInterval(updateMessages, 5000);
    
    // تحديث فوري عند تحميل الصفحة
    setTimeout(updateMessages, 2000);
});

