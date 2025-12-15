import {UtilTimeout} from './util-timeout';

describe('UtilTimeout Tests', () => {
	
	beforeEach(() => {
		//
	});
	
	it('setTimeout should be defined', () => {
		expect(UtilTimeout.setTimeout).toBeDefined();
	});
});