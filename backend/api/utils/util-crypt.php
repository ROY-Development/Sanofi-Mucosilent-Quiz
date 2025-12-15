<?php

class UtilCrypt
{
	public static function encrypt(
		string $plaintext,
		string $encryption_key,
		string $iv16Bit = '3223448889600101',
		string $cipher = "aes-128-cbc"
	): string|false
	{
		$result = openssl_encrypt($plaintext, $cipher, $encryption_key, 0, $iv16Bit);
		
		if ($result === false)
		{
			return false;
		}
		
		return self::encodeBase64Url($result); // encode base64 URL-safe
	}
	
	public static function decrypt(
		string $cipherText,
		string $encryption_key,
		string $iv16Bit = '3223448889600101',
		string $cipher = "aes-128-cbc"
	): string|false
	{
		// revert base64 encoding
		$cipherText = self::decodeBase64Url($cipherText);
		return openssl_decrypt($cipherText, $cipher, $encryption_key, 0, $iv16Bit);
	}
	
	public static function encodeBase64Url(string $data): string
	{
		return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
	}
	
	public static function decodeBase64Url(string $data): string
	{
		// get missing remainder count if $data is to short (not a multiple of 4 like a base64 string)
		$remainder = strlen($data) % 4;
		if ($remainder) // if there is a remainder count
		{
			// add = by remainder count
			$data .= str_repeat('=', 4 - $remainder);
		}
		return base64_decode(strtr($data, '-_', '+/'));
	}
}