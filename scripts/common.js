var host = 'avia.com';
// var host = 'localhost';

var countryCities = [];
var flightsFound = [];

function getFlightsListEl() {
	return $('#search_results tbody');
}

function clearFlightsList() {
	getFlightsListEl().find('tr:not(.empty)').html('');
}


let renderFlightsRows = function (flights) {
	let hasFlightPlaces = (flight) => {
		return flight.reseats ? flight.reseats.filter(f => f.places_available == 0).length == 0 : flight.places_available > 0;
	};

	flights = flights.filter(hasFlightPlaces);

	flights = flights.map(eachFlight => {
		eachFlight.from = `${eachFlight.airport_from.country_name}/${eachFlight.airport_from.city_name}`;
		eachFlight.to = `${eachFlight.airport_to.country_name}/${eachFlight.airport_to.city_name}`;

		return eachFlight;
	});

	$.template( "searchRowTemplate",  $('#search_row_template').text());

	$.tmpl("searchRowTemplate", flights)
		.appendTo(getFlightsListEl());
};

SearchAnimation = {
	getFighterAirplane: () => {
		return $('.fa-fighter-jet');
	},

	restart: () => {
		let $airplane = SearchAnimation.getFighterAirplane();

		$airplane
			.show()
			.addClass('flied-out');

		setTimeout(() => {
			$airplane
				.hide()
				.removeClass('flied-out');
		}, 1000);
	}
};

function search (afterDone) {
	SearchAnimation.restart();

	let reseatsCheckboxNativeElement = $('#with_reseats')[0];

	let searchParamValues = {
		city_id_from: $('#city_from').find(':selected').val(),
		city_id_to: $('#city_to').find(':selected').val(),
		date_departure: $('.date').val(),
		with_reseats: (reseatsCheckboxNativeElement && reseatsCheckboxNativeElement.checked) ? 1 : 0,
		comfort_category_id: $('.flight_class input[name="class_of_flight"]:checked').val(),
		price_min: $('.price-min input').val(),
		price_max: $('.price-max input').val(),
	};

	let requestKeyValues = [];

	for(let name in searchParamValues) {
		let value = searchParamValues[name];

		if(value) {
			requestKeyValues.push(`${name}=${value}`);
		}
	}

	let requestParamsString = requestKeyValues.join('&');

	// включить фильтр только имеющих дату вылета после текущего времени
	requestParamsString += '&after-now';
	
	$.ajax({
		url: `http://${host}/flight?${requestParamsString}`,
		dataType: "json"
	})
	.done(response=>{
		let isFlightsFound = response.length > 0;
		let $notFound = $('.flights-not-found');
		let $flightsTable = $('#search_results');

		if(isFlightsFound) {
			$notFound.hide();
			$flightsTable.fadeIn(500);
		} else {
			$notFound.show();
			$flightsTable.hide();
		}

		flightsFound = response.map(flight => {
			flight.hash = MD5(JSON.stringify(flight));
			return flight;
		});

		clearFlightsList();
		renderFlightsRows(response);

		if(typeof(afterDone) == 'function') {
			afterDone(response);
		}
	});
}
