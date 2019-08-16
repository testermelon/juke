<?php
echo '<table style="width:100%">';
$targetdir = rawurldecode($_GET['dir']);

//handle bug regarding square brackets
$targetdir = str_replace('[','\[',$targetdir);
$targetdir = str_replace(']','\]',$targetdir);

$file_list = glob($targetdir . "/*");
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
}
echo '</table>';
?>

