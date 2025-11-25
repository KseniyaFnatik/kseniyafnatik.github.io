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
            window.location.href = 'index.html';
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

// Функция для получения названия роли
function getRoleName(status) {
    const roles = {
        'applicant': 'Соискатель',
        'employer': 'Работодатель',
        'admin': 'Администратор'
    };
    return roles[status] || 'Пользователь';
}

// Функция для получения стиля бейджа роли
function getRoleBadgeStyle(status) {
    const styles = {
        'applicant': { background: '#dbeafe', color: '#1e40af' }, // Синий для соискателя
        'employer': { background: '#fef3c7', color: '#92400e' }, // Желтый для работодателя
        'admin': { background: '#fce7f3', color: '#9f1239' } // Розовый для админа
    };
    return styles[status] || { background: '#e0e7ff', color: '#4338ca' };
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
        }
        // Обработка формы обратной связи на странице контактов
        else if (form.classList.contains('feedback-form') && form.id === 'contacts-feedback-form') {
            // Проверяем авторизацию
            if (!isLoggedIn()) {
                showNotification('Для отправки обращения необходимо войти в систему!', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            const name = form.querySelector('#feedback-name')?.value.trim();
            const email = form.querySelector('#feedback-email')?.value.trim();
            const phone = form.querySelector('#feedback-phone')?.value.trim();
            const subject = form.querySelector('#feedback-subject')?.value;
            const message = form.querySelector('#feedback-message')?.value.trim();
            
            if (!name || !email || !subject || !message) {
                showNotification('Пожалуйста, заполните все обязательные поля!', 'error');
                return;
            }
            
            // Создаем обращение
            if (typeof createFeedback === 'function') {
                const success = createFeedback({
                    name: name,
                    email: email,
                    phone: phone || '',
                    subject: subject,
                    message: message
                });
                
                if (success) {
                    showNotification('Ваше обращение успешно отправлено!', 'success');
                    form.reset();
                } else {
                    showNotification('Ошибка при отправке обращения', 'error');
                }
            } else {
                showNotification('Функция отправки обращений недоступна', 'error');
            }
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
        createdAt: new Date().toISOString(),
        moderationStatus: 'pending' // Статус модерации по умолчанию
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

// Загрузка вакансий из data/jobs.json и localStorage
async function loadJobs() {
    let allJobs = [];
    const jobsMap = new Map(); // Используем Map для избежания дубликатов по ID
    
    // Сначала загружаем вакансии из файла
    try {
        const response = await fetch('data/jobs.json');
        if (response.ok) {
            const fileJobs = await response.json();
            if (Array.isArray(fileJobs)) {
                // Добавляем статус модерации "approved" для вакансий из файла, если его нет
                fileJobs.forEach(job => {
                    if (!job.moderationStatus) {
                        job.moderationStatus = 'approved'; // Вакансии из файла считаются одобренными
                    }
                    // Добавляем employerId, если его нет (для совместимости)
                    if (!job.employerId) {
                        job.employerId = 'system'; // Системные вакансии
                    }
                    jobsMap.set(job.id, job);
                });
                console.log('✅ Вакансии загружены из файла:', fileJobs.length);
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки вакансий из файла:', error);
    }
    
    // Затем загружаем вакансии из localStorage
    const jobsFromStorage = localStorage.getItem('jobs');
    if (jobsFromStorage) {
        try {
            const storageJobs = JSON.parse(jobsFromStorage);
            if (Array.isArray(storageJobs) && storageJobs.length > 0) {
                // Объединяем с вакансиями из файла, приоритет у вакансий из localStorage
                storageJobs.forEach(job => {
                    jobsMap.set(job.id, job); // Вакансии из localStorage перезаписывают файльные с тем же ID
                });
                console.log('✅ Вакансии загружены из localStorage:', storageJobs.length);
            }
        } catch (e) {
            console.error('Ошибка парсинга вакансий из localStorage:', e);
        }
    }
    
    // Преобразуем Map обратно в массив
    allJobs = Array.from(jobsMap.values());
    console.log('✅ Всего вакансий (объединено):', allJobs.length);
    
    return allJobs;
}

// Получение вакансии по ID
async function getJobById(jobId) {
    const jobs = await loadJobs();
    return jobs.find(job => job.id === jobId);
}

// Сохранение вакансий в localStorage (только пользовательские, не системные)
function saveJobs(jobs) {
    if (!Array.isArray(jobs)) {
        console.error('Ошибка: jobs должен быть массивом');
        return false;
    }
    
    // Фильтруем только пользовательские вакансии (не системные из файла)
    const userJobs = jobs.filter(job => job.employerId !== 'system' && job.employerId !== undefined);
    
    localStorage.setItem('jobs', JSON.stringify(userJobs));
    console.log('✅ Пользовательские вакансии сохранены в localStorage:', userJobs.length);
    return true;
}

// Загрузка вакансий работодателя
async function loadEmployerJobs() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('❌ loadEmployerJobs: Пользователь не авторизован');
        return;
    }
    
    const allJobs = await loadJobs();
    console.log('📋 Все вакансии:', allJobs.length);
    console.log('👤 Текущий пользователь ID:', currentUser.id);
    
    const employerJobs = allJobs.filter(job => job.employerId === currentUser.id);
    console.log('💼 Вакансии работодателя:', employerJobs.length);
    
    const tbody = document.getElementById('jobs-table-body');
    if (!tbody) {
        console.log('❌ loadEmployerJobs: Элемент jobs-table-body не найден');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (employerJobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">У вас пока нет вакансий</td></tr>';
        console.log('ℹ️ loadEmployerJobs: У работодателя нет вакансий');
        return;
    }
    
    // Загружаем отклики для подсчета
    const applications = loadApplications();
    
    employerJobs.forEach((job, index) => {
        const row = document.createElement('tr');
        const date = new Date(job.datePosted).toLocaleDateString('ru-RU');
        const jobApplications = applications.filter(app => app.jobId === job.id);
        const applicationsCount = jobApplications.length;
        
        // Определяем статус модерации
        const moderationStatus = job.moderationStatus || 'pending';
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
        
        row.innerHTML = `
            <td>${String(index + 1).padStart(3, '0')}</td>
            <td>
                ${job.title || 'Без названия'}
                <br>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 500; margin-top: 4px; ${moderationStatusStyle[moderationStatus] || moderationStatusStyle['pending']}">
                    ${moderationStatusText[moderationStatus] || 'На модерации'}
                </span>
            </td>
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
            showConfirmDialog('Вы уверены, что хотите удалить эту вакансию?', () => {
                deleteJob(jobId);
                loadEmployerJobs();
                loadJobApplications();
                showNotification('Вакансия удалена', 'success');
            });
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
        requirements: jobData.requirements || '',
        moderationStatus: 'pending' // Статус модерации по умолчанию
    };
    
    allJobs.push(newJob);
    
    if (saveJobs(allJobs)) {
        showNotification('Вакансия успешно создана!', 'success');
        // Обновляем отображение вакансий в профиле
        await loadEmployerJobs();
        // Обновляем отображение на главной странице, если она открыта
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            loadLatestJobsToHomePage();
        }
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
        
        // Определяем статус отклика
        const status = app.status || 'sent';
        const statusText = {
            'sent': 'Отправлено',
            'viewed': 'Просмотрено',
            'invited': 'Приглашение отправлено',
            'rejected': 'Отклонено'
        };
        
        const statusBadgeStyle = {
            'sent': 'background: #e5e7eb; color: #374151;',
            'viewed': 'background: #dbeafe; color: #1e40af;',
            'invited': 'background: #d1fae5; color: #065f46;',
            'rejected': 'background: #fee2e2; color: #991b1b;'
        };
        
        html += `
            <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <h3>Отклик #${index + 1}</h3>
                <p><strong>Дата отклика:</strong> ${date}</p>
                ${resume ? `<p><strong>Соискатель:</strong> ${resume.fullName || 'Не указано'}</p>` : ''}
                ${resume ? `<p><strong>Телефон:</strong> ${resume.phone || 'Не указан'}</p>` : ''}
                ${resume ? `<p><strong>Email:</strong> ${resume.email || 'Не указан'}</p>` : ''}
                <p style="margin-top: 10px;">
                    <strong>Статус:</strong> 
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; ${statusBadgeStyle[status] || statusBadgeStyle['sent']}">
                        ${statusText[status] || 'Отправлено'}
                    </span>
                </p>
                <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-small btn-primary view-resume-from-app" data-resume-id="${app.resumeId}">Просмотреть резюме</button>
                    ${status !== 'viewed' && status !== 'invited' ? `
                        <button class="btn btn-small btn-secondary mark-viewed-modal-btn" data-application-id="${app.id}">Просмотрено</button>
                    ` : ''}
                    ${status !== 'invited' ? `
                        <button class="btn btn-small btn-success mark-invited-modal-btn" data-application-id="${app.id}">Приглашение</button>
                    ` : ''}
                </div>
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
    
    // Обработчики для кнопок статуса в модальном окне
    content.querySelectorAll('.mark-viewed-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const applicationId = e.target.getAttribute('data-application-id');
            if (updateApplicationStatus(applicationId, 'viewed')) {
                // Закрываем модальное окно и перезагружаем список
                document.body.removeChild(modal);
                loadJobApplications();
            }
        });
    });
    
    content.querySelectorAll('.mark-invited-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const applicationId = e.target.getAttribute('data-application-id');
            if (updateApplicationStatus(applicationId, 'invited')) {
                // Закрываем модальное окно и перезагружаем список
                document.body.removeChild(modal);
                loadJobApplications();
            }
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
            // Обновляем отображение на главной странице, если она открыта
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
                loadLatestJobsToHomePage();
            }
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
        
        // Определяем статус отклика
        const status = application.status || 'sent';
        const statusText = {
            'sent': 'Отправлено',
            'viewed': 'Просмотрено',
            'invited': 'Приглашение отправлено',
            'rejected': 'Отклонено'
        };
        
        const statusBadgeStyle = {
            'sent': 'background: #e5e7eb; color: #374151;',
            'viewed': 'background: #dbeafe; color: #1e40af;',
            'invited': 'background: #d1fae5; color: #065f46;',
            'rejected': 'background: #fee2e2; color: #991b1b;'
        };
        
        item.innerHTML = `
            <div class="application-info">
                <h4>${job ? job.title : 'Вакансия удалена'}</h4>
                <p><strong>Соискатель:</strong> ${resume ? resume.fullName : 'Не указано'}</p>
                <p><strong>Телефон:</strong> ${resume ? resume.phone : 'Не указан'}</p>
                <p><strong>Email:</strong> ${resume ? resume.email || 'Не указан' : 'Не указан'}</p>
                <p>Дата отклика: ${date}</p>
                <p style="margin-top: 10px;">
                    <strong>Статус:</strong> 
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; ${statusBadgeStyle[status] || statusBadgeStyle['sent']}">
                        ${statusText[status] || 'Отправлено'}
                    </span>
                </p>
            </div>
            <div class="application-actions" style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
                ${resume ? `<button class="btn btn-small btn-primary view-resume-from-list" data-resume-id="${application.resumeId}">Просмотреть резюме</button>` : ''}
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${status !== 'viewed' && status !== 'invited' ? `
                        <button class="btn btn-small btn-secondary mark-viewed-btn" data-application-id="${application.id}">Просмотрено</button>
                    ` : ''}
                    ${status !== 'invited' ? `
                        <button class="btn btn-small btn-success mark-invited-btn" data-application-id="${application.id}">Приглашение</button>
                    ` : ''}
                </div>
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
    
    // Обработчики для кнопок статуса
    document.querySelectorAll('.mark-viewed-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const applicationId = e.target.getAttribute('data-application-id');
            if (updateApplicationStatus(applicationId, 'viewed')) {
                loadJobApplications(); // Перезагружаем список
            }
        });
    });
    
    document.querySelectorAll('.mark-invited-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const applicationId = e.target.getAttribute('data-application-id');
            if (updateApplicationStatus(applicationId, 'invited')) {
                loadJobApplications(); // Перезагружаем список
            }
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

// ========== РАБОТА С УВЕДОМЛЕНИЯМИ ==========

// Загрузка уведомлений из localStorage
function loadNotifications() {
    const notificationsFromStorage = localStorage.getItem('notifications');
    if (notificationsFromStorage) {
        try {
            const notifications = JSON.parse(notificationsFromStorage);
            if (Array.isArray(notifications)) {
                return notifications;
            }
        } catch (e) {
            console.error('Ошибка парсинга уведомлений из localStorage:', e);
        }
    }
    return [];
}

// Сохранение уведомлений в localStorage
function saveNotifications(notifications) {
    if (!Array.isArray(notifications)) {
        console.error('Ошибка: notifications должен быть массивом');
        return false;
    }
    localStorage.setItem('notifications', JSON.stringify(notifications));
    console.log('✅ Уведомления сохранены в localStorage');
    return true;
}

// Создание уведомления
function createNotification(userId, type, title, message, relatedId = null) {
    const notifications = loadNotifications();
    
    const notification = {
        id: 'notif_' + Date.now().toString(),
        userId: userId,
        type: type, // 'invitation', 'viewed', 'rejected', etc.
        title: title,
        message: message,
        relatedId: relatedId, // ID отклика или другой связанной сущности
        isRead: false,
        createdAt: new Date().toISOString()
    };
    
    notifications.push(notification);
    saveNotifications(notifications);
    
    return notification;
}

// Получение уведомлений пользователя
function getUserNotifications(userId) {
    const notifications = loadNotifications();
    return notifications.filter(notif => notif.userId === userId);
}

// Получение непрочитанных уведомлений пользователя
function getUnreadNotifications(userId) {
    const notifications = getUserNotifications(userId);
    return notifications.filter(notif => !notif.isRead);
}

// Отметить уведомление как прочитанное
function markNotificationAsRead(notificationId) {
    const notifications = loadNotifications();
    const notificationIndex = notifications.findIndex(notif => notif.id === notificationId);
    
    if (notificationIndex !== -1) {
        notifications[notificationIndex].isRead = true;
        notifications[notificationIndex].readAt = new Date().toISOString();
        saveNotifications(notifications);
        return true;
    }
    
    return false;
}

// Отметить все уведомления пользователя как прочитанные
function markAllNotificationsAsRead(userId) {
    const notifications = loadNotifications();
    let updated = false;
    
    notifications.forEach(notif => {
        if (notif.userId === userId && !notif.isRead) {
            notif.isRead = true;
            notif.readAt = new Date().toISOString();
            updated = true;
        }
    });
    
    if (updated) {
        saveNotifications(notifications);
    }
    
    return updated;
}

// Обновление статуса отклика
function updateApplicationStatus(applicationId, newStatus) {
    const applications = loadApplications();
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
        showNotification('Отклик не найден!', 'error');
        return false;
    }
    
    const application = applications[applicationIndex];
    const oldStatus = application.status;
    
    applications[applicationIndex].status = newStatus;
    applications[applicationIndex].updatedAt = new Date().toISOString();
    
    if (saveApplications(applications)) {
        // Если статус изменен на "invited", создаем уведомление для соискателя
        if (newStatus === 'invited' && oldStatus !== 'invited') {
            // Используем async/await для получения информации о вакансии
            (async () => {
                const job = await getJobById(application.jobId);
                if (job) {
                    createNotification(
                        application.userId,
                        'invitation',
                        'Приглашение на собеседование',
                        `Вы получили приглашение на вакансию "${job.title}" в компании "${job.company}"`,
                        application.id
                    );
                }
            })();
        }
        
        const statusMessages = {
            'viewed': 'Отклик отмечен как просмотренный',
            'invited': 'Приглашение отправлено соискателю',
            'rejected': 'Отклик отклонен'
        };
        showNotification(statusMessages[newStatus] || 'Статус обновлен', 'success');
        return true;
    }
    
    return false;
}

// Получение отклика по ID
function getApplicationById(applicationId) {
    const applications = loadApplications();
    return applications.find(app => app.id === applicationId);
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
        
        // Скрываем кнопку создания резюме на главной для работодателей
        const createResumeHeroBtn = document.getElementById('create-resume-hero-btn');
        if (createResumeHeroBtn && currentUser.status === 'employer') {
            createResumeHeroBtn.style.display = 'none';
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
    
    const jobSearchSection = document.querySelector('.job-search-section');
    // Загрузка вакансий на странице поиска работы
    if (jobSearchSection) {
        loadJobsToPage();
        
        // Инициализация обработчиков поиска и фильтров
        initJobSearchFilters();
        populateProfessionOptions();
    }
    
    // Загрузка последних вакансий на главной странице
    const isHomePage = document.querySelector('.hero');
    if (isHomePage) {
        loadLatestJobsToHomePage();
    }
    
    // Автозаполнение формы резюме данными пользователя
    const resumeForm = document.getElementById('resumeForm');
    if (resumeForm) {
        // Проверяем, что пользователь авторизован и является соискателем
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        } else {
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.status === 'employer') {
                // Работодатель не может создавать резюме
                showNotification('Работодатели не могут создавать резюме!', 'error');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
            } else {
                fillResumeFormWithUserData();
                initResumeForm();
            }
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
    
    // Проверка авторизации для формы обратной связи на странице контактов
    const feedbackFormContainer = document.getElementById('feedback-form-container');
    if (feedbackFormContainer) {
        const feedbackForm = document.getElementById('contacts-feedback-form');
        const feedbackLoginRequired = document.getElementById('feedback-login-required');
        
        if (isLoggedIn()) {
            // Пользователь авторизован - показываем форму
            if (feedbackForm) {
                feedbackForm.style.display = 'block';
            }
            if (feedbackLoginRequired) {
                feedbackLoginRequired.style.display = 'none';
            }
        } else {
            // Пользователь не авторизован - показываем сообщение
            if (feedbackForm) {
                feedbackForm.style.display = 'none';
            }
            if (feedbackLoginRequired) {
                feedbackLoginRequired.style.display = 'block';
            }
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
        document.getElementById('create-resume-btn').style.display = 'none'; // Убираем возможность создания резюме
        document.getElementById('create-job-btn').style.display = 'inline-block';
        document.getElementById('resumes-section').style.display = 'none'; // Скрываем секцию резюме
        document.getElementById('applications-section').style.display = 'none';
        document.getElementById('notifications-section').style.display = 'none';
        document.getElementById('jobs-section').style.display = 'block';
        document.getElementById('job-applications-section').style.display = 'block';
        
        // Загружаем вакансии работодателя
        loadEmployerJobs();
        // Загружаем отклики на вакансии
        loadJobApplications();
        // НЕ загружаем резюме для работодателя
    } else {
        // Для соискателей
        document.getElementById('create-resume-btn').style.display = 'inline-block';
        document.getElementById('create-job-btn').style.display = 'none';
        document.getElementById('resumes-section').style.display = 'block';
        document.getElementById('applications-section').style.display = 'block';
        document.getElementById('notifications-section').style.display = 'block';
        document.getElementById('jobs-section').style.display = 'none';
        document.getElementById('job-applications-section').style.display = 'none';
        
        // Загружаем и отображаем резюме
        loadUserResumes();
        // Загружаем и отображаем отклики
        loadUserApplications();
        // Загружаем и отображаем уведомления
        loadUserNotifications();
        
        // Обработчик для кнопки "Отметить все как прочитанные"
        const markAllReadBtn = document.getElementById('mark-all-read-btn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                const currentUser = getCurrentUser();
                if (currentUser && markAllNotificationsAsRead(currentUser.id)) {
                    loadUserNotifications();
                    showNotification('Все уведомления отмечены как прочитанные', 'success');
                }
            });
        }
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
        
        // Определяем статус модерации
        const moderationStatus = resume.moderationStatus || 'pending';
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
        
        row.innerHTML = `
            <td>${String(index + 1).padStart(3, '0')}</td>
            <td>
                ${resume.title || resume.fullName || 'Резюме'}
                <br>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 500; margin-top: 4px; ${moderationStatusStyle[moderationStatus] || moderationStatusStyle['pending']}">
                    ${moderationStatusText[moderationStatus] || 'На модерации'}
                </span>
            </td>
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
            showConfirmDialog('Вы уверены, что хотите удалить это резюме?', () => {
                deleteResume(resumeId);
                loadUserResumes(); // Перезагружаем список
                showNotification('Резюме удалено', 'success');
            });
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

// Загрузка и отображение уведомлений пользователя
function loadUserNotifications() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const notifications = getUserNotifications(currentUser.id);
    const notificationsList = document.getElementById('notifications-list');
    const unreadCountBadge = document.getElementById('unread-count');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    
    if (!notificationsList) return;
    
    // Сортируем уведомления по дате (новые сначала)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Подсчитываем непрочитанные
    const unreadCount = getUnreadNotifications(currentUser.id).length;
    
    // Обновляем счетчик непрочитанных
    if (unreadCountBadge) {
        if (unreadCount > 0) {
            unreadCountBadge.textContent = unreadCount;
            unreadCountBadge.style.display = 'inline-block';
        } else {
            unreadCountBadge.style.display = 'none';
        }
    }
    
    // Показываем/скрываем кнопку "Отметить все как прочитанные"
    if (markAllReadBtn) {
        if (unreadCount > 0) {
            markAllReadBtn.style.display = 'inline-block';
        } else {
            markAllReadBtn.style.display = 'none';
        }
    }
    
    // Очищаем список
    notificationsList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p style="text-align: center; padding: 20px;">У вас пока нет уведомлений</p>';
        return;
    }
    
    // Добавляем уведомления
    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.style.cssText = `
            padding: 15px;
            margin-bottom: 10px;
            background: ${notification.isRead ? '#f9fafb' : '#eff6ff'};
            border-left: 4px solid ${notification.isRead ? '#d1d5db' : '#2563eb'};
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.2s;
        `;
        
        if (!notification.isRead) {
            item.style.fontWeight = '500';
        }
        
        const date = new Date(notification.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const typeIcon = {
            'invitation': '🎉',
            'viewed': '👁️',
            'rejected': '❌',
            'approved': '✅',
            'pending': '⏳'
        };
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <span style="font-size: 20px;">${typeIcon[notification.type] || '📢'}</span>
                        <h4 style="margin: 0; font-size: 16px;">${notification.title}</h4>
                        ${!notification.isRead ? '<span style="background: #2563eb; width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span>' : ''}
                    </div>
                    <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${notification.message}</p>
                    <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">${date}</p>
                </div>
                ${!notification.isRead ? `
                    <button class="btn btn-small btn-secondary mark-notification-read-btn" data-notification-id="${notification.id}" style="margin-left: 10px;">
                        Отметить как прочитанное
                    </button>
                ` : ''}
            </div>
        `;
        
        // Обработчик клика для отметки как прочитанное
        if (!notification.isRead) {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('mark-notification-read-btn')) {
                    markNotificationAsRead(notification.id);
                    loadUserNotifications();
                }
            });
        }
        
        notificationsList.appendChild(item);
    });
    
    // Обработчики для кнопок "Отметить как прочитанное"
    document.querySelectorAll('.mark-notification-read-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const notificationId = e.target.getAttribute('data-notification-id');
            if (markNotificationAsRead(notificationId)) {
                loadUserNotifications();
            }
        });
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

// Загрузка и отображение вакансий на главной странице
async function loadLatestJobsToHomePage() {
    const jobs = await loadJobs();
    console.log('🏠 loadLatestJobsToHomePage: Загружено вакансий:', jobs.length);
    
    const latestJobsList = document.getElementById('latest-jobs-list');
    if (!latestJobsList) {
        console.log('❌ loadLatestJobsToHomePage: Элемент latest-jobs-list не найден');
        return;
    }
    
    // Фильтруем только одобренные вакансии для публичного просмотра
    // Вакансии из файла (с employerId = 'system') всегда считаются одобренными
    const approvedJobs = jobs.filter(job => {
        // Системные вакансии из файла всегда одобрены
        if (job.employerId === 'system') {
            return true;
        }
        // Для пользовательских вакансий проверяем статус модерации
        const moderationStatus = job.moderationStatus || 'pending';
        return moderationStatus === 'approved';
    });
    
    // Сортируем вакансии по дате (новые сначала) и берем последние 6
    const sortedJobs = approvedJobs.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted)).slice(0, 6);
    console.log('📊 loadLatestJobsToHomePage: Отображаем вакансий:', sortedJobs.length);
    
    // Очищаем список
    latestJobsList.innerHTML = '';
    
    if (sortedJobs.length === 0) {
        latestJobsList.innerHTML = '<p style="text-align: center; padding: 20px; grid-column: 1 / -1;">Вакансии пока не добавлены</p>';
        console.log('ℹ️ loadLatestJobsToHomePage: Нет вакансий для отображения');
        return;
    }
    
    // Добавляем вакансии
    sortedJobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'vacancy-card';
        
        const datePosted = new Date(job.datePosted).toLocaleDateString('ru-RU');
        const daysAgo = Math.floor((Date.now() - new Date(job.datePosted).getTime()) / (1000 * 60 * 60 * 24));
        const dateText = daysAgo === 0 ? 'Сегодня' : daysAgo === 1 ? 'Вчера' : `${daysAgo} дня назад`;
        
        const tagsHtml = (job.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
        
        card.innerHTML = `
            <div class="vacancy-header">
                <h3>${job.title}</h3>
                <div class="vacancy-salary">${job.salary || 'Не указана'}</div>
            </div>
            <div class="vacancy-company">
                <strong>${job.company || 'Не указана'}</strong>
                <span class="company-location">${job.location || 'Не указано'}</span>
            </div>
            <div class="vacancy-description">
                <p>${job.description || 'Описание отсутствует'}</p>
            </div>
            ${tagsHtml ? `<div class="vacancy-tags">${tagsHtml}</div>` : ''}
            <div class="vacancy-footer">
                <span class="vacancy-date">${dateText}</span>
                <button class="btn btn-primary view-job-details-home" data-job-id="${job.id}">Подробнее</button>
            </div>
        `;
        
        latestJobsList.appendChild(card);
    });
    
    // Добавляем обработчики для кнопок просмотра деталей на главной
    document.querySelectorAll('.view-job-details-home').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const jobId = e.target.getAttribute('data-job-id');
            await showJobDetails(jobId);
        });
    });
}

// Динамическое наполнение списка профессий из вакансий
async function populateProfessionOptions() {
    const professionSelect = document.getElementById('profession-select');
    if (!professionSelect) return;
    
    // Удаляем ранее добавленные динамические опции
    professionSelect.querySelectorAll('option[data-dynamic="true"]').forEach(option => option.remove());
    
    const jobs = await loadJobs();
    const existingValues = new Set(
        Array.from(professionSelect.options).map(option => option.value.toLowerCase())
    );
    
    const dynamicOptions = [];
    
    jobs.forEach(job => {
        const title = (job.title || '').trim();
        if (!title) return;
        const lowerTitle = title.toLowerCase();
        
        if (existingValues.has(lowerTitle)) {
            return;
        }
        
        existingValues.add(lowerTitle);
        dynamicOptions.push(title);
    });
    
    dynamicOptions
        .sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }))
        .forEach(title => {
            const option = document.createElement('option');
            option.value = title;
            option.textContent = title;
            option.dataset.dynamic = 'true';
            professionSelect.appendChild(option);
        });
}

// Фильтрация вакансий по критериям
function filterJobs(jobs, filters) {
    let filtered = [...jobs];
    
    // Фильтр по текстовому поиску (название, описание, компания)
    if (filters.searchText && filters.searchText.trim()) {
        const searchLower = filters.searchText.toLowerCase().trim();
        filtered = filtered.filter(job => {
            const title = (job.title || '').toLowerCase();
            const description = (job.description || '').toLowerCase();
            const company = (job.company || '').toLowerCase();
            const tags = (job.tags || []).join(' ').toLowerCase();
            return title.includes(searchLower) || 
                   description.includes(searchLower) || 
                   company.includes(searchLower) ||
                   tags.includes(searchLower);
        });
    }
    
    // Фильтр по городу/локации
    if (filters.location && filters.location.trim()) {
        const locationLower = filters.location.toLowerCase().trim();
        filtered = filtered.filter(job => {
            const jobLocation = (job.location || '').toLowerCase();
            return jobLocation.includes(locationLower);
        });
    }
    
    // Фильтр по профессии
    if (filters.profession && filters.profession !== '') {
        const professionMap = {
            'frontend': ['frontend', 'react', 'javascript', 'typescript', 'vue', 'angular'],
            'backend': ['backend', 'node', 'python', 'java', 'php', 'postgresql', 'mysql'],
            'fullstack': ['fullstack', 'full-stack', 'full stack'],
            'designer': ['дизайн', 'design', 'ui', 'ux'],
            'manager': ['менеджер', 'manager', 'управление', 'руководство']
        };
        const professionKey = filters.profession.toLowerCase();
        const keywords = professionMap[professionKey] || [];
        
        if (keywords.length > 0) {
            filtered = filtered.filter(job => {
                const title = (job.title || '').toLowerCase();
                const description = (job.description || '').toLowerCase();
                const tags = (job.tags || []).join(' ').toLowerCase();
                const searchText = (title + ' ' + description + ' ' + tags).toLowerCase();
                return keywords.some(keyword => searchText.includes(keyword));
            });
        } else {
            filtered = filtered.filter(job => {
                const title = (job.title || '').toLowerCase();
                return title.includes(professionKey);
            });
        }
    }
    
    // Фильтр по зарплате
    if (filters.salaryMin !== null && filters.salaryMin !== undefined && filters.salaryMin !== '') {
        filtered = filtered.filter(job => {
            const salaryMin = job.salaryMin || 0;
            return salaryMin >= parseInt(filters.salaryMin);
        });
    }
    
    if (filters.salaryMax !== null && filters.salaryMax !== undefined && filters.salaryMax !== '') {
        filtered = filtered.filter(job => {
            const salaryMin = job.salaryMin || 0;
            return salaryMin <= parseInt(filters.salaryMax);
        });
    }
    
    // Фильтр по региону
    if (filters.region && filters.region !== '') {
        const regionMap = {
            'moscow': ['москва', 'moscow'],
            'spb': ['санкт-петербург', 'спб', 'питер', 'st. petersburg', 'saint petersburg'],
            'ekaterinburg': ['екатеринбург', 'ekaterinburg'],
            'remote': ['удаленно', 'удаленная', 'remote', 'remotely', 'удалённо']
        };
        
        const keywords = regionMap[filters.region] || [];
        if (keywords.length > 0) {
            filtered = filtered.filter(job => {
                const location = (job.location || '').toLowerCase();
                return keywords.some(keyword => location.includes(keyword));
            });
        }
    }
    
    // Фильтр по типу занятости
    if (filters.employmentTypes && filters.employmentTypes.length > 0) {
        const employmentTypeMap = {
            'full': ['полная занятость', 'полный день', 'full-time'],
            'part': ['частичная занятость', 'частичный день', 'part-time'],
            'remote': ['удаленная работа', 'удалённая работа', 'remote', 'удаленно']
        };
        
        filtered = filtered.filter(job => {
            const employmentType = (job.employmentType || '').toLowerCase();
            return filters.employmentTypes.some(type => {
                const keywords = employmentTypeMap[type] || [];
                return keywords.some(keyword => employmentType.includes(keyword));
            });
        });
    }
    
    return filtered;
}

// Сортировка вакансий
function sortJobs(jobs, sortBy) {
    const sorted = [...jobs];
    
    switch(sortBy) {
        case 'date':
            sorted.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
            break;
        case 'salary':
            sorted.sort((a, b) => (b.salaryMin || 0) - (a.salaryMin || 0));
            break;
        case 'relevance':
        default:
            // Сортировка по релевантности (новые сначала)
            sorted.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
            break;
    }
    
    return sorted;
}

// Загрузка и отображение вакансий с фильтрацией
async function loadJobsToPage(filters = {}, sortBy = 'relevance') {
    const jobs = await loadJobs();
    
    // Фильтруем только одобренные вакансии для публичного просмотра
    // Вакансии из файла (с employerId = 'system') всегда считаются одобренными
    let approvedJobs = jobs.filter(job => {
        // Системные вакансии из файла всегда одобрены
        if (job.employerId === 'system') {
            return true;
        }
        // Для пользовательских вакансий проверяем статус модерации
        const moderationStatus = job.moderationStatus || 'pending';
        return moderationStatus === 'approved';
    });
    
    // Применяем фильтры, если они есть
    if (Object.keys(filters).length > 0) {
        approvedJobs = filterJobs(approvedJobs, filters);
    }
    
    // Применяем сортировку
    approvedJobs = sortJobs(approvedJobs, sortBy);
    
    const vacanciesList = document.querySelector('.vacancies-list');
    const resultsHeader = document.querySelector('.results-header h2');
    
    if (!vacanciesList) return;
    
    // Обновляем количество найденных вакансий
    if (resultsHeader) {
        resultsHeader.textContent = `Найдено вакансий: ${approvedJobs.length}`;
    }
    
    // Очищаем список
    vacanciesList.innerHTML = '';
    
    if (approvedJobs.length === 0) {
        vacanciesList.innerHTML = '<p style="text-align: center; padding: 20px;">Вакансии не найдены</p>';
        return;
    }
    
    // Добавляем вакансии
    approvedJobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'vacancy-card';
        
        const datePosted = new Date(job.datePosted).toLocaleDateString('ru-RU');
        const daysAgo = Math.floor((Date.now() - new Date(job.datePosted).getTime()) / (1000 * 60 * 60 * 24));
        const dateText = daysAgo === 0 ? 'Сегодня' : daysAgo === 1 ? 'Вчера' : `${daysAgo} дня назад`;
        
        const tagsHtml = (job.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
        
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
            ${tagsHtml ? `<div class="vacancy-tags">${tagsHtml}</div>` : ''}
            <div class="vacancy-footer">
                <span class="vacancy-date">${dateText}</span>
                <button class="btn btn-primary view-job-details" data-job-id="${job.id}">Подробнее</button>
            </div>
        `;
        
        vacanciesList.appendChild(card);
    });
    
    // Добавляем обработчики для кнопок просмотра деталей
    document.querySelectorAll('.view-job-details').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const jobId = e.target.getAttribute('data-job-id');
            await showJobDetails(jobId);
        });
    });
}

