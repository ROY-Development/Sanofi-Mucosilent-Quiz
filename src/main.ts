import {platformBrowser} from '@angular/platform-browser';
import {AppModule} from './app/app.module';

const urlParams = new URLSearchParams(window.location.search);
const qzId: string | null = urlParams.get('qz');
const isScormPackage: boolean = 'scorm-app' in window && (window as any)['scorm-app'];

platformBrowser([
	{provide: 'APP_QUIZ_ID', useValue: qzId},
	{provide: 'IS_SCORM_PACKAGE', useValue: isScormPackage}
]).bootstrapModule(AppModule, {})
	.catch(err => console.error(err));
