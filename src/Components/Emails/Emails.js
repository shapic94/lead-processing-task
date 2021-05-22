import React, {Component} from 'react';
import {connect} from 'react-redux';

import './Emails.scss';


class EmailsComponent extends Component {
	render() {
		return (
			<div className="email">
				<div className="col-md-12">
					<div>
						<p>{this.props.email.body}</p>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		email: state.global.email
	}
}

export default EmailsComponent