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
    
    // Загружаем данные для модерации
    await loadJobsModerationData();
    loadResumesModerationData();
    
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

// ========== МОДЕРАЦИЯ КОНТЕНТА ==========

// Загрузка данных вакансий для модерации
async function loadJobsModerationData() {
    try {
        const jobs = await loadJobs();
        const tbody = document.getElementById('jobs-moderation-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (jobs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Нет вакансий</td></tr>';
            return;
        }
        
        const moderationStatusText = {
            'pending': 'На модерации',
            'approved': 'Одобрено',
            'rejected': 'Отклонено'
        };
        
        const moderationStatusStyle = {
            'pending': 'background: #fef3c7; color: #92400e;',
            'approved': 'background: #d1fae5; color: #065f46;',
            'rejected': 'background: #fee2e2; color: #991b1b;'
        };
        
        jobs.forEach((job, index) => {
            const row = document.createElement('tr');
            const date = job.datePosted 
                ? new Date(job.datePosted).toLocaleDateString('ru-RU')
                : 'Не указана';
            
            const moderationStatus = job.moderationStatus || 'pending';
            const statusText = moderationStatusText[moderationStatus] || 'На модерации';
            const statusStyle = moderationStatusStyle[moderationStatus] || moderationStatusStyle['pending'];
            
            row.innerHTML = `
                <td>${String(index + 1).padStart(3, '0')}</td>
                <td>${job.title || 'Не указано'}</td>
                <td>${job.company || 'Не указана'}</td>
                <td>
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; ${statusStyle}">
                        ${statusText}
                    </span>
                </td>
                <td>${date}</td>
                <td style="display: flex; gap: 5px; flex-wrap: wrap;">
                    ${moderationStatus !== 'approved' ? `
                        <button class="btn btn-small btn-success approve-job-btn" data-job-id="${job.id}" title="Одобрить">✓</button>
                    ` : ''}
                    ${moderationStatus !== 'rejected' ? `
                        <button class="btn btn-small btn-danger reject-job-btn" data-job-id="${job.id}" title="Отклонить">✗</button>
                    ` : ''}
                    <button class="btn btn-small btn-secondary delete-job-admin-btn" data-job-id="${job.id}" title="Удалить">🗑</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Обработчики для кнопок модерации вакансий
        document.querySelectorAll('.approve-job-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jobId = e.target.getAttribute('data-job-id');
                moderateJob(jobId, 'approved');
            });
        });
        
        document.querySelectorAll('.reject-job-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jobId = e.target.getAttribute('data-job-id');
                moderateJob(jobId, 'rejected');
            });
        });
        
        document.querySelectorAll('.delete-job-admin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jobId = e.target.getAttribute('data-job-id');
                if (confirm('Вы уверены, что хотите удалить эту вакансию?')) {
                    deleteJobAdmin(jobId);
                }
            });
        });
    } catch (error) {
        console.error('Ошибка загрузки вакансий для модерации:', error);
        const tbody = document.getElementById('jobs-moderation-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #ef4444;">Ошибка загрузки данных</td></tr>';
        }
    }
}

// Загрузка данных резюме для модерации
function loadResumesModerationData() {
    try {
        const resumes = loadResumes();
        const tbody = document.getElementById('resumes-moderation-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (resumes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Нет резюме</td></tr>';
            return;
        }
        
        const moderationStatusText = {
            'pending': 'На модерации',
            'approved': 'Одобрено',
            'rejected': 'Отклонено'
        };
        
        const moderationStatusStyle = {
            'pending': 'background: #fef3c7; color: #92400e;',
            'approved': 'background: #d1fae5; color: #065f46;',
            'rejected': 'background: #fee2e2; color: #991b1b;'
        };
        
        resumes.forEach((resume, index) => {
            const row = document.createElement('tr');
            const createdDate = resume.createdAt 
                ? new Date(resume.createdAt).toLocaleDateString('ru-RU')
                : 'Не указана';
            
            const moderationStatus = resume.moderationStatus || 'pending';
            const statusText = moderationStatusText[moderationStatus] || 'На модерации';
            const statusStyle = moderationStatusStyle[moderationStatus] || moderationStatusStyle['pending'];
            
            row.innerHTML = `
                <td>${String(index + 1).padStart(3, '0')}</td>
                <td>${resume.fullName || 'Не указано'}</td>
                <td>${resume.phone || 'Не указан'}</td>
                <td>${resume.email || 'Не указан'}</td>
                <td>
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; ${statusStyle}">
                        ${statusText}
                    </span>
                </td>
                <td>${createdDate}</td>
                <td style="display: flex; gap: 5px; flex-wrap: wrap;">
                    ${moderationStatus !== 'approved' ? `
                        <button class="btn btn-small btn-success approve-resume-btn" data-resume-id="${resume.id}" title="Одобрить">✓</button>
                    ` : ''}
                    ${moderationStatus !== 'rejected' ? `
                        <button class="btn btn-small btn-danger reject-resume-btn" data-resume-id="${resume.id}" title="Отклонить">✗</button>
                    ` : ''}
                    <button class="btn btn-small btn-secondary delete-resume-admin-btn" data-resume-id="${resume.id}" title="Удалить">🗑</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Обработчики для кнопок модерации резюме
        document.querySelectorAll('.approve-resume-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resumeId = e.target.getAttribute('data-resume-id');
                moderateResume(resumeId, 'approved');
            });
        });
        
        document.querySelectorAll('.reject-resume-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resumeId = e.target.getAttribute('data-resume-id');
                moderateResume(resumeId, 'rejected');
            });
        });
        
        document.querySelectorAll('.delete-resume-admin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resumeId = e.target.getAttribute('data-resume-id');
                if (confirm('Вы уверены, что хотите удалить это резюме?')) {
                    deleteResumeAdmin(resumeId);
                }
            });
        });
    } catch (error) {
        console.error('Ошибка загрузки резюме для модерации:', error);
        const tbody = document.getElementById('resumes-moderation-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ef4444;">Ошибка загрузки данных</td></tr>';
        }
    }
}

