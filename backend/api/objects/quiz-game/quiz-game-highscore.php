<?php
require_once(dirname(__FILE__) . "/../../objects/quiz-game/quiz-game.php");

class QuizGameHighscore
{
	public const int MAX_GAME_HIGHSCORE_COUNT = 50;
	
	private PDO $conn;
	
	public int $id;
	public ?int $quizGameId;
	public string $name;
	public int $score;
	public float $correctRate;
	public string $createdAt;
	public string $updatedAt;
	
	public function __construct(PDO $db)
	{
		$this->conn = $db;
	}
	
	public function create(): bool
	{
		$query = "INSERT INTO app_quiz_game_highscores (
                    quiz_game_id,
					name,
					score,
                    correct_rate
				)
			VALUES (
			        :quizGameId,
					:name,
			        :score,
			        :correctRate
				)";
		
		$stmt = $this->conn->prepare($query);
		
		$this->name = htmlspecialchars(stripslashes($this->name));
		
		$stmt->bindParam(':quizGameId', $this->quizGameId, PDO::PARAM_INT);
		$stmt->bindParam(':name', $this->name);
		$stmt->bindParam(':score', $this->score, PDO::PARAM_INT);
		$stmt->bindParam(':correctRate', $this->correctRate, PDO::PARAM_STR);
		
		if ($stmt->execute())
		{
			$this->id = $this->conn->lastInsertId();
			return true;
		}
		
