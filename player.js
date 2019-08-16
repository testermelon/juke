//************************************
//State variables for the music player
//************************************
//These needs to be prepared and reflected on the html (view) at init time

//Home directory of music files
let playlist_home = "../firedrives/Gentiana/Music";
let playlist_list = []

//This music player maintains two playlists:
//	1.the one actually being played
//	2.the one being shown in playlist pane
//Reason:to accomodate changing playlist while playing a song
let playlist = [];
let playlist_no ;
let playlist_showing = [];
let playlist_showing_no = 0;

//array index of currently playing song
//this points to playlist (actually playing)
let current_track = 0;

//This player also maintains a shuffle list implemented as randomized index
//This is used as conversion table to obtain which track to play in shuffle mode
//Shuffle list should be updated as required
let shuffle_list = [];
let current_shuffle = 0;


//TODO these 3 variables shall be stored in cookies
// showing playlist_name
// current_track
// playback_volume

//playback Shuffle and Repeat states.
let is_playing = false;
let shuffle = false;
let repeat = 0;
//repeat: 0 = None, 1 = Repeat All, 2 = Repeat One

//DOM elements of the page
let playerdom;
let seekbardom;
let volumedom;
let plselectdom;

//Current playback volume, updated using slider change events, read by audio element
let playback_volume;

//state variables of the browser
let current_dir = "";

//********************
//User Actions
//*********************
//Script for user actions, these are mainly button pushes, etc.

//invoke when play button clicked
function actionPlay(){

	if (!is_playing) {
		if(playlist_no == playlist_showing_no){
			playerdom.play();
		}
		else{
			playlist = playlist_showing;
			playlist_no = playlist_showing_no;
			current_track = 0;
			updateShuffleList();
			updateCurrentTrack();
			playerdom.play();
		}
	}
	else {
		playerdom.pause();
	}
}

function actionStop(){

	playerdom.pause();
	playerdom.currentTime = 0;
}

function actionNext(){

	//determine the next track based on combination of shuffle and repeat state
	
	if(repeat == 2){
		//do nothing in repeat one
		return;
	}
	else
	if (repeat == 1){

		//playlist not changed
		if (playlist_no == playlist_showing_no){  

			//update playlist to accomodate any added or removed track
			playlist = playlist_showing;

			if (!shuffle){
				// no shuffle set -> go to next track, 
				// 		     go to first track if last

				if (current_track < playlist.length - 1 )
					current_track += 1;
				else
					current_track = 0;
			}
			else{
				//shuffle is set -> cycle through the shuffled list
				//		    reshuffle when end reached

				if (current_shuffle < shuffle_list.length - 1){
					current_shuffle += 1;
				}
				else{
					updateShuffleList();
					current_shuffle = 1;
				}

				//reflect selected new track from shuffle list as current track
				current_track = shuffle_list[current_shuffle];
			}
		}
		else{	//playlist has changed
			
			playlist = playlist_showing;
			playlist_no = playlist_showing_no;
			current_track = 0;

			if (shuffle){
				updateShuffleList();
				current_shuffle = 1;
				current_track = shuffle_list[current_shuffle];
			}
		}
	}
	else
	if (repeat == 0){

		//playlist has not changed
		if (playlist_no == playlist_showing_no){

			//update playlist to accomodate any added or removed track
			playlist = playlist_showing;

			//when not in repeat do not cycle, stop playback when end reached
			if (!shuffle){
				if (current_track < playlist.length - 1 )
					current_track += 1;
				else
					return;
					//do not change track when last track reached
					//do not play the next track
					//This is the behavior when repeat is not set
			}
			else{
				if (current_shuffle < shuffle_list.length - 1){
					current_shuffle += 1;
				}
				else{
					updateShuffleList();
					current_shuffle = 1;
				}
				//reflect selected new track as current track
				current_track = shuffle_list[current_shuffle];
			}
		}
		else{	//playlist has changed
			if (!shuffle){
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
			}
			else{
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
				updateShuffleList();
				current_shuffle = 1;
				current_track = shuffle_list[current_shuffle];
			}
		}
	}

	updateCurrentTrack();
	if (is_playing) playerdom.play();
}

