/**
 * Notification Hooks
 *
 * TanStack Query hooks for notification operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    NotificationListResponse,
    Notification,
} from "@/lib/api/notifications";

/**
 * Hook for fetching user's notifications.
 */
export function useNotifications(limit = 50) {
    return useQuery({
        queryKey: ['notifications', limit],
        queryFn: () => getNotifications(limit),
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook for fetching unread notification count only.
 * Useful for header badge without loading full notification list.
 */
export function useUnreadCount() {
    return useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn: getUnreadCount,
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
    });
}

/**
 * Hook for marking a notification as read.
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAsRead,
        onMutate: async (notificationId) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ['notifications'] });

            const previousData = queryClient.getQueryData<NotificationListResponse>(['notifications', 50]);

            if (previousData) {
                queryClient.setQueryData<NotificationListResponse>(['notifications', 50], {
                    ...previousData,
                    unreadCount: Math.max(0, previousData.unreadCount - 1),
                    notifications: previousData.notifications.map((n) =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    ),
                });
            }

            return { previousData };
        },
        onError: (_error, _notificationId, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['notifications', 50], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
}

/**
 * Hook for marking all notifications as read.
 */
export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            // Update cache to mark all as read
            queryClient.setQueryData<NotificationListResponse>(['notifications', 50], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    unreadCount: 0,
                    notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
                };
            });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
}

/**
 * Hook for deleting a notification.
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteNotification,
        onMutate: async (notificationId) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ['notifications'] });

            const previousData = queryClient.getQueryData<NotificationListResponse>(['notifications', 50]);

            if (previousData) {
                const deletedNotification = previousData.notifications.find(n => n.id === notificationId);
                const unreadDecrement = deletedNotification && !deletedNotification.isRead ? 1 : 0;

                queryClient.setQueryData<NotificationListResponse>(['notifications', 50], {
                    ...previousData,
                    unreadCount: Math.max(0, previousData.unreadCount - unreadDecrement),
                    notifications: previousData.notifications.filter((n) => n.id !== notificationId),
                });
            }

            return { previousData };
        },
        onError: (_error, _notificationId, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['notifications', 50], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
}
