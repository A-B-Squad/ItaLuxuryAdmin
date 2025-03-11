importScripts("https://js.pusher.com/beams/service-worker.js");

// Listen for push events
self.addEventListener('push', event => {
    if (!event.data) return;

    try {
        // Parse the notification data
        const data = event.data.json();
        console.log('Push notification received in service worker:', data);

        // Extract notification details
        const title = data.notification?.title || 'Nouvelle notifissscation';
        const options = {
            body: data.notification?.body || '',
            icon: '/images/logo.png',
            badge: '/images/badge.png',
            data: data.data || {}
        };

        // Forward the notification to the client
        self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clients => {
            if (clients.length > 0) {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'PUSH_NOTIFICATION',
                        notification: {
                            title: title,
                            body: options.body,
                            data: options.data
                        }
                    });
                });
            }
        });

        // Show the notification
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (error) {
        console.error('Error handling push notification:', error);
    }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    // Navigate to the URL when notification is clicked
    const urlToOpen = event.notification.data?.link || '/';

    event.waitUntil(
        self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
            // If a window client is already open, focus it
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});