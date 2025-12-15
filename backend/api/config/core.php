<?php

// set your default time-zone
date_default_timezone_set('Europe/Berlin');

$rootUrl = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . "{$_SERVER['HTTP_HOST']}";

if (str_contains($rootUrl, 'localhost'))
{
	error_reporting(E_ALL);
}
else
{
	error_reporting(E_COMPILE_ERROR);
}

const APP_ID = 'roy-50-50-speed-quiz-game';
const HOST_NAME = 'editor-speed-quiz.r-o-y.de';
const SYSTEM_CHARSET = 'UTF-8';

const SPEED_QUIZ_HIGHSCORE_ENCRYPTION_KEY = 'estpedqizkj#?';
const COMPANY_SPEED_QUIZ_ENCRYPTION_KEY = 'company-speed-quiz-y#!';
