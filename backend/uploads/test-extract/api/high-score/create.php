<?php
require_once(dirname(__FILE__) . "/zip-ftp-highscore-functions.php");

ZipFTPHighScoreFunctions::setBaseHeader();

$data = json_decode(file_get_contents("php://input"));

if (
	!isset($data) ||
	!isset($data->timestamp) ||
	!isset($data->token) ||
	!isset($data->nickname) ||
	!isset($data->score) ||
	!isset($data->correctRate)
)
{
	onError(null, "No valid parameter data is set.");
}

// check token: START
$timestamp = $data->timestamp;
$score = $data->score;
$correctRate = $data->correctRate;
$receivedToken = $data->token;

$secret = 'sj1cjzeofS09JrAGgO876DE1pD8peuV3Dqg';
$expectedData = $timestamp . '|' . $score . '|' . $correctRate;
$expectedToken = hash_hmac('sha256', $expectedData, $secret);

if (abs(time() - $timestamp) > 6)
{
	onError("Token expired.");
}

if (!hash_equals($expectedToken, $receivedToken))
{
	onError("Invalid token.");
}
// check token: END

$db = null;
$quizGameId = null;

$newNickname = htmlspecialchars($data->nickname);
$newScore = intval($data->score);
$newCorrectRate = floatval($data->correctRate);
$currentDate = date("Y-m-d H:i:s");

ZipFTPHighScoreFunctions::updateAll($newNickname, $newScore, $newCorrectRate, $currentDate);

http_response_code(200);
echo json_encode(array(
	'done' => true
));

function onError($message = null): never
{
	http_response_code(400);
	echo json_encode(array("message" => (isset($message) ? $message . " " : "") . "Unable to save high score."));
	exit();
}

?>