		return false;
	}
	
	public function update(): bool
	{
		$query = "UPDATE app_quiz_game_highscores
				SET
				    quiz_game_id = :quizGameId,
				    name = :name,
				    score = :score,
				    correct_rate = :correctRate
				WHERE id = :id";
		
		$stmt = $this->conn->prepare($query);
		
		$this->name = htmlspecialchars(stripslashes($this->name));
		
		$stmt->bindParam(':quizGameId', $this->quizGameId, PDO::PARAM_INT);
		$stmt->bindParam(':name', $this->name);
		$stmt->bindParam(':score', $this->score, PDO::PARAM_INT);
		$stmt->bindParam(':correctRate', $this->correctRate, PDO::PARAM_STR);
		
		$stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
		
		if ($stmt->execute())
		{
			return true;
		}
		
		return false;
	}
	
	public function get($isAdmin = false): ?array
	{
		$query = $this->getBaseQuery($isAdmin);
		$query .= " WHERE app_quiz_game_highscores.id = :id";
		
		$stmt = $this->conn->prepare($query);
		
		$stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
		
		$stmt->execute();
		
		$num = $stmt->rowCount();
		
		if ($num === 1)
		{
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			
			return $this->fetchRow($row);
		}
		
		return null;
	}
	
	public function getList(
		bool    $isAdmin = false,
		?array  $idFilterList = null,
		?int    $quizGameId = null,
		?string $timespan = null // 'allTime' | 'weekly' | 'monthly'
	): array
	{
		$query = $this->getBaseQuery($isAdmin);
		$query .= " WHERE 1 = 1 ";
		
		if (isset($idFilterList))
		{
			$inQuery = implode(',', array_fill(0, count($idFilterList), '?'));
			
			$query .= " AND app_quiz_game_highscores.id IN (" . $inQuery . ")";
		}
		
		if (isset($quizGameId))
		{
			if ($quizGameId === 0)
			{
				$query .= " AND app_quiz_game_highscores.quiz_game_id IS NULL";
			}
			else
			{
				$query .= " AND app_quiz_game_highscores.quiz_game_id = ?";
			}
		}
		
		$dateFilter = null;
		if ($timespan === 'weekly')
		{
			$startOfWeek = new DateTime('monday this week');
			$dateFilter = $startOfWeek->format('Y-m-d 00:00:00');
			$query .= " AND app_quiz_game_highscores.created_at >= ?";
		}
		elseif ($timespan === 'monthly')
		{
			$startOfMonth = new DateTime('first day of this month');
			$dateFilter = $startOfMonth->format('Y-m-d 00:00:00');
			$query .= " AND app_quiz_game_highscores.created_at >= ?";
		}
		
		if (isset($timespan)) // get top self::MAX_GAME_HIGHSCORE_COUNT if timespan is set
		{
			$query .= " ORDER BY app_quiz_game_highscores.score DESC";
			$query .= " LIMIT " . self::MAX_GAME_HIGHSCORE_COUNT;
		}
		else
		{
			$query .= " ORDER BY app_quiz_game_highscores.id";
		}
		
		$stmt = $this->conn->prepare($query);
		
		$index = 1;
		if (isset($idFilterList))
		{
			// bind value is 1-indexed, so $k+1
			foreach ($idFilterList as $id)
			{
				$stmt->bindValue($index++, $id, PDO::PARAM_INT);
			}
		}
		
		if (isset($quizGameId) && $quizGameId !== 0)
		{
			$stmt->bindValue($index++, $quizGameId, PDO::PARAM_INT);
		}
		
		if (isset($dateFilter))
		{
			$stmt->bindValue($index++, $dateFilter);
		}
		
		$stmt->execute();
		
		$num = $stmt->rowCount();
		
		$result = array();
		
		if ($num > 0)
		{
			while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
			{
				$result[] = $this->fetchRow($row);
			}
		}
		
		return $result;
	}
	
	public function delete(): bool
	{
		$query = "DELETE FROM app_quiz_game_highscores WHERE id = :id";
		
		$stmt = $this->conn->prepare($query);
		
		$stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
		
		if ($stmt->execute())
		{
			return true;
		}
		
		return false;
	}
	
	private function fetchRow($row): array
	{
		$result = [];
		
		$result['id'] = intval($row['id']);
		$result['quizGameId'] = intval($row['quizGameId']);
		$result['name'] = html_entity_decode($row['name']);
		$result['score'] = intval($row['score']);
		$result['correctRate'] = floatval($row['correctRate']);
		$result['createdAt'] = html_entity_decode($row['createdAt']);
		$result['updatedAt'] = html_entity_decode($row['updatedAt']);
		
		return $result;
	}
	
	private function fetchRowToThis($row): void
	{
		$this->id = intval($row['id']);
		$this->quizGameId = intval($row['quizGameId']);
		$this->name = html_entity_decode($row['name']);
		$this->score = intval($row['score']);
		$this->correctRate = floatval($row['correctRate']);
		$this->createdAt = $row['createdAt'] ?? null;
		$this->updatedAt = $row['updatedAt'];
	}
	
	private function getBaseQuery(
		bool $isAdmin = false
	): string
	{
		$queryAdmin = ''; // $isAdmin ? "" : "";
		
		return "SELECT
				app_quiz_game_highscores.id,
				app_quiz_game_highscores.quiz_game_id AS quizGameId,
				app_quiz_game_highscores.name,
				app_quiz_game_highscores.score,
				app_quiz_game_highscores.correct_rate AS correctRate,
				DATE_FORMAT(CONVERT_TZ(app_quiz_game_highscores.created_at, @@session.time_zone, '+00:00'), '%Y-%m-%dT%H:%i:%sZ') AS createdAt,
				DATE_FORMAT(CONVERT_TZ(app_quiz_game_highscores.updated_at, @@session.time_zone, '+00:00'), '%Y-%m-%dT%H:%i:%sZ') AS updatedAt
       			$queryAdmin
				FROM app_quiz_game_highscores
				";
	}
	
	public static function getJoinQuery(string $key = 'quizGameCategory'): string
	{
		return "
			" . $key . "s.id AS \"" . $key . "Id\",
			" . $key . "s.quiz_game_id AS \"" . $key . "QuizGameId\",
			" . $key . "s.name AS \"" . $key . "Name\",
			" . $key . "s.score AS \"" . $key . "Score\",
			" . $key . "s.correct_rate AS \"" . $key . "CorrectRate\",
			DATE_FORMAT(CONVERT_TZ(" . $key . "s.created_at, @@session.time_zone, '+00:00'), '%Y-%m-%dT%H:%i:%sZ') AS \"" . $key . "CreatedAt\",
			DATE_FORMAT(CONVERT_TZ(" . $key . "s.updated_at, @@session.time_zone, '+00:00'), '%Y-%m-%dT%H:%i:%sZ') AS \"" . $key . "UpdatedAt\"
		";
	}
	
	public static function getArrayFromRow(array $row, string $key = 'quizGameCategory'): ?array
	{
		$result = null;
		
		if (isset($row[$key . 'Id']))
		{
			$result = [];
			$result['id'] = intval($row[$key . 'Id']);
			$result['quizGameId'] = intval($row[$key . 'QuizGameId']);
			$result['name'] = $row[$key . 'Name'];
			$result['score'] = intval($row[$key . 'Score']);
			$result['correctRate'] = floatval($row[$key . 'CorrectRate']);
			$result['createdAt'] = $row[$key . 'CreatedAt'];
			$result['updatedAt'] = $row[$key . 'UpdatedAt'];
		}
		
		return $result;
	}
}
