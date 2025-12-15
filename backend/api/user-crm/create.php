<?php
require_once(dirname(__FILE__) . "/../config/base-header.php");
require_once(dirname(__FILE__) . "/../config/core.php");
require_once(dirname(__FILE__) . "/../file/file-functions.php");
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game.php");

$data = json_decode(file_get_contents("php://input"));

if (
	!isset($data) ||
	!isset($data->timestamp) ||
	!isset($data->token) ||
	!isset($data->crm) ||
	gettype($data->crm) !== 'object'
)
{
	onError("No valid parameter data is set.");
}

// check token: START
$timestamp = $data->timestamp;
$crmValuesStr = json_encode($data->crm, JSON_UNESCAPED_UNICODE);
$receivedToken = $data->token;

$secret = SPEED_QUIZ_HIGHSCORE_ENCRYPTION_KEY;
$expectedData = $timestamp . '|' . $crmValuesStr;
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

$quizGameId = null;

$currentDate = date("Y-m-d H:i:s");

if (isset($data->qz))
{
	$quizGameHashId = htmlspecialchars(stripslashes($data->qz));
	$quizGame = new QuizGame();
	$quizGameId = QuizGame::getQuizGameIdByHash($quizGameHashId);
}

if (is_int($quizGameId))
{
	$quizGameHash = QuizGame::getHashByQuizGameId($quizGameId);
	$path = 'quiz-game' . DIRECTORY_SEPARATOR . $quizGameHash . DIRECTORY_SEPARATOR;
	$fileName = 'user-crm-values.csv';
	$basePath = FileFunctions::getRootPath() . FileFunctions::getAppUrl(APP_ID);
	$fileDir = $basePath . DIRECTORY_SEPARATOR . $path . DIRECTORY_SEPARATOR;
	// $fileName = FileFunctions::convertFileName($fileName);
	$fullPath = $fileDir . $fileName;
	
	FileFunctions::checkOrCreatePath(APP_ID, $path);
	
	$isNew = !file_exists($fullPath);
	
	$row = [];
	foreach ($data->crm as $key => $value)
	{
		$row[] = !empty($value) ? htmlspecialchars($value) : '';
	}
	
	$file = fopen($fullPath, 'a');
	
	if ($isNew)
	{
		$header = ['First name', 'Last name', 'birthdate', 'organisation', 'email', 'message'];
		fputcsv($file, $header, ';', '"', '');
	}
	
	fputcsv($file, $row, ';', '"', '');
	fclose($file);
}
else // create base game entry
{
	// not used currently
}

http_response_code(200);
echo json_encode(array(
	'done' => true
));

function onError($message = null): never
{
	http_response_code(400);
	echo json_encode(array("message" => (isset($message) ? $message . " " : "") . "Unable to save CRM user values."));
	exit();
}

?>