<?php
require_once(dirname(__FILE__) . "/../config/core.php");
require_once(dirname(__FILE__) . "/../utils/util-crypt.php");
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game.php");

$quizGame = new QuizGame();
$hashId = 'eWs0N044bzI3WUdML1ZoS3JMMzVjUnE1ell0K3I3YWNnY1ovSmZEekFjTT0';
$decrypt = QuizGame::getQuizGameIdByHash($hashId);
echo $decrypt.'<br>';

echo "QuizGameId:55<br>";
$hashId = QuizGame::getHashByQuizGameId(55);
echo $hashId.'<br>';

$decrypt = QuizGame::getQuizGameIdByHash($hashId);
echo $decrypt.'<br>';

// test encrypt
echo '-----<br>';
$plaintext = str_pad(17, 20, '0', STR_PAD_LEFT);
echo $plaintext.'<br>';
$hashId = UtilCrypt::encrypt($plaintext, COMPANY_SPEED_QUIZ_ENCRYPTION_KEY);
echo $hashId.'<br>';
$decrypt = UtilCrypt::decrypt($hashId, COMPANY_SPEED_QUIZ_ENCRYPTION_KEY);
echo $decrypt.'<br>';

$text = 'rV/CsFJ5QwJr3Wly0BbdnZdFV/D1T1G6zYjB+6ho+DM=';
echo $text.'<br>';

$res = UtilCrypt::encrypt($text, COMPANY_SPEED_QUIZ_ENCRYPTION_KEY);
echo $res.'<br>';
$res2 = UtilCrypt::decrypt($res, COMPANY_SPEED_QUIZ_ENCRYPTION_KEY);
echo $res2.'<br>';
echo '-----<br>';