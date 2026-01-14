import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader
  , IonCardTitle, IonCardContent, IonButton, IonIcon, IonSearchbar, IonGrid, IonRow, IonCol, IonBadge, IonSegment, IonSegmentButton, IonLabel,
  IonModal, IonButtons, IonInput, IonFooter, useIonToast, IonSelect, IonSelectOption,
  IonFab, IonFabButton, IonText, IonAvatar
 } from '@ionic/react';
import { add, wallet, searchOutline, filter, person } from 'ionicons/icons';
import clientService from '../services/Clients.service';
import planService from '../services/Plans.service';

const ClientsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null); // For details modal
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    amount: '',
    dueDate: '',
    status: 'pending', 
    planId: null as number | null
  });

  const [presentToast] = useIonToast();

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const loadClients = async () => {
    try {
      const res = await clientService.getClients();
      // Map DB result to UI model
      const mapped = (res as any[]).map((c: any) => ({
        id: c.Id || c.id,
        name: c.Client,
        email: c.ContactInfo.split(' | ')[0], // Extract email
        phone: c.ContactInfo.split(' | ')[1] || '',
        dueDate: c.DateInstalled ? new Date(c.DateInstalled).toLocaleDateString() : '',
        amount: 0, // Placeholder
        status: c.IsActive ? 'Paid' : 'Pending',
        planId: c.PlanId
      }));
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

  useEffect(() => {
    loadClients();
    loadPlans();
  }, []);

  const handleSaveClient = async () => {
    try {
      const response = await clientService.addClient({
        Client: formData.clientName,
        ContactInfo: `${formData.email} | ${formData.phone}`,
        DateInstalled: new Date(formData.dueDate),
        PlanId: formData.planId || 1, // Default plan if not selected
        UserId: 1, // Default user
        IsActive: formData.status === 'paid'
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
          planId: null
        });
      } else {
         presentToast({ message: 'Failed to add client', duration: 2000, color: 'danger' });
      }
    } catch (error) {
      presentToast({ message: 'An error occurred', duration: 2000, color: 'danger' });  
    }
  }

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
          
          {/* Summary Card */}
          <section>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-tertiary))', 
              borderRadius: '24px', 
              padding: '24px', 
              color: 'white',
              boxShadow: '0 10px 30px -5px rgba(0, 180, 216, 0.4)',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative circle */}
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
                background: 'rgba(255,255,255,0.1)', borderRadius: '50%'
              }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <div>
                  <IonText color="light">
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem', fontWeight: 500 }}>Total Monthly Revenue</p>
                  </IonText>
                  <h1 style={{ margin: '8px 0 16px 0', fontSize: '2.5rem', fontWeight: 'bold' }}>$40,000</h1>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <IonBadge color="light" style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', color: 'var(--ion-color-primary)' }}>
                        {clientsList.length} Active Clients
                     </IonBadge>
                  </div>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '12px', 
                  borderRadius: '16px',
                  backdropFilter: 'blur(5px)'
                }}>
                  <IonIcon icon={wallet} style={{ fontSize: '28px' }} />
                </div>
              </div>
            </div>
          </section>

          {/* Controls Section */}
          <section style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <IonSearchbar 
              showCancelButton="never" 
              placeholder="Search clients..." 
              searchIcon={searchOutline}
              style={{ padding: 0, '--box-shadow': 'none', '--background': 'var(--ion-color-light)', '--border-radius': '12px' }}
            ></IonSearchbar>

            <IonSegment 
              value={selectedTab} 
              onIonChange={e => setSelectedTab(e.detail.value as string)}
              style={{ background: 'transparent', padding: '4px' }}
              mode="ios"
            >
              <IonSegmentButton value="all" style={{ borderRadius: '8px', '--indicator-display': 'none', minHeight: '36px' }}>
                <IonLabel style={{ fontWeight: selectedTab === 'all' ? '600' : '400' }}>All</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="paid" style={{ borderRadius: '8px', minHeight: '36px' }}>
                <IonLabel style={{ fontWeight: selectedTab === 'paid' ? '600' : '400' }}>Paid</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="pending" style={{ borderRadius: '8px', minHeight: '36px' }}>
                <IonLabel style={{ fontWeight: selectedTab === 'pending' ? '600' : '400' }}>Pending</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </section>

          {/* Client List */}
          <section>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Table Header - Only visible on wider screens or kept minimal */}
              <div style={{ 
                display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) 100px 100px 80px', gap: '10px', 
                padding: '0 16px', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: 'var(--ion-color-medium)', textTransform: 'uppercase'
              }}>
                <div>Client</div>
                <div>Due Date</div>
                <div style={{ textAlign: 'right' }}>Amount</div>
                <div style={{ textAlign: 'center' }}>Status</div>
              </div>

              {clientsList
                .filter(client => selectedTab === 'all' || (client.status && client.status.toLowerCase() === selectedTab))
                .map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setIsDetailsOpen(true);
                  }}
                  style={{
                    background: 'var(--ion-card-background)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(180px, 2fr) 100px 100px 80px',
                    gap: '10px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    border: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
                    transition: 'transform 0.2s',
                  }}
                  className="client-row-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: `hsl(${client.id * 50}, 85%, 95%)`, color: `hsl(${client.id * 50}, 70%, 40%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontWeight: '700', fontSize: '18px'
                      }}>
                        {client.name.charAt(0)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: '600', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--ion-color-medium)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.email || 'No email'}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', color: 'var(--ion-color-step-600, #555)' }}>
                    {client.dueDate}
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '15px', color: 'var(--ion-text-color)' }}>
                    ${client.amount.toLocaleString()}
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <IonBadge color={
                        client.status.toLowerCase() === 'paid' ? 'success' :
                        client.status.toLowerCase() === 'pending' ? 'warning' : 'danger'
                      }
                      style={{ borderRadius: '6px', padding: '6px 8px', fontWeight: '600' }}
                    >
                      {client.status}
                    </IonBadge>
                  </div>
                </div>
              ))}
            </div>
            
            {clientsList.filter(client => selectedTab === 'all' || (client.status && client.status.toLowerCase() === selectedTab)).length === 0 && (
               <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ion-color-medium)' }}>
                 <IonIcon icon={person} style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.2 }} />
                 <p>No clients found.</p>
               </div>
            )}

          </section>
        </div>

        {/* Floating Action Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '20px', marginRight: '10px' }}>
          <IonFabButton onClick={() => setIsOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add New Client</IonTitle>
              <IonButtons slot="end">
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px' }}>
              
              {/* Client Details Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <IonInput label="Client Name" labelPlacement="floating" fill="outline" placeholder="e.g. Acme Corp" value={formData.clientName} onIonInput={e => handleInputChange('clientName', e.detail.value!)}></IonInput>
          <IonInput label="Email Address" type="email" labelPlacement="floating" fill="outline" placeholder="contact@acme.com" value={formData.email} onIonInput={e => handleInputChange('email', e.detail.value!)}></IonInput>
          <IonInput label="Phone Number" type="tel" labelPlacement="floating" fill="outline" placeholder="+1 (555) 000-0000" value={formData.phone} onIonInput={e => handleInputChange('phone', e.detail.value!)}></IonInput>
              </div>

              {/* Billing Details Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <IonSelect 
                  label="Internet Plan" 
                  labelPlacement="floating" 
                  fill="outline" 
                  value={formData.planId} 
                  onIonChange={e => {
                    const selectedPlanId = e.detail.value;
                    const selectedPlan = plans.find(p => p.Id === selectedPlanId);
                    handleInputChange('planId', selectedPlanId);
                    // Auto-fill amount if a plan is selected
                    if (selectedPlan) {
                      handleInputChange('amount', selectedPlan.Amount);
                    }
                  }}
                >
                  {plans.map(plan => (
                    <IonSelectOption key={plan.Id} value={plan.Id}>
                      {plan.PlanName} ({plan.Amount})
                    </IonSelectOption>
                  ))}
                </IonSelect>

          <div style={{ display: 'flex', gap: '15px' }}>
            <IonInput style={{ flex: 1 }} label="Amount ($)" type="number" labelPlacement="floating" fill="outline" placeholder="0.00" value={formData.amount} onIonInput={e => handleInputChange('amount', e.detail.value!)}></IonInput>
            <IonInput style={{ flex: 1 }} label="Due Date" type="date" labelPlacement="floating" fill="outline" value={formData.dueDate} onIonChange={e => handleInputChange('dueDate', e.detail.value!)}></IonInput>
          </div>
          
          <div>
            <IonLabel style={{ display: 'block', marginBottom: '10px', color: 'var(--ion-color-medium)', fontSize: '14px' }}>Initial Status</IonLabel>
            <IonSegment value={formData.status} onIonChange={e => handleInputChange('status', e.detail.value!)}>
              <IonSegmentButton value="paid">
                <IonLabel>Paid</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="pending">
                <IonLabel>Pending</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="overdue">
                <IonLabel>Overdue</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>
              </div>

            </div>
          </IonContent>
          <IonFooter>
            <div className="ion-padding" style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--ion-color-step-150, #f0f0f0)' }}>
              <IonButton expand="block" color="danger" style={{ flex: 1 }} onClick={() => setIsOpen(false)}>
          Cancel
              </IonButton>
              <IonButton expand="block" color="primary" style={{ flex: 1 }} onClick={handleSaveClient}>
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
                        <div style={{ fontSize: '12px', color: '#666' }}>Due Date</div>
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
