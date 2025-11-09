// Мобильное меню
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Предотвращаем прокрутку страницы когда меню открыто
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }));

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Закрытие меню при изменении размера окна
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Переключение вкладок в форме авторизации
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок и форм
            tabBtns.forEach(b => b.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и форме
            btn.classList.add('active');
            document.getElementById(tabName + '-form').classList.add('active');
        });
    });
}

// Опыт работы - переключение
const experienceRadios = document.querySelectorAll('input[name="hasExperience"]');
const experienceSection = document.getElementById('experienceSection');

if (experienceRadios.length > 0) {
    experienceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'yes') {
                experienceSection.style.display = 'block';
            } else {
                experienceSection.style.display = 'none';
            }
        });
    });
}

// Фильтры поиска работы
const filtersToggle = document.querySelector('.filters-toggle');
const filtersPanel = document.querySelector('.filters-panel');

if (filtersToggle && filtersPanel) {
    filtersToggle.addEventListener('click', () => {
        filtersPanel.classList.toggle('active');
    });
}

// Работа с пользователями
// Функция для загрузки пользователей из localStorage
function loadUsers() {
    const usersFromStorage = localStorage.getItem('users');
    if (usersFromStorage) {
        try {
            const users = JSON.parse(usersFromStorage);
            if (Array.isArray(users)) {
                console.log('Данные пользователей загружены из localStorage');
                return users;
            }
        } catch (e) {
            console.error('Ошибка парсинга данных из localStorage:', e);
        }
    }
    
    return [];
}

// Функция для сохранения пользователей (только JavaScript, localStorage)
function saveUsers(users) {
    // Убеждаемся, что users - это массив
    if (!Array.isArray(users)) {
        console.error('Ошибка: users должен быть массивом');
        return false;
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('users', JSON.stringify(users));
    console.log('✅ Данные пользователей сохранены в localStorage');
    return true;
}

// Функция регистрации пользователя
function registerUser(fio, phone, password) {
    // Загружаем пользователей из localStorage
    const users = loadUsers();
    
    // Убеждаемся, что users - это массив
    if (!Array.isArray(users)) {
        console.error('Ошибка: users должен быть массивом');
        return false;
    }
    
    // Нормализуем телефон для сравнения
    const normalizePhone = (phone) => phone.replace(/[\s\(\)\-]/g, '');
    const normalizedInputPhone = normalizePhone(phone);
    
    // Проверяем, не зарегистрирован ли уже пользователь с таким телефоном
    const existingUser = users.find(user => {
        const normalizedUserPhone = normalizePhone(user.phone);
        return normalizedUserPhone === normalizedInputPhone;
    });
    
    if (existingUser) {
        showNotification('Пользователь с таким телефоном уже зарегистрирован!', 'error');
        return false;
    }
    
    // Создаем нового пользователя
    const newUser = {
        id: Date.now().toString(),
        fio: fio.trim(),
        phone: phone.trim(),
        password: password, // В реальном приложении пароль должен быть захеширован
        registrationDate: new Date().toISOString()
    };
    
    // Добавляем пользователя в массив
    users.push(newUser);
    
    // Сохраняем обновленный массив в localStorage
    console.log('Сохранение пользователя:', newUser);
    const saved = saveUsers(users);
    
    if (saved) {
        showNotification('Регистрация прошла успешно! Данные сохранены', 'success');
    }
    
    return true;
}

// Функция авторизации пользователя
function loginUser(phone, password) {
    // Загружаем пользователей из localStorage
    console.log('Загрузка пользователей для проверки входа...');
    const users = loadUsers();
    
    // Проверяем, что users - это массив
    if (!Array.isArray(users)) {
        showNotification('Ошибка загрузки данных пользователей!', 'error');
        return false;
    }
    
    if (users.length === 0) {
        showNotification('База пользователей пуста. Пожалуйста, зарегистрируйтесь.', 'error');
        return false;
    }
    
    // Нормализуем телефон для сравнения (убираем пробелы, скобки, дефисы)
    const normalizePhone = (phone) => phone.replace(/[\s\(\)\-]/g, '');
    const normalizedInputPhone = normalizePhone(phone);
    
    // Ищем пользователя по телефону и паролю в данных из user.json
    const user = users.find(u => {
        const normalizedUserPhone = normalizePhone(u.phone);
        return normalizedUserPhone === normalizedInputPhone && u.password === password;
    });
    
    if (user) {
        console.log('Пользователь найден:', user.fio);
        // Сохраняем данные авторизованного пользователя (без пароля)
        const userData = {
            id: user.id,
            fio: user.fio,
            phone: user.phone,
            registrationDate: user.registrationDate
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        sessionStorage.setItem('isLoggedIn', 'true');
        
        showNotification('Вход выполнен успешно!', 'success');
        
        // Перенаправляем на страницу профиля
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
        
        return true;
    } else {
        showNotification('Неверный телефон или пароль!', 'error');
        return false;
    }
}

// Функция выхода из системы
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Функция получения текущего пользователя
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Функция проверки авторизации
function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true' && getCurrentUser() !== null;
}

// Валидация форм
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Обработка формы регистрации
        if (form.id === 'registerForm') {
            const fio = form.querySelector('#register-fio').value.trim();
            const phone = form.querySelector('#register-phone').value.trim();
            const password = form.querySelector('#register-password').value;
            const confirmPassword = form.querySelector('#register-password-confirm').value;
            
            // Валидация
            if (!fio) {
                showNotification('Пожалуйста, введите ФИО!', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают!', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Пароль должен содержать не менее 6 символов!', 'error');
                return;
            }
            
            // Регистрация
            const success = registerUser(fio, phone, password);
            if (success) {
                // Переключаемся на вкладку входа
                setTimeout(() => {
                    document.querySelector('[data-tab="login"]').click();
                    form.reset();
                }, 1500);
            }
        }
        // Обработка формы входа
        else if (form.id === 'loginForm') {
            const phone = form.querySelector('#login-phone').value.trim();
            const password = form.querySelector('#login-password').value;
            
            loginUser(phone, password);
        }
        // Обработка формы резюме
        else if (form.id === 'resumeForm') {
            saveResume(form);
        } else {
            // Обычная отправка формы
            showNotification('Форма отправлена успешно!', 'success');
        }
    });
});

