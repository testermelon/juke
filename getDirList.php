<?php
$targetdir = rawurldecode($_GET['dir']);

//handle bug regarding square brackets
$targetdir = str_replace('[','\[',$targetdir);
$targetdir = str_replace(']','\]',$targetdir);

$file_list = glob($targetdir . "/*");

$dir_data = array("dir" => [], "file" => []);
foreach ($file_list as $filename){
	$path = rawurlencode($filename);
	if(is_dir($filename)) {
		array_push($dir_data['dir'],$path);
	}
	else{
		array_push($dir_data['file'],$path);
	}
}
echo json_encode($dir_data);
?>

