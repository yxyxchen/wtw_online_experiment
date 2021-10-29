// task constants
var block_time = 10 * 1000 * 60
var task_time = 10 * 1000 * 60 * 2
var initial_value = 0
var matruation_value = 2

// 
mid_quit_warning_text = "<p style= 'color: white; font-size: 30px; line-height: 2' id='instruction'>Please avoid closing the tab midway through the task. You may lose your data in that case.</p>" +
"<p style= 'color: white; font-size: 30px; line-height: 2' id='instruction'>You will be given explicit instructions to close the tab after you complete this task.</p>" + 
'<p style="color: white; font-size: 30px; line-height: 2" id="instruction">Make sure you have ' + task_time / 1000 / 60 + ' minutes of undistracted time before you start the task.</p>'+
"<p style= 'color: white; font-size: 30px; line-height: 2' id='instruction'>If you are ready, click 'Next' to start the task.</p>"

// active-waiting instructions 
instructions_0_text = '<p style="color: white; font-size: 30px; line-height: 2" id="instruction">Welcome!</p>'+
'<p style="color: white; font-size: 30px; line-height: 2" id="instruction">Please click "Next" to read the instructions.</p>'

active_instructions_1a_text = '<p style="color: white; font-size: 30px; line-height: 2" id="instruction">You will see a token on the screen. Tokens can be sold for ' + matruation_value + " cents </p>" +
        '<p style="color: white; font-size: 30px; line-height: 2">Each token is worth ' + initial_value + " cents at first.</p>" +
        '<p style="color: white; font-size: 30px; line-height: 2" id="instruction">You can increase its value by repeatedly pressing the spacebar.</p>' +
        '<p style="color: white; font-size: 30px; line-height: 2">After some time, the token will "mature" and be worth more.</p>' 

active_instructions_1b_text  = '<p style="color: white; font-size: 30px; line-height: 2">Now try a practice round.</p>' +
'<p style="color: white; font-size: 30px; line-height: 2">Keep pressing until the token matures. Then stop pressing to sell it.</p>' +
        '<p style="color: white; font-size: 30px; line-height: 2">Click "Next" to start.</p>'


active_instructions_2_text = '<p style="color: white; font-size: 30px; line-height: 2"> Good. Let' + "&#39 s do it again.</p>" +
'<p style="color: white; font-size: 30px; line-height: 2">Keep pressing the spacebar until the token matures, then sell it.</p>'
'<p style="color: white; font-size: 30px; line-height: 2">Click "Next" to start.</p>'

instructions_3_text = '<p style="color: white; font-size: 30px; line-height: 2">You will have a limited amount of time to play.</p>' +
'<p style="color: white; font-size: 30px; line-height: 2">If a token is taking too long, you might want to sell it before it matures in order to move on to a new one.</p>' +
'<p style="color: white; font-size: 30px; line-height: 2">Next, practice selling the token before it matures.</p>' +
'<p style="color: white; font-size: 30px; line-height: 2">Click "Next" to start.</p>'

instructions_4_text = '<p style="color: white; font-size: 30px; line-height: 2"> Good. Let' + "&#39 s do it again.</p>" +
'<p style="color: white; font-size: 30px; line-height: 2">Practice selling the token before it matures.</p>'

instructions_5_text = '<p style="color: white; font-size: 30px; line-height: 2">The task has two blocks. Each block lasts ' + block_time / 1000 / 60 + ' minutes.</p>' +
'<p style="color: white; font-size: 30px; line-height: 2">You should sell tokens quickly when they mature, since their value will not change again.</p>'+
'<p style="color: white; font-size: 30px; line-height: 2"> During the game, you can see the bonus you have earned so far at the bottom of the screen.</p>'

instructions_6_text = '<p style="color: white; font-size: 30px; line-height: 2">You just completed the first block. Please take a break.</p>' +
'<p style="color: white; font-size: 30px; line-height: 2">Whenever you are ready, please click "Next" to start the second block</p>'

