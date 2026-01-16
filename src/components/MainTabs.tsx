import {
	IonIcon,
	IonLabel,
	IonRouterOutlet,
	IonTabBar,
	IonTabButton,
	IonTabs,
} from "@ionic/react";
import { Redirect, Route } from 'react-router-dom';
import {
	barChartOutline,
	barChartSharp,
	hardwareChipOutline,
	hardwareChipSharp,
	home,
	homeOutline,
	homeSharp,
	peopleCircleSharp,
	peopleOutline,
	settingsOutline,
	settingsSharp,
} from "ionicons/icons";
import HomePage from "../pages/HomePage";
import ReportsPage from "../pages/ReportsPage";
import ClientsPage from "../pages/ClientsPage";
import ConfigPage from "../pages/ConfigPage";
import AiToolsPage from "../pages/AiToolsPage";

const MainTabs: React.FC = () => {
	return (
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
						icon={homeSharp}
					/>
					<IonLabel>HOME</IonLabel>
				</IonTabButton>

				<IonTabButton
					tab="tab2"
					href="/reports"
				>
					<IonIcon
						aria-hidden="true"
						icon={barChartSharp}
					/>
					<IonLabel>REPORTS</IonLabel>
				</IonTabButton>

				{/* <IonTabButton
					tab="tab5"
					href="/aitools"
				>
					<IonIcon
						aria-hidden="true"
						icon={hardwareChipSharp}
					/>
					<IonLabel>AI TOOL</IonLabel>
				</IonTabButton> */}

				<IonTabButton
					tab="tab3"
					href="/clients"
				>
					<IonIcon
						aria-hidden="true"
						icon={peopleCircleSharp}
					/>
					<IonLabel>CLIENTS</IonLabel>
				</IonTabButton>

				<IonTabButton
					tab="tab4"
					href="/config"
				>
					<IonIcon
						aria-hidden="true"
						icon={settingsSharp}
					/>
					<IonLabel>CONFIG</IonLabel>
				</IonTabButton>
			</IonTabBar>
		</IonTabs>
	);
};

export default MainTabs;
