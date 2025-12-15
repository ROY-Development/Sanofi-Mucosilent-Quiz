<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once(dirname(__FILE__) . "/../config/base-header.php");
require_once(dirname(__FILE__) . "/../file/file-functions.php");

$quizGamePath = 'base';

$path = "/quiz-game/$quizGamePath/categories";
$basePath = FileFunctions::getRootPath() . FileFunctions::getAppUrl(APP_ID);
$rightPath = $basePath . $path;

print_r($rightPath);
print_r("<br>\n");


if (is_dir($rightPath))
{
	print_r('good');
}
else
{
	print_r('bad');
}