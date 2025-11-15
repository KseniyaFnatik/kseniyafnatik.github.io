// Админ-панель - функции для работы с админкой

// Проверка авторизации админа
function isAdminLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

// Вход в админ-панель
async function adminLogin(username, password) {
    try {
        // Загружаем пользователей из файла
        const response = await fetch('data/user.json');
        if (!response.ok) {
            showNotification('Ошибка загрузки данных!', 'error');
            return false;
        }
        
        const users = await response.json();
        if (!Array.isArray(users)) {
            showNotification('Ошибка формата данных!', 'error');
            return false;
        }
        
        // Ищем пользователя по логину и паролю
        const normalizedUsername = username.trim().toLowerCase();
        const adminUser = users.find(u => {
            const userLogin = (u.login || u.username || '').toLowerCase();
            return userLogin === normalizedUsername && u.password === password;
        });
        
        // Проверяем статус пользователя из базы данных
        const userStatus = adminUser?.status || 'applicant';
        const isAdmin = userStatus === 'admin';
        
        if (isAdmin && adminUser) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showNotification('Вход выполнен успешно!', 'success');
            
            // Показываем админ-панель
            document.getElementById('admin-login-section').style.display = 'none';
            document.getElementById('admin-panel').classList.add('active');
            
            // Загружаем данные
            loadAdminData();
            
            return true;
        } else {
            showNotification('Неверный логин или пароль!', 'error');
            return false;
        }
    } catch (error) {
        console.error('Ошибка входа в админ-панель:', error);
        showNotification('Ошибка подключения к серверу!', 'error');
        return false;
    }
}

// Выход из админ-панели
function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    // Перенаправляем на обычную страницу входа
    window.location.href = 'login.html';
}

// Загрузка данных для админ-панели
async function loadAdminData() {
    // Загружаем пользователей
    await loadUsersData();
    
    // Загружаем резюме
    loadResumesData();
    
    // Загружаем отклики
    loadApplicationsData();
    
    // Загружаем вакансии
    await loadJobsData();
    
    // Обновляем статистику
    updateStats();
}

// Загрузка данных пользователей
async function loadUsersData() {
    try {
        // Сначала пытаемся загрузить из localStorage
        let users = [];
        const usersFromStorage = localStorage.getItem('users');
        
        if (usersFromStorage) {
            try {
                users = JSON.parse(usersFromStorage);
            } catch (e) {
                console.error('Ошибка парсинга пользователей из localStorage:', e);
            }
        }
        
        // Если в localStorage нет данных, загружаем из файла
        if (users.length === 0) {
            const response = await fetch('data/user.json');
            if (response.ok) {
                users = await response.json();
            }
        }
        
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Нет пользователей</td></tr>';
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            const regDate = user.registrationDate 
                ? new Date(user.registrationDate).toLocaleDateString('ru-RU')
                : 'Не указана';
            
            row.innerHTML = `
                <td>${user.id || 'N/A'}</td>
                <td>${user.fio || 'Не указано'}</td>
                <td>${user.login || user.username || 'N/A'}</td>
                <td>${user.phone || 'Не указан'}</td>
                <td>${regDate}</td>
            `;
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        const tbody = document.getElementById('users-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">Ошибка загрузки данных</td></tr>';
        }
    }
}

// Загрузка данных резюме
function loadResumesData() {
    try {
        const resumes = loadResumes();
        const tbody = document.getElementById('resumes-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (resumes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Нет резюме</td></tr>';
            return;
        }
        
        resumes.forEach(resume => {
            const row = document.createElement('tr');
            const createdDate = resume.createdAt 
                ? new Date(resume.createdAt).toLocaleDateString('ru-RU')
                : 'Не указана';
            
            row.innerHTML = `
                <td>${resume.id || 'N/A'}</td>
                <td>${resume.fullName || 'Не указано'}</td>
                <td>${resume.phone || 'Не указан'}</td>
                <td>${resume.email || 'Не указан'}</td>
                <td>${createdDate}</td>
            `;
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка загрузки резюме:', error);
        const tbody = document.getElementById('resumes-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">Ошибка загрузки данных</td></tr>';
        }
    }
}

// Загрузка данных откликов
function loadApplicationsData() {
    try {
        const applications = loadApplications();
        const tbody = document.getElementById('applications-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (applications.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Нет откликов</td></tr>';
            return;
        }
        
        const statusText = {
            'sent': 'Отправлено',
            'viewed': 'Просмотрено',
            'invited': 'Приглашение',
            'rejected': 'Отклонено'
        };
        
        applications.forEach(application => {
            const row = document.createElement('tr');
            const createdDate = application.createdAt 
                ? new Date(application.createdAt).toLocaleDateString('ru-RU')
                : 'Не указана';
            
            row.innerHTML = `
                <td>${application.id || 'N/A'}</td>
                <td>${application.jobTitle || 'Не указано'}</td>
                <td>${application.company || 'Не указана'}</td>
                <td>${statusText[application.status] || application.status || 'Не указан'}</td>
                <td>${createdDate}</td>
            `;
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка загрузки откликов:', error);
        const tbody = document.getElementById('applications-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">Ошибка загрузки данных</td></tr>';
        }
    }
}

// Загрузка данных вакансий
async function loadJobsData() {
    try {
        const jobs = await loadJobs();
        // Данные вакансий используются только для статистики
        return jobs;
    } catch (error) {
        console.error('Ошибка загрузки вакансий:', error);
        return [];
    }
}

// Обновление статистики
async function updateStats() {
    try {
        // Пользователи
        let users = [];
        const usersFromStorage = localStorage.getItem('users');
        if (usersFromStorage) {
            try {
                users = JSON.parse(usersFromStorage);
            } catch (e) {
                console.error('Ошибка парсинга пользователей:', e);
            }
        }
        
        if (users.length === 0) {
            const response = await fetch('data/user.json');
            if (response.ok) {
                users = await response.json();
            }
        }
        
        // Резюме
        const resumes = loadResumes();
        
        // Отклики
        const applications = loadApplications();
        
        // Вакансии
        const jobs = await loadJobs();
        
        // Обновляем счетчики
        document.getElementById('users-count').textContent = users.length || 0;
        document.getElementById('resumes-count').textContent = resumes.length || 0;
        document.getElementById('applications-count').textContent = applications.length || 0;
        document.getElementById('jobs-count').textContent = jobs.length || 0;
    } catch (error) {
        console.error('Ошибка обновления статистики:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, авторизован ли админ
    if (isAdminLoggedIn()) {
        document.getElementById('admin-login-section').style.display = 'none';
        document.getElementById('admin-panel').classList.add('active');
        loadAdminData();
    } else {
        document.getElementById('admin-login-section').style.display = 'block';
        document.getElementById('admin-panel').classList.remove('active');
    }
    
    // Обработка формы входа
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-username').value.trim();
            const password = document.getElementById('admin-password').value;
            
            if (!username) {
                showNotification('Пожалуйста, введите логин!', 'error');
                return;
            }
            
            if (!password) {
                showNotification('Пожалуйста, введите пароль!', 'error');
                return;
            }
            
            await adminLogin(username, password);
        });
    }
    
    // Обработка кнопки выхода
    const logoutAdminBtn = document.getElementById('logoutAdminBtn');
    if (logoutAdminBtn) {
        logoutAdminBtn.addEventListener('click', () => {
            adminLogout();
        });
    }
});

