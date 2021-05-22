import React, {Component} from 'react';
import {connect} from 'react-redux';
import HashLoader from "react-spinners/HashLoader";

import './Idle.scss';

class IdleComponent extends Component {
	constructor() {
		super();
		this.state = {
			loading: true,
			color: '#36d7b7'
		};
	}

	render() {
		return (
			<div className="idle">
				<HashLoader color={this.state.color} loading={this.state.loading} size={50}/>
				<span className="idle-text">You are currently {this.props.user.status}.</span>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.global.user,
	}
}


export default connect(mapStateToProps)(IdleComponent)