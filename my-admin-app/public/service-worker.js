importScripts("https://js.pusher.com/beams/service-worker.js");


// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    // Navigate to the URL when notification is clicked
    const urlToOpen = event.notification.data?.link || '/Orders';

    event.waitUntil(
        self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
            // If a window client is already open, focus it and navigate
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    // Send navigation message to client
                    client.postMessage({
                        type: 'NAVIGATE',
                        url: urlToOpen
                    });
                    return;
                }
            }
            // Otherwise, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});

// Listen for Pusher's notification events for in-app handling
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'pusher:notification-received') {
        // Forward to client for in-app notifications
        self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'PUSH_NOTIFICATION',
                    notification: event.data.notification
                });
            });
        });
    }
});