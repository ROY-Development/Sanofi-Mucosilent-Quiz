<?php
require_once(dirname(__FILE__) . "/app-config.php");

const APP_UPLOAD_CONFIG = array(
	array('id' => APP_ROY_EDITOR, 'url' => '../roy-editor/uploads'),
	array('id' => APP_ROY_EDITOR_BACKEND, 'url' => '../roy-editor/uploads'),
	array('id' => APP_QR_EXPLORE, 'url' => '../roy-editor/uploads'),
	array('id' => APP_ROY_TOOL, 'url' => '../roy-tool/uploads'),
	array('id' => APP_ROY_50_50_SPEED_QUIZ, 'url' => '../roy-speed-quiz/uploads'),
	array('id' => APP_ROY_50_50_SPEED_QUIZ_GAME, 'url' => '../roy-speed-quiz/uploads'),
);

const APP_UPLOAD_CONFIG_DEV = array(
	array('id' => APP_ROY_EDITOR, 'url' => '../../ROY-Editor/backend/uploads'),
	array('id' => APP_ROY_EDITOR_BACKEND, 'url' => '../../ROY-Editor/backend/uploads'),
	array('id' => APP_QR_EXPLORE, 'url' => '../../ROY-Editor/backend/uploads'),
	array('id' => APP_ROY_TOOL, 'url' => '../../ROY-Tool/backend/uploads'),
	array('id' => APP_ROY_50_50_SPEED_QUIZ, 'url' => '../../ROY-Speed-Quiz/backend/uploads'),
	array('id' => APP_ROY_50_50_SPEED_QUIZ_GAME, 'url' => '../../ROY-Speed-Quiz/backend/uploads'),
);