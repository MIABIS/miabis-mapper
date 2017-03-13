<?php

session_start();
	
$date = new DateTime();
$dir_time = $date->getTimestamp();

$realpath = realpath($_SERVER['DOCUMENT_ROOT']);
//Make tmp directory if it does not exist already.
if (!file_exists($realpath.'/Mapper/tmp')) {
    mkdir($realpath.'/Mapper/tmp', 0777, true);
}

if(!isset($_SESSION['dir'])){
	$_SESSION['dir'] = $dir_time;
}

//The path to the directory to create with the timestamp.
$dir = $realpath.'/Mapper/tmp/'.$_SESSION['dir'];
//Create the directory if it does not exist already.	
if(!file_exists($dir)){
	mkdir($dir);
}

$mapdone = false;

if($_POST['mode'] === "localfile"){
/*[{
	"file": "localfile"
}, {
	"entity": {
		"Sample": {

			"attributes": ["provid", "GROUP_NAME", "SAMPLE_TYPE", "SAMPLE_VOLUME", "SAMPLE_UNITS", "KI_SPREC", "T_GENDER", "T_AGE", "CLINICAL_TRIAL", "T_SAMPLE_FORM", "T_SAMPLE_STATE", "PROJECT", "PROJECT_ID", "STUDY_CODE"]
		}
	}
}]*/
	
	$result_array = array();
	
	$file_array['file'] = $_POST['mode'];
	array_push($result_array, $file_array);
	
	$attributes_array['attributes'] = array();
	
	$arr = $_POST['data'];
	foreach($arr as $item) {
		array_push($attributes_array['attributes'], $item['Attribute']);
	}
	
	$entity_array = array($_POST['entity']=> $attributes_array);
	
	array_push($result_array, array('entity' => $entity_array));
	//echo json_encode($result_array);
	
	file_put_contents($dir.'/'.$_POST['entity'].'.json', json_encode($result_array, JSON_PRETTY_PRINT));
	
}

if($_POST['mode'] === "mapfile" && $_POST['type'] === "entitymapping"){
	
	$result_array = array();
	
	$file_array['file'] = $_POST['mode'];
	$file_array['type'] = $_POST['type'];
	array_push($result_array, $file_array);
	
/*[{
	"file": "mapfile",
	"type": "entitymapping"
}, {
	"entity": {
		"Sample": {
			"attributes": {
				"a": "b",
				"3": "b"
			}
		},
		"Sample Collection": {
			"attributes": {
				"n1": "b",
				"n": "b"
			}
		}
	}
}]*/
	
	/*$entity_array = array('entity' => array(
										"Sample" => array(
											"attributes" => array(
												"a" => "b",
												"c" => "d"
											)
										),
										"Sample Collection" => array(
											"attributes" => array(
												"a" => "b",
												"c" => "d"
											)
										)
									)
									
	                      );
	array_push($result_array, $entity_array);*/
	
	$entity_array['entity'] = array();
	
	$previous = "";
	$flag = false;
	$dataentity = $_POST['dataentity'];
	
	$numItems = count($dataentity);
	$i = 0;
	foreach($dataentity as $item) {
		$current = $item['Entity'];		
		
		if($current !== $previous){
			if($flag){
				$res = array($previous => array("attributes" => $attributes_map_array));
				array_push($entity_array['entity'], $res);
			}
			
			$entity_array_item = array();
			$attributes_array = array();
			$attributes_map_array = array();
			$flag = true;
			
		}
		
		$standard = $item['Standard Attribute'];
		$local = ($item['Local Attribute']!=="")?$item['Local Attribute']:"";
		
		$attributes_map_array[$standard] = $local;
		
		$previous = $current;
		if(++$i === $numItems) {
    		array_push($entity_array['entity'], array($current => array("attributes" => $attributes_map_array)));
  		}
		
	}
	
	
	array_push($result_array, $entity_array);
	//echo json_encode($result_array);
	
	file_put_contents($dir.'/entitymapping.json', json_encode($result_array, JSON_PRETTY_PRINT));
	
	//Code to parse the $result_array
	/*$JSON = json_decode(json_encode($result_array));
	echo '<pre>';
	print_r($JSON);
	echo $JSON[0]->file;
	echo "\r\n";
	echo $JSON[0]->type;
	$entities =  $JSON[1]->entity;
	foreach($entities as $entity){
		echo "\r\n";
		echo "Entity: ".key($entity);
		foreach($entity as $attribute){
			echo "\r\n";
			echo "\t".key($attribute)." mapping:";
			foreach($attribute->attributes as $key=>$val){
				echo "\r\n";
				echo "\t\t\"$key\" : \"$val\"";
			}
		}
	}*/
	
}




