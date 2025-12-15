<?php
require_once(dirname(__FILE__) . "/zip-ftp-highscore-functions.php");

ZipFTPHighScoreFunctions::setBaseHeader();

$timespan = 'all-time';

if (isset($_GET['timespan']))
{
	$timespan = htmlspecialchars($_GET['timespan'], ENT_QUOTES, 'UTF-8');
}

$highScore = [];

$result = ZipFTPHighScoreFunctions::loadJSONFile('', "high-score-$timespan.json");

$needsUpdate = true;
if (!empty($result))
{
	if (json_last_error() !== JSON_ERROR_NONE)
	{
		onError("Unable to parse config file.");
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
		ZipFTPHighScoreFunctions::updateAll();
		
		$result = ZipFTPHighScoreFunctions::loadJSONFile('', "high-score-$timespan.json");
		
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

function onError($message = null): never
{
	http_response_code(400);
	echo json_encode(array("message" => (isset($message) ? $message . " " : "") . "Unable to load high score."));
	exit();
}

?>