let airports;
let airplanes;
let comfortCategories;

let loadAirports = (callback) => {
	$.ajax({
		'url': `http://${host}/airport`,
		dataType: "json"
	})
	.done(response => {
		airports = response;
		
		if(typeof(callback) == 'function') {
			callback(airports);
		}
	});
};

let loadAirplanes = (callback) => {
	$.ajax({
		'url': `http://${host}/airplane`,
		dataType: "json"
	})
	.done(response => {
		airplanes = response;

		if(typeof(callback) == 'function') {
			callback(airplanes);
		}
	});
};

let loadComfortCategories = () => {
	$.ajax({
		url: `http://${host}/comfort-category`,
		dataType: 'json'
	})
	.done((response) => {
		comfortCategories = response;
	})
};

function getAirplanesListEl(){
	return $('#search_results_airplane tbody');
}

let renderAirplanesRows = function (airplanes) {
	$.template( "rowAirplaneTemplate",  $('#airplanes_template').text());
	getAirplanesListEl().find('tr:not(.empty)').html('');

	$.tmpl("rowAirplaneTemplate", airplanes)
		.appendTo(getAirplanesListEl());
};

let startEditAirplaneRow = function(trEl){
	for(let name of ['name', 'capacity', 'serial']) {
		let td = $(trEl).find('td.'+ name);
		td.html($('<input>').val(td.text().trim()));
	}

	let initButtonSaveButton = function() {
		let saveButton = $('<button>')
							.addClass('btn btn-primary')
							.text('Сохранить')
							.click(saveAirplane);

		$(trEl).find('button').replaceWith(saveButton)
	};

	let saveAirplane = function() {
		let postData = {
			id:  trEl.attr('data-airplane-id'),
			name: trEl.find('td.name input').val(),
			capacity: trEl.find('td.capacity input').val(),
			serial: trEl.find('td.serial input').val()
		};

		let hasErrors = false;

		for(let tdClass of ['name','capacity','serial']) {
			let input = $(trEl).find('td.'+tdClass+' input');

			if(input.val()) {
				input.removeClass('bg-danger');
			} else {
				input.addClass('bg-danger');
				hasErrors = true;
			}
		}

		if(!hasErrors) {
			$.ajax({
			  	type: "POST",
			  	url: `http://${host}/airplane`,
			  	data: JSON.stringify(postData),
			  	success: finishEdit,
			  	dataType: 'json'
			});
		}
	};

	let finishEdit = (airport) => {
		$(trEl).find('input').val('')
		loadAirplanes(renderAirplanesRows);
	};

	initButtonSaveButton();
}

