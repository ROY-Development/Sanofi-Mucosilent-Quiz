import {RequestOptionsModel} from './request-options.model';
import {HttpMethodsEnum} from '../enums/http-methods.enum';

describe('RequestOptionsModel Tests', () => {
	
	let requestOptionsModel: RequestOptionsModel;
	
	beforeEach(() => {
		requestOptionsModel = new RequestOptionsModel(
			'users/{{id}}/stores/{{storeId}}',
			HttpMethodsEnum.post,
			{
				id: '345',
				storeId: '2345'
			},
			{
				locale: 'de-DE'
			},
			{
				Authentication: 'Bearer 3456333-344553-3455'
			},
			{
				hidden: 'hiddenBody'
			}
		);
	});
	
	it('should be defined', () => {
		expect(requestOptionsModel).toBeDefined();
	});
	
	it('constructor should be defined', () => {
		expect(requestOptionsModel.constructor).toBeDefined();
	});
});
