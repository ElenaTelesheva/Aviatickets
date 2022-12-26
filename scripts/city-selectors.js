loadCountySelectors = function(htmlSelectors, countryCities) {
	let prepareOptions = () => {
		let result = [];

		countryCities.forEach(country => {
			country.cities.forEach(city => {
				result.push({
					id: city.id,
					text: country.name + city.name,
					cityName: city.name,
					countryName: country.name
				});
			})
		});

		return result;
	};

	let optionsFormatter = function (data) {
		return $(`<span><b>${data.cityName}</b>, ${data.countryName}</span>`);
	};

	let insertOptions = (selectOptions) => {
		$(htmlSelectors).select2({
			placeholder: 'Откуда',
			data: selectOptions,
			templateResult: optionsFormatter,
			templateSelection: optionsFormatter,
			width: 'style'
		});
	};

	insertOptions(prepareOptions(countryCities));
}