function actionPrev(){
	if (repeat == 2)
		return;
	else
	if (repeat == 1){
		//playlist has not changed
		if (playlist_no == playlist_showing_no){
			//update playlist to accomodate any added or removed track
			playlist = playlist_showing;

			if (!shuffle){
				if (current_track > 0 )
					current_track -= 1;
				else
					current_track = playlist.length - 1;
			}
			else{
				if (current_shuffle > 0){
					current_shuffle -= 1;
				}
				else{
					updateShuffleList();
					current_shuffle = shuffle_list.length - 1;
				}
				current_track = shuffle_list[current_shuffle];
			}
		}
		else{	//playlist has changed
			if (!shuffle){
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
			}
			else{
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
				updateShuffleList();
				current_shuffle = 1;
				current_track = shuffle_list[current_shuffle];
			}
		}
	}
	else
	if (repeat == 0){
		//playlist has not changed
		if (playlist_no == playlist_showing_no){
			//update playlist to accomodate any added or removed track
			playlist = playlist_showing;

			if (!shuffle){
				if (current_track > 0 )
					current_track -= 1;
				else
					return;
			}
			else{
				if (current_shuffle > 0){
					current_shuffle -= 1;
				}
				else{
					updateShuffleList();
					current_shuffle = shuffle_list.length - 1;
				}
				current_track = shuffle_list[current_shuffle];
			}
		}
		else{	//playlist has changed
			if (!shuffle){
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
			}
			else{
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
				updateShuffleList();
				current_shuffle = 1;
				current_track = shuffle_list[current_shuffle];
			}
		}
	}

	updateCurrentTrack();
	if (is_playing) playerdom.play();
}

function actionShuffle() {
	//update playlist to accomodate any added or removed track
	playlist = playlist_showing;

	if (shuffle) {
		shuffle = false;
		document.getElementById("shuffle-button").className = "small_button";
	}
	else{
		shuffle = true;
		document.getElementById("shuffle-button").className = "highlight_small_button";
		updateShuffleList();
	}
}

function actionRepeat() {
	//update playlist to accomodate any added or removed track
	playlist = playlist_showing;

	if (repeat == 0) {
		repeat = 1;
		document.getElementById("repeat-button").className = "highlight_small_button";
	}
	else
	if (repeat == 1){
		repeat = 2;
		document.getElementById("repeat-button").className = "highlight_small_button";
		document.getElementById("repeat-button").innerHTML = "R1";
	}
	else{
		repeat = 0;
		document.getElementById("repeat-button").className = "small_button";
		document.getElementById("repeat-button").innerHTML = "R";
	}

}

function actionBrowserUp(){
	let slice_dir = current_dir.split("%2F");
	slice_dir.pop();
	slice_dir.pop();
	let updir = slice_dir.join("%2F");
	obtainDirList(updir); 
	//TODO restrict going up from home
}

function volumeChange() {
	playerdom.volume = volumedom.value;
}


function actionPlaylistNew(){
	let name = prompt("Nama playlist barunya apa?", "New Playlist");
	if(name==null) return;
	newPlaylist(name);
}

function actionRenamePlaylist() {
	let name = prompt("Nama barunya apa?", "New Playlist");
	if(name==null) return;
	renamePlaylist(playlist_showing_no,name);
}


function actionPlaylistDelete(){
	let okay = confirm("Hapus playlist " + playlist_list[playlist_showing_no] + "?" );
	if(okay==null) return;
	delPlaylist(playlist_showing_no);
}

function actionTrackDelete(plno,trno){
	delTrack(plno,trno);
}


//event handlings
//These are mostly event handlers, some of them are natural browser events, some of them are artifical events that needs to be triggered manually 

