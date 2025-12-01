class JobPlatform {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupNotificationSystem();
    }

    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Закрытие меню при клике на ссылку
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    setupNotificationSystem() {
        // Создаем контейнер для уведомлений, если его нет
        if (!document.getElementById('notificationContainer')) {
            const notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(notificationContainer);
        }
    }

    // Получение текущего пользователя
    getCurrentUser() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
            return user;
        } catch (error) {
            console.error('Ошибка при получении пользователя:', error);
            return null;
        }
    }

    // Проверка авторизации
    checkAuth(requiredRole = 'user') {
        const user = this.getCurrentUser();
        
        if (!user) {
            window.location.href = 'auth.html';
            return false;
        }

        // Проверка ролей
        const roleHierarchy = {
            'user': ['user', 'moderator', 'admin'],
            'moderator': ['moderator', 'admin'],
            'admin': ['admin']
        };

        const allowedRoles = roleHierarchy[requiredRole] || ['user'];
        
        if (!allowedRoles.includes(user.status)) {
            jobPlatform.showNotification('Недостаточно прав для доступа к этой странице', 'error');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
            return false;
        }

        return true;
    }

    // Показать уведомление
    showNotification(message, type = 'success') {
        const notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; cursor: pointer; margin-left: 1rem; font-size: 1.2rem;">
                    &times;
                </button>
            </div>
        `;

        notificationContainer.appendChild(notification);

        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Валидация email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Валидация телефона
    validatePhone(phone) {
        const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        return phoneRegex.test(phone);
    }

    // Выход из системы
    logout() {
        localStorage.removeItem('currentUser');
        jobPlatform.showNotification('Вы успешно вышли из системы');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1000);
    }

    // Проверка, является ли пользователь администратором
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.status === 'admin';
    }

    // Проверка, является ли пользователь модератором или администратором
    isModerator() {
        const user = this.getCurrentUser();
        return user && (user.status === 'moderator' || user.status === 'admin');
    }

    // Проверка, является ли пользователь соискателем
    isJobSeeker() {
        const user = this.getCurrentUser();
        return user && user.role === 'jobseeker';
    }

    // Проверка, является ли пользователь работодателем
    isEmployer() {
        const user = this.getCurrentUser();
        return user && user.role === 'employer';
    }

    // Получение роли пользователя в текстовом формате
    getUserRole() {
        const user = this.getCurrentUser();
        if (!user) return 'Гость';
        
        const roles = {
            'user': 'Пользователь',
            'moderator': 'Модератор',
            'admin': 'Администратор',
            'jobseeker': 'Соискатель',
            'employer': 'Работодатель'
        };
        
        return roles[user.role] || roles[user.status] || 'Пользователь';
    }

    // Получение текстового представления роли для интерфейса
    getUserRoleText() {
        const user = this.getCurrentUser();
        if (!user) return 'Гость';
        
        const roles = {
            'jobseeker': 'Соискатель',
            'employer': 'Работодатель',
            'moderator': 'Модератор',
            'admin': 'Администратор'
        };
        
        return roles[user.role] || roles[user.status] || 'Пользователь';
    }

    // Получение URL для профиля пользователя в зависимости от роли
    getUserProfileUrl() {
        const user = this.getCurrentUser();
        if (!user) return 'auth.html';
        
        if (user.status === 'moderator') {
            return 'moder.html';
        } else if (user.status === 'admin') {
            return 'admin.html';
        } else if (user.role === 'employer') {
            return 'worker.html';
        } else {
            return 'profile.html';
        }
    }

    // Проверка доступа к странице в зависимости от роли
    checkPageAccess() {
        const user = this.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();
        
        if (!user) {
            if (currentPage !== 'auth.html' && currentPage !== 'index.html') {
                window.location.href = 'auth.html';
            }
            return;
        }

        // Модератор может заходить только на страницу модерации
        if (user.status === 'moderator' && currentPage !== 'moder.html' && currentPage !== 'auth.html' && currentPage !== 'index.html') {
            window.location.href = 'moder.html';
            return;
        }

        // Проверка доступа к страницам в зависимости от роли
        switch (currentPage) {
            case 'profile.html':
                if (user.role === 'employer') {
                    window.location.href = 'worker.html';
                }
                break;
            case 'worker.html':
                if (user.role !== 'employer') {
                    window.location.href = 'profile.html';
                }
                break;
            case 'resume-create.html':
                if (user.status === 'moderator') {
                    window.location.href = 'moder.html';
                } else if (user.role !== 'jobseeker') {
                    jobPlatform.showNotification('Эта страница доступна только соискателям', 'error');
                    setTimeout(() => {
                        window.location.href = this.getUserProfileUrl();
                    }, 2000);
                }
                break;
            case 'admin.html':
                if (user.status !== 'admin') {
                    jobPlatform.showNotification('Недостаточно прав для доступа к админ-панели', 'error');
                    setTimeout(() => {
                        window.location.href = this.getUserProfileUrl();
                    }, 2000);
                }
                break;
            case 'moder.html':
                if (user.status !== 'moderator') {
                    jobPlatform.showNotification('Недостаточно прав для доступа к панели модератора', 'error');
                    setTimeout(() => {
                        window.location.href = this.getUserProfileUrl();
                    }, 2000);
                }
                break;
        }
    }

    // Получение доступных действий для пользователя
    getAvailableActions() {
        const user = this.getCurrentUser();
        if (!user) return [];

        const actions = {
            jobseeker: [
                { name: 'Создать резюме', url: 'resume-create.html', icon: '📝' },
                { name: 'Мои резюме', url: 'profile.html#resumes', icon: '📄' },
                { name: 'Мои отклики', url: 'profile.html#applications', icon: '✉️' },
                { name: 'Поиск вакансий', url: 'jobs.html', icon: '🔍' }
            ],
            employer: [
                { name: 'Создать вакансию', url: 'vacancy-create.html', icon: '🏢' },
                { name: 'Мои вакансии', url: 'worker.html#vacancies', icon: '📋' },
                { name: 'Отклики на вакансии', url: 'worker.html#responses', icon: '👥' },
                { name: 'Поиск резюме', url: 'resumes-search.html', icon: '🔍' }
            ],
            moderator: [
                { name: 'Модерация резюме', url: 'moder.html#resumes', icon: '📄' },
                { name: 'Модерация вакансий', url: 'moder.html#vacancies', icon: '🏢' },
                { name: 'Статистика', url: 'moder.html#stats', icon: '📊' }
            ],
            admin: [
                { name: 'Управление пользователями', url: 'admin.html#users', icon: '👥' },
                { name: 'Управление модераторами', url: 'admin.html#moderators', icon: '🛡️' },
                { name: 'Статистика платформы', url: 'admin.html#stats', icon: '📈' }
            ]
        };

        return actions[user.role] || actions[user.status] || [];
    }
}

// Глобальные стили для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(notificationStyles);

// Инициализация глобального объекта
window.jobPlatform = new JobPlatform();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию на защищенных страницах
    const protectedPages = ['profile.html', 'admin.html', 'resume-create.html', 'worker.html', 'moder.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const user = jobPlatform.getCurrentUser();
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
    }
    
    // Проверяем доступ к странице в зависимости от роли
    jobPlatform.checkPageAccess();
    
    // Обновляем навигацию в зависимости от авторизации
    jobPlatform.updateNavigation();
});

// Метод для обновления навигации
JobPlatform.prototype.updateNavigation = function() {
    const user = this.getCurrentUser();
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navMenu) return;
    
    // Находим кнопку профиля/входа
    const authButton = navMenu.querySelector('a[href="profile.html"], a[href="auth.html"]');
    
    if (user) {
        // Пользователь авторизован
        if (authButton) {
            const roleText = this.getUserRoleText();
            authButton.textContent = roleText;
            authButton.href = this.getUserProfileUrl();
        }
        
        // Добавляем кнопку выхода, если её нет
        if (!navMenu.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'nav-btn logout-btn';
            logoutBtn.textContent = 'Выйти';
            logoutBtn.addEventListener('click', () => jobPlatform.logout());
            
            const li = document.createElement('li');
            li.appendChild(logoutBtn);
            navMenu.appendChild(li);
        }
        
        // Добавляем ссылку на админ-панель только для админов (не для модераторов)
        if (user.status === 'admin' && !navMenu.querySelector('a[href="admin.html"]')) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.textContent = 'Админ-панель';
            
            const li = document.createElement('li');
            li.appendChild(adminLink);
            navMenu.insertBefore(li, navMenu.lastChild);
        }
        
        // Модератор не должен видеть дополнительные ссылки в навигации
        if (user.status === 'moderator') {
            // Удаляем ссылку на поиск работы, если она есть
            const jobsLink = navMenu.querySelector('a[href="jobs.html"]');
            if (jobsLink) {
                jobsLink.closest('li').remove();
            }
            // Модератор остается только на странице модерации
            return;
        }
        
        // Добавляем ссылки в зависимости от роли
        if (user.role === 'employer' && !navMenu.querySelector('a[href="worker.html"]')) {
            const workerLink = document.createElement('a');
            workerLink.href = 'worker.html';
            workerLink.textContent = 'Мои вакансии';
            
            const li = document.createElement('li');
            li.appendChild(workerLink);
            navMenu.insertBefore(li, navMenu.querySelector('.logout-btn').parentElement);
        }
        
        // Добавляем ссылку на создание резюме для соискателей
        if (user.role === 'jobseeker' && !navMenu.querySelector('a[href="resume-create.html"]')) {
            const resumeLink = document.createElement('a');
            resumeLink.href = 'resume-create.html';
            resumeLink.textContent = 'Создать резюме';
            
            const li = document.createElement('li');
            li.appendChild(resumeLink);
            navMenu.insertBefore(li, navMenu.querySelector('.logout-btn').parentElement);
        }
        
        // Добавляем ссылку на поиск работы для всех (кроме модератора)
        if (!navMenu.querySelector('a[href="jobs.html"]')) {
            const jobsLink = document.createElement('a');
            jobsLink.href = 'jobs.html';
            jobsLink.textContent = 'Поиск работы';
            
            const li = document.createElement('li');
            li.appendChild(jobsLink);
            navMenu.insertBefore(li, navMenu.querySelector('.logout-btn').parentElement);
        }
    } else {
        // Пользователь не авторизован
        if (authButton) {
            authButton.textContent = 'Войти';
            authButton.href = 'auth.html';
        }
        
        // Удаляем кнопку выхода
        const logoutBtn = navMenu.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.closest('li').remove();
        }
        
        // Удаляем ссылку на админ-панель
        const adminLink = navMenu.querySelector('a[href="admin.html"], a[href="moder.html"]');
        if (adminLink) {
            adminLink.closest('li').remove();
        }
        
        // Удаляем ссылку на worker
        const workerLink = navMenu.querySelector('a[href="worker.html"]');
        if (workerLink) {
            workerLink.closest('li').remove();
        }
        
        // Удаляем ссылку на создание резюме
        const resumeLink = navMenu.querySelector('a[href="resume-create.html"]');
        if (resumeLink) {
            resumeLink.closest('li').remove();
        }
        
        // Удаляем ссылку на поиск работы для модераторов
        const jobsLink = navMenu.querySelector('a[href="jobs.html"]');
        if (jobsLink && user && user.status === 'moderator') {
            jobsLink.closest('li').remove();
        } else if (!jobsLink && (!user || user.status !== 'moderator')) {
            // Добавляем ссылку на поиск работы если её нет (только для не-модераторов)
            const newJobsLink = document.createElement('a');
            newJobsLink.href = 'jobs.html';
            newJobsLink.textContent = 'Поиск работы';
            
            const li = document.createElement('li');
            li.appendChild(newJobsLink);
            navMenu.insertBefore(li, navMenu.lastChild);
        }
    }
};

// Вспомогательные функции для работы с ролями
JobPlatform.prototype.getUserDisplayInfo = function() {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    return {
        name: user.fullName,
        role: this.getUserRoleText(),
        avatar: user.avatar || 'images/default-avatar.png',
        profileUrl: this.getUserProfileUrl()
    };
};

// Метод для проверки может ли пользователь создавать резюме
JobPlatform.prototype.canCreateResume = function() {
    return this.isJobSeeker();
};

// Метод для проверки может ли пользователь создавать вакансии
JobPlatform.prototype.canCreateVacancy = function() {
    return this.isEmployer();
};

// Метод для проверки может ли пользователь модерировать контент
JobPlatform.prototype.canModerate = function() {
    return this.isModerator();
};

// Метод для получения настроек пользователя
JobPlatform.prototype.getUserSettings = function() {
    const user = this.getCurrentUser();
    if (!user) return {};
    
    return {
        notifications: user.notifications !== false,
        emailUpdates: user.emailUpdates !== false,
        theme: user.theme || 'light'
    };
};