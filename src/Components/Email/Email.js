import './Email.scss';

import React, { Component } from 'react';

class EmailComponent extends Component {
	render() {
		return (
			<div>
				<div className="col-md-12">
					<div className="email">
						<p>{this.props.body}</p>
					</div>
				</div>
			</div>
		);
	}
}

export default EmailComponent