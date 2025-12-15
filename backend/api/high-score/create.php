<?php
require_once(dirname(__FILE__) . "/../config/base-header.php");
require_once(dirname(__FILE__) . "/../config/core.php");
require_once(dirname(__FILE__) . "/../config/database.php");
require_once(dirname(__FILE__) . "/../file/file-functions.php");
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game.php");
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game-highscore.php");
require_once(dirname(__FILE__) . "/highscore-functions.php");

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

$secret = SPEED_QUIZ_HIGHSCORE_ENCRYPTION_KEY;
$expectedData = $timestamp . '|' . $score . '|' . $correctRate;
$expectedToken = hash_hmac('sha256', $expectedData, $secret);

if (abs(time() - $timestamp) > 6)
{
	onError(null, "Token expired.");
}

if (!hash_equals($expectedToken, $receivedToken))
{
	onError(null, "Invalid token.");
}
// check token: END

$db = null;
$quizGameId = null;

$newNickname = htmlspecialchars($data->nickname);
$newScore = intval($data->score);
$newCorrectRate = floatval($data->correctRate);
$currentDate = date("Y-m-d H:i:s");

$database = new Database();
$db = $database->getConnection();

$quizGameHighscore = new QuizGameHighscore($db);

$db->beginTransaction();

if (isset($data->qz))
{
	$quizGameHashId = htmlspecialchars(stripslashes($data->qz));
	$quizGame = new QuizGame();
	$quizGameId = QuizGame::getQuizGameIdByHash($quizGameHashId);
}

$quizGameHighscore->name = $newNickname;
$quizGameHighscore->score = $newScore;
$quizGameHighscore->correctRate = $newCorrectRate;

if (is_int($quizGameId))
{
	$quizGameHash = QuizGame::getHashByQuizGameId($quizGameId);
	$path = 'quiz-game' . DIRECTORY_SEPARATOR . $quizGameHash . DIRECTORY_SEPARATOR;
	
	$quizGameHighscore->quizGameId = $quizGameId;
	
	if (!$quizGameHighscore->create())
	{
		onError($db, "Failed to create quiz game highscore in DB.");
	}
	
	$result = $quizGameHighscore->get();
	
	$currentDate = $result['createdAt']; // UTC time format "2025-07-14T07:04:48Z"
	
	HighScoreFunctions::createJSONFile($db, $quizGameHighscore, $quizGameId, $path, 'allTime');
	HighScoreFunctions::createJSONFile($db, $quizGameHighscore, $quizGameId, $path, 'monthly');
	HighScoreFunctions::createJSONFile($db, $quizGameHighscore, $quizGameId, $path, 'weekly');
}
else // create base game entry
{
	$path = '/';
	$quizGameId = 0;
	
	$quizGameHighscore->quizGameId = null;
	
	if (!$quizGameHighscore->create())
	{
		onError($db, "Failed to create quiz game highscore in DB.");
	}
	
	$result = $quizGameHighscore->get();
	
	$currentDate = $result['createdAt']; // UTC time format "2025-07-14T07:04:48Z"
	
	HighScoreFunctions::createJSONFile($db, $quizGameHighscore, $quizGameId, $path, 'allTime');
	HighScoreFunctions::createJSONFile($db, $quizGameHighscore, $quizGameId, $path, 'monthly');
	HighScoreFunctions::createJSONFile($db, $quizGameHighscore, $quizGameId, $path, 'weekly');
}

/*$fileName = 'high-score.json';
$basePath = FileFunctions::getRootPath() . FileFunctions::getAppUrl(APP_ID);

$fileDir = $basePath . '/' . $path;
// $fileName = FileFunctions::convertFileName($fileName);
$filePath = $fileDir . $fileName;

$newHighScore = [
	'nickname' => $newNickname,
	'score' => $newScore,
	'correctRate' => $newCorrectRate,
	'createdAt' => $currentDate
];

$json = preg_replace_callback(
	'/^(?: {4})+/m',
	function ($m) {
		return str_repeat("\t\t\t", strlen($m[0]) / 4); // replace spaces with tabs
	},
	json_encode($newHighScore, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
);

$json = str_replace('}', "\t\t}", $json);

// read the file if present
$handle = @fopen($filePath, 'r+');

$newFileStr = "{\n\t\"highScore\": [\n\t\t" . $json . "\n\t]\n}";

// create the file if needed
if ($handle === false)
{
	$handle = fopen($filePath, 'w+');
	if ($handle)
	{
		// write the first entry
		fwrite($handle, $newFileStr);
	}
}
else
{
	// seek to the end
	fseek($handle, 0, SEEK_END);
	
	// are we at the end of is the file empty
	if (ftell($handle) > 0)
	{
		// move back 5 bytes
		fseek($handle, -5, SEEK_END);
		
		// add the trailing comma
		fwrite($handle, ",\n\t\t");
		
		// add the new json string
		fwrite($handle, $json . "\n\t]\n}");
	}
	else
	{
		// write the first entry
		fwrite($handle, $newFileStr);
	}
}
fclose($handle);// close the handle on the file
*/

$db->commit();

http_response_code(200);
echo json_encode(array(
	'done' => true
));

function onError(?PDO $db = null, $message = null): never
{
	$db?->rollBack();
	http_response_code(400);
	echo json_encode(array("message" => (isset($message) ? $message . " " : "") . "Unable to save high score."));
	exit();
}

?>