// Инициализация обработчиков поиска и фильтров
function initJobSearchFilters() {
    // Получаем элементы формы
    const searchInputs = document.querySelectorAll('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const applyFiltersBtn = document.querySelector('.filter-actions .btn-primary');
    const resetFiltersBtn = document.querySelector('.filter-actions .btn-secondary');
    const sortSelect = document.querySelector('.sort-select');
    
    // Текущие фильтры (сохраняем в глобальной переменной или в замыкании)
    let currentFilters = {};
    let currentSort = 'relevance';
    
    // Функция для получения текущих значений фильтров
    function getFilters() {
        const filters = {};
        
        // Текстовый поиск
        if (searchInputs.length > 0 && searchInputs[0].value.trim()) {
            filters.searchText = searchInputs[0].value.trim();
        }
        
        // Поиск по городу
        if (searchInputs.length > 1 && searchInputs[1].value.trim()) {
            filters.location = searchInputs[1].value.trim();
        }
        
        // Профессия
        const professionSelect = document.getElementById('profession-select');
        if (professionSelect && professionSelect.value) {
            filters.profession = professionSelect.value;
        }
        
        // Зарплата
        const salaryInputs = document.querySelectorAll('.salary-input');
        if (salaryInputs.length > 0 && salaryInputs[0].value) {
            filters.salaryMin = salaryInputs[0].value;
        }
        if (salaryInputs.length > 1 && salaryInputs[1].value) {
            filters.salaryMax = salaryInputs[1].value;
        }
        
        // Регион
        const regionSelect = document.getElementById('region-select');
        if (regionSelect && regionSelect.value) {
            filters.region = regionSelect.value;
        }
        
        // Тип занятости
        const employmentCheckboxes = document.querySelectorAll('.employment-types input[type="checkbox"]:checked');
        if (employmentCheckboxes.length > 0) {
            filters.employmentTypes = Array.from(employmentCheckboxes).map(cb => cb.value);
        }
        
        return filters;
    }
    
    // Функция для применения фильтров
    async function applyFilters() {
        currentFilters = getFilters();
        await loadJobsToPage(currentFilters, currentSort);
    }
    
    // Функция для сброса фильтров
    async function resetFilters() {
        // Очищаем все поля
        if (searchInputs.length > 0) searchInputs[0].value = '';
        if (searchInputs.length > 1) searchInputs[1].value = '';
        
        const professionSelect = document.getElementById('profession-select');
        if (professionSelect) professionSelect.value = '';
        
        const salaryInputs = document.querySelectorAll('.salary-input');
        salaryInputs.forEach(input => input.value = '');
        
        const regionSelect = document.getElementById('region-select');
        if (regionSelect) {
            regionSelect.value = '';
        }
        
        const employmentCheckboxes = document.querySelectorAll('.employment-types input[type="checkbox"]');
        employmentCheckboxes.forEach(cb => cb.checked = false);
        
        currentFilters = {};
        await loadJobsToPage({}, currentSort);
    }
    
    // Обработчик кнопки поиска
    if (searchBtn) {
        searchBtn.addEventListener('click', applyFilters);
    }
    
    // Обработчик Enter в полях поиска
    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    });
    
    // Обработчик кнопки "Применить фильтры"
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // Обработчик кнопки "Сбросить"
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // Обработчик сортировки
    if (sortSelect) {
        sortSelect.addEventListener('change', async (e) => {
            currentSort = e.target.value;
            await loadJobsToPage(currentFilters, currentSort);
        });
    }
}

