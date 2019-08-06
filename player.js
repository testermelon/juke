
//State variables for the music player
//These needs to be prepared and reflected on the html (view) at init time
let playlist_home = "../firedrives/Gentiana/Music/"
let playlist = []
let shuffle_list = []
let current_shuffle = 0

let current_track = 0
let is_playing = false
let shuffle = false
let repeat = 0
//repeat: 0 = None, 1 = Repeat All, 2 = Repeat One

let playerdom
let seekbardom
let volumedom


//User Actions
//Script for user actions, these are mainly button pushes, etc.

function actionPlay(){
	if (!is_playing) {
		playerdom.play()
	}
	else {
		playerdom.pause()
	}
}

function actionStop(){
	playerdom.pause()
	playerdom.currentTime = 0
}

function actionNext(){

	//determine the next track based on shuffle and repeat state
	
	if(repeat == 2){
		//do nothing in repeat one
		return
	}
	else
	if (repeat == 1){
		//on repeat cycle through the playlist
		if (!shuffle){
			//when not in shuffle cycle through plain playlist
			if (current_track < playlist.length - 1 )
				current_track += 1
			else
				current_track = 0
		}
		else{
			//when on shuffle cycle through the shuffle list and reshuffle when end reached
			if (current_shuffle < shuffle_list.length - 1){
				current_shuffle += 1
			}
			else{
				updateShuffleList()
				current_shuffle = 1
			}
			//reflect selected new track as current track
			current_track = shuffle_list[current_shuffle]
		}
	}
	else
	if (repeat == 0){
		//when not in repeat do not cycle, stop playback when end reached
		if (!shuffle){
			if (current_track < playlist.length - 1 )
				current_track += 1
			else
				return
				//do not change track
				//do not play the next track
		}
		else{
			if (current_shuffle < shuffle_list.length - 1){
				current_shuffle += 1
			}
			else{
				updateShuffleList()
				current_shuffle = 1
			}
			//reflect selected new track as current track
			current_track = shuffle_list[current_shuffle]
		}
	}

	updateCurrentTrack()
	if (is_playing) playerdom.play()
}

function actionPrev(){
	if (repeat == 2)
		return
	else
	if (repeat == 1){
		if (!shuffle){
			if (current_track > 0 )
				current_track -= 1
			else
				current_track = playlist.length - 1
		}
		else{
			if (current_shuffle > 0){
				current_shuffle -= 1
			}
			else{
				updateShuffleList()
				current_shuffle = shuffle_list.length - 1
			}
			current_track = shuffle_list[current_shuffle]
		}
	}
	else
	if (repeat == 0){
		if (!shuffle){
			if (current_track > 0 )
				current_track -= 1
			else
				return
		}
		else{
			if (current_shuffle > 0){
				current_shuffle -= 1
			}
			else{
				updateShuffleList()
				current_shuffle = shuffle_list.length - 1
			}
			current_track = shuffle_list[current_shuffle]
		}
	}

	updateCurrentTrack()
	if (is_playing) playerdom.play()
}

function actionShuffle() {
	if (shuffle) {
		shuffle = false
		document.getElementById("shuffle-button").className = "small_button"
	}
	else{
		shuffle = true
		document.getElementById("shuffle-button").className = "highlight_small_button"
		updateShuffleList()
	}
}

function actionRepeat() {
	if (repeat == 0) {
		repeat = 1
		document.getElementById("repeat-button").className = "highlight_small_button"
	}
	else
	if (repeat == 1){
		repeat = 2
		document.getElementById("repeat-button").className = "highlight_small_button"
		document.getElementById("repeat-button").innerHTML = "R1"
	}
	else{
		repeat = 0
		document.getElementById("repeat-button").className = "small_button"
		document.getElementById("repeat-button").innerHTML = "R"
	}

}

function volumeChange() {
	playerdom.volume = volumedom.value
}

//event handlings
//These are mostly event handlers, some of them are natural browser events, some of them are artifical events that needs to be triggered manually 

//Called on DOM loaded event
function initPlayer() {
	playerdom = document.getElementById("player")
	seekbardom = document.getElementById("seekbar")
	volumedom = document.getElementById("volume-slider")
	//to be obtained using AJAX
//	playlist = 
//	[
//		"Artists/Aimer/Brave Shine/01 Brave Shine.m4a",
//		"Soundtracks/Angel Beats/[iSiscon] Girls Dead Monster - Keep The Beats! (MP3)/03 Shine Days.mp3",
//		"grandescape.mp3",
//		"Various Artists/Disney Greatest Love Songs (2008)/CD 2/08 - Lea Salonga - Reflection.mp3"
//	]
	obtainPlaylist("playlist1.pl")
}

