(function () {  // Module pattern
  var global = this
  var radialHTML = '<div id=\"radial-menu\"><ul><li><span>1</span></li><li><span>2</span></li><li><span>3</span></li><li><span>4</span></li></ul></div>'    
  var yesPass = [1,2,4,3,1,2,4,3,1,3,4,2,1,2]
  var placementX
  var placementY
  var curX
  var curY
  var deltaX
  var deltaYi
  var passArray
  var prevChoice
  var newChoice
  var gestureHappening = false
  
  var hastouch = (function() {
    if ('createTouch' in document) return true;
    try {
      document.createEvent('TouchEvent').initTouchEvent != null;
      return true;
    } catch (error) {
      return false;
    }
  })();
  /*
  		# Maps events to the appropriate user agent touch or mouse events.
  		# Used to handle event listeners.
  */
  var gesture = {
    start: hastouch ? 'touchstart' : 'mousedown',
    move: hastouch ? 'touchmove' : 'mousemove',
    end: hastouch ? 'touchend' : 'mouseup',
    cancel: 'touchcancel'
  };
  
  // document.addEventListener(gesture.start, function(){
  //   alert('start!');
  // });

  RadialMenuController = function(){ return this; }
    
    RadialMenuController.prototype.init = function() {
      var _this = this
      var container = document.getElementById('container');
  
    container.addEventListener(gesture.start, function(e) {
      console.log('gesture start');
      gestureHappening = true

      if ($('#radial-menu').length > 0) {
        e.stopPropagation();
        e.preventDefault();
        return
      }
      e.preventDefault();
      curX = 0  
      curY = 0
      deltaX = 0
      deltaY = 0
      passArray = []
      prevChoice = 0
  
      if (hastouch) {
        placementX = e.touches[0].pageX;
        placementY = e.touches[0].pageY;
      } else {
        placementX = e.pageX;
        placementY = e.pageY;
      };
      console.log('x = ' + placementX + ' and y = ' + placementY);

      container.addEventListener(gesture.move, followMove, false);
      // commenting out the radial visual for now
      
      $('#container').append(radialHTML);
      $('#radial-menu').css('top', placementY - $('#container').offset().left - 100 + 'px');
      $('#radial-menu').css('left', placementX  - $('#container').offset().left - 100 + 'px');
    });

    followMove = function(e){
      if (!hastouch && !gestureHappening) { return false };
      e.preventDefault();
      if (hastouch){
        curX = e.touches[0].pageX
        curY = e.touches[0].pageY 
      } else {
        curX = e.pageX
        curY = e.pageY       
      };
      deltaX = curX - placementX
      deltaY = curY - placementY
      newChoice = _this.handleChoice(deltaX, deltaY)
      if (newChoice != prevChoice)
        {
          passArray.push(newChoice)
          prevChoice = newChoice
        }
    };
    
    container.addEventListener(gesture.end, function(e) {
      console.log("gesture end");     
      $('#radial-menu').remove();
      if (_this.showPass(passArray) == true){
        $('#truthiness').removeClass('wrongPass').html('That\'s Correct.');
      } else {
        $('#truthiness').html('&#3232_&#3232').addClass('wrongPass');
      };
    
      container.removeEventListener(gesture.move, followMove, false);
      gestureIsHappening = false
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
    return choice
  }

  RadialMenuController.prototype.showPass = function(password){
    // $('#position').html(pass)
    console.log(password);
    console.log(yesPass);
    if (password.length != yesPass.length) { return false; }
    for (var i = 0; password[i]; i++) {
      if (password[i] !== yesPass[i]) {
        return false;
      }
    }
    return true;
  }

  global.createRadialMenu = function(){
    var controller = new RadialMenuController();
    controller.init();
  };

})();

$(document).ready(function(){
  createRadialMenu();
});
