import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';

type PangolinResource =
	| 'health'
	| 'organization'
	| 'site'
	| 'resource'
	| 'target'
	| 'role'
	| 'user'
	| 'client'
	| 'domain'
	| 'invitation'
	| 'identityProvider'
	| 'blueprint'
	| 'accessToken'
	| 'apiKey'
	| 'logs';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RouteConfig {
	method: HttpMethod;
	path: string;
}

// Key format: `${resource}|${operationValue}`
const PANGOLIN_ROUTES: Record<string, RouteConfig> = {
	// -------------------------------------------------------------------------
	// Health
	// -------------------------------------------------------------------------
	'health|GET /': { method: 'GET', path: '/' },

	// -------------------------------------------------------------------------
	// Organization
	// -------------------------------------------------------------------------
	'organization|GET /orgs': { method: 'GET', path: '/orgs' },
	'organization|PUT /org': { method: 'PUT', path: '/org' },
	'organization|GET /org/{orgId}': { method: 'GET', path: '/org/{orgId}' },
	'organization|DELETE /org/{orgId}': { method: 'DELETE', path: '/org/{orgId}' },
	'organization|POST /org/{orgId}': { method: 'POST', path: '/org/{orgId}' },

	// -------------------------------------------------------------------------
	// Site
	// -------------------------------------------------------------------------
	'site|GET /org/{orgId}/site/{niceId}': {
		method: 'GET',
		path: '/org/{orgId}/site/{niceId}',
	},
	'site|GET /site/{siteId}': { method: 'GET', path: '/site/{siteId}' },
	'site|DELETE /site/{siteId}': { method: 'DELETE', path: '/site/{siteId}' },
	'site|POST /site/{siteId}': { method: 'POST', path: '/site/{siteId}' },
	'site|PUT /org/{orgId}/site': { method: 'PUT', path: '/org/{orgId}/site' },
	'site|GET /org/{orgId}/sites': { method: 'GET', path: '/org/{orgId}/sites' },
	'site|GET /org/{orgId}/pick-site-defaults': {
		method: 'GET',
		path: '/org/{orgId}/pick-site-defaults',
	},

	// -------------------------------------------------------------------------
	// Target
	// -------------------------------------------------------------------------
	'target|GET /target/{targetId}': { method: 'GET', path: '/target/{targetId}' },
	'target|DELETE /target/{targetId}': { method: 'DELETE', path: '/target/{targetId}' },
	'target|POST /target/{targetId}': { method: 'POST', path: '/target/{targetId}' },
	'target|PUT /resource/{resourceId}/target': {
		method: 'PUT',
		path: '/resource/{resourceId}/target',
	},
	'target|GET /resource/{resourceId}/targets': {
		method: 'GET',
		path: '/resource/{resourceId}/targets',
	},

	// -------------------------------------------------------------------------
	// Resource
	// -------------------------------------------------------------------------
	'resource|GET /org/{orgId}/resource/{niceId}': {
		method: 'GET',
		path: '/org/{orgId}/resource/{niceId}',
	},
	'resource|GET /resource/{resourceId}': {
		method: 'GET',
		path: '/resource/{resourceId}',
	},
	'resource|DELETE /resource/{resourceId}': {
		method: 'DELETE',
		path: '/resource/{resourceId}',
	},
	'resource|POST /resource/{resourceId}': {
		method: 'POST',
		path: '/resource/{resourceId}',
	},
	'resource|PUT /org/{orgId}/resource': {
		method: 'PUT',
		path: '/org/{orgId}/resource',
	},
	'resource|GET /org/{orgId}/resources': {
		method: 'GET',
		path: '/org/{orgId}/resources',
	},
	'resource|POST /resource/{resourceId}/users': {
		method: 'POST',
		path: '/resource/{resourceId}/users',
	},
	'resource|GET /resource/{resourceId}/users': {
		method: 'GET',
		path: '/resource/{resourceId}/users',
	},
	'resource|POST /resource/{resourceId}/password': {
		method: 'POST',
		path: '/resource/{resourceId}/password',
	},
	'resource|POST /resource/{resourceId}/pincode': {
		method: 'POST',
		path: '/resource/{resourceId}/pincode',
	},
	'resource|POST /resource/{resourceId}/whitelist': {
		method: 'POST',
		path: '/resource/{resourceId}/whitelist',
	},
	'resource|GET /resource/{resourceId}/whitelist': {
		method: 'GET',
		path: '/resource/{resourceId}/whitelist',
	},
	'resource|PUT /resource/{resourceId}/rule': {
		method: 'PUT',
		path: '/resource/{resourceId}/rule',
	},
	'resource|DELETE /resource/{resourceId}/rule/{ruleId}': {
		method: 'DELETE',
		path: '/resource/{resourceId}/rule/{ruleId}',
	},
	'resource|POST /resource/{resourceId}/rule/{ruleId}': {
		method: 'POST',
		path: '/resource/{resourceId}/rule/{ruleId}',
	},
	'resource|GET /resource/{resourceId}/rules': {
		method: 'GET',
		path: '/resource/{resourceId}/rules',
	},
	'resource|POST /resource/{resourceId}/header-auth': {
		method: 'POST',
		path: '/resource/{resourceId}/header-auth',
	},
	'resource|POST /resource/{resourceId}/whitelist/add': {
		method: 'POST',
		path: '/resource/{resourceId}/whitelist/add',
	},
	'resource|POST /resource/{resourceId}/whitelist/remove': {
		method: 'POST',
		path: '/resource/{resourceId}/whitelist/remove',
	},
	'resource|POST /resource/{resourceId}/roles': {
		method: 'POST',
		path: '/resource/{resourceId}/roles',
	},
	'resource|GET /resource/{resourceId}/roles': {
		method: 'GET',
		path: '/resource/{resourceId}/roles',
	},
	'resource|POST /resource/{resourceId}/access-token': {
		method: 'POST',
		path: '/resource/{resourceId}/access-token',
	},
	'resource|GET /resource/{resourceId}/access-tokens': {
		method: 'GET',
		path: '/resource/{resourceId}/access-tokens',
	},

	// -------------------------------------------------------------------------
	// Role
	// -------------------------------------------------------------------------
	'role|PUT /org/{orgId}/role': {
		method: 'PUT',
		path: '/org/{orgId}/role',
	},
	'role|DELETE /role/{roleId}': {
		method: 'DELETE',
		path: '/role/{roleId}',
	},
	'role|GET /role/{roleId}': {
		method: 'GET',
		path: '/role/{roleId}',
	},
	'role|GET /org/{orgId}/roles': {
		method: 'GET',
		path: '/org/{orgId}/roles',
	},
	'role|POST /role/{roleId}/add/{userId}': {
		method: 'POST',
		path: '/role/{roleId}/add/{userId}',
	},

	// -------------------------------------------------------------------------
	// User
	// -------------------------------------------------------------------------
	'user|GET /org/{orgId}/user/{userId}/check': {
		method: 'GET',
		path: '/org/{orgId}/user/{userId}/check',
	},
	'user|DELETE /org/{orgId}/user/{userId}': {
		method: 'DELETE',
		path: '/org/{orgId}/user/{userId}',
	},
	'user|GET /org/{orgId}/user/{userId}': {
		method: 'GET',
		path: '/org/{orgId}/user/{userId}',
	},
	'user|POST /org/{orgId}/user/{userId}': {
		method: 'POST',
		path: '/org/{orgId}/user/{userId}',
	},
	'user|GET /org/{orgId}/users': {
		method: 'GET',
		path: '/org/{orgId}/users',
	},
	'user|PUT /org/{orgId}/user': {
		method: 'PUT',
		path: '/org/{orgId}/user',
	},
	'user|GET /user/{userId}': {
		method: 'GET',
		path: '/user/{userId}',
	},
	'user|POST /user/{userId}/2fa': {
		method: 'POST',
		path: '/user/{userId}/2fa',
	},

	// -------------------------------------------------------------------------
	// Client
	// -------------------------------------------------------------------------
	'client|GET /org/{orgId}/pick-client-defaults': {
		method: 'GET',
		path: '/org/{orgId}/pick-client-defaults',
	},
	'client|PUT /org/{orgId}/client': {
		method: 'PUT',
		path: '/org/{orgId}/client',
	},
	'client|DELETE /client/{clientId}': {
		method: 'DELETE',
		path: '/client/{clientId}',
	},
	'client|POST /client/{clientId}': {
		method: 'POST',
		path: '/client/{clientId}',
	},
	'client|GET /client/{clientId}': {
		method: 'GET',
		path: '/client/{clientId}',
	},
	'client|GET /org/{orgId}/clients': {
		method: 'GET',
		path: '/org/{orgId}/clients',
	},
	'client|PUT /org/{orgId}/site/{siteId}/resource': {
		method: 'PUT',
		path: '/org/{orgId}/site/{siteId}/resource',
	},
	'client|DELETE /org/{orgId}/site/{siteId}/resource/{siteResourceId}': {
		method: 'DELETE',
		path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
	},
	'client|GET /org/{orgId}/site/{siteId}/resource/{siteResourceId}': {
		method: 'GET',
		path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
	},
	'client|POST /org/{orgId}/site/{siteId}/resource/{siteResourceId}': {
		method: 'POST',
		path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
	},
	'client|GET /org/{orgId}/site/{siteId}/resource/nice/{niceId}': {
		method: 'GET',
		path: '/org/{orgId}/site/{siteId}/resource/nice/{niceId}',
	},
	'client|GET /org/{orgId}/site/{siteId}/resources': {
		method: 'GET',
		path: '/org/{orgId}/site/{siteId}/resources',
	},
    'client|GET /org/{orgId}/site-resources': {
		method: 'GET',
		path: '/org/{orgId}/site-resources',
	},

	// -------------------------------------------------------------------------
	// Domain
	// -------------------------------------------------------------------------
	'domain|GET /org/{orgId}/domains': {
		method: 'GET',
		path: '/org/{orgId}/domains',
	},
	'domain|GET /org/{orgId}/domain/{domainId}': {
		method: 'GET',
		path: '/org/{orgId}/domain/{domainId}',
	},
	'domain|PATCH /org/{orgId}/domain/{domainId}': {
		method: 'PATCH',
		path: '/org/{orgId}/domain/{domainId}',
	},
	'domain|GET /org/{orgId}/domain/{domainId}/dns-records': {
		method: 'GET',
		path: '/org/{orgId}/domain/{domainId}/dns-records',
	},

	// -------------------------------------------------------------------------
	// Invitation
	// -------------------------------------------------------------------------
	'invitation|POST /org/{orgId}/create-invite': {
		method: 'POST',
		path: '/org/{orgId}/create-invite',
	},
	'invitation|GET /org/{orgId}/invitations': {
		method: 'GET',
		path: '/org/{orgId}/invitations',
	},

	// -------------------------------------------------------------------------
	// Identity Provider
	// -------------------------------------------------------------------------
	'identityProvider|PUT /idp/oidc': {
		method: 'PUT',
		path: '/idp/oidc',
	},
	'identityProvider|POST /idp/{idpId}/oidc': {
		method: 'POST',
		path: '/idp/{idpId}/oidc',
	},
	'identityProvider|DELETE /idp/{idpId}': {
		method: 'DELETE',
		path: '/idp/{idpId}',
	},
	'identityProvider|GET /idp/{idpId}': {
		method: 'GET',
		path: '/idp/{idpId}',
	},
	'identityProvider|GET /idp': {
		method: 'GET',
		path: '/idp',
	},
	'identityProvider|PUT /idp/{idpId}/org/{orgId}': {
		method: 'PUT',
		path: '/idp/{idpId}/org/{orgId}',
	},
	'identityProvider|DELETE /idp/{idpId}/org/{orgId}': {
		method: 'DELETE',
		path: '/idp/{idpId}/org/{orgId}',
	},
	'identityProvider|POST /idp/{idpId}/org/{orgId}': {
		method: 'POST',
		path: '/idp/{idpId}/org/{orgId}',
	},
	'identityProvider|GET /idp/{idpId}/org': {
		method: 'GET',
		path: '/idp/{idpId}/org',
	},

	// -------------------------------------------------------------------------
	// Blueprint
	// -------------------------------------------------------------------------
	'blueprint|GET /org/{orgId}/blueprints': {
		method: 'GET',
		path: '/org/{orgId}/blueprints',
	},
	'blueprint|PUT /org/{orgId}/blueprint': {
		method: 'PUT',
		path: '/org/{orgId}/blueprint',
	},
	'blueprint|GET /org/{orgId}/blueprint/{blueprintId}': {
		method: 'GET',
		path: '/org/{orgId}/blueprint/{blueprintId}',
	},

	// -------------------------------------------------------------------------
	// Access Token
	// -------------------------------------------------------------------------
	'accessToken|GET /org/{orgId}/access-tokens': {
		method: 'GET',
		path: '/org/{orgId}/access-tokens',
	},
	'accessToken|GET /resource/{resourceId}/access-tokens': {
		method: 'GET',
		path: '/resource/{resourceId}/access-tokens',
	},
	'accessToken|POST /resource/{resourceId}/access-token': {
		method: 'POST',
		path: '/resource/{resourceId}/access-token',
	},
	'accessToken|DELETE /access-token/{accessTokenId}': {
		method: 'DELETE',
		path: '/access-token/{accessTokenId}',
	},

	// -------------------------------------------------------------------------
	// API Key
	// -------------------------------------------------------------------------
	'apiKey|DELETE /org/{orgId}/api-key/{apiKeyId}': {
		method: 'DELETE',
		path: '/org/{orgId}/api-key/{apiKeyId}',
	},
	'apiKey|GET /org/{orgId}/api-key/{apiKeyId}/actions': {
		method: 'GET',
		path: '/org/{orgId}/api-key/{apiKeyId}/actions',
	},
	'apiKey|POST /org/{orgId}/api-key/{apiKeyId}/actions': {
		method: 'POST',
		path: '/org/{orgId}/api-key/{apiKeyId}/actions',
	},
	'apiKey|GET /org/{orgId}/api-keys': {
		method: 'GET',
		path: '/org/{orgId}/api-keys',
	},
	'apiKey|PUT /org/{orgId}/api-key': {
		method: 'PUT',
		path: '/org/{orgId}/api-key',
	},

	// -------------------------------------------------------------------------
	// Logs
	// -------------------------------------------------------------------------
	'logs|GET /org/{orgId}/logs/request': {
		method: 'GET',
		path: '/org/{orgId}/logs/request',
	},
};

