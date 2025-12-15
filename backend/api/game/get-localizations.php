<?php
require_once(dirname(__FILE__) . "/../config/base-header.php");
require_once(dirname(__FILE__) . "/../file/file-functions.php");
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game.php");

$localizations = [];
$locale = isset($_GET['locale']) ? htmlspecialchars(stripslashes($_GET['locale'])) : 'de-DE';

if (isset($_GET['qz']))
{
	$quizGameHashId = htmlspecialchars(stripslashes($_GET['qz']));
	
	$quizGame = new QuizGame();
	$quizGameId = QuizGame::getQuizGameIdByHash($quizGameHashId);
	
	if (is_int($quizGameId))
	{
		$quizGameHash = QuizGame::getHashByQuizGameId($quizGameId);
		$path = 'quiz-game';
		$config = FileFunctions::loadJSONFile(APP_ID, $path . DIRECTORY_SEPARATOR . $quizGameHash, 'config.json');
		
		// currently not needed
		// $result = FileFunctions::loadJSONFile(APP_ID, $path . '/i18n', 'de-DE.json');
		
		if (isset($config))
		{
			$quizCategoryIds = $config['categories'] ?? [];
			foreach ($quizCategoryIds as $quizCategoryId)
			{
				$result = FileFunctions::loadJSONFile(APP_ID, $path . "/categories/category-$quizCategoryId/i18n", "$locale.json");
				
				if (isset($result))
				{
					$localizations = array_merge($localizations, $result);
				}
			}
		}
	}
}

echo(json_encode($localizations));