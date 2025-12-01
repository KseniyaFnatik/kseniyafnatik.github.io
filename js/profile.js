class ProfileManager {
    constructor() {
        this.isEditing = false;
        this.avatarChanged = false;
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadUserData();
        this.setupEventListeners();
        this.loadResumes();
        this.loadApplications();
        this.setupModal(); // Инициализация модального окна
    }

    setupModal() {
        // Создаем HTML для модального окна
        const modalHTML = `
            <div id="customModal" class="custom-modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalTitle">Уведомление</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p id="modalMessage"></p>
                    </div>
                    <div class="modal-footer">
                        <button id="modalCancel" class="btn btn-secondary">Отмена</button>
                        <button id="modalConfirm" class="btn btn-primary">OK</button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем модальное окно в body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Настраиваем обработчики событий для модального окна
        this.setupModalEvents();
    }

    setupModalEvents() {
        const modal = document.getElementById('customModal');
        const overlay = modal.querySelector('.modal-overlay');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('modalCancel');
        const confirmBtn = document.getElementById('modalConfirm');

        const closeModal = () => {
            modal.style.display = 'none';
        };

        overlay.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Обработчик для подтверждающей кнопки
        confirmBtn.addEventListener('click', () => {
            if (this.modalResolve) {
                this.modalResolve(true);
                closeModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display !== 'none') {
                closeModal();
                if (this.modalResolve) {
                    this.modalResolve(false);
                }
            }
        });
    }

    // Метод для показа уведомления
    showNotification(message, type = 'success') {
        jobPlatform.showNotification(message, type);
    }

    // Метод для подтверждения действия
    async showConfirm(message, title = 'Подтверждение действия') {
        return new Promise((resolve) => {
            const modal = document.getElementById('customModal');
            const titleEl = document.getElementById('modalTitle');
            const messageEl = document.getElementById('modalMessage');
            const cancelBtn = document.getElementById('modalCancel');
            const confirmBtn = document.getElementById('modalConfirm');

            // Настраиваем содержимое
            titleEl.textContent = title;
            messageEl.textContent = message;
            confirmBtn.textContent = 'Подтвердить';
            cancelBtn.style.display = 'block';

            // Сохраняем resolve для использования в обработчиках
            this.modalResolve = resolve;

            // Показываем модальное окно
            modal.style.display = 'block';

            // Фокус на кнопке подтверждения для удобства
            setTimeout(() => confirmBtn.focus(), 100);
        });
    }

    // Метод для показа alert
    async showAlert(message, title = 'Уведомление') {
        return new Promise((resolve) => {
            const modal = document.getElementById('customModal');
            const titleEl = document.getElementById('modalTitle');
            const messageEl = document.getElementById('modalMessage');
            const cancelBtn = document.getElementById('modalCancel');
            const confirmBtn = document.getElementById('modalConfirm');

            // Настраиваем содержимое
            titleEl.textContent = title;
            messageEl.textContent = message;
            confirmBtn.textContent = 'OK';
            cancelBtn.style.display = 'none';

            // Сохраняем resolve для использования в обработчиках
            this.modalResolve = resolve;

            // Показываем модальное окно
            modal.style.display = 'block';

            // Фокус на кнопке OK для удобства
            setTimeout(() => confirmBtn.focus(), 100);
        });
    }

    checkAuth() {
        const user = jobPlatform.getCurrentUser();
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        
        // Модератор не может заходить на страницу профиля
        if (user.status === 'moderator') {
            window.location.href = 'moder.html';
            return;
        }
        
        this.currentUser = user;
    }

    loadUserData() {
        const user = jobPlatform.getCurrentUser();
        const userData = JSON.parse(localStorage.getItem('userData_' + user.id) || '{}');

        // Устанавливаем значения по умолчанию
        const defaultData = {
            fullName: user.fullName || '',
            birthDate: '1990-01-01',
            phone: user.phone || '',
            email: user.username + '@example.com',
            avatar: 'images/default-avatar.png'
        };

        const mergedData = { ...defaultData, ...userData };

        // Заполняем поля
        document.getElementById('userFullName').textContent = mergedData.fullName;
        document.getElementById('userBirthDate').textContent = this.formatDate(mergedData.birthDate);
        document.getElementById('userPhone').textContent = mergedData.phone;
        document.getElementById('userEmail').textContent = mergedData.email;
        document.getElementById('userAvatar').src = mergedData.avatar;

        // Заполняем поля редактирования
        document.getElementById('editFullName').value = mergedData.fullName;
        document.getElementById('editBirthDate').value = mergedData.birthDate;
        document.getElementById('editPhone').value = mergedData.phone;
        document.getElementById('editEmail').value = mergedData.email;
    }

    setupEventListeners() {
        // Кнопка редактирования профиля
        document.getElementById('editProfileBtn').addEventListener('click', () => this.toggleEditMode(true));
        document.getElementById('saveProfileBtn').addEventListener('click', () => this.saveProfile());
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.toggleEditMode(false));

        // Смена аватара
        document.getElementById('changeAvatarBtn').addEventListener('click', () => {
            document.getElementById('avatarInput').click();
        });

        document.getElementById('avatarInput').addEventListener('change', (e) => {
            this.handleAvatarChange(e);
        });

        // Выход из системы
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    async handleLogout() {
        const confirmed = await this.showConfirm(
            'Вы уверены, что хотите выйти из системы?',
            'Подтверждение выхода'
        );
        
        if (confirmed) {
            jobPlatform.logout();
        }
    }

    toggleEditMode(enable) {
        this.isEditing = enable;

        const viewElements = document.querySelectorAll('.info-item span');
        const editElements = document.querySelectorAll('.edit-input');
        const editActions = document.querySelector('.edit-actions');

        viewElements.forEach(el => el.style.display = enable ? 'none' : 'inline');
        editElements.forEach(el => el.style.display = enable ? 'block' : 'none');
        editActions.style.display = enable ? 'flex' : 'none';
        document.getElementById('editProfileBtn').style.display = enable ? 'none' : 'block';

        // Сбрасываем флаг при отмене редактирования
        if (!enable) {
            this.avatarChanged = false;
            this.loadUserData(); // Перезагружаем данные для отмены изменений
        }
    }

    async saveProfile() {
        const user = jobPlatform.getCurrentUser();
        const userData = {
            fullName: document.getElementById('editFullName').value,
            birthDate: document.getElementById('editBirthDate').value,
            phone: document.getElementById('editPhone').value,
            email: document.getElementById('editEmail').value,
            avatar: document.getElementById('userAvatar').src
        };

        // Валидация
        if (!userData.fullName.trim()) {
            this.showNotification('ФИО обязательно для заполнения', 'error');
            return;
        }

        if (!jobPlatform.validateEmail(userData.email)) {
            this.showNotification('Введите корректный email', 'error');
            return;
        }

        // Сохраняем данные
        localStorage.setItem('userData_' + user.id, JSON.stringify(userData));

        // Обновляем отображение
        this.loadUserData();
        this.toggleEditMode(false);
        this.avatarChanged = false;

        this.showNotification('Профиль успешно обновлен');
    }

    handleAvatarChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Пожалуйста, выберите изображение', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const newAvatarSrc = e.target.result;
            document.getElementById('userAvatar').src = newAvatarSrc;
            
            // Автоматически сохраняем аватар в localStorage
            this.saveAvatarImmediately(newAvatarSrc);
            
            this.showNotification('Аватар успешно изменен');
        };
        reader.readAsDataURL(file);
    }

    saveAvatarImmediately(avatarSrc) {
        const user = jobPlatform.getCurrentUser();
        if (!user) return;

        // Получаем текущие данные пользователя
        const userData = JSON.parse(localStorage.getItem('userData_' + user.id) || '{}');
        
        // Обновляем только аватар
        userData.avatar = avatarSrc;
        
        // Сохраняем обратно в localStorage
        localStorage.setItem('userData_' + user.id, JSON.stringify(userData));
        
        this.avatarChanged = true;
    }

    loadResumes() {
        const user = jobPlatform.getCurrentUser();
        const resumes = JSON.parse(localStorage.getItem('resumes_' + user.id) || '[]');
        const resumesList = document.getElementById('resumesList');

        if (resumes.length === 0) {
            resumesList.innerHTML = `
                <div class="resume-item">
                    <div colspan="4" style="text-align: center; color: var(--text-light);">
                        У вас пока нет созданных резюме
                    </div>
                </div>
            `;
            return;
        }

        resumesList.innerHTML = resumes.map(resume => `
            <div class="resume-item">
                <div>#${resume.id}</div>
                <div>${resume.title}</div>
                <div>${this.formatDate(resume.createdAt)}</div>
                <div class="resume-actions">
                    <button onclick="profileManager.viewResume(${resume.id})" class="btn btn-primary btn-small">Просмотреть</button>
                    <button onclick="profileManager.deleteResume(${resume.id})" class="btn btn-danger btn-small">Удалить</button>
                </div>
            </div>
        `).join('');
    }

    loadApplications() {
        const user = jobPlatform.getCurrentUser();
        const applications = JSON.parse(localStorage.getItem('applications_' + user.id) || '[]');
        const applicationsList = document.getElementById('applicationsList');

        if (applications.length === 0) {
            applicationsList.innerHTML = `
                <div class="application-item">
                    <div colspan="4" style="text-align: center; color: var(--text-light);">
                        У вас пока нет откликов
                    </div>
                </div>
            `;
            return;
        }

        applicationsList.innerHTML = applications.map(app => `
            <div class="application-item">
                <div>${app.vacancyTitle}</div>
                <div>${app.resumeTitle}</div>
                <div>${this.formatDate(app.appliedAt)}</div>
                <div class="status-badge status-${app.status}">${this.getStatusText(app.status)}</div>
            </div>
        `).join('');
    }

    viewResume(resumeId) {
        window.location.href = `resume-preview.html?id=${resumeId}`;
    }

    async deleteResume(resumeId) {
        const confirmed = await this.showConfirm(
            'Вы уверены, что хотите удалить это резюме? Это действие нельзя отменить.',
            'Удаление резюме'
        );

        if (!confirmed) {
            return;
        }

        const user = jobPlatform.getCurrentUser();
        const resumes = JSON.parse(localStorage.getItem('resumes_' + user.id) || '[]');
        const updatedResumes = resumes.filter(r => r.id !== resumeId);

        localStorage.setItem('resumes_' + user.id, JSON.stringify(updatedResumes));
        this.loadResumes();

        this.showNotification('Резюме удалено');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    getStatusText(status) {
        const statusMap = {
            'sent': 'На рассмотрении',
            'approved': 'Принято',
            'rejected': 'Отклонено',
            'viewed': 'Просмотрено',
            'invitation': 'Приглашение'
        };
        return statusMap[status] || status;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});