import {inject, LOCALE_ID, NgModule, provideAppInitializer, provideBrowserGlobalErrorListeners} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {SharedModule} from './shared/shared.module';
import {PagesModule} from './pages/pages.module';
import {CoreModule} from './core/core.module';
import {firstValueFrom, tap, zip} from 'rxjs';
import {NgOptimizedImage} from '@angular/common';
import {GamesModule} from './games/games.module';
import {InitService} from './core/services/init.service';
import {AppConfig} from './app.config';
import {GameService} from './core/services/game.service';
import {map} from 'rxjs/operators';
import {GameScoreService} from './core/services/game-score.service';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		NgOptimizedImage,
		AppRoutingModule,
		CoreModule,
		PagesModule,
		SharedModule,
		GamesModule
	],
	providers: [
		// AppBackendConfigService,
		provideAppInitializer(() => {
			const initializerFn = (AppModule.initializeAppFactory)(
				inject(InitService),
				inject(GameService),
				//inject(GameScoreBackendService),
				inject(GameScoreService)
			);
			return initializerFn();
		}),
		{provide: LOCALE_ID, useValue: AppConfig.defaultLocale},
		provideHttpClient(withInterceptorsFromDi()),
		provideBrowserGlobalErrorListeners()
	],
	bootstrap: [AppComponent]
})
export class AppModule
{
	public static initError: string | null = null;
	
	public static initializeAppFactory(
		initService: InitService,
		gameService: GameService,
		//gameScoreBackendService: GameScoreBackendService,
		gameScoreService: GameScoreService
		//userBackendService: UserBackendService
	)
	{
		return async (): Promise<void> => {
			try
			{
				await firstValueFrom(
					zip(
						//gameScoreBackendService.getHighScore(),
						gameService.getBaseConfig(),
						//	userBackendService.get(initService.appQueryParams.userId),
						initService.getBaseConfig()
					).pipe(
						map(([
							     //highScores,
							     gameConfig,
							     baseConfig
						     ]) => ({
							//highScores,
							gameConfig,
							baseConfig
						})),
						tap(({
							     // highScores,
							     //	userData,
							     gameConfig,
							     baseConfig
						     }: {
							//highScores: Array<GameScoreModel> | null,
							gameConfig: any,
							baseConfig: any
						}) => {
							/*console.log(
								highScoreResult,
								//	userData,
								baseConfig
							);*/
							if (gameConfig && baseConfig)
							{
								//
							}
							
							gameScoreService.setScores([]);
							/*if (highScores)
							{
								gameScoreService.setScores(highScores);
							}*/
						})
					));
			}
			catch (error)
			{
				AppModule.initError = 'An error occurred while getting the values. Please check internet connection and do a restart.';
				console.error('An error occurred while getting the values:', error);
				// throw error; // <-- don't stop the app with this at initialization
			}
		};
	}
}






