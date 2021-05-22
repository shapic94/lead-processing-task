import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';

import './AdminDashboard.scss';

class AdminDashboardPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			emails: []
		};
	}

	componentDidMount() {
		fetch("https://1zkqwvw10d.execute-api.us-east-2.amazonaws.com/v2/lpt")
			.then(res => res.json())
			.then((result) => {
				console.log(result)
				this.setState({
					emails: result
				});
			})
			.catch(error => {
				console.log(error)
			});
	}

	onChangeEmail(event, email) {
		const emails = this.state.emails.map(e => {
			if (e.timestamp === email.timestamp) {
				email.status = event.target.value;
			}

			return e;
		})


		this.setState({emails: emails});
	}

	onClickAction(email) {
		fetch("https://1zkqwvw10d.execute-api.us-east-2.amazonaws.com/v2/lpt", {
			method: 'PUT',
			body: JSON.stringify(email)
		})
			.then(res => res.json())
			.then((result) => {
				this.setState({
					isLoaded: true,
					items: result.items
				});
			})
			.catch(error => {
			});

	}

	render() {
		const {emails} = this.state;

		return (
			<div>
				{emails && (
					<div>
						<table>
							<thead>
							<tr>
								<th>Date</th>
								<th>Subject</th>
								<th>Body</th>
								<th>Status</th>
								<th>Assigned</th>
								<th></th>
							</tr>
							</thead>
							<tbody>
							{emails.map(email => (
								<tr key={email.timestamp}>
									<td>{email.date}</td>
									<td>{email.subject}</td>
									<td data-tip={email.body}>{email.body.slice(0, 20)}...</td>
									<td>
										<select value={email.status} onChange={(e) => this.onChangeEmail(e, email)}>
											<option value=""></option>
											<option value="Positive reply">Positive reply</option>
											<option value="Neutral reply">Neutral reply</option>
											<option value="Not a lead">Not a lead</option>
											<option value="Pending">Pending</option>
										</select>
									</td>
									<td>{email.assigned}</td>
									<td>
										<button type="button" onClick={() => this.onClickAction(email)}>Change</button>
									</td>
								</tr>
							))}
							</tbody>
						</table>
						<ReactTooltip/>
					</div>
				)}
			</div>
		)
	}
}

export default AdminDashboardPage