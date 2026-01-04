import { Redirect, Route } from 'react-router-dom';
import {
	IonApp,
	IonIcon,
	IonLabel,
	IonRouterOutlet,
	IonTabBar,
	IonTabButton,
	IonTabs,
	setupIonicReact,
	useIonToast,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
	barChart,
	barChartOutline,
	ellipse,
	hardwareChipOutline,
	home,
	homeOutline,
	people,
	peopleOutline,
	settings,
	settingsOutline,
	square,
	thunderstorm,
	triangle,
} from "ionicons/icons";
import HomePage from "./pages/HomePage";
import ReportsPage from "./pages/ReportsPage";
import ClientsPage from "./pages/ClientsPage";
import ConfigPage from "./pages/ConfigPage";
import AiToolsPage from "./pages/AiToolsPage";
import { useEffect } from "react";
import { databaseService } from "./database/Database.service";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/components.css";
import LoginPage from "./pages/LoginPage";
import MainTabs from "./components/MainTabs";

setupIonicReact();

const App: React.FC = () => {
	const [presentToast] = useIonToast();
	useEffect(() => {
		try {
			databaseService.init();
		} catch (error) {
			presentToast({
				message: "Error initializing database service: " + error,
				duration: 3000,
				color: "danger",
				position: "bottom",
			});
		}
	}, []);

	return (
		<IonApp>
			<IonReactRouter>
				<IonRouterOutlet>
					<Route
						exact
						path="/login"
					>
						<LoginPage onLogin={() => {}} />
					</Route>
					<Route
						path="/dashboard"
						component={MainTabs}
					/>
					<Route
						path="/reports"
						component={MainTabs}
					/>
					<Route
						path="/clients"
						component={MainTabs}
					/>
					<Route
						path="/aitools"
						component={MainTabs}
					/>
					<Route
						path="/config"
						component={MainTabs}
					/>
					<Route
						exact
						path="/"
					>
						<Redirect to="/login" />
					</Route>
				</IonRouterOutlet>
			</IonReactRouter>
		</IonApp>
	);
};

export default App;
