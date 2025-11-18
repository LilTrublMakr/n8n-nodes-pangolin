import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { pangolinApiRequest } from './GenericFunctions';

export class PangolinApiCall implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin API Call',
		name: 'pangolinApiCall',
		icon: 'file:../../icons/pangolin.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Make raw requests to the Pangolin API',
		usableAsTool: true,
		defaults: {
			name: 'Pangolin API Call',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pangolinApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'request',
				options: [
					{ name: 'Request', value: 'request', action: 'Request an api' },
				],
			},
			{
				displayName: 'Method',
				name: 'method',
				type: 'options',
				noDataExpression: true,
				default: 'GET',
				options: [
					{ name: 'DELETE', value: 'DELETE' },
					{ name: 'GET', value: 'GET' },
					{ name: 'PATCH', value: 'PATCH' },
					{ name: 'POST', value: 'POST' },
					{ name: 'PUT', value: 'PUT' },
				],
				displayOptions: {
					show: {
						operation: ['request'],
					},
				},
			},
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'string',
				default: '/v1/',
				placeholder: '/v1/orgs',
				required: true,
				displayOptions: {
					show: {
						operation: ['request'],
					},
				},
			},
			{
				displayName: 'Query Parameters',
				name: 'queryParametersUi',
				placeholder: 'Add Parameter',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Key',
								name: 'name',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: ['request'],
					},
				},
			},
			{
				displayName: 'Headers',
				name: 'headersUi',
				placeholder: 'Add Header',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'header',
						displayName: 'Header',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: ['request'],
					},
				},
			},
			{
				displayName: 'Send Body',
				name: 'sendBody',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['request'],
						method: ['POST', 'PUT', 'PATCH', 'DELETE'],
					},
				},
				description: 'Whether to include a request body',
			},
			{
				displayName: 'JSON Parameters',
				name: 'jsonParameters',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['request'],
						sendBody: [true],
					},
				},
				description: 'Whether the body is a raw JSON object',
			},
			{
				displayName: 'Body (JSON)',
				name: 'bodyJson',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						operation: ['request'],
						sendBody: [true],
						jsonParameters: [true],
					},
				},
				description: 'Raw JSON body',
			},
			{
				displayName: 'Body Fields',
				name: 'bodyUi',
				placeholder: 'Add Field',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field Name',
								name: 'name',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Field Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: ['request'],
						sendBody: [true],
						jsonParameters: [false],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'rawOptions',
				type: 'collection',
				default: {},
				placeholder: 'Add Option',
				options: [
					{
						displayName: 'Return All',
						name: 'returnAll',
						type: 'boolean',
						default: true,
						description: 'Whether to return all results or only up to a given limit',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 100000,
						},
						default: 50,
						description: 'Max number of results to return',
					},
				],
				displayOptions: {
					show: {
						operation: ['request'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'request') {
					const method = this.getNodeParameter('method', i) as
						| 'GET'
						| 'POST'
						| 'PUT'
						| 'PATCH'
						| 'DELETE';
					const endpoint = this.getNodeParameter('endpoint', i) as string;

					// Query params
					const queryParametersUi = this.getNodeParameter('queryParametersUi', i, {}) as {
						parameter?: Array<{ name?: string; value?: string }>;
					};
					const qs: IDataObject = {};
					for (const p of queryParametersUi.parameter ?? []) {
						if (p?.name) {
							qs[p.name] = p.value ?? '';
						}
					}

					// Headers
					const headersUi = this.getNodeParameter('headersUi', i, {}) as {
						header?: Array<{ name?: string; value?: string }>;
					};
					const headers: IDataObject = {};
					for (const h of headersUi.header ?? []) {
						if (h?.name) {
							headers[h.name] = h.value ?? '';
						}
					}

					// Body
					let body: IDataObject | undefined;
					const sendBody = this.getNodeParameter('sendBody', i, false) as boolean;
					if (sendBody) {
						const jsonParameters = this.getNodeParameter('jsonParameters', i, true) as boolean;
						if (jsonParameters) {
							body = (this.getNodeParameter('bodyJson', i) as IDataObject) ?? {};
						} else {
							const bodyUi = this.getNodeParameter('bodyUi', i, {}) as {
								field?: Array<{ name?: string; value?: string }>;
							};
							body = {};
							for (const f of bodyUi.field ?? []) {
								if (f?.name) {
									body[f.name] = f.value ?? '';
								}
							}
						}
					}

					const response = await pangolinApiRequest.call(
						this,
						method,
						endpoint,
						body ?? {},
						qs,
						headers,
					);

					const rawOptions = this.getNodeParameter('rawOptions', i, {}) as IDataObject;
					const returnAll = rawOptions.returnAll !== false;

					if (Array.isArray(response)) {
						const arr = returnAll
							? response
							: response.slice(0, Number(rawOptions.limit ?? 50));
						for (const entry of arr) {
							returnData.push({ json: (entry ?? {}) as IDataObject });
						}
					} else {
						returnData.push({ json: (response ?? {}) as IDataObject });
					}

					continue;
				}

				throw new NodeOperationError(this.getNode(), 'Unsupported operation', {
					itemIndex: i,
				});
			} catch (err) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (err as Error).message } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), (err as Error).message, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
