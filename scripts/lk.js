function getTicketsListEl() {
	return $('#search_tickets_result tbody');
}


let RenderTicketsResult = function(response){
	getTicketsListEl().html('');
	$.template( "searchRowTemplate",  $('#ticket_row_template').text());

	$.tmpl("searchRowTemplate", response)
		.appendTo(getTicketsListEl());
}

let loadOwnInfo = function() {
	(new User).requestOwnInfo((response) => {
		$('input[name=name]').val(response.name);
		$('input[name=login]').val(response.login);
		$('input[name=email]').val(response.email);
		$('#money').text(response.money);
	});

	$.ajax({
		url: `http://${host}/user/photo`,
		headers: { token: (new User).getToken() }
	})
	.done((response) => {
		$('img.avatar').attr('src','data:image/jpeg;base64,' + response);
	});
};

let saveUserInfo = () => {
	let showError = (errorText) => {
		$('.register-error').html(errorText).show();
	};

	let getRegisterData = (formEl) => {
		let result = {};

		$(formEl).find('input').each((i,input) => {
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
			email: 'email',
		};

		for(let key in requiredFields) {
			if(!registerData[key]) {
				errors.push('Не заполнено поле <b>'+requiredFields[key]+'</b>')
			}	
		}

		if(registerData['password'] != registerData['password-repeat']) {
			errors.push('Введённые пароли не совпадают');
		}

		let validateEmail = (email) => {
		  return String(email)
		    .toLowerCase()
		    .match(
		      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		    );
		};

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

	let registerData = getRegisterData($('table.user-info'));

	if(validate(registerData)) {
		let formData = new FormData;

		for(let key in registerData) {
			let value = registerData[key];

			if(key == 'password' && !value) {
				continue;
			}
			
			formData.append(key, value);
		}

		(new User).requestUpdate(formData, (response) => {
			if(response.error) {
				showError(response.error);
			} else {
				loadOwnInfo();
			}
		});
	}
};

let initNav = () => {
	$('.nav a').each((i,button) => {
		$(button).click(() => {
			$('.nav li').removeClass('active');
			$('.choose-content').hide();
			$(button).parent().addClass('active');
			let id = $(button).attr('data-choose');
			$('#'+id).show();
		})
	})
};

function removeTicket(ticketId) {
	if(confirm('Вы уверены, что хотите сдать билет?')) {
		$.ajax({
			type: 'POST',
			url: `http://${host}/ticket/remove`,
			data: JSON.stringify({
				id: ticketId
			}),
			dataType: 'json',
			headers: { token: (new User).getToken() }
		})
		.done(response => {
			loadTickets();
		});
	}
}

function loadTickets() {
	$.ajax({
		url: `http://${host}/ticket?`,
		headers: {token: (new User).getToken()},
		dataType: "json"
	})
	.done(response => {
		RenderTicketsResult(response);
	});
}

$(document).ready(() =>{
	loadTickets();
	loadOwnInfo();
	initNav();
});
