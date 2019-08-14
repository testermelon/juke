<?php

//use this script to handle playlists gets and modification requests
//
//parameters:
//  op = operation code. Obtain using $_GET['op']
//  pl = playlist no
//  n = playlist name
//  path = track's path relative to Music directory home
//  tr = track number of the track in the playlist
//
//

//filename of playlist data

$pl_fname = "pldata";

//outputs list of playlists currently available
function plList(){
	global $pl_fname;
	$pljson = file_get_contents($pl_fname);
	$plData = json_decode($pljson,true);
	$pl_list = [];
	foreach($plData as $playlist){
		array_push($pl_list,$playlist['name']);
	}
	echo json_encode($pl_list);

}

//outputs tracklist of requested playlists
function plGet($pl){
	global $pl_fname;
	$pljson = file_get_contents("$pl_fname");
	$plData = json_decode($pljson,true);
	$playlist = $plData[$pl]['tracklist'];
	echo  json_encode($playlist);
}

//push track to a playlist
//puts out resulting tracklist
function plAddTrack($pl,$file_path){
	global $pl_fname;
	$pljson = file_get_contents("$pl_fname");
	$plData = json_decode($pljson,true);
	array_push($plData[$pl]['tracklist'],$file_path);
	$pljson = json_encode($plData);
	$status = file_put_contents("$pl_fname",$pljson);
	echo json_encode($plData[$pl]['tracklist']);
}

//create new empty playlist and put it last
function plNewPlaylist($pl_name){
	global $pl_fname;
	$pljson = file_get_contents("$pl_fname");
	$plData = json_decode($pljson,true);
	$new_pl = array("name" => $pl_name,"tracklist" => [] );
	array_push($plData,$new_pl);
	var_dump(json_encode($plData));
	$pljson = json_encode($plData);
	$status = file_put_contents("$pl_fname",$pljson);
}

function plClearPlaylist($pl){
	global $pl_fname;
	$pljson = file_get_contents("$pl_fname");
	$plData = json_decode($pljson,true);
	$plData[$pl]['tracklist'] = [];
	$pljson = json_encode($plData);
	$status = file_put_contents("$pl_fname",$pljson);
	echo json_encode($plData[$pl]['tracklist']);
}

function plDelPlaylist($pl){
	global $pl_fname;
	$pljson = file_get_contents("$pl_fname");
	$plData = json_decode($pljson,true);
	array_splice($plData,$pl,1);
	$pljson = json_encode($plData);
	$status = file_put_contents("$pl_fname",$pljson);
}

function plRemoveTrack($pl,$tr){
	global $pl_fname;
	$pljson = file_get_contents("$pl_fname");
	$plData = json_decode($pljson,true);
	array_splice($plData[$pl]['tracklist'],$tr,1);
	$pljson = json_encode($plData);
	$status = file_put_contents("$pl_fname",$pljson);
}

//swap track track_no and track_no+1, except when its last or first
function plSwapTrack($plname,$track_no){
	global $pl_fname;
	$pljson = file_get_contents("$pl_fname");
	$plData = json_decode($pljson,true);
}

function plInitializeData(){
	//need to make playlist names have duplicates, 
	//so, instead of using playlist names, use array index as unique id
	//TODO change client side js also
	global $pl_fname;
	$plData = array(["name" => "New Playlist","tracklist" => [] ]);
	var_dump($plData);
	$pljson = json_encode($plData);
	var_dump($pljson);
	$status = file_put_contents($pl_fname,$pljson);
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
		plNewPlaylist($_GET['n']);
		break;
	case 'clr' :
		plClearPlaylist($_GET['pl']);
		break;
	case 'del' :
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
		echo "OK";
		break;
}

?>
