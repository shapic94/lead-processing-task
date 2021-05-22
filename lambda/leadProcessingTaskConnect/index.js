const uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const db = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = async (event, context, callback) => {
	const connectionId = event.requestContext.connectionId;
	const eventType = event.requestContext.eventType;

	try {
		switch (eventType) {
			case 'CONNECT':
				await setUser({connectionId: connectionId, name: 'user1', status: 'online'});
				break;
			case 'DISCONNECT':
				await setUser({connectionId: connectionId, name: 'user1', status: 'offline'});
				break;
			case 'MESSAGE':
				let body = JSON.parse(event.body);
				const requestUser = body.user;
				const requestEmail = body.email;

				switch (body.type) {
					case 'USER_STATUS':
						await setUser({connectionId: connectionId, status: requestUser.status});
						if (requestUser.status === 'away') {
							if (requestEmail) {
								await setEmail({...requestEmail, assigned: ''});
								await sqsPut(requestEmail);
							}
						}
						break;
					case 'EMAIL_STATUS':
						if (requestEmail && requestEmail.assigned === connectionId) {
							await setEmail(requestEmail);
							await setUser({connectionId: connectionId, status: 'online'});
						}
						break;
					default:
						break;
				}
				break;
			default:
				break;
		}
	} catch (e) {
		console.log(e);
	}

	callback(null, {
		statusCode: 200
	});
}

async function setUser(user) {
	try {
		await db.put({TableName: 'users', Item: user}).promise();
	} catch (e) {
		throw e;
	}
}

async function setEmail(email) {
	try {
		await db.put({TableName: 'emails', Item: email}).promise();
	} catch (e) {
		throw e;
	}
}

async function sqsPut(row) {
	try {
		await sqs.sendMessage({
			MessageAttributes: {
				timestamp: {
					DataType: 'Number',
					StringValue: '' + row.timestamp
				},
				date: {
					DataType: "Number",
					StringValue: '' + row.date
				},
			},
			MessageBody: "Get email",
			MessageDeduplicationId: uuid(),
			MessageGroupId: "GET_EMAIL",
			QueueUrl: 'https://sqs.us-east-2.amazonaws.com/357063784055/leadProcessingTaskGetEmailSQS.fifo'
		}).promise();
	} catch (e) {
		throw e;
	}
}
