<?php

class UtilJSON
{
	public static function decodeFileBodyJSON(string $json): mixed
	{
		return json_decode($json, true);
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