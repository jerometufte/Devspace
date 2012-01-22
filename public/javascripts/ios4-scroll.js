// alert('ios4-scroll.js')


$(document).ready(function(){
	var myScroll;
	console.log('loaded');
	myScroll = new iScroll('container');

	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
	
});
