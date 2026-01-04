import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonGrid, IonRow, IonCol,
  IonBadge, IonButton, IonModal, IonButtons, IonFooter
 } from '@ionic/react';
import { useState } from 'react';
import { useAppStore } from "../store/appStore";

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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
};

const HomePage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Add Client</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className='ion-padding' style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
            {/* Dashboard Stats */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>              
          <IonCard style={{ margin: 0, borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(76, 95, 213, 0.3)', background: 'linear-gradient(135deg, #4c5fd5 0%, #5a3a7a 100%)', color: 'white' }}>
            <IonCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IonCardSubtitle style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', fontWeight: '600', letterSpacing: '1px' }}>
                TOTAL REVENUE
                </IonCardSubtitle>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Monthly</div>
              </div>
              <IonCardTitle style={{ color: '#fff', fontSize: '36px', fontWeight: '800', margin: '12px 0 4px 0' }}>
              $40.1k
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>↑ 12%</span> 
              <span>vs last month</span>
            </IonCardContent>
          </IonCard>
           
          <IonCard style={{ margin: 0, borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(199, 94, 199, 0.3)', background: 'linear-gradient(135deg, #c75ec7 0%, #d14554 100%)', color: 'white' }}>
            <IonCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IonCardSubtitle style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', fontWeight: '600', letterSpacing: '1px' }}>
                PENDING INVOICES
                </IonCardSubtitle>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Action Needed</div>
              </div>
              <IonCardTitle style={{ color: '#fff', fontSize: '36px', fontWeight: '800', margin: '12px 0 4px 0' }}>
              $33.9k
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
              <strong>5</strong> active items awaiting payment
            </IonCardContent>
          </IonCard>
            </section>

            {/* Action Required Section */}
            {(() => {
              const overdueClients = clients.filter(c => c.status === 'Overdue');
              if (overdueClients.length === 0) return null;

              const totalOverdue = overdueClients.reduce((sum, client) => sum + client.amount, 0);

              return (
              <section style={{ marginBottom: '24px' }}>
              <IonCard style={{ margin: 0, borderRadius: '12px', borderLeft: '6px solid #f59e0b', background: '#fffbeb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#92400e' }}>Attention Needed</h3>
                <p style={{ margin: 0, color: '#b45309', fontSize: '14px' }}>
                You have <strong>{overdueClients.length} client{overdueClients.length !== 1 ? 's' : ''}</strong> with overdue payments totaling <strong>${totalOverdue.toLocaleString()}</strong>.
                </p>
                </div>
                <IonButton size="small" color="warning" fill="solid" style={{ margin: 0, fontWeight: '600' }}>Review Now</IonButton>
              </div>
              </IonCard>
              </section>
              );
            })()}

            {/* AI Insights */}
            <section style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingLeft: '4px' }}>
          <h5 style={{ margin: 0, fontWeight: '700', color: 'var(--ion-text-color)', fontSize: '14px', letterSpacing: '0.5px' }}>AI BUSINESS INSIGHTS</h5>
          <IonBadge color="primary" style={{ fontSize: '10px', padding: '4px 8px' }}>BETA</IonBadge>
              </div>
              <IonCard style={{ margin: 0, borderRadius: '12px', background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)', border: '1px solid #bae6fd', boxShadow: 'none' }}>
          <div style={{ padding: '16px' }}>
            <p style={{ margin: 0, color: '#0369a1', fontSize: '14px', lineHeight: '1.6' }}>
              <strong>Cash Flow Prediction:</strong> Based on current payment trends, you are projected to exceed your monthly revenue goal by <strong>15%</strong> next week. Consider following up with <em>Global Logistics</em> to secure early payment.
            </p>
          </div>
              </IonCard>
            </section> 

            {/* Recent Clients Table */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingLeft: '4px' }}>
          <h5 style={{ margin: 0, fontWeight: '700', color: 'var(--ion-text-color)', fontSize: '14px', letterSpacing: '0.5px' }}>RECENT TRANSACTIONS</h5>
          <IonButton fill="clear" size="small" style={{ fontSize: '13px', fontWeight: '600' }}  onClick={() => setIsOpen(true)}>View All</IonButton>
              </div>

              <IonCard style={{ margin: 0, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '600px' }}>
              <IonGrid className="ion-no-padding">
                <IonRow style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px' }}>
              <IonCol size="5" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--ion-text-color)', letterSpacing: '0.05em' }}>Client</IonCol>
              <IonCol size="3" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--ion-text-color)', letterSpacing: '0.05em' }}>Due Date</IonCol>
              <IonCol size="2" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--ion-text-color)', letterSpacing: '0.05em', textAlign: 'right' }}>Amount</IonCol>
              <IonCol size="2" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--ion-text-color)', letterSpacing: '0.05em', textAlign: 'center' }}>Status</IonCol>
                </IonRow> 

                {clients.map((client, index) => (
            <IonRow key={client.id} style={{ alignItems: 'center', borderBottom: index !== clients.length - 1 ? '1px solid #f3f4f6' : 'none', padding: '16px' }}>
            <IonCol size="5">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '12px',
                background: `hsl(${client.id * 60}, 70%, 90%)`, color: `hsl(${client.id * 60}, 70%, 30%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                {client.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ion-text-color)' }}>{client.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--ion-text-color)' }}>{client.email}</div>
              </div>
              </div>
            </IonCol>
            <IonCol size="3">
              <div style={{ fontSize: '14px', color: 'var(--ion-text-color)' }}>{client.dueDate}</div>
            </IonCol>
            <IonCol size="2" style={{ textAlign: 'right', fontWeight: '600', fontSize: '14px', color: 'var(--ion-text-color)' }}>
              ${client.amount.toLocaleString()}
            </IonCol>
            <IonCol size="2" style={{ textAlign: 'center' }}>
                <IonBadge color={client.status === 'Paid' ? 'success' : client.status === 'Pending' ? 'warning' : 'danger'}>
                {client.status}
                </IonBadge>
            </IonCol>
            </IonRow>
                ))}
              </IonGrid>
            </div>
          </div>
              </IonCard>
            </section>
        </div>

      <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)} className="custom-modal">
        <IonHeader>
          <IonToolbar>
            <IonTitle>All Clients</IonTitle>
            <IonButtons slot="end">
        
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {clients.map((client) => (
              <IonCard key={client.id} style={{ margin: 0, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <IonCardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '42px', height: '42px', borderRadius: '10px',
                background: `hsl(${client.id * 60}, 70%, 95%)`, color: `hsl(${client.id * 60}, 70%, 40%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: '700', fontSize: '16px'
              }}>
                {client.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--ion-text-color)' }}>{client.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{client.email}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--ion-text-color)' }}>${client.amount.toLocaleString()}</div>
              <IonBadge color={client.status === 'Paid' ? 'success' : client.status === 'Pending' ? 'warning' : 'danger'} style={{ fontSize: '10px', marginTop: '2px' }}>
                {client.status}
              </IonBadge>
            </div>
          </IonCardContent>
              </IonCard>
            ))}
          </div>
        </IonContent>
        <IonFooter>
          <div className="ion-padding" style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--ion-color-step-150, #f0f0f0)' }}>
                        <IonButton expand="block" style={{ flex: 1 }} onClick={() => setIsOpen(false)}>
                    Close
                        </IonButton>
                       
                      </div>
        </IonFooter>
      </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;