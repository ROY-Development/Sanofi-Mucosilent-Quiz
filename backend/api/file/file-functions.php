<?php
require_once(dirname(__FILE__) . "/../config/core.php");
require_once(dirname(__FILE__) . "/../utils/util-json.php");
require_once(dirname(__FILE__) . "/../config/app-upload-config.php");

class FileFunctions
{
	private static function isProduction(): bool
	{
		$serverHost = $_SERVER['HTTP_HOST'];
		return (str_contains($serverHost, HOST_NAME));
	}
	
	public static function getRootPath(): string
	{
		return dirname(__FILE__) . "/../../";
	}
	
	public static function isAvailableAppId(string $appId): bool
	{
		$config = self::isProduction() ? APP_UPLOAD_CONFIG : APP_UPLOAD_CONFIG_DEV;
		
		if (in_array($appId, array_column($config, 'id')))
		{
			return true;
		}
		
		return false;
	}
	
	public static function getAppUrl(string $appId, ?array $urlReplace = null): ?string
	{
		if (!self::isAvailableAppId($appId))
		{
			return null;
		}
		
		$uploadConfig = self::isProduction() ? APP_UPLOAD_CONFIG : APP_UPLOAD_CONFIG_DEV;
		
		foreach ($uploadConfig as $app)
		{
			if ($app['id'] === $appId)
			{
				$url = $app['url'];
				
				// multiple replacements [ ['{userId}', '{12345}'], ['lang', 'de'] ]
				if (
					is_array($urlReplace) && count($urlReplace) === 2 &&
					is_array($urlReplace[0]) && is_array($urlReplace[1])
				)
				{
					return str_replace($urlReplace[0], $urlReplace[1], $url);
				}
				
				// single replacement ['{userId}', '12345']
				if (is_array($urlReplace) && count($urlReplace) === 2)
				{
					return str_replace($urlReplace[0], $urlReplace[1], $url);
				}
				
				return $url;
				
			}
		}
		
		return null;
	}
	
	public static function convertFileName($fileName): string
	{
		// replace problematic characters with a hyphen
		$fileName = preg_replace('/["\'\/&?%#:;|<>{}\[\]=+*!@^~,$()§]/', '-', $fileName);
		
		// replace spaces with hyphens
		$fileName = str_replace(' ', '-', $fileName);
		
		// make the filename HTML-safe and remove backslashes
		$fileName = htmlspecialchars(stripslashes($fileName));
		
		// limit the filename to 64 characters
		return substr($fileName, 0, 64);
	}
	
	/**
	 * @throws Exception
	 */
	public static function uploadFile(
		string $appId,
		string $path,
		string $fileName,
		array  $file,
		?array $urlReplace = null
	): string
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$fileDir = $basePath . '/' . (strlen($path) > 0 ? $path . '/' : '');
		$fileName = self::convertFileName($fileName);
		
		self::checkOrCreatePath($appId, $path, $urlReplace);
		
		$tmp_name = $file['tmp_name'];
		move_uploaded_file($tmp_name, $fileDir . $fileName);
		
