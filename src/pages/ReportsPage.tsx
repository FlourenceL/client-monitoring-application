import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonSegment, IonSegmentButton, IonLabel, IonCardContent,
  IonButton, IonSelect, IonSelectOption, IonIcon
 } from '@ionic/react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis,
  YAxis, Tooltip, Legend, Line, Bar, BarChart, Area, AreaChart, PieChart, Pie, Cell
 } from 'recharts';
import { useState } from 'react';
import { filterCircleOutline } from 'ionicons/icons';

const data = [
  { name: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
  { name: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
  { name: 'Mar', revenue: 2000, expenses: 1200, profit: 800 },
  { name: 'Apr', revenue: 2780, expenses: 1908, profit: 872 },
  { name: 'May', revenue: 1890, expenses: 1200, profit: 690 },
  { name: 'Jun', revenue: 2390, expenses: 1500, profit: 890 },
  { name: 'Jul', revenue: 3490, expenses: 2100, profit: 1390 },
];

const paymentData = [
  { name: 'Paid', value: 4000, color: '#4caf50' },
  { name: 'Pending', value: 2400, color: '#ff9800' },
  { name: 'Overdue', value: 1200, color: '#f44336' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '12px', 
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        border: '1px solid #e0e0e0'
      }}>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color, fontWeight: 600 }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ReportsPage: React.FC = () => {
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Performance</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Reports</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
            <section style={{ marginBottom: '1rem' }}>
            <IonCard>
              <IonCardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IonLabel><IonIcon icon={filterCircleOutline} style={{ fontSize: '2rem' }} /></IonLabel>
                <IonSelect 
                  interface="popover" 
                  value="all"
                  style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  minWidth: '140px',
                  '--padding-start': '10px'
                  }}
                >
                  <IonSelectOption value="all">All Time</IonSelectOption>
                  <IonSelectOption value="thisMonth">This Month</IonSelectOption>
                  <IonSelectOption value="lastMonth">Last Month</IonSelectOption>
                  <IonSelectOption value="last3Months">Last 3 Months</IonSelectOption>
                  <IonSelectOption value="thisYear">This Year</IonSelectOption>
                </IonSelect>
              </div>
              
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', flex: 1 }}>
                <IonButton color="success" size="small">
                Export Excel
                </IonButton>
                <IonButton color="danger" size="small">
                Export PDF
                </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
            </section>

          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginLeft: '0.5rem' }}>Financial Overview</h2>
              <IonSegment value={chartType} onIonChange={e => setChartType(e.detail.value as any)}>
                <IonSegmentButton value="area">
                  <IonLabel>Area</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="line">
                  <IonLabel>Line</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>
            <IonCard style={{ height: '400px', padding: '1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1}/>
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={3} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#ff9800" strokeWidth={2} fill="url(#colorExpenses)" name="Expenses" />
              </AreaChart>
              ) : (
              <LineChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={3} dot={{ r: 5 }} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ff9800" strokeWidth={3} dot={{ r: 5 }} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#4caf50" strokeWidth={3} dot={{ r: 5 }} name="Profit" />
              </LineChart>
              )}
              </ResponsiveContainer>
            </IonCard>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', marginLeft: '0.5rem' }}>Payment Distribution</h2>
            <IonCard style={{ height: '320px', padding: '1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </IonCard>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportsPage;