class JobsManager {
    constructor() {
        this.vacancies = [];
        this.resumes = [];
        this.filteredVacancies = [];
        this.filteredResumes = [];
        this.currentPage = 1;
        this.vacanciesPerPage = 10;
        this.resumesPerPage = 10;
        this.currentFilters = {};
        this.selectedVacancy = null;
        this.selectedResume = null;
        this.activeFiltersCount = 0;
        this.isEmployer = false;
        this.currentView = 'vacancies';
        this.init();
    }

    async init() {
        console.log('=== ИНИЦИАЛИЗАЦИЯ JobsManager ===');
        this.checkAuthButtons();
        this.checkUserRole();
        
        if (this.isEmployer) {
            console.log('Режим: РАБОТОДАТЕЛЬ');
            await this.loadResumes();
            this.setupResumeEventListeners();
            this.renderResumes();
        } else {
            console.log('Режим: СОИСКАТЕЛЬ');
            await this.loadVacancies();
            this.setupEventListeners();
            
            // Принудительно показываем все вакансии
            if (this.vacancies.length > 0) {
                this.filteredVacancies = [...this.vacancies];
                console.log('Вакансии после фильтрации:', this.filteredVacancies.length);
            }
            
            this.renderVacancies();
            
            // Если все еще нет вакансий, создаем тестовые
            if (this.filteredVacancies.length === 0) {
                console.log('Создаем тестовые вакансии...');
                this.createTestVacancies();
                this.renderVacancies();
            }
        }
    }

    createTestVacancies() {
        console.log('Создание тестовых вакансий...');
        this.vacancies = [
            {
                id: 1001,
                title: "Frontend разработчик",
                company: "ТехноКомпания",
                salary: 120000,
                region: "moscow",
                employment: ["full", "remote"],
                profession: "frontend",
                description: "Ищем опытного фронтенд разработчика для работы над интересными проектами. Требования: опыт работы с React, JavaScript, TypeScript.",
                experience: "1-3 года",
                created: new Date().toISOString(),
                city: "Москва",
                moderationStatus: "approved"
            },
            {
                id: 1002,
                title: "Backend разработчик",
                company: "ИТ Решения",
                salary: 150000,
                region: "spb",
                employment: ["full"],
                profession: "backend",
                description: "Требуется backend разработчик для разработки высоконагруженных систем. Работа с Node.js, PostgreSQL, Docker.",
                experience: "3-5 лет",
                created: new Date().toISOString(),
                city: "Санкт-Петербург",
                moderationStatus: "approved"
            },
            {
                id: 1003,
                title: "UX/UI дизайнер",
                company: "Дизайн Студия",
                salary: 80000,
                region: "remote",
                employment: ["remote", "part"],
                profession: "design",
                description: "Нужен креативный дизайнер для создания интерфейсов мобильных приложений. Опыт работы с Figma, Adobe Creative Suite.",
                experience: "1-2 года",
                created: new Date().toISOString(),
                city: "Удаленно",
                moderationStatus: "approved"
            },
            {
                id: 1004,
                title: "Менеджер проектов",
                company: "БизнесТех",
                salary: 110000,
                region: "moscow",
                employment: ["full"],
                profession: "management",
                description: "Ищем менеджера проектов для управления IT-проектами. Знание Agile, Scrum, опыт управления командой.",
                experience: "2-4 года",
                created: new Date().toISOString(),
                city: "Москва",
                moderationStatus: "approved"
            },
            {
                id: 1005,
                title: "Data Scientist",
                company: "Аналитика Про",
                salary: 170000,
                region: "remote",
                employment: ["remote", "full"],
                profession: "data",
                description: "Требуется data scientist для работы с большими данными. Опыт работы с Python, ML, SQL.",
                experience: "3-5 лет",
                created: new Date().toISOString(),
                city: "Удаленно",
                moderationStatus: "approved"
            }
        ];
        this.filteredVacancies = [...this.vacancies];
        console.log('Создано тестовых вакансий:', this.vacancies.length);
    }

    checkUserRole() {
        try {
            const user = jobPlatform.getCurrentUser();
            console.log('Текущий пользователь:', user);
            this.isEmployer = user && (user.role === 'employer' || user.status === 'employer');
            console.log('Роль пользователя:', this.isEmployer ? 'employer' : 'jobseeker');
        } catch (error) {
            console.error('Ошибка при проверке роли пользователя:', error);
            this.isEmployer = false;
        }
    }

