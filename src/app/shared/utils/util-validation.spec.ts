import {UtilValidation} from './util-validation';

describe('UtilValidation Tests', () => {
	
	beforeEach(() => {
		//
	});
	
	it('asyncValidatorDoesEmailExist should be defined', () => {
		expect(UtilValidation.asyncValidatorDoesEmailExist).toBeDefined();
	});
});