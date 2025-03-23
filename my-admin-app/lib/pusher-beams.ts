import * as PusherPushNotifications from '@pusher/push-notifications-web';

let beamsClient: PusherPushNotifications.Client | null = null;

export const initPusherBeams = async () => {
  if (!beamsClient && typeof window !== 'undefined') {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Push notifications are not supported in this browser');
      return null;
    }
    
    try {
      // First register the service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Then initialize Pusher Beams
      beamsClient = new PusherPushNotifications.Client({
        instanceId: process.env.NEXT_PUBLIC_BEAMS_INSTANCE_ID || '',
      });
      
      await beamsClient.start();
      await beamsClient.addDeviceInterest('admin-notifications');
      console.log('Successfully registered with Pusher Beams');
      
      // Setup message listener from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
          const { title, body, data } = event.data.notification || {};
          // Dispatch a custom event that the Header component can listen for
          window.dispatchEvent(new CustomEvent('new-notification', {
            detail: {
              title: title || 'Nouvelle notification',
              message: body || '',
              link: data?.link || '/Orders',
            }
          }));
        }
      });
      
      return beamsClient;
    } catch (error) {
      console.error('Error initializing Pusher Beams:', error);
      return null;
    }
  }
  
  return beamsClient;
};

export const getBeamsClient = () => beamsClient;