// ========== РАБОТА С РЕЗЮМЕ ==========

// Загрузка резюме из localStorage
function loadResumes() {
    const resumesFromStorage = localStorage.getItem('resumes');
    if (resumesFromStorage) {
        try {
            const resumes = JSON.parse(resumesFromStorage);
            if (Array.isArray(resumes)) {
                return resumes;
            }
        } catch (e) {
            console.error('Ошибка парсинга резюме из localStorage:', e);
        }
    }
    return [];
}

// Сохранение резюме в localStorage
function saveResumes(resumes) {
    if (!Array.isArray(resumes)) {
        console.error('Ошибка: resumes должен быть массивом');
        return false;
    }
    localStorage.setItem('resumes', JSON.stringify(resumes));
    console.log('✅ Резюме сохранены в localStorage');
    return true;
}

// Сохранение резюме из формы
function saveResume(form) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Необходимо войти в систему!', 'error');
        window.location.href = 'login.html';
        return;
    }

    // Валидация обязательных полей
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#e5e7eb';
        }
    });
    
    if (!isValid) {
        showNotification('Пожалуйста, заполните все обязательные поля!', 'error');
        return;
    }

    // Собираем данные из формы
    const resumeData = {
        id: Date.now().toString(),
        userId: currentUser.id,
        title: form.querySelector('#fullName').value.trim() || 'Резюме',
        fullName: form.querySelector('#fullName').value.trim(),
        birthDate: form.querySelector('#birthDate').value,
        phone: form.querySelector('#phone').value.trim(),
        email: form.querySelector('#email').value.trim(),
        address: form.querySelector('#address').value.trim(),
        desiredSalary: form.querySelector('#desiredSalary').value || null,
        education: collectEducation(form),
        experience: collectExperience(form),
        professionalSkills: form.querySelector('#professionalSkills').value.trim(),
        personalSkills: form.querySelector('#personalSkills').value.trim(),
        hasExperience: form.querySelector('input[name="hasExperience"]:checked')?.value === 'yes',
        createdAt: new Date().toISOString()
    };

    // Загружаем существующие резюме
    const resumes = loadResumes();
    
    // Добавляем новое резюме
    resumes.push(resumeData);
    
    // Сохраняем
    if (saveResumes(resumes)) {
        showNotification('Резюме успешно создано и сохранено!', 'success');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    }
}

