// console.log('pageable');
// 
// 
// $(function(){
// 	p = $("#elementToPaginate").Pageable(["horizontal"], {
// 		listenerElement: $("#parent").get(0),
// 		keepInContainer: true,
// 		rubberBandBounceBack: true,
// 		paginationOl: {
// 			horizontal: $("ul#pagination-horizontal").get(0),
// 		},
// 		cacheInMemory: true,
// 		allowTwoFingerSwipe: true,
// 		swipeTransitionDuration: 550
// 	});
// 
// 	$("#elementToPaginate").bind("swipecore.pageable.pagechange", function(e) {
// 		if (e.pageChangedTo.x !== undefined)
// 			console.log("swipecore.pageable.pagechange: page.x changed to " + e.pageChangedTo.x);
// 		if (e.pageChangedTo.y !== undefined)
// 			console.log("swipecore.pageable.pagechange: page.y changed to " + e.pageChangedTo.y);
// 	});
// 
// });

console.log('pageable.js');

$(function(){
	p = $("#elementToPaginate").Pageable(["horizontal"], {
		listenerElement: $("#parent").get(0),
		paginationOl: {
			horizontal: $("ul#pagination-horizontal").get(0),
		},
		countPages: function() {
			// var $parent = $("#parent");
			// $parent.css("height", "auto");
		
			// hard coded number for now //
			numVisibleEntries = 40
			// return Math.max(Math.ceil(numVisibleEntries / (window.orientation % 180 ? 10 : 9)), 1);
			return {x: Math.max(Math.ceil(40 / 6), 1)};
		}
	});
	var $parent = $("#parent");
	$parent.css("height", "auto");
	$("#elementToPaginate").css("-webkit-column-width", $("#parent").width());
});