<?php
require_once(dirname(__FILE__) . "/core.php");

class Database
{
	public ?PDO $conn;
	
	private string $host;
	private string $dbName;
	private string $username;
	private string $password;
	private int $port;
	private bool $isProduction;
	
	public function __construct($isProduction = false)
	{
		$serverHost = $_SERVER['HTTP_HOST'];
		$this->isProduction = $isProduction || (str_contains($serverHost, HOST_NAME));
		
		$this->host = $this->isProduction ? "rdbms.strato.de" : "db";
		$this->dbName = $this->isProduction ? "dbs12256739" : "qr_explore";
		$this->username = $this->isProduction ? "dbu1252524" : "root";
		$this->password = $this->isProduction ? "bfLPd6GGYZgpqmJ!" : "";
		$this->port = 3306;
	}
	
	public function getConnection(): PDO
	{
		$this->conn = null;
		
		try
		{
			$this->conn = new PDO(
				"mysql:host=$this->host;" .
				"port=$this->port;dbname=$this->dbName;" .
				"charset=utf8mb4",
				$this->username,
				$this->password,
				array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4")
			);
		}
		catch (PDOException $exception)
		{
			echo "Connection error: " . $exception->getMessage();
			exit();
		}
		
		return $this->conn;
	}
}

?>