// Модерация вакансии
async function moderateJob(jobId, status) {
    try {
        const jobs = await loadJobs();
        const jobIndex = jobs.findIndex(job => job.id === jobId);
        
        if (jobIndex === -1) {
            showNotification('Вакансия не найдена!', 'error');
            return false;
        }
        
        jobs[jobIndex].moderationStatus = status;
        jobs[jobIndex].moderatedAt = new Date().toISOString();
        
        if (saveJobs(jobs)) {
            // Создаем уведомление для работодателя
            const job = jobs[jobIndex];
            if (job.employerId) {
                const notificationMessages = {
                    'approved': `Ваша вакансия "${job.title}" одобрена и опубликована`,
                    'rejected': `Ваша вакансия "${job.title}" отклонена модератором`
                };
                
                if (typeof createNotification === 'function') {
                    createNotification(
                        job.employerId,
                        status === 'approved' ? 'approved' : 'rejected',
                        status === 'approved' ? 'Вакансия одобрена' : 'Вакансия отклонена',
                        notificationMessages[status] || 'Статус вакансии изменен',
                        job.id
                    );
                }
            }
            
            const statusMessages = {
                'approved': 'Вакансия одобрена',
                'rejected': 'Вакансия отклонена'
            };
            showNotification(statusMessages[status] || 'Статус обновлен', 'success');
            await loadJobsModerationData();
            updateStats();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Ошибка модерации вакансии:', error);
        showNotification('Ошибка при модерации вакансии', 'error');
        return false;
    }
}

// Модерация резюме
function moderateResume(resumeId, status) {
    try {
        const resumes = loadResumes();
        const resumeIndex = resumes.findIndex(resume => resume.id === resumeId);
        
        if (resumeIndex === -1) {
            showNotification('Резюме не найдено!', 'error');
            return false;
        }
        
        resumes[resumeIndex].moderationStatus = status;
        resumes[resumeIndex].moderatedAt = new Date().toISOString();
        
        if (saveResumes(resumes)) {
            // Создаем уведомление для соискателя
            const resume = resumes[resumeIndex];
            if (resume.userId) {
                const notificationMessages = {
                    'approved': `Ваше резюме "${resume.title || resume.fullName}" одобрено и опубликовано`,
                    'rejected': `Ваше резюме "${resume.title || resume.fullName}" отклонено модератором`
                };
                
                if (typeof createNotification === 'function') {
                    createNotification(
                        resume.userId,
                        status === 'approved' ? 'approved' : 'rejected',
                        status === 'approved' ? 'Резюме одобрено' : 'Резюме отклонено',
                        notificationMessages[status] || 'Статус резюме изменен',
                        resume.id
                    );
                }
            }
            
            const statusMessages = {
                'approved': 'Резюме одобрено',
                'rejected': 'Резюме отклонено'
            };
            showNotification(statusMessages[status] || 'Статус обновлен', 'success');
            loadResumesModerationData();
            updateStats();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Ошибка модерации резюме:', error);
        showNotification('Ошибка при модерации резюме', 'error');
        return false;
    }
}

// Удаление вакансии админом
async function deleteJobAdmin(jobId) {
    try {
        const jobs = await loadJobs();
        const filteredJobs = jobs.filter(job => job.id !== jobId);
        
        if (saveJobs(filteredJobs)) {
            showNotification('Вакансия удалена', 'success');
            await loadJobsModerationData();
            updateStats();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Ошибка удаления вакансии:', error);
        showNotification('Ошибка при удалении вакансии', 'error');
        return false;
    }
}

// Удаление резюме админом
function deleteResumeAdmin(resumeId) {
    try {
        const resumes = loadResumes();
        const filteredResumes = resumes.filter(resume => resume.id !== resumeId);
        
        if (saveResumes(filteredResumes)) {
            showNotification('Резюме удалено', 'success');
            loadResumesModerationData();
            updateStats();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Ошибка удаления резюме:', error);
        showNotification('Ошибка при удалении резюме', 'error');
        return false;
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

// ========== РАБОТА С ОБРАТНОЙ СВЯЗЬЮ В АДМИНКЕ ==========

// Загрузка данных обратной связи для админ-панели
function loadFeedbacksData() {
    try {
        const feedbacks = getAllFeedbacks();
        const tbody = document.getElementById('feedbacks-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (feedbacks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Нет обращений</td></tr>';
            return;
        }
        
        // Сортируем по дате (новые сначала)
        feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const statusText = {
            'new': 'Новое',
            'in_progress': 'В работе',
            'resolved': 'Решено'
        };
        
        const statusStyle = {
            'new': 'background: #fef3c7; color: #92400e;',
            'in_progress': 'background: #dbeafe; color: #1e40af;',
            'resolved': 'background: #d1fae5; color: #065f46;'
        };
        
        feedbacks.forEach((feedback, index) => {
            const row = document.createElement('tr');
            const createdDate = new Date(feedback.createdAt).toLocaleDateString('ru-RU');
            const repliedDate = feedback.repliedAt ? new Date(feedback.repliedAt).toLocaleDateString('ru-RU') : '-';
            
            row.innerHTML = `
                <td>${String(index + 1).padStart(3, '0')}</td>
                <td>${feedback.name}</td>
                <td>${feedback.email}</td>
                <td>${feedback.phone || '-'}</td>
                <td>${feedback.subject}</td>
                <td>
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; ${statusStyle[feedback.status] || statusStyle['new']}">
                        ${statusText[feedback.status] || 'Новое'}
                    </span>
                </td>
                <td>${createdDate}</td>
                <td style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="btn btn-small btn-primary view-feedback-btn" data-feedback-id="${feedback.id}" title="Просмотреть">👁️</button>
                    <button class="btn btn-small btn-success reply-feedback-btn" data-feedback-id="${feedback.id}" title="Ответить">📧</button>
                    ${feedback.status !== 'resolved' ? `
                        <button class="btn btn-small btn-secondary resolve-feedback-btn" data-feedback-id="${feedback.id}" title="Решено">✓</button>
                    ` : ''}
                    <button class="btn btn-small btn-danger delete-feedback-btn" data-feedback-id="${feedback.id}" title="Удалить">🗑</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Обработчики для кнопок обратной связи
        document.querySelectorAll('.view-feedback-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feedbackId = e.target.getAttribute('data-feedback-id');
                viewFeedback(feedbackId);
            });
        });
        
        document.querySelectorAll('.reply-feedback-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feedbackId = e.target.getAttribute('data-feedback-id');
                showReplyModal(feedbackId);
            });
        });
        
        document.querySelectorAll('.resolve-feedback-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feedbackId = e.target.getAttribute('data-feedback-id');
                if (confirm('Отметить обращение как решенное?')) {
                    updateFeedbackStatus(feedbackId, 'resolved');
                }
            });
        });
        
        document.querySelectorAll('.delete-feedback-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feedbackId = e.target.getAttribute('data-feedback-id');
                if (confirm('Вы уверены, что хотите удалить это обращение?')) {
                    deleteFeedback(feedbackId);
                }
            });
        });
        
    } catch (error) {
        console.error('Ошибка загрузки обратной связи:', error);
        const tbody = document.getElementById('feedbacks-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ef4444;">Ошибка загрузки данных</td></tr>';
        }
    }
}

// Просмотр обращения
function viewFeedback(feedbackId) {
    const feedback = getFeedbackById(feedbackId);
    if (!feedback) {
        showNotification('Обращение не найдено!', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'resume-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        overflow-y: auto;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        max-width: 600px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        border-radius: 8px;
        position: relative;
    `;
    
    const createdDate = new Date(feedback.createdAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const repliedDate = feedback.repliedAt ? new Date(feedback.repliedAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'Еще не отвечено';
    
    const statusText = {
        'new': 'Новое',
        'in_progress': 'В работе',
        'resolved': 'Решено'
    };
    
    const statusStyle = {
        'new': 'background: #fef3c7; color: #92400e;',
        'in_progress': 'background: #dbeafe; color: #1e40af;',
        'resolved': 'background: #d1fae5; color: #065f46;'
    };
    
    let html = `
        <button class="close-modal" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
        <h2>Обращение #${feedback.id.replace('feedback_', '')}</h2>
        
        <div style="margin-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 12px; border-radius: 12px; font-size: 14px; font-weight: 500; ${statusStyle[feedback.status] || statusStyle['new']}">
                    ${statusText[feedback.status] || 'Новое'}
                </span>
                <span style="color: #6b7280; font-size: 14px;">${createdDate}</span>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px; color: #1f2937;">Информация о пользователе</h3>
                <p><strong>Имя:</strong> ${feedback.name}</p>
                <p><strong>Email:</strong> ${feedback.email}</p>
                ${feedback.phone ? `<p><strong>Телефон:</strong> ${feedback.phone}</p>` : ''}
                <p><strong>Тема:</strong> ${feedback.subject}</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px; color: #1f2937;">Сообщение</h3>
                <p style="white-space: pre-wrap;">${feedback.message}</p>
            </div>
    `;
    
    if (feedback.adminReply) {
        html += `
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: #1e40af;">Ответ администратора</h3>
                    <span style="color: #6b7280; font-size: 14px;">${repliedDate}</span>
                </div>
                <p style="white-space: pre-wrap;">${feedback.adminReply}</p>
            </div>
        `;
    }
    
    html += `
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-primary reply-feedback-modal-btn" data-feedback-id="${feedback.id}">${feedback.adminReply ? 'Изменить ответ' : 'Ответить'}</button>
                ${feedback.status !== 'resolved' ? `
                    <button class="btn btn-success resolve-feedback-modal-btn" data-feedback-id="${feedback.id}">Отметить как решенное</button>
                ` : ''}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Закрытие модального окна
    content.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Обработчики кнопок в модальном окне
    content.querySelector('.reply-feedback-modal-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        showReplyModal(feedbackId);
    });
    
    const resolveBtn = content.querySelector('.resolve-feedback-modal-btn');
    if (resolveBtn) {
        resolveBtn.addEventListener('click', () => {
            if (confirm('Отметить обращение как решенное?')) {
                updateFeedbackStatus(feedbackId, 'resolved');
                document.body.removeChild(modal);
            }
        });
    }
}

// Модальное окно ответа на обращение
function showReplyModal(feedbackId) {
    const feedback = getFeedbackById(feedbackId);
    if (!feedback) {
        showNotification('Обращение не найдено!', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'resume-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        overflow-y: auto;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        max-width: 600px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        border-radius: 8px;
        position: relative;
    `;
    
    content.innerHTML = `
        <button class="close-modal" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
        <h2>Ответ на обращение</h2>
        
        <div style="margin-top: 20px;">
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p><strong>От:</strong> ${feedback.name} (${feedback.email})</p>
                <p><strong>Тема:</strong> ${feedback.subject}</p>
                <p><strong>Сообщение:</strong></p>
                <p style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px; margin-top: 10px;">${feedback.message}</p>
            </div>
            
            <form id="replyFeedbackForm">
                <div class="form-group">
                    <label for="admin-reply">Ответ администратора</label>
                    <textarea id="admin-reply" name="adminReply" rows="8" placeholder="Введите ваш ответ пользователю..." required>${feedback.adminReply || ''}</textarea>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Отправить ответ</button>
                    <button type="button" class="btn btn-secondary close-modal-btn">Отмена</button>
                </div>
            </form>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Обработчики
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    content.querySelector('.close-modal').addEventListener('click', closeModal);
    content.querySelector('.close-modal-btn').addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Обработка формы ответа
    const form = content.querySelector('#replyFeedbackForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const adminReply = form.querySelector('#admin-reply').value.trim();
        
        if (!adminReply) {
            showNotification('Пожалуйста, введите ответ!', 'error');
            return;
        }
        
        const success = updateFeedback(feedbackId, { 
            adminReply: adminReply,
            status: 'resolved' // Автоматически отмечаем как решенное после ответа
        });
        
        if (success) {
            closeModal();
            loadFeedbacksData();
            updateStats();
        }
    });
}

// Обновление статуса обращения
function updateFeedbackStatus(feedbackId, status) {
    const success = updateFeedback(feedbackId, { status: status });
    if (success) {
        loadFeedbacksData();
        updateStats();
    }
}

// Удаление обращения
function deleteFeedback(feedbackId) {
    const feedbacks = loadFeedbacks();
    const filteredFeedbacks = feedbacks.filter(fb => fb.id !== feedbackId);
    
    if (saveFeedbacks(filteredFeedbacks)) {
        showNotification('Обращение удалено', 'success');
        loadFeedbacksData();
        updateStats();
        return true;
    }
    
    return false;
}

// Обновим функцию loadAdminData для загрузки обратной связи
async function loadAdminData() {
    // Загружаем пользователей
    await loadUsersData();
    
    // Загружаем резюме
    loadResumesData();
    
    // Загружаем отклики
    loadApplicationsData();
    
    // Загружаем вакансии
    await loadJobsData();
    
    // Загружаем данные для модерации
    await loadJobsModerationData();
    loadResumesModerationData();
    
    // Загружаем обратную связь
    loadFeedbacksData();
    
    // Обновляем статистику
    updateStats();
}

// Обновим функцию updateStats для учета обратной связи
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
        
        // Обратная связь
        const feedbacks = getAllFeedbacks();
        const newFeedbacks = feedbacks.filter(fb => fb.status === 'new');
        
        // Обновляем счетчики
        document.getElementById('users-count').textContent = users.length || 0;
        document.getElementById('resumes-count').textContent = resumes.length || 0;
        document.getElementById('applications-count').textContent = applications.length || 0;
        document.getElementById('jobs-count').textContent = jobs.length || 0;
        document.getElementById('feedbacks-count').textContent = feedbacks.length || 0;
        document.getElementById('new-feedbacks-count').textContent = newFeedbacks.length || 0;
        
    } catch (error) {
        console.error('Ошибка обновления статистики:', error);
    }
}