if($_POST['mode'] === "mapfile" && $_POST['type'] === "listvaluesmapping"){
	
/*[{
	"file": "mapfile",
	"type": "listvaluesmapping"
}, {
	"attribute": {
		"Sex": {
			"a": "b",
			"3": "b"
		},
		"Material Type": {
			"n1": "b",
			"n": "b"
		}
	}
}]*/

	$result_array = array();
	
	$file_array['file'] = $_POST['mode'];
	$file_array['type'] = $_POST['type'];
	array_push($result_array, $file_array);

	$attribute_array['attribute'] = array();
	
	$previous = "";
	$flag = false;
	$datalistvalues = $_POST['datalistvalues'];
	
	$numItems = count($datalistvalues);
	$i = 0;
	foreach($datalistvalues as $item) {
		$current = $item['Attribute'];		
		
		if($current !== $previous){
			if($flag){
				$res = array($previous => $attributevalues_map_array);
				array_push($attribute_array['attribute'], $res);
			}
			
			$attribute_array_item = array();
			$attributevalues_map_array = array();
			$flag = true;
			
		}
		
		$standard = $item['Standard Value'];
		$local = ($item['Local Value']!=="")?$item['Local Value']:"";
		
		$attributevalues_map_array[$standard] = $local;
		
		$previous = $current;
		if(++$i === $numItems) {
    		array_push($attribute_array['attribute'], array($current => $attributevalues_map_array));
  		}
		
	}
	
	
	array_push($result_array, $attribute_array);
	//echo json_encode($result_array);
	
	file_put_contents($dir.'/listvaluesmapping.json', json_encode($result_array, JSON_PRETTY_PRINT));
	
	$mapdone = true;
	
	//Code to parse the $result_array
	/*$JSON = json_decode(json_encode($result_array));
	echo '<pre>';
	print_r($JSON);
	echo $JSON[0]->file;
	echo "\r\n";
	echo $JSON[0]->type;
	$attributes =  $JSON[1]->attribute;
	foreach($attributes as $attribute){
		echo "\r\n";
		echo "Attribute: ".key($attribute);
		echo "\r\n";
		echo "\tvalues mapping:";
		foreach($attribute as $mapping){
			foreach($mapping as $key=>$val){
				echo "\r\n";
				echo "\t\t\"$key\" : \"$val\"";
			}
		}
	}*/
}

$zipname = $dir.'.zip';
	
$zip = new ZipArchive();
$zip->open($zipname, ZipArchive::CREATE);


if ($handle = opendir($dir)) {
  while (false !== ($entry = readdir($handle))) {
	if ($entry != "." && $entry != "..") {
		$zip->addFile($dir."/".$entry, $entry);
	}
  }
  closedir($handle);
}

$zip->close();


if($mapdone){
	echo json_encode(array("download" =>"http://".$_SERVER['SERVER_NAME']."/Mapper/tmp/".$_SESSION['dir'].'.zip', "delete" => $dir.'.zip'));
	//session_destroy();
	//unset ($_SESSION['dir']);
}


//Function to recursively delete the contents and the directory itself.
function rrmdir($dir) { 
	if (is_dir($dir)) {
		$objects = scandir($dir); 
		foreach ($objects as $object) { 
			if ($object != "." && $object != "..") {
				if (is_dir($dir."/".$object)){
					rrmdir($dir."/".$object);
				}
				else{
					unlink($dir."/".$object); 
				}
			} 
		}
		rmdir($dir); 
	} 
}

?>