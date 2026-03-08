import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonGrid, IonRow, IonCol,
  IonBadge, IonButton, IonModal, IonButtons, IonFooter, IonIcon, IonText, IonAvatar, IonChip, useIonViewWillEnter
 } from '@ionic/react';
import { wallet, time, alertCircle, trendingUp, arrowForward, sparkles, notifications, chevronForward, calendar, statsChart } from 'ionicons/icons';
import { useState } from 'react';
import { useAppStore } from "../store/appStore";
import collectionService from '../services/Collections.service';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const HomePage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, pending: 0, pendingCount: 0, overdue: 0, overdueCount: 0, dueToday: 0, dueTodayCount: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useIonViewWillEnter(() => {
      loadDashboardData();
  });

  const loadDashboardData = async () => {
      try {
          setLoading(true);
          const now = new Date();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const year = now.getFullYear();
          const currentMonth = `${month}/${year}`;

          // Calculate Last 6 Months for Chart
          const monthsParams: string[] = [];
          const labels: string[] = [];
          for(let i=5; i>=0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const mStr = String(d.getMonth() + 1).padStart(2, '0');
              const yStr = d.getFullYear();
              monthsParams.push(`${mStr}/${yStr}`);
              labels.push(d.toLocaleString('default', { month: 'short' }));
          }

          // Fetch chart data
          const newChartData = [];
          for(let i=0; i<6; i++) {
              const monthStr = monthsParams[i];
              try {
                  const mTrns = await collectionService.getCollectionsByMonthDetailed(monthStr);
                  let mRev = 0;
                  if(mTrns) {
                      mTrns.forEach((t:any) => {
                          if(t.StatusId === 2) mRev += (t.AmountPaid || 0);
                      });
                  }
                  newChartData.push({ name: labels[i], revenue: mRev });
              } catch(e) {
                  newChartData.push({ name: labels[i], revenue: 0 });
              }
          }
          setChartData(newChartData);

          // Fetch transactions for the current month
          const trns = await collectionService.getCollectionsByMonthDetailed(currentMonth);
          
          let revenue = 0;
          let pending = 0;
          let pendingCount = 0;
          let overdue = 0;
          let overdueCount = 0;
          let dueToday = 0;
          let dueTodayCount = 0;

          if (trns) {
              trns.forEach((t: any) => {
                  const paid = t.AmountPaid || 0;
                  const due = t.AmountDue || 0;

                  // due today check
                  let isDueToday = false;
                   if(t.DateInstalled && t.BillingMonth) {
                        try {
                           const installedDate = new Date(t.DateInstalled);
                           if(!isNaN(installedDate.getTime())) {
                               const installDay = installedDate.getDate();
                               const [m, y] = t.BillingMonth.split('/');
                               const mInt = parseInt(m);
                               const yInt = parseInt(y);
                               const lastDay = new Date(yInt, mInt, 0).getDate();
                               const day = Math.min(installDay, lastDay);
                               
                               const nowCheck = new Date();
                               if(nowCheck.getDate() === day && (nowCheck.getMonth() + 1) === mInt && nowCheck.getFullYear() === yInt) {
                                   isDueToday = true;
                               }
                           }
                        } catch {}
                    }

                  // StatusId: 1=Pending, 2=Paid, 3=Overdue
                  if (t.StatusId === 2) {
                      revenue += paid;
                  } else if (t.StatusId === 1) {
                      pending += due;
                      pendingCount++;
                      if (isDueToday) {
                          dueToday += due;
                          dueTodayCount++;
                      }
                  } else if (t.StatusId === 3) {
                      overdue += due;
                      overdueCount++;
                  }
              });

              // Sort by ID descending (newest first)
              const sorted = [...trns].sort((a: any, b: any) => b.Id - a.Id);
              setRecentTransactions(sorted);
          }

          setStats({ revenue, pending, pendingCount, overdue, overdueCount, dueToday, dueTodayCount });

      } catch (e) {
          console.error("Error loading dashboard data", e);
      } finally {
          setLoading(false);
      }
  };

  return (
    <IonPage>
      <IonHeader translucent={true}>
              <IonToolbar>
                <IonTitle>Dashboard</IonTitle>
              </IonToolbar>
            </IonHeader>
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
                   <h1 style={{ margin: '12px 0 16px 0', fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>${stats.revenue.toLocaleString()}</h1>
                 </div>
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '14px', borderRadius: '18px', backdropFilter: 'blur(10px)' }}>
                    <IonIcon icon={wallet} style={{ fontSize: '28px' }} />
                 </div>
               </div>
            </div>

            {/* Due Today Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #8e44ad, #9b59b6)', 
              borderRadius: '20px', 
              padding: '28px', 
              color: 'white',
              boxShadow: '0 8px 24px -4px rgba(155, 89, 182, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(155, 89, 182, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(155, 89, 182, 0.3)';
            }}>
               <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }}></div>
               <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                 <div style={{ flex: 1 }}>
                   <IonText color="light" style={{ opacity: 0.95, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>DUE TODAY</IonText>
                   <h1 style={{ margin: '12px 0 16px 0', fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>${stats.dueToday.toLocaleString()}</h1>
                   <div style={{ fontSize: '14px', opacity: 0.95, fontWeight: 500 }}>
                      <strong>{stats.dueTodayCount}</strong> items due today
                   </div>
                 </div>
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '14px', borderRadius: '18px', backdropFilter: 'blur(10px)' }}>
                    <IonIcon icon={calendar} style={{ fontSize: '28px' }} />
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
                   <h1 style={{ margin: '12px 0 16px 0', fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>${stats.pending.toLocaleString()}</h1>
                   <div style={{ fontSize: '14px', opacity: 0.95, fontWeight: 500 }}>
                      <strong>{stats.pendingCount}</strong> active items awaiting payment
                   </div>
                 </div>
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '14px', borderRadius: '18px', backdropFilter: 'blur(10px)' }}>
                    <IonIcon icon={time} style={{ fontSize: '28px' }} />
                 </div>
               </div>
            </div>

            {/* Overdue Invoices Card */}
            <div style={{ 
              background: stats.overdueCount > 0 
                ? 'linear-gradient(135deg, var(--ion-color-danger, #eb445a), #c5000f)' 
                : 'linear-gradient(135deg, var(--ion-color-success, #2dd36f), #1ea354)', 
              borderRadius: '20px', 
              padding: '28px', 
              color: 'white',
              boxShadow: stats.overdueCount > 0 
                ? '0 8px 24px -4px rgba(235, 68, 90, 0.3)' 
                : '0 8px 24px -4px rgba(45, 211, 111, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = stats.overdueCount > 0 
                ? '0 12px 32px -4px rgba(235, 68, 90, 0.4)' 
                : '0 12px 32px -4px rgba(45, 211, 111, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = stats.overdueCount > 0 
                 ? '0 8px 24px -4px rgba(235, 68, 90, 0.3)' 
                 : '0 8px 24px -4px rgba(45, 211, 111, 0.3)';
            }}>
               <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }}></div>
               <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                 <div style={{ flex: 1 }}>
                   <IonText color="light" style={{ opacity: 0.95, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>OVERDUE</IonText>
                   <h1 style={{ margin: '12px 0 16px 0', fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>${stats.overdue.toLocaleString()}</h1>
                   <div style={{ fontSize: '14px', opacity: 0.95, fontWeight: 500 }}>
                      <strong>{stats.overdueCount}</strong> overdue client{stats.overdueCount !== 1 ? 's' : ''}
                   </div>
                 </div>
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '14px', borderRadius: '18px', backdropFilter: 'blur(10px)' }}>
                    <IonIcon icon={alertCircle} style={{ fontSize: '28px' }} />
                 </div>
               </div>
            </div>
            </section>

            {/* Action Required Section */}
            {/* {stats.overdueCount > 0 && (
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
                        <strong>{stats.overdueCount} overdue invoice{stats.overdueCount > 1 ? 's' : ''}</strong> totaling <strong>${stats.overdue.toLocaleString()}</strong>
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
            )} */}

            {/* Revenue Trend Chart */}
            <section style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h2 style={{ margin: 0, fontWeight: '700', color: 'var(--ion-text-color)', fontSize: '18px' }}>Revenue Trend</h2>
                <IonButton fill="clear" size="small" style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  Last 6 Months
                </IonButton>
              </div>
              
              <div style={{ 
                background: 'var(--ion-card-background)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                height: '300px'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--ion-color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--ion-color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ion-color-step-200, #e0e0e0)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--ion-color-medium)', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--ion-color-medium)', fontSize: 12 }} 
                      tickFormatter={(value) => value >= 1000 ? `$${(value/1000).toFixed(0)}k` : `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--ion-card-background)', 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                      }}
                      formatter={(value: any) => [`$${value?.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--ion-color-primary)" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* AI Insights */}
            {/* <section style={{ marginBottom: '36px' }}>
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
            </section> */}

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
                {recentTransactions.slice(0, 5).map((t, index) => (
                  <div
                    key={t.Id}
                    style={{
                      padding: '18px 20px',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(200px, 2.5fr) 120px 110px 90px',
                      gap: '16px',
                      alignItems: 'center',
                      borderBottom: index < recentTransactions.length - 1 ? '1px solid var(--ion-color-step-100, rgba(0,0,0,0.05))' : 'none',
                      transition: 'background 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ion-color-step-50, rgba(0,0,0,0.02))'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ 
                          width: '48px', height: '48px', borderRadius: '14px',
                          background: `hsl(${t.Id * 50}, 85%, 95%)`, 
                          color: `hsl(${t.Id * 50}, 70%, 40%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: '700', fontSize: '19px',
                          border: `2px solid hsl(${t.Id * 50}, 85%, 90%)`
                        }}>
                          {t.Client ? t.Client.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div style={{ overflow: 'hidden', minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ion-text-color)' }}>{t.Client}</div>
                        <div style={{ fontSize: '13px', color: 'var(--ion-color-medium)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>{t.ContactInfo || 'No contact info'}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '14px', color: 'var(--ion-color-step-600, #666)', fontWeight: 500 }}>
                      {t.BillingMonth}
                    </div>

                    <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '16px', color: 'var(--ion-text-color)' }}>
                      ${(t.StatusId === 2 ? t.AmountPaid : t.AmountDue).toLocaleString()}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <IonBadge color={
                          t.Status === 'Paid' ? 'success' :
                          t.Status === 'Pending' ? 'warning' : 'danger'
                        }
                        style={{ borderRadius: '8px', padding: '6px 12px', fontWeight: '600', fontSize: '12px' }}
                      >
                        {t.Status}
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
            <IonTitle>Transactions</IonTitle>
            <IonButtons slot="end">
        
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTransactions.map((t) => (
              <IonCard key={t.Id} style={{ margin: 0, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <IonCardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '42px', height: '42px', borderRadius: '10px',
                background: `hsl(${t.Id * 60}, 70%, 95%)`, color: `hsl(${t.Id * 60}, 70%, 40%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: '700', fontSize: '16px'
              }}>
                {t.Client ? t.Client.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--ion-text-color)' }}>{t.Client}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{t.ContactInfo}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--ion-text-color)' }}>${(t.StatusId === 2 ? t.AmountPaid : t.AmountDue).toLocaleString()}</div>
              <IonBadge color={t.Status === 'Paid' ? 'success' : t.Status === 'Pending' ? 'warning' : 'danger'} style={{ fontSize: '10px', marginTop: '2px' }}>
                {t.Status}
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