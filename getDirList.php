<table style="width:100%">

<?php 
$targetdir = rawurldecode($_GET['dir']);
$file_list = glob($targetdir . "/*");
foreach ($file_list as $filename){
	$path = rawurlencode($filename);
	if(!is_dir($filename)) {
	echo 
	'<tr>
		<td>
		<span style="float:left">';
	echo end(explode('/',$filename));
	echo 
		'</span>
		<span style="float:right">
			<button class="small_button">+</button> 
		</span>
		</tr>';
	}
	else{
	echo 
		'<tr>';
	echo
		"<td onclick=obtainDirList(\"";
	echo	"$path";
	echo	"\")>";
	echo
		'<span style="float:left">';
	echo end(explode('/',$filename));
	echo 
		'</span>
		</tr>';
	}
}

?>

</table>
