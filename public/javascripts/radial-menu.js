(function () {  // Module pattern
	var global = this
	var radialHTML = '<div id=\"radial-menu\"><ul><li><span>1</span></li><li><span>2</span></li><li><span>3</span></li><li><span>4</span></li></ul></div>'    
	var placementX
	var placementY
	var curX
	var curY
	var deltaX
	var deltaY

	RadialMenuController = function(){ return this; }
    
	RadialMenuController.prototype.init = function() {
		var _this = this
		var container = document.getElementById('container');
		
    container.addEventListener("touchstart", function(e) {
	    e.preventDefault();
	    curX = 0
	    curY = 0
	    deltaX = 0
	    deltaY = 0
  
	    placementX = e.touches[0].pageX
	    placementY = e.touches[0].pageY
   
	    $('#container').append(radialHTML);
	    $('#radial-menu').css('top', placementY - $('#container').offset().left - 100 + 'px');
	    $('#radial-menu').css('left', placementX  - $('#container').offset().left - 100 + 'px');
    });

    container.addEventListener("touchmove", function(e) {
      e.preventDefault();
      curX = e.touches[0].pageX
      curY = e.touches[0].pageY 
    });

    container.addEventListener("touchend", function(e) {
      deltaX = curX - placementX
      deltaY = curY - placementY
      $('#radial-menu').remove();
			_this.handleChoice(deltaX, deltaY)
    });
	};
	
	RadialMenuController.prototype.handleChoice = function(deltaX, deltaY) {
		var choice = 0
		if (deltaX < 0 && deltaY < 0) {
			choice = 1
		} else if (deltaX >= 0 && deltaY < 0) {
			choice = 2
		} else if (deltaX < 0 && deltaY >= 0) {
			choice = 3
		} else if (deltaX >= 0 && deltaY >= 0) {
			choice = 4
		}

		$('#position').html(choice)
	}

	global.createRadialMenu = function()
	{
	  var controller = new RadialMenuController();
	  controller.init();
	};

})();

$(document).ready(function(){
	createRadialMenu();
});