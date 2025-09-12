import * as PusherPushNotifications from '@pusher/push-notifications-web';

let beamsClient: any = null;
let isInitializing = false;

export const initPusherBeams = async () => {
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.log('Pusher Beams initialization already in progress...');
    return beamsClient;
  }

  if (beamsClient) {
    console.log('Pusher Beams already initialized');
    return beamsClient;
  }

  if (typeof window === 'undefined') {
    console.log('Window not available, skipping Pusher Beams initialization');
    return null;
  }

  try {
    isInitializing = true;
    console.log('Initializing Pusher Beams...');

    // Create new client instance
    beamsClient = new (PusherPushNotifications as any).Client({
      instanceId: process.env.NEXT_PUBLIC_PUSHER_INSTANCE_ID || '',
      secretKey: process.env.NEXT_PUBLIC_PUSHER_SECRET_KEY!

    });

    // Start the client
    await beamsClient.start();

    // Add device interest
    await beamsClient.addDeviceInterest('admin-notifications');

    console.log('Successfully registered with Pusher Beams');

    // Get and log device ID for debugging
    const deviceId = await beamsClient.getDeviceId();
    console.log('Device ID:', deviceId);

    // Set up message listener for in-app notifications
    setupMessageListener();

    return beamsClient;
  } catch (error) {
    console.error('Error initializing Pusher Beams:', error);
    beamsClient = null;
    return null;
  } finally {
    isInitializing = false;
  }
};

// Setup message listener for service worker communication
const setupMessageListener = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {

      switch (event.data.type) {
        case 'PUSH_NOTIFICATION':
          // Handle in-app notification display here
          handleInAppNotification(event.data.notification);
          break;
        case 'NAVIGATE':
          // Handle navigation
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = event.data.url;
          }
          break;
        default:
          console.log('Unknown message type:', event.data.type);
      }
    });
  }
};

// Handle in-app notifications (customize this based on your UI)
const handleInAppNotification = (notification: any) => {

  // Example: You can dispatch a custom event or update your app's state
  const customEvent = new CustomEvent('inAppNotification', {
    detail: notification
  });
  window.dispatchEvent(customEvent);
};

export const getBeamsClient = () => beamsClient;

// Add user to specific interest (useful for user-specific notifications)
export const addUserInterest = async (userId: string) => {
  if (!beamsClient) {
    console.warn('Beams client not initialized');
    return false;
  }

  try {
    await beamsClient.addDeviceInterest(`user-${userId}`);
    console.log(`Added interest for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error adding user interest:', error);
    return false;
  }
};

// Remove user interest
export const removeUserInterest = async (userId: string) => {
  if (!beamsClient) {
    console.warn('Beams client not initialized');
    return false;
  }

  try {
    await beamsClient.removeDeviceInterest(`user-${userId}`);
    console.log(`Removed interest for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error removing user interest:', error);
    return false;
  }
};

// Get all current interests
export const getDeviceInterests = async () => {
  if (!beamsClient) {
    console.warn('Beams client not initialized');
    return [];
  }

  try {
    const interests = await beamsClient.getDeviceInterests();
    console.log('Current device interests:', interests);
    return interests;
  } catch (error) {
    console.error('Error getting device interests:', error);
    return [];
  }
};

// Clean up function to stop client if needed
export const stopPusherBeams = async () => {
  if (beamsClient) {
    try {
      await beamsClient.stop();
      beamsClient = null;
      console.log('Pusher Beams client stopped');
    } catch (error) {
      console.error('Error stopping Pusher Beams:', error);
    }
  }
};

// Check if notifications are supported and enabled
export const checkNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  const permission = Notification.permission;
  console.log('Notification permission:', permission);

  if (permission === 'default') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  return permission === 'granted';
};