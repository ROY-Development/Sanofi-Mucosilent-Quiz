<?php

// set your default time-zone
date_default_timezone_set('Europe/Berlin');

class ZipFTPHighScoreFunctions
{
	public const int MAX_GAME_HIGHSCORE_COUNT = 50;
	
	public static function setBaseHeader(): void
	{
		header("Content-Type: application/json; charset=UTF-8");
		header("Access-Control-Allow-Methods: GET, POST, DELETE");
		header("Access-Control-Max-Age: 3600");
		header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
	}
	
	public static function updateAll(
		?string $nickname = null,
		?int $score = null,
		?float $correctRate = null,
		?string $createdAt = null
	): void
	{
		$weekly = self::loadJSONFile('', 'high-score-weekly.json');
		$monthly = self::loadJSONFile('', 'high-score-monthly.json');
		$allTime = self::loadJSONFile('', 'high-score-all-time.json');
		
		if (!isset($weekly['highScore']))
		{
			$weekly['highScore'] = [];
		}
		if (!isset($monthly['highScore']))
		{
			$monthly['highScore'] = [];
		}
		if (!isset($allTime['highScore']))
		{
			$allTime['highScore'] = [];
		}
		
		$combined = array_merge($allTime['highScore'], $monthly['highScore'], $weekly['highScore']);
		
		if (
			isset($nickname) &&
			isset($score) &&
			isset($correctRate) &&
			isset($createdAt)
		)
		{
			// Add new entry
			$combined[] = [
				'nickname' => $nickname,
				'score' => $score,
				'correctRate' => $correctRate,
				'createdAt' => $createdAt
			];
		}
		
		// remove duplicates by nickname + score + correctRatio + createdAt
		// $combined = array_unique($combined, SORT_REGULAR);
		$combined = array_map("unserialize", array_unique(array_map("serialize", $combined)));
		
		// sort and limit at self:MAX_GAME_HIGHSCORE_COUNT
		usort($combined, fn($a, $b) => $b['score'] <=> $a['score']);
		
		$now = (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z');
		
		// Week begin (Monday 00:00 o' clock)
		$startOfWeek = new DateTime('monday this week');
		$highScore = array_slice(self::getFilter($startOfWeek, $combined), 0, self::MAX_GAME_HIGHSCORE_COUNT); // set time to 00:00:00
		
		self::createOrUpdateJSONFile('', 'high-score-weekly.json', ['highScore' => $highScore, 'updated' => $now]);
		
		// Month begin (1. day of month at 00:00 o'clock)
		$startOfMonth = new DateTime('first day of this month');
		$highScore = array_slice(self::getFilter($startOfMonth, $combined), 0, self::MAX_GAME_HIGHSCORE_COUNT);
		
		self::createOrUpdateJSONFile('', 'high-score-monthly.json', ['highScore' => $highScore, 'updated' => $now]);
		
		$highScore = array_slice($combined, 0, self::MAX_GAME_HIGHSCORE_COUNT);
		
		self::createOrUpdateJSONFile('', 'high-score-all-time.json', ['highScore' => $highScore, 'updated' => $now]);
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
	 * // Top self::MAX_GAME_HIGHSCORE_COUNT highscore
	 * $highScore = array_slice($highScore, 0, self::MAX_GAME_HIGHSCORE_COUNT);
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
	
	public static function getBasePath(): string
	{
		return dirname(__FILE__) . "/../../uploads";
	}
	
	public static function loadJSONFile(
		string $path,
		string $fileName
	): mixed
	{
		$basePath = self::getBasePath();
		$fileDir = $basePath . DIRECTORY_SEPARATOR . (strlen($path) > 0 ? $path . DIRECTORY_SEPARATOR : '');
		$filePath = $fileDir . $fileName;
		
		if (!file_exists($filePath))
		{
			return null; // oder throw new \Exception("Datei nicht gefunden: $filePath");
		}
		
		$fileContents = @file_get_contents($filePath);
		
		return json_decode($fileContents, true);
	}
	
	public static function createOrUpdateJSONFile(
		string $path,
		string $fileName,
		mixed  $jsonData
	): void
	{
		$basePath = self::getBasePath();
		$fileDir = $basePath . DIRECTORY_SEPARATOR . (strlen($path) > 0 ? $path . DIRECTORY_SEPARATOR : '');
		
		self::checkOrCreatePath($path);
		
		$encodeJSON = self::encodeFileBodyJSON($jsonData);
		
		@file_put_contents($fileDir . $fileName, $encodeJSON);
	}
	
	public static function checkOrCreatePath(string $path): void
	{
		$basePath = self::getBasePath();
		
		if (is_dir($basePath . DIRECTORY_SEPARATOR . $path))
		{
			return;
		}
		
		@mkdir($basePath . DIRECTORY_SEPARATOR . $path, 0777, true);
	}
	
	public static function encodeFileBodyJSON($data): array|string|null
	{
		return preg_replace_callback(
			'/^(?: {4})+/m',
			function ($m) {
				return str_repeat("\t", strlen($m[0]) / 4); // replace spaces with tabs
			},
			json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
		);
	}
}