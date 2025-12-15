<?php

const APP_ROY_TOOL = 'roy-tool';
const APP_ROY_EDITOR = 'roy-editor';
const APP_ROY_EDITOR_BACKEND = 'roy-editor-backend';
const APP_ROY_EDITOR_ROY_50_50_SPEED_QUIZ_GAME = 'roy-editor-roy-50-50-speed-quiz-game';
const APP_QR_EXPLORE = 'qr-explore';
const APP_BEE = 'bee';
const APP_BEE_BACKEND = 'bee-backend';
const APP_BEE_STAGE = 'bee-stage';
const APP_BEE_STAGE_BACKEND = 'bee-stage-backend';
const APP_ROY_50_50_SPEED_QUIZ = 'roy-50-50-speed-quiz';
const APP_ROY_50_50_SPEED_QUIZ_GAME = 'roy-50-50-speed-quiz-game';

const APP_CONFIG = array(
	array('id' => APP_ROY_TOOL, 'url' => 'https://tool.r-o-y.de'),
	array('id' => APP_ROY_EDITOR, 'url' => 'https://editor.r-o-y.de'),
	array('id' => APP_QR_EXPLORE, 'url' => 'https://editor.r-o-y.de'),
	array('id' => APP_BEE, 'url' => 'https://bee.r-o-y.de'),
	array('id' => APP_BEE_STAGE, 'url' => 'https://bee-stage.r-o-y.de'),
	array('id' => APP_ROY_50_50_SPEED_QUIZ, 'url' => 'https://editor-speed-quiz.r-o-y.de'),
	array('id' => APP_ROY_50_50_SPEED_QUIZ_GAME, 'url' => 'https://editor-speed-quiz.r-o-y.de'),
);

const APP_CONFIG_DEV = array(
	array('id' => APP_ROY_TOOL, 'url' => 'http://localhost/r-o-y/ROY-Tool/dist'),
	array('id' => APP_ROY_EDITOR, 'url' => 'https://localhost/r-o-y/ROY-Editor/dist'),
	array('id' => APP_QR_EXPLORE, 'url' => 'https://localhost/r-o-y/ROY-Editor/dist'),
	array('id' => APP_BEE, 'url' => 'http://localhost/r-o-y/ROY-Bee/dist'),
	array('id' => APP_BEE_STAGE, 'url' => 'http://localhost/r-o-y/ROY-Bee/dist'),
	array('id' => APP_ROY_50_50_SPEED_QUIZ, 'url' => 'http://localhost:4300'), // , 'url' => 'https://localhost/r-o-y/ROY-Speed-Quiz/dist')
	array('id' => APP_ROY_50_50_SPEED_QUIZ_GAME, 'url' => 'http://localhost:4300'), // , 'url' => 'https://localhost/r-o-y/ROY-Speed-Quiz/dist')
);