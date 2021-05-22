function setUser(user) {
	return {
		type: "SET_USER",
		payload: user
	}
}

function setEmail(email) {
	return {
		type: "SET_EMAIL",
		payload: email
	}
}

export {setUser, setEmail}