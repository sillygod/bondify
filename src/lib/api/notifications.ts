/**
 * Notification API functions
 */

import { api } from '../api';

// Types matching backend schemas
export interface Notification {
    id: number;
    type: 'achievement' | 'streak' | 'wordlist' | 'reminder';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationListResponse {
    notifications: Notification[];
    unreadCount: number;
}

export interface UnreadCountResponse {
    unreadCount: number;
}

/**
 * Get user's notifications
 */
export async function getNotifications(limit = 50): Promise<NotificationListResponse> {
    return api.get<NotificationListResponse>(`/api/notifications?limit=${limit}`);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
    return api.get<UnreadCountResponse>('/api/notifications/unread-count');
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: number): Promise<{ success: boolean }> {
    return api.patch<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {});
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<{ success: boolean; count: number }> {
    return api.post<{ success: boolean; count: number }>('/api/notifications/read-all', {});
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/api/notifications/${notificationId}`);
}

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
