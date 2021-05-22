import React, {Component} from 'react';
import {connect} from 'react-redux';
import UserStatus from "../UserStatus/UserStatus";
import {Link} from "react-router-dom";
import {setEmail, setUser} from "../../Redux/Actions";

import './Navigation.scss';

class NavigationComponent extends Component {
	onClickStatus(status) {
		this.props.setUser({...this.props.user, status})
	}

	render() {
		return (
			<div className="navigation">
				<nav>
					<ul>
						<li>Home</li>
						<li>
							Status
							<ul>
								<li onClick={() => this.onClickStatus('online')}>Online</li>
								<li onClick={() => this.onClickStatus('away')}>Away</li>
							</ul>
						</li>
					</ul>
					<ul>
						<li><UserStatus/></li>
						<li><Link to="/">Logout</Link></li>
					</ul>
				</nav>
			</div>
		);
	}
}

const mapDispatchToProps = dispatch => {
	return {
		setUser: status => dispatch(setUser(status)),
		setEmail: email => dispatch(setEmail(email)),
	}
}

export default connect(null, mapDispatchToProps)(NavigationComponent)