import * as PusherPushNotifications from '@pusher/push-notifications-web';

let beamsClient: any = null;

export const    initPusherBeams = async () => {
  if (!beamsClient && typeof window !== 'undefined') {
    try {
      // Fix: Use the Client class from the imported module
      beamsClient = new (PusherPushNotifications as any).Client({
        instanceId: process.env.NEXT_PUBLIC_BEAMS_INSTANCE_ID || '',
      });
      
      await beamsClient.start();
      await beamsClient.addDeviceInterest('admin-notifications');
      console.log('Successfully registered with Pusher Beams');
      
      return beamsClient;
    } catch (error) {
      console.error('Error initializing Pusher Beams:', error);
      return null;
    }
  }
  
  return beamsClient;
};

export const getBeamsClient = () => beamsClient;