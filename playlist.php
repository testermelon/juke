<?php

//use this script to handle playlists gets and modification requests
//
//plList()
//outputs list of playlists currently available
//
//plGet(pl_name)
//outputs json of requested playlists
//
//plNewPlaylist(plname)
//
//plClearPlaylist(plname)
//
//plDeletePlaylist(plname)
//
//plAddTrack(pl_name,file_path)
//
//plRemoveTrack(pl_name,track_no)
//
//plSwapTrack(plname,track_no1,track_no2)

function plGet($plname){
	$pljson = file_get_contents(".pldata.json");
	$plList = json_decode($pljson,true);
	$pl	= $plList[$plname];
	$pl	= json_encode($pl);
	echo $pl;

}

plGet($_GET['pl']);

?>
