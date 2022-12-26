function prohibitToBuy(){
	getFlightsListEl().find('button').each((i,button) => {
		$(button).click(() => {
			buyFlight(button.attributes["data-flight-id"].value);
			$(button).replaceWith('<div class="alert alert-success" role="alert">В корзинке :)</div>');
		});
	})
}
