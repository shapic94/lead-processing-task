import React, {Component} from 'react';
import GridLoader from "react-spinners/GridLoader";

import './Loading.scss';

class LoadingComponent extends Component {
	constructor() {
		super();
		this.state = {
			loading: true,
			color: '#36d7b7'
		};
	}

	render() {
		return (
			<div className="loading">
				<GridLoader color={this.state.color} loading={this.state.loading} size={20}/>
				<span className="loading-text">Waiting for new email</span>
			</div>
		);
	}
}

export default LoadingComponent