// Сбор данных об образовании
function collectEducation(form) {
    const educationItems = form.querySelectorAll('.education-item');
    const education = [];
    
    educationItems.forEach(item => {
        const university = item.querySelector('[name="university"]')?.value.trim();
        const degree = item.querySelector('[name="degree"]')?.value.trim();
        const graduationYear = item.querySelector('[name="graduationYear"]')?.value;
        const gpa = item.querySelector('[name="gpa"]')?.value;
        
        if (university && degree) {
            education.push({
                university,
                degree,
                graduationYear: graduationYear || null,
                gpa: gpa || null
            });
        }
    });
    
    return education;
}

// Сбор данных об опыте работы
function collectExperience(form) {
    const experienceItems = form.querySelectorAll('.experience-item');
    const experience = [];
    
    experienceItems.forEach(item => {
        const company = item.querySelector('[name="company"]')?.value.trim();
        const position = item.querySelector('[name="position"]')?.value.trim();
        const startDate = item.querySelector('[name="startDate"]')?.value;
        const endDate = item.querySelector('[name="endDate"]')?.value;
        const responsibilities = item.querySelector('[name="responsibilities"]')?.value.trim();
        
        if (company && position) {
            experience.push({
                company,
                position,
                startDate: startDate || null,
                endDate: endDate || null,
                responsibilities: responsibilities || null
            });
        }
    });
    
    return experience;
}

// Получение резюме пользователя
function getUserResumes(userId) {
    const resumes = loadResumes();
    return resumes.filter(resume => resume.userId === userId);
}

// Удаление резюме
function deleteResume(resumeId) {
    const resumes = loadResumes();
    const filteredResumes = resumes.filter(resume => resume.id !== resumeId);
    saveResumes(filteredResumes);
    return true;
}

// Получение резюме по ID
function getResumeById(resumeId) {
    const resumes = loadResumes();
    return resumes.find(resume => resume.id === resumeId);
}

// ========== РАБОТА С ВАКАНСИЯМИ ==========

