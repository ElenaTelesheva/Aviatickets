let initCategories = () => {
		$.ajax({
				url: `http://${host}/comfort-category`,
				dataType: 'json'
		})
		.done(response => {
			$('.flight_class .radio').remove();

			for(let cf of response) {
				$('.flight_class').append(
					$('<div class="radio">').html(
						$('<label>').html(
							$(`<input type="radio" name="class_of_flight" value="${cf.id}">`)
						).append(cf.name)
					)
				)
			}
		});
};

let initFilterDate = () => {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var yyyy = today.getFullYear();
	$('.data_departure input').val(yyyy + '-' + mm + '-' + dd);
};

let validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function getReseatsListEl() {
	return $('#search_reseats tbody');
}

let renderReseatsRows = function (response) {
	response = response.map(eachFlight => {
		eachFlight.from = `${eachFlight.airport_from.country_name}/${eachFlight.airport_from.city_name}`;
		eachFlight.to = `${eachFlight.airport_to.country_name}/${eachFlight.airport_to.city_name}`;

		return eachFlight;
	});

	$.template( "searchRowTemplate",  $('#search_row_template_reseats').text());

	$.tmpl("searchRowTemplate", response)
		.appendTo(getReseatsListEl());
};

function fillModalReseats(reseats){
	clearReseatsList();
	renderReseatsRows(reseats);
};

function clearReseatsList() {
	getReseatsListEl().find('tr:not(.empty)').html('');
};

Auth = {
	initAuthButtons: function() {
		let isAuthorized = (new User).isAuthorized();
		let isAdmin = (new User).isAdmin();

		if(isAuthorized) {
			$('.auth-buttons .auth').hide();
			$('.auth-buttons .register').hide();
			$('.auth-buttons .logout').show();
			$('.auth-buttons .lk').show();
		} else {
			$('.auth-buttons .auth').show();
			$('.auth-buttons .register').show();
			$('.auth-buttons .logout').hide();
			$('.auth-buttons .lk').hide();
		}

		if(isAdmin) {
			$('button.open-admin').show();
		} else {
			$('button.open-admin').hide();
		}
	},

	authorize: function() {
		let loginEl = $('.form-auth .login');
		let passwordEl = $('.form-auth .password');
		let login = loginEl.val();
		let password = passwordEl.val();

		if(!login) {
			loginEl.parent().addClass('has-error');
		}

		if(!password) {
			passwordEl.parent().addClass('has-error');
		}

		if(login && password) {
			(new User).requestLogin(login, password, (response) => {
				if(response.error) {
					$('.form-auth .error-text')
						.text(response.error)
						.show();
				} else {
					$('#authModal button.close').click();
					Auth.initAuthButtons();
				}
			});
		}
	},

	register: function() {
		let sendRegisterRequest = () => {
			var data;
		    data = new FormData();
		    data.append( 'file', $( '#file' )[0].files[0] );
		};

		let showError = (errorText) => {
			$('.register-error').html(errorText).show();
		};

		let getRegisterData = () => {
			let result = {};

			$('.form-register input').each((i,input) => {
				let name = $(input).attr('name');
				let value = name == 'photo' ? $(input)[0].files[0] : $(input).val();
				result[name] = value;
			});

			return result;
		};

		let validate = (data) => {
			let errors = [];

			let requiredFields = {
				name: 'ФИО',
				login: 'Логин',
				password: 'Пароль',
				email: 'email',
				'password-repeat': 'Подтверждение пароля'
			};

			for(let key in requiredFields) {
				if(!registerData[key]) {
					errors.push('Не заполнено поле <b>'+requiredFields[key]+'</b>')
				}	
			}

			if(registerData['password'] != registerData['password-repeat']) {
				errors.push('Введённые пароли не совпадают');
			}

			if(!validateEmail(registerData['email'])) {
				errors.push('Поле email имеет неверный формат');
			}

			if(registerData.photo && registerData.photo.size > 10000000) {
				errors.push('Размер изображение слишком велик');
			}

			let errorsEl = $('<div>');

			for(let error of errors) {
				errorsEl.append($('<div>').html(error));
			}

			showError(errorsEl);

			return errors.length == 0;
		};

		let registerData = getRegisterData();

		if(validate(registerData)) {
			let formData = new FormData;

			for(let key in registerData) {
				formData.append(key, registerData[key]);
			}

			(new User).requestRegister(formData, (response) => {
				if(response.error) {
					showError(response.error);
				} else {
					$('#registerModal button.close').click();
					$('button.auth').click()
				}
			});
		}
	},

	logout: function () {
		(new User).logout();
		Auth.initAuthButtons();
	}
};

function restorePassword(promptEmail) {
	let email = prompt('Введите почту для восстановления пароля', promptEmail);

	if(!validateEmail(email)) {
		return restorePassword(email);
	}

	$.ajax({
		type: 'POST',
		url: `http://${host}/user/password-restore`,
		data: JSON.stringify({
			email
		}),
		dataType: 'json',
	}).done(response => {
		if(response.error) {
			alert('Ошибка: '+response.error)
			restorePassword(email);
		} else {
			alert('Временный пароль отправлен на ваш указанный почтовый ящик');
			console.log(response);
		}		
	});
}

function buyFlight(flightId) {
	$.ajax({
		url: `http://${host}/ticket/buy?flight_id=${flightId}`,
		dataType: "json",
		headers: {token: (new User).getToken()}
	}).done(response=>{
		if(response.error) {
			alert(response.error)
		}
	});
}

$(document).ready(() => {
	$.ajax({
		url: `http://${host}/country-city?`,
		dataType: "json"
	})
	.done(response => {
		countryCities = response;
		loadCountySelectors('#city_from,#city_to', countryCities);
	});	

	let initButtons = function() {
		getFlightsListEl().find('button.buy').each((i,button) => {
			let getRealFlights = () => {
				let realFlights = [];
				let flight = flightsFound.filter(flight => flight.hash == $(button).parent().parent().attr("data-flight-hash"))[0];

				if(flight.reseats) {
					for(let eachFlight of flight.reseats) {
						realFlights.push(eachFlight);
					}
				} else {
					realFlights.push(flight);
				}

				return realFlights;
			};

			$(button).click(() => {
				if(confirm('Вы уверены, что хотите купить этот билет?')) {
					let flightsToBuy = getRealFlights();
					let totalPrice = flightsToBuy.reduce((price,f2) => price + parseInt(f2.price), 0);

					(new User).requestOwnInfo(user => {
						if(user.money < totalPrice) {
							alert('Средств на вашем балансе не хватает для оплаты.\nОстаток на счету (рублей): '+user.money);
						} else {
							for(let flight of flightsToBuy) {
								buyFlight(flight.id);
							}

							$(button).replaceWith('<i class="fa fa-check-circle-o bought" aria-hidden="true">');
						}
					});
				}
			});
		});

		getFlightsListEl().find('button.btn-reseats').each((i,button) => {
			let flight = flightsFound.filter(flight => flight.hash == $(button).parent().parent().attr("data-flight-hash"))[0];
			$(button).click(() => {
				fillModalReseats(flight.reseats);
			});
		});
	}

	$('.search_tickets').click(function(){
		search(initButtons);
	});

	Auth.initAuthButtons();
	initCategories();
	initFilterDate();
});
