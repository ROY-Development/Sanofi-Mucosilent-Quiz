<?php
require_once(dirname(__FILE__) . "/zip-ftp-highscore-functions.php");

ZipFTPHighScoreFunctions::setBaseHeader();

$data = json_decode(file_get_contents("php://input"));

if (
	!isset($data) ||
	!isset($data->token) ||
	!isset($data->score) ||
	!isset($data->correctRate)
)
{
	onError("No valid parameter data is set.");
}

$tokenCheck = hash('sha256', $data->score . $data->correctRate . '|#--0{er.');

if ($tokenCheck !== $data->token)
{
	onError("No valid parameter data is set.");
}

$timestamp = time();
$data = $timestamp . '|' . $data->score . '|' . $data->correctRate;
$secret = 'SPEED_QUIZ_HIGHSCORE_ENCRYPTION_KEY';
$token = hash_hmac('sha256', $data, $secret);

http_response_code(200);
echo json_encode(array(
	'token' => $token,
	'timestamp' => $timestamp
));

function onError($message = null): never
{
	http_response_code(400);
	echo json_encode(array("message" => (isset($message) ? $message . " " : "") . "Unable to get token."));
	exit();
}

?>