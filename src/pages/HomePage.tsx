import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonGrid, IonRow, IonCol,
  IonBadge, IonButton, IonModal, IonButtons, IonFooter, IonIcon, IonText, IonAvatar
 } from '@ionic/react';
import { wallet, time, alertCircle, trendingUp, arrowForward, sparkles } from 'ionicons/icons';
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
        <div className='ion-padding' style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
          
            {/* Dashboard Stats */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>              
            
            {/* Revenue Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-tertiary))', 
              borderRadius: '24px', 
              padding: '24px', 
              color: 'white',
              boxShadow: '0 10px 30px -5px rgba(0, 180, 216, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
               <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                   <IonText color="light" style={{ opacity: 0.9, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>TOTAL REVENUE</IonText>
                   <h1 style={{ margin: '8px 0 12px 0', fontSize: '2.2rem', fontWeight: '800' }}>$40.1k</h1>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <IonIcon icon={trendingUp} style={{ marginRight: '4px' }} /> 12%
                      </span>
                      <span style={{ opacity: 0.8 }}>vs last month</span>
                   </div>
                 </div>
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px', backdropFilter: 'blur(5px)' }}>
                    <IonIcon icon={wallet} style={{ fontSize: '24px' }} />
                 </div>
               </div>
            </div>

            {/* Pending Invoices Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, var(--ion-color-secondary), #fb8500)', 
              borderRadius: '24px', 
              padding: '24px', 
              color: 'white',
              boxShadow: '0 10px 30px -5px rgba(255, 183, 3, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
               <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                   <IonText color="light" style={{ opacity: 0.9, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>PENDING INVOICES</IonText>
                   <h1 style={{ margin: '8px 0 12px 0', fontSize: '2.2rem', fontWeight: '800' }}>$33.9k</h1>
                   <div style={{ fontSize: '13px', opacity: 0.9 }}>
                      <strong>5</strong> active items awaiting payment
                   </div>
                 </div>
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px', backdropFilter: 'blur(5px)' }}>
                    <IonIcon icon={time} style={{ fontSize: '24px' }} />
                 </div>
               </div>
            </div>
            </section>

            {/* Action Required Section */}
            {(() => {
              const overdueClients = clients.filter(c => c.status === 'Overdue');
              if (overdueClients.length === 0) return null;

              const totalOverdue = overdueClients.reduce((sum, client) => sum + client.amount, 0);

              return (
              <section style={{ marginBottom: '24px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', 
                  borderRadius: '20px', 
                  padding: '24px', 
                  color: 'white',
                  boxShadow: '0 12px 24px -6px rgba(220, 38, 38, 0.5)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap', 
                  gap: '20px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative elements */}
                  <div style={{ 
                    position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', 
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)', 
                    borderRadius: '50%' 
                  }}></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.15)', 
                      padding: '12px', 
                      borderRadius: '14px', 
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <IonIcon icon={alertCircle} style={{ fontSize: '32px', color: '#fff' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Attention Needed</h3>
                      <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.95)', fontSize: '15px', lineHeight: '1.5' }}>
                        <strong>{overdueClients.length} overdue invoices</strong> totaling <strong style={{ textDecoration: 'underline rgba(255,255,255,0.5)', textUnderlineOffset: '2px' }}>${totalOverdue.toLocaleString()}</strong> require immediate action.
                      </p>
                    </div>
                  </div>
                  <IonButton 
                    size="default" 
                    color="light" 
                    style={{ 
                      margin: 0, 
                      fontWeight: '700', 
                      '--border-radius': '10px',
                      '--box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
                      '--color': '#991B1B',
                      zIndex: 2
                    }}
                  >
                    RESOLVE NOW
                  </IonButton>
                </div>
              </section>
              );
            })()}

            {/* AI Insights */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingLeft: '4px' }}>
                <IonIcon icon={sparkles} color="primary" />
                <h5 style={{ margin: 0, fontWeight: '700', color: 'var(--ion-text-color)', fontSize: '14px', letterSpacing: '0.5px' }}>AI BUSINESS INSIGHTS</h5>
                <IonBadge color="primary" style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '6px' }}>BETA</IonBadge>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)', 
                borderRadius: '16px', 
                border: '1px solid #bae6fd', 
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ margin: 0, color: '#0c4a6e', fontSize: '15px', lineHeight: '1.6' }}>
                    <strong>Cash Flow Prediction:</strong> Based on current payment trends, you are projected to exceed your monthly revenue goal by <strong style={{ color: 'var(--ion-color-primary)' }}>15%</strong> next week. Consider following up with <em>Global Logistics</em> to secure early payment.
                  </p>
                </div>
              </div>
            </section> 

            {/* Recent Transactions Table */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingLeft: '4px' }}>
                <h5 style={{ margin: 0, fontWeight: '700', color: 'var(--ion-text-color)', fontSize: '14px', letterSpacing: '0.5px' }}>RECENT TRANSACTIONS</h5>
                <IonButton fill="clear" size="small" style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }} onClick={() => setIsOpen(true)}>
                  View All <IonIcon icon={arrowForward} slot="end" style={{ fontSize: '14px' }}/>
                </IonButton>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {clients.map((client) => (
                  <div
                    key={client.id}
                    style={{
                      background: 'var(--ion-card-background)',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(180px, 2fr) 100px 100px 80px',
                      gap: '10px',
                      alignItems: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      border: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
                    }}
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