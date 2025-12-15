import {AppConfig} from '../../../app.config';
import {UtilObj} from '../../utils/util-obj';
import {ConfigButtonModel} from './config-button.model';
import {ConfigContainerModel} from './config-container.model';

export class QuizGameScreenHighscoreModel
{
	// public radius: number = AppConfig.quizGameDefaultButtonRadiusPx;
	public btnFilter: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	public btnClose: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	public btnIcon: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	public userRow: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({
		fontColor: AppConfig.quizGameDefaultFontColorMain,
		bgColor: AppConfig.quizGameDefaultTableBackgroundColor,
		radius: AppConfig.quizGameDefaultTableRadiusPx,
		border: AppConfig.quizGameDefaultTableBorderPx,
		borderColor: AppConfig.quizGameDefaultTableBorderColor
	});
	
	constructor(
		public titleFontColor: string = AppConfig.quizGameDefaultFontColorTitle,
		public titleAlignment: string = AppConfig.quizGameDefaultTitleAlignment,
		public curFilterFontColor: string = AppConfig.quizGameDefaultFontColorMain,
		public fCTitleHead: string = AppConfig.quizGameDefaultFontColorMain,
		public tableFontColor: string = AppConfig.quizGameDefaultFontColorMain,
		public tableColorBg: string = AppConfig.quizGameDefaultTableBackgroundColor,
		public tableColorBgRowOdd: string = AppConfig.quizGameDefaultTableBackgroundRowOddColor,
		public tableRadius: number = AppConfig.quizGameDefaultTableRadiusPx,
		public tableBorder: number = AppConfig.quizGameDefaultTableBorderPx,
		public tableBorderColor: string = AppConfig.quizGameDefaultTableBorderColor,
		public fontColorRank: string = AppConfig.quizGameDefaultTableRankFontColor,
		public rankColorBackground1: string = AppConfig.quizGameDefaultTableRankBackgroundColor1,
		public rankColorBackground2: string = AppConfig.quizGameDefaultTableRankBackgroundColor2,
		public rankColorBackground3: string = AppConfig.quizGameDefaultTableRankBackgroundColor3,
		public rankColorBackground4: string = AppConfig.quizGameDefaultTableRankBackgroundColor4,
		public rankAniDuration: number = AppConfig.quizGameDefaultTableRankAniDuration,
		public rankRadius: number = AppConfig.quizGameDefaultTableRankRadiusPx,
		public rankBorder: number = AppConfig.quizGameDefaultTableRankBorderPx,
		public rankBorderColor: string = AppConfig.quizGameDefaultTableRankBorderColor,
		public userRowFontColorRank: string = AppConfig.quizGameDefaultTableRankFontColor,
		public userRowRankColorBackground1: string = AppConfig.quizGameDefaultTableRankBackgroundColor1,
		public userRowRankColorBackground2: string = AppConfig.quizGameDefaultTableRankBackgroundColor2,
		public userRowRankColorBackground3: string = AppConfig.quizGameDefaultTableRankBackgroundColor3,
		public userRowRankColorBackground4: string = AppConfig.quizGameDefaultTableRankBackgroundColor4,
		public userRowRankAniDuration: number = AppConfig.quizGameDefaultTableRankAniDuration,
		public userRowRankRadius: number = AppConfig.quizGameDefaultTableRankRadiusPx,
		public userRowRankBorder: number = AppConfig.quizGameDefaultTableRankBorderPx,
		public userRowRankBorderColor: string = AppConfig.quizGameDefaultTableRankBorderColor
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): QuizGameScreenHighscoreModel
	{
		if (!jsonObj)
		{
			return new QuizGameScreenHighscoreModel();
		}
		
		const model = new QuizGameScreenHighscoreModel(
			jsonObj['titleFontColor'] ?? AppConfig.quizGameDefaultFontColorTitle,
			jsonObj['titleAlignment'] ?? AppConfig.quizGameDefaultTitleAlignment,
			jsonObj['curFilterFontColor'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['fCTitleHead'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['tableFontColor'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['tableColorBg'] ?? AppConfig.quizGameDefaultTableBackgroundColor,
			jsonObj['tableColorBgRowOdd'] ?? AppConfig.quizGameDefaultTableBackgroundRowOddColor,
			UtilObj.isset(jsonObj['tableRadius']) ? parseInt(jsonObj['tableRadius'], 10) : AppConfig.quizGameDefaultTableRadiusPx,
			UtilObj.isset(jsonObj['tableBorder']) ? parseInt(jsonObj['tableBorder'], 10) : AppConfig.quizGameDefaultTableBorderPx,
			jsonObj['tableBorderColor'] ?? AppConfig.quizGameDefaultTableBorderColor,
			jsonObj['fontColorRank'] ?? AppConfig.quizGameDefaultTableRankFontColor,
			jsonObj['rankColorBackground1'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor1,
			jsonObj['rankColorBackground2'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor2,
			jsonObj['rankColorBackground3'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor3,
			jsonObj['rankColorBackground4'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor4,
			UtilObj.isset(jsonObj['rankAniDuration']) ? parseInt(jsonObj['rankAniDuration'], 10) : AppConfig.quizGameDefaultTableRankAniDuration,
			UtilObj.isset(jsonObj['rankRadius']) ? parseInt(jsonObj['rankRadius'], 10) : AppConfig.quizGameDefaultTableRankRadiusPx,
			UtilObj.isset(jsonObj['rankBorder']) ? parseInt(jsonObj['rankBorder'], 10) : AppConfig.quizGameDefaultTableRankBorderPx,
			jsonObj['rankBorderColor'] ?? AppConfig.quizGameDefaultTableRankBorderColor,
			UtilObj.isset(jsonObj['userRow']) ? jsonObj['userRow']['fontColorRank'] ?? AppConfig.quizGameDefaultTableRankFontColor : AppConfig.quizGameDefaultTableRankFontColor,
			UtilObj.isset(jsonObj['userRow']) ? jsonObj['userRow']['rankColorBackground1'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor1 : AppConfig.quizGameDefaultTableRankBackgroundColor1,
			UtilObj.isset(jsonObj['userRow']) ? jsonObj['userRow']['rankColorBackground2'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor2 : AppConfig.quizGameDefaultTableRankBackgroundColor2,
			UtilObj.isset(jsonObj['userRow']) ? jsonObj['userRow']['rankColorBackground3'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor3 : AppConfig.quizGameDefaultTableRankBackgroundColor3,
			UtilObj.isset(jsonObj['userRow']) ? jsonObj['userRow']['rankColorBackground4'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor4 : AppConfig.quizGameDefaultTableRankBackgroundColor4,
			UtilObj.isset(jsonObj['userRow']) ? jsonObj['userRow']['rankAniDuration'] ?? AppConfig.quizGameDefaultTableRankAniDuration : AppConfig.quizGameDefaultTableRankAniDuration,
			UtilObj.isset(jsonObj['userRow']) ? jsonObj['userRow']['rankRadius'] ?? AppConfig.quizGameDefaultTableRankRadiusPx : AppConfig.quizGameDefaultTableRankRadiusPx,
			UtilObj.isset(jsonObj['userRow']) ? jsonObj['userRow']['rankBorder'] ?? AppConfig.quizGameDefaultTableRankBorderPx : AppConfig.quizGameDefaultTableRankBorderPx,
			UtilObj.isset(jsonObj['userRow']) ? jsonObj['userRow']['rankBorderColor'] ?? AppConfig.quizGameDefaultTableRankBorderColor : AppConfig.quizGameDefaultTableRankBorderColor
		);
		
		model.btnFilter = ConfigButtonModel.getModelFromJSON(jsonObj['btnFilter']);
		model.btnClose = ConfigButtonModel.getModelFromJSON(jsonObj['btnClose']);
		model.btnIcon = ConfigButtonModel.getModelFromJSON(jsonObj['btnIcon']);
		model.userRow = ConfigContainerModel.getModelFromJSON(jsonObj['userRow']);
		
		/*if (UtilObj.isset(jsonObj['radius']))
		{
			model.radius = parseInt(jsonObj['radius'], 10);
		}*/
		
		return model;
	}
}