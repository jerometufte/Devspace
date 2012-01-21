console.log('hello sliding-menu');
$(document).ready(function(){
	
	$(window).click(function(){
		$el = $('#sliding-menu')
		if($el.hasClass('hot')) {
			$el.removeClass('hot')
		}else{
		  $el.addClass('hot');			
		};
	});
	
});