// Загрузка вакансий из jobs.json
async function loadJobs() {
    try {
        const response = await fetch('jobs.json');
        if (response.ok) {
            const jobs = await response.json();
            if (Array.isArray(jobs)) {
                return jobs;
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки вакансий:', error);
    }
    
    // Если не удалось загрузить, используем localStorage
    const jobsFromStorage = localStorage.getItem('jobs');
    if (jobsFromStorage) {
        try {
            return JSON.parse(jobsFromStorage);
        } catch (e) {
            console.error('Ошибка парсинга вакансий из localStorage:', e);
        }
    }
    
    return [];
}

// Получение вакансии по ID
async function getJobById(jobId) {
    const jobs = await loadJobs();
    return jobs.find(job => job.id === jobId);
}

// ========== РАБОТА С ОТКЛИКАМИ ==========

// Загрузка откликов из localStorage
function loadApplications() {
    const applicationsFromStorage = localStorage.getItem('applications');
    if (applicationsFromStorage) {
        try {
            const applications = JSON.parse(applicationsFromStorage);
            if (Array.isArray(applications)) {
                return applications;
            }
        } catch (e) {
            console.error('Ошибка парсинга откликов из localStorage:', e);
        }
    }
    return [];
}

// Сохранение откликов в localStorage
function saveApplications(applications) {
    if (!Array.isArray(applications)) {
        console.error('Ошибка: applications должен быть массивом');
        return false;
    }
    localStorage.setItem('applications', JSON.stringify(applications));
    console.log('✅ Отклики сохранены в localStorage');
    return true;
}

// Создание отклика на вакансию
async function createApplication(jobId, resumeId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Необходимо войти в систему!', 'error');
        return false;
    }

    const job = await getJobById(jobId);
    if (!job) {
        showNotification('Вакансия не найдена!', 'error');
        return false;
    }

    const resume = getResumeById(resumeId);
    if (!resume) {
        showNotification('Резюме не найдено!', 'error');
        return false;
    }

    // Проверяем, не откликался ли уже пользователь на эту вакансию
    const applications = loadApplications();
    const existingApplication = applications.find(app => 
        app.userId === currentUser.id && app.jobId === jobId
    );

    if (existingApplication) {
        showNotification('Вы уже откликнулись на эту вакансию!', 'error');
        return false;
    }

    // Создаем новый отклик
    const application = {
        id: Date.now().toString(),
        userId: currentUser.id,
        jobId: jobId,
        resumeId: resumeId,
        jobTitle: job.title,
        company: job.company,
        status: 'sent', // sent, viewed, invited, rejected
        createdAt: new Date().toISOString()
    };

    applications.push(application);
    
    if (saveApplications(applications)) {
        showNotification('Отклик успешно отправлен!', 'success');
        return true;
    }
    
    return false;
}

// Получение откликов пользователя
function getUserApplications(userId) {
    const applications = loadApplications();
    return applications.filter(app => app.userId === userId);
}

// Уведомления
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Цвета в зависимости от типа
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#2563eb'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Добавляем в DOM
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Предварительный просмотр резюме
const previewBtn = document.getElementById('previewBtn');
if (previewBtn) {
    previewBtn.addEventListener('click', () => {
        showNotification('Функция предварительного просмотра будет доступна в полной версии!', 'info');
    });
}

// Добавление дополнительных полей образования и опыта
function addEducationField() {
    const educationSection = document.querySelector('.education-item').parentElement;
    const newEducation = document.createElement('div');
    newEducation.className = 'education-item';
    newEducation.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="university">Учебное заведение</label>
                <input type="text" name="university" placeholder="МГУ им. М.В. Ломоносова">
            </div>
            <div class="form-group">
                <label for="degree">Степень/Специальность</label>
                <input type="text" name="degree" placeholder="Бакалавр информатики">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="graduationYear">Год окончания</label>
                <input type="number" name="graduationYear" placeholder="2020">
            </div>
            <div class="form-group">
                <label for="gpa">Средний балл (необязательно)</label>
                <input type="number" name="gpa" placeholder="4.5" step="0.1" min="0" max="5">
            </div>
        </div>
        <button type="button" class="btn btn-danger btn-small remove-education">Удалить</button>
    `;
    
    educationSection.appendChild(newEducation);
    
    // Добавляем обработчик удаления
    newEducation.querySelector('.remove-education').addEventListener('click', () => {
        educationSection.removeChild(newEducation);
    });
}

function addExperienceField() {
    const experienceSection = document.querySelector('.experience-section');
    const newExperience = document.createElement('div');
    newExperience.className = 'experience-item';
    newExperience.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="company">Компания</label>
                <input type="text" name="company" placeholder="ООО 'Пример'">
            </div>
            <div class="form-group">
                <label for="position">Должность</label>
                <input type="text" name="position" placeholder="Frontend разработчик">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="startDate">Дата начала</label>
                <input type="date" name="startDate">
            </div>
            <div class="form-group">
                <label for="endDate">Дата окончания</label>
                <input type="date" name="endDate">
            </div>
        </div>
        <div class="form-group">
            <label for="responsibilities">Обязанности и достижения</label>
            <textarea name="responsibilities" rows="4" placeholder="Опишите ваши обязанности и достижения"></textarea>
        </div>
        <button type="button" class="btn btn-danger btn-small remove-experience">Удалить</button>
    `;
    
    experienceSection.appendChild(newExperience);
    
    // Добавляем обработчик удаления
    newExperience.querySelector('.remove-experience').addEventListener('click', () => {
        experienceSection.removeChild(newExperience);
    });
}

// Обработчики для кнопок добавления
const addEducationBtn = document.querySelector('.add-education');
const addExperienceBtn = document.querySelector('.add-experience');

if (addEducationBtn) {
    addEducationBtn.addEventListener('click', addEducationField);
}

if (addExperienceBtn) {
    addExperienceBtn.addEventListener('click', addExperienceField);
}

// Маска для телефона
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 1) {
                value = '+7 (' + value;
            } else if (value.length <= 4) {
                value = '+7 (' + value.slice(1);
            } else if (value.length <= 7) {
                value = '+7 (' + value.slice(1, 4) + ') ' + value.slice(4);
            } else if (value.length <= 9) {
                value = '+7 (' + value.slice(1, 4) + ') ' + value.slice(4, 7) + '-' + value.slice(7);
            } else {
                value = '+7 (' + value.slice(1, 4) + ') ' + value.slice(4, 7) + '-' + value.slice(7, 9) + '-' + value.slice(9, 11);
            }
        }
        e.target.value = value;
    });
});

