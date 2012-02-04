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

  RadialMenuController = function(){ return this; }
    
    RadialMenuController.prototype.init = function() {
      var _this = this
      var container = document.getElementById('container');
  
    container.addEventListener("touchstart", function(e) {

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
  
      placementX = e.touches[0].pageX
      placementY = e.touches[0].pageY
  
      // commenting out the radial visual for now
      //
      // $('#container').append(radialHTML);
      // $('#radial-menu').css('top', placementY - $('#container').offset().left - 100 + 'px');
      // $('#radial-menu').css('left', placementX  - $('#container').offset().left - 100 + 'px');
    });

    container.addEventListener("touchmove", function(e) {
      e.preventDefault();
      curX = e.touches[0].pageX
      curY = e.touches[0].pageY 
      deltaX = curX - placementX
      deltaY = curY - placementY
      newChoice = _this.handleChoice(deltaX, deltaY)
      if (newChoice != prevChoice)
        {
          passArray.push(newChoice)
          prevChoice = newChoice
        }
    });

    container.addEventListener("touchend", function(e) {     
      $('#radial-menu').remove();
      if (_this.showPass(passArray) == true){
        $('#truthiness').html('YOU DID IT !!!!!!!!!!');
      } else {
        $('#truthiness').html('NICE TRY :\( :\( :\(');
      }
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