function obtainPlaylist(name) {
	let xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			playlist = this.responseText.split(",");
			document.getElementById("tracklist").innerHTML = generatePlaylist()
			updateCurrentTrack()
			updateShuffleList()
		}
	}
	xhttp.open("GET",name,true)
	xhttp.send()
}


function generatePlaylist(){
	let playlist_html = '<table style="width:100%">'
	let name = ""
	for (let i=0;i<playlist.length;i++){
		name = playlist[i].split("/").slice(-1)[0]
		playlist_html += '<tr id="track_' + i + '">'
		playlist_html += '<td>'
		playlist_html += '<span id="track_' + i + '_name" style="float:left; vertical-align: middle">'
		playlist_html += name
		playlist_html += '</span> <span style="float:right"> <button class="small_button">&gt</button> <button class="small_button">x</button> </span> </tr>'
	}
	playlist_html += '</table>'
	return playlist_html
}
	

function playbackPlayed() {
	is_playing = true
	document.getElementById("play-button").innerHTML = "||"
	document.getElementById("volume-slider").value = document.getElementById("player").volume
	setTimeout(updateElapsed,50)
}

function playbackPaused() {
	is_playing = false
	document.getElementById("play-button").innerHTML = "&gt"
	setTimeout(updateElapsed,50)
}

function playbackEnded() {
	if (repeat == 2) playerdom.play()
	else
	if (repeat == 1){
		if(!shuffle){
			if ( current_track < playlist.length -1)
				current_track += 1
			else
				current_track = 0
		}
		else{
			if ( current_shuffle < shuffle_list.length -1)
				current_shuffle += 1
			else{
				updateShuffleList()
				current_shuffle = 1
			}
			current_track = shuffle_list[current_shuffle]
		}
		updateCurrentTrack()
		playerdom.play()
	}
	else
	if (repeat == 0) {
		if(!shuffle){
			if ( current_track < playlist.length -1)
				current_track += 1
			else{
				is_playing = false
				return
			}
		}
		else{
			if ( current_shuffle < shuffle_list.length -1)
				current_shuffle += 1
			else{
				is_playing = false
				return
			}
			current_track = shuffle_list[current_shuffle]
		}
		updateCurrentTrack()
		playerdom.play()
	}
	document.getElementById("play-button").innerHTML = "&gt"
}

function updateElapsed() {
	document.getElementById("elapsed-time-text").innerHTML = formatTime(playerdom.currentTime)
	seekbardom.value = playerdom.currentTime
	document.getElementById("duration-text").innerHTML = formatTime(playerdom.duration)
	seekbardom.max = playerdom.duration
	if (is_playing)
		setTimeout(updateElapsed,50)
}

function updateCurrentTrack(){
	playerdom.src = playlist_home + playlist[current_track]
	setTimeout(updateElapsed,50)
	let id
	for (let i=0;i<playlist.length;i++){
		id = "track_" + i
		if (i==current_track){
			document.getElementById(id).className = "item_playing"
		}
		else 
			document.getElementById(id).className = ""
	}
	document.getElementById("track-name-text").innerHTML = playlist[current_track].split("/").slice(-1)[0]
}

function playerSeek() {
	playerdom.currentTime = document.getElementById("seekbar").value
}

function updateShuffleList() {
	let marking = []
	shuffle_list[0] = current_track
	marking[current_track] = "*"
	for (let i=1;i<playlist.length;i++){

		do shuffle_list[i] = Math.floor(Math.random() * playlist.length)
		while(marking[shuffle_list[i]] == "*")

		marking[shuffle_list[i]] = "*"
	}
	current_shuffle = 0
}

//utilities functions 

function formatTime(time_in_seconds){
	time_in_seconds = time_in_seconds - (time_in_seconds % 1)
	let seconds = time_in_seconds % 60
	let minutes = (time_in_seconds - seconds) / 60
	if (seconds < 10) seconds = "0" + seconds
	if (minutes < 10) minutes = "0" + minutes
	return minutes + ":" + seconds
}


//execution scripts 

window.addEventListener("DOMContentLoaded", initPlayer)
