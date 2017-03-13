<?php
session_start();
if(isset($_SESSION['dir'])){
	session_destroy();
	unset ($_SESSION['dir']);
}
?>