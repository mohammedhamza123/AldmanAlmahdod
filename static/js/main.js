// قائمة التنقل للموبايل
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');

    // تأثير التمرير على شريط التنقل
    if (navbar) {
        let lastScroll = 0;
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // إغلاق القائمة عند النقر على رابط
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    // النموذج الآن يستخدم POST مباشرة، لا حاجة لـ JavaScript هنا

    // تأثير التمرير السلس
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // تأثير الظهور عند التمرير - محسن للأداء
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // استخدام requestAnimationFrame للأداء الأفضل
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                            entry.target.classList.add('animated');
                        }, Math.min(index * 80, 400)); // حد أقصى للتأخير
                    });
                    observer.unobserve(entry.target); // إيقاف المراقبة بعد الظهور
                }
            });
        }, observerOptions);

        // تطبيق التأثير على العناصر
        const animatedElements = document.querySelectorAll('.feature-card, .service-card, .value-card, .process-step, .info-item');
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(25px)';
            el.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
            observer.observe(el);
        });
    }

    // تأثير parallax محسن للأداء على hero section
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 768) {
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = Math.min(scrolled * 0.3, 200); // حد أقصى للحركة
            hero.style.transform = `translateY(${rate}px)`;
            ticking = false;
        }
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }
    
    // تحسين أداء الرسوم المتحركة
    if ('IntersectionObserver' in window) {
        const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-description, .hero-buttons, .hero-logo');
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.willChange = 'auto';
                }
            });
        }, { threshold: 0.5 });
        
        heroElements.forEach(el => heroObserver.observe(el));
    }

    // تحسين تجربة النماذج
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });

        // التحقق من القيم الموجودة عند التحميل
        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });
});

