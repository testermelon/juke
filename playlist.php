<?php

//use this script to handle playlists gets and modification requests
//
//parameters:
//  op = operation code. Obtain using $_GET['op']
//  pl = playlist name
//  path = track's path relative to Music directory home
//  tr = track number of the track in the playlist
//
//plList()
//outputs list of playlists currently available
//
//plGet(pl)
//outputs json of requested playlists
//
//plNewPlaylist(pl)
//create new empty playlist and put it last
//
//plClearPlaylist(pl)
//
//plDeletePlaylist(pl)
//
//plAddTrack(pl,file_path)
//add track path and put it last in playlist
//
//plRemoveTrack(pl,track_no)
//
//plSwapTrack(plname,track_no)
//swap track track_no and track_no+1, except when its last or first

function plList(){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
	echo json_encode(array_keys($plData));
}

function plGet($plname){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
	$pl	= $plData[$plname];
	echo  json_encode($pl);
}

function plAddTrack($plname,$file_path){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
	array_push($plData[$plname],$file_path);


}


//execute according to op parameter
switch($_GET['op']){
	case 'ls':
		plList();
		break;
	case 'get':
		plGet($_GET['pl']);
		break;
	case 'add' :
		plAddTrack($_GET['pl'],$_GET['path']);
		break;
}

?>