    checkAuthButtons() {
        try {
            const user = jobPlatform.getCurrentUser();
            const authBtn = document.getElementById('authBtn');
            const profileBtn = document.getElementById('profileBtn');

            if (user) {
                if (authBtn) authBtn.style.display = 'none';
                if (profileBtn) profileBtn.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка при проверке кнопок авторизации:', error);
        }
    }

    async loadVacancies() {
        console.log('=== ЗАГРУЗКА ВАКАНСИЙ ===');
        
        // Загружаем вакансии из localStorage
        let localStorageVacancies = [];
        try {
            localStorageVacancies = JSON.parse(localStorage.getItem('vacancies') || '[]');
            console.log('Вакансии из localStorage:', localStorageVacancies.length);
        } catch (error) {
            console.error('Ошибка при загрузке вакансий из localStorage:', error);
        }

        // Загружаем примеры вакансий из JSON файла
        let exampleVacancies = [];
        try {
            console.log('Пытаемся загрузить vacancies.json...');
            const response = await fetch('./vacancies.json');
            console.log('Статус ответа:', response.status, response.statusText);
            
            if (response.ok) {
                exampleVacancies = await response.json();
                console.log('Вакансии из JSON:', exampleVacancies.length);
            } else {
                console.warn('Файл vacancies.json не найден или недоступен');
            }
        } catch (error) {
            console.warn('Ошибка при загрузке vacancies.json:', error);
        }
        
        // Объединяем все вакансии
        const allVacancies = [...localStorageVacancies, ...exampleVacancies];
        console.log('Все вакансии после объединения:', allVacancies.length);

        // Фильтруем только одобренные и добавляем moderationStatus если нет
        this.vacancies = allVacancies
            .map(vacancy => {
                // Добавляем moderationStatus если отсутствует
                if (!vacancy.moderationStatus) {
                    vacancy.moderationStatus = 'approved';
                }
                return vacancy;
            })
            .filter(vacancy => vacancy.moderationStatus === 'approved')
            .map(vacancy => this.adaptVacancyFormat(vacancy));

        // Убираем дубликаты по ID
        this.vacancies = this.removeDuplicateVacancies(this.vacancies);
        
        this.filteredVacancies = [...this.vacancies];
        
        console.log('Финальный список вакансий:', this.vacancies.length);
        if (this.vacancies.length > 0) {
            console.log('Пример первой вакансии:', this.vacancies[0]);
        }
    }

    adaptVacancyFormat(vacancy) {
        return {
            id: vacancy.id || Date.now() + Math.random(),
            title: vacancy.title || 'Без названия',
            company: vacancy.company || 'Компания не указана',
            salary: vacancy.salary ? parseInt(vacancy.salary) : 0,
            region: vacancy.region || this.mapCityToRegion(vacancy.city),
            employment: Array.isArray(vacancy.employment) ? vacancy.employment : (vacancy.employment ? [vacancy.employment] : ['full']),
            profession: vacancy.profession || '',
            description: vacancy.description || 'Описание отсутствует',
            experience: vacancy.experience || 'Не указан',
            created: vacancy.createdAt || vacancy.created || new Date().toISOString(),
            city: vacancy.city,
            requirements: vacancy.requirements,
            responsibilities: vacancy.responsibilities,
            conditions: vacancy.conditions,
            employerId: vacancy.employerId,
            employerName: vacancy.employerName,
            moderationStatus: vacancy.moderationStatus || 'approved'
        };
    }

    removeDuplicateVacancies(vacancies) {
        const unique = [];
        const seenIds = new Set();
        
        vacancies.forEach(vacancy => {
            const vacancyId = vacancy.id;
            if (!seenIds.has(vacancyId)) {
                seenIds.add(vacancyId);
                unique.push(vacancy);
            }
        });
        
        return unique;
    }

    mapCityToRegion(city) {
        if (!city) return 'other';
        const cityLower = city.toLowerCase();
        if (cityLower.includes('москва')) return 'moscow';
        if (cityLower.includes('санкт-петербург') || cityLower.includes('спб') || cityLower.includes('питер')) return 'spb';
        if (cityLower.includes('удален') || cityLower.includes('remote')) return 'remote';
        return 'other';
    }

    setupEventListeners() {
        console.log('Настройка обработчиков событий...');
        
        // Поиск
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
        }

        // Фильтры
        const filtersToggle = document.getElementById('filtersToggle');
        const mobileFiltersToggle = document.getElementById('mobileFiltersToggle');
        const closeFilters = document.getElementById('closeFilters');
        const applyFilters = document.getElementById('applyFilters');
        const resetFilters = document.getElementById('resetFilters');

        if (filtersToggle) filtersToggle.addEventListener('click', () => this.toggleFilters());
        if (mobileFiltersToggle) mobileFiltersToggle.addEventListener('click', () => this.toggleFilters());
        if (closeFilters) closeFilters.addEventListener('click', () => this.toggleFilters());
        if (applyFilters) applyFilters.addEventListener('click', () => this.applyFilters());
        if (resetFilters) resetFilters.addEventListener('click', () => this.resetFilters());

        // Отслеживание изменений в фильтрах
        const professionFilter = document.getElementById('professionFilter');
        const regionFilter = document.getElementById('regionFilter');
        const salaryMin = document.getElementById('salaryMin');
        const salaryMax = document.getElementById('salaryMax');

        if (professionFilter) professionFilter.addEventListener('change', () => this.onFilterChange());
        if (regionFilter) regionFilter.addEventListener('change', () => this.onFilterChange());
        if (salaryMin) salaryMin.addEventListener('input', () => this.onFilterChange());
        if (salaryMax) salaryMax.addEventListener('input', () => this.onFilterChange());
        
        const employmentCheckboxes = document.querySelectorAll('input[name="employment"]');
        employmentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.onFilterChange());
        });

        // Загрузка ещё
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }

        // Модальное окно
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        const cancelApply = document.getElementById('cancelApply');
        const confirmApply = document.getElementById('confirmApply');
        
        if (cancelApply) cancelApply.addEventListener('click', () => this.closeModal());
        if (confirmApply) confirmApply.addEventListener('click', () => this.submitApplication());

        // Закрытие фильтров по клику вне области
        document.addEventListener('click', (e) => {
            const filtersSidebar = document.getElementById('filtersSidebar');
            const filtersToggle = document.getElementById('filtersToggle');
            const mobileFiltersToggle = document.getElementById('mobileFiltersToggle');
            
            if (filtersSidebar && filtersSidebar.classList.contains('active') && 
                !filtersSidebar.contains(e.target) && 
                e.target !== filtersToggle && 
                e.target !== mobileFiltersToggle &&
                !filtersToggle?.contains(e.target) &&
                !mobileFiltersToggle?.contains(e.target)) {
                this.toggleFilters();
            }
        });

        console.log('Обработчики событий настроены');
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const searchTerm = searchInput.value.toLowerCase();
            this.currentFilters.search = searchTerm;
            this.applyFilters();
        }
    }

    toggleFilters() {
        const sidebar = document.getElementById('filtersSidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
            
            // Блокируем скролл body при открытых фильтрах на мобильных
            if (window.innerWidth <= 768) {
                document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
            }
        }
    }

    onFilterChange() {
        this.updateFilterCount();
        this.highlightActiveFilters();
    }

    updateFilterCount() {
        let count = 0;

        // Профессия
        const professionFilter = document.getElementById('professionFilter');
        if (professionFilter && professionFilter.value) count++;

        // Регион
        const regionFilter = document.getElementById('regionFilter');
        if (regionFilter && regionFilter.value) count++;

        // Зарплата
        const salaryMin = document.getElementById('salaryMin');
        const salaryMax = document.getElementById('salaryMax');
        if ((salaryMin && salaryMin.value) || (salaryMax && salaryMax.value)) count++;

        // Тип занятости (считаем только если выбраны не все)
        const employmentCheckboxes = document.querySelectorAll('input[name="employment"]');
        if (employmentCheckboxes.length > 0) {
            const checkedEmployment = Array.from(employmentCheckboxes).filter(cb => cb.checked);
            if (checkedEmployment.length > 0 && checkedEmployment.length < employmentCheckboxes.length) count++;
        }

        this.activeFiltersCount = count;

        // Обновляем счетчики
        const filterCount = document.getElementById('filterCount');
        const mobileFilterCount = document.getElementById('mobileFilterCount');
        
        if (filterCount) filterCount.textContent = count;
        if (mobileFilterCount) mobileFilterCount.textContent = count;

        // Показываем/скрываем счетчики
        const filterCounts = document.querySelectorAll('.filter-count');
        filterCounts.forEach(el => {
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    highlightActiveFilters() {
        const filterGroups = document.querySelectorAll('.filter-group');
        
        filterGroups.forEach(group => {
            let isActive = false;
            
            if (group.querySelector('select')) {
                const select = group.querySelector('select');
                isActive = select.value !== '';
            } else if (group.querySelector('input[type="number"]')) {
                const min = document.getElementById('salaryMin')?.value || '';
                const max = document.getElementById('salaryMax')?.value || '';
                isActive = min !== '' || max !== '';
            } else if (group.querySelector('input[type="checkbox"]')) {
                const checkboxes = group.querySelectorAll('input[type="checkbox"]');
                const checked = Array.from(checkboxes).filter(cb => cb.checked);
                const allChecked = checkboxes.length === checked.length;
                isActive = !allChecked && checked.length > 0;
            }
            
            group.classList.toggle('active-filter', isActive);
        });
    }

    applyFilters() {
        console.log('Применение фильтров...');
        this.currentPage = 1;

        // Собираем фильтры
        const filters = {
            profession: document.getElementById('professionFilter')?.value || '',
            salaryMin: document.getElementById('salaryMin')?.value ? parseInt(document.getElementById('salaryMin').value) : null,
            salaryMax: document.getElementById('salaryMax')?.value ? parseInt(document.getElementById('salaryMax').value) : null,
            region: document.getElementById('regionFilter')?.value || '',
            employment: Array.from(document.querySelectorAll('input[name="employment"]:checked')).map(cb => cb.value),
            search: document.getElementById('searchInput')?.value.toLowerCase() || ''
        };

        this.currentFilters = filters;
        console.log('Текущие фильтры:', filters);

        // Применяем фильтры
        this.filteredVacancies = this.vacancies.filter(vacancy => {
            // Поиск по тексту
            if (filters.search && !(
                vacancy.title.toLowerCase().includes(filters.search) ||
                vacancy.company.toLowerCase().includes(filters.search) ||
                vacancy.description.toLowerCase().includes(filters.search)
            )) {
                return false;
            }

            // Фильтр по профессии
            if (filters.profession && vacancy.profession !== filters.profession) {
                return false;
            }

            // Фильтр по зарплате
            if (filters.salaryMin && vacancy.salary < filters.salaryMin) {
                return false;
            }
            if (filters.salaryMax && vacancy.salary > filters.salaryMax) {
                return false;
            }

            // Фильтр по региону
            if (filters.region && vacancy.region !== filters.region) {
                return false;
            }

            // Фильтр по типу занятости
            if (filters.employment.length > 0) {
                const hasMatchingEmployment = filters.employment.some(emp => 
                    vacancy.employment && Array.isArray(vacancy.employment) && vacancy.employment.includes(emp)
                );
                if (!hasMatchingEmployment) {
                    return false;
                }
            }

            return true;
        });

        console.log('После фильтрации осталось вакансий:', this.filteredVacancies.length);

        // Всегда рендерим вакансии после применения фильтров
        this.renderVacancies();
        
        // Закрываем фильтры на мобильных после применения
        if (window.innerWidth <= 768) {
            this.toggleFilters();
        }
    }

    resetFilters() {
        console.log('Сброс фильтров...');
        
        const professionFilter = document.getElementById('professionFilter');
        const salaryMin = document.getElementById('salaryMin');
        const salaryMax = document.getElementById('salaryMax');
        const regionFilter = document.getElementById('regionFilter');
        const searchInput = document.getElementById('searchInput');

        if (professionFilter) professionFilter.value = '';
        if (salaryMin) salaryMin.value = '';
        if (salaryMax) salaryMax.value = '';
        if (regionFilter) regionFilter.value = '';
        if (searchInput) searchInput.value = '';

        document.querySelectorAll('input[name="employment"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[name="employment"][value="full"]').forEach(cb => cb.checked = true);

        this.currentFilters = {};
        this.applyFilters();
        this.updateFilterCount();
        this.highlightActiveFilters();
    }

    renderVacancies() {
        console.log('=== RENDER VACANCIES ===');
        console.log('Всего вакансий:', this.vacancies.length);
        console.log('Отфильтрованных вакансий:', this.filteredVacancies.length);
        
        const container = document.getElementById('vacanciesList');
        if (!container) {
            console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Контейнер vacanciesList не найден в DOM!');
            // Попробуем найти контейнер через другие селекторы
            const alternativeContainer = document.querySelector('.vacancies-list, .jobs-list, #jobsList');
            if (alternativeContainer) {
                console.log('Найден альтернативный контейнер:', alternativeContainer);
                // Можно переназначить container, но для этого нужно изменить логику
            }
            return;
        }
        console.log('Контейнер найден:', container);

        const countElement = document.getElementById('jobsCount');
        if (countElement) {
            countElement.textContent = `Найдено ${this.filteredVacancies.length} вакансий`;
        }

        // Если вакансий нет, показываем сообщение
        if (this.filteredVacancies.length === 0) {
            console.log('Нет вакансий для отображения');
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; color: #666;">
                    <h3>😔 Вакансии не найдены</h3>
                    <p>Попробуйте изменить параметры поиска или фильтры</p>
                    <button onclick="jobsManager.createTestVacancies(); jobsManager.renderVacancies();" 
                            class="btn btn-primary" style="margin-top: 1rem;">
                        Показать тестовые вакансии
                    </button>
                </div>
            `;
            
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
            }
            return;
        }

        // Получаем вакансии для текущей страницы
        const startIndex = (this.currentPage - 1) * this.vacanciesPerPage;
        const endIndex = startIndex + this.vacanciesPerPage;
        const vacanciesToShow = this.filteredVacancies.slice(0, endIndex);

        console.log('Отображаем вакансии:', vacanciesToShow.length);
        
        // Создаем HTML для вакансий
        let vacanciesHTML = '';
        vacanciesToShow.forEach(vacancy => {
            try {
                vacanciesHTML += this.createVacancyCard(vacancy);
            } catch (error) {
                console.error('Ошибка при создании карточки вакансии:', error, vacancy);
                vacanciesHTML += `<div class="vacancy-card error-card">
                    <h3>Ошибка отображения вакансии</h3>
                    <p>ID: ${vacancy.id}</p>
                </div>`;
            }
        });

        container.innerHTML = vacanciesHTML;
        console.log('HTML добавлен в контейнер');

        // Показываем/скрываем кнопку "Загрузить ещё"
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex < this.filteredVacancies.length ? 'block' : 'none';
        }

        // Добавляем обработчики
        this.attachApplyHandlers();
        console.log('Рендеринг завершен');
    }

    createVacancyCard(vacancy) {
        const employmentLabels = {
            'full': 'Полная',
            'part': 'Частичная',
            'remote': 'Удалённая',
            'project': 'Проектная'
        };

        const regionLabels = {
            'moscow': 'Москва',
            'spb': 'Санкт-Петербург',
            'remote': 'Удалённо',
            'other': vacancy.city || 'Другие регионы'
        };

        // Форматируем дату
        let formattedDate = 'Не указана';
        try {
            if (vacancy.created) {
                formattedDate = new Date(vacancy.created).toLocaleDateString('ru-RU');
            }
        } catch (e) {
            formattedDate = 'Не указана';
        }

        // Форматируем зарплату
        const salaryDisplay = vacancy.salary && vacancy.salary > 0 
            ? `${vacancy.salary.toLocaleString('ru-RU')} ₽`
            : 'Не указана';

        // Проверяем роль пользователя и наличие отклика
        const user = jobPlatform.getCurrentUser();
        let applyButton = '';
        
        if (user && user.role !== 'employer' && user.status !== 'employer') {
            const applications = JSON.parse(localStorage.getItem('applications_' + user.id) || '[]');
            const hasApplied = applications.some(app => app.vacancyId === vacancy.id);
            
            if (hasApplied) {
                applyButton = '<button class="btn btn-secondary" disabled>Уже откликнулись</button>';
            } else {
                applyButton = `<button class="btn btn-primary btn-apply" data-id="${vacancy.id}">Откликнуться</button>`;
            }
        }

        return `
            <div class="vacancy-card" data-id="${vacancy.id}">
                <div class="vacancy-header">
                    <div>
                        <h3 class="vacancy-title">${this.escapeHtml(vacancy.title)}</h3>
                        <div class="vacancy-company">${this.escapeHtml(vacancy.company)}</div>
                    </div>
                    <div class="vacancy-salary">${salaryDisplay}</div>
                </div>
                
                <div class="vacancy-info">
                    <div class="vacancy-meta">📍 ${regionLabels[vacancy.region] || this.escapeHtml(vacancy.city) || 'Не указан'}</div>
                    <div class="vacancy-meta">💼 ${this.escapeHtml(vacancy.experience) || 'Не указан'}</div>
                    <div class="vacancy-meta">📅 ${formattedDate}</div>
                </div>
                
                <div class="vacancy-description">
                    ${this.escapeHtml(vacancy.description) || 'Описание отсутствует'}
                </div>
                
                <div class="vacancy-actions">
                    <div class="vacancy-tags">
                        ${vacancy.employment && vacancy.employment.length > 0 
                            ? vacancy.employment.map(emp => 
                                `<span class="vacancy-tag">${employmentLabels[emp] || this.escapeHtml(emp)}</span>`
                              ).join('')
                            : '<span class="vacancy-tag">Не указано</span>'}
                    </div>
                    ${applyButton}
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadMore() {
        this.currentPage++;
        this.renderVacancies();
    }

    attachApplyHandlers() {
        document.querySelectorAll('.btn-apply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vacancyId = parseInt(e.target.dataset.id);
                this.showApplyModal(vacancyId);
            });
        });
    }

    showApplyModal(vacancyId) {
        const user = jobPlatform.getCurrentUser();
        if (!user) {
            jobPlatform.showNotification('Для отклика на вакансии необходимо авторизоваться', 'error');
            window.location.href = 'auth.html';
            return;
        }

        // Проверяем, что пользователь не работодатель
        if (user.role === 'employer' || user.status === 'employer') {
            jobPlatform.showNotification('Работодатели не могут откликаться на вакансии', 'error');
            return;
        }

        this.selectedVacancy = this.vacancies.find(v => v.id === vacancyId);
        if (!this.selectedVacancy) {
            jobPlatform.showNotification('Вакансия не найдена', 'error');
            return;
        }

        // Проверяем, не откликался ли уже пользователь на эту вакансию
        const applications = JSON.parse(localStorage.getItem('applications_' + user.id) || '[]');
        const existingApplication = applications.find(app => app.vacancyId === vacancyId);
        if (existingApplication) {
            jobPlatform.showNotification('Вы уже откликались на эту вакансию', 'error');
            return;
        }

        // Заполняем информацию о вакансии
        const vacancyPreview = document.getElementById('vacancyPreview');
        if (vacancyPreview) {
            const salaryText = this.selectedVacancy.salary && this.selectedVacancy.salary > 0
                ? `${this.selectedVacancy.salary.toLocaleString('ru-RU')} ₽`
                : 'Не указана';
            vacancyPreview.innerHTML = `
                <h4>${this.escapeHtml(this.selectedVacancy.title)}</h4>
                <p><strong>${this.escapeHtml(this.selectedVacancy.company)}</strong></p>
                <p>${salaryText}</p>
            `;
        }

        // Загружаем резюме пользователя
        this.loadUserResumes();

        // Показываем модальное окно
        const applyModal = document.getElementById('applyModal');
        if (applyModal) {
            applyModal.classList.add('active');
        }
    }

    loadUserResumes() {
        const user = jobPlatform.getCurrentUser();
        const resumes = JSON.parse(localStorage.getItem('resumes_' + user.id) || '[]');
        const select = document.getElementById('resumeSelect');
        const confirmApply = document.getElementById('confirmApply');

        if (!select) return;

        select.innerHTML = '';

        if (resumes.length === 0) {
            select.innerHTML = '<option value="">У вас нет созданных резюме</option>';
            if (confirmApply) {
                confirmApply.disabled = true;
            }
        } else {
            resumes.forEach(resume => {
                const option = document.createElement('option');
                option.value = resume.id;
                option.textContent = resume.title || 'Резюме без названия';
                select.appendChild(option);
            });
            if (confirmApply) {
                confirmApply.disabled = false;
            }
        }
    }

    closeModal() {
        const applyModal = document.getElementById('applyModal');
        if (applyModal) {
            applyModal.classList.remove('active');
        }
        this.selectedVacancy = null;
    }

    async submitApplication() {
        const resumeSelect = document.getElementById('resumeSelect');
        if (!resumeSelect) return;

        const resumeId = parseInt(resumeSelect.value);

        if (!resumeId) {
            jobPlatform.showNotification('Выберите резюме для отправки', 'error');
            return;
        }

        const user = jobPlatform.getCurrentUser();
        if (!user) {
            jobPlatform.showNotification('Пользователь не авторизован', 'error');
            return;
        }
        
        // Проверяем, не откликался ли уже пользователь на эту вакансию
        const applications = JSON.parse(localStorage.getItem('applications_' + user.id) || '[]');
        const existingApplication = applications.find(app => app.vacancyId === this.selectedVacancy.id);
        if (existingApplication) {
            jobPlatform.showNotification('Вы уже откликались на эту вакансию', 'error');
            this.closeModal();
            return;
        }

        const resumes = JSON.parse(localStorage.getItem('resumes_' + user.id) || '[]');
        const selectedResume = resumes.find(r => r.id === resumeId);

        if (!selectedResume) {
            jobPlatform.showNotification('Ошибка при выборе резюме', 'error');
            return;
        }

        // Получаем информацию о работодателе из вакансии
        const allVacancies = JSON.parse(localStorage.getItem('vacancies') || '[]');
        let vacancy = allVacancies.find(v => v.id === this.selectedVacancy.id);
        
        // Если не найдено, загружаем из JSON файла
        if (!vacancy) {
            try {
                const response = await fetch('./vacancies.json');
                if (response.ok) {
                    const exampleVacancies = await response.json();
                    vacancy = exampleVacancies.find(v => v.id === this.selectedVacancy.id);
                }
            } catch (error) {
                console.warn('Не удалось загрузить вакансии из JSON:', error);
            }
        }
        
        const employerId = vacancy ? vacancy.employerId : null;

        // Сохраняем отклик для соискателя
        const application = {
            id: Date.now(),
            vacancyId: this.selectedVacancy.id,
            vacancyTitle: this.selectedVacancy.title,
            resumeId: resumeId,
            resumeTitle: selectedResume.title,
            appliedAt: new Date().toISOString(),
            status: 'sent',
            applicantId: user.id,
            applicantName: user.fullName,
            employerId: employerId
        };

        applications.push(application);
        localStorage.setItem('applications_' + user.id, JSON.stringify(applications));

        // Сохраняем отклик для работодателя (если есть employerId)
        if (employerId) {
            const employerApplications = JSON.parse(localStorage.getItem('applications_to_employer_' + employerId) || '[]');
            employerApplications.push(application);
            localStorage.setItem('applications_to_employer_' + employerId, JSON.stringify(employerApplications));
        }

        this.closeModal();
        jobPlatform.showNotification('Резюме успешно отправлено!');
        
        // Обновляем отображение вакансий (кнопка "Откликнуться" должна измениться на "Уже откликнулись")
        this.renderVacancies();
    }

    // Методы для работодателей (резюме)
    async loadResumes() {
        console.log('=== ЗАГРУЗКА РЕЗЮМЕ ===');
        
        // Загружаем резюме из localStorage (всех пользователей)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        let localStorageResumes = [];
        
        users.forEach(user => {
            const userResumes = JSON.parse(localStorage.getItem('resumes_' + user.id) || '[]');
            userResumes.forEach(resume => {
                localStorageResumes.push({
                    ...resume,
                    userId: user.id,
                    userFullName: user.fullName
                });
            });
        });
        
        // Загружаем примеры резюме из JSON файла
        let exampleResumes = [];
        try {
            const response = await fetch('./resumes.json');
            if (response.ok) {
                exampleResumes = await response.json();
                console.log(`Загружено ${exampleResumes.length} примеров резюме из resumes.json`);
            }
        } catch (error) {
            console.warn('Не удалось загрузить примеры резюме из resumes.json:', error);
        }
        
        // Объединяем резюме из localStorage и из JSON файла
        const allResumes = [...localStorageResumes, ...exampleResumes];
        
        // Фильтруем только одобренные резюме и убираем дубликаты по ID
        const uniqueResumes = [];
        const seenIds = new Set();
        
        // Сначала добавляем резюме из localStorage (они имеют приоритет)
        localStorageResumes
            .filter(resume => resume.moderationStatus === 'approved')
            .forEach(resume => {
                if (!seenIds.has(resume.id)) {
                    seenIds.add(resume.id);
                    uniqueResumes.push(resume);
                }
            });
        
        // Затем добавляем примеры из JSON файла (только если их ID еще нет)
        exampleResumes
            .filter(resume => resume.moderationStatus === 'approved')
            .forEach(resume => {
                if (!seenIds.has(resume.id)) {
                    seenIds.add(resume.id);
                    uniqueResumes.push(resume);
                }
            });
        
        this.resumes = uniqueResumes;
        this.filteredResumes = [...this.resumes];
        console.log(`Всего загружено ${this.resumes.length} одобренных резюме`);
    }

    setupResumeEventListeners() {
        console.log('Настройка обработчиков для резюме...');
        
        // Поиск
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleResumeSearch());
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleResumeSearch();
            });
            searchInput.placeholder = 'Имя, профессия или навыки...';
        }

        // Обновляем заголовок
        const header = document.querySelector('.jobs-header h1');
        if (header) {
            header.textContent = 'Поиск сотрудников';
        }

        console.log('Обработчики для резюме настроены');
    }

    handleResumeSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const searchTerm = searchInput.value.toLowerCase();
            this.currentFilters.search = searchTerm;
            this.applyResumeFilters();
        }
    }

    applyResumeFilters() {
        const searchInput = document.getElementById('searchInput');
        const search = searchInput?.value.toLowerCase() || '';
        
        this.filteredResumes = this.resumes.filter(resume => {
            if (search && !(
                resume.personal?.fullName?.toLowerCase().includes(search) ||
                resume.title?.toLowerCase().includes(search) ||
                (resume.skills && resume.skills.some(skill => skill.toLowerCase().includes(search)))
            )) {
                return false;
            }
            return true;
        });

        this.renderResumes();
    }

    renderResumes() {
        const container = document.getElementById('vacanciesList');
        if (!container) {
            console.error('Контейнер vacanciesList не найден для резюме');
            return;
        }

        const countElement = document.getElementById('jobsCount');
        if (countElement) {
            countElement.textContent = `Найдено ${this.filteredResumes.length} резюме`;
        }

        // Получаем резюме для текущей страницы
        const startIndex = (this.currentPage - 1) * this.resumesPerPage;
        const endIndex = startIndex + this.resumesPerPage;
        const resumesToShow = this.filteredResumes.slice(0, endIndex);

        container.innerHTML = resumesToShow.map(resume => this.createResumeCard(resume)).join('');

        // Показываем/скрываем кнопку "Загрузить ещё"
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex < this.filteredResumes.length ? 'block' : 'none';
            loadMoreBtn.onclick = () => this.loadMoreResumes();
        }

        // Добавляем обработчики для просмотра резюме
        this.attachViewResumeHandlers();
    }

    createResumeCard(resume) {
        const skills = resume.skills && resume.skills.length > 0 
            ? resume.skills.slice(0, 5).map(skill => `<span class="vacancy-tag">${this.escapeHtml(skill)}</span>`).join('')
            : '<span class="vacancy-tag">Навыки не указаны</span>';

        const salaryDisplay = resume.desiredSalary 
            ? `${parseInt(resume.desiredSalary).toLocaleString('ru-RU')} ₽`
            : 'Не указана';

        const experienceText = resume.experience && resume.experience.hasExperience && resume.experience.items && resume.experience.items.length > 0
            ? resume.experience.items[0].position + ' в ' + resume.experience.items[0].company
            : 'Без опыта';

        const fullName = resume.personal?.fullName || 'Не указано';
        const email = resume.personal?.email || 'Не указан';
        const phone = resume.personal?.phone || 'Не указан';
        const resumeTitle = resume.title || 'Резюме';
        const createdAt = resume.createdAt ? new Date(resume.createdAt).toLocaleDateString('ru-RU') : 'Не указана';

        return `
            <div class="vacancy-card" data-id="${resume.id}">
                <div class="vacancy-header">
                    <div>
                        <h3 class="vacancy-title">${this.escapeHtml(fullName)}</h3>
                        <div class="vacancy-company">${this.escapeHtml(resumeTitle)}</div>
                    </div>
                    <div class="vacancy-salary">${salaryDisplay}</div>
                </div>
                
                <div class="vacancy-info">
                    <div class="vacancy-meta">📧 ${this.escapeHtml(email)}</div>
                    <div class="vacancy-meta">📞 ${this.escapeHtml(phone)}</div>
                    <div class="vacancy-meta">💼 ${this.escapeHtml(experienceText)}</div>
                    <div class="vacancy-meta">📅 ${createdAt}</div>
                </div>
                
                <div class="vacancy-description">
                    <strong>Навыки:</strong> ${skills}
                </div>
                
                <div class="vacancy-actions">
                    <div class="vacancy-tags">
                        ${skills}
                    </div>
                    <button class="btn btn-primary btn-view-resume" data-id="${resume.id}">Просмотреть резюме</button>
                </div>
            </div>
        `;
    }

    loadMoreResumes() {
        this.currentPage++;
        this.renderResumes();
    }

    attachViewResumeHandlers() {
        document.querySelectorAll('.btn-view-resume').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resumeId = parseInt(e.target.dataset.id);
                this.viewResume(resumeId);
            });
        });
    }

    viewResume(resumeId) {
        const resume = this.resumes.find(r => r.id === resumeId);
        if (!resume) return;

        // Открываем резюме в новом окне или модальном окне
        const userId = resume.userId || resume.userId;
        if (userId) {
            window.location.href = `resume-preview.html?id=${resumeId}&userId=${userId}`;
        } else {
            window.location.href = `resume-preview.html?id=${resumeId}`;
        }
    }
}

