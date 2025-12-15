import {UtilHttp} from './util-http';

describe('UtilHttp Tests', () => {
	
	beforeEach(() => {
		//
	});
	
	it('isLocalHost should be defined', () => {
		expect(UtilHttp.isLocalHost).toBeDefined();
	});
	
	it('isLocalHost should return a boolean', () => {
		expect(UtilHttp.isLocalHost()).toBe(true);
	});
	
	it('getQueryParams should be defined', () => {
		expect(UtilHttp.getQueryParams).toBeDefined();
	});
	
	it('getUrlWithData should be defined', () => {
		expect(UtilHttp.getUrlWithData).toBeDefined();
	});
	
	it('openUrlWithData should be defined', () => {
		expect(UtilHttp.openUrlWithData).toBeDefined();
	});
	
});