active_warnings_please_wait_longer_text = '<p style="color: white; font-size: 30px; line-height: 2">Please follow the instructions.</p>' +
        '<p style="color: white; font-size: 30px; line-height: 2">keep pressing the spacebar until the token matures. Then stop pressing to sell it.</p>' +
        '<button id = "button">Try Again</button>'

active_warnings_please_sell_ealier_text = '<p style="color: white; font-size: 30px; line-height: 2">Please follow the instructions.</p>' +
        '<p style="color: white; font-size: 30px; line-height: 2">Sell the token before it matures</p>' +
        '<button id = "button">Try Again</button>'

//
rising_falling_instructions_1a_text = '<p style="color: white; font-size: 30px; line-height: 2" id="instruction">You will see a token on the screen. Tokens can be sold for money.</p>' +
        '<p style="color: white; font-size: 30px; line-height: 2">Each token is worth ' + initial_value + " cents at first.</p>" +
        '<p style="color: white; font-size: 30px; line-height: 2">After some time, the token will "mature" to either a positive or negative value. </p>' 


rising_falling_instructions_1b_text  = '<p style="color: white; font-size: 30px; line-height: 2">Now try a practice round.</p>' +
'<p style="color: white; font-size: 30px; line-height: 2">Wait until the token matures, then press the spacebar to sell it.</p>' +
        '<p style="color: white; font-size: 30px; line-height: 2">Click "Next" to start.</p>'

rising_falling_instructions_2_text = '<p style="color: white; font-size: 30px; line-height: 2"> Good. Let' + "&#39 s do it again.</p>" +
'<p style="color: white; font-size: 30px; line-height: 2">Wait until the token matures, then sell it.</p>'
'<p style="color: white; font-size: 30px; line-height: 2">Click "Next" to start.</p>'

rising_falling_instructions_5_text = '<p style="color: white; font-size: 30px; line-height: 2"> You will have ' + task_time / 1000 / 60 + ' minutes to play. Your goal is to earn the most money you can in the available time.</p>'  + 
'<p style="color: white; font-size: 30px; line-height: 2">You should sell tokens quickly when they mature, since their value will not change again.</p>' +  
'<p style="color: white; font-size: 30px; line-height: 2">Even if a token matures to a negative value, it\'s best to sell it quickly in order to move on to a new one.</p>' +
'<p style="color: white; font-size: 30px; line-height: 2"> During the game, you can see left time and earned bonus at the bottom of the screen.</p>' 
      
// passive-waiting instructions 
passive_instructions_1a_text = '<p style="color: white; font-size: 30px; line-height: 2" id="instruction">You will see a token on the screen. Tokens can be sold for ' + matruation_value + " cents </p>" +
        '<p style="color: white; font-size: 30px; line-height: 2">Each token is worth ' + initial_value + " cents at first.</p>" +
        '<p style="color: white; font-size: 30px; line-height: 2">After some time, the token will "mature" and be worth more.</p>' 

passive_instructions_1b_text  = '<p style="color: white; font-size: 30px; line-height: 2">Now try a practice round.</p>' +
'<p style="color: white; font-size: 30px; line-height: 2">Wait until the token matures, then press the spacebar to sell it.</p>' +
        '<p style="color: white; font-size: 30px; line-height: 2">Click "Next" to start.</p>'

passive_instructions_2_text = '<p style="color: white; font-size: 30px; line-height: 2"> Good. Let' + "&#39 s do it again.</p>" +
'<p style="color: white; font-size: 30px; line-height: 2">Wait until the token matures, then sell it.</p>'
'<p style="color: white; font-size: 30px; line-height: 2">Click "Next" to start.</p>'

passive_warnings_please_wait_longer_text = '<p style="color: white; font-size: 30px; line-height: 2">Please follow the instructions.</p>' +
        '<p style="color: white; font-size: 30px; line-height: 2">Wait until the token matures and then sell it.</p>' +
        '<button id = "button">Try Again</button>'

passive_warnings_please_sell_ealier_text = '<p style="color: white; font-size: 30px; line-height: 2">Please follow the instructions.</p>' +
        '<p style="color: white; font-size: 30px; line-height: 2">Sell the token before it matures</p>' +
        '<button id = "button">Try Again</button>'