// Инициализация при загрузке страницы с улучшенной обработкой ошибок
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM ЗАГРУЖЕН ===');
    console.log('Контейнер vacanciesList:', document.getElementById('vacanciesList'));
    console.log('Контейнер jobsCount:', document.getElementById('jobsCount'));
    
    try {
        // Проверяем, существует ли jobPlatform
        if (typeof jobPlatform === 'undefined') {
            console.error('jobPlatform не определен. Создаем заглушку...');
            // Создаем минимальную заглушку для jobPlatform
            window.jobPlatform = {
                getCurrentUser: function() {
                    try {
                        return JSON.parse(localStorage.getItem('currentUser'));
                    } catch (e) {
                        return null;
                    }
                },
                showNotification: function(message, type = 'success') {
                    console.log(`Notification [${type}]: ${message}`);
                    alert(message);
                }
            };
        }
        
        // Инициализируем JobsManager
        window.jobsManager = new JobsManager();
        
        // Дополнительная проверка через 3 секунды
        setTimeout(() => {
            console.log('=== ПРОВЕРКА ЧЕРЕЗ 3 СЕКУНДЫ ===');
            if (window.jobsManager) {
                console.log('Вакансии:', window.jobsManager.vacancies?.length);
                console.log('Отфильтрованные:', window.jobsManager.filteredVacancies?.length);
                
                if (window.jobsManager.filteredVacancies?.length === 0 && !window.jobsManager.isEmployer) {
                    console.log('Создаем тестовые вакансии принудительно...');
                    window.jobsManager.createTestVacancies();
                    window.jobsManager.renderVacancies();
                }
            } else {
                console.error('JobsManager не инициализирован!');
            }
        }, 3000);
        
    } catch (error) {
        console.error('Критическая ошибка при инициализации JobsManager:', error);
        
        // Показываем сообщение об ошибке пользователю
        const container = document.getElementById('vacanciesList');
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; color: #d32f2f;">
                    <h3>😔 Произошла ошибка</h3>
                    <p>Не удалось загрузить вакансии. Пожалуйста, обновите страницу.</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                        Обновить страницу
                    </button>
                </div>
            `;
        }
    }
});

// Глобальная функция для отладки
window.debugJobsManager = function() {
    console.log('=== DEBUG JobsManager ===');
    console.log('jobsManager:', window.jobsManager);
    if (window.jobsManager) {
        console.log('Вакансии:', window.jobsManager.vacancies);
        console.log('Отфильтрованные:', window.jobsManager.filteredVacancies);
        console.log('isEmployer:', window.jobsManager.isEmployer);
    }
};