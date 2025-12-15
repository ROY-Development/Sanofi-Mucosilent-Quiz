<?php
require_once(dirname(__FILE__) . "/../objects/quiz-game/quiz-game-highscore.php");

class HighScoreFunctions
{
	public static function createJSONFile(PDO $db, QuizGameHighscore $quizGameHighscore, int $quizGameId, string $path, string $timespan): void
	{
		$resultList = $quizGameHighscore->getList(false, null, $quizGameId, $timespan);
		
		if (!isset($resultList))
		{
			onError($db, "Unable to get quiz game highscore.");
		}
		
		if ($timespan === 'allTime')
		{
			$fileName = 'high-score-all-time.json';
		}
		else
		{
			$fileName = 'high-score-' . $timespan . '.json';
		}
		
		$highscores = [];
		
		foreach ($resultList as $value)
		{
			$highscores[] = [
				'nickname' => $value['name'],
				'score' => $value['score'],
				'correctRate' => $value['correctRate'],
				'createdAt' => $value['createdAt']
			];
		}
		
		$json = [];
		$json['highScore'] = $highscores;
		
		$date = new DateTime('now', new DateTimeZone('UTC'));
		$json['updated'] =  $date->format('Y-m-d\TH:i:s\Z');
		
		FileFunctions::createOrUpdateJSONFile(APP_ID, $path, $fileName, $json);
	}
	
	/**
	 * @param DateTime $startOf
	 * @param mixed $highScore
	 * @return mixed
	 *
	 * // sort highscore descending
	 * usort($highScore, function ($a, $b) {
	 * return $b['score'] <=> $a['score'];
	 * });
	 *
	 * if ($timespan === 'weekly')
	 * {
	 * // Week begin (Monday 00:00 o' clock)
	 * $startOfWeek = new DateTime('monday this week');
	 * $highScore = getFilter($startOfWeek, $highScore); // set time to 00:00:00
	 * }
	 * else if ($timespan === 'monthly')
	 * {
	 * // Month begin (1. day of month at 00:00 o'clock)
	 * $startOfMonth = new DateTime('first day of this month');
	 * $highScore = getFilter($startOfMonth, $highScore);
	 * }
	 *
	 * // Top MAX_GAME_HIGHSCORE_COUNT highscore
	 * $highScore = array_slice($highScore, 0, QuizGameHighscore::MAX_GAME_HIGHSCORE_COUNT);
	 */
	public static function getFilter(DateTime $startOf, mixed $highScore): mixed
	{
		$startOf->setTime(0, 0);
		
		$filterThis = function ($entry) use ($startOf): bool {
			try
			{
				if (!isset($entry['createdAt']))
				{
					return false;
				}
				$entryDate = new DateTime($entry['createdAt']);
				return $entryDate >= $startOf;
			}
			catch (Exception $e)
			{
				onError($e->getMessage());
			}
		};
		
		return array_filter($highScore, $filterThis);
	}
}