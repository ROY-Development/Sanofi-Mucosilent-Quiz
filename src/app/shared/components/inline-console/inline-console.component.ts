import {ChangeDetectorRef, Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';

class InlineConsoleMessage
{
	constructor(
		public type: string | undefined,
		public time: number | undefined,
		public id: string | undefined,
		public message: string | undefined,
		public argsList: Array<string>
	)
	{
	}
}

@Component({
	selector: 'app-inline-console',
	templateUrl: './inline-console.component.html',
	styleUrl: './inline-console.component.scss',
	standalone: false
})
export class InlineConsoleComponent implements OnInit
{
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@ViewChild('inlineConsoleContainer') public inlineConsoleContainer!: ElementRef<HTMLDivElement>;
	@ViewChild('inlineConsole') public inlineConsole!: ElementRef<HTMLDivElement>;
	
	protected readonly signalMessageList = signal<Array<InlineConsoleMessage>>([]);
	
	protected logCount = 0;
	// watchEvents = ['click','focus','unfocus','blur','unblur','touchstart','touchend']
	protected watchEvents = [];
	protected startMs = new Date().getTime();
	protected readonly oldLog = console.log;
	protected readonly oldDebug = console.debug;
	protected readonly oldWarn = console.warn;
	protected readonly oldInfo = console.info;
	protected readonly oldError = console.error;
	
	public ngOnInit(): void
	{
		/*window.onerror = (message, lineNumber, file) => {
			this.sendMsg("ERROR", [message, lineNumber, file], "#ff0000");
		};*/
		window.onerror = (...args) => {
			this.sendMsg("ERROR", args);
		};
		
		console.log = (...args) => {
			this.sendMsg("LOG", args);
			this.oldLog.apply(console, args);
		};
		
		console.debug = (...args) => {
			this.sendMsg("DEBUG", args);
			(<any>this.oldDebug).apply(console, args);
		};
		
		console.warn = (...args) => {
			this.sendMsg("WARN", args);
			(<any>this.oldWarn).apply(console, args);
		};
		
		console.info = (...args) => {
			this.sendMsg("INFO", args);
			(<any>this.oldInfo).apply(console, args);
		};
		
		console.error = (...args) => {
			this.sendMsg("ERROR", args);
			(<any>this.oldError).apply(console, args);
		};
		
		for (let ei = 0, eLen = this.watchEvents.length; ei < eLen; ei++)
		{
			document.addEventListener(
				this.watchEvents[ei],
				(e: any): void => {
					this.sendMsg(
						"EVENT",
						[
							"An event type &quot;" +
							e.type +
							"&quot; was triggered by a &quot;" +
							e.target.nodeName +
							"&quot; node."
						]
					);
					
				},
				true
			);
		}
	}
	
	public onClickClearConsole(): void
	{
		this.signalMessageList.set([]);
		this.changeDetectorRef.detectChanges();
	}
	
	protected sendMsg(type: any, args: any): void
	{
		const eId = type + "-" + ++this.logCount;
		const firstElementString = JSON.stringify(args[0]);
		const currentMs = new Date().getTime();
		let argsList = [];
		
		if (args.length > 0)
		{
			for (let i = 0, len = args.length; i < len; i++)
			{
				argsList.push(JSON.stringify(args[i]));
			}
		}
		
		if (argsList.length <= 2)
		{
			argsList = [];
		}
		
		const element: InlineConsoleMessage = new InlineConsoleMessage(
			type,
			(currentMs - this.startMs),
			eId,
			firstElementString,//.substring(0, 48)
			argsList
		);
		
		const list = this.signalMessageList();
		list.push(element);
		this.signalMessageList.set(list);
		this.changeDetectorRef.detectChanges();
		
		if (this.inlineConsole && this.inlineConsoleContainer)
		{
			this.inlineConsoleContainer.nativeElement.scrollTop = this.inlineConsoleContainer.nativeElement.scrollHeight;
		}
	}
}
