import React, {Component} from 'react';
import {connect} from 'react-redux';
import {w3cwebsocket as W3CWebSocket} from "websocket";
import EmailComponent from "../../../Components/Email/Email";
import NavigationComponent from "../../../Components/Navigation/Navigation";
import LoadingComponent from "../../../Components/Loading/Loading";
import {setEmail, setUser} from "../../../Redux/Actions";
import IdleComponent from "../../../Components/Idle/Idle";
import EmailActionsComponent from "../../../Components/EmailActions/EmailActions";

import './UserDashboard.scss';

class UserDashboardPage extends Component {
	constructor() {
		super();
		this.state = {
			client: null
		}
	}

	componentWillMount() {
		this.setState({
			client: new W3CWebSocket('wss://8wyzugxnaf.execute-api.us-east-2.amazonaws.com/production')
		})

	}

	componentDidMount() {
		this.state.client.onopen = () => {
			this.props.setUser({...this.props.user, status: 'online'})
		};

		this.state.client.onmessage = (message) => {
			let data = JSON.parse(message.data);


			if ('status' in data) {
				this.props.setUser({...this.props.user, status: data.status})
			} else if ('email' in data) {
				this.props.setEmail(data.email)
			}
		};

		this.state.client.onclose = () => {
			this.props.setUser({...this.props.user, status: 'offline'})
		};
	}

	componentWillUnmount() {
		this.state.client.close();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.user && this.props.user && prevProps.user.status !== this.props.user.status) {
			if (this.state.client.readyState === this.state.client.OPEN) {
				this.state.client.send(JSON.stringify({
					type: 'USER_STATUS',
					user: this.props.user,
					email: this.props.email
				}));

				if (this.props.user.status === 'away') {
					this.props.setEmail(null);
				}
			}
		}

		if (prevProps.email && this.props.email && prevProps.email.status !== this.props.email.status) {
			if (this.state.client.readyState === this.state.client.OPEN) {
				this.state.client.send(JSON.stringify({type: 'EMAIL_STATUS', email: this.props.email}));
				this.props.setEmail(null)
			}
		}
	}

	render() {
		return (
			<div className="userDashboard">
				<NavigationComponent/>
				<div className="emailWrapper">
					{this.props.user && this.props.user.status === 'online' && (
						<div>
							{!this.props.email && (
								<LoadingComponent/>
							)}
							{this.props.email && (
								<EmailComponent/>
							)}
						</div>
					)}
					{this.props.user && this.props.user.status === 'away' && (
						<IdleComponent/>
					)}
					{this.props.user && this.props.user.status === 'offline' && (
						<IdleComponent/>
					)}
				</div>
				<div className="actionWrapper">
					{this.props.user && this.props.email && (
						<EmailActionsComponent/>
					)}
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.global.user,
		email: state.global.email,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		setUser: status => dispatch(setUser(status)),
		setEmail: email => dispatch(setEmail(email)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDashboardPage)