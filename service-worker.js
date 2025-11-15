// Service Worker для обработки 404 ошибок
const existingPages = [
    '/index.html',
    '/about.html',
    '/contacts.html',
    '/job-search.html',
    '/login.html',
    '/profile.html',
    '/resume-create.html',
    '/404.html',
    '/admin.html',
    '/yandex_9692edf2d716bce0.html',
    '/',
    ''
];

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const pathname = url.pathname;
    
    // Проверяем только HTML файлы и корневой путь
    if (pathname.endsWith('.html') || pathname === '/' || pathname === '') {
        // Нормализуем путь
        let normalizedPath = pathname;
        if (normalizedPath === '/' || normalizedPath === '') {
            normalizedPath = '/index.html';
        }
        
        // Проверяем, существует ли страница в списке
        const isExisting = existingPages.includes(pathname) || 
                          existingPages.includes(normalizedPath) ||
                          existingPages.includes(pathname + '.html');
        
        // Если страница не существует, показываем 404
        if (!isExisting) {
            event.respondWith(
                fetch('/404.html')
                    .then(response => {
                        if (response.ok) {
                            return response;
                        }
                        throw new Error('404.html not found');
                    })
                    .catch(() => {
                        return new Response('Страница не найдена', {
                            status: 404,
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        });
                    })
            );
            return;
        }
    }
    
    // Для остальных запросов используем стандартное поведение
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Если ответ 404 для HTML файла, показываем нашу страницу 404
                if (!response.ok && response.status === 404 && 
                    (pathname.endsWith('.html') || pathname === '/' || pathname === '')) {
                    return fetch('/404.html').catch(() => response);
                }
                return response;
            })
            .catch(() => {
                // Если запрос не удался и это HTML, показываем 404
                if (pathname.endsWith('.html') || pathname === '/' || pathname === '') {
                    return fetch('/404.html').catch(() => {
                        return new Response('Страница не найдена', {
                            status: 404,
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        });
                    });
                }
                return new Response('Ресурс не найден', { status: 404 });
            })
    );
});

