import {Injectable} from '@angular/core';
import {ScormConstantEnum} from './scorm-constant.enum';

@Injectable({
	providedIn: 'root'
})
export class ScormService
{
	public scormAPI: any = null;
	public scormAPIName: string = '---';
	public scormAPIType: '1.2' | '2004' | null = null;
	
	public lastCall: string = '';
	public lastResult: string = '';
	public lastError: string = '';
	
	private beforeUnload = this.onBeforeUnload.bind(this);
	
	public init(): void
	{
		this.scormAPI = this.getAPI();
		this.scormAPIName = this.scormAPI ? this.scormAPI.constructor.name : '---';
		
		if (this.scormAPI)
		{
			console.log(this.scormAPIName);
		}
	}
	
	private onBeforeUnload(event: BeforeUnloadEvent): void
	{
		if (!event)
		{
			return;
		}
		
		this.finishLMS();
		// WITH window prompt during refresh use event.returnValue
		// You can use any kind of value to event.returnValue (as listed on the right).
		// It is just coding style matter.
		// event.returnValue = null; //"Any text"; //true; //false;
	}
	
	private findAPI(win: Window): any
	{
		// Check to see if the window (win) contains the API
		// if the window (win) does not contain the API, and
		// the window (win) has a parent window, and the parent window
		// is not the same as the window (win)
		
		// Note: 500 is an arbitrary number, but should be more than sufficient
		for (let i = 0; i < 500; i++)
		{
			/*if ((<any>win).API_1484_11 != null)
			{
				this.scormAPIType = '2004';
				return (<any>win).API_1484_11;
			}*/
			
			if ((win as any).API != null)
			{
				this.scormAPIType = '1.2';
				return (win as any).API;
			}
			
			if (win.parent == null || win.parent == win)
			{
				return null;
			}
			// set the variable that represents the window being
			// searched to be the parent of the current window
			// then search for the API again
			win = win.parent;
		}
		
		return null;
	}
	
	private getAPI()
	{
		// start by looking for the API in the current window
		let theAPI = this.findAPI(window);
		
		// if the API is null (could not be found in the current window)
		// and the current window has an opener window
		if ((theAPI == null) && (window.opener != null) && (typeof (window.opener) != "undefined"))
		{
			// try to find the API in the current window’s opener
			theAPI = this.findAPI(window.opener);
		}
		
		if (theAPI == null)
		{
			//	console.log("No SCORM-API adapter was found.");
		}
		return theAPI;
	}
	
	public initLMS(): boolean
	{
		if (!this.scormAPI)
		{
			return false;
		}
		
		const value: string = this.scormAPI.LMSInitialize("");
		const isInit: boolean = value === ScormConstantEnum.SCORM_TRUE;
		
		if (isInit)
		{
			window.addEventListener('beforeunload', this.beforeUnload);
		}
		
		this.setLastCall('LMSInitialize');
		
		return isInit;
	}
	
	public getLastError(): any
	{
		if (!this.scormAPI)
		{
			return null;
		}
		
		const lastErrorCode: number = this.scormAPI.LMSGetLastError();
		const errorString = this.scormAPI.LMSGetErrorString(lastErrorCode);
		const errorDiagnostic = this.scormAPI.LMSGetDiagnostic(lastErrorCode);
		
		const lastError = {
			lastErrorCode: lastErrorCode,
			errorString: null,
			errorDiagnostic: null
		}
		if (lastErrorCode)
		{
			lastError.errorString = errorString;
			lastError.errorDiagnostic = errorDiagnostic;
		}
		
		this.lastError = lastError.errorString || '';
		
		return lastError;
	}
	
	public finishLMS(): boolean
	{
		if (!this.scormAPI)
		{
			return false;
		}
		
		const value: string = this.scormAPI.LMSFinish("");
		const isFinish: boolean = value === ScormConstantEnum.SCORM_TRUE;
		
		if (isFinish)
		{
			window.removeEventListener("beforeunload", this.beforeUnload);
		}
		
		this.setLastCall('LMSFinish');
		
		return isFinish;
	}
	
	public getValue(key: string): string | null
	{
		if (!this.scormAPI)
		{
			return null;
		}
		
		const value = this.scormAPI.LMSGetValue(key);
		
		if (!value && typeof value !== 'number' || value.length === 0)
		{
			const error = this.getLastError();
			console.log('LMSGetLastError', error);
			this.lastResult = '';
		}
		else
		{
			this.lastResult = value;
			this.lastError = '';
		}
		
		this.setLastCall('Get Value: ' + key);
		
		return value;
	}
	
	public setValue(key: string, value: string | number): void
	{
		if (!this.scormAPI)
		{
			return;
		}
		
		this.scormAPI.LMSSetValue(key, value);
		this.scormAPI.LMSCommit("");
		
		this.setLastCall('Set Value: ' + key + ': ' + value);
	}
	
	private setLastCall(value: string): void
	{
		this.lastCall = value;
	}
	
	/*
	cmi.core.lesson_location : is the data element that describes the user’s location in the content
	
	cmi.completion_status & cmi.success_status (cmi.core.lesson_status) – These data model elements are the most fundamental and important. They indicate when a user has finished a course and if he passed or failed. This fundamental information is essential to most LMS’s.
cmi.score.scaled (cmi.core.score.raw) – Indicates the score that the learner earned on any assessment within a SCO. Reporting a min and max score in conjunction with a raw score is also good form.
cmi.session_time (cmi.core.session_time) – Reports the amount of time that the learner spent in the SCO.
cmi.location (cmi.core.lesson_location) – Provides a free text field for the SCO to record a bookmark. If the SCO is bigger than just a couple HTML pages, it should consider implementing a bookmarking feature to let the learner resume a paused attempt.
cmi.exit (cmi.core.exit) – This value indicates how the learner is exiting the SCO. Setting cmi.exit to “suspend” will ensure that the current attempt is preserved and the run-time data is not reset the next time the SCO is launched. Setting cmi.exit to “” will indicate that the LMS should begin a new attempt with a new set of run-time data on the next launch of the SCO.
	
	
	Many people choose to do this with a Java applet, but others have been successful using Flash, ActiveX controls and pure JavaScript.
	 */
}
