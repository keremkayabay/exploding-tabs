(function() {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;
    
    var countdown = null;
    var countdownInProgress = false;
    var timeLeft = 180;
    var timePassed = 0;
    var countdownBodyElement = document.createElement("div");
    var countdownBodyElementVisible = false;
    var userClosedCountdownBodyElement = false;

    function onError(error) {
        console.log(error);
    }

    function startCountdown(timer) {

      if( countdownInProgress ){
        return;
      }

      insertCountdownBodyElement();

      countdownInProgress = true;
      timeLeft = timer;
      countdown = setInterval(tick, 1000);
    }
    
    function tick(){
      timeLeft--;
      timePassed++;

      document.title = "Time left: " + timeLeft;
      countdownBodyElement.innerText = "This tab will destroy itself in " + timeLeft + " seconds."; 

      if(timeLeft == 30){
        userClosedCountdownBodyElement = false;
      }

      if( timeLeft < 1 ){
        browser.runtime.sendMessage({greeting: "Greeting from the content script"});
        clearInterval(countdown);
      }
      else if( timeLeft < 30  ){
        openCountdownBodyElement();
      }
      else if( timePassed > 9 ){
        closeCountdownBodyElement();
      }
      else if( timePassed == 1 ){
        openCountdownBodyElement();
      }
    }

    function stopCountdown() {
      closeCountdownBodyElement();
      clearInterval(countdown);
    }
    
    function insertCountdownBodyElement(){
      countdownBodyElement.style.display = 'none';
      countdownBodyElement.style.position = "fixed";
      countdownBodyElement.style.top = "-30px";
      countdownBodyElement.style.left = "25%";
      countdownBodyElement.style.width = "50%";
      countdownBodyElement.style.paddingTop = "30px";
      countdownBodyElement.style.paddingLeft = "5px";
      countdownBodyElement.style.backgroundColor = "white";
      countdownBodyElement.style.fontFamily = "Helvetica, Arial, sans-serif";
      countdownBodyElement.style.fontSize = "15px";
      //countdownBodyElement.style.borderBottom = "2px solid #000";
      countdownBodyElement.style.boxShadow = "5px 5px 0px grey";
      countdownBodyElement.style.cursor = "pointer";
      countdownBodyElement.style.zIndex = "999999999";
      countdownBodyElement.addEventListener("click", clickOnCountdownBodyElement);
      document.getElementsByTagName('body')[0].prepend( countdownBodyElement );
    }

    function openCountdownBodyElement(){
      if( countdownBodyElementVisible || userClosedCountdownBodyElement ){
        return;
      }
      
      countdownBodyElement.style.display = 'block';
      countdownBodyElementVisible = true;

      var pos = -30;
      var id = setInterval(animate, 5);
      function animate() {
        if (pos == 0) {
          clearInterval(id);
        } else {
          pos++; 
          countdownBodyElement.style.top = pos + "px";
        }
      }
    }

    function clickOnCountdownBodyElement(){
      userClosedCountdownBodyElement = true;
      closeCountdownBodyElement();
    }

    function closeCountdownBodyElement(){
      if( !countdownBodyElementVisible ){
        return;
      }

      countdownBodyElementVisible = false;

      var pos = 0;
      var id = setInterval(animate, 5);
      function animate() {
        if (pos == -30) {
          countdownBodyElement.style.display = 'none';
          clearInterval(id);
        } else {
          pos--; 
          countdownBodyElement.style.top = pos + "px";
        }
      }
    }

    /**
     * Listen for messages from the background script.
    */
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "start-countdown") {
        startCountdown(message.timer);
      }
      else if (message.command === "stop-countdown") {
        stopCountdown();
      }
    });
  })();