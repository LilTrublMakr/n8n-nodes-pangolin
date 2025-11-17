import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { pangolinApiRequest, loadDomains } from './GenericFunctions';

export class Pangolin implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin',
		name: 'pangolin',
		icon: 'file:../../icons/pangolin.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Connect to a self-hosted Pangolin Integration API',
		usableAsTool: true,
		defaults: {
			name: 'Pangolin',
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
			// ------------------------------------------------------------------
			// Resource
			// ------------------------------------------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'resource',
				options: [
					{ name: 'Resource', value: 'resource' },
					{ name: 'Domain', value: 'domain' },
					{ name: 'Client', value: 'client' },
					{ name: 'API Call (Raw)', value: 'api' },
				],
			},

			// ------------------------------------------------------------------
			// Operation
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'list',
				options: [
					// Sorted alphabetically by name (lint requirement)
					{ name: 'Create', value: 'create', action: 'Create a resource' },
					{ name: 'Delete', value: 'delete', action: 'Delete a resource' },
					{ name: 'Get', value: 'get', action: 'Get a resource' },
					{ name: 'List', value: 'list', action: 'List resources' },
					{ name: 'List Clients', value: 'listClients', action: 'List clients' },
					{ name: 'List Domains', value: 'listDomains', action: 'List domains' },
					{ name: 'Request (Raw)', value: 'request', action: 'Request an api' },
					{ name: 'Update', value: 'update', action: 'Update a resource' },
				],
			},

			// ------------------------------------------------------------------
			// Common: Organization scope (text field)
			// ------------------------------------------------------------------
			{
				displayName: 'Organization ID',
				name: 'orgId',
				type: 'string',
				default: '',
				required: true,
				description:
					'Organization ID from Pangolin (for example, <code>homelab</code>). You can set this from a previous node using an expression.',
				displayOptions: {
					show: {
						resource: ['resource', 'domain', 'client', 'api'],
						operation: [
							'list',
							'get',
							'create',
							'update',
							'delete',
							'listDomains',
							'listClients',
							'request',
						],
					},
				},
			},

			// ------------------------------------------------------------------
			// Resource-specific fields (text ID)
			// ------------------------------------------------------------------
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'string',
				default: '',
				required: true,
				description:
					'Numeric resourceId from Pangolin (for example, <code>1</code>). Typically provided by a previous webhook or node.',
				displayOptions: {
					show: {
						resource: ['resource'],
						operation: ['get', 'update', 'delete'],
					},
				},
			},
			{
				displayName: 'Domain Name or ID',
				name: 'domainId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'loadDomains',
				},
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						resource: ['resource'],
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'resourceBody',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						resource: ['resource'],
						operation: ['create', 'update'],
					},
				},
				description:
					'JSON body for resource create/update (e.g. name, protocol, proxyPort, domainId, etc.).',
			},

			// ------------------------------------------------------------------
			// Domain / Client list Options
			// ------------------------------------------------------------------
			{
				displayName: 'Options',
				name: 'options',
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
						typeOptions: { minValue: 1, maxValue: 100000 },
						default: 50,
						description: 'Max number of results to return',
					},
				],
				displayOptions: {
					show: {
						resource: ['resource', 'domain', 'client'],
						operation: ['list', 'listDomains', 'listClients'],
					},
				},
			},

			// ------------------------------------------------------------------
			// RAW API request
			// ------------------------------------------------------------------
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
						resource: ['api'],
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
						resource: ['api'],
						operation: ['request'],
					},
				},
			},
			{
				displayName: 'Query Parameters',
				name: 'queryParametersUi',
				placeholder: 'Add Parameter',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
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
						resource: ['api'],
						operation: ['request'],
					},
				},
			},
			{
				displayName: 'Headers',
				name: 'headersUi',
				placeholder: 'Add Header',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
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
						resource: ['api'],
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
						resource: ['api'],
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
						resource: ['api'],
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
						resource: ['api'],
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
				typeOptions: { multipleValues: true },
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
						resource: ['api'],
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
						typeOptions: { minValue: 1, maxValue: 100000 },
						default: 50,
						description: 'Max number of results to return',
					},
				],
				displayOptions: {
					show: {
						resource: ['api'],
						operation: ['request'],
					},
				},
			},
		],
	};

	methods = {
		loadOptions: {
			loadDomains,
		},
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				// ---------- Predefined: Resource ----------
				if (resource === 'resource') {
					const orgId = this.getNodeParameter('orgId', i) as string;

					if (operation === 'list') {
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const res = await pangolinApiRequest.call(
							this,
							'GET',
							`/v1/org/${orgId}/resources`,
						);
						const arr = Array.isArray(res) ? res : [res];
						const out =
							options.returnAll === false
								? arr.slice(0, Number(options.limit ?? 50))
								: arr;
						for (const r of out) {
							returnData.push({ json: (r ?? {}) as IDataObject });
						}
					}

					if (operation === 'get') {
						const resourceId = this.getNodeParameter('resourceId', i) as string;
						const res = await pangolinApiRequest.call(
							this,
							'GET',
							`/v1/org/${orgId}/resources/${resourceId}`,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
					}

					if (operation === 'create') {
						const body = (this.getNodeParameter('resourceBody', i) as IDataObject) || {};
						const domainId = this.getNodeParameter('domainId', i, '') as string;
						if (domainId && typeof body === 'object') {
							(body as IDataObject).domainId = domainId;
						}

						const res = await pangolinApiRequest.call(
							this,
							'POST',
							`/v1/org/${orgId}/resources`,
							body,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
					}

					if (operation === 'update') {
						const resourceId = this.getNodeParameter('resourceId', i) as string;
						const body = (this.getNodeParameter('resourceBody', i) as IDataObject) || {};
						const maybeDomain = this.getNodeParameter('domainId', i, '') as string;
						if (maybeDomain && typeof body === 'object') {
							(body as IDataObject).domainId = maybeDomain;
						}

						const res = await pangolinApiRequest.call(
							this,
							'PATCH',
							`/v1/org/${orgId}/resources/${resourceId}`,
							body,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
					}

					if (operation === 'delete') {
						const resourceId = this.getNodeParameter('resourceId', i) as string;
						const res = await pangolinApiRequest.call(
							this,
							'DELETE',
							`/v1/org/${orgId}/resources/${resourceId}`,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
					}

					continue;
				}

				// ---------- Predefined: Domain ----------
				if (resource === 'domain' && operation === 'listDomains') {
					const orgId = this.getNodeParameter('orgId', i) as string;
					const options = this.getNodeParameter('options', i, {}) as IDataObject;
					const res = await pangolinApiRequest.call(
						this,
						'GET',
						`/v1/org/${orgId}/domains`,
					);
					const arr = Array.isArray(res) ? res : [res];
					const out =
						options.returnAll === false
							? arr.slice(0, Number(options.limit ?? 50))
							: arr;
					for (const d of out) {
						returnData.push({ json: (d ?? {}) as IDataObject });
					}
					continue;
				}

				// ---------- Predefined: Client ----------
				if (resource === 'client' && operation === 'listClients') {
					const orgId = this.getNodeParameter('orgId', i) as string;
					const options = this.getNodeParameter('options', i, {}) as IDataObject;
					const res = await pangolinApiRequest.call(
						this,
						'GET',
						`/v1/org/${orgId}/clients`,
					);
					const arr = Array.isArray(res) ? res : [res];
					const out =
						options.returnAll === false
							? arr.slice(0, Number(options.limit ?? 50))
							: arr;
					for (const c of out) {
						returnData.push({ json: (c ?? {}) as IDataObject });
					}
					continue;
				}

				// ---------- Raw API ----------
				if (resource === 'api' && operation === 'request') {
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

					// Extra headers
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
