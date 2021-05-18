const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
	if (event.requestContext.eventType === 'CONNECT') {
		try {
			await addUser({connectionId: event.requestContext.connectionId, name: 'user1', status: 'online'});
		} catch (e) {
			console.log('connect', e);
		}
		callback(null, {
			statusCode: 200,
			body: 'Connected'
		});
	} else if (event.requestContext.eventType === 'DISCONNECT') {
		try {
			await addUser({connectionId: event.requestContext.connectionId, name: 'user1', status: 'offline'});
		} catch (e) {
			console.log('disconnect', e);
		}
		callback(null, {
			statusCode: 200,
			body: 'Disconnected'
		});
	} else {
		callback(null, {
			statusCode: 200
		});
	}
}

function addUser(user) {
	return db.put({TableName: 'users', Item: user}).promise();
}
