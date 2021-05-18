import React from 'react'
import {Link} from "react-router-dom";

const LoginPage = () => (
	<div className="row">
		<div className="col-md-12 text-center mb-5">
			<Link to="/admin-dashboard">
				<button type="button" className="btn btn-primary">Login as admin</button>
			</Link>
		</div>
		<div className="col-md-12 text-center">
			<Link to="/user-dashboard">
				<button type="button" className="btn btn-primary">Login as user</button>
			</Link>
		</div>
	</div>
)

export default LoginPage