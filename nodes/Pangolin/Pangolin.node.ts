import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IHttpRequestMethods,
	NodeOperationError,
} from 'n8n-workflow';

type PangolinCategory =
	| 'Organization'
	| 'Resource'
	| 'Target'
	| 'Client'
	| 'Site'
	| 'Role'
	| 'Domain'
	| 'User'
	| 'Identity Provider'
	| 'Blueprint'
	| 'API Key'
	| 'Access Token'
	| 'Invitation'
	| 'Logs'
	| 'Health'
	| 'Raw';

interface PangolinActionConfig {
	id: string;
	name: string;
	description: string;
	method: IHttpRequestMethods;
	path: string;
	bodyExample?: string;
}

const PANGOLIN_ACTIONS_BY_CATEGORY: Record<PangolinCategory, PangolinActionConfig[]> = {
	Organization: [
		{
			id: 'org.list',
			name: 'List Organizations',
			description: 'List all organizations in the system.',
			method: 'GET',
			path: '/orgs',
		},
		{
			id: 'org.get',
			name: 'Get Organization',
			description: 'Get an organization by orgId.',
			method: 'GET',
			path: '/org/{orgId}',
		},
		{
			id: 'org.create',
			name: 'Create Organization',
			description: 'Create a new organization.',
			method: 'PUT',
			path: '/org',
			bodyExample: `{
  "orgId": "homelab",
  "name": "Homelab",
  "subnet": "100.90.128.0/24"
}`,
		},
		{
			id: 'org.delete',
			name: 'Delete Organization',
			description: 'Delete an organization.',
			method: 'DELETE',
			path: '/org/{orgId}',
		},
		{
			id: 'org.update',
			name: 'Update Organization',
			description: 'Update an organization.',
			method: 'POST',
			path: '/org/{orgId}',
			bodyExample: `{
  "name": "Homelab",
  "requireTwoFactor": true,
  "maxSessionLengthHours": 8,
  "passwordExpiryDays": 90,
  "settingsLogRetentionDaysRequest": 7,
  "settingsLogRetentionDaysAccess": 0,
  "settingsLogRetentionDaysAction": 0
}`,
		},
		{
			id: 'org.resources.list',
			name: 'List Resources in Organization',
			description: 'List resources for an organization.',
			method: 'GET',
			path: '/org/{orgId}/resources',
		},
		{
			id: 'org.clients.list',
			name: 'List Clients in Organization',
			description: 'List all clients for an organization.',
			method: 'GET',
			path: '/org/{orgId}/clients',
		},
		{
			id: 'org.sites.list',
			name: 'List Sites in Organization',
			description: 'List all sites in an organization.',
			method: 'GET',
			path: '/org/{orgId}/sites',
		},
	],

	Resource: [
		{
			id: 'resource.listByOrg',
			name: 'List Resources by Organization',
			description: 'List resources for an organization.',
			method: 'GET',
			path: '/org/{orgId}/resources',
		},
		{
			id: 'resource.get',
			name: 'Get Resource',
			description: 'Get a resource by resourceId.',
			method: 'GET',
			path: '/resource/{resourceId}',
		},
		{
			id: 'resource.create',
			name: 'Create Resource',
			description: 'Create a resource within an organization.',
			method: 'PUT',
			path: '/org/{orgId}/resource',
			bodyExample: `{
  "name": "Example Resource",
  "subdomain": "app",
  "http": true,
  "protocol": "tcp",
  "domainId": "example.com",
  "stickySession": true
}`,
		},
		{
			id: 'resource.update',
			name: 'Update Resource',
			description: 'Update a resource by resourceId.',
			method: 'POST',
			path: '/resource/{resourceId}',
			bodyExample: `{
  "name": "Example Resource",
  "subdomain": "app",
  "ssl": true,
  "sso": false,
  "blockAccess": false,
  "emailWhitelistEnabled": false,
  "applyRules": false,
  "domainId": "example.com",
  "enabled": true,
  "stickySession": true
}`,
		},
		{
			id: 'resource.delete',
			name: 'Delete Resource',
			description: 'Delete a resource by resourceId.',
			method: 'DELETE',
			path: '/resource/{resourceId}',
		},
		{
			id: 'resource.targets.list',
			name: 'List Targets for Resource',
			description: 'List targets for a resource.',
			method: 'GET',
			path: '/resource/{resourceId}/targets',
		},
		{
			id: 'resource.targets.create',
			name: 'Create Target for Resource',
			description: 'Create a target for a resource.',
			method: 'PUT',
			path: '/resource/{resourceId}/target',
			bodyExample: `{
  "siteId": 1,
  "ip": "10.0.0.10",
  "port": 443,
  "enabled": true
}`,
		},
	],

	Target: [
		{
			id: 'target.get',
			name: 'Get Target',
			description: 'Get a target by targetId.',
			method: 'GET',
			path: '/target/{targetId}',
		},
		{
			id: 'target.update',
			name: 'Update Target',
			description: 'Update a target by targetId.',
			method: 'POST',
			path: '/target/{targetId}',
			bodyExample: `{
  "siteId": 1,
  "ip": "10.0.0.10",
  "port": 443,
  "enabled": true
}`,
		},
		{
			id: 'target.delete',
			name: 'Delete Target',
			description: 'Delete a target by targetId.',
			method: 'DELETE',
			path: '/target/{targetId}',
		},
	],

	Client: [
		{
			id: 'client.listByOrg',
			name: 'List Clients by Organization',
			description: 'List all clients for an organization.',
			method: 'GET',
			path: '/org/{orgId}/clients',
		},
		{
			id: 'client.create',
			name: 'Create Client',
			description: 'Create a new client.',
			method: 'PUT',
			path: '/org/{orgId}/client',
			bodyExample: `{
  "name": "Example Client",
  "siteIds": [1],
  "olmId": "olm-identifier",
  "secret": "super-secret",
  "subnet": "100.90.128.0/24",
  "type": "olm"
}`,
		},
		{
			id: 'client.get',
			name: 'Get Client',
			description: 'Get a client by its client ID.',
			method: 'GET',
			path: '/client/{clientId}',
		},
		{
			id: 'client.update',
			name: 'Update Client',
			description: 'Update a client by its client ID.',
			method: 'POST',
			path: '/client/{clientId}',
			bodyExample: `{
  "name": "Example Client",
  "siteIds": [1, 2]
}`,
		},
		{
			id: 'client.delete',
			name: 'Delete Client',
			description: 'Delete a client by its client ID.',
			method: 'DELETE',
			path: '/client/{clientId}',
		},
	],

	Site: [
		{
			id: 'site.listByOrg',
			name: 'List Sites by Organization',
			description: 'List all sites in an organization.',
			method: 'GET',
			path: '/org/{orgId}/sites',
		},
		{
			id: 'site.get',
			name: 'Get Site',
			description: 'Get a site by siteId.',
			method: 'GET',
			path: '/site/{siteId}',
		},
		{
			id: 'site.create',
			name: 'Create Site',
			description: 'Create a new site.',
			method: 'PUT',
			path: '/org/{orgId}/site',
			bodyExample: `{
  "name": "Example Site",
  "type": "newt",
  "subnet": "100.90.128.0/24"
}`,
		},
		{
			id: 'site.update',
			name: 'Update Site',
			description: 'Update a site.',
			method: 'POST',
			path: '/site/{siteId}',
			bodyExample: `{
  "name": "Example Site",
  "dockerSocketEnabled": false,
  "remoteSubnets": "10.0.0.0/24"
}`,
		},
		{
			id: 'site.delete',
			name: 'Delete Site',
			description: 'Delete a site and all its associated data.',
			method: 'DELETE',
			path: '/site/{siteId}',
		},
	],

	Role: [
		{
			id: 'role.listByOrg',
			name: 'List Roles by Organization',
			description: 'List roles in an organization.',
			method: 'GET',
			path: '/org/{orgId}/roles',
		},
		{
			id: 'role.create',
			name: 'Create Role',
			description: 'Create a role.',
			method: 'PUT',
			path: '/org/{orgId}/role',
			bodyExample: `{
  "name": "Example Role",
  "description": "Role description"
}`,
		},
		{
			id: 'role.get',
			name: 'Get Role',
			description: 'Get a role by roleId.',
			method: 'GET',
			path: '/role/{roleId}',
		},
		{
			id: 'role.delete',
			name: 'Delete Role',
			description: 'Delete a role.',
			method: 'DELETE',
			path: '/role/{roleId}',
		},
	],

	Domain: [
		{
			id: 'domain.listByOrg',
			name: 'List Domains by Organization',
			description: 'List all domains for an organization.',
			method: 'GET',
			path: '/org/{orgId}/domains',
		},
		{
			id: 'domain.get',
			name: 'Get Domain',
			description: 'Get a domain by domainId.',
			method: 'GET',
			path: '/org/{orgId}/domain/{domainId}',
		},
	],

	User: [
		{
			id: 'user.get',
			name: 'Get User by ID',
			description: 'Get a user by ID.',
			method: 'GET',
			path: '/user/{userId}',
		},
		{
			id: 'user.listByOrg',
			name: 'List Users in Organization',
			description: 'List users in an organization.',
			method: 'GET',
			path: '/org/{orgId}/users',
		},
	],

	'Identity Provider': [
		{
			id: 'idp.list',
			name: 'List Identity Providers',
			description: 'List all identity providers in the system.',
			method: 'GET',
			path: '/idp',
		},
		{
			id: 'idp.get',
			name: 'Get Identity Provider',
			description: 'Get an identity provider by idpId.',
			method: 'GET',
			path: '/idp/{idpId}',
		},
	],

	Blueprint: [
		{
			id: 'blueprint.listByOrg',
			name: 'List Blueprints by Organization',
			description: 'List all blueprints for an organization.',
			method: 'GET',
			path: '/org/{orgId}/blueprints',
		},
		{
			id: 'blueprint.apply',
			name: 'Apply Blueprint to Organization',
			description: 'Apply a base64-encoded JSON blueprint to an organization.',
			method: 'PUT',
			path: '/org/{orgId}/blueprint',
			bodyExample: `{
  "blueprint": "BASE64_ENCODED_BLUEPRINT"
}`,
		},
	],

	'API Key': [
		{
			id: 'apikey.listByOrg',
			name: 'List API Keys by Organization',
			description: 'List all API keys for an organization.',
			method: 'GET',
			path: '/org/{orgId}/api-keys',
		},
		{
			id: 'apikey.create',
			name: 'Create API Key',
			description: 'Create a new API key scoped to the organization.',
			method: 'PUT',
			path: '/org/{orgId}/api-key',
			bodyExample: `{
  "name": "Example API Key"
}`,
		},
	],

	'Access Token': [
		{
			id: 'accessToken.listByOrg',
			name: 'List Access Tokens by Organization',
			description: 'List all access tokens in an organization.',
			method: 'GET',
			path: '/org/{orgId}/access-tokens',
		},
		{
			id: 'accessToken.listByResource',
			name: 'List Access Tokens by Resource',
			description: 'List all access tokens for a resource.',
			method: 'GET',
			path: '/resource/{resourceId}/access-tokens',
		},
		{
			id: 'accessToken.createForResource',
			name: 'Create Access Token for Resource',
			description: 'Generate a new access token for a resource.',
			method: 'POST',
			path: '/resource/{resourceId}/access-token',
			bodyExample: `{
  "validForSeconds": 3600,
  "title": "Example token",
  "description": "Temporary access token"
}`,
		},
	],

	Invitation: [
		{
			id: 'invitation.listByOrg',
			name: 'List Invitations by Organization',
			description: 'List invitations in an organization.',
			method: 'GET',
			path: '/org/{orgId}/invitations',
		},
	],

	Logs: [
		{
			id: 'logs.requestByOrg',
			name: 'Query Request Logs by Organization',
			description: 'Query the request audit log for an organization.',
			method: 'GET',
			path: '/org/{orgId}/logs/request',
		},
	],

	Health: [
		{
			id: 'health.check',
			name: 'Health Check',
			description: 'Check the Pangolin API health endpoint.',
			method: 'GET',
			path: '/',
		},
	],

	Raw: [],
};