let startEditRow = function(trEl) {
	let airportOptionsFormatter = function (data) {
		return $(`<span><b>${data.city_name}</b>, ${data.country_name}</span>, <b>${data.name}</b>`);
	};

	airportSelectorData = airports.map(airport => {
		return Object.assign(airport, {
			'text': airport.country_name + '/' + airport.city_name + '/' + airport.name
		});
	});

	let initAirportSelectorInTr = function(trEl) {
		$(trEl).find('td.from, td.to').each((i,tdEl) => {
			let select = $('<select>');
			let airportId = $(tdEl).attr('data-airport-id');
			$(tdEl).html(select);

			select.select2({
				placeholder: 'Откуда',
				data: airportSelectorData,
				templateResult: airportOptionsFormatter,
				// templateSelection: optionsFormatter,
				width: 'style'
			});

			select.val(airportId).trigger('change');//пусть будет выбран данный аэропорт
		});
	};

	let initCalendars = function(trEl){
		$(trEl).find('td.departure, td.arrival').each((i, tdEl) => {
			let input = $("<input>");
			var timeParts = tdEl.innerText.split(RegExp('[- :]'));
			var datetime = `${timeParts[2]}.${timeParts[1]}.${timeParts[0]} ${timeParts[3]}:${timeParts[4]}`

			flatpickr(input, {
				enableTime: true,
				dateFormat:'d.m.Y H:i',
				defaultDate: datetime,
				time_24hr: true
			});
			
			$(tdEl).html(input);
		})
	};

	let initAirplaneSelectorInTr = function(trEl) {
		let tdEl = trEl.find('td.airplane');
		let select = $('<select>');
		let airplaneId = $(tdEl).attr('data-airplane-id');
		$(tdEl).html(select);

		select.select2({
			placeholder: 'Самолёт',
			data: airplanes.map(a => {return {id: a.id, text: a.name}}),
			width: 'style'
		});

		select.val(airplaneId || 0).trigger('change');//пусть будет выбран данный аэропорт
	};

	let initPriceInput = function(trEl){
		let tdEl = $(trEl).find('td.price');

		let input = $("<input>")
						.attr('type', 'number')
						.val($(tdEl).attr('data-price'));

		tdEl.html(input);
	};

	let initComfortCategory = function(trEl) {
		(trEl).find('td.comfort-category').each((i,tdEl) => {
			let select = $('<select>');
			let comportCategoryId = $(tdEl).attr('data-comfort-category-id');
			$(tdEl).html(select);

			select.select2({
				placeholder: 'Категория',
				data: comfortCategories.map(cc => {return {id:cc.id,text:cc.name};}),
				width: 'style'
			});

			select.val(comportCategoryId || 1).trigger('change');//пусть будет выбран данный аэропорт
		});
	};

	let save = function(trEl) {
		let timeToSql = function(time) {
			let parts = time.split(RegExp('[. ]'));
			return `${parts[2]}-${parts[1]}-${parts[0]} ${parts[3]}`;
		}

		let clearAfterSave = () => {
			trEl.find('td.from select,td.to select,td.airplane select,td.comfort-category select').val(0).trigger('change');
			trEl.find('td.price input').val('');
		};

		let postData = {
			id: trEl.attr('data-flight-id'),
			airport_id_from: trEl.find('td.from select').val(),
			airport_id_to: trEl.find('td.to select').val(),
			time_departure: timeToSql(trEl.find('td.departure input').val()),
			time_arrival: timeToSql(trEl.find('td.arrival input').val()),
			airplane_id: trEl.find('td.airplane select').val(),
			comfort_category_id: trEl.find('td.comfort-category select').val(),
			price: trEl.find('td.price input').val()
		};

		let isValid = true;

		for(let key in postData) {
			if(key == 'id') {
				continue;
			}

			if(!postData[key]) {
				isValid = false;
				break;
			}
		}

		let finishEdit = (airport) => {
			alert('Сохранено');
			$('.search_tickets').click();

			if($(trEl).hasClass('empty')) {
				clearAfterSave();
			}
		};

		if(isValid) {
			$.ajax({
			  	type: "POST",
			  	url: `http://${host}/flight`,
			  	data: JSON.stringify(postData),
			  	success: finishEdit,
			  	dataType: 'json'
			});
		} else {
			alert('Заполнены не все данные');
		}
	};

	initAirportSelectorInTr(trEl);
	initCalendars(trEl);
	initAirplaneSelectorInTr(trEl);
	initPriceInput(trEl);
	initComfortCategory(trEl);

	trEl.find('button')
			.replaceWith(
				$('<button>')
					.addClass('btn-primary')
					.text('Сохранить')
					.click(() => save(trEl))
			);
};

let initButtons = function() {
	getFlightsListEl().find('button.btn-edit').each((i,button) => {
		let isEditing = false;

		$(button).click(() => {
			let trEl=$(button).parent().parent();
			isEditing = !isEditing;

			if(isEditing) {
				startEditRow(trEl);
			} else {
				save(trEl);
			}
		})
	});
}

function startCreateFlight(){
	let emptyTrEl = $('tr.empty');
	emptyTrEl.toggle();
	startEditRow(emptyTrEl);
}

function startCreateAirplane(){
	let emptyTrEl = $('tr.empty_airplane');
	emptyTrEl.toggle();
	startEditAirplaneRow(emptyTrEl);
}

function loadUsers() {
	let usersTbody = $('#tab_users tbody');
	$.template('users', $('#template_users').text());

	let renderUsers = (users) => {
		usersTbody.html('');
		let usersWithoutAdmin = users.filter(u => u.id != 1);
		$.tmpl('users', usersWithoutAdmin)
			.appendTo(usersTbody);
	};

	$.ajax({
		url: `http://${host}/user`,
		headers: { token: (new User()).getToken() },
		dataType: 'json'
	})
	.done((users) => {
		renderUsers(users);
	})
}

function setUserActiveValue(userId, activeValue) {
	$.ajax({
		type: "POST",
		url: `http://${host}/user`,
		headers: { token: (new User()).getToken() },
		dataType: 'json',
		data: JSON.stringify({
			'id': userId,
			'is_active': activeValue
		})
	})
	.done((users) => {
		loadUsers(users);
	})
}

function banUser(userId) {
	setUserActiveValue(userId, 0);
}
function unbanUser(userId) {
	setUserActiveValue(userId, 1);
}

$(document).ready(() =>{
	$.ajax({
		url: `http://${host}/country-city?`,
		dataType: "json"
	})
	.done(response => {
		countryCities = response;
		loadCountySelectors('#city_from, #city_to', countryCities);
	});

	loadAirports();
	loadAirplanes(renderAirplanesRows);
	loadUsers();
	loadComfortCategories();

	$('.search_tickets').click(function(){
		search(initButtons);
	});	
});
