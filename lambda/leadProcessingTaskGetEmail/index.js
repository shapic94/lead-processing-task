const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async function (event) {
	const emails = await getEmails();

	return {
		statusCode: 200,
		headers: {
			"Access-Control-Allow-Headers" : "Content-Type",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT"
		},
		body: JSON.stringify(emails)
	};
};

async function getEmails() {
	let emails;
	try {
		emails = await db.scan({TableName: 'emails'}).promise();
	} catch (e) {
		console.log(e);
	}

	return emails && emails.Items.length ? emails.Items : [];
}
