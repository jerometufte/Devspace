(function(){
  setRandomCoor = function(bubble){
    position = $(bubble).position();
    curX = position.left
    curY = position.top 
      
    randX = Math.floor(Math.random()*776)
    randY = Math.floor(Math.random()*776)
        
    xDist = Math.abs(randX-curX)
    yDist = Math.abs(randY-curY)
        
    distMax = Math.sqrt(800*800 + 800*800)
        
    transTime = function(){
      return ((Math.sqrt((xDist * xDist) + (yDist * yDist)))/distMax)*4
    };    

    bubble.css({
      '-webkit-transition': '-webkit-transform ' + transTime() + 's linear',
      '-webkit-transform': 'translate3d(' + randX + 'px, ' + randY + 'px, 0)'
    });
  };
  
  setRandomColor = function(bubble){
    randR = Math.floor(Math.random()*250)
    randG = Math.floor(Math.random()*250)
    randB = Math.floor(Math.random()*250)
        bubble.css({
            'background-color': 'rgba(' + randR + ', ' + randG + ', ' + randB + ', 1)'
        });
  };

  $(document).ready(function(){
    $bubbles = $('.bubbles');
    $bubbles.each(function(bubble){
      setRandomCoor($(this)) 
      $(this).bind('webkitTransitionEnd', function(){
        setRandomCoor($(this));
        setRandomColor($(this));
      }); 
    });
    
    $bubbles.bind('webkitTransitionEnd', function(){
      setRandomCoor();
    });
  });
    
})()

                                                  
