
<div style="display:grid;  grid-template-columns: 1fr; ">
<?php 
$targetdir = rawurldecode($_GET['dir']);
$file_list = glob($targetdir . "/*");
foreach ($file_list as $filename){
	$path = rawurlencode($filename);
	if(!is_dir($filename)) {
		echo 
		'<div class="browser_item" style="height:25px;width:100%;vertical-align:middle">
			<span style="float:left;vertical-align:middle">';
		echo end(explode('/',$filename));
		echo 
			'</span>
			<span style="float:right;vertical-align:middle">';
		echo	"<button onclick=addFile(\"";
		echo	"$path";
		echo	"\") ";
		echo 	'class="small_button">+</button> 
			</span>
		</div><br>';
	}
	else{
		echo 	
		'<div class="browser_item" style="height:25px;width:100%;vertical-align:middle" ';
		echo	"onclick=obtainDirList(\"";
		echo	"$path";
		echo	"\")>";
		echo
			'<span style="float:left;vertical-align:middle">';
		echo end(explode('/',$filename));
		echo 
			'</span>
		</div><br>';
	}
}
?>

</div>
