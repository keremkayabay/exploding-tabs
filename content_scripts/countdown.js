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

    function onError(error) {
        console.log(error);
    }

    function startCountdown(timer) {
      console.log("test");
      if( countdownInProgress ){
        return;
      }

      browser.runtime.sendMessage(
        {
          command: "notify",
          message: timer + " seconds left."
        }
      );

      countdownInProgress = true;
      timeLeft = timer;
      countdown = setInterval(tick, 1000);
    }
    
    function tick(){
      timeLeft--;
      timePassed++;

      document.title = "Time left: " + timeLeft;

      if( timeLeft < 1 ){
        browser.runtime.sendMessage(
          {
            command: "boom"
          }
        );
        clearInterval(countdown);
      }
      else if(timeLeft == 30){
        browser.runtime.sendMessage(
          {
            command: "notify",
            message: "30 seconds left."
          }
        );
      }
    }

    function stopCountdown() {
      clearInterval(countdown);
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