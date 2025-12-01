class ContactsManager {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthButtons();
        this.setupEventListeners();
        this.setupPhoneMask();
        this.initMap();
    }

    checkAuthButtons() {
        const user = jobPlatform.getCurrentUser();
        const authBtn = document.getElementById('authBtn');
        const profileBtn = document.getElementById('profileBtn');

        if (user) {
            authBtn.style.display = 'none';
            profileBtn.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Форма обратной связи
        document.getElementById('contactForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Валидация в реальном времени
        this.setupRealTimeValidation();
    }

    setupPhoneMask() {
        const phoneInput = document.getElementById('contactPhone');

        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');

                if (value.startsWith('7')) {
                    value = '7' + value.substring(1);
                } else if (value.startsWith('8')) {
                    value = '7' + value.substring(1);
                } else if (!value.startsWith('7')) {
                    value = '7' + value;
                }

                let formattedValue = '+7 (';

                if (value.length > 1) {
                    formattedValue += value.substring(1, 4);
                }
                if (value.length >= 4) {
                    formattedValue += ') ' + value.substring(4, 7);
                }
                if (value.length >= 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if (value.length >= 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }

                e.target.value = formattedValue;
            });
        }
    }

    setupRealTimeValidation() {
        const form = document.getElementById('contactForm');
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const errorElement = field.parentElement.querySelector('.error-message');

        switch (field.type) {
            case 'email':
                if (field.value && !jobPlatform.validateEmail(field.value)) {
                    this.showFieldError(field, errorElement, 'Введите корректный email');
                    return false;
                }
                break;
            case 'tel':
                if (field.value && !jobPlatform.validatePhone(field.value)) {
                    this.showFieldError(field, errorElement, 'Введите корректный номер телефона');
                    return false;
                }
                break;
        }

        if (field.required && !field.value.trim()) {
            this.showFieldError(field, errorElement, 'Это поле обязательно для заполнения');
            return false;
        }

        this.clearFieldError(field, errorElement);
        return true;
    }

    showFieldError(field, errorElement, message) {
        field.classList.add('error');
        errorElement.textContent = message;
    }

    clearFieldError(field, errorElement) {
        field.classList.remove('error');
        errorElement.textContent = '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        // Валидация всех полей
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            jobPlatform.showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        // Собираем данные формы
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            submittedAt: new Date().toISOString()
        };

        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        try {
            // Имитация отправки на сервер
            await this.submitContactForm(contactData);

            // Показываем сообщение об успехе
            this.showFormMessage('Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 'success');

            // Очищаем форму
            form.reset();

        } catch (error) {
            this.showFormMessage('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.', 'error');
        } finally {
            // Восстанавливаем кнопку
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    submitContactForm(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Имитация случайной ошибки (10% chance)
                if (Math.random() < 0.1) {
                    reject(new Error('Network error'));
                    return;
                }

                // Сохраняем в localStorage для демонстрации
                const contacts = JSON.parse(localStorage.getItem('contact_messages') || '[]');
                contacts.push(data);
                localStorage.setItem('contact_messages', JSON.stringify(contacts));

                resolve({ success: true });
            }, 2000);
        });
    }

    showFormMessage(message, type) {
        // Удаляем существующие сообщения
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Создаем новое сообщение
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;

        // Вставляем перед формой
        const form = document.getElementById('contactForm');
        form.parentNode.insertBefore(messageElement, form);

        // Автоматически удаляем через 5 секунд
        if (type === 'success') {
            setTimeout(() => {
                messageElement.remove();
            }, 5000);
        }
    }

    initMap() {
        // Проверяем, загружена ли API Яндекс.Карт
        if (typeof ymaps === 'undefined') {
            console.warn('Yandex Maps API not loaded');
            this.showFallbackMap();
            return;
        }

        try {
            ymaps.ready(() => {
                const mapContainer = document.getElementById('map');

                if (!mapContainer) {
                    console.warn('Map container not found');
                    return;
                }

                // Очищаем контейнер
                mapContainer.innerHTML = '';

                // Создаем карту
                const map = new ymaps.Map('map', {
                    center: [55.76, 37.64], // Москва
                    zoom: 14,
                    controls: ['zoomControl', 'fullscreenControl']
                });

                // Добавляем метку
                const placemark = new ymaps.Placemark([55.76, 37.64], {
                    balloonContent: `
                        <strong>JobPlatform</strong><br>
                        г. Москва, ул. Тверская, д. 10<br>
                        Бизнес-центр "Центральный"
                    `
                }, {
                    preset: 'islands#blueBusinessIcon'
                });

                map.geoObjects.add(placemark);

                // Открываем балун при клике на метку
                placemark.balloon.open();

            });
        } catch (error) {
            console.error('Error initializing Yandex Map:', error);
            this.showFallbackMap();
        }
    }

    showFallbackMap() {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-fallback">
                    <h4>Наш офис</h4>
                    <p>📍 г. Москва, ул. Тверская, д. 10</p>
                    <p>Бизнес-центр "Центральный"</p>
                    <p>🚇 Ближайшее метро: Тверская, Пушкинская, Чеховская</p>
                    <p>🕐 Пн-Пт: 9:00-18:00</p>
                </div>
            `;
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.contactsManager = new ContactsManager();
});