import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import LoginPage from "../../Pages/Login/Login";
import UserDashboardPage from "../../Pages/User/UserDashboard/UserDashboard";
import AdminDashboardPage from "../../Pages/Admin/AdminDashboard/AdminDashboard";

function App() {
	return (
		<Router>
			<div className="app">
				<Switch>
					<Route path="/admin-dashboard">
						<AdminDashboardPage/>
					</Route>
					<Route path="/user-dashboard">
						<UserDashboardPage/>
					</Route>
					<Route path="/">
						<LoginPage/>
					</Route>
				</Switch>
			</div>
		</Router>
	);
}

export default App;
