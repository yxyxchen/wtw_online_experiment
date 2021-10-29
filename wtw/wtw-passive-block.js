/*
 * 
 PExample plugin template
 */

jsPsych.plugins["wtw-passive-block"] = (function(){

  var plugin = {};

  plugin.info = {
    name: "wtw-passive-block",
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
      condition: {
        type: jsPsych.plugins.parameterType.STRING,
        description: 'Task condition'
      },
      block_time: {
        type: jsPsych.plugins.parameterType.INT,
        description: 'Length of time (ms) of a block'
      },
      check_interval: {
        type: jsPsych.plugins.parameterType.INT,
        default: 500,
        description: 'Time interval to check the keypress'
      },
      initialEarnings: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0,  
        description: 'Earnings earned from previous blocks'
      }
    }
  }

  plugin.trial = function(display_element, trial){
    /********************************************************************/
    /* helper functions */
    /********************************************************************/
    // functions to kill the handlers and the listener 
    // function to display stimuli 

    var kill_listeners = function(listener_id){
      if(listener_id !== 'undefined'){
        jsPsych.pluginAPI.cancelKeyboardResponse(listener_id)
      }
    }
    var kill_timers = function(){
      for (var i = 0; i < timeoutHandlers.length; i++) {
        clearTimeout(timeoutHandlers[i])
      }
    }
    
    var display_stim = function(stim_name){
      // default setting
      var tokenColor = "grey"
      var tokenBorderColor = "grey"
      var soldText = ""
      var centText = ""
      var centTextRight = 55 + "px"

      // determine the token color configurations based on the counterbalance group  
      var HP_immature_color = "green"
      var HP_mature_color = "#a4d246" // light green
      var LP_immature_color = "#7D3C98" // dark purple 
      var LP_mature_color = "#CCCCFF" // light purple 

      if(stim_name == "HP_immature_token"){
        tokenColor = HP_immature_color
        tokenBorderColor = "white"
        centText = "0 &cent"
        centTextRight = 80 + "px"
      }

      if(stim_name == "HP_mature_token"){
        tokenColor = HP_mature_color
        tokenBorderColor = "white"
        centText = trial.maturation_value + " &cent"
        centTextRight = 55 + "px"
      }

      if(stim_name == "HP_immature_sold"){
        tokenColor = HP_immature_color
        tokenBorderColor = "white"
          soldText = "SOLD"
        centText = "0 &cent"
        centTextRight = 80 + "px"
      }

      if(stim_name == "HP_mature_sold"){
        tokenColor = HP_mature_color
        tokenBorderColor = "white"
        centText = trial.maturation_value + " &cent"
        soldText = "SOLD"
        centTextRight = 55 + "px"
      }

      if(stim_name == "LP_immature_token"){
        tokenColor = LP_immature_color
        tokenBorderColor = "white"
        centText = "0 &cent"
        centTextRight = 80 + "px"
      }

      if(stim_name == "LP_mature_token"){
        tokenColor = LP_mature_color
        tokenBorderColor = "white"
        centText = trial.maturation_value + " &cent"
        centTextRight = 55 + "px"
      }

      if(stim_name == "LP_immature_sold"){
        tokenColor = LP_immature_color
        tokenBorderColor = "white"
          soldText = "SOLD"
        centText = "0 &cent"
        centTextRight = 80 + "px"
      }

      if(stim_name == "LP_mature_sold"){
        tokenColor = LP_mature_color
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

      // update the total earnings 
      var total_text = document.getElementById("jspsych-wtw-total")
      total_text.innerHTML  = "You have earned " + earningsCount / 100 + " &#36"
    }

    var updateBar = function(){
      // read the current time 
      var current_time = new Date()
      // update the progress bar 
      var elapsedTime =  current_time.getTime() - block_start_time.getTime()
      var width = elapsedTime / trial.block_time * 100
      elem = document.getElementById("jspsych-wtw-bar")
      elem.style.width = Math.min(Math.max(width, 1), 100) + "%";
    }

    var end_of_trial = function(){
      kill_listeners(keyboardListener)
      kill_listeners(keyboardListenerMatured)
      kill_timers(timeoutHandlers)
      if(new Date() - block_start_time < trial.block_time){
        unit_trial()
      }else{
        terminate_block()
      }
    }

    var terminate_block = function(){
      kill_listeners(keyboardListener)
      kill_listeners(keyboardListenerMatured)
      kill_timers(timeoutHandlers)
      display_element.innerHTML = ""
      clearInterval(barHandler)
      trial_data = {
        "trialIdx": trialIdx,
        "condition": condition,
        "scheduledDelay": scheduledDelay, 
        "trialStartTime": trialStartTime,
        "RT": RT,
        "trialEarnings": trialEarnings,
        "totalEarnings": totalEarnings,
        "timeWaited": timeWaited,
        "sellTime": sellTime,
        "rewardedTime": rewardedTime
      }
      jsPsych.finishTrial(trial_data) 
    }

    var callback = function(sell_timing){
      kill_timers() 
      kill_listeners(keyboardListener)
      kill_listeners(keyboardListenerMatured)

      // update the global variables, trialCount and earningCount 
      if(sell_timing == "immature"){
        earningsCount += 0
      }else{
        earningsCount += trial.maturation_value
      }

      // save action-dependent data 
      var current_time = new Date()
      if(sell_timing == "immature"){
        trialEarnings.push(0)
      }
      else{
        trialEarnings.push(trial.maturation_value)
      }
      totalEarnings.push(earningsCount)
      if(sell_timing == "immature"){
        RT.push(Number.NaN)
      }
      else{
        RT.push(current_time.getTime() - current_rewarded_time.getTime())
      }
      sellTime.push(current_time.getTime() - block_start_time.getTime())
      timeWaited.push(current_time.getTime() - current_trial_start_time.getTime())
      if(sell_timing == "immature"){
        rewardedTime.push(Number.NaN)
      }
      else{
        rewardedTime.push(current_rewarded_time.getTime() - block_start_time.getTime())
      }

      // show the feedback 
      if(sell_timing == "immature"){
        display_stim(trial.condition + "_immature_sold")
      }
      else{
        display_stim(trial.condition + "_mature_sold")
      }
      
      // clear the screen for the iti period 
      var handle_iti = jsPsych.pluginAPI.setTimeout(function(){
        display_stim("iti")
      }, trial.feedback_time); timeoutHandlers.push(handle_iti) 

      // exit the trial
      var handle_end_of_trial = jsPsych.pluginAPI.setTimeout(function(){
        end_of_trial(sell_timing)
      },
        trial.feedback_time + trial.iti); timeoutHandlers.push(handle_end_of_trial)
    }

    /**********************/
    /* callback functions */
    /**********************/
    var keypressCheck = function(){
    /* Create a keyboardListener which will terminate itself if
    /(1) the spacebar is pressed (if so, sell the token, show feedback, save data and move to the next trial)
    /(2) and the token matures (if so, change the token color, update the global variable rewardedTime, and trigger keypressCheckMatured)
    */

      keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: function () {
          callback("immature")
        },
        valid_responses: [32],
        rt_method: 'performance',
        persist: false
      })

      // if the token matures 
      var handle_token_mature = jsPsych.pluginAPI.setTimeout(function(){
        kill_listeners(keyboardListener)
        kill_timers()
        var current_time = new Date()
        display_stim(trial.condition + "_mature_token")

        // save rewarded time 
        current_rewarded_time = current_time

        // start to check keypress again 
        var keyboardListenerMatured = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: function(){
            callback("mature")
          },
          valid_responses: [32],
          rt_method: 'performance',
          persist: false
        })
      }, currentDelay); timeoutHandlers.push(handle_token_mature)
    }

    /**********************************************************************/
    /* function to run a unit trial  */
    /**********************************************************************/
    var unit_trial = function(){

      // update the global variable, current_trial_start_time
      current_trial_start_time = new Date()
      trialStartTime.push(current_trial_start_time.getTime() - block_start_time.getTime())

      // update the global variable, current delay 
      currentDelay = scheduledDelays[trialCount]
      // console.log(currentDelay)

      // save input data 
      scheduledDelay.push(scheduledDelays[trialCount])
      condition.push(trial.condition)
      trialIdx.push(trialCount + 1)
      

      // update the global variable, trialCount (I keep it global since I can't pass arguments to the callback functions)
      trialCount += 1
      // console.log(trialCount)

      // update the stimuli
      display_stim(trial.condition+"_immature_token")
      
      // start check the keypress
      keypressCheck()
    }
    

    /**********************************************************************/
    /* constants */
    /**********************************************************************/  
    var HPDelays = [9000, 10500, 3000, 4500, 3000, 12000, 10500, 10500, 12000, 6000, 12000,
    9000, 1500, 6000, 6000, 10500, 7500, 1500, 4500, 4500, 6000, 7500, 7500, 9000, 12000,
    12000, 3000, 7500, 6000, 4500, 9000, 7500, 3000, 3000, 9000, 9000, 3000, 10500, 9000,
    4500, 10500, 1500, 9000, 6000, 1500, 1500, 12000, 1500, 3000, 1500, 7500, 4500, 7500,
    10500, 4500, 1500, 10500, 6000, 3000, 6000, 9000, 1500, 3000, 4500, 12000, 7500, 12000,
    4500, 12000, 3000, 6000, 12000, 1500, 6000, 3000, 10500, 7500, 12000, 7500, 7500, 6000,
    4500, 4500, 7500, 3000, 12000, 10500, 9000, 7500, 9000, 10500, 6000, 1500, 9000, 3000,
    9000, 12000, 4500, 10500, 4500, 6000, 6000, 10500, 1500, 7500, 1500, 4500, 9000, 4500,
    1500, 12000, 9000, 6000, 7500, 4500, 3000, 1500, 1500, 10500, 3000, 7500, 10500, 12000,
    12000, 6000, 9000, 9000, 4500, 4500, 9000, 7500, 10500, 10500, 6000, 3000, 3000, 9000,
    9000, 3000, 10500, 3000, 1500, 4500, 1500, 1500, 12000, 7500, 4500, 10500, 9000, 10500,
    10500, 1500, 9000, 12000, 3000, 7500, 7500, 1500, 7500, 3000, 4500, 6000, 1500, 6000,
    10500, 7500, 9000, 1500, 3000, 6000, 6000, 9000, 6000, 7500, 12000, 9000, 4500, 7500,
    6000, 4500, 3000, 3000, 12000, 1500, 10500, 12000, 4500, 12000, 10500, 4500, 7500, 6000,
    12000, 12000, 6000, 4500, 6000, 12000, 6000, 6000, 9000, 10500, 6000, 10500, 10500, 1500,
    7500, 9000, 6000, 3000, 3000, 7500, 7500, 3000, 9000, 3000, 1500, 9000, 7500, 10500, 7500,
    4500, 12000, 10500, 9000, 9000, 12000, 7500, 1500, 6000, 7500, 12000, 4500, 4500, 3000,
    12000, 1500, 3000, 4500, 9000, 1500, 12000, 9000, 7500, 4500, 10500, 4500, 1500, 10500,
    12000, 3000, 10500, 3000, 6000, 1500, 4500, 7500, 6000, 6000, 1500, 1500, 3000, 4500, 6000,
    10500, 7500, 10500, 10500, 4500, 1500, 4500, 12000, 12000, 3000, 7500, 7500, 12000, 4500,
    3000, 12000, 7500, 9000, 1500, 6000, 4500, 10500, 12000, 10500, 6000, 12000, 6000, 9000,
    10500, 1500, 12000, 9000, 4500, 4500, 9000]

    var LPDelays = [23999, 4253, 1203, 23999, 7650, 4253, 569, 569, 23999, 23999, 13596, 2312,
    7650, 1203, 4253, 13596, 1203, 7650, 7650, 13596, 4253, 23999, 206, 23999, 1203, 1203,
    2312, 206, 2312, 13596, 23999, 2312, 4253, 206, 4253, 7650, 206, 13596, 13596, 206, 7650,
    2312, 569, 206, 1203, 13596, 7650, 23999, 569, 1203, 569, 7650, 569, 2312, 23999, 4253, 2312,
    1203, 206, 206, 569, 13596, 569, 4253, 4253, 569, 206, 4253, 23999, 23999, 206, 13596, 206,
    7650, 7650, 206, 1203, 1203, 4253, 1203, 206, 206, 2312, 2312, 569, 1203, 569, 4253, 13596,
    4253, 4253, 206, 23999, 1203, 23999, 569, 569, 23999, 13596, 569, 2312, 13596, 7650, 4253,
    7650, 2312, 23999, 2312, 4253, 2312, 1203, 7650, 1203, 2312, 7650, 23999, 7650, 569, 7650,
    13596, 2312, 206, 569, 13596, 1203, 13596, 13596, 23999, 4253, 23999, 13596, 4253, 4253,
    569, 2312, 2312, 1203, 7650, 2312, 569, 23999, 1203, 569, 1203, 2312, 4253, 7650, 569,
    13596, 2312, 206, 1203, 4253, 2312, 23999, 7650, 23999, 206, 7650, 7650, 206, 206, 23999,
    569, 206, 4253, 13596, 206, 13596, 13596, 7650, 13596, 1203, 206, 2312, 2312, 13596, 569,
    7650, 1203, 1203, 13596, 23999, 2312, 7650, 4253, 1203, 23999, 23999, 4253, 206, 569, 4253,
    206, 1203, 13596, 4253, 2312, 569, 569, 23999, 206, 7650, 13596, 1203, 4253, 4253, 1203, 23999,
    2312, 2312, 1203, 206, 13596, 2312, 23999, 7650, 4253, 569, 7650, 7650, 1203, 7650, 2312,
    13596, 206, 569, 2312, 7650, 206, 2312, 4253, 13596, 569, 569, 4253, 7650, 23999, 569, 206,
    4253, 23999, 1203, 2312, 206, 23999, 13596, 23999, 23999, 13596, 13596, 7650, 569, 1203, 569,
    13596, 206, 206, 4253, 13596, 1203, 1203, 569, 206, 13596, 2312, 1203, 4253, 206, 23999, 1203,
    1203, 206, 569, 13596, 23999, 2312, 569, 7650, 7650, 569, 23999, 569, 4253, 1203, 13596, 569,
    1203, 23999, 206, 7650, 13596, 4253, 4253, 2312, 2312, 23999, 4253, 569, 2312]

    /**********************************************************************/
    /* main */
    /**********************************************************************/  
    var timeoutHandlers = [] // handlers can be defined locally, yet will be pushed to the global level so that they can be killed by the function 
    var keyboardListener = new Object // keyboardListener is defined directly on the global level and could be killed by the function, kill_listeners
    var keyboardListenerMatured = new Object 
    var globalQuitKeyListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: function(){
            terminate_block()
          },
          valid_responses: [27],
          rt_method: 'performance',
          persist: true
    })
    
    // trial-wise variables 
    var currentDelay;
    var current_rewarded_time;
    var current_trial_start_time;
    //  time marker
    var block_start_time = new Date() 
    // trial counter 
    var trialCount = 0
    // scheduled delays 
    if(trial.condition == "HP"){
      scheduledDelays = HPDelays
    }else{
      scheduledDelays = LPDelays
    }
    var earningsCount = trial.initialEarnings

    // initialize the output 
    var scheduledDelay = []
    var condition = []
    var trialIdx = []
    var RT = []
    var trialEarnings = []
    var totalEarnings = []
    var timeWaited = []
    var trialStartTime = []
    var sellTime = []
    var rewardedTime = []

    // display stimuli: wtw-token, wtw-cent-text, wtw-sold-text, wtw-total, wtw-bar, ....
    // properties of these stimuli can be updated later
    display_element.innerHTML = 
    `<div class="container" id="jspsych-wtw-content">
        <div id="jspsych-wtw-token"></div>
        <div id = 'jspsych-wtw-cent-text'></div>
        <div id = jspsych-wtw-sold-text></div>
        <div id = jspsych-wtw-ready-text></div>
        <div id = 'jspsych-wtw-total' class='text-block'>You have earned ${earningsCount/100} &#36</div>
        <div id="jspsych-wtw-progress"></div>
        <div id="jspsych-wtw-bar"></div>
        <div id = 'jspsych-wtw-bar-left-text'>0 min</div>
        <div id = 'jspsych-wtw-bar-right-text'>${trial.block_time/1000/60} min</div>
    </div>`

    // update the progress bar (to be killed when the trial ends)
    var barHandler = setInterval(function(){updateBar()}, 100);

    // call the recursive function, unit_trial
    unit_trial() 

    // set up a timer to terminate the block
    jsPsych.pluginAPI.setTimeout(function(){
      terminate_block()
    }, trial.block_time);


  };

  return plugin;
})();