		return ''; // $filePath;
	}
	
	/**
	 * @throws Exception
	 */
	public static function uploadBinaryDataFile(
		string $appId,
		string $path,
		string $fileName,
		mixed  $binaryData,
		?array $urlReplace = null
	): void
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$fileDir = $basePath . '/' . (strlen($path) > 0 ? $path . '/' : '');
		$fileName = self::convertFileName($fileName);
		
		self::checkOrCreatePath($appId, $path, $urlReplace);
		
		@file_put_contents($fileDir . $fileName, $binaryData);
	}
	
	public static function createOrUpdateJSONFile(
		string $appId,
		string $path,
		string $fileName,
		mixed  $jsonData,
		?array $urlReplace = null
	): void
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$fileDir = $basePath . '/' . (strlen($path) > 0 ? $path . '/' : '');
		$fileName = self::convertFileName($fileName);
		
		self::checkOrCreatePath($appId, $path, $urlReplace);
		
		$encodeJSON = UtilJSON::encodeFileBodyJSON($jsonData);
		
		@file_put_contents($fileDir . $fileName, $encodeJSON);
	}
	
	public static function loadJSONFile(
		string $appId,
		string $path,
		string $fileName,
		?array $urlReplace = null
	): mixed
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$fileDir = $basePath . '/' . (strlen($path) > 0 ? $path . '/' : '');
		$fileName = self::convertFileName($fileName);
		$filePath = $fileDir . $fileName;
		
		if (!file_exists($filePath))
		{
			return null; // oder throw new \Exception("Datei nicht gefunden: $filePath");
		}
		
		$fileContents = @file_get_contents($filePath);
		
		return UtilJSON::decodeFileBodyJSON($fileContents);
	}
	
	public static function createOrUpdateDebugTextFile(
		string $appId,
		string $path,
		string $fileName,
		string $text,
		?array $urlReplace = null
	): void
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$fileDir = $basePath . '/' . (strlen($path) > 0 ? $path . '/' : '');
		$fileName = self::convertFileName($fileName);
		
		self::checkOrCreatePath($appId, $path, $urlReplace);
		
		$current = @file_get_contents($fileDir . $fileName);
		
		$current .= $text . "\n";
		
		@file_put_contents($fileDir . $fileName, $current);
	}
	
	public static function renameFile(
		string $appId,
		string $path,
		string $fromFileName,
		string $toFileName,
		?array $urlReplace = null
	): void
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$fileDir = $basePath . '/' . (strlen($path) > 0 ? $path . '/' : '');
		$fromFileName = self::convertFileName($fromFileName);
		$toFileName = self::convertFileName($toFileName);
		
		if (is_dir($fileDir))
		{
			if (file_exists($fileDir . $fromFileName))
			{
				rename($fileDir . $fromFileName, $fileDir . $toFileName);
			}
		}
	}
	
	public static function copyFolder(
		string $appId,
		string $srcPath,
		string $dstPath,
		?array $urlReplace = null
	): void
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$srcPath = $basePath . '/' . $srcPath;
		$dstPath = $basePath . '/' . $dstPath;
		
		$dir = opendir($srcPath); // open the source directory
		@mkdir($dstPath, 0777); // Make the destination directory if not exist
		
		// Loop through the files in source directory
		while ($file = readdir($dir))
		{
			if (($file != '.') && ($file != '..'))
			{
				if (is_dir($srcPath . '/' . $file))
				{
					// Recursively calling custom copy function
					// for sub directory
					self::copyFolder($appId, $srcPath . '/' . $file, $dstPath . '/' . $file, $urlReplace);
				}
				else
				{
					copy($srcPath . '/' . $file, $dstPath . '/' . $file);
				}
			}
		}
		
		closedir($dir);
	}
	
	public static function deleteFile(
		string $appId,
		string $path,
		string $fileName,
		?array $urlReplace = null
	): void
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$fileDir = $basePath . '/' . (strlen($path) > 0 ? $path . '/' : '');
		$fileName = self::convertFileName($fileName);
		
		if (is_dir($fileDir) && file_exists($fileDir . $fileName))
		{
			@unlink($fileDir . $fileName);
		}
	}
	
	public static function deleteFolder(
		string $appId,
		string $path,
		?array $urlReplace = null
	): void
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$fileDir = $basePath . '/' . (strlen($path) > 0 ? $path . '/' : '');
		
		self::removeFullyDir($fileDir);
	}
	
	private static function removeFullyDir($src): void
	{
		if (file_exists($src))
		{
			$dir = opendir($src);
			while (false !== ($file = readdir($dir)))
			{
				if (($file != '.') && ($file != '..'))
				{
					$full = $src . '/' . $file;
					if (is_dir($full))
					{
						self::removeFullyDir($full);
					}
					else
					{
						unlink($full);
					}
				}
			}
			closedir($dir);
			rmdir($src);
		}
	}
	
	public static function checkOrCreatePath(string $appId, string $path, ?array $urlReplace = null): void
	{
		$basePath = self::getRootPath() . self::getAppUrl($appId, $urlReplace);
		$fileDir = $basePath . '/' . $path;
		
		if (is_dir($fileDir))
		{
			return;
		}
		
		@mkdir($fileDir, 0777, true);
	}
}