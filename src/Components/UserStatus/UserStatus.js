import React, {Component} from 'react';
import {connect} from 'react-redux';

import './UserStatus.scss';

class UserStatusComponent extends Component {
	render() {
		return (
			<div className="userStatus">
				{this.props.user && (
					<div>
						<span className={this.props.user.status}></span><span>{this.props.user.status}</span>
					</div>
				)}
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.global.user,
	}
}

export default connect(mapStateToProps)(UserStatusComponent)