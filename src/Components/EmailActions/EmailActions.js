import React, {Component} from 'react';
import {connect} from 'react-redux';

import './EmailActions.scss';
import {setEmail} from "../../Redux/Actions";

class EmailActionsComponent extends Component {
	onClickAction(emailStatus) {
		this.props.setEmail({...this.props.email, status: emailStatus});
	}

	render() {
		return (
			<div className="email-actions">
				<button type="button" onClick={() => this.onClickAction('Positive reply')}>Positive reply
				</button>
				<button type="button" onClick={() => this.onClickAction('Neutral reply')}>Neutral reply
				</button>
				<button type="button" onClick={() => this.onClickAction('Not a lead')}>Not
					a lead
				</button>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		email: state.global.email
	}
}


const mapDispatchToProps = dispatch => {
	return {
		setEmail: email => dispatch(setEmail(email)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailActionsComponent)