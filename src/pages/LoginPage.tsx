import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput} from '@ionic/react';
import React from 'react';
import { useHistory } from 'react-router-dom';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const history = useHistory();

  const handleLogin = () => {
    // Logic to be handled by user
    onLogin();
    history.push('/dashboard'); // This will now correctly load MainTabs -> HomePage
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        <div className="ion-text-center" style={{ marginBottom: '2rem' }}>
        <h1>Welcome Back</h1>
        <p className="ion-text-muted">Please enter your credentials to access the dashboard.</p>
        </div>

        <IonItem lines="full" className="ion-margin-bottom">
        <IonLabel position="floating">Username</IonLabel>
        <IonInput type="text" placeholder="Enter your username"></IonInput>
        </IonItem>

        <IonItem lines="full" className="ion-margin-bottom">
        <IonLabel position="floating">Password</IonLabel>
        <IonInput type="password" placeholder="Enter your password"></IonInput>
        </IonItem>

        <IonButton expand="block" size="large" onClick={handleLogin} style={{ marginTop: '2rem' }}>
        Sign In
        </IonButton>
      </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
