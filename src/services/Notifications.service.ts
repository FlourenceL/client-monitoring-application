import { LocalNotifications } from '@capacitor/local-notifications';
import { databaseService } from '../database/Database.service';
import { MstClient, TrnCollection } from '../database/DatabaseConstants';
import collectionService from './Collections.service';

class NotificationService {
    private isInitialized = false;

    async initialize() {
        if (this.isInitialized) return;

        try {
            const permission = await LocalNotifications.checkPermissions();
            if (permission.display !== 'granted') {
                const request = await LocalNotifications.requestPermissions();
                if (request.display !== 'granted') {
                    console.warn('Notification permissions not granted');
                    return;
                }
            }

            // Create notification channel for Android 8+
            await LocalNotifications.createChannel({
                id: 'client-monitoring',
                name: 'Client Monitoring',
                importance: 3,
                description: 'Notifications for client due dates and overdue payments',
                vibration: true
            });

            this.isInitialized = true;
            this.scheduleMonthlyReminder();
            this.checkDailyDue();
            this.checkOverdue();
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    }

    async scheduleMonthlyReminder() {
        try {
            // Schedule for 1st of every month at 7:00 AM
            // ID 100 reserved for monthly reminder
            const pending = await LocalNotifications.getPending();
            const exists = pending.notifications.some(n => n.id === 100);

            if (!exists) {
                await LocalNotifications.schedule({
                    notifications: [{
                        title: 'Generate Transactions',
                        body: 'It is the start of the month. Please click the generate transaction button for the month.',
                        id: 100,
                        schedule: {
                            on: {
                                day: 1,
                                hour: 7,
                                minute: 0
                            },
                            allowWhileIdle: true
                        },
                        channelId: 'client-monitoring'
                    }]
                });
            }
        } catch (error) {
            console.error('Error scheduling monthly reminder:', error);
        }
    }

    async checkDailyDue() {
        try {
            // Check clients due today
            const clientsResult = await databaseService.query(`SELECT Client, DateInstalled FROM ${MstClient} WHERE IsActive = 1`);
            const clients = clientsResult || [];
            
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

            const dueClients = clients.filter((client: any) => {
                if (!client.DateInstalled) return false;
                const installedDate = new Date(client.DateInstalled);
                if (isNaN(installedDate.getTime())) return false;

                const targetDay = installedDate.getDate();
                const effectiveDueDay = Math.min(targetDay, lastDayOfMonth);

                return effectiveDueDay === currentDay;
            });

            if (dueClients.length > 0) {
                let body = '';
                if (dueClients.length === 1) {
                    body = `${dueClients[0].Client} is due today.`;
                } else {
                    body = `You have ${dueClients.length} clients due today.`;
                }

                // Use ID based on date to avoid duplicate notifications on same day if app restarted
                // Hash: 20000 + day of year? Or just overwrite 200.
                // Overwriting ID 200 implies only one summary per day visible at a time.
                await LocalNotifications.schedule({
                    notifications: [{
                        title: 'Clients Due Today',
                        body: body,
                        id: 200, 
                        schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
                        channelId: 'client-monitoring'
                    }]
                });
            }
        } catch (error) {
            console.error('Error checking daily due clients:', error);
        }
    }

    async checkOverdue() {
        try {
            // First update overdue status logic
            await collectionService.updateOverdueTransactions();

            // Count overdue
            const overdueResult = await databaseService.query(
                `SELECT COUNT(*) as count FROM ${TrnCollection} WHERE StatusId = 3`
            );
            
            const count = overdueResult?.[0]?.count || 0;

            if (count > 0) {
                await LocalNotifications.schedule({
                    notifications: [{
                        title: 'Overdue Clients',
                        body: `You have ${count} overdue client${count > 1 ? 's' : ''}.`,
                        id: 300,
                        schedule: { at: new Date(Date.now() + 2000) }, // 2 seconds from now
                        channelId: 'client-monitoring'
                    }]
                });
            }
        } catch (error) {
            console.error('Error checking overdue clients:', error);
        }
    }
}

export const notificationService = new NotificationService();
