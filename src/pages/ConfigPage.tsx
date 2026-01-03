import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonCard,
	IonCardHeader,
	IonCardTitle,
	IonCardContent,
	IonIcon,
	IonButton,
	useIonToast,
} from "@ionic/react";
import { constructOutline } from "ionicons/icons";
import React from "react";
import { databaseService } from "../database/Database.service";

interface ConfigPageProps {}

const ConfigPage: React.FC<ConfigPageProps> = () => {
	const [present] = useIonToast();

	const testConnection = async () => {
		try {
			const res = await databaseService.query("SELECT 1 as test");
			if (res && res.length > 0) {
				present({
					message: "Database connection successful!",
					duration: 3000,
					color: "success",
					position: "bottom",
				});
			} else {
				throw new Error("Test query returned no results or DB not initialized");
			}
		} catch (error) {
			console.error(error);
			present({
				message:
					"Database connection failed: " +
					(error instanceof Error ? error.message : String(error)),
				duration: 3000,
				color: "danger",
				position: "bottom",
			});
		}
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Configurations</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Configurations</IonTitle>
					</IonToolbar>
				</IonHeader>
				<div className="ion-padding">
					<IonCard>
						<IonCardHeader>
							<IonCardTitle className="ion-text-center">
								<IonIcon
									icon={constructOutline}
									size="large"
									color="warning"
								/>
								<br />
								Under Construction
							</IonCardTitle>
						</IonCardHeader>
						<IonCardContent className="ion-text-center">
							This page is currently being built. Please check back later for
							updates.
						</IonCardContent>
					</IonCard>

					<IonButton onClick={testConnection}>Test DB connection</IonButton>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default ConfigPage;
