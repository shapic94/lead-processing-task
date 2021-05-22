const uuid = require('uuid');
const parser = require('lambda-multipart-parser');
const xlsx = require('node-xlsx')
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const db = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = async function (event) {
	const result = await parser.parse(event)
	const sheet = await xlsx.parse(result.files[0].content);
	let rows = sheet[0].data;
	let headers = rows.shift();
	let i, d, data = [];
	for (let row of rows) {
		if (row.length) {
			i = 0;
			d = {};
			for (let value of row) {
				d[headers[i].toLowerCase()] = value

				i++;
			}
			data.push(d);
		}
	}

	data = data.sort((x, y) => x.timestamp - y.timestamp);

	for (let d of data) {
		try {
			let currentTimestamp = new Date().getTime();
			let emailTimestamp = new Date(d.date).getTime();
			await setEmail({...d, timestamp: currentTimestamp, date: emailTimestamp});
			await sqsPut({...d, timestamp: currentTimestamp, date: emailTimestamp});
		} catch (e) {
			console.log(e);
		}
	}

	return {
		statusCode: 200,
		headers: {
			"Access-Control-Allow-Headers" : "Content-Type",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT"
		},
	};
};

async function setEmail(row) {
	try {
		await db.put({
			TableName: 'emails',
			Item: row,
		}).promise();
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
