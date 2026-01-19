import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonGrid, IonRow, IonCol,
  IonBadge, IonButton, IonModal, IonButtons, IonFooter, IonIcon, IonText, IonAvatar, IonChip
 } from '@ionic/react';
import { wallet, time, alertCircle, trendingUp, arrowForward, sparkles, notifications, chevronForward } from 'ionicons/icons';
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
      <IonContent fullscreen>
        <div className='ion-padding' style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '80px' }}>
          
            {/* Welcome Section */}
            <section style={{ marginBottom: '32px' }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: 'var(--ion-text-color)' }}>Welcome Back!</h1>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--ion-color-medium)' }}>Here's what's happening with your business today.</p>
            </section>

            {/* Dashboard Stats */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>              
            
            {/* Revenue Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-tertiary))', 
              borderRadius: '20px', 
              padding: '28px', 
              color: 'white',
              boxShadow: '0 8px 24px -4px rgba(0, 180, 216, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(0, 180, 216, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0, 180, 216, 0.3)';
            }}>
               <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }}></div>
               <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                 <div style={{ flex: 1 }}>
                   <IonText color="light" style={{ opacity: 0.95, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>TOTAL REVENUE</IonText>
                   <h1 style={{ margin: '12px 0 16px 0', fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>$40.1k</h1>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <span style={{ background: 'rgba(255, 255, 255, 0.25)', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IonIcon icon={trendingUp} style={{ fontSize: '16px' }} /> +12%
                      </span>
                      <span style={{ opacity: 0.9, fontWeight: 500 }}>vs last month</span>
                   </div>
                 </div>
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '14px', borderRadius: '18px', backdropFilter: 'blur(10px)' }}>
                    <IonIcon icon={wallet} style={{ fontSize: '28px' }} />
                 </div>
               </div>
            </div>

            {/* Pending Invoices Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, var(--ion-color-secondary), #fb8500)', 
              borderRadius: '20px', 
              padding: '28px', 
              color: 'white',
              boxShadow: '0 8px 24px -4px rgba(255, 183, 3, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(255, 183, 3, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(255, 183, 3, 0.3)';
            }}>
               <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }}></div>
               <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                 <div style={{ flex: 1 }}>
                   <IonText color="light" style={{ opacity: 0.95, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>PENDING INVOICES</IonText>
                   <h1 style={{ margin: '12px 0 16px 0', fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>$33.9k</h1>
                   <div style={{ fontSize: '14px', opacity: 0.95, fontWeight: 500 }}>
                      <strong>5</strong> active items awaiting payment
                   </div>
                 </div>
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '14px', borderRadius: '18px', backdropFilter: 'blur(10px)' }}>
                    <IonIcon icon={time} style={{ fontSize: '28px' }} />
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
              <section style={{ marginBottom: '32px' }}>
                <div style={{ 
                  background: 'linear-gradient(to right, #FEF3C7, #FDE68A)', 
                  borderRadius: '16px', 
                  padding: '20px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap', 
                  gap: '16px',
                  border: '2px solid #FCD34D',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      background: '#FEF9C3', 
                      padding: '10px', 
                      borderRadius: '12px',
                      border: '2px solid #FDE047',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IonIcon icon={notifications} style={{ fontSize: '24px', color: '#D97706' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#78350F' }}>
                        Action Required
                      </h3>
                      <p style={{ margin: 0, color: '#92400E', fontSize: '14px', lineHeight: '1.4' }}>
                        <strong>{overdueClients.length} overdue invoice{overdueClients.length > 1 ? 's' : ''}</strong> totaling <strong>${totalOverdue.toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>
                  <IonButton 
                    size="small"
                    style={{ 
                      margin: 0, 
                      fontWeight: '600',
                      fontSize: '14px',
                      '--background': '#D97706',
                      '--background-hover': '#B45309',
                      '--border-radius': '10px',
                      '--box-shadow': '0 2px 8px rgba(217, 119, 6, 0.3)',
                      '--padding-start': '18px',
                      '--padding-end': '18px'
                    }}
                  >
                    Review Now
                    <IonIcon icon={chevronForward} slot="end" />
                  </IonButton>
                </div>
              </section>
              );
            })()}

            {/* AI Insights */}
            <section style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-tertiary))',
                  padding: '6px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IonIcon icon={sparkles} style={{ fontSize: '18px', color: 'white' }} />
                </div>
                <h2 style={{ margin: 0, fontWeight: '700', color: 'var(--ion-text-color)', fontSize: '18px' }}>AI Business Insights</h2>
                <IonChip color="primary" style={{ height: '24px', fontSize: '11px', fontWeight: '700', margin: 0 }}>BETA</IonChip>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', 
                borderRadius: '16px', 
                border: '2px solid #BAE6FD', 
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(14, 165, 233, 0.08)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-40px', 
                  right: '-40px', 
                  width: '120px', 
                  height: '120px', 
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
                  borderRadius: '50%'
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <div style={{ 
                      background: 'white',
                      padding: '8px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(14, 165, 233, 0.15)',
                      flexShrink: 0
                    }}>
                      <IonIcon icon={trendingUp} style={{ fontSize: '20px', color: 'var(--ion-color-primary)' }} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: '#075985', fontSize: '15px', fontWeight: '700' }}>Cash Flow Prediction</h4>
                      <p style={{ margin: 0, color: '#0C4A6E', fontSize: '14px', lineHeight: '1.6', fontWeight: 500 }}>
                        Based on current payment trends, you are projected to exceed your monthly revenue goal by <strong style={{ 
                          background: 'linear-gradient(to right, var(--ion-color-primary), var(--ion-color-tertiary))',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '800'
                        }}>15%</strong> next week. Consider following up with <strong>Global Logistics</strong> to secure early payment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Transactions Table */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontWeight: '700', color: 'var(--ion-text-color)', fontSize: '18px' }}>Recent Transactions</h2>
                <IonButton fill="clear" size="small" style={{ fontSize: '14px', fontWeight: '600', margin: 0 }} onClick={() => setIsOpen(true)}>
                  View All <IonIcon icon={chevronForward} slot="end" style={{ fontSize: '16px' }}/>
                </IonButton>
              </div>

              <div style={{ 
                background: 'var(--ion-card-background)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {clients.map((client, index) => (
                  <div
                    key={client.id}
                    style={{
                      padding: '18px 20px',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(200px, 2.5fr) 120px 110px 90px',
                      gap: '16px',
                      alignItems: 'center',
                      borderBottom: index < clients.length - 1 ? '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))' : 'none',
                      transition: 'background 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ion-color-step-50, rgba(0,0,0,0.02))'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ 
                          width: '48px', height: '48px', borderRadius: '14px',
                          background: `hsl(${client.id * 50}, 85%, 95%)`, 
                          color: `hsl(${client.id * 50}, 70%, 40%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: '700', fontSize: '19px',
                          border: `2px solid hsl(${client.id * 50}, 85%, 90%)`
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

                    <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '16px', color: 'var(--ion-text-color)' }}>
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