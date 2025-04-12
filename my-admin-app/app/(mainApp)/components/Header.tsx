"use client";
import { usePathname, useRouter } from "next/navigation";
import { CiUser } from "react-icons/ci";
import { FiMenu, FiPieChart, FiBell } from "react-icons/fi";
import { IoIosNotificationsOutline, IoMdClose } from "react-icons/io";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import { AnimatePresence, motion } from "framer-motion";

interface HeaderProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

const Header = ({ onMenuClick, showMenuButton }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element for notification sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create audio element and set properties
      notificationSoundRef.current = new Audio('/sounds/notification.mp3');
      notificationSoundRef.current.volume = 1;

      // Preload the sound for faster playback
      notificationSoundRef.current.preload = 'auto';

      // Try to load the sound file
      notificationSoundRef.current.load();
    }

    // Cleanup function
    return () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause();
        notificationSoundRef.current = null;
      }
    };
  }, []);

  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    if (notificationSoundRef.current) {
      // Reset to beginning if already playing
      notificationSoundRef.current.currentTime = 0;

      // Play the sound with error handling
      notificationSoundRef.current.play().catch(err => {
        console.warn('Could not play notification sound:', err);
      });
    }
  }, []);



  // Register service worker for push notifications
  useEffect(() => {
    // Track if registration has already been logged
    let hasLogged = false;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          // Only log once
          if (!hasLogged) {
            console.log('Service Worker registered with scope:', registration.scope);
            hasLogged = true;
          }

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
              const { title, body, data } = event.data.notification || {};

              // Handle the notification
              handleNewNotification({
                title: title || 'Nouvelle notification',
                message: body || '',
                link: data?.link || '/Orders',
              });
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Handle incoming notifications
  const handleNewNotification = useCallback((data: any) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: data.title || 'Nouvelle notification',
      message: data.message || '',
      timestamp: Date.now(),
      read: false,
      link: data.link,
    };

    // Play notification sound
    playNotificationSound();

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem('admin-notifications', JSON.stringify(updated));
      return updated;
    });

    setUnreadCount(prev => prev + 1);
  }, [playNotificationSound]);


  useEffect(() => {
    // Handle notification events from the service worker with proper typing
    const handleNotificationEvent = (event: CustomEvent<any>) => {
      if (event.detail) {
        handleNewNotification(event.detail);
      }
    };

    // Use the correct event listener type
    window.addEventListener('new-notification', handleNotificationEvent as EventListener);

    // Load saved notifications from localStorage
    const savedNotifications = localStorage.getItem('admin-notifications');
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);

        // Calculate unread count with proper type checking
        const unread = parsedNotifications.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error parsing notifications:', error);
        // Handle corrupted localStorage data
        localStorage.removeItem('admin-notifications');
      }
    }

    // Mock notification for development (remove in production)
    let mockNotificationTimer: NodeJS.Timeout | undefined;
    if (process.env.NODE_ENV === 'development') {
      mockNotificationTimer = setTimeout(() => {
        handleNewNotification({
          title: 'Nouvelle commande',
          message: 'Une nouvelle commande (#12345) a été placée',
          link: '/Orders',
        });
      }, 5000);
    }

    return () => {
      if (mockNotificationTimer) clearTimeout(mockNotificationTimer);
      window.removeEventListener('new-notification', handleNotificationEvent as EventListener);
    };
  }, [handleNewNotification]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      localStorage.setItem('admin-notifications', JSON.stringify(updated));
      return updated;
    });

    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }));
      localStorage.setItem('admin-notifications', JSON.stringify(updated));
      return updated;
    });

    setUnreadCount(0);
  }, []);

  // Handle notification click
  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id);

    if (notification.link) {
      router.push(notification.link);
    }

    setShowNotifications(false);
  }, [markAsRead, router]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return `${diffDays}j`;
    }
  };

  const pathnameHandle = (pathname: string) => {
    switch (pathname) {
      case "/Statistical/Delivery":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Delivery Page
            </h1>
          </div>
        );
      case "/Statistical/Products":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Products Page
            </h1>
          </div>
        );
      case "/Statistical/Marketing":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Marketing Page
            </h1>
          </div>
        );
      case "/Statistical/Customer":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Customer Page
            </h1>
          </div>
        );
      case "/Products":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-11/12 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Tous Les Produits Page
            </h1>
          </div>
        );
      case "/Products/CreateProduct":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-11/12 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Nouveau Produits Page
            </h1>
          </div>
        );
      case "/Products/Categories":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Categories Page
            </h1>
          </div>
        );
      case "/Products/Inventory":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Inventair Page
            </h1>
          </div>
        );
      case "/Products/Reviews":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Avis Page
            </h1>
          </div>
        );
      case "/Coupons":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Coupons Page
            </h1>
          </div>
        );
      case "/Coupons/CreateCoupons":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Creation Coupons Page
            </h1>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <header className="sticky top-0 z-50 shadow-md py-4 bg-white font-[sans-serif] min-h-[70px] tracking-wide w-full">
      <div className="container flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <FiMenu size={24} className="text-gray-600" />
            </button>
          )}
          {pathnameHandle(pathname)}
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative">
            <button
              className="p-2 relative rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <IoIosNotificationsOutline size={26} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-600 text-white text-xs font-medium rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <IoMdClose size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-blue-700' : 'text-gray-800'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <FiBell size={24} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Aucune notification</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <CiUser size={26} className="text-gray-600" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <div className="py-2">
                    <button
                      onClick={() => router.push("/signup")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>Create Moderator Account</span>
                    </button>
                    <button
                      onClick={() => {
                        // Remove the cookie with the same path and domain settings
                        Cookies.remove("AdminToken", { 
                          path: '/',
                          domain: window.location.hostname
                        });
                        
                        // Add a small delay before redirecting to ensure cookie is removed
                        setTimeout(() => {
                          router.push('/signin');
                        }, 100);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;