// Просмотр деталей вакансии
async function showJobDetails(jobId) {
    const job = await getJobById(jobId);
    if (!job) {
        showNotification('Вакансия не найдена!', 'error');
        return;
    }
    
    const currentUser = getCurrentUser();
    const isEmployer = currentUser && currentUser.status === 'employer';
    const isApplicant = currentUser && currentUser.status === 'applicant';
    
    // Создаем модальное окно для просмотра деталей вакансии
    const modal = document.createElement('div');
    modal.className = 'job-details-modal';
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
        padding: 40px;
        border-radius: 12px;
        position: relative;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    `;
    
    const datePosted = new Date(job.datePosted).toLocaleDateString('ru-RU');
    const tagsHtml = (job.tags || []).map(tag => `<span class="tag" style="display: inline-block; padding: 5px 12px; background: #e0e7ff; color: #4338ca; border-radius: 12px; font-size: 14px; margin-right: 8px; margin-bottom: 8px;">${tag}</span>`).join('');
    
    let applyButtonHtml = '';
    if (isApplicant && !isEmployer) {
        // Для соискателей показываем кнопку отклика
        const resumes = getUserResumes(currentUser.id);
        if (resumes.length > 0) {
            applyButtonHtml = `
                <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                    <button class="btn btn-primary" id="applyJobFromDetailsBtn" data-job-id="${job.id}" style="width: 100%; padding: 12px; font-size: 16px;">
                        Откликнуться на вакансию
                    </button>
                </div>
            `;
        } else {
            applyButtonHtml = `
                <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                    <p style="color: #ef4444; margin-bottom: 15px;">Для отклика необходимо создать резюме</p>
                    <a href="resume-create.html" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px; text-align: center; display: block; text-decoration: none;">
                        Создать резюме
                    </a>
                </div>
            `;
        }
    } else if (!currentUser) {
        applyButtonHtml = `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                <p style="color: #6b7280; margin-bottom: 15px;">Для отклика необходимо войти в систему</p>
                <a href="login.html" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px; text-align: center; display: block; text-decoration: none;">
                    Войти
                </a>
            </div>
        `;
    }
    
    content.innerHTML = `
        <button class="close-modal" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; z-index: 1;">&times;</button>
        <div style="margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0; color: #1f2937; font-size: 28px;">${job.title || 'Название не указано'}</h1>
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #374151;">${job.company || 'Компания не указана'}</strong>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280;">
                    📍 ${job.location || 'Местоположение не указано'}
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #10b981; font-weight: 600;">
                    💰 ${job.salary || 'Зарплата не указана'}
                </div>
            </div>
            <div style="color: #6b7280; font-size: 14px;">
                📅 Опубликовано: ${datePosted}
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h2 style="color: #68A800; border-bottom: 2px solid #68A800; padding-bottom: 5px; margin-bottom: 15px; font-size: 20px;">Описание</h2>
            <p style="color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${job.description || 'Описание отсутствует'}</p>
        </div>
        
        ${job.requirements ? `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #68A800; border-bottom: 2px solid #68A800; padding-bottom: 5px; margin-bottom: 15px; font-size: 20px;">Требования</h2>
                <p style="color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${job.requirements}</p>
            </div>
        ` : ''}
        
        ${tagsHtml ? `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #68A800; border-bottom: 2px solid #68A800; padding-bottom: 5px; margin-bottom: 15px; font-size: 20px;">Технологии</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${tagsHtml}
                </div>
            </div>
        ` : ''}
        
        ${job.employmentType ? `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #68A800; border-bottom: 2px solid #68A800; padding-bottom: 5px; margin-bottom: 15px; font-size: 20px;">Тип занятости</h2>
                <p style="color: #4b5563;">${job.employmentType}</p>
            </div>
        ` : ''}
        
        ${applyButtonHtml}
    `;
    
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
    
    // Обработчик кнопки отклика (только для соискателей)
    const applyBtn = content.querySelector('#applyJobFromDetailsBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', async () => {
            const jobId = applyBtn.getAttribute('data-job-id');
            document.body.removeChild(modal);
            await handleJobApplication(jobId);
        });
    }
}

// Обработка отклика на вакансию (только для соискателей)
async function handleJobApplication(jobId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Необходимо войти в систему!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Проверяем, что пользователь - соискатель
    if (currentUser.status === 'employer') {
        showNotification('Работодатели не могут откликаться на вакансии!', 'error');
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
            showNotification('Отклик успешно отправлен!', 'success');
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

// ========== ФУНКЦИОНАЛ СОЗДАНИЯ РЕЗЮМЕ ==========

// Инициализация формы резюме
function initResumeForm() {
    const form = document.getElementById('resumeForm');
    if (!form) return;
    
    // Обработчик для кнопки "Сохранить черновик"
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveResumeDraft();
        });
    }
    
    // Обработчик для кнопки "Предварительный просмотр"
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showFullResumePreview();
        });
    }
    
    // Обработчик для кнопки "Обновить предпросмотр" в мини-предпросмотре
    const updatePreviewBtn = document.getElementById('updatePreviewBtn');
    if (updatePreviewBtn) {
        updatePreviewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            updateMiniPreview();
        });
    }
    
    // Обработчик для кнопки "Полный предпросмотр" в мини-предпросмотре
    const fullPreviewBtn = document.getElementById('fullPreviewBtn');
    if (fullPreviewBtn) {
        fullPreviewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showFullResumePreview();
        });
    }
    
    // Автоматическое обновление мини-предпросмотра при изменении полей
    const formInputs = form.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateMiniPreview();
        });
        input.addEventListener('change', () => {
            updateMiniPreview();
        });
    });
    
    // Загрузка черновика при загрузке страницы
    loadResumeDraft();
    
    // Первоначальное обновление предпросмотра
    setTimeout(() => {
        updateMiniPreview();
    }, 100);
}

// Обновление мини-предпросмотра резюме
function updateMiniPreview() {
    const form = document.getElementById('resumeForm');
    if (!form) return;
    
    // Получаем данные из формы
    const fullName = form.querySelector('#fullName')?.value || 'Иванов Иван Иванович';
    const phone = form.querySelector('#phone')?.value || '+7 (999) 123-45-67';
    const email = form.querySelector('#email')?.value || 'example@email.com';
    const professionalSkills = form.querySelector('#professionalSkills')?.value || '';
    const university = form.querySelector('#university')?.value || '';
    const degree = form.querySelector('#degree')?.value || '';
    
    // Обновляем мини-предпросмотр
    const miniFullName = document.getElementById('miniFullName');
    const miniContacts = document.getElementById('miniContacts');
    const miniSkills = document.getElementById('miniSkills');
    const miniEducation = document.getElementById('miniEducation');
    
    if (miniFullName) {
        miniFullName.textContent = fullName;
    }
    
    if (miniContacts) {
        miniContacts.textContent = `📱 ${phone} | 📧 ${email}`;
    }
    
    if (miniSkills) {
        if (professionalSkills) {
            const skills = professionalSkills.split(',').map(s => s.trim()).filter(s => s);
            miniSkills.innerHTML = skills.slice(0, 5).map(skill => 
                `<span class="mini-skill-tag">${skill}</span>`
            ).join('');
        } else {
            miniSkills.innerHTML = '<span class="mini-skill-tag">Навыки не указаны</span>';
        }
    }
    
    if (miniEducation) {
        if (university && degree) {
            miniEducation.textContent = `${university}, ${degree}`;
        } else {
            miniEducation.textContent = 'Образование не указано';
        }
    }
    
    // Обновляем аватар из профиля пользователя
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.avatar) {
        const miniAvatar = document.getElementById('miniAvatar');
        if (miniAvatar) {
            miniAvatar.src = currentUser.avatar;
        }
    }
}

// Полный предпросмотр резюме
function showFullResumePreview() {
    const form = document.getElementById('resumeForm');
    if (!form) return;
    
    // Собираем данные из формы
    const resumeData = collectResumeDataFromForm(form);
    
    // Создаем модальное окно для полного предпросмотра
    const modal = document.createElement('div');
    modal.className = 'resume-preview-modal';
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
        max-width: 900px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 8px;
        position: relative;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    `;
    
    // Генерируем HTML резюме
    const resumeHTML = generateResumeHTML(resumeData);
    
    content.innerHTML = `
        <button class="close-modal" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; z-index: 1;">&times;</button>
        <div style="text-align: right; margin-bottom: 20px;">
            <button class="btn btn-secondary" id="updatePreviewFromModalBtn">Обновить</button>
        </div>
        ${resumeHTML}
    `;
    
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
    
    // Обработчик кнопки обновления из модального окна
    const updateBtn = content.querySelector('#updatePreviewFromModalBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            showFullResumePreview();
        });
    }
}

