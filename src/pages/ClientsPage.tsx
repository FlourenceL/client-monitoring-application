import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader
  , IonCardTitle, IonCardContent, IonButton, IonIcon, IonSearchbar, IonGrid, IonRow, IonCol, IonBadge, IonSegment, IonSegmentButton, IonLabel,
  IonModal, IonButtons, IonInput, IonFooter, useIonToast, IonSelect, IonSelectOption,
  IonFab, IonFabButton, IonText, IonAvatar
 } from '@ionic/react';
import { add, wallet, searchOutline, filter, person, calendar, card } from 'ionicons/icons';
import clientService from '../services/Clients.service';
import planService from '../services/Plans.service';
import collectionService from '../services/Collections.service';
import locationsService from '../services/Locations.service';

const ClientsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('active');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<any>(null); // For details modal
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    amount: '',
    dueDate: '',
    status: 'pending', 
    planId: null as number | null,
    locationId: null as number | null
  });

  const [presentToast] = useIonToast();

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const loadClients = async () => {
    try {
      const res = await clientService.getClients();
      const plansData = await planService.getPlans();
      const locationsData = await locationsService.getLocations();
      
      // Convert selectedMonth (YYYY-MM) to BillingMonth (MM/YYYY)
      const [year, month] = selectedMonth.split('-');
      const billingMonth = `${month}/${year}`;
      
      const collectionsRes = await collectionService.getCollectionsByMonth(billingMonth);
      const collections = collectionsRes as any[];
      
      // Map DB result to UI model
      const mapped = (res as any[]).map((c: any) => {
        const clientPlan = (plansData as any[]).find(p => p.Id === c.PlanId);
        const clientLocation = (locationsData as any[]).find(l => l.Id === c.LocationId);
        
        // Determine Billing Status
        const clientCollection = collections.find(col => col.ClientId === (c.Id || c.id));
        let billingStatus = 'Pending';
        
        if (clientCollection) {
             if (clientCollection.AmountPaid >= clientCollection.AmountDue) {
                 billingStatus = 'Paid';
             } else {
                 // Check for Overdue
                 const now = new Date();
                 const collectionMonthDate = new Date(`${year}-${month}-01`);
                 const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
                 
                 // If collection month is strictly before current month, and not paid -> Overdue
                 if (collectionMonthDate < currentMonthDate) {
                     billingStatus = 'Overdue';
                 }
             }
        } else {
             // No collection record found for this month
             // If selected month is past, it's technically overdue or no-bill. 
             // But if it's future, it's just N/A or Pending.
             // If it's current month, it might be Pending generation (but we generate on load).
             // Let's assume Status 'Pending' if active, but maybe indicate 'No Bill'?
             // User asked "if not paid, status will be either pending or overdue".
             // I'll stick to Pending/Overdue logic based on date if record missing (fallback), 
             // but `generateMonthlyTransactions` ensures record exists for active clients for CURRENT month.
             // For past months, if no record, maybe they weren't active?
             
             const now = new Date();
             const collectionMonthDate = new Date(`${year}-${month}-01`);
             const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

             if (collectionMonthDate < currentMonthDate) {
                billingStatus = 'Overdue'; // Or 'No Record'
             }
        }

        return {
          id: c.Id || c.id,
          name: c.Client,
          email: c.ContactInfo.split(' | ')[0],
          phone: c.ContactInfo.split(' | ')[1] || '',
          dueDate: c.DateInstalled ? new Date(c.DateInstalled).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
          amount: clientPlan ? clientPlan.Amount : 0,
          status: billingStatus,
          subscriptionStatus: c.IsActive ? 'Active' : 'Inactive',
          planId: c.PlanId,
          location: clientLocation ? clientLocation.Location : ''
        };
      });
      setClientsList(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await planService.getPlans();
      setPlans(res as any[]);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLocations = async () => {
    try {
      const res = await locationsService.getLocations();
      setLocations(res as any[]);
    } catch (e) {
      console.error(e);
    }
  };

  const getPaidClients = async () => {
    try {
      const res = await clientService.getPaidClients();
      console.log(`paid clients ${res}`)
    } catch (error) {
      console.error('Error fetching paid clients:', error);
    }
  }

  useEffect(() => {
    loadClients();
    loadPlans();
    loadLocations();
    getPaidClients();
  }, [selectedMonth]);

  const handleSaveClient = async () => {
    // Validate required fields
    if (!formData.clientName || formData.clientName.trim() === '') {
      presentToast({ message: 'Client name is required', duration: 2000, color: 'warning' });
      return;
    }

    if (!formData.planId) {
      presentToast({ message: 'Please select an internet plan', duration: 2000, color: 'warning' });
      return;
    }

    if (!formData.locationId) {
      presentToast({ message: 'Please select a location', duration: 2000, color: 'warning' });
      return;
    }

    try {
      const response = await clientService.addClient({
        Client: formData.clientName,
        ContactInfo: `${formData.email} | ${formData.phone}`,
        DateInstalled: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date().toISOString(),
        PlanId: formData.planId,
        UserId: 1, // Default user
        IsActive: true,
        LocationId: formData.locationId
      });

      if (response.success) {
        presentToast({ message: 'Client added successfully', duration: 2000, color: 'success' });  
        setIsOpen(false);
        loadClients();
        
        // Reset form
        setFormData({
          clientName: '',
          email: '',
          phone: '',
          amount: '',
          dueDate: '',
          status: 'pending',
          planId: null,
          locationId: null
        });
      } else {
        presentToast({ message: response.message || 'Failed to add client', duration: 2000, color: 'danger' });
      }
    } catch (error) {
      presentToast({ message: `An error occurred: ${error}`, duration: 2000, color: 'danger' });  
    }
  }

  // Calculate total revenue and paid clients count
  const activeClientsCount = clientsList.filter(c => c.subscriptionStatus === 'Active').length;
  const inactiveClientsCount = clientsList.filter(c => c.subscriptionStatus === 'Inactive').length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Client Manager</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding-bottom">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Clients</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className='ion-padding' style={{ paddingBottom: '80px' }}>
          
          {/* Summary Cards */}
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Active Clients Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-tertiary))', 
              borderRadius: '24px', 
              padding: '20px', 
              color: 'white',
              boxShadow: '0 10px 20px -5px rgba(0, 180, 216, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
                <IonText color="light">
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.8rem', fontWeight: 500 }}>Active Clients</p>
                </IonText>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{activeClientsCount}</h1>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '8px', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <IonIcon icon={person} style={{ fontSize: '20px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Inactive Clients Card */}
            <div style={{ 
              background: 'var(--ion-card-background)', 
              borderRadius: '24px', 
              padding: '20px', 
              border: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
                <IonText color="medium">
                  <p style={{ margin: 0, opacity: 0.8, fontSize: '0.8rem', fontWeight: 600 }}>Inactive Clients</p>
                </IonText>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--ion-text-color)' }}>{inactiveClientsCount}</h1>
                  <div style={{ 
                    background: 'var(--ion-color-step-100, rgba(0,0,0,0.05))', 
                    padding: '8px', 
                    borderRadius: '12px'
                  }}>
                    <IonIcon icon={person} style={{ fontSize: '20px', color: 'var(--ion-color-medium)' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Location and Status Filter */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '10px' }}>
             {/* Status Filter */}
             <div style={{
              background: 'var(--ion-card-background)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px'
            }}>
              <IonIcon icon={filter} style={{ marginLeft: '12px', color: 'var(--ion-color-medium)' }} />
              <IonSelect
                interface="popover"
                value={subscriptionFilter}
                onIonChange={e => setSubscriptionFilter(e.detail.value)}
                style={{
                  '--padding-start': '12px',
                  '--padding-end': '16px',
                  '--padding-top': '12px',
                  '--padding-bottom': '12px',
                  minWidth: '130px'
                }}
              >
                <IonSelectOption value="all">All Status</IonSelectOption>
                <IonSelectOption value="active">Active</IonSelectOption>
                <IonSelectOption value="inactive">Inactive</IonSelectOption>
              </IonSelect>
            </div>

            {/* Location Filter */}
            <div style={{
              background: 'var(--ion-card-background)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px'
            }}>
              <IonIcon icon={filter} style={{ marginLeft: '12px', color: 'var(--ion-color-medium)' }} />
              <IonSelect
                interface="popover"
                value={selectedLocation}
                onIonChange={e => setSelectedLocation(e.detail.value)}
                style={{
                  '--padding-start': '12px',
                  '--padding-end': '16px',
                  '--padding-top': '12px',
                  '--padding-bottom': '12px',
                  minWidth: '150px'
                }}
              >
                <IonSelectOption value="all">All Locations</IonSelectOption>
                {locations.map(loc => (
                  <IonSelectOption key={loc.Id} value={loc.Location}>
                    {loc.Location}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>

          {/* Client List Table */}
          <section>
            <div style={{ 
              background: 'var(--ion-card-background)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>

              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '3fr 1fr',
                gap: '16px',
                padding: '18px 20px',
                backgroundColor: 'var(--ion-color-step-50, rgba(0,0,0,0.02))',
                borderBottom: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
                fontWeight: '600',
                fontSize: '12px',
                color: 'var(--ion-color-medium)',
                textTransform: 'uppercase',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <div style={{ fontWeight: '700' }}>Client</div>
                <div style={{ fontWeight: '700' }}>Date Installed</div>
              </div>

              {/* Table Body */}
              <div style={{ 
                flex: 1
              }}>
                {clientsList
                  .filter(client => {
                    const matchesTab = selectedTab === 'all' || (client.status && client.status.toLowerCase() === selectedTab);
                    const matchesSub = subscriptionFilter === 'all' || (client.subscriptionStatus && client.subscriptionStatus.toLowerCase() === subscriptionFilter);
                    const matchesLocation = selectedLocation === 'all' || (client.location === selectedLocation);
                    return matchesTab && matchesSub && matchesLocation;
                  })
                  .length > 0 ? (
                  clientsList
                    .filter(client => {
                      const matchesTab = selectedTab === 'all' || (client.status && client.status.toLowerCase() === selectedTab);
                      const matchesSub = subscriptionFilter === 'all' || (client.subscriptionStatus && client.subscriptionStatus.toLowerCase() === subscriptionFilter);
                      const matchesLocation = selectedLocation === 'all' || (client.location === selectedLocation);
                      return matchesTab && matchesSub && matchesLocation;
                    })
                    .map((client, index) => (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setIsDetailsOpen(true);
                      }}
                      style={{
                        padding: '18px 20px',
                        display: 'grid',
                        gridTemplateColumns: '3fr 1fr',
                        gap: '16px',
                        alignItems: 'center',
                        borderBottom: index < clientsList.filter(c => {
                          const matchesTab = selectedTab === 'all' || (c.status && c.status.toLowerCase() === selectedTab);
                          const matchesSub = subscriptionFilter === 'all' || (c.subscriptionStatus && c.subscriptionStatus.toLowerCase() === subscriptionFilter);
                          const matchesLocation = selectedLocation === 'all' || (c.location === selectedLocation);
                          return matchesTab && matchesSub && matchesLocation;
                        }).length - 1 ? '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))' : 'none',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ion-color-step-50, rgba(0,0,0,0.02))'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                        <div style={{ 
                          width: '48px', height: '48px', borderRadius: '14px',
                          background: `hsl(${client.id * 50}, 85%, 95%)`, 
                          color: `hsl(${client.id * 50}, 70%, 40%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: '700', fontSize: '19px',
                          border: `2px solid hsl(${client.id * 50}, 85%, 90%)`,
                          flexShrink: 0
                        }}>
                          {client.name.charAt(0)}
                        </div>
                        <div style={{ overflow: 'hidden', minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ion-text-color)' }}>{client.name}</div>
                          <div style={{ fontSize: '13px', color: 'var(--ion-color-medium)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>{client.email || 'No email'}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: '14px', color: 'var(--ion-color-step-600, #666)', fontWeight: 500 }}>
                        {client.dueDate}
                      </div>

                      {/* <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '16px', color: 'var(--ion-text-color)' }}>
                        ${client.amount.toLocaleString()}
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <IonBadge color={
                          client.status.toLowerCase() === 'paid' ? 'success' :
                          client.status.toLowerCase() === 'pending' ? 'warning' : 'danger'
                        }
                        style={{ borderRadius: '8px', padding: '6px 12px', fontWeight: '600', fontSize: '12px' }}
                        >
                          {client.status}
                        </IonBadge>
                      </div> */}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ion-color-medium)' }}>
                    <IonIcon icon={person} style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.2 }} />
                    <p>No clients found.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Floating Action Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '20px', marginRight: '10px' }}>
          <IonFabButton onClick={() => setIsOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        
        {/* Add Client Modal */}
        <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add New Client</IonTitle>
             
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '10px' }}>
              
              <div style={{ 
                padding: '16px', 
                background: 'rgba(var(--ion-color-primary-rgb), 0.05)', 
                borderRadius: '12px',
                fontSize: '14px',
                color: 'var(--ion-color-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(var(--ion-color-primary-rgb), 0.1)'
              }}>
                <IonIcon icon={person} color="primary" />
                <span>Fields marked with <span style={{ color: 'var(--ion-color-danger)', fontWeight: 'bold' }}>*</span> are required</span>
              </div>

              {/* Client Details Section */}
              <section>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', color: 'var(--ion-color-medium)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={person} />
                  Client Information
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <IonInput 
                    label="Client Name *" 
                    labelPlacement="floating" 
                    fill="outline" 
                    mode="md"
                    placeholder="e.g. Acme Corp" 
                    value={formData.clientName} 
                    onIonInput={e => handleInputChange('clientName', e.detail.value!)}
                    required
                    style={{ '--border-radius': '12px' }}
                  ></IonInput>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <IonInput 
                      label="Email Address" 
                      type="email" 
                      labelPlacement="floating" 
                      fill="outline" 
                      mode="md"
                      placeholder="contact@acme.com" 
                      value={formData.email} 
                      onIonInput={e => handleInputChange('email', e.detail.value!)}
                      style={{ '--border-radius': '12px' }}
                    ></IonInput>
                    <IonInput 
                      label="Phone Number" 
                      type="tel" 
                      labelPlacement="floating" 
                      fill="outline" 
                      mode="md"
                      placeholder="+1 (555)..." 
                      value={formData.phone} 
                      onIonInput={e => handleInputChange('phone', e.detail.value!)}
                      style={{ '--border-radius': '12px' }}
                    ></IonInput>
                  
                  <IonSelect 
                    label="Location *" 
                    labelPlacement="floating" 
                    fill="outline" 
                    mode="md"
                    value={formData.locationId} 
                    style={{ '--border-radius': '12px' }}
                    interface="action-sheet"
                    onIonChange={e => handleInputChange('locationId', e.detail.value)}
                  >
                    {locations.map(loc => (
                      <IonSelectOption key={loc.Id} value={loc.Id}>
                        {loc.Location}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                  </div>
                </div>
              </section>

              <div style={{ height: '1px', background: 'var(--ion-color-step-100, #f0f0f0)' }}></div>

              {/* Billing Details Section */}
              <section>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', color: 'var(--ion-color-medium)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={card} />
                  Subscription Plan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <IonSelect 
                    label="Internet Plan *" 
                    labelPlacement="floating" 
                    fill="outline" 
                    mode="md"
                    value={formData.planId} 
                    
                    style={{ '--border-radius': '12px', '--color': 'white', '--placeholder-color': 'white', '--placeholder-opacity': '0.8' }}
                    interface="action-sheet"
                    onIonChange={e => {
                      const selectedPlanId = e.detail.value;
                      const selectedPlan = plans.find(p => p.Id === selectedPlanId);
                      handleInputChange('planId', selectedPlanId);
                      if (selectedPlan) {
                        handleInputChange('amount', selectedPlan.Amount);
                      }
                    }}
                  >
                    {plans.map(plan => (
                      <IonSelectOption key={plan.Id} value={plan.Id}>
                        {plan.PlanName} (${plan.Amount})
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <IonInput 
                      label="Amount ($)" 
                      type="number" 
                      labelPlacement="floating" 
                      fill="outline" 
                      mode="md"
                      placeholder="0.00" 
                      value={formData.amount} 
                      onIonInput={e => handleInputChange('amount', e.detail.value!)}
                      style={{ '--border-radius': '12px' }}
                    ></IonInput>
                    <IonInput 
                      label="Date Installed" 
                      type="date" 
                      labelPlacement="floating" 
                      fill="outline" 
                      mode="md"
                      value={formData.dueDate} 
                      onIonChange={e => handleInputChange('dueDate', e.detail.value!)}
                      style={{ '--border-radius': '12px' }}
                    ></IonInput>
                  </div>
                </div>
              </section>

            </div>
          </IonContent>
          <IonFooter className="ion-no-border">
            <div className="ion-padding" style={{ display: 'flex', gap: '12px', paddingTop: '0' }}>
              <IonButton 
                expand="block" 
                fill="outline" 
                color="medium" 
                style={{ flex: 1, '--border-radius': '12px', height: '50px' }} 
                onClick={() => {
                  setIsOpen(false);
                  setFormData({
                    clientName: '',
                    email: '',
                    phone: '',
                    amount: '',
                    dueDate: '',
                    status: 'pending', 
                    planId: null,
                    locationId: null
                  });
                }}
              >
                Cancel
              </IonButton>
              <IonButton 
                expand="block" 
                color="primary" 
                style={{ flex: 1, '--border-radius': '12px', height: '50px', '--box-shadow': '0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3)' }} 
                onClick={handleSaveClient}
              >
                Save Client
              </IonButton>
            </div>
          </IonFooter>
        </IonModal>

        {/* Client Details Modal */}
        <IonModal isOpen={isDetailsOpen} onDidDismiss={() => setIsDetailsOpen(false)} initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.75]}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Client Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsDetailsOpen(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedClient && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <div style={{ 
                      width: '60px', height: '60px', borderRadius: '15px',
                      background: `hsl(${selectedClient.id * 60}, 70%, 90%)`, color: `hsl(${selectedClient.id * 60}, 70%, 30%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 'bold', fontSize: '24px'
                    }}>
                      {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontWeight: 'bold' }}>{selectedClient.name}</h2>
                    <IonBadge color={
                        selectedClient.status.toLowerCase() === 'paid' ? 'success' :
                        selectedClient.status.toLowerCase() === 'pending' ? 'warning' : 'danger'
                    } style={{ marginTop: '5px' }}>
                        {selectedClient.status}
                    </IonBadge>
                  </div>
                </div>

                <IonCard style={{ margin: 0, boxShadow: 'none', border: '1px solid #eee' }}>
                  <IonCardContent>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Email</div>
                        <div style={{ fontWeight: '500' }}>{selectedClient.email || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Phone</div>
                        <div style={{ fontWeight: '500' }}>{selectedClient.phone || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Date Installed</div>
                        <div style={{ fontWeight: '500' }}>{selectedClient.dueDate}</div>
                      </div>
                       <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Plan</div>
                        <div style={{ fontWeight: '500' }}>
                           {plans.find(p => p.Id === selectedClient.planId)?.PlanName || 'Unknown Plan'}
                        </div>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
                
                <IonButton expand="block" fill="outline" color="primary">
                  View Full History
                </IonButton>
                <IonButton expand="block" color="primary">
                  Edit Client
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>
   
      </IonContent>
    </IonPage>
  );
};

export default ClientsPage;
