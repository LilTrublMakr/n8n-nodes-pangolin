import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';

export class Pangolin implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin',
		name: 'pangolin',
		icon: 'file:pangolin.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + " / " + $parameter["operation"]}}',
		description: 'Interact with a Pangolin reverse proxy instance',
		defaults: {
			name: 'Pangolin',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'pangolinApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiKey'],
					},
				},
			},
		],
		properties: [
			// ------------------------------------------------------------------
			// Resource selector (this creates the "Resource Actions" header)
			// ------------------------------------------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Health',
						value: 'health',
					},
					{
						name: 'Organization',
						value: 'organization',
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
				default: 'resource',
				description: 'Resource to operate on',
			},

			// ------------------------------------------------------------------
			// HEALTH ACTIONS
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['health'],
					},
				},
				options: [
					{
						name: 'Get Health',
						value: 'getHealth',
						action: 'Get health status',
						description: 'Check the health endpoint of the Pangolin API',
					},
				],
				default: 'getHealth',
			},

			// ------------------------------------------------------------------
			// ORGANIZATION ACTIONS (minimal set to support listing resources)
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['organization'],
					},
				},
				options: [
					{
						name: 'List Organizations',
						value: 'listOrgs',
						action: 'List organizations',
						description: 'List all organizations in the system',
					},
					{
						name: 'Get Organization',
						value: 'getOrg',
						action: 'Get organization',
						description: 'Get a single organization by ID',
					},
				],
				default: 'listOrgs',
			},
			{
				displayName: 'Organization ID',
				name: 'orgId',
				type: 'string',
				default: '',
				description: 'ID of the organization',
				displayOptions: {
					show: {
						resource: ['organization'],
						operation: ['getOrg'],
					},
				},
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: {
					show: {
						resource: ['organization'],
						operation: ['listOrgs'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
				default: 50,
				description: 'Max number of results to return',
				displayOptions: {
					show: {
						resource: ['organization'],
						operation: ['listOrgs'],
						returnAll: [false],
					},
				},
			},

			// ------------------------------------------------------------------
			// RESOURCE ACTIONS (this becomes "Resource Actions" header)
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['resource'],
					},
				},
				options: [
					{
						name: 'Get Resource',
						value: 'getResource',
						action: 'Get resource',
						description: 'Get a resource by its numerical resourceId',
					},
					{
						name: 'List Resources',
						value: 'listResources',
						action: 'List resources',
						description: 'List resources for an organization',
					},
					{
						name: 'Create Resource',
						value: 'createResource',
						action: 'Create resource',
						description: 'Create a new resource in an organization',
					},
					{
						name: 'Update Resource',
						value: 'updateResource',
						action: 'Update resource',
						description: 'Update an existing resource by resourceId',
					},
					{
						name: 'Delete Resource',
						value: 'deleteResource',
						action: 'Delete resource',
						description: 'Delete a resource by resourceId',
					},
				],
				default: 'getResource',
			},

			// Parameters shared by multiple Resource actions
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Numerical ID of the resource',
				displayOptions: {
					show: {
						resource: ['resource'],
						operation: ['getResource', 'updateResource', 'deleteResource'],
					},
				},
			},
			{
				displayName: 'Organization ID',
				name: 'orgId',
				type: 'string',
				default: '',
				description: 'ID of the organization',
				displayOptions: {
					show: {
						resource: ['resource'],
						operation: ['listResources', 'createResource'],
					},
				},
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: {
					show: {
						resource: ['resource'],
						operation: ['listResources'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
				default: 50,
				description: 'Max number of results to return',
				displayOptions: {
					show: {
						resource: ['resource'],
						operation: ['listResources'],
						returnAll: [false],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'bodyJson',
				type: 'json',
				default: {
					name: 'string',
					subdomain: 'string',
					http: true,
					protocol: 'tcp',
					domainId: 'string',
					stickySession: true,
				},
				description:
					'JSON body to send to the Pangolin API. This default matches the example from the Swagger docs.',
				displayOptions: {
					show: {
						resource: ['resource'],
						operation: ['createResource', 'updateResource'],
					},
				},
			},

			// ------------------------------------------------------------------
			// TARGET ACTIONS (this becomes "Target Actions" header)
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['target'],
					},
				},
				options: [
					{
						name: 'Get Target',
						value: 'getTarget',
						action: 'Get target',
						description: 'Get a target by targetId',
					},
					{
						name: 'Delete Target',
						value: 'deleteTarget',
						action: 'Delete target',
						description: 'Delete a target by targetId',
					},
					{
						name: 'Update Target',
						value: 'updateTarget',
						action: 'Update target',
						description: 'Update a target by targetId',
					},
					{
						name: 'Create Target for Resource',
						value: 'createResourceTarget',
						action: 'Create target for resource',
						description: 'Create a target for a resource',
					},
					{
						name: 'List Targets for Resource',
						value: 'listResourceTargets',
						action: 'List targets for resource',
						description: 'List targets for a resource',
					},
				],
				default: 'getTarget',
			},
			{
				displayName: 'Target ID',
				name: 'targetId',
				type: 'string',
				default: '',
				description: 'ID of the target',
				displayOptions: {
					show: {
						resource: ['target'],
						operation: ['getTarget', 'deleteTarget', 'updateTarget'],
					},
				},
			},
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Numerical ID of the resource',
				displayOptions: {
					show: {
						resource: ['target'],
						operation: ['createResourceTarget', 'listResourceTargets'],
					},
				},
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: {
					show: {
						resource: ['target'],
						operation: ['listResourceTargets'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
				default: 50,
				description: 'Max number of results to return',
				displayOptions: {
					show: {
						resource: ['target'],
						operation: ['listResourceTargets'],
						returnAll: [false],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'bodyJson',
				type: 'json',
				default: {
					siteId: 1,
					ip: '127.0.0.1',
					method: 'GET',
					port: 443,
					enabled: true,
				},
				description:
					'JSON body to send to the Pangolin API. This default roughly matches the example from the Swagger docs.',
				displayOptions: {
					show: {
						resource: ['target'],
						operation: ['updateTarget', 'createResourceTarget'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = (await this.getCredentials('pangolinApi')) as IDataObject;
		const baseUrlRaw = (credentials.baseUrl as string) || '';
		const baseUrl = baseUrlRaw.replace(/\/+$/, ''); // Trim trailing slashes

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			let method: IHttpRequestOptions['method'] = 'GET';
			let url = '';
			const qs: IDataObject = {};
			let body: IDataObject | undefined;

			// ---------------- HEALTH ----------------
			if (resource === 'health') {
				if (operation === 'getHealth') {
					method = 'GET';
					url = `${baseUrl}/v1/`;
				}
			}

			// ---------------- ORGANIZATION ----------------
			if (resource === 'organization') {
				if (operation === 'listOrgs') {
					method = 'GET';
					url = `${baseUrl}/v1/orgs`;

					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					if (!returnAll) {
						const limit = this.getNodeParameter('limit', i) as number;
						qs.limit = String(limit);
					}
				}

				if (operation === 'getOrg') {
					const orgId = this.getNodeParameter('orgId', i) as string;
					method = 'GET';
					url = `${baseUrl}/v1/org/${orgId}`;
				}
			}

			// ---------------- RESOURCE ----------------
			if (resource === 'resource') {
				if (operation === 'getResource') {
					const resourceId = this.getNodeParameter('resourceId', i) as number;
					method = 'GET';
					url = `${baseUrl}/v1/resource/${resourceId}`;
				}

				if (operation === 'listResources') {
					const orgId = this.getNodeParameter('orgId', i) as string;
					method = 'GET';
					url = `${baseUrl}/v1/org/${orgId}/resources`;

					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					if (!returnAll) {
						const limit = this.getNodeParameter('limit', i) as number;
						qs.limit = String(limit);
					}
				}

				if (operation === 'createResource') {
					const orgId = this.getNodeParameter('orgId', i) as string;
					method = 'PUT';
					url = `${baseUrl}/v1/org/${orgId}/resource`;
					body = this.getNodeParameter('bodyJson', i) as IDataObject;
				}

				if (operation === 'updateResource') {
					const resourceId = this.getNodeParameter('resourceId', i) as number;
					method = 'POST';
					url = `${baseUrl}/v1/resource/${resourceId}`;
					body = this.getNodeParameter('bodyJson', i) as IDataObject;
				}

				if (operation === 'deleteResource') {
					const resourceId = this.getNodeParameter('resourceId', i) as number;
					method = 'DELETE';
					url = `${baseUrl}/v1/resource/${resourceId}`;
				}
			}

			// ---------------- TARGET ----------------
			if (resource === 'target') {
				if (operation === 'getTarget') {
					const targetId = this.getNodeParameter('targetId', i) as string;
					method = 'GET';
					url = `${baseUrl}/v1/target/${targetId}`;
				}

				if (operation === 'deleteTarget') {
					const targetId = this.getNodeParameter('targetId', i) as string;
					method = 'DELETE';
					url = `${baseUrl}/v1/target/${targetId}`;
				}

				if (operation === 'updateTarget') {
					const targetId = this.getNodeParameter('targetId', i) as string;
					method = 'POST';
					url = `${baseUrl}/v1/target/${targetId}`;
					body = this.getNodeParameter('bodyJson', i) as IDataObject;
				}

				if (operation === 'createResourceTarget') {
					const resourceId = this.getNodeParameter('resourceId', i) as number;
					method = 'PUT';
					url = `${baseUrl}/v1/resource/${resourceId}/target`;
					body = this.getNodeParameter('bodyJson', i) as IDataObject;
				}

				if (operation === 'listResourceTargets') {
					const resourceId = this.getNodeParameter('resourceId', i) as number;
					method = 'GET';
					url = `${baseUrl}/v1/resource/${resourceId}/targets`;

					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					if (!returnAll) {
						const limit = this.getNodeParameter('limit', i) as number;
						qs.limit = String(limit);
					}
				}
			}

			const requestOptions: IHttpRequestOptions = {
				method,
				url,
				qs,
				json: true,
			};

			if (body !== undefined) {
				requestOptions.body = body;
			}

			const responseData = await this.helpers.requestWithAuthentication.call(
				this,
				'pangolinApi',
				requestOptions,
			);

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
				{ itemData: { item: i } },
			);

			returnData.push(...executionData);
		}

		return [returnData];
	}
}
