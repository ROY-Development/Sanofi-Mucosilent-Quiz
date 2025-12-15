<?php
require_once(dirname(__FILE__) . "/../config/base-header.php");
require_once(dirname(__FILE__) . "/../file/file-functions.php");
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game.php");

$basePath = dirname(__FILE__) . "/../../";
$rightPath = "";
$quizGameId = null;
$files = [];

if (isset($_GET['qz']))
{
	$quizGameHashId = htmlspecialchars(stripslashes($_GET['qz']));
	
	$quizGame = new QuizGame();
	$quizGameId = QuizGame::getQuizGameIdByHash($quizGameHashId);
	
	if (is_int($quizGameId))
	{
		$quizGameHash = QuizGame::getHashByQuizGameId($quizGameId);
		$path = 'quiz-game/' . $quizGameHash;
		$config = FileFunctions::loadJSONFile(APP_ID, $path, 'config.json');
		
		if (isset($config))
		{
			$quizCategoryIds = $config['categories'] ?? [];
			foreach ($quizCategoryIds as $quizCategoryId)
			{
				$files[] = "category-$quizCategoryId/config.json";
			}
			
			// prepare config values
			$config['id'] = $quizGameId;
			unset($config['categories']);
		}
		else
		{
			$quizGameId = null;
		}
	}
}

if (!isset($quizGameId) || !is_int($quizGameId))
{
	$basePath = FileFunctions::getRootPath() . FileFunctions::getAppUrl(APP_ID);
	$path = "/quiz-game/base/categories";
	$rightPath = $basePath . $path;
	
	if (!is_dir($basePath . $path))
	{
		onError();
	}
	
	$files = [];
	$dir = new DirectoryIterator($rightPath);
	foreach ($dir as $fileinfo)
	{
		if (!$fileinfo->isDot())
		{
			$fileName = $fileinfo->getFilename();
			if (str_contains($fileName, '.json')) // get only config files not image folders
			{
				$files[] = $fileName;
			}
		}
	}
}

http_response_code(200);
echo json_encode(array(
	'done' => true,
	// 'rightPath' => $rightPath,
	'files' => $files ?? null,
	'config' => $config ?? null,
	'qz' => $quizGameId
));

function onError($message = null): never
{
	http_response_code(400);
	echo json_encode(array("message" => (isset($message) ? $message . " " : "") . "Unable to load game config."));
	exit();
}

?>