// Плавная прокрутка для якорных ссылок
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

// Анимация появления элементов при прокрутке
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Применяем анимацию к карточкам
document.querySelectorAll('.feature-card, .vacancy-card, .team-member').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию и обновляем навигацию
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Показываем кнопку "Профиль" вместо "Войти"
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.textContent = 'Профиль';
            loginBtn.href = 'profile.html';
        }
    }
    
    // Обработка кнопки выхода
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Проверка авторизации на странице профиля
    if (window.location.pathname.includes('profile.html')) {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        } else {
            // Загружаем данные пользователя в профиль
            loadUserProfile();
        }
    }
    
    // Загрузка вакансий на странице поиска работы
    if (window.location.pathname.includes('job-search.html')) {
        loadJobsToPage();
    }
    
    // Автозаполнение формы резюме данными пользователя
    if (window.location.pathname.includes('resume-create.html')) {
        if (isLoggedIn()) {
            fillResumeFormWithUserData();
        }
    }
    
    // Если пользователь уже авторизован и находится на странице входа, перенаправляем в профиль
    if (window.location.pathname.includes('login.html') && isLoggedIn()) {
        window.location.href = 'profile.html';
    }
    
    // Инициализация всех интерактивных элементов
    console.log('JobFinder website initialized successfully!');
});

// Автозаполнение формы резюме данными пользователя
function fillResumeFormWithUserData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const form = document.getElementById('resumeForm');
    if (!form) return;
    
    // Заполняем ФИО
    const fullNameInput = form.querySelector('#fullName');
    if (fullNameInput && !fullNameInput.value) {
        fullNameInput.value = currentUser.fio;
    }
    
    // Заполняем телефон
    const phoneInput = form.querySelector('#phone');
    if (phoneInput && !phoneInput.value) {
        phoneInput.value = currentUser.phone;
    }
}

// Функция загрузки данных пользователя в профиль
function loadUserProfile() {
    const user = getCurrentUser();
    if (user) {
        // Обновляем ФИО
        const fioElement = document.querySelector('.profile-details h3');
        if (fioElement) {
            fioElement.textContent = user.fio;
        }
        
        // Обновляем телефон
        const phoneElement = document.querySelector('.profile-details p strong');
        if (phoneElement && phoneElement.textContent.includes('Телефон')) {
            const phoneParagraph = phoneElement.parentElement;
            phoneParagraph.innerHTML = `<strong>Телефон:</strong> ${user.phone}`;
        }
    }
    
    // Загружаем и отображаем резюме
    loadUserResumes();
    
    // Загружаем и отображаем отклики
    loadUserApplications();
}

