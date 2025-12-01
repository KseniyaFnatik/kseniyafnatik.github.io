class AdminManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.moderators = [];
        this.pendingAction = null;
        this.pendingUserId = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadUsers();
        this.setupEventListeners();
        this.updateStats();
        this.renderUsers();
        this.renderModerators();
    }

    checkAuth() {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        
        // Только админ может заходить в админ панель
        if (!user || user.status !== 'admin') {
            window.location.href = 'auth.html';
            return;
        }

        this.currentUser = user;
    }

    setupEventListeners() {
        // Навигационные вкладки
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });

        // Поиск пользователей
        document.getElementById('userSearch').addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });

        // Выход
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Закрытие модальных окон
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModeratorModal();
        });

        document.getElementById('confirmActionBtn').addEventListener('click', () => {
            this.executePendingAction();
        });

        // Закрытие модальных окон по клику вне их
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('addModeratorModal');
            const confirmModal = document.getElementById('confirmModal');
            
            if (e.target === modal) {
                this.closeModeratorModal();
            }
            if (e.target === confirmModal) {
                this.closeConfirmModal();
            }
        });
    }

    switchTab(tabName) {
        // Обновляем активные вкладки
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Показываем соответствующую секцию
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.toggle('active', section.id === tabName + 'Section');
        });
    }

    loadUsers() {
        // Загружаем обычных пользователей
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Загружаем модераторов и админов
        this.moderators = this.users.filter(user => 
            user.status === 'moderator' || user.status === 'admin'
        );
    }

    updateStats() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(user => user.isActive !== false).length;
        const moderatorsCount = this.moderators.length;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsers = this.users.filter(user => 
            new Date(user.registrationDate) > weekAgo
        ).length;

        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeUsers').textContent = activeUsers;
        document.getElementById('moderatorsCount').textContent = moderatorsCount;
        document.getElementById('newUsers').textContent = newUsers;
    }

    renderUsers() {
        const container = document.getElementById('usersList');
        
        if (this.users.length === 0) {
            container.innerHTML = `
                <div class="user-item">
                    <div style="grid-column: 1 / -1; text-align: center; color: var(--text-light);">
                        Пользователи не найдены
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.users.map(user => `
            <div class="user-item">
                <div class="user-id">${user.id}</div>
                <div class="user-fullname">${user.fullName}</div>
                <div class="user-username">${user.username}</div>
                <div class="user-phone">${user.phone}</div>
                <div class="user-date">${this.formatDate(user.registrationDate)}</div>
                <div class="status-badge status-${user.status}">${this.getStatusText(user.status)}</div>
                <div class="user-actions">
                    ${user.status === 'user' ? `
                        <button onclick="adminManager.promoteToModerator(${user.id})" class="btn btn-success btn-small">Сделать модер...</button>
                    ` : ''}
                    
                    ${user.status !== 'admin' && this.currentUser.status === 'admin' ? `
                        <button onclick="adminManager.deleteUser(${user.id})" class="btn btn-danger btn-small">Удалить</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderModerators() {
        const container = document.getElementById('moderatorsList');
        
        if (this.moderators.length === 0) {
            container.innerHTML = `
                <div class="moderator-item">
                    <div style="grid-column: 1 / -1; text-align: center; color: var(--text-light);">
                        Модераторы не найдены
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.moderators.map(moderator => `
            <div class="moderator-item">
                <div class="moderator-id">${moderator.id}</div>
                <div class="moderator-fullname">${moderator.fullName}</div>
                <div class="moderator-username">${moderator.username}</div>
                <div class="moderator-phone">${moderator.phone}</div>
                <div class="moderator-date">${this.formatDate(moderator.registrationDate)}</div>
                <div class="moderator-actions">
                    ${moderator.status === 'moderator' ? `
                        <button onclick="adminManager.demoteModerator(${moderator.id})" class="btn btn-warning btn-small">Убрать права</button>
                        <button onclick="adminManager.deleteUser(${moderator.id})" class="btn btn-danger btn-small">Удалить</button>
                    ` : '<span class="admin-label">Администратор</span>'}
                </div>
            </div>
        `).join('');
    }

    searchUsers(query) {
        const filteredUsers = this.users.filter(user =>
            user.fullName.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.phone.includes(query)
        );

        const container = document.getElementById('usersList');
        container.innerHTML = filteredUsers.map(user => `
            <div class="user-item">
                <div class="user-id">${user.id}</div>
                <div class="user-fullname">${user.fullName}</div>
                <div class="user-username">${user.username}</div>
                <div class="user-phone">${user.phone}</div>
                <div class="user-date">${this.formatDate(user.registrationDate)}</div>
                <div class="status-badge status-${user.status}">${this.getStatusText(user.status)}</div>
                <div class="user-actions">
                    ${user.status === 'user' ? `
                        <button onclick="adminManager.promoteToModerator(${user.id})" class="btn btn-success btn-small">Сделать модератором</button>
                    ` : ''}
                    <button onclick="adminManager.toggleUserStatus(${user.id})" class="btn btn-warning btn-small">
                        ${user.isActive === false ? 'Активировать' : 'Деактивировать'}
                    </button>
                    ${user.status !== 'admin' && this.currentUser.status === 'admin' ? `
                        <button onclick="adminManager.deleteUser(${user.id})" class="btn btn-danger btn-small">Удалить</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    showConfirmModal(message, action, userId = null) {
        this.pendingAction = action;
        this.pendingUserId = userId;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
        this.pendingAction = null;
        this.pendingUserId = null;
    }

    executePendingAction() {
        if (this.pendingAction) {
            this.pendingAction(this.pendingUserId);
        }
        this.closeConfirmModal();
    }

    promoteToModerator(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.showConfirmModal(
                `Вы уверены, что хотите назначить пользователя "${user.fullName}" модератором?`,
                (id) => {
                    const userToPromote = this.users.find(u => u.id === id);
                    if (userToPromote) {
                        userToPromote.status = 'moderator';
                        this.saveUsers();
                        this.renderUsers();
                        this.renderModerators();
                        this.updateStats();
                        jobPlatform.showNotification('Пользователь назначен модератором');
                    }
                },
                userId
            );
        }
    }

    demoteModerator(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.showConfirmModal(
                `Вы уверены, что хотите снять права модератора с пользователя "${user.fullName}"?`,
                (id) => {
                    const userToDemote = this.users.find(u => u.id === id);
                    if (userToDemote) {
                        userToDemote.status = 'user';
                        this.saveUsers();
                        this.renderUsers();
                        this.renderModerators();
                        this.updateStats();
                        jobPlatform.showNotification('Права модератора сняты');
                    }
                },
                userId
            );
        }
    }

    toggleUserStatus(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            const action = user.isActive === false ? 'активировать' : 'деактивировать';
            
            this.showConfirmModal(
                `Вы уверены, что хотите ${action} пользователя "${user.fullName}"?`,
                (id) => {
                    const userToToggle = this.users.find(u => u.id === id);
                    if (userToToggle) {
                        userToToggle.isActive = userToToggle.isActive === false ? true : false;
                        this.saveUsers();
                        this.renderUsers();
                        this.updateStats();
                        jobPlatform.showNotification(`Пользователь ${userToToggle.isActive ? 'активирован' : 'деактивирован'}`);
                    }
                },
                userId
            );
        }
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.showConfirmModal(
            `Вы уверены, что хотите удалить пользователя "${user.fullName}"? Это действие нельзя отменить.`,
            (id) => {
                this.users = this.users.filter(u => u.id !== id);
                this.saveUsers();
                this.renderUsers();
                this.renderModerators();
                this.updateStats();
                jobPlatform.showNotification('Пользователь удален');
            },
            userId
        );
    }

    showAddModeratorModal() {
        document.getElementById('addModeratorModal').style.display = 'block';
    }

    closeModeratorModal() {
        document.getElementById('addModeratorModal').style.display = 'none';
        document.getElementById('addModeratorForm').reset();
    }

    addModerator() {
        const form = document.getElementById('addModeratorForm');
        const formData = new FormData(form);

        const moderatorData = {
            id: Date.now(),
            fullName: formData.get('fullName'),
            username: formData.get('username'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            status: 'moderator',
            registrationDate: new Date().toISOString(),
            isActive: true
        };

        // Проверка на существующего пользователя
        if (this.users.find(u => u.username === moderatorData.username)) {
            jobPlatform.showNotification('Пользователь с таким логином уже существует', 'error');
            return;
        }

        this.users.push(moderatorData);
        this.saveUsers();
        this.renderUsers();
        this.renderModerators();
        this.updateStats();
        this.closeModeratorModal();
        
        jobPlatform.showNotification('Модератор успешно добавлен');
    }

    exportUsers() {
        const csvContent = this.convertToCSV(this.users);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    convertToCSV(users) {
        const headers = ['ID', 'ФИО', 'Логин', 'Телефон', 'Статус', 'Дата регистрации', 'Активен'];
        const rows = users.map(user => [
            user.id,
            user.fullName,
            user.username,
            user.phone,
            this.getStatusText(user.status),
            this.formatDate(user.registrationDate),
            user.isActive ? 'Да' : 'Нет'
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    getStatusText(status) {
        const statusMap = {
            'user': 'Пользователь',
            'moderator': 'Модератор',
            'admin': 'Администратор'
        };
        return statusMap[status] || status;
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});