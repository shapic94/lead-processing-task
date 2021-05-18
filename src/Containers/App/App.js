import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import UserDashboard from "../../Pages/User/UserDashboard";
import AdminDashboard from "../../Pages/Admin/AdminDashboard";
import LoginPage from "../../Pages/Login/Login";

function App() {
	return (
		<Router>
			<div className="container mt-5">
				<Switch>
					<Route path="/admin-dashboard">
						<AdminDashboard/>
					</Route>
					<Route path="/user-dashboard">
						<UserDashboard/>
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