// Загрузка и отображение резюме пользователя
function loadUserResumes() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const resumes = getUserResumes(currentUser.id);
    const tbody = document.querySelector('.resume-table tbody');
    
    if (!tbody) return;
    
    // Очищаем таблицу
    tbody.innerHTML = '';
    
    if (resumes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">У вас пока нет резюме</td></tr>';
        return;
    }
    
    // Добавляем резюме в таблицу
    resumes.forEach((resume, index) => {
        const row = document.createElement('tr');
        const date = new Date(resume.createdAt).toLocaleDateString('ru-RU');
        
        row.innerHTML = `
            <td>${String(index + 1).padStart(3, '0')}</td>
            <td>${resume.title || resume.fullName || 'Резюме'}</td>
            <td>${date}</td>
            <td>
                <button class="btn btn-small btn-primary view-resume" data-resume-id="${resume.id}">Просмотреть</button>
                <button class="btn btn-small btn-danger delete-resume" data-resume-id="${resume.id}">Удалить</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Добавляем обработчики для кнопок
    document.querySelectorAll('.view-resume').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const resumeId = e.target.getAttribute('data-resume-id');
            viewResume(resumeId);
        });
    });
    
    document.querySelectorAll('.delete-resume').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const resumeId = e.target.getAttribute('data-resume-id');
            if (confirm('Вы уверены, что хотите удалить это резюме?')) {
                deleteResume(resumeId);
                loadUserResumes(); // Перезагружаем список
                showNotification('Резюме удалено', 'success');
            }
        });
    });
}

// Просмотр резюме
function viewResume(resumeId) {
    const resume = getResumeById(resumeId);
    if (!resume) {
        showNotification('Резюме не найдено!', 'error');
        return;
    }
    
    // Создаем модальное окно для просмотра резюме
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
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        border-radius: 8px;
        position: relative;
    `;
    
    let html = `
        <button class="close-modal" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
        <h2>${resume.fullName || 'Резюме'}</h2>
        <div style="margin-top: 20px;">
            <p><strong>Телефон:</strong> ${resume.phone || 'Не указан'}</p>
            <p><strong>Email:</strong> ${resume.email || 'Не указан'}</p>
            ${resume.address ? `<p><strong>Адрес:</strong> ${resume.address}</p>` : ''}
            ${resume.birthDate ? `<p><strong>Дата рождения:</strong> ${resume.birthDate}</p>` : ''}
            ${resume.desiredSalary ? `<p><strong>Желаемая зарплата:</strong> ${resume.desiredSalary} руб.</p>` : ''}
        </div>
    `;
    
    if (resume.education && resume.education.length > 0) {
        html += '<h3 style="margin-top: 30px;">Образование</h3>';
        resume.education.forEach(edu => {
            html += `
                <div style="margin-bottom: 15px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                    <p><strong>${edu.university}</strong></p>
                    <p>${edu.degree}</p>
                    ${edu.graduationYear ? `<p>Год окончания: ${edu.graduationYear}</p>` : ''}
                    ${edu.gpa ? `<p>Средний балл: ${edu.gpa}</p>` : ''}
                </div>
            `;
        });
    }
    
    if (resume.experience && resume.experience.length > 0) {
        html += '<h3 style="margin-top: 30px;">Опыт работы</h3>';
        resume.experience.forEach(exp => {
            html += `
                <div style="margin-bottom: 15px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                    <p><strong>${exp.position}</strong> в ${exp.company}</p>
                    ${exp.startDate ? `<p>Период: ${exp.startDate} - ${exp.endDate || 'настоящее время'}</p>` : ''}
                    ${exp.responsibilities ? `<p>${exp.responsibilities}</p>` : ''}
                </div>
            `;
        });
    }
    
    if (resume.professionalSkills) {
        html += `<h3 style="margin-top: 30px;">Профессиональные навыки</h3><p>${resume.professionalSkills}</p>`;
    }
    
    if (resume.personalSkills) {
        html += `<h3 style="margin-top: 30px;">Личные качества</h3><p>${resume.personalSkills}</p>`;
    }
    
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
}

// Загрузка и отображение откликов пользователя
function loadUserApplications() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const applications = getUserApplications(currentUser.id);
    const applicationsList = document.querySelector('.applications-list');
    
    if (!applicationsList) return;
    
    // Очищаем список
    applicationsList.innerHTML = '';
    
    if (applications.length === 0) {
        applicationsList.innerHTML = '<p style="text-align: center; padding: 20px;">У вас пока нет откликов</p>';
        return;
    }
    
    // Добавляем отклики
    applications.forEach(application => {
        const item = document.createElement('div');
        item.className = 'application-item';
        
        const date = new Date(application.createdAt).toLocaleDateString('ru-RU');
        const statusText = {
            'sent': 'Отправлено',
            'viewed': 'Просмотрено',
            'invited': 'Приглашение',
            'rejected': 'Отклонено'
        };
        
        const statusClass = {
            'sent': 'sent',
            'viewed': 'viewed',
            'invited': 'invited',
            'rejected': 'rejected'
        };
        
        item.innerHTML = `
            <div class="application-info">
                <h4>${application.jobTitle} в ${application.company}</h4>
                <p>Статус: <span class="status ${statusClass[application.status] || 'sent'}">${statusText[application.status] || 'Отправлено'}</span></p>
                <p>Дата отклика: ${date}</p>
            </div>
            <div class="application-actions">
                <button class="btn btn-small btn-secondary view-application" data-application-id="${application.id}">Подробнее</button>
            </div>
        `;
        
        applicationsList.appendChild(item);
    });
}

