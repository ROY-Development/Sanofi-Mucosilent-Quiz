<?php

require_once(dirname(__FILE__) . "/../config/base-header.php");
require_once(dirname(__FILE__) . "/../config/core.php");
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game.php");

$data = json_decode(file_get_contents("php://input"));

if (
	!isset($data) ||
	!isset($data->token) ||
	!isset($data->crm) ||
	gettype($data->crm) !== 'object'
)
{
	onError("No valid parameter data is set.");
}

$crmValuesStr = json_encode($data->crm, JSON_UNESCAPED_UNICODE);

$tokenCheck = hash('sha256', $crmValuesStr . '|}-9#cv.');

if ($tokenCheck !== $data->token)
{
	onError("No valid parameter data is set.");
}

if (isset($data->qz))
{
	$quizGameHashId = htmlspecialchars(stripslashes($data->qz));
	
	$quizGame = new QuizGame();
	$quizGameId = QuizGame::getQuizGameIdByHash($quizGameHashId);
	
	if (!is_int($quizGameId))
	{
		onError();
	}
}

$timestamp = time();
$data = $timestamp . '|' . $crmValuesStr;
$secret = SPEED_QUIZ_HIGHSCORE_ENCRYPTION_KEY;
$token = hash_hmac('sha256', $data, $secret);

http_response_code(200);
echo json_encode(array(
	'token' => $token,
	'timestamp' => $timestamp,
	'data' => $data
));

function onError($message = null): never
{
	http_response_code(400);
	echo json_encode(array("message" => (isset($message) ? $message . " " : "") . "Unable to get token."));
	exit();
}

?>