//Called on DOM loaded event
function initPlayer() {
	playerdom = document.getElementById("player");
	seekbardom = document.getElementById("seekbar");
	volumedom = document.getElementById("volume-slider");
	plselectdom = document.getElementById("playlist-select");
	playerdom.volume = volumedom.value;
	obtainDirList(encodeURIComponent(playlist_home));
	obtainPlaylistList();
	obtainPlaylist(0);
}


function playbackPlayed() {
	is_playing = true;
	document.getElementById("play-button").innerHTML = "||";
	setTimeout(updateElapsed,50);
}

function playbackPaused() {
	is_playing = false;
	document.getElementById("play-button").innerHTML = "&gt";
	setTimeout(updateElapsed,50);
}

function playbackEnded() {
	if (repeat == 2) playerdom.play();
	else
	if (repeat == 1){
		//playlist has not changed
		if (playlist_no == playlist_showing_no){
			//update playlist to accomodate any added or removed track
			playlist = playlist_showing;

			if(!shuffle){
				if ( current_track < playlist.length -1)
					current_track += 1;
				else
					current_track = 0;
			}
			else{
				if ( current_shuffle < shuffle_list.length -1)
					current_shuffle += 1;
				else{
					updateShuffleList();
					current_shuffle = 1;
				}
				current_track = shuffle_list[current_shuffle];
			}
			updateCurrentTrack();
			playerdom.play();
		}
		else{	//playlist has changed
			if (!shuffle){
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
			}
			else{
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
				updateShuffleList();
				current_shuffle = 1;
				current_track = shuffle_list[current_shuffle];
			}
		}
	}
	else
	if (repeat == 0) {
		//playlist has not changed
		if (playlist_no == playlist_showing_no){
			//update playlist to accomodate any added or removed track
			playlist = playlist_showing;

			if(!shuffle){
				if ( current_track < playlist.length -1)
					current_track += 1;
				else{
					is_playing = false;
					return;
				}
			}
			else{
				if ( current_shuffle < shuffle_list.length -1)
					current_shuffle += 1;
				else{
					is_playing = false;
					return;
				}
				current_track = shuffle_list[current_shuffle];
			}
			updateCurrentTrack();
			playerdom.play();
		}
		else{	//playlist has changed
			if (!shuffle){
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
			}
			else{
				playlist = playlist_showing;
				playlist_no = playlist_showing_no;
				current_track = 0;
				updateShuffleList();
				current_shuffle = 1;
				current_track = shuffle_list[current_shuffle];
			}
			updateCurrentTrack();
			playerdom.play();
		}
	}
	document.getElementById("play-button").innerHTML = "&gt";
}

function updateElapsed() {
	document.getElementById("elapsed-time-text").innerHTML = formatTime(playerdom.currentTime);
	seekbardom.value = playerdom.currentTime;
	document.getElementById("duration-text").innerHTML = formatTime(playerdom.duration);
	seekbardom.max = playerdom.duration;
	if (is_playing)
		setTimeout(updateElapsed,50);
	document.getElementById("track-name-text").innerHTML = playlist[current_track].split("/").slice(-1)[0];
	let id;
	if(playlist_no == playlist_showing_no)
	for (let i=0;i<playlist.length;i++){
		id = "track_" + i;
		if (i==current_track){
			document.getElementById(id).className = "item_playing";
		}
		else 
			document.getElementById(id).className = "";
	}
}

function updateCurrentTrack(){
	playerdom.src = playlist[current_track];
	setTimeout(updateElapsed,50);
}

function playerSeek() {
	playerdom.currentTime = document.getElementById("seekbar").value;
}

function updateShuffleList() {
	let marking = [];
	shuffle_list[0] = current_track;
	marking[current_track] = "*";
	for (let i=1;i<playlist.length;i++){

		do shuffle_list[i] = Math.floor(Math.random() * playlist.length);
		while(marking[shuffle_list[i]] == "*");

		marking[shuffle_list[i]] = "*";
	}
	current_shuffle = 0;
}

