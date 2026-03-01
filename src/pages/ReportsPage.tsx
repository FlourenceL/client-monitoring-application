import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonButton, 
  IonGrid, IonRow, IonCol, IonToast, IonLoading, IonBackButton, IonButtons
} from '@ionic/react';
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
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
            <IonTitle size="large">Add Transaction</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard>
                <IonCardContent>
                    
                  <IonItem>
                    <IonSelect 
                        label="Client"
                        labelPlacement="stacked"
                        value={selectedClientId} 
                        placeholder="Select Client" 
                        onIonChange={e => handleClientChange(e.detail.value)}
                    >
                      {clients.map(client => (
                        <IonSelectOption key={client.Id} value={client.Id}>
                          {client.Client}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonSelect 
                        label="Location"
                        labelPlacement="stacked"
                        value={selectedLocationId} 
                        placeholder="Select Location"
                        onIonChange={e => setSelectedLocationId(e.detail.value)}
                    >
                      {locations.map(loc => (
                        <IonSelectOption key={loc.Id} value={loc.Id}>
                          {loc.Location}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonInput 
                        label="Billing Month (MM/YYYY)"
                        labelPlacement="stacked"
                        value={billingMonth} 
                        onIonChange={e => setBillingMonth(e.detail.value!)}
                        placeholder="e.g. 03/2026"
                    />
                  </IonItem>

                  <IonItem>
                    <IonSelect 
                        label="Status"
                        labelPlacement="stacked"
                        value={statusId} 
                        onIonChange={e => setStatusId(e.detail.value)}
                    >
                        <IonSelectOption value={1}>Pending</IonSelectOption>
                        <IonSelectOption value={2}>Paid</IonSelectOption>
                        <IonSelectOption value={3}>Overdue</IonSelectOption>
                        <IonSelectOption value={4}>Cancelled</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                   <IonItem>
                    <IonSelect 
                        label="Payment Method"
                        labelPlacement="stacked"
                        value={selectedPaymentMethodId} 
                        placeholder="Select Payment Method"
                        onIonChange={e => setSelectedPaymentMethodId(e.detail.value)}
                    >
                      {paymentMethods.map(method => (
                        <IonSelectOption key={method.Id} value={method.Id}>
                          {method.PaymentMethod}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonInput 
                        label="Amount Due"
                        labelPlacement="stacked"
                        type="number" 
                        value={amountDue} 
                        onIonChange={e => setAmountDue(parseFloat(e.detail.value!) || 0)}
                    />
                  </IonItem>

                  <IonItem>
                    <IonInput 
                        label="Amount Paid"
                        labelPlacement="stacked"
                        type="number" 
                        value={amountPaid} 
                        onIonChange={e => setAmountPaid(parseFloat(e.detail.value!) || 0)}
                    />
                  </IonItem>

                  <IonItem>
                     <IonInput
                        label="Payment Date"
                        labelPlacement="stacked"
                        type="date"
                        value={paymentDate}
                        onIonChange={e => setPaymentDate(e.detail.value!)}
                     />
                  </IonItem>

                  <IonButton expand="block" className="ion-margin-top" onClick={handleSubmit}>
                    Add Transaction
                  </IonButton>

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
