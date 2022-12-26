class User {
	requestLogin(login, password, callback) {
  		$.ajax({
  			type: "POST",
  			url: `http://${host}/user/login`,
  			dataType: 'json',
	  		data: JSON.stringify({
	  			login,
	  			password
	  		})
  		}).done((response) => {
  			let isSuccess = typeof(response.token) == 'string';

  			if(isSuccess) {
	  			localStorage.token = response.token;
	  			localStorage.is_admin = response.is_admin;
	  		}

  			if(typeof(callback) == 'function') {
	  			callback(response);
	  		}
  		});
  	}

  	requestRegister(formData, callback) {
		$.ajax({
  			type: "POST",
  			url: `http://${host}/user/register`,
  			processData: false,
  			contentType: false,
  			dataType: "json",
	  		data: formData
  		}).done((response) => {
  			if(typeof(callback) == 'function') {
	  			callback(response);
	  		}
  		});
  	}

  	requestUpdate(formData, callback) {
		$.ajax({
  			type: "POST",
  			url: `http://${host}/user/update-own`,
  			processData: false,
  			contentType: false,
  			dataType: "json",
	  		data: formData,
	  		headers: { 'token': this.getToken() }
  		}).done((response) => {
  			if(typeof(callback) == 'function') {
	  			callback(response);
	  		}
  		});
  	}

	  requestOwnInfo(callback) {
		  $.ajax({
			  url: `http://${host}/user/own`,
			  headers: { token: (new User).getToken() },
			  dataType: 'json'
		  })
		  .done((response) => {
			if(typeof(callback) == "function") {
				callback(response);
			}
		  });
	  }

  	isAdmin() {
  		return localStorage.is_admin == 1;
  	}

  	getToken() {
  		return localStorage.token;
  	}

  	isAuthorized() {
  		return this.getToken();
  	}

  	logout() {
  		if(localStorage.token) {
	  		delete localStorage.token;
	  		delete localStorage.is_admin;
	  	}
  	}
}