function getActionConfig(category: PangolinCategory, actionId: string): PangolinActionConfig | undefined {
	const list = PANGOLIN_ACTIONS_BY_CATEGORY[category] ?? [];
	return list.find((action) => action.id === actionId);
}

export class Pangolin implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin',
		name: 'pangolin',
		icon: 'file:../../icons/pangolin.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with a Pangolin reverse proxy via its REST API',
		defaults: {
			name: 'Pangolin',
		},
		subtitle: '={{$parameter["category"] + ( $parameter["action"] ? ": " + $parameter["action"] : "" )}}',
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pangolinApi',
				required: true,
			},
		],
		properties: [
			// ---------------------------------------------------------------------
			// Basic configuration
			// ---------------------------------------------------------------------
			{
				displayName: 'Action Category',
				name: 'category',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Organization', value: 'Organization' },
					{ name: 'Resource', value: 'Resource' },
					{ name: 'Target', value: 'Target' },
					{ name: 'Client', value: 'Client' },
					{ name: 'Site', value: 'Site' },
					{ name: 'Role', value: 'Role' },
					{ name: 'Domain', value: 'Domain' },
					{ name: 'User', value: 'User' },
					{ name: 'Identity Provider', value: 'Identity Provider' },
					{ name: 'Blueprint', value: 'Blueprint' },
					{ name: 'API Key', value: 'API Key' },
					{ name: 'Access Token', value: 'Access Token' },
					{ name: 'Invitation', value: 'Invitation' },
					{ name: 'Logs', value: 'Logs' },
					{ name: 'Health', value: 'Health' },
					{ name: 'Raw Request', value: 'Raw' },
				],
				default: 'Organization',
				description: 'Choose the set of Pangolin endpoints to work with',
			},

			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				typeOptions: {
					loadOptionsMethod: 'getActions',
				},
				default: 'org.list',
				description: 'Choose which Pangolin action to perform',
				displayOptions: {
					show: {
						category: [
							'Organization',
							'Resource',
							'Target',
							'Client',
							'Site',
							'Role',
							'Domain',
							'User',
							'Identity Provider',
							'Blueprint',
							'API Key',
							'Access Token',
							'Invitation',
							'Logs',
							'Health',
						],
					},
				},
			},

			// ---------------------------------------------------------------------
			// Raw request configuration
			// ---------------------------------------------------------------------
			{
				displayName: 'HTTP Method',
				name: 'method',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'GET', value: 'GET' },
					{ name: 'POST', value: 'POST' },
					{ name: 'PUT', value: 'PUT' },
					{ name: 'DELETE', value: 'DELETE' },
					{ name: 'PATCH', value: 'PATCH' },
				],
				default: 'GET',
				description: 'HTTP method to use for the request',
				displayOptions: {
					show: {
						category: ['Raw'],
					},
				},
			},
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'string',
				default: '/',
				description: 'Relative Pangolin API endpoint, for example /org/{orgId}/resources',
				displayOptions: {
					show: {
						category: ['Raw'],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'bodyJson',
				type: 'json',
				default: '',
				description: 'Request body as JSON',
				typeOptions: {
					rows: 5,
				},
				displayOptions: {
					show: {
						category: ['Raw'],
					},
				},
			},

			// ---------------------------------------------------------------------
			// Parameters for predefined actions
			// ---------------------------------------------------------------------
			{
				displayName: 'Parameters',
				name: 'parameters',
				type: 'collection',
				placeholder: 'Add Parameter',
				default: {},
				options: [
					{
						displayName: 'Path Parameters',
						name: 'pathParams',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								displayName: 'Parameter',
								name: 'parameter',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Name of the path parameter, for example orgId or resourceId',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Value to replace in the endpoint path',
									},
								],
							},
						],
					},
					{
						displayName: 'Query Parameters',
						name: 'queryParams',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								displayName: 'Parameter',
								name: 'parameter',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
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
					},
					{
						displayName: 'Body (JSON)',
						name: 'bodyJson',
						type: 'json',
						default: '',
						description: 'Body payload for the selected action (JSON)',
						typeOptions: {
							rows: 5,
						},
					},
				],
				displayOptions: {
					show: {
						category: [
							'Organization',
							'Resource',
							'Target',
							'Client',
							'Site',
							'Role',
							'Domain',
							'User',
							'Identity Provider',
							'Blueprint',
							'API Key',
							'Access Token',
							'Invitation',
							'Logs',
							'Health',
						],
					},
				},
			},

			// ---------------------------------------------------------------------
			// Options
			// ---------------------------------------------------------------------
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Ignore SSL Issues',
						name: 'ignoreSslIssues',
						type: 'boolean',
						default: false,
						description: 'Whether to allow self-signed certificates',
					},
					{
						displayName: 'Raw Response',
						name: 'raw',
						type: 'boolean',
						default: false,
						description:
							'Whether to return the full raw HTTP response, instead of only the response data',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getActions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const category = (this.getCurrentNodeParameter('category') as PangolinCategory) ?? 'Organization';
				const actions = PANGOLIN_ACTIONS_BY_CATEGORY[category] ?? [];

				return actions.map((action) => ({
					name: action.name,
					value: action.id,
					description: action.description,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const category = this.getNodeParameter('category', i) as PangolinCategory;
				const options = (this.getNodeParameter('options', i, {}) as IDataObject) || {};
				let method: IHttpRequestMethods;
				let endpoint: string;
				let body: unknown;
				let qs: IDataObject = {};

				if (category === 'Raw') {
					method = this.getNodeParameter('method', i) as IHttpRequestMethods;
					endpoint = this.getNodeParameter('endpoint', i) as string;
					body = this.getNodeParameter('bodyJson', i, {}) as IDataObject;
				} else {
					const actionId = this.getNodeParameter('action', i) as string;
					const actionConfig = getActionConfig(category, actionId);

					if (!actionConfig) {
						throw new NodeOperationError(
							this.getNode(),
							`Could not find configuration for action "${actionId}" in category "${category}".`,
						);
					}

					method = actionConfig.method;
					endpoint = actionConfig.path;

					const paramsCollection = (this.getNodeParameter('parameters', i, {}) as IDataObject) || {};

					// Path params
					const pathParams = ((paramsCollection.pathParams as IDataObject) || {}) as IDataObject;
					const pathParamArray = (pathParams.parameter as IDataObject[]) || [];
					for (const param of pathParamArray) {
						const name = param.name as string;
						const value = param.value as string;
						if (name && value !== undefined) {
							endpoint = endpoint.replace(`{${name}}`, encodeURIComponent(String(value)));
						}
					}

					// Query params
					const queryParams = ((paramsCollection.queryParams as IDataObject) || {}) as IDataObject;
					const queryParamArray = (queryParams.parameter as IDataObject[]) || [];
					for (const param of queryParamArray) {
						const name = param.name as string;
						const value = param.value as string;
						if (name) {
							qs[name] = value;
						}
					}

					// Body JSON: user-provided or example
					const bodyJson = paramsCollection.bodyJson;
					if (bodyJson && bodyJson !== '') {
						body = bodyJson;
					} else if (actionConfig.bodyExample) {
						try {
							body = JSON.parse(actionConfig.bodyExample);
						} catch {
							body = actionConfig.bodyExample;
						}
					}
				}

				const requestOptions: IHttpRequestOptions = {
					method,
					url: endpoint,
					qs,
					body,
					json: true,
				};

				if (options.ignoreSslIssues === true) {
					// Cast to any to avoid TS complaining about additional properties
					(requestOptions as any).rejectUnauthorized = false;
				}

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'pangolinApi',
					requestOptions,
				);

				let outputData: IDataObject;

				if (options.raw === true) {
					outputData = response as IDataObject;
				} else if (response && typeof response === 'object' && 'data' in response) {
					// Most Pangolin endpoints wrap useful payload in `data`
					outputData = (response as IDataObject).data as IDataObject;
				} else {
					outputData = response as IDataObject;
				}

				returnData.push({
					json: outputData,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
