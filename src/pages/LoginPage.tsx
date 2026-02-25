import { IonContent, IonPage, IonButton, IonInput, useIonToast, IonCard, IonCardContent, IonIcon } from '@ionic/react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { databaseService } from '../database/Database.service';
import { MstUser } from '../database/DatabaseConstants';
import { useAppStore } from '../store/appStore';
import { personOutline, lockClosedOutline } from 'ionicons/icons';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const history = useHistory();
  const {setUser} = useAppStore()
  const [present] = useIonToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
        present({
            message: 'Please enter both username and password',
            duration: 2000,
            color: 'warning'
        });
        return;
    }

    setIsLoading(true);

    try {
        const users = await databaseService.query(
            `SELECT * FROM ${MstUser} WHERE Username = ? AND Password = ?`,
            [username, password]
        );

        if (users && users.length > 0) {
            const user = users[0];
            setUser(user.User);
            present({
                message: 'Login successful! Welcome back.',
                duration: 1500,
                color: 'success'
            });
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
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content">
        <div className="login-container">
          <div className="login-wrapper">
            
            {/* Logo Section */}
            <div className="logo-section">
              <img 
                src="/assets/happy-link-logo.png" 
                alt="Happy Link Services" 
                className="login-logo"
                onError={(e) => {
                  // Fallback if logo not found
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            {/* Login Card */}
            <IonCard className="login-card">
              <IonCardContent>
                <div className="login-header">
                  <h1>Welcome Back</h1>
                  <p>Please sign in to continue to your dashboard</p>
                </div>
                <div className="login-form">
                  <div className="input-group">
                  
                    <IonInput 
                      type="text" 
                      fill="outline"
                      labelPlacement="floating"
                      label="Username"
                      value={username}
                      onIonInput={(e) => setUsername(e.detail.value!)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="custom-input"
                    />
                  </div>
                  
                  <div className="input-group">
                    <IonInput 
                      type="password" 
                      fill="outline"
                      label="Password"
                      labelPlacement="floating"    
                      value={password}
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="custom-input"
                    />
                  </div>

                  <IonButton 
                    expand="block" 
                    size="large" 
                    onClick={handleLogin} 
                    className="login-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </IonButton>
                </div>

                <div className="login-footer">
                  <p className="footer-text">Happy Link Services © 2026</p>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
