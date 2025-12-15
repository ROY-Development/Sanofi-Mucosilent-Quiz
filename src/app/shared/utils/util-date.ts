import {WeekDayEnum} from '../enums/week-day.enum';

export class UtilDate
{
	// 2020-10-26T23:05:00Z -> Tue Oct 27 2020 00:05:00 GMT+0100 -> 2
	public static getWeekdayFromUtcDateTimeString(utcDateTimeString: string): WeekDayEnum | null
	{
		try
		{
			const date: Date = new Date(utcDateTimeString);
			const weekDay: number = date.getDay();
			if (weekDay === 0)
			{
				return WeekDayEnum.Sunday;
			}
			
			return <WeekDayEnum>weekDay;
		}
		catch (e)
		{
		}
		
		return null;
	}
	
	public static getDateFormStringFromUtcDateTimeString(utcDateTimeString: string): string
	{
		try
		{
			const date: Date = new Date(utcDateTimeString);
			const monthStr: string = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
			const dayStr: string = (date.getDate() < 10 ? '0' : '') + date.getDate();
			
			return date.getFullYear() + '-' + monthStr + '-' + dayStr;
		}
		catch (e)
		{
			return '0000-00-00';
		}
	}
	
	public static getTimeFormStringFromUtcDateTimeString(utcDateTimeString: string): string
	{
		try
		{
			const date: Date = new Date(utcDateTimeString);
			const hoursStr: string = (date.getHours() < 10 ? '0' : '') + (date.getHours());
			const minutesStr: string = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
			
			return hoursStr + ':' + minutesStr;
		}
		catch (e)
		{
			return '00:00';
		}
	}
	
	/*
	JS Date to YYYY-mm-dd hh:ii:ss
	 */
	public static getSQLFormattedDate(date: Date, isUTC: boolean = false): string
	{
		let month = '' + ((isUTC ? date.getUTCMonth() : date.getMonth()) + 1);
		let day = '' + (isUTC ? date.getUTCDate() : date.getDate());
		const year = isUTC ? date.getUTCFullYear() : date.getFullYear();
		let hours = '' + (isUTC ? date.getUTCHours() : date.getHours());
		let minutes = '' + (isUTC ? date.getUTCMinutes() : date.getMinutes());
		let seconds = '' + (isUTC ? date.getUTCSeconds() : date.getSeconds());
		
		if (month.length < 2)
		{
			month = '0' + month;
		}
		
		if (day.length < 2)
		{
			day = '0' + day;
		}
		
		if (hours.length < 2)
		{
			hours = '0' + hours;
		}
		
		if (minutes.length < 2)
		{
			minutes = '0' + minutes;
		}
		
		if (seconds.length < 2)
		{
			seconds = '0' + seconds;
		}
		
		let result = [year, month, day].join('-');
		result += isUTC ? 'T' : ' ';
		result += [hours, minutes, seconds].join(':');
		result += isUTC ? 'Z' : '';
		
		return result;
	}
	
	public static getUTCFromLocalDateTime(dateTime: string): string
	{
		const b = dateTime.split(/\D/);
		
		return new Date(parseInt(b[0], 10), parseInt(b[1], 10) - 1,
			parseInt(b[2], 10), parseInt(b[3], 10), parseInt(b[4], 10), parseInt(b[5]), 10)
			.toISOString().split('.')[0] + 'Z';
	}
	
	public static getICalDateString(utcDateString: string): string
	{
		const date: Date = new Date(utcDateString);
		
		let kbStart = UtilDate.getSQLFormattedDate(date, false);
		kbStart = kbStart.replace(' ', 'T');
		kbStart = kbStart.replace('-', '');
		kbStart = kbStart.replace('-', '');
		kbStart = kbStart.replace(':', '');
		kbStart = kbStart.replace(':', '');
		
		return kbStart;
	}
	
	public static isBetweenDayMonth(
		checkDate: Date,
		startDay: number,
		startMonth: number,
		endDay: number,
		endMonth: number
	): boolean
	{
		const checkDay: number = checkDate.getDate();
		const checkMonth: number = checkDate.getMonth() + 1;
		const checkYear: number = checkDate.getFullYear();
		
		const from: string = (startMonth < 10 ? '0' + startMonth : startMonth.toString()) +
			'/' + (startDay < 10 ? '0' + startDay : startDay.toString()) +
			'/' + checkYear.toString();
		
		const to: string = (endMonth < 10 ? '0' + endMonth : endMonth.toString()) +
			'/' + (endDay < 10 ? '0' + endDay : endDay.toString()) +
			'/' + (startMonth > endMonth ? checkYear + 1 : checkYear).toString();
		
		const check: string = (checkMonth < 10 ? '0' + checkMonth : checkMonth.toString()) +
			'/' + (checkDay < 10 ? '0' + checkDay : checkDay.toString()) +
			'/' + (startMonth > endMonth && checkMonth < startMonth ? checkYear + 1 : checkYear).toString();
		
		/*console.log('from: ' + from);
		console.log('to: ' + to);
		console.log('check:' + check);*/
		
		return UtilDate.dateCheck(from, to, check);
	}
	
	// dateCheck("02/05/2013","02/09/2013","02/07/2013")  mm/dd/yyyy
	private static dateCheck(from: string, to: string, check: string): boolean
	{
		const fDate = Date.parse(from);
		const lDate = Date.parse(to);
		const cDate = Date.parse(check);
		
		return (cDate <= lDate && cDate >= fDate);
	}
}