//utilities functions 

function formatTime(time_in_seconds){
	time_in_seconds = time_in_seconds - (time_in_seconds % 1);
	let seconds = time_in_seconds % 60;
	let minutes = (time_in_seconds - seconds) / 60;
	if (seconds < 10) seconds = "0" + seconds;
	if (minutes < 10) minutes = "0" + minutes;
	return minutes + ":" + seconds;
}


//**********************
// AJAX codes
//**********************

//obtain list of playlists 
function obtainPlaylistList() {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			playlist_list = JSON.parse(this.responseText);
			let actions = "";
			for(let i=0; i<playlist_list.length;i++){
				actions += "<option value=\""+ i + "\">" + playlist_list[i] + "</option>";
			}
			plselectdom.innerHTML = actions;

		}
	}
	xhttp.open("GET","playlist.php?op=ls",true);
	xhttp.send();
}
//obtain playlist from server and show it to playlist pane
//
function obtainPlaylist(pl_number) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			playlist_showing = JSON.parse(this.responseText);
			document.getElementById("tracklist").innerHTML = showPlaylist(playlist_showing);
			playlist_showing_no = pl_number;
		}
	}
	xhttp.open("GET","playlist.php?op=get&pl="+pl_number,true);
	xhttp.send();
}

//obtain playlist from server and show it to playlist pane
// dirname should be URL safe
//
function obtainDirList(dirname) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("filelist").innerHTML = this.responseText;
			current_dir = dirname + "%2F";
		}
	}
	xhttp.open("GET","getDirList.php?dir="+dirname,true);
	xhttp.send();
}


function addFile(path) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			obtainPlaylist(playlist_showing_no);
			if(playlist_no == playlist_showing_no){
				playlist = playlist_showing;
				if(shuffle) updateShuffleList();
			}
		}
	}
	
	xhttp.open("GET","playlist.php?op=add&pl="+ plselectdom.value +"&path="+path,true);
	xhttp.send();
}


//show a playlist to the playlist pane
function showPlaylist(playlist_to_show){
	let playlist_html = '<table style="width:100%">';
	let name = "";
	for (let i=0;i<playlist_to_show.length;i++){
		name = playlist_to_show[i].split("/").slice(-1)[0];
		playlist_html += '<tr id="track_' + i + '">';
		playlist_html += '<td class="list_item">';
		playlist_html += '<span id="track_' + i + '_name" style="float:left; vertical-align: middle">';
	
		playlist_html += name;
		playlist_html += '</span>';
		playlist_html += '<span style="float:right">';
		playlist_html += '<button onclick=actionTrackDelete(' + playlist_showing_no + ',' + i + ') class="track_button">x</button>';
		playlist_html += '</span> </td?> </tr>';
	}
	playlist_html += '</table>';
	return playlist_html;
}
	

function newPlaylist(playlist_name) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			obtainPlaylistList();

		}
	}
	
	xhttp.open("GET","playlist.php?op=new&n="+ playlist_name,true);
	xhttp.send();
}


function delPlaylist(plno) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			obtainPlaylistList();
		}
	}
	
	xhttp.open("GET","playlist.php?op=del&pl="+ plno,true);
	xhttp.send();
}

function delTrack(plno,trno) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			obtainPlaylist(playlist_showing_no);

		}
	}
	
	xhttp.open("GET","playlist.php?op=dt&pl="+ plno + "&tr=" + trno,true);
	xhttp.send();
}

function clearPlaylist(plno) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			obtainPlaylist(playlist_showing_no);
		}
	}
	
	xhttp.open("GET","playlist.php?op=clr&pl="+ plno ,true);
	xhttp.send();
}

function renamePlaylist(plno,name) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			obtainPlaylistList();

		}
	}
	
	xhttp.open("GET","playlist.php?op=ren&pl="+ plno + "&n=" + name,true);
	xhttp.send();
}
//execution scripts 

window.addEventListener("DOMContentLoaded", initPlayer);
