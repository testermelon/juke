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

//for bug in new playlist func. State for waiting reply from playlist_list
let waiting_playlist_list = false;

let wait_delete_playlist = false;
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
		document.getElementById("shuffle-button-on").className = "small_button";
		document.getElementById("shuffle-button-on").id = "shuffle-button";
	}
	else{
		shuffle = true;
		document.getElementById("shuffle-button").className = "highlight_small_button";
		document.getElementById("shuffle-button").id = "shuffle-button-on";
		updateShuffleList();
	}
}

function actionRepeat() {
	//update playlist to accomodate any added or removed track
	playlist = playlist_showing;

	if (repeat == 0) {
		repeat = 1;
		document.getElementById("repeat-button").className = "highlight_small_button";
		document.getElementById("repeat-button").id = "repeat-button-on";

	}
	else
	if (repeat == 1){
		repeat = 2;
		document.getElementById("repeat-button-on").className = "highlight_small_button";
		document.getElementById("repeat-button-on").innerHTML = "1";
	}
	else{
		repeat = 0;
		document.getElementById("repeat-button-on").className = "small_button";
		document.getElementById("repeat-button-on").innerHTML = "";
		document.getElementById("repeat-button-on").id = "repeat-button";
	}

}

function actionBrowserUp(){
	let slice_dir = current_dir.split("%2F");
	//pop away the current dir so it became upper dir
	slice_dir.pop();
	slice_dir.pop();
	//Prevent access to gentiana
	if(slice_dir[slice_dir.length-1] == "Gentiana") return;
	let updir = slice_dir.join("%2F");
	obtainDirList(updir); 
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
	let name = prompt("Nama barunya apa?", playlist_list[playlist_showing_no]);
	if(name==null) return;
	renamePlaylist(playlist_showing_no,name);
}


function actionPlaylistDelete(){
	let okay = confirm("Hapus playlist " + playlist_list[playlist_showing_no] + "?" );
	if(okay) delPlaylist(playlist_showing_no);
}

function actionTrackDelete(plno,trno){
	delTrack(plno,trno);
	if(current_track >= trno) current_track -= 1;	//shift tracks after deletion
}

function actionTrackClick(trno){
	playlist = playlist_showing;
	playlist_no = playlist_showing_no;
	current_track = trno;
	updateCurrentTrack();
	updateShuffleList();
	playerdom.play();
}

//event handlings
//These are mostly event handlers, some of them are natural browser events, some of them are artifical events that needs to be triggered manually 

//Called on DOM loaded event
function initPlayer() {
	mediaListener(mediaEv);
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
	document.getElementById("play-button").id = "pause-button"
	setTimeout(updateElapsed,50);
}

function playbackPaused() {
	is_playing = false;
	document.getElementById("pause-button").id = "play-button";
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
	let displayed_name = document.getElementById("track-name-text").innerHTML = playlist[current_track].split("/").slice(-1)[0];

	//find and mark the track that matches the currently playing song
	let id;
	if(playlist_no == playlist_showing_no)
	for (let i=0;i<playlist.length;i++){
		id = "track_" + i;
		if (i==current_track && displayed_name == document.getElementById(id).innerHTML){
			document.getElementById(id).style.color = "yellow";
			document.getElementById(id).style.fontWeight = "bold";
		}
		else{ 
			document.getElementById(id).style.color = "white";
			document.getElementById(id).style.fontWeight = "normal";
		}
	}
	if (is_playing)
		setTimeout(updateElapsed,50);
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

			if(waiting_playlist_list){
				plselectdom.value = playlist_list.length -1 ;
				obtainPlaylist(playlist_list.length - 1);
				waiting_playlist_list = false;
			}

			if(wait_delete_playlist > -1 ){
				if(wait_delete_playlist > 0){
					plselectdom.value = wait_delete_playlist - 1;
					obtainPlaylist(wait_delete_playlist - 1);
				}
				else{
					plselectdom.value = 0;
					obtainPlaylist(0);
				}

				wait_delete_playlist = -1;
			}

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

//show a playlist to the playlist pane
function showPlaylist(playlist_to_show){
	let playlist_html = '<div style="width:100%">';
	let name = "";
	for (let i=0;i<playlist_to_show.length;i++){
		name = playlist_to_show[i].split("/").slice(-1)[0];
		playlist_html += '<div class="list_item">';
		playlist_html += '<div class="list-item-name" onclick=actionTrackClick('+i+') id="track_' + i +'" >';
		playlist_html += name;
		playlist_html += '</div>';
		playlist_html += '<button onclick=actionTrackDelete(' + playlist_showing_no + ',' + i + ') class="track_button">x</button>';
		playlist_html += '</div>';
	}
	playlist_html += '</div>';
	return playlist_html;
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


function newPlaylist(playlist_name) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			waiting_playlist_list = true;
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
			wait_delete_playlist = plno;
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

//obtain playlist from server and show it to playlist pane
// dirname should be URL safe
//
function obtainDirList(dirname) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let dir_data = JSON.parse(this.responseText);

			let playlist_html = '<div style="width:100%">';
			let name = "";
			for (let i=0;i<dir_data.dir.length;i++){
				name = decodeURIComponent(dir_data.dir[i].split("%2F").slice(-1)[0]);
				playlist_html += '<div class="list_item">';
				playlist_html += '<div class="list-item-name" style="color:lawngreen" onclick=obtainDirList(\"'+dir_data.dir[i]+'\") >';
				playlist_html += '&#x21b3; ' + name;
				playlist_html += '</div>';
				playlist_html += '</div>';
			}

			for (let i=0;i<dir_data.file.length;i++){
				name = decodeURIComponent(dir_data.file[i].split("%2F").slice(-1)[0]);
				playlist_html += '<div class="list_item">';
				playlist_html += '<div class="list-item-name" >';
				playlist_html += name;
				playlist_html += '</div>';
				playlist_html += '<button onclick=addFile(\"' + dir_data.file[i] + '\") class="track_button">+</button>';
				playlist_html += '</div>';
			}
			document.getElementById("filelist").innerHTML = playlist_html;
			current_dir = dirname + "%2F";
			document.getElementById("currentdir").innerHTML = "<option>" + decodeURIComponent(current_dir).replace('../firedrives/Gentiana/Music','') + "</option>";
		}
	}
	xhttp.open("GET","getDirList.php?dir="+dirname,true);
	xhttp.send();
}