export class Pangolin implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin',
		name: 'pangolin',
		icon: 'file:../../icons/pangolin.svg',
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
				name: 'PangolinApi',
				required: true,
			},
		],
		properties: [
			// ------------------------------------------------------------------
			// Resource (categories)
			// ------------------------------------------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Health', value: 'health' },
					{ name: 'Organization', value: 'organization' },
					{ name: 'Site', value: 'site' },
					{ name: 'Resource', value: 'resource' },
					{ name: 'Target', value: 'target' },
					{ name: 'Role', value: 'role' },
					{ name: 'User', value: 'user' },
					{ name: 'Client', value: 'client' },
					{ name: 'Domain', value: 'domain' },
					{ name: 'Invitation', value: 'invitation' },
					{ name: 'Identity Provider', value: 'identityProvider' },
					{ name: 'Blueprint', value: 'blueprint' },
					{ name: 'Access Token', value: 'accessToken' },
					{ name: 'API Key', value: 'apiKey' },
					{ name: 'Logs', value: 'logs' },
				],
				default: 'resource',
				description: 'Resource category to operate on',
			},

			// ------------------------------------------------------------------
			// Health Actions
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
						name: 'GET /',
						value: 'GET /',
						action: 'Get health',
						description: 'Health check',
					},
				],
				default: 'GET /',
			},

			// ------------------------------------------------------------------
			// Organization Actions
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
						name: 'GET /orgs',
						value: 'GET /orgs',
						action: 'Send GET /orgs',
						description: 'List all organizations in the system.',
					},
					{
						name: 'PUT /org',
						value: 'PUT /org',
						action: 'Send PUT /org',
						description: 'Create a new organization',
					},
					{
						name: 'GET /org/{orgId}',
						value: 'GET /org/{orgId}',
						action: 'Send GET /org/{orgId}',
						description: 'Get an organization',
					},
					{
						name: 'DELETE /org/{orgId}',
						value: 'DELETE /org/{orgId}',
						action: 'Send DELETE /org/{orgId}',
						description: 'Delete an organization',
					},
					{
						name: 'POST /org/{orgId}',
						value: 'POST /org/{orgId}',
						action: 'Send POST /org/{orgId}',
						description: 'Update an organization',
					},
				],
				default: 'GET /orgs',
			},

			// ------------------------------------------------------------------
			// Site Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['site'],
					},
				},
				options: [
					{
						name: 'GET /org/{orgId}/site/{niceId}',
						value: 'GET /org/{orgId}/site/{niceId}',
						action: 'Send GET /org/{orgId}/site/{niceId}',
						description:
							'Get a site by orgId and niceId. NiceId is a readable ID for the site and unique on a per org basis.',
					},
					{
						name: 'GET /site/{siteId}',
						value: 'GET /site/{siteId}',
						action: 'Send GET /site/{siteId}',
						description: 'Get a site by siteId.',
					},
					{
						name: 'DELETE /site/{siteId}',
						value: 'DELETE /site/{siteId}',
						action: 'Send DELETE /site/{siteId}',
						description: 'Delete a site and all its associated data.',
					},
					{
						name: 'POST /site/{siteId}',
						value: 'POST /site/{siteId}',
						action: 'Send POST /site/{siteId}',
						description: 'Update a site.',
					},
					{
						name: 'PUT /org/{orgId}/site',
						value: 'PUT /org/{orgId}/site',
						action: 'Send PUT /org/{orgId}/site',
						description: 'Create a new site.',
					},
					{
						name: 'GET /org/{orgId}/sites',
						value: 'GET /org/{orgId}/sites',
						action: 'Send GET /org/{orgId}/sites',
						description: 'List all sites in an organization',
					},
					{
						name: 'GET /org/{orgId}/pick-site-defaults',
						value: 'GET /org/{orgId}/pick-site-defaults',
						action: 'Send GET /org/{orgId}/pick-site-defaults',
						description:
							'Return pre-requisite data for creating a site, such as the exit node, subnet, Newt credentials, etc.',
					},
				],
				default: 'GET /site/{siteId}',
			},

			// ------------------------------------------------------------------
			// Resource Actions
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
						name: 'GET /org/{orgId}/resource/{niceId}',
						value: 'GET /org/{orgId}/resource/{niceId}',
						action: 'Send GET /org/{orgId}/resource/{niceId}',
						description:
							'Get a resource by orgId and niceId. NiceId is a readable ID for the resource and unique on a per org basis.',
					},
					{
						name: 'GET /resource/{resourceId}',
						value: 'GET /resource/{resourceId}',
						action: 'Send GET /resource/{resourceId}',
						description: 'Get a resource by resourceId.',
					},
					{
						name: 'DELETE /resource/{resourceId}',
						value: 'DELETE /resource/{resourceId}',
						action: 'Send DELETE /resource/{resourceId}',
						description: 'Delete a resource.',
					},
					{
						name: 'POST /resource/{resourceId}',
						value: 'POST /resource/{resourceId}',
						action: 'Send POST /resource/{resourceId}',
						description: 'Update a resource.',
					},
					{
						name: 'PUT /org/{orgId}/resource',
						value: 'PUT /org/{orgId}/resource',
						action: 'Send PUT /org/{orgId}/resource',
						description: 'Create a resource.',
					},
					{
						name: 'GET /org/{orgId}/resources',
						value: 'GET /org/{orgId}/resources',
						action: 'Send GET /org/{orgId}/resources',
						description: 'List resources for an organization.',
					},
					{
						name: 'POST /resource/{resourceId}/users',
						value: 'POST /resource/{resourceId}/users',
						action: 'Send POST /resource/{resourceId}/users',
						description:
							'Set users for a resource. This will replace all existing users.',
					},
					{
						name: 'GET /resource/{resourceId}/users',
						value: 'GET /resource/{resourceId}/users',
						action: 'Send GET /resource/{resourceId}/users',
						description: 'List all users for a resource.',
					},
					{
						name: 'POST /resource/{resourceId}/password',
						value: 'POST /resource/{resourceId}/password',
						action: 'Send POST /resource/{resourceId}/password',
						description:
							'Set the password for a resource. Setting the password to null will remove it.',
					},
					{
						name: 'POST /resource/{resourceId}/pincode',
						value: 'POST /resource/{resourceId}/pincode',
						action: 'Send POST /resource/{resourceId}/pincode',
						description:
							'Set the PIN code for a resource. Setting the PIN code to null will remove it.',
					},
					{
						name: 'POST /resource/{resourceId}/whitelist',
						value: 'POST /resource/{resourceId}/whitelist',
						action: 'Send POST /resource/{resourceId}/whitelist',
						description:
							'Set email whitelist for a resource. This will replace all existing emails.',
					},
					{
						name: 'GET /resource/{resourceId}/whitelist',
						value: 'GET /resource/{resourceId}/whitelist',
						action: 'Send GET /resource/{resourceId}/whitelist',
						description:
							'Get the whitelist of emails for a specific resource.',
					},
					{
						name: 'PUT /resource/{resourceId}/rule',
						value: 'PUT /resource/{resourceId}/rule',
						action: 'Send PUT /resource/{resourceId}/rule',
						description: 'Create a resource rule.',
					},
					{
						name: 'DELETE /resource/{resourceId}/rule/{ruleId}',
						value: 'DELETE /resource/{resourceId}/rule/{ruleId}',
						action: 'Send DELETE /resource/{resourceId}/rule/{ruleId}',
						description: 'Delete a resource rule.',
					},
					{
						name: 'POST /resource/{resourceId}/rule/{ruleId}',
						value: 'POST /resource/{resourceId}/rule/{ruleId}',
						action: 'Send POST /resource/{resourceId}/rule/{ruleId}',
						description: 'Update a resource rule.',
					},
					{
						name: 'GET /resource/{resourceId}/rules',
						value: 'GET /resource/{resourceId}/rules',
						action: 'Send GET /resource/{resourceId}/rules',
						description: 'List rules for a resource.',
					},
					{
						name: 'POST /resource/{resourceId}/header-auth',
						value: 'POST /resource/{resourceId}/header-auth',
						action: 'Send POST /resource/{resourceId}/header-auth',
						description:
							'Set or update the header authentication for a resource. If user and password is not provided, it will remove the header authentication.',
					},
					{
						name: 'POST /resource/{resourceId}/whitelist/add',
						value: 'POST /resource/{resourceId}/whitelist/add',
						action: 'Send POST /resource/{resourceId}/whitelist/add',
						description:
							'Add a single email to the resource whitelist.',
					},
					{
						name: 'POST /resource/{resourceId}/whitelist/remove',
						value: 'POST /resource/{resourceId}/whitelist/remove',
						action: 'Send POST /resource/{resourceId}/whitelist/remove',
						description:
							'Remove a single email from the resource whitelist.',
					},
					{
						name: 'POST /resource/{resourceId}/roles',
						value: 'POST /resource/{resourceId}/roles',
						action: 'Send POST /resource/{resourceId}/roles',
						description:
							'Set roles for a resource. This will replace all existing roles.',
					},
					{
						name: 'GET /resource/{resourceId}/roles',
						value: 'GET /resource/{resourceId}/roles',
						action: 'Send GET /resource/{resourceId}/roles',
						description: 'List all roles for a resource.',
					},
					{
						name: 'POST /resource/{resourceId}/access-token',
						value: 'POST /resource/{resourceId}/access-token',
						action: 'Send POST /resource/{resourceId}/access-token',
						description: 'Generate a new access token for a resource.',
					},
					{
						name: 'GET /resource/{resourceId}/access-tokens',
						value: 'GET /resource/{resourceId}/access-tokens',
						action: 'Send GET /resource/{resourceId}/access-tokens',
						description:
							'List all access tokens in an organization (for a resource).',
					},
				],
				default: 'GET /resource/{resourceId}',
			},

			// ------------------------------------------------------------------
			// Target Actions
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
						name: 'GET /target/{targetId}',
						value: 'GET /target/{targetId}',
						action: 'Send GET /target/{targetId}',
						description: 'Get a target.',
					},
					{
						name: 'DELETE /target/{targetId}',
						value: 'DELETE /target/{targetId}',
						action: 'Send DELETE /target/{targetId}',
						description: 'Delete a target.',
					},
					{
						name: 'POST /target/{targetId}',
						value: 'POST /target/{targetId}',
						action: 'Send POST /target/{targetId}',
						description: 'Update a target.',
					},
					{
						name: 'PUT /resource/{resourceId}/target',
						value: 'PUT /resource/{resourceId}/target',
						action: 'Send PUT /resource/{resourceId}/target',
						description: 'Create a target for a resource.',
					},
					{
						name: 'GET /resource/{resourceId}/targets',
						value: 'GET /resource/{resourceId}/targets',
						action: 'Send GET /resource/{resourceId}/targets',
						description: 'List targets for a resource.',
					},
				],
				default: 'GET /target/{targetId}',
			},

			// ------------------------------------------------------------------
			// Role Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['role'],
					},
				},
				options: [
					{
						name: 'PUT /org/{orgId}/role',
						value: 'PUT /org/{orgId}/role',
						action: 'Send PUT /org/{orgId}/role',
						description: 'Create a role.',
					},
					{
						name: 'DELETE /role/{roleId}',
						value: 'DELETE /role/{roleId}',
						action: 'Send DELETE /role/{roleId}',
						description: 'Delete a role.',
					},
					{
						name: 'GET /role/{roleId}',
						value: 'GET /role/{roleId}',
						action: 'Send GET /role/{roleId}',
						description: 'Get a role.',
					},
					{
						name: 'GET /org/{orgId}/roles',
						value: 'GET /org/{orgId}/roles',
						action: 'Send GET /org/{orgId}/roles',
						description: 'List roles.',
					},
					{
						name: 'POST /role/{roleId}/add/{userId}',
						value: 'POST /role/{roleId}/add/{userId}',
						action: 'Send POST /role/{roleId}/add/{userId}',
						description: 'Add a role to a user.',
					},
				],
				default: 'GET /org/{orgId}/roles',
			},

			// ------------------------------------------------------------------
			// User Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'GET /org/{orgId}/user/{userId}/check',
						value: 'GET /org/{orgId}/user/{userId}/check',
						action: 'Send GET /org/{orgId}/user/{userId}/check',
						description: 'Check a user\'s access in an organization.',
					},
					{
						name: 'DELETE /org/{orgId}/user/{userId}',
						value: 'DELETE /org/{orgId}/user/{userId}',
						action: 'Send DELETE /org/{orgId}/user/{userId}',
						description: 'Remove a user from an organization.',
					},
					{
						name: 'GET /org/{orgId}/user/{userId}',
						value: 'GET /org/{orgId}/user/{userId}',
						action: 'Send GET /org/{orgId}/user/{userId}',
						description: 'Get a user in an organization.',
					},
					{
						name: 'POST /org/{orgId}/user/{userId}',
						value: 'POST /org/{orgId}/user/{userId}',
						action: 'Send POST /org/{orgId}/user/{userId}',
						description: 'Update a user in an org.',
					},
					{
						name: 'GET /org/{orgId}/users',
						value: 'GET /org/{orgId}/users',
						action: 'Send GET /org/{orgId}/users',
						description: 'List users in an organization.',
					},
					{
						name: 'PUT /org/{orgId}/user',
						value: 'PUT /org/{orgId}/user',
						action: 'Send PUT /org/{orgId}/user',
						description: 'Create an organization user.',
					},
					{
						name: 'GET /user/{userId}',
						value: 'GET /user/{userId}',
						action: 'Send GET /user/{userId}',
						description: 'Get a user by ID.',
					},
					{
						name: 'POST /user/{userId}/2fa',
						value: 'POST /user/{userId}/2fa',
						action: 'Send POST /user/{userId}/2fa',
						description: 'Update a user\'s 2FA status.',
					},
				],
				default: 'GET /org/{orgId}/users',
			},

			// ------------------------------------------------------------------
			// Client Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['client'],
					},
				},
				options: [
					{
						name: 'GET /org/{orgId}/pick-client-defaults',
						value: 'GET /org/{orgId}/pick-client-defaults',
						action: 'Send GET /org/{orgId}/pick-client-defaults',
						description: 'Return pre-requisite data for creating a client.',
					},
					{
						name: 'PUT /org/{orgId}/client',
						value: 'PUT /org/{orgId}/client',
						action: 'Send PUT /org/{orgId}/client',
						description: 'Create a new client.',
					},
					{
						name: 'DELETE /client/{clientId}',
						value: 'DELETE /client/{clientId}',
						action: 'Send DELETE /client/{clientId}',
						description: 'Delete a client by its client ID.',
					},
					{
						name: 'POST /client/{clientId}',
						value: 'POST /client/{clientId}',
						action: 'Send POST /client/{clientId}',
						description: 'Update a client by its client ID.',
					},
					{
						name: 'GET /client/{clientId}',
						value: 'GET /client/{clientId}',
						action: 'Send GET /client/{clientId}',
						description: 'Get a client by its client ID.',
					},
					{
						name: 'GET /org/{orgId}/clients',
						value: 'GET /org/{orgId}/clients',
						action: 'Send GET /org/{orgId}/clients',
						description: 'List all clients for an organization.',
					},
					{
						name: 'PUT /org/{orgId}/site/{siteId}/resource',
						value: 'PUT /org/{orgId}/site/{siteId}/resource',
						action: 'Send PUT /org/{orgId}/site/{siteId}/resource',
						description: 'Create a new site resource.',
					},
					{
						name: 'DELETE /org/{orgId}/site/{siteId}/resource/{siteResourceId}',
						value: 'DELETE /org/{orgId}/site/{siteId}/resource/{siteResourceId}',
						action: 'Send DELETE /org/{orgId}/site/{siteId}/resource/{siteResourceId}',
						description: 'Delete a site resource.',
					},
					{
						name: 'GET /org/{orgId}/site/{siteId}/resource/{siteResourceId}',
						value: 'GET /org/{orgId}/site/{siteId}/resource/{siteResourceId}',
						action: 'Send GET /org/{orgId}/site/{siteId}/resource/{siteResourceId}',
						description: 'Get a specific site resource by siteResourceId.',
					},
					{
						name: 'POST /org/{orgId}/site/{siteId}/resource/{siteResourceId}',
						value: 'POST /org/{orgId}/site/{siteId}/resource/{siteResourceId}',
						action: 'Send POST /org/{orgId}/site/{siteId}/resource/{siteResourceId}',
						description: 'Update a site resource.',
					},
					{
						name: 'GET /org/{orgId}/site/{siteId}/resource/nice/{niceId}',
						value: 'GET /org/{orgId}/site/{siteId}/resource/nice/{niceId}',
						action: 'Send GET /org/{orgId}/site/{siteId}/resource/nice/{niceId}',
						description: 'Get a specific site resource by niceId.',
					},
					{
						name: 'GET /org/{orgId}/site/{siteId}/resources',
						value: 'GET /org/{orgId}/site/{siteId}/resources',
						action: 'Send GET /org/{orgId}/site/{siteId}/resources',
						description: 'List site resources for a site.',
					},
					{
						name: 'GET /org/{orgId}/site-resources',
						value: 'GET /org/{orgId}/site-resources',
						action: 'Send GET /org/{orgId}/site-resources',
						description: 'List all site resources for an organization.',
					},
				],
				default: 'GET /org/{orgId}/clients',
			},

			// ------------------------------------------------------------------
			// Domain Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['domain'],
					},
				},
				options: [
					{
						name: 'GET /org/{orgId}/domains',
						value: 'GET /org/{orgId}/domains',
						action: 'Send GET /org/{orgId}/domains',
						description: 'List all domains for a organization.',
					},
					{
						name: 'GET /org/{orgId}/domain/{domainId}',
						value: 'GET /org/{orgId}/domain/{domainId}',
						action: 'Send GET /org/{orgId}/domain/{domainId}',
						description: 'Get a domain by domainId.',
					},
					{
						name: 'PATCH /org/{orgId}/domain/{domainId}',
						value: 'PATCH /org/{orgId}/domain/{domainId}',
						action: 'Send PATCH /org/{orgId}/domain/{domainId}',
						description: 'Update a domain by domainId.',
					},
					{
						name: 'GET /org/{orgId}/domain/{domainId}/dns-records',
						value: 'GET /org/{orgId}/domain/{domainId}/dns-records',
						action: 'Send GET /org/{orgId}/domain/{domainId}/dns-records',
						description: 'Get all DNS records for a domain by domainId.',
					},
				],
				default: 'GET /org/{orgId}/domains',
			},

			// ------------------------------------------------------------------
			// Invitation Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['invitation'],
					},
				},
				options: [
					{
						name: 'POST /org/{orgId}/create-invite',
						value: 'POST /org/{orgId}/create-invite',
						action: 'Send POST /org/{orgId}/create-invite',
						description: 'Invite a user to join an organization.',
					},
					{
						name: 'GET /org/{orgId}/invitations',
						value: 'GET /org/{orgId}/invitations',
						action: 'Send GET /org/{orgId}/invitations',
						description: 'List invitations in an organization.',
					},
				],
				default: 'GET /org/{orgId}/invitations',
			},

			// ------------------------------------------------------------------
			// Identity Provider Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['identityProvider'],
					},
				},
				options: [
					{
						name: 'PUT /idp/oidc',
						value: 'PUT /idp/oidc',
						action: 'Send PUT /idp/oidc',
						description: 'Create an OIDC IdP.',
					},
					{
						name: 'POST /idp/{idpId}/oidc',
						value: 'POST /idp/{idpId}/oidc',
						action: 'Send POST /idp/{idpId}/oidc',
						description: 'Update an OIDC IdP.',
					},
					{
						name: 'DELETE /idp/{idpId}',
						value: 'DELETE /idp/{idpId}',
						action: 'Send DELETE /idp/{idpId}',
						description: 'Delete IDP.',
					},
					{
						name: 'GET /idp/{idpId}',
						value: 'GET /idp/{idpId}',
						action: 'Send GET /idp/{idpId}',
						description: 'Get an IDP by its IDP ID.',
					},
					{
						name: 'GET /idp',
						value: 'GET /idp',
						action: 'Send GET /idp',
						description: 'List all IDP in the system.',
					},
					{
						name: 'PUT /idp/{idpId}/org/{orgId}',
						value: 'PUT /idp/{idpId}/org/{orgId}',
						action: 'Send PUT /idp/{idpId}/org/{orgId}',
						description:
							'Create an IDP policy for an existing IDP on an organization.',
					},
					{
						name: 'DELETE /idp/{idpId}/org/{orgId}',
						value: 'DELETE /idp/{idpId}/org/{orgId}',
						action: 'Send DELETE /idp/{idpId}/org/{orgId}',
						description:
							'Delete an IDP policy for an existing IDP on an organization.',
					},
					{
						name: 'POST /idp/{idpId}/org/{orgId}',
						value: 'POST /idp/{idpId}/org/{orgId}',
						action: 'Send POST /idp/{idpId}/org/{orgId}',
						description: 'Update an IDP org policy.',
					},
					{
						name: 'GET /idp/{idpId}/org',
						value: 'GET /idp/{idpId}/org',
						action: 'Send GET /idp/{idpId}/org',
						description: 'List all org policies on an IDP.',
					},
				],
				default: 'GET /idp',
			},

			// ------------------------------------------------------------------
			// Blueprint Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['blueprint'],
					},
				},
				options: [
					{
						name: 'GET /org/{orgId}/blueprints',
						value: 'GET /org/{orgId}/blueprints',
						action: 'Send GET /org/{orgId}/blueprints',
						description: 'List all blueprints for a organization.',
					},
					{
						name: 'PUT /org/{orgId}/blueprint',
						value: 'PUT /org/{orgId}/blueprint',
						action: 'Send PUT /org/{orgId}/blueprint',
						description:
							'Apply a base64 encoded JSON blueprint to an organization',
					},
					{
						name: 'GET /org/{orgId}/blueprint/{blueprintId}',
						value: 'GET /org/{orgId}/blueprint/{blueprintId}',
						action: 'Send GET /org/{orgId}/blueprint/{blueprintId}',
						description: 'Get a blueprint by its blueprint ID.',
					},
				],
				default: 'GET /org/{orgId}/blueprints',
			},

			// ------------------------------------------------------------------
			// Access Token Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['accessToken'],
					},
				},
				options: [
					{
						name: 'GET /org/{orgId}/access-tokens',
						value: 'GET /org/{orgId}/access-tokens',
						action: 'Send GET /org/{orgId}/access-tokens',
						description: 'List all access tokens in an organization.',
					},
					{
						name: 'GET /resource/{resourceId}/access-tokens',
						value: 'GET /resource/{resourceId}/access-tokens',
						action: 'Send GET /resource/{resourceId}/access-tokens',
						description: 'List all access tokens in an organization.',
					},
					{
						name: 'POST /resource/{resourceId}/access-token',
						value: 'POST /resource/{resourceId}/access-token',
						action: 'Send POST /resource/{resourceId}/access-token',
						description: 'Generate a new access token for a resource.',
					},
					{
						name: 'DELETE /access-token/{accessTokenId}',
						value: 'DELETE /access-token/{accessTokenId}',
						action: 'Send DELETE /access-token/{accessTokenId}',
						description: 'Delete a access token.',
					},
				],
				default: 'GET /org/{orgId}/access-tokens',
			},

			// ------------------------------------------------------------------
			// API Key Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['apiKey'],
					},
				},
				options: [
					{
						name: 'DELETE /org/{orgId}/api-key/{apiKeyId}',
						value: 'DELETE /org/{orgId}/api-key/{apiKeyId}',
						action: 'Send DELETE /org/{orgId}/api-key/{apiKeyId}',
						description: 'Delete an API key.',
					},
					{
						name: 'GET /org/{orgId}/api-key/{apiKeyId}/actions',
						value: 'GET /org/{orgId}/api-key/{apiKeyId}/actions',
						action: 'Send GET /org/{orgId}/api-key/{apiKeyId}/actions',
						description: 'List all actions set for an API key.',
					},
					{
						name: 'POST /org/{orgId}/api-key/{apiKeyId}/actions',
						value: 'POST /org/{orgId}/api-key/{apiKeyId}/actions',
						action: 'Send POST /org/{orgId}/api-key/{apiKeyId}/actions',
						description:
							'Set actions for an API key. This will replace any existing actions.',
					},
					{
						name: 'GET /org/{orgId}/api-keys',
						value: 'GET /org/{orgId}/api-keys',
						action: 'Send GET /org/{orgId}/api-keys',
						description: 'List all API keys for an organization',
					},
					{
						name: 'PUT /org/{orgId}/api-key',
						value: 'PUT /org/{orgId}/api-key',
						action: 'Send PUT /org/{orgId}/api-key',
						description:
							'Create a new API key scoped to the organization.',
					},
				],
				default: 'GET /org/{orgId}/api-keys',
			},

			// ------------------------------------------------------------------
			// Logs Actions
			// ------------------------------------------------------------------
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['logs'],
					},
				},
				options: [
					{
						name: 'GET /org/{orgId}/logs/request',
						value: 'GET /org/{orgId}/logs/request',
						action: 'Send GET /org/{orgId}/logs/request',
						description:
							'Query the request audit log for an organization',
					},
				],
				default: 'GET /org/{orgId}/logs/request',
			},

			// ------------------------------------------------------------------
			// Generic Parameters
			// ------------------------------------------------------------------
			{
				displayName: 'Path Parameters',
				name: 'pathParams',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Path Parameter',
				description:
					'Path parameters to replace in the endpoint, such as orgId, resourceId, etc.',
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
								description:
									'Name of the path parameter (for example orgId, resourceId)',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to substitute into the path template',
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
				placeholder: 'Add Query Parameter',
				description:
					'Query string parameters such as limit, offset, or filters',
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
				default: {},
				description:
					'JSON body to send to the Pangolin API. You can paste the example payload from the Swagger docs here.',
			},

			// ------------------------------------------------------------------
			// Options
			// ------------------------------------------------------------------
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
						description:
							'Whether to ignore SSL certificate issues when connecting to Pangolin',
					},
					{
						displayName: 'Raw Response',
						name: 'raw',
						type: 'boolean',
						default: false,
						description:
							'Whether to return the full raw HTTP response instead of just the data',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = (await this.getCredentials('PangolinApi')) as IDataObject;
		const baseUrlRaw = (credentials.baseUrl as string) || '';
		const baseUrl = baseUrlRaw.replace(/\/+$/, '');

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as PangolinResource;
			const operation = this.getNodeParameter('operation', i) as string;
			const key = `${resource}|${operation}`;

			const route = PANGOLIN_ROUTES[key];
			if (!route) {
				throw new Error(`No route configuration found for ${key}`);
			}

			// Path params
			const pathParamsCollection = (this.getNodeParameter(
				'pathParams',
				i,
				{},
			) as IDataObject) as IDataObject;
			const pathParamsArray = (pathParamsCollection.parameter as IDataObject[]) || [];

			let path = route.path;
			for (const param of pathParamsArray) {
				const name = (param.name as string) || '';
				const value = param.value as string;
				if (!name) continue;
				path = path.replace(`{${name}}`, encodeURIComponent(String(value)));
			}

			// Query params
			const queryParamsCollection = (this.getNodeParameter(
				'queryParams',
				i,
				{},
			) as IDataObject) as IDataObject;
			const queryParamsArray = (queryParamsCollection.parameter as IDataObject[]) || [];
			const qs: IDataObject = {};
			for (const param of queryParamsArray) {
				const name = (param.name as string) || '';
				const value = param.value as string;
				if (!name) continue;
				qs[name] = value;
			}

			// Body
			const bodyJson = this.getNodeParameter('bodyJson', i, {}) as IDataObject;
			const hasBody =
				bodyJson && typeof bodyJson === 'object' && Object.keys(bodyJson).length > 0;

			const options = (this.getNodeParameter('options', i, {}) as IDataObject) || {};

			const requestOptions: IHttpRequestOptions = {
				method: route.method,
				url: `${baseUrl}/v1${path}`,
				qs,
				json: true,
			};

			if (hasBody) {
				requestOptions.body = bodyJson;
			}

			if (options.ignoreSslIssues === true) {
				(requestOptions as any).rejectUnauthorized = false;
			}

			const response = await this.helpers.requestWithAuthentication.call(
				this,
				'PangolinApi',
				requestOptions,
			);

			const raw = options.raw === true;
			const json =
				!raw && response && typeof response === 'object' && 'data' in response
					? (response as IDataObject).data ?? response
					: (response as IDataObject);

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(json as IDataObject | IDataObject[]),
				{ itemData: { item: i } },
			);

			returnData.push(...executionData);
		}

		return [returnData];
	}
}
