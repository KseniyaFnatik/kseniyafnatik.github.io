// Ранняя проверка существования страницы (выполняется до загрузки DOM)
(function() {
    const existingPages = [
        'index.html',
        'about.html',
        'contacts.html',
        'job-search.html',
        'login.html',
        'profile.html',
        'resume-create.html',
        '404.html',
        'admin.html',
        'yandex_9692edf2d716bce0.html'
    ];
    
    // Регистрация Service Worker для перехвата всех запросов
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker зарегистрирован успешно');
                    // Обновляем Service Worker при необходимости
                    registration.update();
                })
                .catch(error => {
                    console.log('Ошибка регистрации Service Worker:', error);
                });
        });
    }
    
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
        return;
    }
})();

