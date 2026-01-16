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
    IonCardContent,
    IonModal,
    IonButtons,
    IonInput
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
    chevronForwardOutline,
    locationOutline,
    cardOutline,
    pricetagOutline,
    trashOutline,
    createOutline
} from "ionicons/icons";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { databaseService } from "../database/Database.service";
import locationsService from "../services/Locations.service";
import paymentMethodsService from "../services/PaymentMethods.service";
import planService from "../services/Plans.service";
import { LocationsListModel } from "../models/viewModels/LocationsListModel";
import { PaymentMethodsListModel } from "../models/viewModels/PaymentMethodsListModel";
import { PlansListModel } from "../models/viewModels/PlansListModel";
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

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);

    // Form States
    const [locationName, setLocationName] = useState("");
    const [paymentMethodName, setPaymentMethodName] = useState("");
    const [planName, setPlanName] = useState("");
    const [planAmount, setPlanAmount] = useState<number | null>(null);
    const [planIsActive, setPlanIsActive] = useState(true);

    // Edit State
    const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
    const [editingPaymentMethodId, setEditingPaymentMethodId] = useState<number | null>(null);
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

    const [locations, setLocations] = useState<LocationsListModel[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsListModel[]>([]);
    const [plans, setPlans] = useState<PlansListModel[]>([]);

    useEffect(() => {
        if (showLocationModal) loadLocations();
    }, [showLocationModal]);

    useEffect(() => {
        if (showPaymentMethodModal) loadPaymentMethods();
    }, [showPaymentMethodModal]);

    useEffect(() => {
        if (showPlanModal) loadPlans();
    }, [showPlanModal]);

    const loadLocations = async () => {
        try {
            const data = await locationsService.getLocations();
            setLocations(data);
        } catch (error) {
            console.error("Failed to load locations", error);
        }
    };

    const loadPaymentMethods = async () => {
        try {
            const data = await paymentMethodsService.getPaymentMethods();
            setPaymentMethods(data);
        } catch (error) {
            console.error("Failed to load payment methods", error);
        }
    };

    const loadPlans = async () => {
        try {
            const data = await planService.getPlans();
            setPlans(data);
        } catch (error) {
            console.error("Failed to load plans", error);
        }
    };

    const handleAddLocation = async () => {
        if (!locationName.trim()) {
            present({
                message: "Location name cannot be empty",
                duration: 2000,
                color: "warning"
            });
            return;
        }

        try {
            if (editingLocationId) {
                await locationsService.updateLocation(editingLocationId, locationName);
                present({
                    message: "Location updated successfully",
                    duration: 2000,
                    color: "success"
                });
                setEditingLocationId(null);
            } else {
                await locationsService.addLocation(locationName);
                present({
                    message: "Location added successfully",
                    duration: 2000,
                    color: "success"
                });
            }
            setLocationName("");
            await loadLocations();
        } catch (error) {
            console.error(error);
            present({
                message: editingLocationId ? "Failed to update location" : "Failed to add location",
                duration: 2000,
                color: "danger"
            });
        }
    };

    const handleEditLocation = (location: LocationsListModel) => {
        setLocationName(location.Location);
        setEditingLocationId(location.Id);
    };

    const handleDeleteLocation = async (locationId: number) => {
        try {
            await locationsService.deleteLocation(locationId);
            present({
                message: "Location deleted successfully",
                duration: 2000,
                color: "success"
            });
            await loadLocations();
        } catch (error) {
            console.error(error);
            present({
                message: "Failed to delete location",
                duration: 2000,
                color: "danger"
            });
        }
    };

    const handleAddPaymentMethod = async () => {
        if (!paymentMethodName.trim()) {
            present({
                message: "Payment method name cannot be empty",
                duration: 2000,
                color: "warning"
            });
            return;
        }

        try {
            if (editingPaymentMethodId) {
                await paymentMethodsService.updatePaymentMethod(editingPaymentMethodId, paymentMethodName);
                present({
                    message: "Payment method updated successfully",
                    duration: 2000,
                    color: "success"
                });
                setEditingPaymentMethodId(null);
            } else {
                await paymentMethodsService.addPaymentMethod(paymentMethodName);
                present({
                    message: "Payment method added successfully",
                    duration: 2000,
                    color: "success"
                });
            }
            setPaymentMethodName("");
            await loadPaymentMethods();
        } catch (error) {
            console.error(error);
            present({
                message: editingPaymentMethodId ? "Failed to update payment method" : "Failed to add payment method",
                duration: 2000,
                color: "danger"
            });
        }
    };

    const handleEditPaymentMethod = (paymentMethod: PaymentMethodsListModel) => {
        setPaymentMethodName(paymentMethod.PaymentMethod);
        setEditingPaymentMethodId(paymentMethod.Id);
    };

    const handleDeletePaymentMethod = async (paymentMethodId: number) => {
        try {
            await paymentMethodsService.deletePaymentMethod(paymentMethodId);
            present({
                message: "Payment method deleted successfully",
                duration: 2000,
                color: "success"
            });
            await loadPaymentMethods();
        } catch (error) {
            console.error(error);
            present({
                message: "Failed to delete payment method",
                duration: 2000,
                color: "danger"
            });
        }
    };

    const handleAddPlan = async () => {
        if (!planName.trim()) {
            present({
                message: "Plan name cannot be empty",
                duration: 2000,
                color: "warning"
            });
            return;
        }
        if (planAmount === null || planAmount < 0) {
            present({
                message: "Please enter a valid amount",
                duration: 2000,
                color: "warning"
            });
            return;
        }

        try {
            if (editingPlanId) {
                await planService.updatePlan(editingPlanId, planName, planAmount, planIsActive);
                present({
                    message: "Plan updated successfully",
                    duration: 2000,
                    color: "success"
                });
                setEditingPlanId(null);
            } else {
                await planService.addPlan(planName, planAmount, planIsActive);
                present({
                    message: "Plan added successfully",
                    duration: 2000,
                    color: "success"
                });
            }
            setPlanName("");
            setPlanAmount(null);
            setPlanIsActive(true);
            await loadPlans();
        } catch (error) {
            console.error(error);
            present({
                message: editingPlanId ? "Failed to update plan" : "Failed to add plan",
                duration: 2000,
                color: "danger"
            });
        }
    };

    const handleEditPlan = (plan: PlansListModel) => {
        setPlanName(plan.PlanName);
        setPlanAmount(plan.Amount);
        setPlanIsActive(plan.IsActive);
        setEditingPlanId(plan.Id);
    };

    const handleDeletePlan = async (planId: number) => {
        try {
            await planService.deletePlan(planId);
            present({
                message: "Plan deleted successfully",
                duration: 2000,
                color: "success"
            });
            await loadPlans();
        } catch (error) {
            console.error(error);
            present({
                message: "Failed to delete plan",
                duration: 2000,
                color: "danger"
            });
        }
    };

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
                            <div slot="start" style={{ background: 'rgba(var(--ion-color-primary-rgb), 0.1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <IonIcon icon={moonOutline} color="primary" />
                            </div>
                            <IonLabel style={{ fontWeight: 500 }}>Dark Mode</IonLabel>
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
                            <div slot="start" style={{ background: 'rgba(var(--ion-color-secondary-rgb), 0.1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <IonIcon icon={notificationsOutline} color="secondary" />
                            </div>
                            <IonLabel style={{ fontWeight: 500 }}>Notifications</IonLabel>
                            <IonToggle slot="end" checked={notifications} onIonChange={e => setNotifications(e.detail.checked)} />
                        </IonItem>
                    </IonList>

                    {/* Data Management */}
                    <IonList inset={true} style={{ borderRadius: '16px', marginBottom: '24px' }}>
                        <IonListHeader>
                            <IonLabel style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ion-color-medium)' }}>
                                Data Management
                            </IonLabel>
                        </IonListHeader>
                        <IonItem button onClick={() => setShowLocationModal(true)} detail={true}>
                            <div slot="start" style={{ background: 'rgba(var(--ion-color-tertiary-rgb), 0.1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <IonIcon icon={locationOutline} color="tertiary" />
                            </div>
                            <IonLabel style={{ fontWeight: 500 }}>Locations</IonLabel>
                        </IonItem>
                        <IonItem button onClick={() => setShowPaymentMethodModal(true)} detail={true}>
                            <div slot="start" style={{ background: 'rgba(var(--ion-color-warning-rgb), 0.1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <IonIcon icon={cardOutline} color="warning" />
                            </div>
                            <IonLabel style={{ fontWeight: 500 }}>Payment Methods</IonLabel>
                        </IonItem>
                        <IonItem button onClick={() => setShowPlanModal(true)} detail={true}>
                            <div slot="start" style={{ background: 'rgba(var(--ion-color-danger-rgb), 0.1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <IonIcon icon={pricetagOutline} color="danger" />
                            </div>
                            <IonLabel style={{ fontWeight: 500 }}>Plans</IonLabel>
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
                            <div slot="start" style={{ background: 'rgba(var(--ion-color-warning-rgb), 0.1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <IonIcon icon={helpCircleOutline} color="warning" />
                            </div>
                            <IonLabel style={{ fontWeight: 500 }}>Help Center</IonLabel>
                        </IonItem>
                        <IonItem button detail={true}>
                            <div slot="start" style={{ background: 'rgba(var(--ion-color-medium-rgb), 0.1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <IonIcon icon={documentTextOutline} color="medium" />
                            </div>
                            <IonLabel style={{ fontWeight: 500 }}>Terms of Service</IonLabel>
                        </IonItem>
                         <IonItem button detail={true} lines="none">
                            <div slot="start" style={{ background: 'rgba(var(--ion-color-medium-rgb), 0.1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <IonIcon icon={shieldCheckmarkOutline} color="medium" />
                            </div>
                            <IonLabel style={{ fontWeight: 500 }}>Privacy Policy</IonLabel>
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

                    {/* Modals */}
                    <IonModal isOpen={showLocationModal} onDidDismiss={() => setShowLocationModal(false)}>
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle style={{ fontWeight: '600' }}>Manage Locations</IonTitle>
                                <IonButtons slot="end">
                                    <IonButton onClick={() => setShowLocationModal(false)} style={{ fontWeight: '600' }}>Close</IonButton>
                                </IonButtons>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent className="ion-padding">
                            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <div style={{ marginBottom: '32px' }}>
                                    <IonInput
                                        label="Location Name"
                                        labelPlacement="floating"
                                        placeholder="Enter location name"
                                        fill="solid"
                                        value={locationName}
                                        onIonInput={e => setLocationName(e.detail.value!)}
                                        style={{ 
                                            '--highlight-color-focused': 'var(--ion-color-tertiary)'
                                        }}
                                    />
                                    <IonButton 
                                        expand="block" 
                                        onClick={handleAddLocation}
                                        style={{ 
                                            '--border-radius': '14px',
                                            'marginTop': '20px',
                                            'height': '52px',
                                            'fontWeight': '700',
                                            'fontSize': '1.05rem',
                                  
                                        }}
                                    >
                                        <IonIcon icon={locationOutline} slot="start" />
                                        {editingLocationId ? 'Update Location' : 'Save Location'}
                                    </IonButton>
                                </div>

                                <IonListHeader style={{ paddingLeft: '4px', paddingBottom: '12px' }}>
                                    <IonLabel style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--ion-color-dark)' }}>Existing Locations</IonLabel>
                                </IonListHeader>
                                <IonList inset={true} style={{ borderRadius: '16px', marginBottom: '20px' }}>
                                    {locations.map((loc, index) => (
                                        <IonItem key={index} lines={index === locations.length - 1 ? "none" : "full"} style={{ '--padding-top': '12px', '--padding-bottom': '12px' }}>
                                            <div slot="start" style={{ 
                                                background: 'linear-gradient(135deg, rgba(var(--ion-color-tertiary-rgb), 0.15), rgba(var(--ion-color-tertiary-rgb), 0.25))', 
                                                padding: '8px', 
                                                borderRadius: '10px', 
                                                display: 'flex' 
                                            }}>
                                                <IonIcon icon={locationOutline} color="tertiary" style={{ fontSize: '18px' }} />
                                            </div>
                                            <IonLabel style={{ fontWeight: '600', fontSize: '1rem', marginLeft: '12px' }}>{loc.Location}</IonLabel>
                                            <IonButton 
                                                slot="end" 
                                                fill="clear" 
                                                color="primary" 
                                                onClick={() => handleEditLocation(loc)}
                                                style={{ '--padding-start': '8px', '--padding-end': '8px' }}
                                            >
                                                <IonIcon icon={createOutline} slot="icon-only" />
                                            </IonButton>
                                            <IonButton 
                                                slot="end" 
                                                fill="clear" 
                                                color="danger" 
                                                onClick={() => handleDeleteLocation(loc.Id)}
                                                style={{ '--padding-start': '8px', '--padding-end': '8px' }}
                                            >
                                                <IonIcon icon={trashOutline} slot="icon-only" />
                                            </IonButton>
                                        </IonItem>
                                    ))}
                                    {locations.length === 0 && (
                                        <IonItem lines="none">
                                            <IonLabel color="medium" style={{ textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>No locations found</IonLabel>
                                        </IonItem>
                                    )}
                                </IonList>
                            </div>
                        </IonContent>
                    </IonModal>

                    <IonModal isOpen={showPaymentMethodModal} onDidDismiss={() => setShowPaymentMethodModal(false)}>
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle style={{ fontWeight: '600' }}>Manage Payment Methods</IonTitle>
                                <IonButtons slot="end">
                                    <IonButton onClick={() => setShowPaymentMethodModal(false)} style={{ fontWeight: '600' }}>Close</IonButton>
                                </IonButtons>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent className="ion-padding">
                            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <div style={{ marginBottom: '32px' }}>
                                    <IonInput
                                        label="Payment Method"
                                        labelPlacement="floating"
                                        placeholder="Enter payment method name"
                                        fill="solid"
                                        value={paymentMethodName}
                                        onIonInput={e => setPaymentMethodName(e.detail.value!)}
                                        style={{ 
                                            '--highlight-color-focused': 'var(--ion-color-warning)'
                                        }}
                                    />
                                    <IonButton 
                                        expand="block" 
                                        onClick={handleAddPaymentMethod}
                                        style={{ 
                                            '--border-radius': '14px',
                                            'marginTop': '20px',
                                            'height': '52px',
                                            'fontWeight': '700',
                                            'fontSize': '1.05rem',
                                        }}
                                    >
                                        <IonIcon icon={cardOutline} slot="start" />
                                        {editingPaymentMethodId ? 'Update Payment Method' : 'Save Payment Method'}
                                    </IonButton>
                                </div>

                                <IonListHeader style={{ paddingLeft: '4px', paddingBottom: '12px' }}>
                                    <IonLabel style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--ion-color-dark)' }}>Existing Payment Methods</IonLabel>
                                </IonListHeader>
                                <IonList inset={true} style={{ borderRadius: '16px', marginBottom: '20px' }}>
                                    {paymentMethods.map((pm, index) => (
                                        <IonItem key={index} lines={index === paymentMethods.length - 1 ? "none" : "full"} style={{ '--padding-top': '12px', '--padding-bottom': '12px' }}>
                                            <div slot="start" style={{ 
                                                background: 'linear-gradient(135deg, rgba(var(--ion-color-warning-rgb), 0.15), rgba(var(--ion-color-warning-rgb), 0.25))', 
                                                padding: '8px', 
                                                borderRadius: '10px', 
                                                display: 'flex' 
                                            }}>
                                                <IonIcon icon={cardOutline} color="warning" style={{ fontSize: '18px' }} />
                                            </div>
                                            <IonLabel style={{ fontWeight: '600', fontSize: '1rem', marginLeft: '12px' }}>{pm.PaymentMethod}</IonLabel>
                                            <IonButton 
                                                slot="end" 
                                                fill="clear" 
                                                color="primary" 
                                                onClick={() => handleEditPaymentMethod(pm)}
                                                style={{ '--padding-start': '8px', '--padding-end': '8px' }}
                                            >
                                                <IonIcon icon={createOutline} slot="icon-only" />
                                            </IonButton>
                                            <IonButton 
                                                slot="end" 
                                                fill="clear" 
                                                color="danger" 
                                                onClick={() => handleDeletePaymentMethod(pm.Id)}
                                                style={{ '--padding-start': '8px', '--padding-end': '8px' }}
                                            >
                                                <IonIcon icon={trashOutline} slot="icon-only" />
                                            </IonButton>
                                        </IonItem>
                                    ))}
                                    {paymentMethods.length === 0 && (
                                        <IonItem lines="none">
                                            <IonLabel color="medium" style={{ textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>No payment methods found</IonLabel>
                                        </IonItem>
                                    )}
                                </IonList>
                            </div>
                        </IonContent>
                    </IonModal>

                    <IonModal isOpen={showPlanModal} onDidDismiss={() => setShowPlanModal(false)}>
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle style={{ fontWeight: '600' }}>Manage Plans</IonTitle>
                                <IonButtons slot="end">
                                    <IonButton onClick={() => setShowPlanModal(false)} style={{ fontWeight: '600' }}>Close</IonButton>
                                </IonButtons>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent className="ion-padding">
                            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <div style={{ marginBottom: '32px' }}>
                                    <IonInput
                                        label="Plan Name"
                                        labelPlacement="floating"
                                        placeholder="Enter plan name"
                                        fill="solid"
                                        value={planName}
                                        onIonInput={e => setPlanName(e.detail.value!)}
                                        style={{  
                                            '--highlight-color-focused': 'var(--ion-color-danger)'
                                        }}
                                    />
                                    <IonInput
                                        label="Amount (₱)"
                                        labelPlacement="floating"
                                        type="number"
                                        placeholder="0.00"
                                        fill="solid"
                                        value={planAmount}
                                        onIonInput={e => setPlanAmount(parseFloat(e.detail.value!) || null)}
                                        style={{ 
                                            '--highlight-color-focused': 'var(--ion-color-danger)'
                                        }}
                                    />
                                    <div style={{ 
                                        background: 'var(--ion-color-light)', 
                                        padding: '18px 20px',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '20px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}>
                                        <IonLabel style={{ fontWeight: '600', fontSize: '1rem', margin: 0 }}>Active Status</IonLabel>
                                        <IonToggle 
                                            checked={planIsActive} 
                                            onIonChange={e => setPlanIsActive(e.detail.checked)} 
                                        />
                                    </div>
                                    <IonButton 
                                        expand="block" 
                                        onClick={handleAddPlan}
                                        style={{ 
                                            '--border-radius': '14px',
                                            'marginTop': '4px',
                                            'height': '52px',
                                            'fontWeight': '700',
                                            'fontSize': '1.05rem',
                                        }}
                                    >
                                        <IonIcon icon={pricetagOutline} slot="start" />
                                        {editingPlanId ? 'Update Plan' : 'Save Plan'}
                                    </IonButton>
                                </div>

                                <IonListHeader style={{ paddingLeft: '4px', paddingBottom: '12px' }}>
                                    <IonLabel style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--ion-color-dark)' }}>Active Plans</IonLabel>
                                </IonListHeader>
                                <IonList inset={true} style={{ borderRadius: '16px', marginBottom: '24px' }}>
                                    {plans.filter(p => p.IsActive).map((plan, index, arr) => (
                                        <IonItem key={index} lines={index === arr.length - 1 ? "none" : "full"} style={{ '--padding-top': '14px', '--padding-bottom': '14px' }}>
                                            <div slot="start" style={{ 
                                                background: 'linear-gradient(135deg, rgba(var(--ion-color-success-rgb), 0.15), rgba(var(--ion-color-success-rgb), 0.25))', 
                                                padding: '8px', 
                                                borderRadius: '10px', 
                                                display: 'flex' 
                                            }}>
                                                <IonIcon icon={shieldCheckmarkOutline} color="success" style={{ fontSize: '18px' }} />
                                            </div>
                                            <IonLabel style={{ marginLeft: '12px' }}>
                                                <h2 style={{ fontWeight: '700', fontSize: '1.05rem', margin: '0 0 4px 0' }}>{plan.PlanName}</h2>
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ion-color-success)', fontWeight: '600' }}>₱{plan.Amount.toFixed(2)}</p>
                                            </IonLabel>
                                            <IonButton 
                                                slot="end" 
                                                fill="clear" 
                                                color="primary" 
                                                onClick={() => handleEditPlan(plan)}
                                                style={{ '--padding-start': '8px', '--padding-end': '8px' }}
                                            >
                                                <IonIcon icon={createOutline} slot="icon-only" />
                                            </IonButton>
                                            <IonButton 
                                                slot="end" 
                                                fill="clear" 
                                                color="danger" 
                                                onClick={() => handleDeletePlan(plan.Id)}
                                                style={{ '--padding-start': '8px', '--padding-end': '8px' }}
                                            >
                                                <IonIcon icon={trashOutline} slot="icon-only" />
                                            </IonButton>
                                        </IonItem>
                                    ))}
                                    {plans.filter(p => p.IsActive).length === 0 && (
                                        <IonItem lines="none">
                                            <IonLabel color="medium" style={{ textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>No active plans found</IonLabel>
                                        </IonItem>
                                    )}
                                </IonList>

                                <IonListHeader style={{ paddingLeft: '4px', paddingBottom: '12px' }}>
                                    <IonLabel style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--ion-color-medium)' }}>Inactive Plans</IonLabel>
                                </IonListHeader>
                                <IonList inset={true} style={{ borderRadius: '16px', marginBottom: '20px' }}>
                                    {plans.filter(p => !p.IsActive).map((plan, index, arr) => (
                                        <IonItem key={index} lines={index === arr.length - 1 ? "none" : "full"} style={{ '--padding-top': '14px', '--padding-bottom': '14px' }}>
                                            <div slot="start" style={{ 
                                                background: 'var(--ion-color-light)', 
                                                padding: '8px', 
                                                borderRadius: '10px', 
                                                display: 'flex' 
                                            }}>
                                                <IonIcon icon={pricetagOutline} color="medium" style={{ fontSize: '18px' }} />
                                            </div>
                                            <IonLabel style={{ marginLeft: '12px' }}>
                                                <h2 style={{ fontWeight: '600', fontSize: '1.05rem', margin: '0 0 4px 0', color: 'var(--ion-color-medium)' }}>{plan.PlanName}</h2>
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ion-color-medium)', fontWeight: '500' }}>₱{plan.Amount.toFixed(2)}</p>
                                            </IonLabel>
                                            <IonButton 
                                                slot="end" 
                                                fill="clear" 
                                                color="primary" 
                                                onClick={() => handleEditPlan(plan)}
                                                style={{ '--padding-start': '8px', '--padding-end': '8px' }}
                                            >
                                                <IonIcon icon={createOutline} slot="icon-only" />
                                            </IonButton>
                                            <IonButton 
                                                slot="end" 
                                                fill="clear" 
                                                color="danger" 
                                                onClick={() => handleDeletePlan(plan.Id)}
                                                style={{ '--padding-start': '8px', '--padding-end': '8px' }}
                                            >
                                                <IonIcon icon={trashOutline} slot="icon-only" />
                                            </IonButton>
                                        </IonItem>
                                    ))}
                                    {plans.filter(p => !p.IsActive).length === 0 && (
                                        <IonItem lines="none">
                                            <IonLabel color="medium" style={{ textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>No inactive plans found</IonLabel>
                                        </IonItem>
                                    )}
                                </IonList>
                            </div>
                        </IonContent>
                    </IonModal>

				</div>
			</IonContent>
		</IonPage>
	);
};

export default ConfigPage;
