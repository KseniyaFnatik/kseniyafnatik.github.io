// Список существующих страниц
const existingPages = [
    'index.html',
    'about.html',
    'contacts.html',
    'job-search.html',
    'login.html',
    'profile.html',
    'resume-create.html',
    '404.html',
    'admin.html'
];

// Проверка существования страницы при загрузке
(function() {
    // Получаем имя текущей страницы
    let currentPage = window.location.pathname.split('/').pop();
    
    // Если страница не указана или это корень, считаем что это index.html
    if (!currentPage || currentPage === '' || currentPage === '/') {
        currentPage = 'index.html';
    }
    
    // Если мы уже на странице 404, не проверяем
    if (currentPage === '404.html') {
        return;
    }
    
    // Проверяем, существует ли страница в списке
    if (currentPage.endsWith('.html') && !existingPages.includes(currentPage)) {
        // Перенаправляем на страницу 404
        window.location.replace('404.html');
    }
})();

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
            const targetForm = document.getElementById(tabName + '-form');
            if (targetForm) {
                targetForm.classList.add('active');
            }
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
// Функция для загрузки пользователей из файла user.json
async function loadUsersFromFile() {
    try {
        const response = await fetch('data/user.json');
        if (response.ok) {
            const users = await response.json();
            if (Array.isArray(users)) {
                console.log('Данные пользователей загружены из user.json');
                // НЕ сохраняем в localStorage, чтобы не перезаписывать новые регистрации
                return users;
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки пользователей из user.json:', error);
    }
    return null;
}

// Функция для загрузки пользователей из localStorage или файла
async function loadUsers() {
    // Всегда загружаем админа из файла, чтобы гарантировать актуальные данные
    const usersFromFile = await loadUsersFromFile();
    const usersFromStorage = localStorage.getItem('users');
    
    let users = [];
    
    // Если есть данные в localStorage, используем их
    if (usersFromStorage) {
        try {
            const parsed = JSON.parse(usersFromStorage);
            if (Array.isArray(parsed) && parsed.length > 0) {
                users = parsed;
                console.log(`Загружено ${users.length} пользователей из localStorage`);
            }
        } catch (e) {
            console.error('Ошибка парсинга данных из localStorage:', e);
        }
    }
    
    // Если есть данные из файла, обновляем админа в списке пользователей
    if (usersFromFile && Array.isArray(usersFromFile) && usersFromFile.length > 0) {
        console.log(`Загружено ${usersFromFile.length} пользователей из user.json`);
        
        // Находим админа в файле
        const adminFromFile = usersFromFile.find(u => u.status === 'admin');
        
        if (adminFromFile) {
            // Удаляем старую запись админа из localStorage, если она есть
            users = users.filter(u => {
                const userLogin = (u.login || u.username || '').toLowerCase();
                const adminLogin = (adminFromFile.login || adminFromFile.username || '').toLowerCase();
                return userLogin !== adminLogin;
            });
            
            // Добавляем актуального админа из файла
            users.push(adminFromFile);
            console.log('Админ обновлен из user.json');
        } else {
            // Если в файле нет админа, но есть другие пользователи, добавляем их
            usersFromFile.forEach(fileUser => {
                const exists = users.find(u => {
                    const userLogin = (u.login || u.username || '').toLowerCase();
                    const fileUserLogin = (fileUser.login || fileUser.username || '').toLowerCase();
                    return userLogin === fileUserLogin;
                });
                if (!exists) {
                    users.push(fileUser);
                }
            });
        }
        
        // Обновляем localStorage с объединенными данными
        localStorage.setItem('users', JSON.stringify(users));
    } else if (users.length === 0) {
        // Если нет данных ни в localStorage, ни в файле, возвращаем пустой массив
        return [];
    }
    
    return users;
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
async function registerUser(fio, username, phone, password, status = 'applicant') {
    // Загружаем пользователей из файла user.json или localStorage
    const users = await loadUsers();
    
    // Убеждаемся, что users - это массив
    if (!Array.isArray(users)) {
        console.error('Ошибка: users должен быть массивом');
        return false;
    }
    
    // Нормализуем логин (приводим к нижнему регистру и убираем пробелы)
    const normalizedUsername = username.trim().toLowerCase();
    
    // Проверяем формат логина
    if (!/^[a-zA-Z0-9_]{3,}$/.test(normalizedUsername)) {
        showNotification('Логин должен содержать минимум 3 символа (буквы, цифры, _)', 'error');
        return false;
    }
    
    // Проверяем, не зарегистрирован ли уже пользователь с таким логином
    const existingUser = users.find(user => {
        const userLogin = (user.login || user.username || '').toLowerCase();
        return userLogin === normalizedUsername;
    });
    
    if (existingUser) {
        showNotification('Пользователь с таким логином уже зарегистрирован!', 'error');
        return false;
    }
    
    // Создаем нового пользователя
    const newUser = {
        id: Date.now().toString(),
        fio: fio.trim(),
        login: normalizedUsername,
        username: normalizedUsername, // Дублируем для совместимости
        phone: phone.trim(),
        password: password, // В реальном приложении пароль должен быть захеширован
        status: status, // Статус пользователя: 'applicant' (соискатель), 'employer' (работодатель) или 'admin' (админ)
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

// Функция входа для сотрудника (админа)
async function employeeLogin(username, password) {
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
            
            // Перенаправляем на админ-панель
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            
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

// Функция авторизации пользователя
async function loginUser(username, password) {
    // Загружаем пользователей из файла user.json или localStorage
    console.log('Загрузка пользователей для проверки входа...');
    const users = await loadUsers();
    
    // Проверяем, что users - это массив
    if (!Array.isArray(users)) {
        showNotification('Ошибка загрузки данных пользователей!', 'error');
        return false;
    }
    
    if (users.length === 0) {
        showNotification('База пользователей пуста. Пожалуйста, зарегистрируйтесь.', 'error');
        return false;
    }
    
    console.log('Загружено пользователей:', users.length);
    console.log('Список пользователей:', users.map(u => ({ login: u.login || u.username, status: u.status })));
    
    // Нормализуем логин (приводим к нижнему регистру и убираем пробелы)
    const normalizedUsername = username.trim().toLowerCase();
    console.log('Попытка входа с логином:', normalizedUsername);
    
    // Ищем пользователя по логину и паролю в данных из user.json или localStorage
    const user = users.find(u => {
        const userLogin = (u.login || u.username || '').toLowerCase();
        const passwordMatch = u.password === password;
        console.log(`Проверка пользователя: логин=${userLogin}, совпадение логина=${userLogin === normalizedUsername}, совпадение пароля=${passwordMatch}`);
        return userLogin === normalizedUsername && passwordMatch;
    });
    
    if (user) {
        console.log('Пользователь найден:', user);
        console.log('ФИО пользователя:', user.fio);
        console.log('Телефон пользователя:', user.phone);
        
        // Проверяем статус пользователя из базы данных
        const userStatus = user.status || 'applicant';
        const isAdmin = userStatus === 'admin';
        
        if (isAdmin) {
            // Если это админ, сохраняем флаг в sessionStorage и перенаправляем на админ-панель
            sessionStorage.setItem('adminLoggedIn', 'true');
            showNotification('Вход выполнен успешно!', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            
            return true;
        }
        
        // Сохраняем все данные авторизованного пользователя (без пароля)
        const userData = {
            id: user.id,
            fio: user.fio,
            login: user.login || user.username,
            username: user.login || user.username,
            phone: user.phone,
            email: user.email || '',
            birthDate: user.birthDate || '',
            avatar: user.avatar || '',
            status: userStatus,
            registrationDate: user.registrationDate
        };
        console.log('Сохранение данных пользователя в currentUser:', userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        sessionStorage.setItem('isLoggedIn', 'true');
        console.log('Данные сохранены в localStorage');
        
        showNotification('Вход выполнен успешно!', 'success');
        
        // Перенаправляем на страницу профиля
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
        
        return true;
    } else {
        showNotification('Неверный логин или пароль!', 'error');
        return false;
    }
}


function saveUserProfile(userData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    // Обновляем данные пользователя
    const updatedUser = {
        ...currentUser,
        ...userData
    };

    // Сохраняем обновленного пользователя
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Также обновляем в общем списке пользователей
    updateUserInStorage(updatedUser);

    return true;
}

// Функция для обновления пользователя в основном хранилище
function updateUserInStorage(updatedUser) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === updatedUser.id);
    
    if (userIndex !== -1) {
        // Сохраняем важные поля из старой записи, которые не должны теряться
        const oldUser = users[userIndex];
        updatedUser.password = oldUser.password;
        updatedUser.login = oldUser.login || updatedUser.login;
        updatedUser.username = oldUser.username || oldUser.login || updatedUser.username;
        updatedUser.registrationDate = oldUser.registrationDate || updatedUser.registrationDate;
        updatedUser.avatar = updatedUser.avatar || oldUser.avatar;
        updatedUser.status = oldUser.status || updatedUser.status || 'applicant';
        
        // Обновляем пользователя в массиве
        users[userIndex] = updatedUser;
        
        // Сохраняем обновленный массив в localStorage
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✅ Данные пользователя обновлены в localStorage');
    } else {
        console.warn('Пользователь не найден в списке пользователей');
    }
}

// Функция для загрузки профиля пользователя
function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) return;

    // Обновляем данные в профиле
    const fioElement = document.querySelector('.profile-details h3');
    const phoneElement = document.querySelector('.profile-details p strong');
    
    if (fioElement) {
        fioElement.textContent = user.fio || 'Не указано';
    }
    
    // Обновляем телефон, email и дату рождения если есть соответствующие элементы
    const profileDetails = document.querySelector('.profile-details');
    if (profileDetails) {
        // Ищем или создаем элементы для отображения данных
        let birthDateElement = profileDetails.querySelector('#viewBirthDate');
        let phoneElement = profileDetails.querySelector('#viewPhone');
        let emailElement = profileDetails.querySelector('#viewEmail');
        
        if (birthDateElement) {
            birthDateElement.textContent = user.birthDate ? formatDate(user.birthDate) : 'Не указано';
        }
        
        if (phoneElement) {
            phoneElement.textContent = user.phone || 'Не указано';
        }
        
        if (emailElement) {
            emailElement.textContent = user.email || 'Не указано';
        }
    }
}

// Вспомогательная функция для форматирования даты
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
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

// Функция проверки авторизации админа
function isAdminLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

// Валидация форм
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Обработка формы регистрации
        if (form.id === 'registerForm') {
            const fio = form.querySelector('#register-fio').value.trim();
            const username = form.querySelector('#register-username').value.trim();
            const phone = form.querySelector('#register-phone').value.trim();
            const password = form.querySelector('#register-password').value;
            const confirmPassword = form.querySelector('#register-password-confirm').value;
            
            // Валидация
            if (!fio) {
                showNotification('Пожалуйста, введите ФИО!', 'error');
                return;
            }
            
            if (!username) {
                showNotification('Пожалуйста, введите логин!', 'error');
                return;
            }
            
            if (username.length < 3) {
                showNotification('Логин должен содержать минимум 3 символа!', 'error');
                return;
            }
            
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                showNotification('Логин может содержать только буквы, цифры и символ подчеркивания!', 'error');
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
            
            // Получаем выбранный статус
            const selectedStatus = form.querySelector('input[name="user-status"]:checked')?.value || 'applicant';
            
            // Регистрация
            (async () => {
                const success = await registerUser(fio, username, phone, password, selectedStatus);
                if (success) {
                    // Переключаемся на вкладку входа
                    setTimeout(() => {
                        document.querySelector('[data-tab="login"]').click();
                        form.reset();
                    }, 1500);
                }
            })();
        }
        // Обработка формы входа
        else if (form.id === 'loginForm') {
            const username = form.querySelector('#login-username').value.trim();
            const password = form.querySelector('#login-password').value;
            
            // Валидация
            if (!username) {
                showNotification('Пожалуйста, введите логин!', 'error');
                return;
            }
            
            // Используем async/await для асинхронной функции
            (async () => {
                await loginUser(username, password);
            })();
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

    // Проверяем, что пользователь не является работодателем
    const userStatus = currentUser.status || 'applicant';
    if (userStatus === 'employer') {
        showNotification('Работодатели не могут создавать резюме!', 'error');
        window.location.href = 'profile.html';
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

// Загрузка вакансий из data/jobs.json
async function loadJobs() {
    try {
        const response = await fetch('data/jobs.json');
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

// Сохранение вакансий в localStorage
function saveJobs(jobs) {
    if (!Array.isArray(jobs)) {
        console.error('Ошибка: jobs должен быть массивом');
        return false;
    }
    localStorage.setItem('jobs', JSON.stringify(jobs));
    console.log('✅ Вакансии сохранены в localStorage');
    return true;
}

// Загрузка вакансий работодателя
async function loadEmployerJobs() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const allJobs = await loadJobs();
    const employerJobs = allJobs.filter(job => job.employerId === currentUser.id);
    const tbody = document.getElementById('jobs-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (employerJobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">У вас пока нет вакансий</td></tr>';
        return;
    }
    
    // Загружаем отклики для подсчета
    const applications = loadApplications();
    
    employerJobs.forEach((job, index) => {
        const row = document.createElement('tr');
        const date = new Date(job.datePosted).toLocaleDateString('ru-RU');
        const jobApplications = applications.filter(app => app.jobId === job.id);
        const applicationsCount = jobApplications.length;
        
        row.innerHTML = `
            <td>${String(index + 1).padStart(3, '0')}</td>
            <td>${job.title || 'Без названия'}</td>
            <td>${job.company || 'Не указана'}</td>
            <td>${date}</td>
            <td>${applicationsCount}</td>
            <td>
                <button class="btn btn-small btn-primary view-job-applications" data-job-id="${job.id}">Просмотреть отклики</button>
                <button class="btn btn-small btn-danger delete-job" data-job-id="${job.id}">Удалить</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Добавляем обработчики
    document.querySelectorAll('.view-job-applications').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobId = e.target.getAttribute('data-job-id');
            viewJobApplications(jobId);
        });
    });
    
    document.querySelectorAll('.delete-job').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobId = e.target.getAttribute('data-job-id');
            if (confirm('Вы уверены, что хотите удалить эту вакансию?')) {
                deleteJob(jobId);
                loadEmployerJobs();
                loadJobApplications();
                showNotification('Вакансия удалена', 'success');
            }
        });
    });
}

// Создание вакансии
async function createJob(jobData) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Необходимо войти в систему!', 'error');
        return false;
    }
    
    const userStatus = currentUser.status || 'applicant';
    if (userStatus !== 'employer') {
        showNotification('Только работодатели могут создавать вакансии!', 'error');
        return false;
    }
    
    const allJobs = await loadJobs();
    
    const newJob = {
        id: 'job_' + Date.now().toString(),
        employerId: currentUser.id,
        title: jobData.title,
        company: jobData.company || currentUser.fio,
        location: jobData.location,
        salary: jobData.salary,
        salaryMin: parseInt(jobData.salary.replace(/\D/g, '')) || 0,
        description: jobData.description,
        tags: jobData.tags ? jobData.tags.split(',').map(t => t.trim()) : [],
        employmentType: jobData.employmentType || 'Полная занятость',
        datePosted: new Date().toISOString(),
        requirements: jobData.requirements || ''
    };
    
    allJobs.push(newJob);
    
    if (saveJobs(allJobs)) {
        showNotification('Вакансия успешно создана!', 'success');
        loadEmployerJobs();
        return true;
    }
    
    return false;
}

// Удаление вакансии
async function deleteJob(jobId) {
    const allJobs = await loadJobs();
    const filteredJobs = allJobs.filter(job => job.id !== jobId);
    saveJobs(filteredJobs);
    return true;
}

// Просмотр откликов на вакансию
function viewJobApplications(jobId) {
    const applications = loadApplications();
    const jobApplications = applications.filter(app => app.jobId === jobId);
    
    if (jobApplications.length === 0) {
        showNotification('На эту вакансию пока нет откликов', 'info');
        return;
    }
    
    // Создаем модальное окно
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
        <h2>Отклики на вакансию</h2>
        <div style="margin-top: 20px;">
    `;
    
    jobApplications.forEach((app, index) => {
        const date = new Date(app.createdAt).toLocaleDateString('ru-RU');
        const resume = getResumeById(app.resumeId);
        const user = getCurrentUser();
        
        html += `
            <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <h3>Отклик #${index + 1}</h3>
                <p><strong>Дата отклика:</strong> ${date}</p>
                ${resume ? `<p><strong>Соискатель:</strong> ${resume.fullName || 'Не указано'}</p>` : ''}
                ${resume ? `<p><strong>Телефон:</strong> ${resume.phone || 'Не указан'}</p>` : ''}
                ${resume ? `<p><strong>Email:</strong> ${resume.email || 'Не указан'}</p>` : ''}
                <button class="btn btn-small btn-primary view-resume-from-app" data-resume-id="${app.resumeId}" style="margin-top: 10px;">Просмотреть резюме</button>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Обработчики
    content.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Просмотр резюме
    content.querySelectorAll('.view-resume-from-app').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const resumeId = e.target.getAttribute('data-resume-id');
            document.body.removeChild(modal);
            viewResume(resumeId);
        });
    });
}

// Показ модального окна создания вакансии
function showCreateJobModal() {
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
        <h2>Создать вакансию</h2>
        <form id="createJobForm" style="margin-top: 20px;">
            <div class="form-group">
                <label for="job-title">Название вакансии *</label>
                <input type="text" id="job-title" name="title" placeholder="Например: Frontend разработчик" required>
            </div>
            <div class="form-group">
                <label for="job-company">Название компании</label>
                <input type="text" id="job-company" name="company" placeholder="Название вашей компании">
            </div>
            <div class="form-group">
                <label for="job-location">Местоположение *</label>
                <input type="text" id="job-location" name="location" placeholder="Москва, Санкт-Петербург, Удаленно" required>
            </div>
            <div class="form-group">
                <label for="job-salary">Зарплата *</label>
                <input type="text" id="job-salary" name="salary" placeholder="от 80 000 ₽" required>
            </div>
            <div class="form-group">
                <label for="job-description">Описание вакансии *</label>
                <textarea id="job-description" name="description" rows="5" placeholder="Опишите вакансию, требования, условия работы" required></textarea>
            </div>
            <div class="form-group">
                <label for="job-requirements">Требования</label>
                <textarea id="job-requirements" name="requirements" rows="3" placeholder="Опыт работы, навыки, образование"></textarea>
            </div>
            <div class="form-group">
                <label for="job-tags">Теги (через запятую)</label>
                <input type="text" id="job-tags" name="tags" placeholder="React, TypeScript, JavaScript">
            </div>
            <div class="form-group">
                <label for="job-employment-type">Тип занятости</label>
                <select id="job-employment-type" name="employmentType">
                    <option value="Полная занятость">Полная занятость</option>
                    <option value="Частичная занятость">Частичная занятость</option>
                    <option value="Удаленная работа">Удаленная работа</option>
                    <option value="Проектная работа">Проектная работа</option>
                </select>
            </div>
            <div class="form-actions" style="margin-top: 20px;">
                <button type="submit" class="btn btn-primary">Создать вакансию</button>
                <button type="button" class="btn btn-secondary close-modal-btn">Отмена</button>
            </div>
        </form>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Обработчики
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    content.querySelector('.close-modal').addEventListener('click', closeModal);
    const closeBtn = content.querySelector('.close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Обработка формы
    const form = content.querySelector('#createJobForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const jobData = {
            title: formData.get('title'),
            company: formData.get('company'),
            location: formData.get('location'),
            salary: formData.get('salary'),
            description: formData.get('description'),
            requirements: formData.get('requirements'),
            tags: formData.get('tags'),
            employmentType: formData.get('employmentType')
        };
        
        const success = await createJob(jobData);
        if (success) {
            closeModal();
            loadJobApplications();
        }
    });
}

// Загрузка откликов на вакансии работодателя
async function loadJobApplications() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const applications = loadApplications();
    // Фильтруем отклики по employerId (более надежно, чем по jobId)
    const jobApplications = applications.filter(app => app.employerId === currentUser.id);
    
    const allJobs = await loadJobs();
    const employerJobs = allJobs.filter(job => job.employerId === currentUser.id);
    
    const applicationsList = document.getElementById('job-applications-list');
    if (!applicationsList) return;
    
    applicationsList.innerHTML = '';
    
    if (jobApplications.length === 0) {
        applicationsList.innerHTML = '<p style="text-align: center; padding: 20px;">На ваши вакансии пока нет откликов</p>';
        return;
    }
    
    jobApplications.forEach(application => {
        const item = document.createElement('div');
        item.className = 'application-item';
        
        const job = employerJobs.find(j => j.id === application.jobId);
        const resume = getResumeById(application.resumeId);
        const date = new Date(application.createdAt).toLocaleDateString('ru-RU');
        
        item.innerHTML = `
            <div class="application-info">
                <h4>${job ? job.title : 'Вакансия удалена'}</h4>
                <p><strong>Соискатель:</strong> ${resume ? resume.fullName : 'Не указано'}</p>
                <p><strong>Телефон:</strong> ${resume ? resume.phone : 'Не указан'}</p>
                <p>Дата отклика: ${date}</p>
            </div>
            <div class="application-actions">
                ${resume ? `<button class="btn btn-small btn-primary view-resume-from-list" data-resume-id="${application.resumeId}">Просмотреть резюме</button>` : ''}
            </div>
        `;
        
        applicationsList.appendChild(item);
    });
    
    // Обработчики просмотра резюме
    document.querySelectorAll('.view-resume-from-list').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const resumeId = e.target.getAttribute('data-resume-id');
            viewResume(resumeId);
        });
    });
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
        employerId: job.employerId || null, // ID работодателя для фильтрации откликов
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
        // Получаем только цифры из введенного значения
        let value = e.target.value.replace(/\D/g, '');
        
        // Если нет цифр, очищаем поле полностью
        if (value.length === 0) {
            e.target.value = '';
            return;
        }
        
        // Если первая цифра не 7, заменяем на 7
        if (value[0] !== '7') {
            value = '7' + value.replace(/^7/, '');
        }
        
        // Ограничиваем максимальное количество цифр (11: +7 и 10 цифр номера)
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        // Применяем маску в зависимости от количества цифр
        if (value.length === 1) {
            // Только 7 - показываем только +7
            e.target.value = '+7';
        } else if (value.length <= 4) {
            // +7 (XXX
            e.target.value = '+7 (' + value.slice(1);
        } else if (value.length <= 7) {
            // +7 (XXX) XX
            e.target.value = '+7 (' + value.slice(1, 4) + ') ' + value.slice(4);
        } else if (value.length <= 9) {
            // +7 (XXX) XXX-XX
            e.target.value = '+7 (' + value.slice(1, 4) + ') ' + value.slice(4, 7) + '-' + value.slice(7);
        } else {
            // +7 (XXX) XXX-XX-XX
            e.target.value = '+7 (' + value.slice(1, 4) + ') ' + value.slice(4, 7) + '-' + value.slice(7, 9) + '-' + value.slice(9, 11);
        }
    });
    
    // Обработка клавиши Backspace для полного удаления, когда осталось только +7
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            const currentValue = e.target.value.replace(/\D/g, '');
            // Если осталась только цифра 7 или меньше, разрешаем полное удаление
            if (currentValue.length <= 1) {
                // Разрешаем стандартное поведение Backspace
                setTimeout(() => {
                    const newValue = e.target.value.replace(/\D/g, '');
                    if (newValue.length === 0) {
                        e.target.value = '';
                    }
                }, 0);
            }
        }
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
            
            // Обработчик кнопки создания вакансии
            const createJobBtn = document.getElementById('create-job-btn');
            if (createJobBtn) {
                createJobBtn.addEventListener('click', () => {
                    showCreateJobModal();
                });
            }
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
    
    // Если пользователь уже авторизован и находится на странице входа, перенаправляем в профиль или админ-панель
    if (window.location.pathname.includes('login.html')) {
        if (isAdminLoggedIn()) {
            window.location.href = 'admin.html';
        } else if (isLoggedIn()) {
            window.location.href = 'profile.html';
        }
    }
    
    
    // Инициализация всех интерактивных элементов
    console.log('Lime website initialized successfully!');
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
    
    // Определяем статус пользователя
    const userStatus = user?.status || 'applicant';
    
    if (userStatus === 'employer') {
        // Для работодателей
        document.getElementById('create-resume-btn').style.display = 'none';
        document.getElementById('create-job-btn').style.display = 'inline-block';
        document.getElementById('resumes-section').style.display = 'none';
        document.getElementById('applications-section').style.display = 'none';
        document.getElementById('jobs-section').style.display = 'block';
        document.getElementById('job-applications-section').style.display = 'block';
        
        // Загружаем вакансии работодателя
        loadEmployerJobs();
        // Загружаем отклики на вакансии
        loadJobApplications();
    } else {
        // Для соискателей
        document.getElementById('create-resume-btn').style.display = 'inline-block';
        document.getElementById('create-job-btn').style.display = 'none';
        document.getElementById('resumes-section').style.display = 'block';
        document.getElementById('applications-section').style.display = 'block';
        document.getElementById('jobs-section').style.display = 'none';
        document.getElementById('job-applications-section').style.display = 'none';
        
        // Загружаем и отображаем резюме
        loadUserResumes();
        // Загружаем и отображаем отклики
        loadUserApplications();
    }
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