// Загрузка и отображение вакансий
async function loadJobsToPage() {
    const jobs = await loadJobs();
    const vacanciesList = document.querySelector('.vacancies-list');
    const resultsHeader = document.querySelector('.results-header h2');
    
    if (!vacanciesList) return;
    
    // Обновляем количество найденных вакансий
    if (resultsHeader) {
        resultsHeader.textContent = `Найдено вакансий: ${jobs.length}`;
    }
    
    // Очищаем список
    vacanciesList.innerHTML = '';
    
    if (jobs.length === 0) {
        vacanciesList.innerHTML = '<p style="text-align: center; padding: 20px;">Вакансии не найдены</p>';
        return;
    }
    
    // Добавляем вакансии
    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'vacancy-card';
        
        const datePosted = new Date(job.datePosted).toLocaleDateString('ru-RU');
        const daysAgo = Math.floor((Date.now() - new Date(job.datePosted).getTime()) / (1000 * 60 * 60 * 24));
        const dateText = daysAgo === 0 ? 'Сегодня' : daysAgo === 1 ? 'Вчера' : `${daysAgo} дня назад`;
        
        const tagsHtml = job.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        card.innerHTML = `
            <div class="vacancy-header">
                <h3>${job.title}</h3>
                <div class="vacancy-salary">${job.salary}</div>
            </div>
            <div class="vacancy-company">
                <strong>${job.company}</strong>
                <span class="company-location">${job.location}</span>
            </div>
            <div class="vacancy-description">
                <p>${job.description}</p>
            </div>
            <div class="vacancy-tags">
                ${tagsHtml}
            </div>
            <div class="vacancy-footer">
                <span class="vacancy-date">${dateText}</span>
                <button class="btn btn-primary apply-job" data-job-id="${job.id}">Откликнуться</button>
            </div>
        `;
        
        vacanciesList.appendChild(card);
    });
    
    // Добавляем обработчики для кнопок отклика
    document.querySelectorAll('.apply-job').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const jobId = e.target.getAttribute('data-job-id');
            await handleJobApplication(jobId);
        });
    });
}

// Обработка отклика на вакансию
async function handleJobApplication(jobId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Необходимо войти в систему!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const resumes = getUserResumes(currentUser.id);
    
    if (resumes.length === 0) {
        showNotification('У вас нет резюме. Создайте резюме перед откликом!', 'error');
        setTimeout(() => {
            window.location.href = 'resume-create.html';
        }, 1500);
        return;
    }
    
    // Если резюме одно, используем его
    if (resumes.length === 1) {
        const success = await createApplication(jobId, resumes[0].id);
        if (success) {
            // Обновляем кнопку
            const btn = document.querySelector(`[data-job-id="${jobId}"]`);
            if (btn) {
                btn.textContent = 'Отклик отправлен';
                btn.disabled = true;
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-secondary');
            }
        }
    } else {
        // Если резюме несколько, показываем выбор
        showResumeSelectionModal(jobId, resumes);
    }
}

// Модальное окно выбора резюме
function showResumeSelectionModal(jobId, resumes) {
    const modal = document.createElement('div');
    modal.className = 'resume-selection-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
    `;
    
    let html = `
        <h3>Выберите резюме для отклика</h3>
        <div style="margin-top: 20px;">
    `;
    
    resumes.forEach(resume => {
        html += `
            <div style="padding: 15px; margin-bottom: 10px; border: 1px solid #e5e7eb; border-radius: 5px; cursor: pointer;" 
                 class="resume-option" data-resume-id="${resume.id}">
                <strong>${resume.title || resume.fullName || 'Резюме'}</strong>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${resume.fullName}</p>
            </div>
        `;
    });
    
    html += `
        </div>
        <button class="close-modal" style="margin-top: 20px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer;">Отмена</button>
    `;
    
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Обработка выбора резюме
    content.querySelectorAll('.resume-option').forEach(option => {
        option.addEventListener('click', async () => {
            const resumeId = option.getAttribute('data-resume-id');
            document.body.removeChild(modal);
            const success = await createApplication(jobId, resumeId);
            if (success) {
                // Обновляем кнопку
                const btn = document.querySelector(`[data-job-id="${jobId}"]`);
                if (btn) {
                    btn.textContent = 'Отклик отправлен';
                    btn.disabled = true;
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-secondary');
                }
            }
        });
    });
    
    // Закрытие модального окна
    content.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}
