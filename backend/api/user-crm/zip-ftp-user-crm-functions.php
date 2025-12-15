<?php

// set your default time-zone
date_default_timezone_set('Europe/Berlin');

class ZipFTPUserCrmFunctions
{
	public static function setBaseHeader(): void
	{
		header("Content-Type: application/json; charset=UTF-8");
		header("Access-Control-Allow-Methods: GET, POST, DELETE");
		header("Access-Control-Max-Age: 3600");
		header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
	}
	
	public static function getBasePath(): string
	{
		return dirname(__FILE__) . "/../../uploads";
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
}