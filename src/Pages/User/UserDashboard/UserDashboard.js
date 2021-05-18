import React, {Component} from 'react';
import Email from "../../../Components/Email/Email";


class UserDashboardPage extends Component {
	render() {
		const greeting = 'Welcome to React';

		return (
			<div>
				<div className="row mb-5">
					<div className="col-md-4 text-center">
						<button type="button" className="btn btn-primary">Positive reply</button>
					</div>
					<div className="col-md-4 text-center">
						<button type="button" className="btn btn-primary">Neutral reply</button>
					</div>
					<div className="col-md-4 text-center">
						<button type="button" className="btn btn-primary">Not a lead</button>
					</div>
				</div>
				<div className="row">
					<Email body={greeting}/>
				</div>
			</div>
		);
	}
}

export default UserDashboardPage;
