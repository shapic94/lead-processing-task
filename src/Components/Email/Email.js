import React, {Component} from 'react';
import {connect} from 'react-redux';

import './Email.scss';


class EmailComponent extends Component {
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

export default connect(mapStateToProps)(EmailComponent)