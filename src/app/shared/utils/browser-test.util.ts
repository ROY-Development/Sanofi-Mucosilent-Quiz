export class BrowserTestUtil
{
	public static isPerformanceNowFasterThanDateNow(): boolean
	{
		const iterations = 1000000;
		let start: number, end: number, diff: number, diffDate: number;
		
		// Test Date.now()
		start = Date.now();
		for (let i = 0; i < iterations; i++) {
			Date.now();
		}
		end = Date.now();
		diffDate = end -start;
		//console.log(`Date.now(): ${diffDate} ms`);
		
		// Test performance.now()
		start = performance.now();
		for (let i = 0; i < iterations; i++) {
			performance.now();
		}
		end = performance.now();
		diff = end -start;
		//console.log(`performance.now(): ${diff} ms`);
		
		return diffDate > diff;
	}
}