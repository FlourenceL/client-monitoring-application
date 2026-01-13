import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonIcon,
	IonButton,
	useIonToast,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonListHeader,
    IonToggle,
    IonAvatar,
    IonCard,
    IonCardContent
} from "@ionic/react";
import { 
    logOutOutline, 
    serverOutline, 
    personCircleOutline,
    moonOutline,
    notificationsOutline,
    helpCircleOutline,
    documentTextOutline,
    shieldCheckmarkOutline,
    chevronForwardOutline
} from "ionicons/icons";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { databaseService } from "../database/Database.service";
import { useAppStore } from "../store/appStore";
import packageJson from "../../package.json";

interface ConfigPageProps {}

const ConfigPage: React.FC<ConfigPageProps> = () => {
	const [present] = useIonToast();
	const setIsAuthenticated = useAppStore((state) => state.setIsAuthenticated);
    const user = useAppStore((state) => state.user);
    const isAdmin = useAppStore((state) => state.isAdmin);
	const history = useHistory();
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

	const handleLogout = () => {
		setIsAuthenticated(false);
		history.replace("/login");
	};

	const testConnection = async () => {
		try {
			const res = await databaseService.query("SELECT 1 as test");
			if (res && res.length > 0) {
				present({
					message: "Database connection successful!",
					duration: 3000,
					color: "success",
					position: "bottom",
                    icon: shieldCheckmarkOutline
				});
			} else {
				throw new Error("Test query returned no results or DB not initialized");
			}
		} catch (error) {
			console.error(error);
			present({
				message:
					"Database connection failed: " +
					(error instanceof Error ? error.message : String(error)),
				duration: 3000,
				color: "danger",
				position: "bottom",
			});
		}
	};

	return (
		<IonPage>
			<IonHeader translucent={true}>
				<IonToolbar>
					<IonTitle>Settings</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen className="ion-padding-vertical">
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Settings</IonTitle>
					</IonToolbar>
				</IonHeader>
				
				<div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'calc(100% - 20px)' }}>
					{/* User Profile Section */}
                    <div className="ion-padding-horizontal ion-margin-bottom">
                        <IonCard style={{ 
                            margin: 0, 
                            background: 'linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%)',
                            boxShadow: '0 8px 20px rgba(var(--ion-color-primary-rgb), 0.3)'
                        }}>
                            <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <IonAvatar style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                                        {user ? user.charAt(0).toUpperCase() : 'G'}
                                    </span>
                                </IonAvatar>
                                <div style={{ color: 'white' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{user || 'Guest User'}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', opacity: 0.9 }}>
                                        {isAdmin && <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: '14px' }} />}
                                        <span style={{ fontSize: '0.9rem' }}>{isAdmin ? 'Administrator' : 'Standard User'}</span>
                                    </div>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </div>

                    {/* App Settings */}
                    <IonList inset={true} style={{ borderRadius: '16px', marginBottom: '24px' }}>
                        <IonListHeader>
                            <IonLabel style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ion-color-medium)' }}>
                                App Settings
                            </IonLabel>
                        </IonListHeader>
                        <IonItem lines="full">
                            <IonIcon slot="start" icon={moonOutline} color="primary" />
                            <IonLabel>Dark Mode</IonLabel>
                            <IonToggle 
                                slot="end" 
                                checked={darkMode} 
                                onIonChange={e => {
                                    setDarkMode(e.detail.checked);
                                    document.body.classList.toggle('dark', e.detail.checked);
                                }} 
                            />
                        </IonItem>
                        <IonItem lines="none">
                            <IonIcon slot="start" icon={notificationsOutline} color="secondary" />
                            <IonLabel>Notifications</IonLabel>
                            <IonToggle slot="end" checked={notifications} onIonChange={e => setNotifications(e.detail.checked)} />
                        </IonItem>
                    </IonList>

					{/* System Tools */}
					<IonList inset={true} style={{ borderRadius: '16px', marginBottom: '24px' }}>
						<IonListHeader>
							<IonLabel style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ion-color-medium)' }}>
								System
							</IonLabel>
						</IonListHeader>
						<IonItem 
							button 
							onClick={testConnection} 
							detail={false}
						>
                            <div slot="start" style={{ 
                                background: 'rgba(var(--ion-color-success-rgb), 0.1)', 
                                padding: '8px', 
                                borderRadius: '8px',
                                display: 'flex'
                            }}>
							    <IonIcon icon={serverOutline} color="success" />
                            </div>
							<IonLabel>
								<h3 style={{ fontWeight: '600' }}>Database Connection</h3>
								<p style={{ color: 'var(--ion-color-medium)', fontSize: '0.85rem' }}>Test connectivity status</p>
							</IonLabel>
                            <IonButton fill="clear" slot="end" size="small" color="success" style={{ fontWeight: '600' }}>
                                TEST
                            </IonButton>
						</IonItem>
					</IonList>

                    {/* Support & Info */}
                    <IonList inset={true} style={{ borderRadius: '16px', marginBottom: '24px' }}>
                        <IonListHeader>
                            <IonLabel style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ion-color-medium)' }}>
                                Support
                            </IonLabel>
                        </IonListHeader>
                        <IonItem button detail={true}>
                            <IonIcon slot="start" icon={helpCircleOutline} color="warning" />
                            <IonLabel>Help Center</IonLabel>
                        </IonItem>
                        <IonItem button detail={true}>
                            <IonIcon slot="start" icon={documentTextOutline} color="medium" />
                            <IonLabel>Terms of Service</IonLabel>
                        </IonItem>
                         <IonItem button detail={true} lines="none">
                            <IonIcon slot="start" icon={shieldCheckmarkOutline} color="medium" />
                            <IonLabel>Privacy Policy</IonLabel>
                        </IonItem>
                    </IonList>

                    <div style={{ flex: 1 }}></div>

					{/* Logout Section */}
					<div className="ion-padding-horizontal" style={{ marginTop: '32px', marginBottom: '32px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px', opacity: 0.6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                                <div style={{ width: '24px', height: '24px', background: 'var(--ion-color-primary)', borderRadius: '6px' }}></div>
                                <span style={{ fontWeight: 'bold', color: 'var(--ion-color-dark)' }}>ClientMon</span>
                            </div>
							<IonNote style={{ fontSize: '0.8rem' }}>
							    v{packageJson.version} • Build 2024.1
							</IonNote>
						</div>

						<IonButton
							expand="block"
							color="danger"
                            fill="outline"
							onClick={handleLogout}
                            className="ion-margin-bottom"
							style={{ 
								'--border-radius': '12px',
								fontWeight: '600',
                                '--border-width': '2px',
								height: '52px'
							}}
						>
							<IonIcon icon={logOutOutline} slot="start" />
							Log Out
						</IonButton>
					</div>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default ConfigPage;