// Сбор данных резюме из формы
function collectResumeDataFromForm(form) {
    const currentUser = getCurrentUser();
    
    return {
        fullName: form.querySelector('#fullName')?.value || '',
        birthDate: form.querySelector('#birthDate')?.value || '',
        phone: form.querySelector('#phone')?.value || '',
        email: form.querySelector('#email')?.value || '',
        address: form.querySelector('#address')?.value || '',
        desiredSalary: form.querySelector('#desiredSalary')?.value || '',
        education: collectEducation(form),
        experience: collectExperience(form),
        professionalSkills: form.querySelector('#professionalSkills')?.value || '',
        personalSkills: form.querySelector('#personalSkills')?.value || '',
        hasExperience: form.querySelector('input[name="hasExperience"]:checked')?.value === 'yes',
        avatar: currentUser?.avatar || 'images/default-avatar.jpg'
    };
}

// Генерация HTML резюме для предпросмотра
function generateResumeHTML(data) {
    const currentUser = getCurrentUser();
    const avatar = currentUser?.avatar || 'images/default-avatar.jpg';
    
    let html = `
        <div class="resume-preview" style="font-family: 'Segoe UI', Arial, sans-serif; color: #333;">
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #68A800;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 15px;">
                    <img src="${avatar}" alt="Фото" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #68A800;">
                    <div style="text-align: left;">
                        <h1 style="margin: 0; color: #1f2937; font-size: 32px;">${data.fullName || 'Иванов Иван Иванович'}</h1>
                        <p style="margin: 10px 0 5px 0; color: #6b7280; font-size: 16px;">
                            📱 ${data.phone || 'Не указан'} | 📧 ${data.email || 'Не указан'}
                        </p>
                        ${data.address ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">📍 ${data.address}</p>` : ''}
                        ${data.birthDate ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">🎂 ${formatDate(data.birthDate)}</p>` : ''}
                    </div>
                </div>
            </div>
    `;
    
    // Образование
    if (data.education && data.education.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #68A800; border-bottom: 2px solid #68A800; padding-bottom: 5px; margin-bottom: 15px;">Образование</h2>
        `;
        data.education.forEach(edu => {
            html += `
                <div style="margin-bottom: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                    <h3 style="margin: 0 0 5px 0; color: #1f2937;">${edu.university || 'Не указано'}</h3>
                    <p style="margin: 5px 0; color: #374151;"><strong>Специальность:</strong> ${edu.degree || 'Не указано'}</p>
                    ${edu.graduationYear ? `<p style="margin: 5px 0; color: #374151;"><strong>Год окончания:</strong> ${edu.graduationYear}</p>` : ''}
                    ${edu.gpa ? `<p style="margin: 5px 0; color: #374151;"><strong>Средний балл:</strong> ${edu.gpa}</p>` : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    
    // Опыт работы
    if (data.hasExperience && data.experience && data.experience.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #68A800; border-bottom: 2px solid #68A800; padding-bottom: 5px; margin-bottom: 15px;">Опыт работы</h2>
        `;
        data.experience.forEach(exp => {
            const startDate = exp.startDate ? formatDate(exp.startDate) : 'Не указано';
            const endDate = exp.endDate ? formatDate(exp.endDate) : 'Настоящее время';
            html += `
                <div style="margin-bottom: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                    <h3 style="margin: 0 0 5px 0; color: #1f2937;">${exp.position || 'Не указано'}</h3>
                    <p style="margin: 5px 0; color: #374151;"><strong>Компания:</strong> ${exp.company || 'Не указано'}</p>
                    <p style="margin: 5px 0; color: #374151;"><strong>Период:</strong> ${startDate} - ${endDate}</p>
                    ${exp.responsibilities ? `<p style="margin: 10px 0 0 0; color: #4b5563; line-height: 1.6;">${exp.responsibilities}</p>` : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    
    // Навыки
    if (data.professionalSkills || data.personalSkills) {
        html += `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #68A800; border-bottom: 2px solid #68A800; padding-bottom: 5px; margin-bottom: 15px;">Навыки</h2>
        `;
        if (data.professionalSkills) {
            html += `
                <div style="margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 18px;">Профессиональные навыки</h3>
                    <p style="color: #4b5563; line-height: 1.6;">${data.professionalSkills}</p>
                </div>
            `;
        }
        if (data.personalSkills) {
            html += `
                <div style="margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 18px;">Личные качества</h3>
                    <p style="color: #4b5563; line-height: 1.6;">${data.personalSkills}</p>
                </div>
            `;
        }
        html += `</div>`;
    }
    
    // Желаемая зарплата
    if (data.desiredSalary) {
        html += `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #68A800; border-bottom: 2px solid #68A800; padding-bottom: 5px; margin-bottom: 15px;">Желаемая зарплата</h2>
                <p style="font-size: 18px; color: #1f2937;"><strong>${parseInt(data.desiredSalary).toLocaleString('ru-RU')} руб.</strong></p>
            </div>
        `;
    }
    
    html += `</div>`;
    
    return html;
}

// Сохранение черновика резюме
function saveResumeDraft() {
    const form = document.getElementById('resumeForm');
    if (!form) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Необходимо войти в систему!', 'error');
        return;
    }
    
    // Собираем данные из формы
    const draftData = {
        formData: {},
        timestamp: new Date().toISOString()
    };
    
    // Сохраняем все поля формы
    const formInputs = form.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                draftData.formData[input.name] = input.value;
            }
        } else {
            draftData.formData[input.id || input.name] = input.value;
        }
    });
    
    // Сохраняем черновик в localStorage
    const draftKey = `resume_draft_${currentUser.id}`;
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    
    showNotification('Черновик успешно сохранен!', 'success');
}

// Загрузка черновика резюме
function loadResumeDraft() {
    const form = document.getElementById('resumeForm');
    if (!form) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const draftKey = `resume_draft_${currentUser.id}`;
    const draftDataStr = localStorage.getItem(draftKey);
    
    if (!draftDataStr) return;
    
    try {
        const draftData = JSON.parse(draftDataStr);
        const formData = draftData.formData || {};
        
        // Заполняем форму данными из черновика
        Object.keys(formData).forEach(key => {
            const input = form.querySelector(`#${key}`) || form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'radio') {
                    if (input.value === formData[key]) {
                        input.checked = true;
                    }
                } else {
                    input.value = formData[key];
                }
            }
        });
        
        // Обновляем предпросмотр
        updateMiniPreview();
        
        // Показываем уведомление
        showNotification('Черновик загружен!', 'info');
    } catch (error) {
        console.error('Ошибка загрузки черновика:', error);
    }
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ========== РАБОТА С ОБРАТНОЙ СВЯЗЬЮ ==========

