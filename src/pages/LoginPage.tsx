import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput, useIonToast } from '@ionic/react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { databaseService } from '../database/Database.service';
import { MstUser } from '../database/DatabaseConstants';
import { useAppStore } from '../store/appStore';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const history = useHistory();
  const {setUser} = useAppStore()
  const [present] = useIonToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
        present({
            message: 'Please enter both username and password',
            duration: 2000,
            color: 'warning'
        });
        return;
    }

    try {
        const users = await databaseService.query(
            `SELECT * FROM ${MstUser} WHERE Username = ? AND Password = ?`,
            [username, password]
        );

        if (users && users.length > 0) {
            const user = users[0];
            setUser(user.User);
            onLogin();
            history.push('/dashboard'); 
        } else {
            present({
                message: 'Invalid username or password',
                duration: 2000,
                color: 'danger'
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        present({
            message: 'An error occurred during login',
            duration: 2000,
            color: 'danger'
        });
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        <div className="ion-text-center" style={{ marginBottom: '2rem' }}>
        <h1>Welcome Back</h1>
        <p className="ion-text-muted">Please enter your credentials to access the dashboard.</p>
        </div>
   
        <IonInput 
            type="text" 
            fill='solid'
            labelPlacement="floating"
            label='Enter username'
            value={username}
            onIonInput={(e) => setUsername(e.detail.value!)}
        ></IonInput>
     
        <IonInput 
            type="password" 
            fill='solid'
            label='Enter password'
            labelPlacement="floating"    
            value={password}
            onIonInput={(e) => setPassword(e.detail.value!)}
        ></IonInput>

        <IonButton expand="block" size="large" onClick={handleLogin} style={{ marginTop: '2rem' }}>
        Sign In
        </IonButton>
      </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
