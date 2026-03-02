import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader
  , IonCardTitle, IonCardContent, IonButton, IonIcon, IonSearchbar, IonGrid, IonRow, IonCol, IonBadge, IonSegment, IonSegmentButton, IonLabel,
  IonModal, IonButtons, IonInput, IonFooter, useIonToast, IonSelect, IonSelectOption,
  IonFab, IonFabButton, IonText, IonAvatar, IonList, IonItem, IonNote
 } from '@ionic/react';
import { add, wallet, searchOutline, filter, person, calendar, card, mail, call, location, createOutline, documentText, wifi } from 'ionicons/icons';
import clientService from '../services/Clients.service';
import planService from '../services/Plans.service';
import collectionService from '../services/Collections.service';
import locationsService from '../services/Locations.service';

const ClientsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('active');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [searchText, setSearchText] = useState<string>('');
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
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontWeight: 800, fontSize: '24px', paddingLeft: '8px' }}>Client Manager</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding-bottom">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" style={{ fontWeight: 800 }}>Clients</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className='ion-padding' style={{ paddingBottom: '90px' }}>
          
          {/* Summary Cards */}
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            {/* Active Clients Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #4361ee, #3a0ca3)', 
              borderRadius: '24px', 
              padding: '24px 20px', 
              color: 'white',
              boxShadow: '0 8px 25px -5px rgba(67, 97, 238, 0.5)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '130px'
            }}>
               <div style={{
                position: 'absolute', top: -20, right: -20, width: 90, height: 90,
                background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ padding: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex' }}>
                       <IonIcon icon={person} style={{ fontSize: '14px' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>Active</span>
                 </div>
                 <h1 style={{ margin: '8px 0 0 0', fontSize: '36px', fontWeight: 800, letterSpacing: '-1px' }}>{activeClientsCount}</h1>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, fontWeight: 500 }}>
                 Currently subscribed
              </div>
            </div>

            {/* Inactive Clients Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #FF9966, #FF5E62)', 
              borderRadius: '24px', 
              padding: '24px 20px', 
              color: 'white',
              boxShadow: '0 8px 25px -5px rgba(255, 94, 98, 0.5)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '130px'
            }}>
               <div style={{
                position: 'absolute', top: -20, right: -20, width: 90, height: 90,
                background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1
              }}></div>

              <div style={{ position: 'relative', zIndex: 2 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ padding: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', color: 'white' }}>
                       <IonIcon icon={person} style={{ fontSize: '14px' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>Inactive</span>
                 </div>
                 <h1 style={{ margin: '8px 0 0 0', fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', color: 'white' }}>{inactiveClientsCount}</h1>
              </div>
               <div style={{ fontSize: '12px', opacity: 0.7, fontWeight: 500 }}>
                 Past or pending
              </div>
            </div>
          </section>


          {/* Search and Filters */}
          <div style={{ marginBottom: '24px' }}>
            <IonSearchbar 
              value={searchText} 
              onIonInput={e => setSearchText(e.detail.value!)} 
              placeholder="Search by name or email" 
              className="custom-searchbar"
              mode="ios"
              style={{ 
                '--background': 'var(--ion-card-background)', 
                '--border-radius': '16px', 
                '--placeholder-color': 'var(--ion-color-medium)',
                '--icon-color': '#4361ee',
                padding: 0, 
                marginBottom: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                height: '48px'
              }}
            ></IonSearchbar>
            
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {/* Status Filter */}
              <div style={{
                background: 'var(--ion-card-background)',
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid var(--ion-color-step-50, rgba(0,0,0,0.05))',
                display: 'flex',
                alignItems: 'center',
                padding: '2px 6px',
                flex: 1,
                minWidth: '140px'
              }}>
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '8px', 
                  background: '#eff3ff', color: '#4361ee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: '6px'
                }}>
                   <IonIcon icon={filter} style={{ fontSize: '14px' }} />
                </div>
                <IonSelect
                  interface="popover"
                  value={subscriptionFilter}
                  onIonChange={e => setSubscriptionFilter(e.detail.value)}
                  style={{
                    '--padding-start': '10px',
                    '--padding-end': '10px',
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: 600
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
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid var(--ion-color-step-50, rgba(0,0,0,0.05))',
                display: 'flex',
                alignItems: 'center',
                padding: '2px 6px',
                flex: 1,
                minWidth: '140px'
              }}>
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '8px', 
                  background: '#fdf2f8', color: '#db2777',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: '6px'
                }}>
                   <IonIcon icon={filter} style={{ fontSize: '14px' }} />
                </div>
                <IonSelect
                  interface="popover"
                  value={selectedLocation}
                  onIonChange={e => setSelectedLocation(e.detail.value)}
                  style={{
                    '--padding-start': '10px',
                    '--padding-end': '10px',
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: 600
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
          </div>

          {/* Client List Table */}
          <section>
            <div style={{ 
              background: 'var(--ion-card-background)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)',
              border: '1px solid var(--ion-color-step-50, rgba(0,0,0,0.05))',
            }}>

              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(200px, 2fr) 1fr',
                gap: '16px',
                padding: '16px 24px',
                borderBottom: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
                background: 'var(--ion-color-step-50, rgba(0,0,0,0.02))'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ion-color-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client Details</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ion-color-medium)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Installed</div>
              </div>

              {/* Table Body */}
              <div style={{ flex: 1 }}>
                {clientsList
                  .filter(client => {
                    const matchesTab = selectedTab === 'all' || (client.status && client.status.toLowerCase() === selectedTab);
                    const matchesSub = subscriptionFilter === 'all' || (client.subscriptionStatus && client.subscriptionStatus.toLowerCase() === subscriptionFilter);
                    const matchesLocation = selectedLocation === 'all' || (client.location === selectedLocation);
                    const matchesSearch = searchText === '' || client.name.toLowerCase().includes(searchText.toLowerCase()) || client.email.toLowerCase().includes(searchText.toLowerCase());
                    return matchesTab && matchesSub && matchesLocation && matchesSearch;
                  })
                  .length > 0 ? (
                  clientsList
                    .filter(client => {
                      const matchesTab = selectedTab === 'all' || (client.status && client.status.toLowerCase() === selectedTab);
                      const matchesSub = subscriptionFilter === 'all' || (client.subscriptionStatus && client.subscriptionStatus.toLowerCase() === subscriptionFilter);
                      const matchesLocation = selectedLocation === 'all' || (client.location === selectedLocation);
                       const matchesSearch = searchText === '' || client.name.toLowerCase().includes(searchText.toLowerCase()) || client.email.toLowerCase().includes(searchText.toLowerCase());
                      return matchesTab && matchesSub && matchesLocation && matchesSearch;
                    })
                    .map((client, index, arr) => (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setIsDetailsOpen(true);
                      }}
                      className="ion-activatable ripple-parent"
                      style={{
                        padding: '16px 24px',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(200px, 2fr) 1fr',
                        gap: '16px',
                        alignItems: 'center',
                        borderBottom: index < arr.length - 1 ? '1px solid var(--ion-color-step-50, rgba(0,0,0,0.05))' : 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Avatar and Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                        <div style={{ 
                          width: '48px', height: '48px', borderRadius: '16px',
                          background: `hsl(${client.name.length * 20}, 85%, 96%)`, 
                          color: `hsl(${client.name.length * 20}, 70%, 45%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: '800', fontSize: '18px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                          flexShrink: 0,
                          border: '1px solid rgba(0,0,0,0.02)'
                        }}>
                          {client.name.charAt(0)}
                        </div>
                        <div style={{ overflow: 'hidden', minWidth: 0 }}>
                          <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--ion-text-color)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {client.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <div style={{ 
                               padding: '2px 8px', borderRadius: '6px', 
                               background: 'var(--ion-color-step-50, rgba(0,0,0,0.05))', color: 'var(--ion-color-step-600, #666)',
                               fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
                             }}>
                                <IonIcon icon={card} style={{ fontSize: '10px' }} />
                                {plans.find(p => p.Id === client.planId)?.PlanName || 'No Plan'}
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Date Installed */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ion-text-color)' }}>
                          {client.dueDate}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--ion-color-medium)', marginTop: '2px', fontWeight: 500 }}>
                           {new Date(client.dueDate).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>

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
        <IonModal isOpen={isDetailsOpen} onDidDismiss={() => setIsDetailsOpen(false)} initialBreakpoint={0.9} breakpoints={[0, 0.75, 1]}>
          <IonContent className="ion-padding" style={{ '--background': 'var(--ion-background-color)' }}>
             <div style={{ width: '40px', height: '4px', background: 'var(--ion-color-step-200, #e0e0e0)', borderRadius: '2px', margin: '10px auto 20px auto' }}></div>
            {selectedClient && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
                
                {/* Header Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ 
                      width: '90px', height: '90px', borderRadius: '30px',
                      background: `hsl(${selectedClient.name.length * 20}, 85%, 96%)`, 
                      color: `hsl(${selectedClient.name.length * 20}, 70%, 45%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: '800', fontSize: '36px',
                      marginBottom: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
                      border: '4px solid white'
                    }}>
                      {selectedClient.name.charAt(0)}
                  </div>
                  
                  <h2 style={{ margin: '0 0 6px 0', fontWeight: '800', fontSize: '26px', letterSpacing: '-0.5px' }}>{selectedClient.name}</h2>
                   <div style={{ fontSize: '14px', color: 'var(--ion-color-medium)', fontWeight: '500', marginBottom: '12px' }}>
                        {selectedClient.location || 'No Location'}
                   </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <IonBadge color={
                        selectedClient.subscriptionStatus === 'Active' ? 'success' : 'medium'
                    } style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {selectedClient.subscriptionStatus}
                    </IonBadge>
                  </div>
                </div>

                {/* Quick Actions */}
                {/* <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '10px 0' }}>
                    <div className="ion-activatable ripple-parent" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                         <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--ion-color-primary-tint)', color: 'var(--ion-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <IonIcon icon={call} />
                         </div>
                         <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ion-text-color)' }}>Call</span>
                    </div>
                     <div className="ion-activatable ripple-parent" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                         <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--ion-color-secondary-tint)', color: 'var(--ion-color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <IonIcon icon={mail} />
                         </div>
                         <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ion-text-color)' }}>Email</span>
                    </div>
                     <div className="ion-activatable ripple-parent" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                         <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--ion-color-warning-tint)', color: 'var(--ion-color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <IonIcon icon={documentText} />
                         </div>
                         <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ion-text-color)' }}>History</span>
                    </div>
                </div> */}

                {/* Info List */}
                <IonList inset={true} style={{ margin: 0, borderRadius: '20px', background: 'var(--ion-card-background)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <IonItem lines="full" detail={false} style={{ '--padding-start': '16px' }}>
                        <div slot="start" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IonIcon icon={wifi} />
                        </div>
                        <IonLabel>
                            <h3 style={{ fontWeight: '700', fontSize: '14px', color: '#4338ca' }}>Internet Plan</h3>
                            <p style={{ fontWeight: '600', color: 'var(--ion-text-color)', fontSize: '15px' }}>
                                {plans.find(p => p.Id === selectedClient.planId)?.PlanName || 'Unknown'}
                            </p>
                        </IonLabel>
                         <IonNote slot="end" style={{ fontWeight: '700', fontSize: '15px', color: 'var(--ion-text-color)' }}>
                            ${selectedClient.amount}
                        </IonNote>
                    </IonItem>

                    <IonItem lines="full" detail={false} style={{ '--padding-start': '16px' }}>
                        <div slot="start" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IonIcon icon={calendar} />
                        </div>
                         <IonLabel>
                            <h3 style={{ fontWeight: '700', fontSize: '14px', color: '#b91c1c' }}>Installation Date</h3>
                            <p style={{ fontWeight: '600', color: 'var(--ion-text-color)', fontSize: '15px' }}>
                                {selectedClient.dueDate}
                            </p>
                        </IonLabel>
                    </IonItem>
                    
                     <IonItem lines="full" detail={false} style={{ '--padding-start': '16px' }}>
                        <div slot="start" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IonIcon icon={location} />
                        </div>
                         <IonLabel>
                            <h3 style={{ fontWeight: '700', fontSize: '14px', color: '#047857' }}>Location</h3>
                            <p style={{ fontWeight: '600', color: 'var(--ion-text-color)', fontSize: '15px' }}>
                                {selectedClient.location || 'Unknown Location'}
                            </p>
                        </IonLabel>
                    </IonItem>
                    
                    <IonItem lines="none" detail={false} style={{ '--padding-start': '16px' }}>
                         <div slot="start" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f3f4f6', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IonIcon icon={person} />
                        </div>
                         <IonLabel>
                            <h3 style={{ fontWeight: '700', fontSize: '14px', color: '#4b5563' }}>Contact Details</h3>
                            <p style={{ fontWeight: '500', fontSize: '13px', marginTop: '4px' }}>
                                 {selectedClient.email || 'No Email'}<br/>
                                 {selectedClient.phone || 'No Phone'}
                            </p>
                        </IonLabel>
                    </IonItem>
                </IonList>
                
                <IonButton expand="block" color="primary" style={{ '--border-radius': '16px', height: '54px', fontWeight: '700', fontSize: '16px', '--box-shadow': '0 8px 20px -4px rgba(67, 97, 238, 0.4)' }}>
                    <IonIcon icon={createOutline} slot="start" />
                    Edit Client Details
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
