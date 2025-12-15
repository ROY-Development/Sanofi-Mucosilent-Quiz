<?php
require_once(dirname(__FILE__) . "/zip-ftp-user-crm-functions.php");

ZipFTPUSerCrmFunctions::setBaseHeader();

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

$secret = 'SPEED_QUIZ_HIGHSCORE_ENCRYPTION_KEY';
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

$basePath = ZipFTPUserCrmFunctions::getBasePath();
$path = '';
$fileName = 'user-crm-values.csv';

// $fileName = FileFunctions::convertFileName($fileName);
$fullPath = $basePath . DIRECTORY_SEPARATOR . (strlen($path) > 0 ? $path . DIRECTORY_SEPARATOR : '') . $fileName;

ZipFTPUserCrmFunctions::checkOrCreatePath($path);

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