// Загрузка обратной связи из localStorage
function loadFeedbacks() {
    const feedbacksFromStorage = localStorage.getItem('feedbacks');
    if (feedbacksFromStorage) {
        try {
            const feedbacks = JSON.parse(feedbacksFromStorage);
            if (Array.isArray(feedbacks)) {
                return feedbacks;
            }
        } catch (e) {
            console.error('Ошибка парсинга обратной связи:', e);
        }
    }
    return [];
}

// Сохранение обратной связи в localStorage
function saveFeedbacks(feedbacks) {
    if (!Array.isArray(feedbacks)) {
        console.error('Ошибка: feedbacks должен быть массивом');
        return false;
    }
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    return true;
}

// Получение всех обращений
function getAllFeedbacks() {
    return loadFeedbacks();
}

// Получение обращения по ID
function getFeedbackById(feedbackId) {
    const feedbacks = loadFeedbacks();
    return feedbacks.find(fb => fb.id === feedbackId);
}

// Создание нового обращения
function createFeedback(feedbackData) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Необходимо войти в систему!', 'error');
        return false;
    }
    
    const feedbacks = loadFeedbacks();
    
    const newFeedback = {
        id: 'feedback_' + Date.now().toString(),
        userId: currentUser.id,
        name: feedbackData.name,
        email: feedbackData.email,
        phone: feedbackData.phone || '',
        subject: feedbackData.subject,
        message: feedbackData.message,
        status: 'new',
        createdAt: new Date().toISOString(),
        adminReply: null,
        repliedAt: null
    };
    
    feedbacks.push(newFeedback);
    
    if (saveFeedbacks(feedbacks)) {
        return true;
    }
    
    return false;
}

// Обновление обращения
function updateFeedback(feedbackId, updates) {
    const feedbacks = loadFeedbacks();
    const feedbackIndex = feedbacks.findIndex(fb => fb.id === feedbackId);
    
    if (feedbackIndex === -1) {
        return false;
    }
    
    feedbacks[feedbackIndex] = {
        ...feedbacks[feedbackIndex],
        ...updates
    };
    
    if (updates.adminReply) {
        feedbacks[feedbackIndex].repliedAt = new Date().toISOString();
    }
    
    return saveFeedbacks(feedbacks);
}
