/*
 * 
 PExample plugin template
 */

jsPsych.plugins["wtw-rising-falling-block"] = (function(){

  var plugin = {};

  plugin.info = {
    name: "wtw-rising-falling-block",
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
      block_time: {
        type: jsPsych.plugins.parameterType.INT,
        description: 'Length of time (ms) of a block'
      },
      transition_time:{
        type: jsPsych.plugins.parameterType.INT,
        description: 'When (ms) the condition transits from rising to falling'
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
      var elem = document.getElementById("jspsych-wtw-trial-timer-head")
      elem.style.backgroundColor = "black"
      var elem = document.getElementById("jspsych-wtw-trial-timer")
      elem.style.backgroundColor = "white"

      var tokenColor = "grey"
      var tokenBorderColor = "grey"
      var soldText = ""
      var centText = ""
      var centTextRight = 55 + "px"

      // determine the token color configurations based on the counterbalance group  
      var HP_immature_color = "green"
      var HP_mature_color = "#7D3C98" // dark purple 
      var LP_immature_color = "green"
      var LP_mature_color = "#7D3C98" // dark purple 

      if(stim_name == "HP_immature_token"){
        tokenColor = HP_immature_color
        tokenBorderColor = "white"
        centText = "0 &cent"
        centTextRight = 80 + "px"
      }

      if(stim_name == "HP_mature_token"){
        tokenColor = HP_mature_color
        tokenBorderColor = "white"
        centText = currentReward + " &cent"
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
        centText = currentReward + " &cent"
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
        centText = currentReward + " &cent"
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
        centText = currentReward + " &cent"
        soldText = "SOLD"
        centTextRight = 55 + "px"
      }     

      if(stim_name == "iti"){
        var elem = document.getElementById("jspsych-wtw-trial-timer-head")
        elem.style.backgroundColor = "grey"
        var elem = document.getElementById("jspsych-wtw-trial-timer")
        elem.style.width = "0%"
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
      total_text.innerHTML  = "Total earned: " + earningsCount / 100 + " &#36"
    }

    var updateTrialTimer = function(){
      var elem = document.getElementById("jspsych-wtw-trial-timer")
      // read the current time 
      var current_time = new Date()
      // update the progress bar 
      var elapsedTime =  current_time.getTime() - current_trial_start_time.getTime()
      var width = elapsedTime * 0.004 
      elem.style.width = Math.min(Math.max(width, 1), 100) + "%";
    }

    var updateTimeLeft = function(){
      // read the current time 
      var current_time = new Date()
      // update the progress bar 
      var elapsedTime =  current_time.getTime() - block_start_time.getTime()
      var leftTime = Math.round((trial.block_time - elapsedTime) / 1000)
      var leftSecs = Math.max(leftTime % 60, 0)
      var leftMins = Math.max((leftTime - leftSecs) / 60, 0)
      var elem = document.getElementById("jspsych-wtw-left-time")
      if(leftSecs < 10){
        elem.innerHTML = "Time left: " + leftMins + ":0" + leftSecs
      }else{
        elem.innerHTML = "Time left: " + leftMins + ":" + leftSecs
      }
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

    // if the task ends in the middle of a trial 
    var terminate_block = function(){
        kill_listeners(keyboardListener)
        kill_listeners(keyboardListenerMatured)
        kill_timers(timeoutHandlers)
        clearInterval(leftTimeHandler)
        clearInterval(trialTimerHandler) // usually cleared during the ITI period 
        display_element.innerHTML = ""
        trial_data = {
          "trialIdx": trialIdx,
          "condition": condition,
          "scheduledDelay": scheduledDelay, 
          "scheduledReward": scheduledReward,
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
      clearInterval(trialTimerHandler) // stop updating the trial timer

      // update the global variables, trialCount and earningCount 
      if(sell_timing == "immature"){
        earningsCount += 0
      }else{
        earningsCount += currentReward
      }

      // save action-dependent data 
      var current_time = new Date()
      if(sell_timing == "immature"){
        trialEarnings.push(0)
      }
      else{
        trialEarnings.push(currentReward)
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
        display_stim(currentCondition + "_immature_sold")
      }
      else{
        display_stim(currentCondition + "_mature_sold")
      }
      
      // clear the screen for the iti period 
      var handle_iti = jsPsych.pluginAPI.setTimeout(function(){
        display_stim("iti")
      }, trial.feedback_time); timeoutHandlers.push(handle_iti) 

      // exit the trial
      var handle_end_of_trial = jsPsych.pluginAPI.setTimeout(function(){
        end_of_trial()
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
        display_stim(currentCondition + "_mature_token")

        // save rewarded time 
        current_rewarded_time = current_time

        // start to check keypress for the matured token 
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
      // resume updating the trial timer 
      trialTimerHandler = setInterval(function(){
        updateTrialTimer()
      }, 20);

      // update the global variable, current_trial_start_time
      current_trial_start_time = new Date()
      trialStartTime.push(current_trial_start_time.getTime() - block_start_time.getTime())

      // detect condition transition 
      if((new Date() - block_start_time) > trial.transition_time && currentCondition == "LP"){
        currentCondition = "HP"
        trialCount = 0
        scheduledDelays = HPDelays
        scheduledRewards = HPRewards
      }

      // update the global variable, current delay, current reward 
      currentDelay = scheduledDelays[trialCount]
      // console.log(currentDelay)
      currentReward = scheduledRewards[trialCount]

      // console.log(currentDelay)

      // save input data 
      scheduledDelay.push(scheduledDelays[trialCount])
      scheduledReward.push(scheduledRewards[trialCount])
      condition.push(currentCondition)
      trialIdx.push(trialCount + 1)
      

      // update the global variable, trialCount (I keep it global since I can't pass arguments to the callback functions)
      trialCount += 1
      // console.log(trialCount)

      // update the stimuli
      display_stim(currentCondition+"_immature_token")
      
      // start check the keypress
      keypressCheck()
    }
    

    /**********************************************************************/
    /* constants */
    /**********************************************************************/  
    var LPDelays = [9703,2171,11152,4417,11894,3242,10975,10464,10941,2961,9535,11933,9056,
    3690,1822,11651,9791,9941,8704,6236,9259,2571,4241,8380,1264,2435,11271,814,9190,8866,
    10770,11700,10846,8554,1775,10466,11598,11833,1414,1472,10216,10100,11348,8375,3394,8141,
    11057,2951,11186,8474,11569,11946,11181,4471,8352,10071,8944,748,8576,10385,1791,11997,2455,
    11538,10013,1799,3058,2855,11856,6330,11195,8433,1377,11403,3224,9843,2187,2189,8950,11749,1752,
    10696,10864,11174,9906,1638,2980,1954,10230,1820,11951,11809,9937,3467,9513,11351,1635,1881,11585,
    1983,5124,3779,9269,9555,11621,11340,11574,8649,6860,3319,8477,2272,10414,8932,3729,10651,11815,839,
    11012,1877,6776,9272,1705,865,1007,7179,11174,9901,1391,5296,9081,11875,2623,6728,1279,11146,11294,
    11826,5268,1297,11635,10197,4756,3025,11063,2178,3507,8713,2095,4362,9340,5690,5191,11014,10793,1996,
    1756,1398,9714,2392,11377,1028,10878,9128,7117,7809,11837,10686,7420,10307,9988,11915,3636,3060,3886,
    10429,10536,10707,1840,10450,2745,10912,10340,11369,11967,11953,9017,11191,9744,11567,11250,1563,11623,
    11726,2155,8271,11468,10131,2165,9393,3279,2292,11830,1539,5303,8858,9908,3074,6676,10644,9114,2630,10673,
    6917,8575,10435,2947,1977,3821,1370,10844,10353,3187,3338,9064,2743,11240,7822,11365,8730,3339,9849,8340,
    1386,10245,10009,11381,10305,11784,2875,1934,8766,10263,1716,1564,11605,9352,3407,1296,10610,1038,6731,8870,
    10965,8833,11664,7027,11977,2822,10525,9187,3847,2388,11632,11386,1654,2290,2982,8266,1949,8230,10143,11237,
    3914,11670,11216,10769,11896,2522,2559,11158,11277,2191,2989,8926,10799,3980,8728,5577,10887,11661,9190,8394,
    1998,2131,8769,9762,10163,11842,10184,7723,11652,8487,10872,2593,1885,9496,11818,3640,9389,9548,11145,4593,9336,
    3714,11240,8316,2229,10083,2081,9362,8160,3497,3784,10641,3091,11473,11026,11141,11242,10606,9613,6602,9022,
    8141,11799,11362,1292,3381,10296,10910,11559,10295,11649,9608,11992,10959,11265,10436,5317,9639,11312,1876,8121,
    6967,9809,10563,11729,11037,3422,1736,571,2538,11509,11784,2260,1508,3632,11153,11629,8897,2455,2739,11407,9364,
    11401,11569,7671,1337,1849,11344,1303,11462,11853,1563,11407,2374,3644,4044,2347,1620,11650,11595,4499,4898,
    11309,6329,11339,4229,11645,11988,1824,1816,2569,10353,8843,2756,11900,2754,11005,8434,7343,2134,11171,2839,
    5906,11670,9785,1094,11063,8005,11195,2350,11544,1200,3397,10830,10682,10599,1628,2521,11921,8791,2993,8549,9097,
    3123,3907,5679,10740,11757,6419,8600,6123,9998,5069,10317,9182,1932,10473,6156,11805,6914,6900,11935,2160,1568,
    11660,2451,3751,10554,9847,9382,3721,11157,10598,11314,8682,7152,10939,9224,10614,10632,1902,10622,10798,11655,
    11131,7844,11462,10758,10662,11919,11950,9384,10866,9463,1679,10508,1447,11301,3597,10006,11759,1034,2259,10376,
    2794,2728,8267,1333,1030,10593,10418,11596,2916,2232,4567,10758,9812,2858,10514,11987,9845,8214,11454,11785,4133,
    11480,11642,2285,11554,11968,10509,10564,5377,11761,1785,9642,11746,11711,6127,11598,10993,8850,1814,10407,9513,
    6631,9547,3022,11593,9473,2671,1109,11488,2533,1075,11559,2496,1371,11032,8532,11278,2585,11149,2954,2451,11116,
    4044,1464,2772,11933,7228,10843,8868,4386,3145,11325,5794,10258,10101,2669,11436,11597,
    11404,8440,7045,9647,11333,5803,1050,1904,3492,9807,11855,2146,1505,3906,10525,4777,8943,3351,1397,5331,11724,9749,11131,1517,11740]

    var LPRewards = [-2,8,-2,-2,-2,8,-2,-2,-2,8,-2,-2,-2,8,8,-2,-2,-2,-2,-2,-2,8,8,-2,8,8,-2,8,
    -2,-2,-2,-2,-2,8,8,-2,-2,-2,8,8,-2,-2,-2,-2,8,-2,-2,8,-2,-2,-2,-2,-2,8,-2,-2,-2,8,-2,-2,8,
    -2,8,-2,-2,8,8,8,-2,-2,-2,-2,8,-2,8,-2,8,8,-2,-2,8,-2,-2,-2,-2,8,8,8,-2,8,-2,-2,-2,8,-2,-2,
    8,8,-2,8,8,8,-2,-2,-2,-2,-2,-2,-2,8,-2,8,-2,-2,8,-2,-2,8,-2,8,-2,-2,8,8,8,-2,-2,-2,8,8,-2,-2,
    8,-2,8,-2,-2,-2,-2,8,-2,-2,8,8,-2,8,8,-2,8,8,-2,-2,8,-2,-2,8,8,8,-2,8,-2,8,-2,-2,-2,-2,-2,-2,
    -2,-2,-2,-2,8,8,8,-2,-2,-2,8,-2,8,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,8,-2,-2,8,-2,-2,-2,8,-2,8,8,
    -2,8,-2,-2,-2,8,-2,-2,-2,8,-2,-2,-2,-2,8,8,8,8,-2,-2,8,8,-2,8,-2,-2,-2,-2,8,-2,-2,8,-2,-2,-2,
    -2,-2,8,8,-2,-2,8,8,-2,-2,8,8,-2,8,-2,-2,-2,-2,-2,-2,-2,8,-2,-2,8,8,-2,-2,8,8,8,-2,8,-2,-2,-2,
    -2,-2,-2,-2,-2,8,8,-2,-2,8,8,-2,-2,8,-2,8,-2,-2,-2,-2,8,8,-2,-2,-2,-2,-2,-2,-2,-2,-2,8,8,-2,-2,
    8,-2,-2,-2,8,-2,8,-2,-2,8,-2,8,-2,-2,8,8,-2,8,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,8,8,-2,-2,-2,-2,
    -2,-2,-2,-2,-2,-2,-2,-2,-2,8,-2,-2,-2,-2,-2,-2,8,8,8,8,-2,-2,8,8,8,-2,-2,-2,8,8,-2,-2,-2,-2,-2,
    8,8,-2,8,-2,-2,8,-2,8,8,8,8,8,-2,-2,8,-2,-2,-2,-2,-2,-2,-2,8,8,8,-2,-2,8,-2,8,-2,-2,-2,8,-2,8,-2,
    -2,-2,8,-2,-2,-2,8,-2,8,8,-2,-2,-2,8,8,-2,-2,8,-2,-2,8,8,8,-2,-2,-2,-2,-2,-2,-2,-2,-2,8,-2,-2,-2,
    -2,8,-2,8,8,-2,8,8,-2,-2,-2,8,-2,-2,-2,-2,-2,-2,-2,-2,-2,8,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,
    8,-2,8,-2,8,-2,-2,8,8,-2,8,8,-2,8,8,-2,-2,-2,8,8,-2,-2,-2,8,-2,-2,-2,-2,-2,-2,8,-2,-2,8,-2,-2,-2,
    -2,8,-2,8,-2,-2,-2,8,-2,-2,-2,8,-2,-2,-2,-2,8,-2,-2,8,8,-2,8,8,-2,8,8,-2,-2,-2,8,-2,8,8,-2,-2,8,8,
    -2,-2,-2,-2,8,8,-2,-2,-2,-2,8,-2,-2,-2,-2,-2,-2,-2,8,8,8,8,-2,-2,8,8,8,-2,8,-2,-2,8,-2,-2,-2,-2,8,-2]

    var HPDelays = [11339,11998,2674,9003,1941,9852,11082,9672,11867,11441,11364,1863,4096,11464,7911,7535,
    11862,1922,10825,5805,11242,2632,9637,2223,2034,9262,9151,7111,10876,10183,9609,4764,1949,11462,3523,1919,
    773,4081,2229,10437,11216,9253,9912,2475,4584,2856,10838,10985,2757,6058,11784,2733,10354,11773,10292,8240,
    11354,10627,2182,11439,10233,1802,10784,6852,10240,3271,11897,3754,1094,8326,2897,11750,11774,1087,1518,8881,
    1675,1709,11574,1974,10854,9518,7184,1788,2679,10940,11945,7180,1956,10165,9761,1129,9416,11748,5038,2278,
    1112,10836,2318,9168,8856,11393,5348,2493,4434,8444,11577,10648,11829,11631,11068,10906,2729,8843,7736,10074,
    1393,3005,2852,6855,11313,5803,11700,10312,11368,1921,7996,8326,4256,6983,3788,7742,3441,3843,668,5444,8291,
    8769,6300,9722,11709,10728,11537,3159,10092,10434,9074,9650,11234,11142,2584,11195,10288,2096,2206,4138,10994,
    1561,9103,11596,1792,11676,11993,1938,11397,2554,11462,1521,11578,1122,9461,2421,1658,11290,6461,11643,3010,
    2701,1336,6333,1656,10420,10274,3096,3101,921,1548,11446,6330,11169,10925,1275,3742,10610,3807,7238,9932,
    10969,7697,11097,10982,11199,2031,10168,2744,11321,2829,11780,7906,1257,1579,10186,10139,9507,2111,10754,
    11699,2869,1376,10853,11793,3187,10477,2642,9621,2866,11407,8543,11996,1307,2976,11868,8776,1594,10781,8061,
    1889,1899,11516,9101,2750,10932,10277,443,9219,10615,2050,10365,7154,11884,5232,4411,11944,9159,8306,1643,11009,
    9384,10317,10061,11177,11447,8864,1420,2924,10250,1312,9781,3424,10510,10538,1780,11086,4614,2890,11671,474,959,
    1005,11486,1778,4448,9973,1030,11591,653,6812,2757,9623,9831,1452,4311,10393,10342,11007,10691,11758,910,9484,
    11880,1481,11024,10585,2810,11111,1751,3768,1750,8920,1159,3240,11813,8911,10655,2273,11837,1923,9811,11911,10343,
    4172,10851,3840,5319,11222,9975,634,11741,11653,10189,2703,11751,9997,10196,9954,11761,11039,11513,11209,11337,3680,
    1391,941,1345,9783,11771,11273,4412,11977,8829,5604,9091,11895,3780,5071,10621,4604,2377,2438,8555,2479,11200,8465,
    10914,2275,8632,1273,11433,1528,7373,1722,1440,11368,10059,8923,3132,9698,11389,10818,4427,9039,9294,11887,3200,7796,
    9814,8111,10809,2324,6977,11785,9388,3660,11507,9516,10002,3418,11884,10589,4270,2287,10405,2779,10404,9781,1861,7926,
    9116,10930,10459,2624,1725,10825,11810,9759,2195,11930,2641,8901,2881,9739,10266,9722,6245,7342,11933,6791,8876,4258,
    2528,10471,6775,2947,1343,10390,11415,11043,9198,2435,3744,9033,8551,10251,11333,2204,2156,2558,5741,10558,10697,8142,
    11183,8712,9720,3074,10388,8399,1121,11859,1887,11707,7195,1907,10507,11513,2322,11136,1069,7267,11329,8064,10848,
    11545,11334,9668,11882,10930,3641,3663,7610,852,3946,4650,2031,2047,9600,11337,11512,8455,5161,1968,2648,753,8962,
    2622,1500,11395,9616,3737,5491,11078,8304,11195,11017,11767,10560,9571,11280,2913,11148,3210,11774,11029,1311,11957,
    6268,3201,5538,10629,5276,10539,1648,1589,2230,10130,11693,10964,9383,11473,10086,1702,3161,1643,11104,1417,8541,
    10706,2698,11179,10415,4687,1169,2468,11273,1079,11628,8896,1459,11097,10010,11721,9097,3100,7981,11888,4407,1519,
    11658,4921,2745,2940,9804,9016,11034,10804,11037,11599,4539,9778,10655,10767,3040,11618,9982,11609,11230,2624,11479,
    11759,10462,6651,11394,2278,2036,10463,10314,5973,11065,10811,3496,9415,2559,10226,9003,8061,1598,8128,2012,2340,3955]

    var HPRewards = [8,8,-2,8,-2,8,8,8,8,8,8,-2,-2,8,8,8,8,-2,8,8,8,-2,8,-2,8,8,8,-2,8,8,8,-2,-2,8,
    -2,-2,-2,-2,-2,8,8,8,8,-2,-2,-2,8,8,-2,8,8,-2,8,8,8,8,8,8,-2,8,8,-2,8,8,8,-2,8,8,-2,8,-2,8,8,-2,
    -2,8,-2,-2,8,-2,8,8,8,-2,-2,8,8,8,-2,8,8,-2,8,8,8,-2,-2,8,-2,8,8,8,8,-2,-2,8,8,8,8,8,8,8,-2,8,8,
    8,-2,-2,-2,8,8,8,8,8,8,-2,8,8,-2,8,-2,8,-2,-2,-2,-2,8,8,8,8,8,8,8,-2,8,8,8,8,8,8,-2,8,8,-2,-2,8,
    8,-2,8,8,-2,8,8,-2,8,-2,8,-2,8,-2,8,-2,-2,8,8,8,-2,-2,-2,-2,8,8,8,-2,-2,-2,-2,8,8,8,8,-2,-2,8,8,
    8,8,8,8,8,8,8,-2,8,-2,8,-2,8,8,-2,-2,8,8,8,-2,8,8,-2,-2,8,8,-2,8,-2,8,-2,8,8,8,-2,-2,8,8,-2,8,8,
    -2,-2,8,8,-2,8,8,-2,8,8,-2,8,8,8,8,-2,8,8,8,-2,8,8,8,8,8,8,8,-2,-2,8,-2,8,-2,8,8,-2,8,-2,-2,8,-2,
    -2,-2,8,-2,8,8,-2,8,-2,8,-2,8,8,-2,-2,8,8,8,8,8,-2,8,8,-2,8,8,-2,8,-2,-2,-2,8,-2,-2,8,8,8,-2,8,-2,
    8,8,8,8,8,-2,-2,8,8,-2,8,8,8,-2,8,8,8,8,8,8,8,8,8,-2,-2,-2,-2,8,8,8,8,8,8,8,8,8,-2,-2,8,-2,-2,-2,8,
    -2,8,8,8,-2,8,-2,8,-2,-2,-2,-2,8,8,8,-2,8,8,8,-2,8,8,8,-2,8,8,8,8,-2,8,8,8,-2,8,8,8,-2,8,8,-2,-2,8,
    -2,8,8,-2,8,8,8,8,-2,-2,8,8,8,-2,8,-2,8,-2,8,8,8,8,8,8,8,8,-2,-2,8,8,-2,-2,8,8,8,8,-2,-2,8,8,8,8,-2,
    -2,-2,8,8,8,8,8,8,8,-2,8,8,-2,8,-2,8,8,-2,8,8,-2,8,-2,8,8,8,8,8,8,8,8,8,-2,-2,8,-2,-2,-2,-2,-2,8,8,
    8,8,8,-2,-2,-2,8,-2,-2,8,8,-2,8,8,8,8,8,8,8,8,8,-2,8,-2,8,8,-2,8,8,-2,8,8,-2,8,-2,-2,-2,8,8,8,8,8,8,
    -2,-2,-2,8,-2,8,8,-2,8,8,8,-2,-2,8,-2,8,8,-2,8,8,8,8,-2,8,8,-2,-2,8,-2,-2,-2,8,8,8,8,8,8,-2,8,8,8,-2,
    8,8,8,8,-2,8,8,8,8,8,-2,-2,8,8,8,8,8,-2,8,-2,8,8,8,-2,8,-2,-2,-2]

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
    var currentReward;
    var currentCondition;
    var current_rewarded_time;
    var current_trial_start_time;
    //  time marker
    var block_start_time = new Date() 
    // trial counter 
    var trialCount = 0
    // scheduled delays and rewards, starting from LP 
    currentCondition = "LP"
    scheduledDelays = LPDelays
    scheduledRewards = LPRewards
    var earningsCount = trial.initialEarnings

    // initialize the output 
    var scheduledDelay = []
    var scheduledReward = []
    var condition = []
    var trialIdx = []
    var RT = []
    var trialEarnings = []
    var totalEarnings = []
    var timeWaited = []
    var trialStartTime = []
    var sellTime = []
    var rewardedTime = []

    // update  task time
    var leftTimeHandler = setInterval(function(){
      updateTimeLeft()
    }, 500);

    // create the handler that updates the trial timer
    var trialTimerHandler; 

    // display stimuli: wtw-token, wtw-cent-text, wtw-sold-text, wtw-total, wtw-bar, ....
    // properties of these stimuli can be updated later
    display_element.innerHTML = 
    `<div class="container" id="jspsych-wtw-content">
        <div id="jspsych-wtw-token"></div>
        <div id = 'jspsych-wtw-cent-text'></div>
        <div id = jspsych-wtw-sold-text></div>
        <div id = jspsych-wtw-ready-text></div>
        <div id = 'jspsych-wtw-left-time' class='text-block'>Time left: ${trial.block_time/1000/60}:00</div>
        <div id = 'jspsych-wtw-total' class='text-block'>Total earned: ${earningsCount/100} &#36</div>
        <div id="jspsych-wtw-trial-timer"></div>
        <div id="jspsych-wtw-trial-timer-head"></div>
    </div>`
    // call the recursive function, unit_trial
    unit_trial() 

    // set up the timer to terminate the task 
    jsPsych.pluginAPI.setTimeout(function(){
      terminate_block()
    }, trial.block_time)

  };

  return plugin;
})();

