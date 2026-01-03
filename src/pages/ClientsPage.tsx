import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader
  , IonCardTitle, IonCardContent, IonButton, IonIcon, IonSearchbar, IonGrid, IonRow, IonCol, IonBadge, IonSegment, IonSegmentButton, IonLabel,
  IonModal, IonButtons, IonInput, IonFooter
 } from '@ionic/react';
import { add } from 'ionicons/icons';

const clients = [
  {
    id: 1,
    name: 'Tech Solutions Inc.',
    email: 'contact@techsolutions.com',
    dueDate: 'Oct 24, 2023',
    amount: 12500,
    status: 'Paid',
  },
  {
    id: 2,
    name: 'Global Logistics',
    email: 'billing@globallogistics.com',
    dueDate: 'Oct 28, 2023',
    amount: 8400,
    status: 'Pending',
  },
  {
    id: 3,
    name: 'Creative Studio',
    email: 'hello@creativestudio.com',
    dueDate: 'Nov 02, 2023',
    amount: 4200,
    status: 'Overdue',
  },
  {
    id: 4,
    name: 'NextGen Systems',
    email: 'finance@nextgen.com',
    dueDate: 'Nov 05, 2023',
    amount: 15000,
    status: 'Paid',
  },
];

const ClientsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Client Manager</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className='ion-padding'>
          <section>
            <IonCard style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
              <div>
                  <IonCardHeader>
                  <IonCardTitle>7 Clients</IonCardTitle>      
                  </IonCardHeader>
                  <IonCardContent>Total Portfolio: <strong>$40,000</strong></IonCardContent>
              </div>  
              <div>
                <IonButton onClick={() => setIsOpen(true)}>
                  <IonIcon icon={add} />
                </IonButton>
              </div>  
            </IonCard>
          </section>

          <IonSearchbar showCancelButton="never" placeholder="Search clients..."></IonSearchbar>

          <section style={{ marginBottom: '20px' }}>
            <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as string)}>
              <IonSegmentButton value="all">
                <IonLabel>All Clients</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="paid">
                <IonLabel>Paid</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="pending">
                <IonLabel>Pending</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </section>

          <section>
            <IonCard style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '600px' }}>
              <IonGrid>
              <IonRow style={{ borderBottom: '1px solid #e0e0e0', padding: '10px' }}>
                <IonCol size="5" style={{ fontWeight: 'bold', color: 'var(--ion-text-color)' }}>Client</IonCol>
                <IonCol size="3" style={{ fontWeight: 'bold', color: 'var(--ion-text-color)' }}>Due Date</IonCol>
                <IonCol size="2" style={{ fontWeight: 'bold', color: 'var(--ion-text-color)', textAlign: 'right' }}>Amount</IonCol>
                <IonCol size="2" style={{ fontWeight: 'bold', color: 'var(--ion-text-color)', textAlign: 'center' }}>Status</IonCol>
              </IonRow>

              {clients
                .filter(client => selectedTab === 'all' || client.status.toLowerCase() === selectedTab)
                .map((client) => (
                <IonRow key={client.id} style={{ alignItems: 'center', borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
                <IonCol size="5">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: `hsl(${client.id * 60}, 70%, 90%)`, color: `hsl(${client.id * 60}, 70%, 30%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      {client.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{client.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{client.email}</div>
                  </div>
                  </div>
                </IonCol>
                <IonCol size="3">
                  <div style={{ fontSize: '13px' }}>{client.dueDate}</div>
                </IonCol>
                <IonCol size="2" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                  ${client.amount.toLocaleString()}
                </IonCol>
                <IonCol size="2" style={{ textAlign: 'center' }}>
                  <IonBadge color={
                  client.status.toLowerCase() === 'paid' ? 'success' :
                    client.status.toLowerCase() === 'pending' ? 'warning' : 'danger'
                  }>
                  {client.status}
                  </IonBadge>
                </IonCol>
                </IonRow>
              ))}
              </IonGrid>
            </div>
            </IonCard>
          </section>
        </div>

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
          <IonInput label="Client Name" labelPlacement="floating" fill="outline" placeholder="e.g. Acme Corp"></IonInput>
          <IonInput label="Email Address" type="email" labelPlacement="floating" fill="outline" placeholder="contact@acme.com"></IonInput>
          <IonInput label="Phone Number" type="tel" labelPlacement="floating" fill="outline" placeholder="+1 (555) 000-0000"></IonInput>
              </div>

              {/* Billing Details Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <IonInput style={{ flex: 1 }} label="Amount ($)" type="number" labelPlacement="floating" fill="outline" placeholder="0.00"></IonInput>
            <IonInput style={{ flex: 1 }} label="Due Date" type="date" labelPlacement="floating" fill="outline"></IonInput>
          </div>
          
          <div>
            <IonLabel style={{ display: 'block', marginBottom: '10px', color: 'var(--ion-color-medium)', fontSize: '14px' }}>Initial Status</IonLabel>
            <IonSegment value="pending">
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
              <IonButton expand="block" color="primary" style={{ flex: 1 }} onClick={() => setIsOpen(false)}>
          Save Client
              </IonButton>
            </div>
          </IonFooter>
        </IonModal>
   
      </IonContent>
    </IonPage>
  );
};

export default ClientsPage;
