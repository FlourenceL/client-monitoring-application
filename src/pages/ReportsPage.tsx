import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonButton, 
  IonGrid, IonRow, IonCol, IonToast, IonLoading, IonBackButton, IonButtons,
  IonList, IonListHeader, IonIcon, IonBadge, IonItemSliding, IonItemOptions, IonItemOption,
  IonText, IonAvatar, IonChip, IonProgressBar, IonModal, useIonViewWillEnter, isPlatform
} from '@ionic/react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { 
  checkmarkDoneCircle, walletOutline, timeOutline, alertCircleOutline, 
  cashOutline, calendarOutline, refreshOutline, personCircleOutline,
  statsChartOutline, locationOutline, documentTextOutline 
} from 'ionicons/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import collectionService from '../services/Collections.service';
import clientService from '../services/Clients.service';
import locationsService from '../services/Locations.service';
import paymentMethodsService from '../services/PaymentMethods.service';
import planService from '../services/Plans.service';
import { CreateCollectionDTO } from '../models/createModels/CollectionsModel';

const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if(!ctx) { reject("Canvas error"); return; }
          
          // Resize to reasonable width (e.g., 500px is sufficient for a logo)
          const MAX_WIDTH = 500; 
          let width = img.width;
          let height = img.height;
          
          if(width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Use PNG to preserve transparency, but resized
          resolve(canvas.toDataURL('image/png')); 
          URL.revokeObjectURL(img.src);
      };
      img.onerror = (err) => {
          URL.revokeObjectURL(img.src);
          reject(err);
      };
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
};

