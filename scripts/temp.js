

var count_of_reseats = 1;

function new_line(){
	return  $('<div>').html(`<div class = "from">
		<input type="text" class ="input_from" placeholder="Откуда">
		</div>
		<div class = "destination">
		<input type="text" class = "input_destination" placeholder="Куда">
		</div>
		<div class = "data">
		<input type="date" class = "input_data" placeholder="Дата вылета">
		</div>
		<button class="delete_b">удалить</button>`);
}




$(document).ready(() => {
	var segment = $('.multi_segment');
	
	
	$('#b').click(function(){

		
		

		if (count_of_reseats >= 4){

		}else {
			$('.delete_b').remove();
			count_of_reseats++;
			segment.append(new_line().addClass('main_inputs'));

		}
		
		console.log(count_of_reseats);
	});

	$('html').on('click','.delete_b',function(){
		
		if (count_of_reseats > 1){

			
			$('.multi_segment .main_inputs:last').remove();

			$('.multi_segment .main_inputs:last').append(`<button class="delete_b">удалить</button>`);
			count_of_reseats--;
		}

		console.log(count_of_reseats);
		
	})


	/*$('.main_inputs').on('click','.delete_b',function(){

		console.log("удалить");

		$(this).parent().remove('.main_inputs');


	});*/



});




