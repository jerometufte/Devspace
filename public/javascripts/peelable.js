console.log('inside peelable.js');

$(function(){

	el = $("#container").get(0);
	opts = {
		numFinger: 1,
		peelImage: "/images/peel-flipped.png",
		bottomClassName: "bottom",
		initial: {
			angle: -18,
			peelOffset: 17,
			peelBottom: 993,
			scale: { x: 0.07, y: 0.04 }
		},
		final: {
			angle: -20,
			peelOffset: 405,
			peelBottom: 822,
			scale: { x: 1, y: 1 }
		}
	};
	p = new SwipeCore.Peelable(el, opts);

	$("button#open-peelable").click(function(){
		p.open();
	});

	$("button#close-peelable").click(function(){
		p.close();
	});

	$("#view-desktop").click(function(){
		alert("View Desktop Version");
	});

	$("#get-your-own").click(function(){
		alert("Get your own publication");
	});

	$("#explore-more").click(function(){
		alert("Explore more publications");
	});

	$("#twitter").click(function(){
		alert("Share on Twitter");
	});

	$("#facebook").click(function(){
		alert("Share on Facebook");
	});

	$("#powered-by-onswipe").click(function(){
		window.open("http://www.onswipe.com");
	});

});