const TransactionsPage: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterLocation, setFilterLocation] = useState<string>('all');
  
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // PDF Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfMonth, setPdfMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [pdfYear, setPdfYear] = useState<string>(() => String(new Date().getFullYear()));
  const [pdfLocation, setPdfLocation] = useState<string>('all');

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


  useIonViewWillEnter(() => {
    loadData();
  });

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
        
      } catch (e) {
          console.error(e);
      }
  };

  const filteredTransactions = React.useMemo(() => {
    let data = transactions;
    if (filterLocation !== 'all') {
        data = transactions.filter((t: any) => {
            // Handle various id types/names if needed. Assuming LocationId is present and matches.
            return t.LocationId == filterLocation; 
        });
    }

    // Sort: Overdue (3) -> Pending (1) -> Paid (2)
    return [...data].sort((a: any, b: any) => {
      const getPriority = (statusId: number) => {
        if (statusId === 3) return 0; // Overdue First
        if (statusId === 1) return 1; // Pending Second
        if (statusId === 2) return 2; // Paid Last
        return 3;
      };
      
      const priorityDiff = getPriority(a.StatusId) - getPriority(b.StatusId);
      if (priorityDiff !== 0) return priorityDiff;

      // Secondary Sort: Date (Earliest first) based on Day of DateInstalled
      const getDay = (dateStr: string) => {
          if (!dateStr) return 99;
          const d = new Date(dateStr);
          return isNaN(d.getTime()) ? 99 : d.getDate();
      };
      return getDay(a.DateInstalled) - getDay(b.DateInstalled);
    });
  }, [transactions, filterLocation]);

  const stats = React.useMemo(() => {
    let c = 0, p = 0, o = 0, t = 0;
    filteredTransactions.forEach((trn: any) => {
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
    return { collected: c, pending: p, overdue: o, total: t };
  }, [filteredTransactions]);

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

  const handleGeneratePdf = async () => {
    setShowPdfModal(false);
    showToastMessage(`Generating PDF report for ${pdfMonth}/${pdfYear}...`);
    setLoading(true);

    try {
        const generationMonth = `${pdfMonth}/${pdfYear}`;
        
        // Fetch data
        let transactionsData = (await collectionService.getCollectionsByMonthDetailed(generationMonth)) || [];
        
        // Filter by location
        let locationName = "All Locations";
        if(pdfLocation !== 'all') {
            // Ensure comparison works regardless of type (string/number)
            transactionsData = transactionsData.filter((t: any) => String(t.LocationId) === String(pdfLocation));
            const foundLoc = locations.find(l => String(l.Id) === String(pdfLocation));
            if(foundLoc) locationName = foundLoc.Location;
        }

        // Calculate Stats
        let total = 0, collected = 0, overdue = 0, pending = 0;
        transactionsData.forEach((t: any) => {
             const amount = t.AmountDue || 0;
             const paid = t.AmountPaid || 0;
             total += amount;
             if(t.StatusId === 2) collected += paid;
             else if(t.StatusId === 3) overdue += amount;
             else pending += amount;
        });

        // Generate PDF
        const doc = new jsPDF({ compress: true });
        
        // Add Logo
        try {
            const logoData = await getBase64ImageFromUrl('/assets/happy-link-report-logo.png');
            if (logoData) {
                // Add logo at top right (A4 width is ~210mm)
                // Use default compression 'FAST' or similar if resizing wasn't enough, but resizing is key.
                doc.addImage(logoData, 'PNG', 160, 10, 35, 35, undefined, 'FAST');
            }
        } catch (e) {
            console.warn("Logo not found or could not be loaded");
        }
        
        // Title
        doc.setFontSize(22);
        doc.setTextColor(33, 33, 33);
        doc.text("Monthly Collection Report", 14, 25);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Period: ${generationMonth}`, 14, 33);
        doc.text(`Location: ${locationName}`, 14, 39);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 45);
        doc.setTextColor(0, 0, 0);

        // Summary Box
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(250, 252, 255);
        doc.roundedRect(14, 55, 180, 28, 3, 3, 'FD');
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        
        doc.text("Total Expected:", 22, 65);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`$${total.toLocaleString()}`, 22, 72);
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text("Collected:", 65, 65);
        doc.setFontSize(12);
        doc.setTextColor(40, 167, 69); // Green
        doc.text(`$${collected.toLocaleString()}`, 65, 72);

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text("Pending:", 108, 65);
        doc.setFontSize(12);
        doc.setTextColor(255, 152, 0); // Orange
        doc.text(`$${pending.toLocaleString()}`, 108, 72);
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text("Overdue:", 151, 65);
        doc.setFontSize(12);
        doc.setTextColor(220, 53, 69); // Red
        doc.text(`$${overdue.toLocaleString()}`, 151, 72);
        
        doc.setTextColor(0, 0, 0);

        // Table
        const tableColumn = ["Due Date", "Client", "Location", "Status", "Due", "Paid"];
        const tableRows: any[] = [];

        transactionsData.forEach((t: any) => {
            let statusText = "Pending";
            if(t.StatusId === 2) statusText = "Paid";
            else if(t.StatusId === 3) statusText = "Overdue";

            // Calculate Due Date
            let dueDateStr = "N/A";
            if(t.DateInstalled) {
                try {
                   // DateInstalled format usually ISO or YYYY-MM-DD
                   const installedDate = new Date(t.DateInstalled);
                   if(!isNaN(installedDate.getTime())) {
                       const installDay = installedDate.getDate();
                       if (t.BillingMonth) {
                            const [m, y] = t.BillingMonth.split('/'); // e.g. '03' and '2026'
                            const monthInt = parseInt(m);
                            const yearInt = parseInt(y);
                            
                            // Check max days in month (0th day of next month gives last day of current)
                            const lastDayOfMonth = new Date(yearInt, monthInt, 0).getDate();
                            const finalDay = Math.min(installDay, lastDayOfMonth);
                            
                            dueDateStr = `${m}/${String(finalDay).padStart(2, '0')}/${y}`;
                       }
                   }
                } catch(e) {
                    console.error("Date error", e);
                }
            }

            const rowData = [
                dueDateStr,
                t.Client,
                t.Location,
                statusText,
                `$${(t.AmountDue || 0).toLocaleString()}`,
                `$${(t.AmountPaid || 0).toLocaleString()}`,
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            startY: 95,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { 
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: { fontSize: 10, cellPadding: 3 },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            columnStyles: {
                0: { cellWidth: 25 }, // Due Date
                1: { cellWidth: 50 }, // Client
                2: { cellWidth: 35 }, // Location
                // ...
            }
        });

        // Add Page Numbers
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(150);
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            // A4 size is roughly 210mm x 297mm
            doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: 'right' });
        }

        const fileName = `Report_${generationMonth.replace('/', '-')}_${pdfLocation}.pdf`;

        if (isPlatform('hybrid')) {
            try {
                const pdfBase64 = doc.output('datauristring').split(',')[1];
                
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: pdfBase64,
                    directory: Directory.Documents,
                });
                
                await FileOpener.open({
                    filePath: savedFile.uri,
                    contentType: 'application/pdf',
                    openWithDefault: true,
                });

                showToastMessage("PDF Report saved to Documents and opened.");
            } catch (err) {
                console.error('Error saving file', err);
                try {
                     // Fallback to cache if documents fails
                     const pdfBase64 = doc.output('datauristring').split(',')[1];
                     const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: pdfBase64,
                        directory: Directory.Cache,
                    });
                    
                    await FileOpener.open({
                        filePath: savedFile.uri,
                        contentType: 'application/pdf',
                        openWithDefault: true,
                    });
                    showToastMessage("PDF saved to temp storage and opened.");
                } catch (storeErr) {
                    console.error('Error saving to cache', storeErr);
                    showToastMessage("Unable to save or open PDF on this device.");
                }
            }
        } else {
            doc.save(fileName);
            showToastMessage("PDF Report downloaded successfully.");
        }

    } catch (e) {
        console.error("Error generating PDF", e);
        showToastMessage("Failed to generate PDF report.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <IonPage>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card {
            transition: transform 0.2s ease;
        }
        .stat-card:active {
            transform: scale(0.98);
        }
      `}</style>
      <IonHeader>
        <IonToolbar>
            <IonButtons slot="end">
                <IonButton onClick={() => setShowPdfModal(true)}>
                    <IonIcon slot="icon-only" icon={documentTextOutline} />
                </IonButton>
            </IonButtons>
          <IonTitle>Transactions</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding-vertical">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Transactions</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding-horizontal ion-margin-bottom">
            <IonText color="medium">
                <p style={{marginBottom: '5px', fontSize: '14px', fontWeight: '500'}}>COLLECTION PROGRESS</p>
            </IonText>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '8px'}}>
                <h1 style={{margin: 0, fontWeight: '800', fontSize: '32px', color: 'var(--ion-color-dark)'}}>
                    ${stats.collected.toLocaleString()} 
                    <span style={{fontSize: '16px', color: 'var(--ion-color-medium)', fontWeight: 'normal'}}> / ${stats.total.toLocaleString()}</span>
                </h1>
                <IonChip color="success" style={{margin: 0}}>
                    {stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0}% Done
                </IonChip>
            </div>
            <IonProgressBar 
                value={stats.total > 0 ? stats.collected / stats.total : 0} 
                color="success" 
                style={{height: '10px', borderRadius: '5px', background: 'rgba(var(--ion-color-success-rgb), 0.2)'}} 
            />
        </div>

        <IonGrid>
          {/* STATS ROW */}
          <IonRow className="ion-padding-bottom">

            <IonCol size="6" sizeMd="3">
              <div style={{
                  background: 'linear-gradient(135deg, #4cc9f0, #4361ee)',
                  borderRadius: '24px',
                  padding: '24px 20px',
                  color: 'white',
                  boxShadow: '0 8px 25px -5px rgba(76, 201, 240, 0.5)',
                   height: '100%',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                  position: 'relative', overflow: 'hidden'
              }}>
                   <div style={{
                    position: 'absolute', top: -20, right: -20, width: 90, height: 90,
                    background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1
                  }}></div>

                  <div style={{ position: 'relative', zIndex: 2 }}>
                       <div style={{
                        background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px',
                        margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                       }}>
                        <IonIcon icon={statsChartOutline} style={{ fontSize: '24px' }} />
                      </div>
                      <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>${stats.total.toLocaleString()}</h2>
                      <p style={{ fontSize: '13px', opacity: 0.9, margin: '4px 0 0', fontWeight: '500' }}>Total Due</p>
                  </div>
              </div>
            </IonCol>

            <IonCol size="6" sizeMd="3">
              <div style={{
                  background: 'linear-gradient(135deg, #2dd36f, #1ea354)',
                  borderRadius: '24px',
                  padding: '24px 20px',
                  color: 'white',
                  boxShadow: '0 8px 25px -5px rgba(45, 211, 111, 0.5)',
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                  position: 'relative', overflow: 'hidden'
              }}>
                   <div style={{
                    position: 'absolute', top: -20, right: -20, width: 90, height: 90,
                    background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1
                  }}></div>

                  <div style={{ position: 'relative', zIndex: 2 }}>
                       <div style={{
                        background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px',
                        margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                       }}>
                        <IonIcon icon={walletOutline} style={{ fontSize: '24px' }} />
                      </div>
                      <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>${stats.collected.toLocaleString()}</h2>
                      <p style={{ fontSize: '13px', opacity: 0.9, margin: '4px 0 0', fontWeight: '500' }}>Collected</p>
                  </div>
              </div>
            </IonCol>
            
            <IonCol size="6" sizeMd="3">
              <div style={{
                  background: 'linear-gradient(135deg, #ffc409, #e0ac08)',
                  borderRadius: '24px',
                  padding: '24px 20px',
                  color: 'white',
                  boxShadow: '0 8px 25px -5px rgba(255, 196, 9, 0.5)',
                   height: '100%',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                  position: 'relative', overflow: 'hidden'
              }}>
                   <div style={{
                    position: 'absolute', top: -20, right: -20, width: 90, height: 90,
                    background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1
                  }}></div>

                  <div style={{ position: 'relative', zIndex: 2 }}>
                       <div style={{
                        background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px',
                        margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                       }}>
                        <IonIcon icon={timeOutline} style={{ fontSize: '24px' }} />
                      </div>
                      <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>${stats.pending.toLocaleString()}</h2>
                      <p style={{ fontSize: '13px', opacity: 0.9, margin: '4px 0 0', fontWeight: '500' }}>Pending</p>
                  </div>
              </div>
            </IonCol>

             <IonCol size="6" sizeMd="3">
              <div style={{
                  background: 'linear-gradient(135deg, #eb445a, #c5000f)',
                  borderRadius: '24px',
                  padding: '24px 20px',
                  color: 'white',
                  boxShadow: '0 8px 25px -5px rgba(235, 68, 90, 0.5)',
                   height: '100%',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                  position: 'relative', overflow: 'hidden'
              }}>
                   <div style={{
                    position: 'absolute', top: -20, right: -20, width: 90, height: 90,
                    background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1
                  }}></div>

                  <div style={{ position: 'relative', zIndex: 2 }}>
                       <div style={{
                        background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px',
                        margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                       }}>
                        <IonIcon icon={alertCircleOutline} style={{ fontSize: '24px' }} />
                      </div>
                      <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>${stats.overdue.toLocaleString()}</h2>
                      <p style={{ fontSize: '13px', opacity: 0.9, margin: '4px 0 0', fontWeight: '500' }}>Overdue</p>
                  </div>
              </div>
            </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center ion-justify-content-between ion-padding-horizontal ion-margin-bottom">
              <IonCol size="12" sizeMd="8">
                  <div style={{
                      display:'flex', gap:'15px', alignItems:'center', 
                      background: 'var(--ion-card-background)', padding: '6px 12px', borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--ion-color-step-50, rgba(0,0,0,0.05))',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{background: 'var(--ion-color-light)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <IonIcon icon={calendarOutline} color="medium" />
                      </div>
                      <IonSelect 
                          interface="popover"
                          label="Month"
                          fill="outline" 
                          mode="ios"
                          value={selectedMonth}
                          onIonChange={e => setSelectedMonth(e.detail.value)}
                         className="custom-select no-border-select"
                         style={{flex: 1, minWidth: '80px', '--border-width': '0', '--padding-start': '0'}}
                      >
                          {months.map(m => (
                              <IonSelectOption key={m.value} value={m.value}>{m.label}</IonSelectOption>
                          ))}
                      </IonSelect>
                      
                       <div style={{height: '24px', width: '1px', background: '#eee'}}></div>

                       <IonSelect 
                          interface="popover"
                          label="Year"
                          fill="outline"
                          mode="ios"
                          value={selectedYear}
                          onIonChange={e => setSelectedYear(e.detail.value)}
                           className="custom-select no-border-select"
                           style={{flex: 1, minWidth: '60px', '--border-width': '0', '--padding-start': '0'}}
                      >
                          {years.map(y => (
                              <IonSelectOption key={y} value={y}>{y}</IonSelectOption>
                          ))}
                      </IonSelect>

                      <div style={{height: '24px', width: '1px', background: '#eee'}}></div>

                      <div style={{display:'flex', alignItems:'center', flex: 1.5, minWidth: '120px'}}>
                          <IonIcon icon={locationOutline} color="medium" style={{marginRight: '8px'}} />
                          <IonSelect 
                              interface="popover"
                              label="Filter Location"
                              placeholder="All Locations"
                              fill="outline"
                              mode="ios"
                              value={filterLocation}
                              onIonChange={e => setFilterLocation(e.detail.value)}
                              className="custom-select no-border-select"
                              style={{ width: '100%', '--border-width': '0', '--padding-start': '0' }}
                          >
                              <IonSelectOption value="all">All Locations</IonSelectOption>
                              {locations.map(loc => (
                                  <IonSelectOption key={loc.Id} value={loc.Id}>{loc.Location}</IonSelectOption>
                              ))}
                          </IonSelect>
                      </div>
                  </div>
              </IonCol>
              
              <IonCol size="12" sizeMd="4" className="ion-text-end">
                   <IonButton fill="solid" shape="round" color="dark" onClick={handleGenerate} style={{height: '48px', margin: '0', fontWeight: '600', '--box-shadow': '0 4px 12px rgba(0,0,0,0.1)'}}>
                       <IonIcon slot="start" icon={refreshOutline} />
                       Generate/Refresh
                   </IonButton>
              </IonCol>
          </IonRow>

          <IonRow className="ion-justify-content-center">
            {/* LIST SECTION */}
            <IonCol size="12">
                {/* Removed IonCard wrapper for a cleaner list look */}
                <div className="ion-padding-horizontal">
                    <IonList style={{background: 'transparent', paddingBottom: '40px'}}>
                        {filteredTransactions.length === 0 && (
                            <div className="ion-padding ion-text-center" style={{marginTop: '40px'}}>
                                <div style={{
                                    background: 'rgba(var(--ion-color-primary-rgb), 0.05)', 
                                    width: '120px', height: '120px', borderRadius: '50%', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    margin: '0 auto 20px',
                                    color: 'var(--ion-color-primary)'
                                }}>
                                    <IonIcon icon={calendarOutline} style={{fontSize: '48px'}} />
                                </div>
                                <h3 style={{color: 'var(--ion-color-dark)', fontWeight: 'bold', fontSize: '20px'}}>No Transactions Found</h3>
                                <p style={{color: 'var(--ion-color-medium)', maxWidth: '280px', margin: '10px auto'}}>
                                    {filterLocation !== 'all' ? 'Try changing the location filter or generate a new report.' : `We couldn't find any collection records for ${getTargetMonth()}.`}
                                </p>
                                {filterLocation === 'all' && (
                                    <IonButton fill="outline" shape="round" className="ion-margin-top" onClick={handleGenerate}>
                                        Generate Report
                                    </IonButton>
                                )}
                            </div>
                        )}
                        
                        {filteredTransactions.map((trn, index) => {
                            // Status Logic
                            let statusBadgeStr = trn.Status || 'Pending';
                            if (trn.StatusId === 1) statusBadgeStr = 'Pending';
                            if (trn.StatusId === 2) statusBadgeStr = 'Paid';
                            if (trn.StatusId === 3) statusBadgeStr = 'Overdue';

                            let statusColor = "medium";
                            if (trn.StatusId === 1) statusColor = "warning";
                            if (trn.StatusId === 2) statusColor = "success";
                            if (trn.StatusId === 3) statusColor = "danger";

                            const isPaid = trn.StatusId === 2;
                            const isOverdue = trn.StatusId === 3;

                            // Calculate Due Date Display
                            let dueDateStr = "";
                            if(trn.DateInstalled && trn.BillingMonth) {
                                try {
                                   const installedDate = new Date(trn.DateInstalled);
                                   if(!isNaN(installedDate.getTime())) {
                                       const installDay = installedDate.getDate();
                                       const [m, y] = trn.BillingMonth.split('/');
                                       const mInt = parseInt(m);
                                       const yInt = parseInt(y);
                                       const lastDay = new Date(yInt, mInt, 0).getDate();
                                       const day = Math.min(installDay, lastDay);
                                       dueDateStr = `${m}/${day}`;
                                   }
                                } catch {}
                            }

                            return (
                            <IonCard key={trn.Id} style={{
                                borderRadius: '20px', 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                                border: isPaid ? '1px solid rgba(var(--ion-color-success-rgb), 0.1)' : (isOverdue ? '1px solid rgba(var(--ion-color-danger-rgb), 0.1)' : '1px solid var(--ion-color-step-50, rgba(0,0,0,0.05))'),
                                margin: '0 0 16px 0',
                                background: 'var(--ion-card-background)',
                                transition: 'transform 0.2s',
                                animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                            }}>
                                <IonItemSliding>
                                <IonItem lines="none" detail={false} style={{'--background': 'transparent', '--padding-start': '16px', '--padding-end': '16px', '--inner-padding-end': '0', paddingTop: '12px', paddingBottom: '12px'}}>
                                    <IonAvatar slot="start" style={{width: '56px', height: '56px', marginRight: '20px'}}>
                                        <div style={{
                                            width:'100%', height:'100%', 
                                            background: isPaid ? 'rgba(var(--ion-color-success-rgb), 0.1)' : (isOverdue ? 'rgba(var(--ion-color-danger-rgb), 0.1)' : 'rgba(var(--ion-color-tertiary-rgb), 0.1)'),
                                            borderRadius:'18px', display:'flex', 
                                            alignItems:'center', justifyContent:'center',
                                            color: isPaid ? 'var(--ion-color-success)' : (isOverdue ? 'var(--ion-color-danger)' : 'var(--ion-color-tertiary)'), 
                                            fontWeight:'800', fontSize: '20px'
                                        }}>
                                            {trn.Client ? trn.Client.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    </IonAvatar>
                                    <IonLabel style={{margin: '0'}}>
                                        <h2 style={{fontWeight: '700', fontSize: '17px', marginBottom: '6px', letterSpacing: '-0.3px', color: 'var(--ion-color-dark)'}}>{trn.Client}</h2>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ion-color-medium)', fontSize: '13px', fontWeight: '500'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                                                <IonIcon icon={locationOutline} size="small" />
                                                <span>{trn.Location || 'Unknown'}</span>
                                            </div>
                                            { dueDateStr && (
                                                <div style={{display:'flex', alignItems:'center', gap:'4px', marginLeft: '8px'}}>
                                                    <IonIcon icon={calendarOutline} size="small" />
                                                    <span>Due: {dueDateStr}</span>
                                                </div>
                                            )}
                                            { isOverdue && <span style={{color: 'var(--ion-color-danger)', background: 'rgba(var(--ion-color-danger-rgb), 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', textTransform:'uppercase', fontWeight:'bold', marginLeft: '6px'}}>Late</span> }
                                        </div>
                                    </IonLabel>
                                    
                                    <div slot="end" className="ion-text-end" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
                                        <h3 style={{fontWeight: '800', fontSize: '18px', color: isPaid ? 'var(--ion-color-success)' : 'var(--ion-color-dark)', margin: 0}}>
                                            ${trn.AmountDue?.toLocaleString()}
                                        </h3>
                                        <div style={{fontSize: '12px', color: isPaid ? 'var(--ion-color-success)' : (isOverdue ? 'var(--ion-color-danger)' : 'var(--ion-color-warning)'), fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                            <div style={{width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor'}}></div>
                                            {statusBadgeStr}
                                        </div>
                                    </div>
                                    
                                    {/* Action Button for non-paid items */}
                                    { !isPaid && (
                                        <IonButton 
                                            fill="clear" 
                                            slot="end" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkPaid(trn);
                                            }}
                                            style={{marginLeft: '4px', height: '44px', width: '44px', '--padding-start': '0', '--padding-end': '0', color: 'var(--ion-color-medium)'}}
                                        >
                                            <IonIcon slot="icon-only" icon={checkmarkDoneCircle} />
                                        </IonButton>
                                    )}
                                </IonItem>

                                <IonItemOptions side="end">
                                    <IonItemOption color="success" onClick={() => handleMarkPaid(trn)}>
                                        <IonIcon slot="top" icon={checkmarkDoneCircle} />
                                        Mark Paid
                                    </IonItemOption>
                                </IonItemOptions>
                                </IonItemSliding>
                            </IonCard>
                        )})}
                    </IonList>
                </div>
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

        <IonModal isOpen={showPdfModal} onDidDismiss={() => setShowPdfModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Generate Report</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowPdfModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList lines="full">
              <IonItem>
                <IonLabel position="stacked">Month</IonLabel>
                <IonSelect value={pdfMonth} onIonChange={e => setPdfMonth(e.detail.value)}>
                  {months.map(m => (
                    <IonSelectOption key={m.value} value={m.value}>{m.label}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Year</IonLabel>
                <IonSelect value={pdfYear} onIonChange={e => setPdfYear(e.detail.value)}>
                  {years.map(y => (
                    <IonSelectOption key={y} value={y}>{y}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Location</IonLabel>
                <IonSelect value={pdfLocation} onIonChange={e => setPdfLocation(e.detail.value)}>
                  <IonSelectOption value="all">All Locations</IonSelectOption>
                  {locations.map(loc => (
                    <IonSelectOption key={loc.Id} value={loc.Id}>{loc.Location}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>
            
            <div className="ion-padding-top ion-margin-top">
              <IonButton expand="block" onClick={handleGeneratePdf} color="primary" shape="round">
                <IonIcon slot="start" icon={documentTextOutline} />
                Generate PDF Report
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default TransactionsPage;
