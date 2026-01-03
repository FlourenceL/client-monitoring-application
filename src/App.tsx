import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
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

setupIonicReact();

const App: React.FC = () => (
	<IonApp>
		<IonReactRouter>
			<IonTabs>
				<IonRouterOutlet>
					<Route
						exact
						path="/dashboard"
					>
						<HomePage />
					</Route>
					<Route
						exact
						path="/reports"
					>
						<ReportsPage />
					</Route>
					<Route
						exact
						path="/aitools"
					>
						<AiToolsPage />
					</Route>
					<Route path="/clients">
						<ClientsPage />
					</Route>
					<Route
						exact
						path="/"
					>
						<Redirect to="/dashboard" />
					</Route>
					<Route path="/config">
						<ConfigPage />
					</Route>
				</IonRouterOutlet>
				<IonTabBar slot="bottom">
					<IonTabButton
						tab="tab1"
						href="/dashboard"
					>
						<IonIcon
							aria-hidden="true"
							icon={homeOutline}
						/>
						<IonLabel>HOME</IonLabel>
					</IonTabButton>

					<IonTabButton
						tab="tab2"
						href="/reports"
					>
						<IonIcon
							aria-hidden="true"
							icon={barChartOutline}
						/>
						<IonLabel>REPORTS</IonLabel>
					</IonTabButton>

					<IonTabButton
						tab="tab5"
						href="/aitools"
					>
						<IonIcon
							aria-hidden="true"
							icon={hardwareChipOutline}
						/>
						<IonLabel>AI TOOL</IonLabel>
					</IonTabButton>

					<IonTabButton
						tab="tab3"
						href="/clients"
					>
						<IonIcon
							aria-hidden="true"
							icon={peopleOutline}
						/>
						<IonLabel>CLIENTS</IonLabel>
					</IonTabButton>

					<IonTabButton
						tab="tab4"
						href="/config"
					>
						<IonIcon
							aria-hidden="true"
							icon={settingsOutline}
						/>
						<IonLabel>CONFIG</IonLabel>
					</IonTabButton>
				</IonTabBar>
			</IonTabs>
		</IonReactRouter>
	</IonApp>
);

export default App;
