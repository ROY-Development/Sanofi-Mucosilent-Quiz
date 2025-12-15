<?php
require_once(dirname(__FILE__) . "/../config/base-header.php");
require_once(dirname(__FILE__) . "/../config/core.php");
require_once(dirname(__FILE__) . "/../config/database.php");
require_once(dirname(__FILE__) . "/../file/file-functions.php");
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game.php");
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game-highscore.php");
require_once(dirname(__FILE__) . "/highscore-functions.php");

$timespan = 'all-time';

if (isset($_GET['timespan']))
{
	$timespan = htmlspecialchars($_GET['timespan'], ENT_QUOTES, 'UTF-8');
}

$highScore = [];
$path = '';

if (isset($_GET['qz']))
{
	$quizGameHashId = htmlspecialchars(stripslashes($_GET['qz']));
	
	$quizGame = new QuizGame();
	$quizGameId = QuizGame::getQuizGameIdByHash($quizGameHashId);
	$quizGameHash = QuizGame::getHashByQuizGameId($quizGameId);
	
	if (is_int($quizGameId))
	{
		$path = 'quiz-game/' . $quizGameHash;
		$result = FileFunctions::loadJSONFile(APP_ID, $path, "high-score-$timespan.json");
	}
}
else
{
	$result = FileFunctions::loadJSONFile(APP_ID, $path, "high-score-$timespan.json");
}

$needsUpdate = true;
if (!empty($result))
{
	if (json_last_error() !== JSON_ERROR_NONE)
	{
		onError(null, "Unable to parse config file.");
	}
	
	if (isset($result['highScore']))
	{
		$highScore = $result['highScore'];
	}
	
	if (isset($result['updated']))
	{
		$updated = new DateTime($result['updated'], new DateTimeZone('UTC'));
		// Week begin (Monday 00:00 o' clock)
		$mondayThisWeek = new DateTime('monday this week', new DateTimeZone('UTC'));
		$mondayThisWeek->setTime(0, 0, 0); // Setze Uhrzeit auf 00:00:00
		
		$needsUpdate = $updated < $mondayThisWeek;
	}
	
	if ($needsUpdate)
	{
		$database = new Database();
		$db = $database->getConnection();
		
		$quizGameHighscore = new QuizGameHighscore($db);
		
		$path .= '/';
		
		if (!isset($quizGameId))
		{
			$quizGameId = 0;
		}
		HighScoreFunctions::createJSONFile($db, $quizGameHighscore, $quizGameId, $path, $timespan);
		
		if ($quizGameId !== 0)
		{
			$path = 'quiz-game/' . $quizGameId;
		}
		else
		{
			$path = '';
		}
		
		$result = FileFunctions::loadJSONFile(APP_ID, $path, "high-score-$timespan.json");
		
		if (isset($result['highScore']))
		{
			$highScore = $result['highScore'];
		}
	}
}

http_response_code(200);
echo json_encode(array(
	'done' => true,
	'highScore' => $highScore,
	'timespan' => $timespan,
	'needsUpdate' => $needsUpdate,
));

function onError(?PDO $db = null, $message = null): never
{
	http_response_code(400);
	echo json_encode(array("message" => (isset($message) ? $message . " " : "") . "Unable to load high score."));
	exit();
}

?>