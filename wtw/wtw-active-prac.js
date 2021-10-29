/*
 * 
 PExample plugin template
 */

jsPsych.plugins["wtw-active-prac"] = (function(){

  var plugin = {};

  plugin.info = {
    name: "wtw-active-prac",
    description: 'Plugin for run a WTW trial.',
    parameters: {
      iti:{
        type: jsPsych.plugins.parameterType.INT,
        description: 'Length of time (ms) between trials.',
      },
      feedback_time: { 
        type: jsPsych.plugins.parameterType.INT,
        default: 1000,
        description: 'Length of time (ms) to display the feedback'
      },
      maturation_value: {
        type: jsPsych.plugins.parameterType.INT,
        description: 'Maturation value'
      },
      trial_id: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "prac",
        description: 'Trial ID'
      },
      scheduled_delay: {
        type: jsPsych.plugins.parameterType.INT,
        description: 'Length of time (ms) of a block'
      },
      check_interval: {
        type: jsPsych.plugins.parameterType.INT,
        default: 500,
        description: 'Time interval to check the keypress'
      },
      instruction:{
        type: jsPsych.plugins.parameterType.STRING, 
        description: 'Whether to sell the token before or after the token matures'
      }
    }
  }

  plugin.trial = function(display_element, trial){
    /********************************************************************/
    /* helper functions */
    /********************************************************************/
    // functions to kill the handlers and the listener 
    // function to display stimuli 

    var kill_listeners = function(){
      if(keyboardListener !== 'undefined'){
        jsPsych.pluginAPI.cancelAllKeyboardResponses()
      }
    }
    var kill_timers = function(){
      for (var i = 0; i < timeoutHandlers.length; i++) {
        clearTimeout(timeoutHandlers[i])
      }
    }

    var restart = function(){
      if(trial.instruction == "mature"){
        display_element.innerHTML = active_warnings_please_wait_longer_text // loaded from instructions_text.js
      }else{
        display_element.innerHTML = active_warnings_please_sell_ealier_text  // loaded from instructions_text.js
      }
      document.getElementById("button").onclick = function() {unit_trial()};
    }

    
    var display_stim = function(stim_name){
      var tokenColor = "grey"
      var tokenBorderColor = "grey"
      var soldText = ""
      var centText = ""
      var centTextRight = 55 + "px"

      if(stim_name == "immature_token"){
        tokenColor = "#3690c0"
        tokenBorderColor = "white"
        centText = "0 &cent"
        centTextRight = 80 + "px"
      }

      if(stim_name == "mature_token"){
        tokenColor = "#a6bddb"
        tokenBorderColor = "white"
        centText = trial.maturation_value + " &cent"
        centTextRight = 55 + "px"
      }

      if(stim_name == "immature_sold"){
        tokenColor = "#3690c0"
        tokenBorderColor = "white"
          soldText = "SOLD"
        centText = "0 &cent"
        centTextRight = 80 + "px"
      }

      if(stim_name == "mature_sold"){
        tokenColor = "#a6bddb"
        tokenBorderColor = "white"
        centText = trial.maturation_value + " &cent"
        soldText = "SOLD"
        centTextRight = 55 + "px"
      }   

      // update stimulus properties based on the input
      var token = document.getElementById("jspsych-wtw-token")
      token.style.background = tokenColor
      token.style.borderColor = tokenBorderColor
      
      var sold_text = document.getElementById("jspsych-wtw-sold-text")
      sold_text.innerHTML = soldText

      var cent_text = document.getElementById("jspsych-wtw-cent-text")
      cent_text.innerHTML = centText
    }

    var end_of_trial = function(sell_timing){
      kill_listeners(keyboardListener)
      kill_listeners(keyboardListenerMatured)
      kill_timers(timeoutHandlers)

      if(trial.instruction != sell_timing){
        restart()
      }else{
        trial_data = {
          "scheduledDelay": scheduledDelay, 
          "trialStartTime": trialStartTime,
          "RT": RT,
          "trialEarnings": trialEarnings,
          "totalEarnings": totalEarnings,
          "timeWaited": timeWaited,
          "sellTime": sellTime,
          "rewardedTime": rewardedTime,
          "maKeypressLog": maKeypressLog,
          "imKeypressLog": imKeypressLog
        }  
        jsPsych.finishTrial(trial_data)         
      } 
    }

    var stop_check = function(sell_timing){
      kill_listeners(keyboardListener)
      kill_listeners(keyboardListenerMatured)
      kill_timers(timeoutHandlers)
      
      // console.log('No keypress')
      var current_time = new Date()
      imKeypressLog.push(0)
      maKeypressLog.push(0)

      // update action-dependent data 
      if(sell_timing == "mature"){
        earningsCount += trial.maturation_value
        display_stim("mature_sold")
      }else{
        earningsCount += 0
        display_stim("immature_sold")
      }

      // save data
      if(sell_timing == "mature"){
        trialEarnings.push(trial.maturation_value)
      }else{
        trialEarnings.push(0)
      }
      totalEarnings.push(earningsCount)
      if(sell_timing == "mature"){
        RT.push(current_time.getTime() - current_rewarded_time.getTime()) 
        rewardedTime.push(current_rewarded_time.getTime() - block_start_time.getTime()) 
      }else{
        RT.push(Number.NaN)
        rewardedTime.push(Number.NaN)
      }
      sellTime.push(current_time.getTime() -  block_start_time.getTime())
      timeWaited.push(current_time.getTime() - current_trial_start_time.getTime())
      

      // clear the screen for the iti period 
      var handle_iti = jsPsych.pluginAPI.setTimeout(function(){
        display_stim("iti")
      }, trial.feedback_time); timeoutHandlers.push(handle_iti) 


      var handle_end_of_trial = jsPsych.pluginAPI.setTimeout(function(){
        end_of_trial(sell_timing)
      }, trial.feedback_time + trial.iti); timeoutHandlers.push(handle_end_of_trial) 
    }

    /**********************/
    /* callback functions */
    /**********************/
    var keypressCheck = function(){
      /* Create a keyboardListener which will renew itself if
      /(1) the spacebar is pressed within the specified interval (otherwise, print "sold". If the block has not ended, start a new trial)
      /(2) and the token has not matured yet (otherwise, change the token color and trigger keypressCheckMatured)
      */

      keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: function () {
          var current_time = new Date()
          imKeypressLog.push(current_time.getTime() - current_trial_start_time.getTime())
          // console.log(imKeypressLog)
          kill_listeners(keyboardListener)
          kill_listeners(keyboardListenerMatured)
          kill_timers(timeoutHandlers)
          /******** exit condition (2): the token matures *********/
          var current_time = new Date()
          if(current_time - current_trial_start_time >= currentDelay){
            current_rewarded_time = current_time
            display_stim("mature_token")
            keypressCheckMatured()
          }else{
            keypressCheck()
          }
        },
        valid_responses: [32],
        rt_method: 'performance',
        persist: false
      })

      /******** exit condition (1) sell the token if no keypress in one check_interval *********/
      var handle_immature_stop_check = jsPsych.pluginAPI.setTimeout(function(){
        stop_check("immature")
      }, trial.check_interval); timeoutHandlers.push(handle_immature_stop_check)
    }

    var keypressCheckMatured = function(){
      /* create a keyboardListener which will renew itself if
      / the spacebar is pressed within the specified interval (otherwise, print "sold". If the block has not ended, start a new trial)
      */

      // start to check the keypress 
      var keyboardListenerMatured = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: function(){
          kill_listeners(keyboardListener)
          kill_listeners(keyboardListenerMatured)
          kill_timers(timeoutHandlers)
          var current_time = new Date()
          maKeypressLog.push(current_time.getTime() - current_trial_start_time.getTime())
          // console.log(maKeypressLog)
          keypressCheckMatured()
        },
        valid_responses: [32],
        rt_method: 'performance',
        persist: false
      })

      // exit condition: sell the token if no keypress in one check_interval 
      var handle_mature_stop_check = jsPsych.pluginAPI.setTimeout(function(){
        stop_check("mature")
      }, trial.check_interval)
      timeoutHandlers.push(handle_mature_stop_check)
    }

    /**********************************************************************/
    /* function to run a unit trial  */
    /**********************************************************************/
    var unit_trial = function(){
      // display stimuli: wtw-token, wtw-cent-text, wtw-sold-text, wtw-total, wtw-bar, ....
      // properties of these stimuli can be updated later
      display_element.innerHTML = 
      `<div class="container" id="jspsych-wtw-content">
          <div id="jspsych-wtw-token"></div>
          <div id = 'jspsych-wtw-cent-text'></div>
          <div id = jspsych-wtw-sold-text></div>
          <div id = jspsych-wtw-ready-text></div>
      </div>`

      // update the global variable, current delay 
      currentDelay = trial.scheduled_delay

      // save input data 
      scheduledDelay.push(currentDelay)
      

      // update the global variable, trialCount (I keep it global since I can't pass arguments to the callback functions)
      trialCount += 1

      // update the stimuli
      display_stim("immature_token")
      
      /******************/
      /* outcome1: the agent sells the token before the token matures */
      /* outcome2: the token matures and the agent sells the matured token */
      /*****************/
      // keypressCheck() 
      var readyText = document.getElementById("jspsych-wtw-ready-text")
      readyText.innerHTML = "Start pressing now"
      keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: function () {
                var readyText = document.getElementById("jspsych-wtw-ready-text")
                readyText.innerHTML = ""
                // update the global variable, current_trial_start_time
                current_trial_start_time = new Date()
                trialStartTime.push(current_trial_start_time.getTime() - block_start_time.getTime())
                keypressCheck()
              },
              valid_responses: [32],
              rt_method: 'performance',
              persist: false
            })
    }
    

    /**********************************************************************/
    /* main */
    /**********************************************************************/  
    var timeoutHandlers = [] // handlers can be defined locally, yet will be pushed to the global level so that they can be killed by the function 
    var keyboardListener = new Object // keyboardListener is defined directly on the global level and could be killed by the function, kill_listeners
    var keyboardListenerMatured = new Object 

    
    // trial-wise variables 
    var currentDelay;
    var current_rewarded_time;
    var current_trial_start_time;
    //  time marker
    var block_start_time = new Date() 
    // trial counter 
    var trialCount = 0
    var earningsCount = 0

    // initialize the output 
    var scheduledDelay = []
    var RT = []
    var trialEarnings = []
    var totalEarnings = []
    var timeWaited = []
    var trialStartTime = []
    var sellTime = []
    var rewardedTime = []
    var imKeypressLog = []
    var maKeypressLog = []

    // call the recursive function, unit_trial
    unit_trial() 

  };

  return plugin;
})();

