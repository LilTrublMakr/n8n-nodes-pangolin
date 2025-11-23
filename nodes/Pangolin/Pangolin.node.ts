import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { pangolinApiRequest } from './GenericFunctions';

export class Pangolin implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin',
		name: 'pangolin',
		icon: 'file:../../icons/pangolin.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["resource"] + ": " + $parameter["operation"] }}',
		description: 'Work with a self-hosted Pangolin reverse proxy instance',
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
			// Resource header (like Pi-hole "Status", "Summary", etc.)
			// ------------------------------------------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'resource',
				options: [
					{
						name: 'API',
						value: 'api',
					},
					{
						name: 'Client',
						value: 'client',
					},
					{
						name: 'Domain',
						value: 'domain',
					},
					{
						name: 'Resource',
						value: 'resource',
					},
					{
						name: 'Target',
						value: 'target',
					},
				],
			},

			// ------------------------------------------------------------------
			// Operation (actions) under Resource header
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'list',
				displayOptions: {
					show: {
						resource: ['resource'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create resource',
						description: 'Create a Pangolin resource',
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete resource',
						description: 'Delete a Pangolin resource',
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get resource',
						description: 'Get a single Pangolin resource by ID',
					},
					{
						name: 'List',
						value: 'list',
						action: 'List resources',
						description: 'List Pangolin resources',
					},
					{
						name: 'Update',
						value: 'update',
						action: 'Update resource',
						description: 'Update a Pangolin resource',
					},
				],
			},

			// ------------------------------------------------------------------
			// Operation (actions) under Domain header
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'list',
				displayOptions: {
					show: {
						resource: ['domain'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get domain',
						description: 'Get a domain by ID [/org/{orgId}/domain/{domainId}]',
					},
					{
						name: 'Get DNS Records',
						value: 'listDnsRecords',
						action: 'List DNS records',
						description: 'List DNS records for a domain [/org/{orgId}/domain/{domainId}/dns-records]',
					},
					{
						name: 'List',
						value: 'list',
						action: 'List domains',
						description: 'List Pangolin domains [/org/{orgId}/domains]',
					},
					{
						name: 'Update',
						value: 'update',
						action: 'Update domain',
						description: 'Update a Pangolin domain by ID [/org/{orgId}/domain/{domainId}]',
					},
				],
			},

			// ------------------------------------------------------------------
			// Operation (actions) under Client header
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'list',
				displayOptions: {
					show: {
						resource: ['client'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						action: 'List clients',
						description: 'List Pangolin clients [/org/{orgId}/clients]',
					},
				],
			},

			// ------------------------------------------------------------------
			// Operation (actions) under Target header
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'get',
				displayOptions: {
					show: {
						resource: ['target'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create target',
						description: 'Create a target at a given ID [/target/{targetId}]',
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete target',
						description: 'Delete a target by ID [/target/{targetId}]',
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get target',
						description: 'Get a single target by ID [/target/{targetId}]',
					},
					{
						name: 'Get From Resource',
						value: 'getByResource',
						action: 'Get target from resource',
						description: 'Get the target associated with a resource [/resource/{resourceId}/target]',
					},
					{
						name: 'Set For Resource',
						value: 'setForResource',
						action: 'Set target for resource',
						description: 'Create or update the target for a resource [/resource/{resourceId}/target]',
					},
				],
			},

			// ------------------------------------------------------------------
			// Operation (actions) under API header
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'request',
				displayOptions: {
					show: {
						resource: ['api'],
					},
				},
				options: [
					{
						name: 'API Request (Raw)',
						value: 'request',
						action: 'Request an api',
						description: 'Make a raw API request to any Pangolin endpoint',
					},
				],
			},

			// ------------------------------------------------------------------
			// Common: Organization scope
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
						// These resources all use orgId in at least one operation
						resource: ['resource', 'domain', 'client'],
						// Only these operations use orgId
						operation: ['list', 'create', 'update', 'delete', 'get', 'listDnsRecords'],
					},
					// Hide for the one combination that does NOT use orgId:
					// Resource → Get (GET /resource/{resourceId})
					hide: {
						resource: ['resource'],
						operation: ['get'],
					},
				},
			},

			// ------------------------------------------------------------------
			// Resource identifiers / payload (Resource header only)
			// ------------------------------------------------------------------
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'string',
				default: '',
				required: true,
				description:
					'Numeric resource ID from Pangolin (for example, <code>1</code>). Typically provided by a previous webhook or node.',
				displayOptions: {
					show: {
						resource: ['resource'],
						operation: ['get', 'update', 'delete'],
					},
				},
			},
			{
				displayName: 'Target',
				name: 'target',
				type: 'string',
				default: '',
				description:
					'Target for the Pangolin resource (for example, <code>git.example.com:22</code>). You can set this from a previous node using an expression.',
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
				description: 'JSON body for resource create/update.',
			},

			// ------------------------------------------------------------------
			// Domain identifiers / payload (Domain header only)
			// ------------------------------------------------------------------
			{
				displayName: 'Domain ID',
				name: 'domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain ID from Pangolin. Typically provided by a previous webhook or node.',
				displayOptions: {
					show: {
						resource: ['domain'],
						operation: ['get', 'update', 'listDnsRecords'],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'domainBody',
				type: 'json',
				default: '{}',
				description:
					'JSON body for updating a domain (for example, <code>{ "name": "example.com" }</code>).',
				displayOptions: {
					show: {
						resource: ['domain'],
						operation: ['update'],
					},
				},
			},

			// ------------------------------------------------------------------
			// Target identifiers / payload (Target header only)
			// ------------------------------------------------------------------
			{
				displayName: 'Target ID',
				name: 'targetId',
				type: 'string',
				default: '',
				required: true,
				description: 'Target ID from Pangolin. Typically provided by a previous webhook or node.',
				displayOptions: {
					show: {
						resource: ['target'],
						operation: ['get', 'delete', 'create'],
					},
				},
			},
			{
				displayName: 'Resource ID',
				name: 'resourceIdForTarget',
				type: 'string',
				default: '',
				required: true,
				description: 'Resource ID whose target should be retrieved or updated.',
				displayOptions: {
					show: {
						resource: ['target'],
						operation: ['getByResource', 'setForResource'],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'targetBody',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						resource: ['target'],
						operation: ['create', 'setForResource'],
					},
				},
				description:
					'JSON body for creating or updating a target (for example, <code>{ "name": "My Target", "address": "git.example.com:22" }</code>).',
			},

			// ------------------------------------------------------------------
			// List options for Resource / Domain / Client list actions
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
						resource: ['resource', 'domain', 'client'],
						operation: ['list', 'listDnsRecords'],
					},
				},
			},

			// ------------------------------------------------------------------
			// RAW API request action (API header)
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
						resource: ['api'],
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
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				// --------------------------------------------------------------
				// Resource actions
				// --------------------------------------------------------------
				if (resource === 'resource') {
					// List, Create, Update, Delete all need orgId
					if (['list', 'create', 'update', 'delete'].includes(operation)) {
						const orgId = this.getNodeParameter('orgId', i) as string;

						// List resources -> /v1/org/{orgId}/resources
						if (operation === 'list') {
							const options = this.getNodeParameter('options', i, {}) as IDataObject;
							const returnAll = options.returnAll !== false;
							const limit = Number(options.limit ?? 50);

							const res = (await pangolinApiRequest.call(
								this,
								'GET',
								`/v1/org/${orgId}/resources`,
							)) as IDataObject | IDataObject[];

							let resources: IDataObject[] = [];

							if (Array.isArray(res)) {
								resources = res;
							} else if (res.data && (res.data as IDataObject).resources) {
								const data = res.data as IDataObject;
								if (Array.isArray(data.resources)) {
									resources = data.resources as IDataObject[];
								}
							} else {
								resources = [res];
							}

							const out = returnAll ? resources : resources.slice(0, limit);

							for (const r of out) {
								returnData.push({ json: (r ?? {}) as IDataObject });
							}

							continue;
						}

						// Create resource -> /v1/org/{orgId}/resources
						if (operation === 'create') {
							const body = (this.getNodeParameter('resourceBody', i) as IDataObject) || {};
							const target = this.getNodeParameter('target', i, '') as string;

							if (target && typeof body === 'object') {
								(body as IDataObject).target = target;
							}

							const res = await pangolinApiRequest.call(
								this,
								'POST',
								`/v1/org/${orgId}/resources`,
								body,
							);
							returnData.push({ json: (res ?? {}) as IDataObject });
							continue;
						}

						// Update resource -> /v1/org/{orgId}/resources/{resourceId}
						if (operation === 'update') {
							const resourceId = this.getNodeParameter('resourceId', i) as string;
							const body = (this.getNodeParameter('resourceBody', i) as IDataObject) || {};
							const target = this.getNodeParameter('target', i, '') as string;

							if (target && typeof body === 'object') {
								(body as IDataObject).target = target;
							}

							const res = await pangolinApiRequest.call(
								this,
								'PATCH',
								`/v1/org/${orgId}/resources/${resourceId}`,
								body,
							);
							returnData.push({ json: (res ?? {}) as IDataObject });
							continue;
						}

						// Delete resource -> /v1/org/{orgId}/resources/{resourceId}
						if (operation === 'delete') {
							const resourceId = this.getNodeParameter('resourceId', i) as string;
							const res = await pangolinApiRequest.call(
								this,
								'DELETE',
								`/v1/org/${orgId}/resources/${resourceId}`,
							);
							returnData.push({ json: (res ?? {}) as IDataObject });
							continue;
						}
					}

					// Get resource -> /v1/resource/{resourceId} (no orgId)
					if (operation === 'get') {
						const resourceId = this.getNodeParameter('resourceId', i) as string;
						const res = await pangolinApiRequest.call(
							this,
							'GET',
							`/v1/resource/${resourceId}`,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
						continue;
					}
				}

				// --------------------------------------------------------------
				// Domain actions (require orgId)
				// --------------------------------------------------------------
				if (resource === 'domain') {
					const orgId = this.getNodeParameter('orgId', i) as string;

					if (operation === 'list') {
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const returnAll = options.returnAll !== false;
						const limit = Number(options.limit ?? 50);

						const res = (await pangolinApiRequest.call(
							this,
							'GET',
							`/v1/org/${orgId}/domains`,
						)) as IDataObject | IDataObject[];

						let domains: IDataObject[] = [];

						if (Array.isArray(res)) {
							domains = res;
						} else if (res.data && (res.data as IDataObject).domains) {
							const data = res.data as IDataObject;
							if (Array.isArray(data.domains)) {
								domains = data.domains as IDataObject[];
							}
						} else {
							domains = [res];
						}

						const out = returnAll ? domains : domains.slice(0, limit);

						for (const d of out) {
							returnData.push({ json: (d ?? {}) as IDataObject });
						}

						continue;
					}

					if (operation === 'get') {
						const domainId = this.getNodeParameter('domainId', i) as string;
						const res = await pangolinApiRequest.call(
							this,
							'GET',
							`/v1/org/${orgId}/domain/${domainId}`,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
						continue;
					}

					if (operation === 'update') {
						const domainId = this.getNodeParameter('domainId', i) as string;
						const body = (this.getNodeParameter('domainBody', i) as IDataObject) || {};
						const res = await pangolinApiRequest.call(
							this,
							'PATCH',
							`/v1/org/${orgId}/domain/${domainId}`,
							body,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
						continue;
					}

					if (operation === 'listDnsRecords') {
						const domainId = this.getNodeParameter('domainId', i) as string;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const returnAll = options.returnAll !== false;
						const limit = Number(options.limit ?? 50);

						const res = (await pangolinApiRequest.call(
							this,
							'GET',
							`/v1/org/${orgId}/domain/${domainId}/dns-records`,
						)) as IDataObject | IDataObject[];

						let dnsRecords: IDataObject[] = [];

						if (Array.isArray(res)) {
							dnsRecords = res;
						} else if (res.data && (res.data as IDataObject).dnsRecords) {
							const data = res.data as IDataObject;
							if (Array.isArray(data.dnsRecords)) {
								dnsRecords = data.dnsRecords as IDataObject[];
							}
						} else {
							dnsRecords = [res];
						}

						const out = returnAll ? dnsRecords : dnsRecords.slice(0, limit);

						for (const record of out) {
							returnData.push({ json: (record ?? {}) as IDataObject });
						}

						continue;
					}
				}

				// --------------------------------------------------------------
				// Client actions (require orgId)
				// --------------------------------------------------------------
				if (resource === 'client' && operation === 'list') {
					const orgId = this.getNodeParameter('orgId', i) as string;
					const options = this.getNodeParameter('options', i, {}) as IDataObject;
					const returnAll = options.returnAll !== false;
					const limit = Number(options.limit ?? 50);

					const res = (await pangolinApiRequest.call(
						this,
						'GET',
						`/v1/org/${orgId}/clients`,
					)) as IDataObject | IDataObject[];

					let clients: IDataObject[] = [];

					if (Array.isArray(res)) {
						clients = res;
					} else if (res.data && (res.data as IDataObject).clients) {
						const data = res.data as IDataObject;
						if (Array.isArray(data.clients)) {
							clients = data.clients as IDataObject[];
						}
					} else {
						clients = [res];
					}

					const out = returnAll ? clients : clients.slice(0, limit);

					for (const c of out) {
						returnData.push({ json: (c ?? {}) as IDataObject });
					}

					continue;
				}

				// --------------------------------------------------------------
				// Target actions
				// --------------------------------------------------------------
				if (resource === 'target') {
					// GET /target/{targetId}
					if (operation === 'get') {
						const targetId = this.getNodeParameter('targetId', i) as string;
						const res = await pangolinApiRequest.call(
							this,
							'GET',
							`/v1/target/${targetId}`,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
						continue;
					}

					// DELETE /target/{targetId}
					if (operation === 'delete') {
						const targetId = this.getNodeParameter('targetId', i) as string;
						const res = await pangolinApiRequest.call(
							this,
							'DELETE',
							`/v1/target/${targetId}`,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
						continue;
					}

					// POST /target/{targetId}
					if (operation === 'create') {
						const targetId = this.getNodeParameter('targetId', i) as string;
						const body = (this.getNodeParameter('targetBody', i) as IDataObject) || {};
						const res = await pangolinApiRequest.call(
							this,
							'POST',
							`/v1/target/${targetId}`,
							body,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
						continue;
					}

					// GET /resource/{resourceId}/target
					if (operation === 'getByResource') {
						const resourceIdForTarget = this.getNodeParameter(
							'resourceIdForTarget',
							i,
						) as string;
						const res = await pangolinApiRequest.call(
							this,
							'GET',
							`/v1/resource/${resourceIdForTarget}/target`,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
						continue;
					}

					// PUT /resource/{resourceId}/target
					if (operation === 'setForResource') {
						const resourceIdForTarget = this.getNodeParameter(
							'resourceIdForTarget',
							i,
						) as string;
						const body = (this.getNodeParameter('targetBody', i) as IDataObject) || {};
						const res = await pangolinApiRequest.call(
							this,
							'PUT',
							`/v1/resource/${resourceIdForTarget}/target`,
							body,
						);
						returnData.push({ json: (res ?? {}) as IDataObject });
						continue;
					}
				}

				// --------------------------------------------------------------
				// Raw API action (API header)
				// --------------------------------------------------------------
				if (resource === 'api' && operation === 'request') {
					const method = this.getNodeParameter('method', i) as
						| 'GET'
						| 'POST'
						| 'PUT'
						| 'PATCH'
						| 'DELETE';
					const endpoint = this.getNodeParameter('endpoint', i) as string;

					const queryParametersUi = this.getNodeParameter(
						'queryParametersUi',
						i,
						{},
					) as {
						parameter?: Array<{ name?: string; value?: string }>;
					};
					const qs: IDataObject = {};
					for (const p of queryParametersUi.parameter ?? []) {
						if (p?.name) {
							qs[p.name] = p.value ?? '';
						}
					}

					const headersUi = this.getNodeParameter('headersUi', i, {}) as {
						header?: Array<{ name?: string; value?: string }>;
					};
					const headers: IDataObject = {};
					for (const h of headersUi.header ?? []) {
						if (h?.name) {
							headers[h.name] = h.value ?? '';
						}
					}

					let body: IDataObject | undefined;
					const sendBody = this.getNodeParameter('sendBody', i, false) as boolean;
					if (sendBody) {
						const jsonParameters = this.getNodeParameter(
							'jsonParameters',
							i,
							true,
						) as boolean;
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
					const limit = Number(rawOptions.limit ?? 50);

					if (Array.isArray(response)) {
						const arr = returnAll ? response : response.slice(0, limit);
						for (const entry of arr) {
							returnData.push({ json: (entry ?? {}) as IDataObject });
						}
					} else {
						returnData.push({ json: (response ?? {}) as IDataObject });
					}

					continue;
				}

				// --------------------------------------------------------------
				// Fallback
				// --------------------------------------------------------------
				throw new NodeOperationError(
					this.getNode(),
					`Unsupported combination of resource "${resource}" and operation "${operation}"`,
					{ itemIndex: i },
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), (error as Error).message, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
