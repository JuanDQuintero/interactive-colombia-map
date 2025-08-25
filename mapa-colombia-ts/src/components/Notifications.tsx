import {
    collection,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import type { Notification } from '../interfaces/notifications';

const Notifications = ({ userId, isAdmin = false }: { userId: string; isAdmin?: boolean }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    //Listener de Firestore
    useEffect(() => {
        if (!userId) {
            setError('Usuario no autenticado');
            return;
        }

        // Limpiar listener anterior si existe
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }

        setError(null);

        try {
            // Construir la query según si es admin o usuario normal
            let notificationQuery;

            if (isAdmin) {
                // Admins ven notificaciones para 'admin' y sus propias notificaciones
                notificationQuery = query(
                    collection(db, 'notifications'),
                    where('userId', 'in', [userId, 'admin']),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );
            } else {
                // Usuarios normales ven solo sus notificaciones
                notificationQuery = query(
                    collection(db, 'notifications'),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );
            }

            // Configurar el listener con manejo de errores
            const unsubscribe = onSnapshot(
                notificationQuery,
                (snapshot) => {
                    const notifs = snapshot.docs.map((doc) => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            message: data.message || '',
                            read: data.read || false,
                            createdAt: data.createdAt?.toDate?.() || new Date(),
                            type: data.type || '',
                            proposalId: data.proposalId || '',
                            userId: data.userId || ''
                        } as Notification;
                    });

                    setNotifications(notifs);
                    setUnreadCount(notifs.filter((n) => !n.read).length);
                    setError(null);
                },
                (error) => {
                    console.error('Error en listener de notificaciones:', error);
                    setError('Error al cargar notificaciones');
                }
            );

            unsubscribeRef.current = unsubscribe;

        } catch (error) {
            console.error('Error configurando listener:', error);
            setError('Error de configuración');
        }

        // Cleanup function
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [userId, isAdmin]);

    /* -------------------------------------------------
     * Cerrar al hacer click fuera
     * ------------------------------------------------- */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isOpen && !target.closest('.notification-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    /* -------------------------------------------------
     * Helpers
     * ------------------------------------------------- */
    const markAsRead = async (id: string) => {
        try {
            await updateDoc(doc(db, 'notifications', id), {
                read: true
            });
        } catch (e) {
            console.error('Error marcando como leída:', e);
            setError('Error al actualizar notificación');
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter((n) => !n.read);
            await Promise.all(
                unreadNotifications.map((n) =>
                    updateDoc(doc(db, 'notifications', n.id), {
                        read: true
                    })
                )
            );
        } catch (e) {
            console.error('Error marcando todas como leídas:', e);
            setError('Error al actualizar notificaciones');
        }
    };

    /* -------------------------------------------------
     * Render
     * ------------------------------------------------- */
    return (
        <div className="relative">
            <button
                className="p-2 relative cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200 group"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                aria-label="Notificaciones"
            >
                <svg
                    className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1 shadow-sm dark:shadow-red-900/50 border border-white dark:border-gray-800 font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {error && !isOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs">
                    {error}
                </div>
            )}

            {isOpen && (
                <div className="notification-container absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50">
                    {/* Header */}
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 font-semibold flex justify-between items-center">
                        <span>Notificaciones</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAllAsRead();
                                }}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>
                    {error && (
                        <div className="px-4 py-2 bg-red-100 border-b border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                No tienes notificaciones
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${!notification.read
                                        ? 'bg-blue-50 dark:bg-blue-900/30'
                                        : ''
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex items-start">
                                        <div
                                            className={`flex-shrink-0 h-5 w-5 mt-0.5 ${notification.type === 'proposal_approved' ||
                                                notification.type === 'proposal_approved_alert'
                                                ? 'text-green-500'
                                                : notification.type === 'proposal_rejected' ||
                                                    notification.type === 'proposal_rejected_alert'
                                                    ? 'text-red-500'
                                                    : 'text-blue-500'
                                                }`}
                                        >
                                            {notification.type === 'proposal_approved' ||
                                                notification.type === 'proposal_approved_alert' ? (
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            ) : notification.type === 'proposal_rejected' ||
                                                notification.type === 'proposal_rejected_alert' ? (
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {notification.createdAt.toLocaleDateString()}{' '}
                                                {notification.createdAt.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
                            Mostrando {notifications.length} notificaciones
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;