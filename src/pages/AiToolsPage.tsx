import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/react';
import { constructOutline, warningOutline } from 'ionicons/icons';
import React from 'react';

interface AiToolsPageProps {}

const AiToolsPage: React.FC<AiToolsPageProps> = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>AI Insights</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">AI Insights</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <div className="ion-padding">
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle className="ion-text-center">
                                <IonIcon icon={constructOutline} size="large" color="warning" />
                                <br />
                                Under Construction
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent className="ion-text-center">
                            This page is currently being built. Please check back later for ai powered insights.
                        </IonCardContent>
                    </IonCard>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default AiToolsPage;