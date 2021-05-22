import React from 'react'
import {Link} from "react-router-dom";

import './Login.scss'

const LoginPage = () => (
	<div className="login">
		<div>
			<Link to="/admin-dashboard">
				<button>Login as admin</button>
			</Link>
		</div>
		<div>
			<Link to="/user-dashboard">
				<button>Login as user</button>
			</Link>
		</div>
	</div>
)

export default LoginPage