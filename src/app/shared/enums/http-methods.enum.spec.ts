import {HttpMethodsEnum} from './http-methods.enum';

describe('HttpMethodsEnum Tests', () => {
	
	beforeEach(() => {
	});
	
	it('should be defined', () => {
		expect(HttpMethodsEnum).toBeDefined();
	});
	
	it('get should be defined', () => {
		expect(HttpMethodsEnum.get).toBeDefined();
		expect(HttpMethodsEnum.get).toBe('GET');
	});
	
	it('post should be defined', () => {
		expect(HttpMethodsEnum.post).toBeDefined();
		expect(HttpMethodsEnum.post).toBe('POST');
	});
	
	it('put should be defined', () => {
		expect(HttpMethodsEnum.put).toBeDefined();
		expect(HttpMethodsEnum.put).toBe('PUT');
	});
	
	it('delete should be defined', () => {
		expect(HttpMethodsEnum.delete).toBeDefined();
		expect(HttpMethodsEnum.delete).toBe('DELETE');
	});
	
	it('patch should be defined', () => {
		expect(HttpMethodsEnum.patch).toBeDefined();
		expect(HttpMethodsEnum.patch).toBe('PATCH');
	});
	
	it('head should be defined', () => {
		expect(HttpMethodsEnum.head).toBeDefined();
		expect(HttpMethodsEnum.head).toBe('HEAD');
	});
});
