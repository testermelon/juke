<?php

//use this script to handle playlists gets and modification requests
//
//parameters:
//  op = operation code. Obtain using $_GET['op']
//  pl = playlist name
//  path = track's path relative to Music directory home
//  tr = track number of the track in the playlist
//
//

//filename of playlist data

$pl_fname = ".pldata.json";

//outputs list of playlists currently available
function plList(){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
	echo json_encode(array_keys($plData));
}

//outputs tracklist of requested playlists
function plGet($plname){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
	$pl	= $plData[$plname];
	echo  json_encode($pl);
}

//push track to a playlist
function plAddTrack($plname,$file_path){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
	array_push($plData[$plname],$file_path);
	$pljson = json_encode($plData);
	$status = file_put_contents(".pldata.json",$pljson);
}

//create new empty playlist and put it last
function plNewPlaylist($plname){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
}

function plClearPlaylist($plname){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
}

function plDelPlaylist($plname){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
}

function plRemoveTrack($plname,$track_no){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
}

//swap track track_no and track_no+1, except when its last or first
function plSwapTrack($plname,$track_no){
	$pljson = file_get_contents(".pldata.json");
	$plData = json_decode($pljson,true);
}

function plInitializeData(){
	$plData = array("New Playlist 1" => [""]);
	$pljson = json_encode($plData);
	var_dump($pljson);
	$status = file_put_contents($pl_fname,$pljson);
	var_dump($status);
	$status = is_writable(".");
	var_dump($status);
	echo exec('whoami'); 
}

//execute according to op parameter
switch($_GET['op']){
	case 'ls':
		plList();
		break;
	case 'get':
		plGet($_GET['pl']);
		break;
	case 'new' :
		plNewPlaylist($_GET['pl']);
		break;
	case 'clr' :
		plClearPlaylist($_GET['pl']);
		break;
	case 'dl' :
		plDelPlaylist($_GET['pl']);
		break;
	case 'add' :
		plAddTrack($_GET['pl'],$_GET['path']);
		break;
	case 'dt' :
		plRemoveTrack($_GET['pl'],$_GET['tr']);
		break;
	case 'sw' :
		plSwapTrack($_GET['pl'],$_GET['tr']);
		break;
	case 'init':
		plInitializeData();
		break;
}

?>
