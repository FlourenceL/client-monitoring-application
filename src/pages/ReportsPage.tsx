import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonButton, 
  IonGrid, IonRow, IonCol, IonToast, IonLoading, IonBackButton, IonButtons,
  IonList, IonListHeader, IonIcon, IonBadge, IonItemSliding, IonItemOptions, IonItemOption,
  IonText, IonAvatar, IonChip
} from '@ionic/react';
import { 
  checkmarkDoneCircle, walletOutline, timeOutline, alertCircleOutline, 
  cashOutline, calendarOutline, refreshOutline, personCircleOutline,
  statsChartOutline 
} from 'ionicons/icons';
import collectionService from '../services/Collections.service';
import clientService from '../services/Clients.service';
import locationsService from '../services/Locations.service';
import paymentMethodsService from '../services/PaymentMethods.service';
import planService from '../services/Plans.service';
import { CreateCollectionDTO } from '../models/createModels/CollectionsModel';

const TransactionsPage: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ collected: 0, pending: 0, overdue: 0, total: 0 });
  
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Generation State
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    // Default to current month for viewing history or next month for generation?
    // User wants to see who paid/didn't pay for every month. Default to current makes sense.
    return String(now.getMonth() + 1).padStart(2, '0');
  });
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return String(new Date().getFullYear());
  });

  const getTargetMonth = () => `${selectedMonth}/${selectedYear}`;

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Generate a range of years (e.g., current year - 2 to + 5)
  const years = Array.from({length: 8}, (_, i) => {
      const y = new Date().getFullYear() - 2 + i;
      return String(y);
  });


  // Form State
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(undefined);
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(undefined);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | undefined>(undefined);
  const [statusId, setStatusId] = useState<number>(2); // Default to Paid (2) based on seed
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [amountDue, setAmountDue] = useState<number>(0);
  const [billingMonth, setBillingMonth] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  });
  // Use ISO string for ion-datetime? No, just keep simple input for now or date picker.
  // Actually, let's use a simple IonInput type="date"
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const clientsData = await clientService.getClients();
      setClients(clientsData || []);
      
      const locationsData = await locationsService.getLocations();
      setLocations(locationsData || []);

      const methodsData = await paymentMethodsService.getPaymentMethods();
      setPaymentMethods(methodsData || []);

      const plansData = await planService.getPlans();
      setPlans(plansData || []);
      
      // select default location if available
      if (locationsData && locationsData.length > 0) {
        setSelectedLocationId(locationsData[0].Id);
      }
       // select default payment method if available
       if (methodsData && methodsData.length > 0) {
        setSelectedPaymentMethodId(methodsData[0].Id);
      }

    } catch (error) {
      console.error("Error loading data", error);
      showToastMessage("Error loading initial data");
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (clientId: number) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.Id === clientId);
    if (client) {
      const plan = plans.find(p => p.Id === client.PlanId);
      if (plan) {
        setAmountDue(plan.Amount);
        setAmountPaid(plan.Amount); // Default pay full amount
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedClientId || !selectedLocationId || !selectedPaymentMethodId) {
      showToastMessage("Please fill in all required fields.");
      return;
    }

    const newCollection: CreateCollectionDTO = {
        UserId: 1, // Default user
        ClientId: selectedClientId,
        LocationId: selectedLocationId,
        StatusId: statusId, // 2 = Paid
        PaymentMethodId: selectedPaymentMethodId,
        BillingMonth: billingMonth,
        AmountDue: amountDue,
        AmountPaid: amountPaid,
        PaymentDate: paymentDate,
        CreateDate: new Date().toISOString()
    };

    setLoading(true);
    try {
        await collectionService.addCollection(newCollection);
        showToastMessage("Transaction added successfully!");
        
        // Reset form partially
        setAmountPaid(0);
        setSelectedClientId(undefined);
        setAmountDue(0);
        // Keep location and payment method
    } catch (error) {
        console.error("Error adding transaction", error);
        showToastMessage("Failed to add transaction.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedMonth, selectedYear]);

  const loadTransactions = async () => {
      try {
        await collectionService.updateOverdueTransactions();
        const generationMonth = getTargetMonth();
        const trns = await collectionService.getCollectionsByMonthDetailed(generationMonth);
        setTransactions(trns || []);
        
        // Calculate stats
        let c = 0, p = 0, o = 0, t = 0;
        trns.forEach((trn: any) => {
            const amount = trn.AmountDue || 0;
            const paid = trn.AmountPaid || 0;
            t += amount;
            if (trn.StatusId === 2) {
                c += paid;
            } else if (trn.StatusId === 3) {
                o += amount;
            } else {
                p += amount;
            }
        });
        setStats({ collected: c, pending: p, overdue: o, total: t });

      } catch (e) {
          console.error(e);
      }
  };

  const handleGenerate = async () => {
      setLoading(true);
      const generationMonth = getTargetMonth();
      try {
          const res = await collectionService.generateMonthlyTransactions(generationMonth);
          // check result
          if(res && res.success) {
              showToastMessage(`Checked/Generated ${res.count} transactions.`);
              await loadTransactions();
          } else {
              showToastMessage("Details: " + JSON.stringify(res));
          }
      } catch(e) {
          console.error(e);
          showToastMessage('Error generating transactions.');
      } finally {
          setLoading(false);
      }
  };

  const handleMarkPaid = async (item: any) => {
      setLoading(true);
      try {
          await collectionService.markAsPaid(item.Id);
          showToastMessage(`Marked ${item.Client}'s bill as Paid.`);
          await loadTransactions();
      } catch(e) {
          console.error(e);
          showToastMessage('Error marking paid.');
      } finally {
          setLoading(false);
      }
  };

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
                <IonBackButton defaultHref="/" />
            </IonButtons>
          <IonTitle>Transactions</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Transactions</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid>
          {/* STATS ROW */}
          <IonRow>
            <IonCol size="6" sizeMd="3">
              <IonCard color="tertiary">
                <IonCardContent className="ion-text-center">
                  <IonIcon size="large" icon={walletOutline} />
                  <h2>${stats.collected.toFixed(2)}</h2>
                  <p>Collected</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
             <IonCol size="6" sizeMd="3">
              <IonCard color="primary">
                <IonCardContent className="ion-text-center">
                  <IonIcon size="large" icon={statsChartOutline} />
                  <h2>${stats.total.toFixed(2)}</h2>
                  <p>Total Due</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6" sizeMd="3">
              <IonCard color="warning">
                <IonCardContent className="ion-text-center">
                  <IonIcon size="large" icon={timeOutline} />
                  <h2>${stats.pending.toFixed(2)}</h2>
                  <p>Pending</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6" sizeMd="3">
              <IonCard color="danger">
                <IonCardContent className="ion-text-center">
                  <IonIcon size="large" icon={alertCircleOutline} />
                  <h2>${stats.overdue.toFixed(2)}</h2>
                  <p>Overdue</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center ion-justify-content-between ion-padding-horizontal">
              <IonCol size="12" sizeMd="6">
                  <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                      <IonSelect 
                          interface="popover"
                          label="Month"
                          labelPlacement="stacked"
                          fill="outline" 
                          value={selectedMonth}
                          onIonChange={e => setSelectedMonth(e.detail.value)}
                         className="custom-select"
                      >
                          {months.map(m => (
                              <IonSelectOption key={m.value} value={m.value}>{m.label}</IonSelectOption>
                          ))}
                      </IonSelect>
                      
                       <IonSelect 
                          interface="popover"
                          label="Year"
                          labelPlacement="stacked"
                          fill="outline"
                          value={selectedYear}
                          onIonChange={e => setSelectedYear(e.detail.value)}
                           className="custom-select"
                      >
                          {years.map(y => (
                              <IonSelectOption key={y} value={y}>{y}</IonSelectOption>
                          ))}
                      </IonSelect>
                  </div>
              </IonCol>
              
              <IonCol size="12" sizeMd="6" className="ion-text-end">
                   <IonButton fill="solid" onClick={handleGenerate}>
                       <IonIcon slot="start" icon={refreshOutline} />
                       Generate / Refresh
                   </IonButton>
              </IonCol>
          </IonRow>

          <IonRow className="ion-justify-content-center">
            {/* LIST SECTION */}
            <IonCol size="12">
                <IonCard>
                    <IonCardContent className="ion-no-padding">
                        <IonList lines="full">
                           {transactions.length === 0 && (
                               <div className="ion-padding ion-text-center">
                                   <IonIcon icon={calendarOutline} size="large" color="medium" />
                                   <p>No transactions found for {getTargetMonth()}</p>
                                   <IonButton fill="outline" size="small" onClick={handleGenerate}>Generate Now</IonButton>
                               </div>
                           )}
                           
                           {transactions.map(trn => {
                               // Status Logic
                               let statusBadgeStr = trn.Status || 'Pending';
                               if (trn.StatusId === 1) statusBadgeStr = 'Pending';
                               if (trn.StatusId === 2) statusBadgeStr = 'Paid';
                               if (trn.StatusId === 3) statusBadgeStr = 'Overdue';

                               let statusColor = "medium";
                               if (trn.StatusId === 1) statusColor = "warning";
                               if (trn.StatusId === 2) statusColor = "success";
                               if (trn.StatusId === 3) statusColor = "danger";

                               return (
                               <IonItemSliding key={trn.Id}>
                                   <IonItem detail={false}>
                                       <IonAvatar slot="start">
                                           <div style={{
                                               width:'100%', height:'100%', background:'#eee', 
                                               borderRadius:'50%', display:'flex', 
                                               alignItems:'center', justifyContent:'center',
                                               color: '#666', fontWeight:'bold'
                                            }}>
                                               {trn.Client ? trn.Client.charAt(0).toUpperCase() : '?'}
                                           </div>
                                       </IonAvatar>
                                       <IonLabel>
                                           <h2>{trn.Client}</h2>
                                           <p>{trn.Location || 'Unknown Location'} | Due: ${trn.AmountDue}</p>
                                       </IonLabel>
                                       <IonChip color={statusColor} outline={true}>
                                           <IonLabel>{statusBadgeStr}</IonLabel>
                                       </IonChip>
                                        
                                        {/* Quick Action Button */}
                                        { trn.StatusId !== 2 && (
                                            <IonButton fill="clear" slot="end" onClick={() => handleMarkPaid(trn)}>
                                                <IonIcon slot="icon-only" icon={checkmarkDoneCircle} />
                                            </IonButton>
                                        )}
                                   </IonItem>

                                   <IonItemOptions side="end">
                                        <IonItemOption color="success" onClick={() => handleMarkPaid(trn)}>
                                            <IonIcon slot="start" icon={checkmarkDoneCircle} />
                                            Mark Paid
                                        </IonItemOption>
                                   </IonItemOptions>
                               </IonItemSliding>
                           )})}
                        </IonList>
                    </IonCardContent>
                </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={loading} message={'Processing...'} duration={0} />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default TransactionsPage;