/*
foreach ($file_list as $filename){
	$path = rawurlencode($filename);
	if(!is_dir($filename)) {
		echo 
		'<tr> ';
		echo
		'<td class="list_item"> 
			<span style="float:left;vertical-align:middle">';
		echo end(explode('/',$filename));
		echo 
			'</span>
			<span style="float:right">';
		echo	"<button onclick=addFile(\"";
		echo	"$path";
		echo	"\") ";
		echo 	'class="track_button">+</button> 
			</span>
			</td></tr>';
	}
	else{
		echo 	
			'<tr>
			<td class="list_item" ';
		echo	"onclick=obtainDirList(\"";
		echo	"$path";
		echo	"\")>";
		echo
			'<span style="color:lightgreen;font-weight:normal;vertical-align:middle">';
		echo end(explode('/',$filename));
		echo 
			'</span>
		</td></tr>';
	}
}*/

function mediaListener(x) {
	if(x.matches){
		//bigger than xxx px wide
		
		//show all panes, hide tab buttons
		document.getElementById("pane-select-buttons").style.display = "none";
		document.getElementById("browser-pane").style.display = "block";
		document.getElementById("playlist-pane").style.display = "block";
		document.getElementById("browser-pane-title").style.display = "block";
		document.getElementById("playlist-pane-title").style.display = "block";
	}
	else{
		//smaller than xxx px wide
		
		//hide browser pane, show tab buttons
		document.getElementById("browser-pane").style.display = "none";
		document.getElementById("browser-pane-title").style.display = "none";
		document.getElementById("playlist-pane-title").style.display = "none";
		document.getElementById("pane-select-buttons").style.display = "flex";

		//set style for selected pane
		document.getElementById("pane-select-playlist").style.color = "white";
		document.getElementById("pane-select-browser").style.color = "dimgrey";
		document.getElementById("pane-select-playlist").style.backgroundColor = "unset";
		document.getElementById("pane-select-browser").style.backgroundColor = "black";
	}
}

function actionSwitchPane(target){
	if(target == "playlist"){
		//hide browser pane, show tab buttons
		document.getElementById("browser-pane").style.display = "none";
		document.getElementById("playlist-pane").style.display = "block";

		//set style for selected pane
		document.getElementById("pane-select-playlist").style.color = "white";
		document.getElementById("pane-select-browser").style.color = "dimgrey";
		document.getElementById("pane-select-playlist").style.backgroundColor = "unset";
		document.getElementById("pane-select-browser").style.backgroundColor = "black";
	}
	else{
		//hide playlist pane, show tab buttons
		document.getElementById("browser-pane").style.display = "block";
		document.getElementById("playlist-pane").style.display = "none";

		//set style for selected pane
		document.getElementById("pane-select-playlist").style.color = "dimgrey";
		document.getElementById("pane-select-browser").style.color = "white";
		document.getElementById("pane-select-playlist").style.backgroundColor = "black";
		document.getElementById("pane-select-browser").style.backgroundColor = "unset";
	}
}




//execution scripts 

let mediaEv = window.matchMedia("(min-width:500px)");
mediaEv.addListener(mediaListener);

window.addEventListener("DOMContentLoaded", initPlayer);
