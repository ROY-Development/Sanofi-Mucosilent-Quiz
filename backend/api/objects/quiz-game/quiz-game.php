<?php
require_once(dirname(__FILE__) . "/../../config/core.php");
require_once(dirname(__FILE__) . "/../../utils/util-crypt.php");

class QuizGame
{
	public function __construct()
	{
	}
	
	public static function getHashByQuizGameId(int $id): string|false
	{
		$plaintext = str_pad($id, 20, '0', STR_PAD_LEFT);
		return UtilCrypt::encrypt($plaintext, COMPANY_SPEED_QUIZ_ENCRYPTION_KEY);
	}
	
	public static function getQuizGameIdByHash(string $hash): int|false
	{
		$decrypt = UtilCrypt::decrypt($hash, COMPANY_SPEED_QUIZ_ENCRYPTION_KEY);
		
		if ($decrypt)
		{
			return intval($decrypt);
		}
		
		return false;
	}
}
