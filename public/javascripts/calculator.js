(function () {  // Module pattern
  var PasswordController, RadialController, App

  App = (function(){
    function App(){
      this.init();
      this.gestures = new Gestures(this);
      this.passController = new PasswordController(this);
      this.calcController = new CalcController(this);
    };
    
    App.prototype.init = function(){
      console.log("App init");
      
    };
    
    return App;
  })();
  
  Gestures = (function(){
    function Gestures(app) {
      this.app = app
      this.init();
    };
    
    Gestures.prototype.init = function() {
      this.app.hastouch = (function() {
        if ('createTouch' in document) return true;
        try {
          document.createEvent('TouchEvent').initTouchEvent != null;
          return true;
        } catch (error) {
          return false;
        }
      })();

      this.app.gesture = {
        start: this.app.hastouch ? 'touchstart' : 'mousedown',
        move: this.app.hastouch ? 'touchmove' : 'mousemove',
        end: this.app.hastouch ? 'touchend' : 'mouseup',
        cancel: 'touchcancel'
      };
    };
    
    return Gestures;
  })();
  
  PasswordController = (function(){ 
    function PasswordController(app) {
      this.app = app;
      this.gesture = app.gesture;
      this.password = [1,2,4,3,1,2,4,3,1,3,4,2,1,2];
      this.init();
    };
    
    PasswordController.prototype.init = function() {
      // var _this = this
      // console.log("PasswordController init");
      // var el = document.getElementById('setPassword');
      // el.addEventListener(this.gesture.end, function(e) {
      //   console.log('touched button');
      //   _this.app.recording = true;
      //   $('#truthiness').html("");
      //   $('#passwordNotifier').html("Recording");
      // });
    };
    
    return PasswordController;
  })();
  
  CalcController = (function(){
    
    function CalcController(app) {
      this.app = app;
      this.gesture = app.gesture
      this.hastouch = app.hastouch
      this.init();
    }
    
    CalcController.prototype.init = function() {
      var _this = this
      var numbersHTML = '<div id=\"numbers-menu\"><ul><li class=\"radial\" id=\"radial1\"><span>1</span></li><li class=\"radial\" id=\"radial2\"><span>2</span></li><li class=\"radial\" id=\"radial3\"><span>3</span></li><li class=\"radial\" id=\"radial4\"><span>4</span></li></ul></div>'    
      var functionalHTML = '<div id=\"functional-menu\"><ul><li class=\"radial\" id=\"radial1\"><span>+</span></li><li class=\"radial\" id=\"radial2\"><span>=</span></li><li class=\"radial\" id=\"radial3\"><span>x</span></li><li class=\"radial\" id=\"radial4\"><span>-</span></li></ul></div>'    

      this.yesPass = this.app.passController.password
      var placementX, placementY, curX, curY, deltaX, deltaY, passArray, prevChoice, newChoice
      var gestureHappening = false
      var container = document.getElementById('container');
      console.log("RadialController init")

      container.addEventListener(this.gesture.start, function(e) {
        console.log('gesture start');
        gestureHappening = true

        $('#truthiness, #passwordNotifier').html("");

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
        windowWidth = window.innerWidth
        controllerType = ''

        if (_this.hastouch) {
          placementX = e.touches[0].pageX;
          placementY = e.touches[0].pageY;
        } else {
          placementX = e.pageX;
          placementY = e.pageY;
        };
        
        if (placementX <= windowWidth*.5) {
          controllerType = 'numbers'
          $('#container').append(numbersHTML);
          $('#numbers-menu').css('top', placementY - $('#container').offset().left - 100 + 'px');
          $('#numbers-menu').css('left', placementX  - $('#container').offset().left - 100 + 'px');
        } else {
          controllerType = 'functional'
          $('#container').append(functionalHTML);
          $('#functional-menu').css('top', placementY - $('#container').offset().left - 100 + 'px');
          $('#functional-menu').css('left', placementX  - $('#container').offset().left - 100 + 'px');
        };

        container.addEventListener(_this.gesture.move, followMove, false);

 

      });

      followMove = function(e){
        if (!_this.hastouch && !gestureHappening) { return false };
        e.preventDefault();
        if (_this.hastouch){
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
            $('.radial').removeClass('hot');
            $('#radial' + newChoice).addClass('hot');
          }
      };

      container.addEventListener(this.gesture.end, function(e) {
        $('#radial-menu').remove();
        container.removeEventListener(_this.gesture.move, followMove, false);
        gestureIsHappening = false
        
        if (_this.app.recording == true) {
          _this.yesPass = passArray;
          _this.app.recording = false;
          $('#passwordNotifier').html("Password Set!");
          $('#truthiness').html("");
          return
        } else {    
          if (_this.showPass(passArray) == true){
            $('#truthiness').removeClass('wrongPass').html('That\'s Correct.');
          } else {
            $('#truthiness').html('&#3232_&#3232').addClass('wrongPass');
          };
        }
      });
    };

    CalcController.prototype.handleChoice = function(deltaX, deltaY) {
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
    };

    CalcController.prototype.showPass = function(password){
      // $('#position').html(pass)
      console.log(password);
      console.log(this.yesPass);
      if (password.length != this.yesPass.length) { return false; }
      for (var i = 0; password[i]; i++) {
        if (password[i] !== this.yesPass[i]) {
          return false;
        }
      }
      return true;
    }; 
    
    return CalcController;
  })();

  $(document).ready(function(){
    console.log('document ready');
    return window.app = new App;
  });
}).call(this);
