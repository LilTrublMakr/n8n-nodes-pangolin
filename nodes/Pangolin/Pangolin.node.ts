import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { pangolinApiRequest } from './GenericFunctions';

type PangolinAction = {
	key: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	/** Path without /v1 prefix, e.g. "/org/{orgId}/resources" */
	path: string;
	description: string;
	/** Optional example JSON body as string; used as default when Body is empty */
	bodyExample?: string;
};

/**
 * Actions grouped by category, derived from endpoints.txt.
 * Category keys match the `resource` values below.
 *
 * NOTE: You can add `bodyExample` for any POST/PUT/PATCH action if you want
 * the example JSON to be used automatically when the Body field is left empty.
 */
const PANGOLIN_ACTIONS: { [category: string]: PangolinAction[] } = {
	// -------------------------------------------------------------------------
	// Resource
	// -------------------------------------------------------------------------
	resource: [
		{
			key: 'createResource',
			method: 'PUT',
			path: '/org/{orgId}/resource',
			description: 'Create a resource.',
			bodyExample: `{
  "siteId": 1,
  "ip": "string",
  "method": "string",
  "port": 65535,
  "enabled": true,
  "hcEnabled": true,
  "hcPath": "string",
  "hcScheme": "string",
  "hcMode": "string",
  "hcHostname": "string",
  "hcPort": 1,
  "hcInterval": 6,
  "hcUnhealthyInterval": 6,
  "hcTimeout": 2,
  "hcHeaders": [
    {
      "name": "string",
      "value": "string"
    }
  ],
  "hcFollowRedirects": true,
  "hcMethod": "string",
  "hcStatus": 0,
  "path": "string",
  "pathMatchType": "exact",
  "rewritePath": "string",
  "rewritePathType": "exact",
  "priority": 1000
}`
		},
		{
			key: 'listOrgResources',
			method: 'GET',
			path: '/org/{orgId}/resources',
			description: 'List resources for an organization.',
		},
		{
			key: 'getResourceByNiceId',
			method: 'GET',
			path: '/org/{orgId}/resource/{niceId}',
			description:
				'Get a resource by orgId and niceId. NiceId is a readable ID for the resource and unique on a per org basis.',
		},
		{
			key: 'getResource',
			method: 'GET',
			path: '/resource/{resourceId}',
			description: 'Get a resource by resourceId.',
		},
		{
			key: 'deleteResource',
			method: 'DELETE',
			path: '/resource/{resourceId}',
			description: 'Delete a resource.',
		},
		{
			key: 'updateResource',
			method: 'POST',
			path: '/resource/{resourceId}',
			description: 'Update a resource.',
		},
		{
			key: 'setResourcePassword',
			method: 'POST',
			path: '/resource/{resourceId}/password',
			description:
				'Set the password for a resource. Setting the password to null will remove it.',
		},
		{
			key: 'setResourcePincode',
			method: 'POST',
			path: '/resource/{resourceId}/pincode',
			description:
				'Set the PIN code for a resource. Setting the PIN code to null will remove it.',
		},
		{
			key: 'setResourceWhitelist',
			method: 'POST',
			path: '/resource/{resourceId}/whitelist',
			description:
				'Set email whitelist for a resource. This will replace all existing emails.',
		},
		{
			key: 'getResourceWhitelist',
			method: 'GET',
			path: '/resource/{resourceId}/whitelist',
			description: 'Get the whitelist of emails for a specific resource.',
		},
		{
			key: 'addResourceWhitelistEmail',
			method: 'POST',
			path: '/resource/{resourceId}/whitelist/add',
			description: 'Add a single email to the resource whitelist.',
		},
		{
			key: 'removeResourceWhitelistEmail',
			method: 'POST',
			path: '/resource/{resourceId}/whitelist/remove',
			description: 'Remove a single email from the resource whitelist.',
		},
		{
			key: 'createResourceRule',
			method: 'PUT',
			path: '/resource/{resourceId}/rule',
			description: 'Create a resource rule.',
		},
		{
			key: 'deleteResourceRule',
			method: 'DELETE',
			path: '/resource/{resourceId}/rule/{ruleId}',
			description: 'Delete a resource rule.',
		},
		{
			key: 'updateResourceRule',
			method: 'POST',
			path: '/resource/{resourceId}/rule/{ruleId}',
			description: 'Update a resource rule.',
		},
		{
			key: 'listResourceRules',
			method: 'GET',
			path: '/resource/{resourceId}/rules',
			description: 'List rules for a resource.',
		},
		{
			key: 'setResourceHeaderAuth',
			method: 'POST',
			path: '/resource/{resourceId}/header-auth',
			description:
				'Set or update the header authentication for a resource. If user and password is not provided, it will remove the header authentication.',
		},
		{
			key: 'setResourceUsers',
			method: 'POST',
			path: '/resource/{resourceId}/users',
			description:
				'Set users for a resource. This will replace all existing users.',
		},
		{
			key: 'listResourceUsers',
			method: 'GET',
			path: '/resource/{resourceId}/users',
			description: 'List all users for a resource.',
		},
		{
			key: 'setResourceRoles',
			method: 'POST',
			path: '/resource/{resourceId}/roles',
			description:
				'Set roles for a resource. This will replace all existing roles.',
		},
		{
			key: 'listResourceRoles',
			method: 'GET',
			path: '/resource/{resourceId}/roles',
			description: 'List all roles for a resource.',
		},
		{
			key: 'createResourceTarget',
			method: 'PUT',
			path: '/resource/{resourceId}/target',
			description: 'Create a target for a resource.',
		},
		{
			key: 'listResourceTargets',
			method: 'GET',
			path: '/resource/{resourceId}/targets',
			description: 'List targets for a resource.',
		},
		{
			key: 'getResourceTarget',
			method: 'GET',
			path: '/resource/{resourceId}/target',
			description: 'Get the target associated with a resource.',
		},
	],

	// -------------------------------------------------------------------------
	// Role
	// -------------------------------------------------------------------------
	role: [
		{
			key: 'createRole',
			method: 'PUT',
			path: '/org/{orgId}/role',
			description: 'Create a role.',
		},
		{
			key: 'deleteRole',
			method: 'DELETE',
			path: '/role/{roleId}',
			description: 'Delete a role.',
		},
		{
			key: 'getRole',
			method: 'GET',
			path: '/role/{roleId}',
			description: 'Get a role.',
		},
		{
			key: 'listRoles',
			method: 'GET',
			path: '/org/{orgId}/roles',
			description: 'List roles.',
		},
		{
			key: 'addRoleToUser',
			method: 'POST',
			path: '/role/{roleId}/add/{userId}',
			description: 'Add a role to a user.',
		},
	],

	// -------------------------------------------------------------------------
	// User
	// -------------------------------------------------------------------------
	user: [
		{
			key: 'checkUserAccess',
			method: 'GET',
			path: '/org/{orgId}/user/{userId}/check',
			description: "Check a user's access in an organization.",
		},
		{
			key: 'listOrgUsers',
			method: 'GET',
			path: '/org/{orgId}/users',
			description: 'List users in an organization.',
		},
		{
			key: 'getOrgUser',
			method: 'GET',
			path: '/org/{orgId}/user/{userId}',
			description: 'Get a user in an organization.',
		},
		{
			key: 'updateOrgUser',
			method: 'POST',
			path: '/org/{orgId}/user/{userId}',
			description: 'Update a user in an org.',
		},
		{
			key: 'removeUserFromOrg',
			method: 'DELETE',
			path: '/org/{orgId}/user/{userId}',
			description: 'Remove a user from an organization.',
		},
		{
			key: 'createOrgUser',
			method: 'PUT',
			path: '/org/{orgId}/user',
			description: 'Create an organization user.',
		},
		{
			key: 'getUser',
			method: 'GET',
			path: '/user/{userId}',
			description: 'Get a user by ID.',
		},
		{
			key: 'updateUser2fa',
			method: 'POST',
			path: '/user/{userId}/2fa',
			description: "Update a user's 2FA status.",
		},
	],

	// -------------------------------------------------------------------------
	// Rule (kept as its own category, even though rules are under /resource)
	// -------------------------------------------------------------------------
	rule: [
		{
			key: 'createRule',
			method: 'PUT',
			path: '/resource/{resourceId}/rule',
			description: 'Create a resource rule.',
		},
		{
			key: 'deleteRule',
			method: 'DELETE',
			path: '/resource/{resourceId}/rule/{ruleId}',
			description: 'Delete a resource rule.',
		},
		{
			key: 'updateRule',
			method: 'POST',
			path: '/resource/{resourceId}/rule/{ruleId}',
			description: 'Update a resource rule.',
		},
		{
			key: 'listRules',
			method: 'GET',
			path: '/resource/{resourceId}/rules',
			description: 'List rules for a resource.',
		},
	],

	// -------------------------------------------------------------------------
	// Domain
	// -------------------------------------------------------------------------
	domain: [
		{
			key: 'getDomain',
			method: 'GET',
			path: '/org/{orgId}/domain/{domainId}',
			description: 'Get a domain by domainId.',
		},
		{
			key: 'updateDomain',
			method: 'PATCH',
			path: '/org/{orgId}/domain/{domainId}',
			description: 'Update a domain by domainId.',
		},
		{
			key: 'getDomainDnsRecords',
			method: 'GET',
			path: '/org/{orgId}/domain/{domainId}/dns-records',
			description: 'Get all DNS records for a domain by domainId.',
		},
		{
			key: 'listOrgDomains',
			method: 'GET',
			path: '/org/{orgId}/domains',
			description: 'List all domains for a organization.',
		},
	],

	// -------------------------------------------------------------------------
	// Invitation
	// -------------------------------------------------------------------------
	invitation: [
		{
			key: 'listInvitations',
			method: 'GET',
			path: '/org/{orgId}/invitations',
			description: 'List invitations in an organization.',
		},
		{
			key: 'createInvite',
			method: 'POST',
			path: '/org/{orgId}/create-invite',
			description: 'Invite a user to join an organization.',
		},
	],

	// -------------------------------------------------------------------------
	// Client
	// -------------------------------------------------------------------------
	client: [
		{
			key: 'pickClientDefaults',
			method: 'GET',
			path: '/org/{orgId}/pick-client-defaults',
			description: 'Return pre-requisite data for creating a client.',
		},
		{
			key: 'createClient',
			method: 'PUT',
			path: '/org/{orgId}/client',
			description: 'Create a new client.',
		},
		{
			key: 'deleteClient',
			method: 'DELETE',
			path: '/client/{clientId}',
			description: 'Delete a client by its client ID.',
		},
		{
			key: 'updateClient',
			method: 'POST',
			path: '/client/{clientId}',
			description: 'Update a client by its client ID.',
		},
		{
			key: 'getClient',
			method: 'GET',
			path: '/client/{clientId}',
			description: 'Get a client by its client ID.',
		},
		{
			key: 'listOrgClients',
			method: 'GET',
			path: '/org/{orgId}/clients',
			description: 'List all clients for an organization.',
		},
		{
			key: 'createSiteResource',
			method: 'PUT',
			path: '/org/{orgId}/site/{siteId}/resource',
			description: 'Create a new site resource.',
		},
		{
			key: 'deleteSiteResource',
			method: 'DELETE',
			path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
			description: 'Delete a site resource.',
		},
		{
			key: 'getSiteResource',
			method: 'GET',
			path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
			description: 'Get a specific site resource by siteResourceId.',
		},
		{
			key: 'updateSiteResource',
			method: 'POST',
			path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
			description: 'Update a site resource.',
		},
		{
			key: 'getSiteResourceByNiceId',
			method: 'GET',
			path: '/org/{orgId}/site/{siteId}/resource/nice/{niceId}',
			description: 'Get a specific site resource by niceId.',
		},
		{
			key: 'listSiteResources',
			method: 'GET',
			path: '/org/{orgId}/site/{siteId}/resources',
			description: 'List site resources for a site.',
		},
		{
			key: 'listOrgSiteResources',
			method: 'GET',
			path: '/org/{orgId}/site-resources',
			description: 'List all site resources for an organization.',
		},
	],

	// -------------------------------------------------------------------------
	// Site
	// -------------------------------------------------------------------------
	site: [
		{
			key: 'getSiteByNiceId',
			method: 'GET',
			path: '/org/{orgId}/site/{niceId}',
			description:
				'Get a site by orgId and niceId. NiceId is a readable ID for the site and unique on a per org basis.',
		},
		{
			key: 'getSite',
			method: 'GET',
			path: '/site/{siteId}',
			description: 'Get a site by siteId.',
		},
		{
			key: 'deleteSite',
			method: 'DELETE',
			path: '/site/{siteId}',
			description: 'Delete a site and all its associated data.',
		},
		{
			key: 'updateSite',
			method: 'POST',
			path: '/site/{siteId}',
			description: 'Update a site.',
		},
		{
			key: 'createSite',
			method: 'PUT',
			path: '/org/{orgId}/site',
			description: 'Create a new site.',
		},
		{
			key: 'listOrgSites',
			method: 'GET',
			path: '/org/{orgId}/sites',
			description: 'List all sites in an organization',
		},
		{
			key: 'pickSiteDefaults',
			method: 'GET',
			path: '/org/{orgId}/pick-site-defaults',
			description:
				'Return pre-requisite data for creating a site, such as the exit node, subnet, Newt credentials, etc.',
		},
	],

	// -------------------------------------------------------------------------
	// Access Token
	// -------------------------------------------------------------------------
	accessToken: [
		{
			key: 'generateAccessToken',
			method: 'POST',
			path: '/resource/{resourceId}/access-token',
			description: 'Generate a new access token for a resource.',
		},
		{
			key: 'listOrgAccessTokens',
			method: 'GET',
			path: '/org/{orgId}/access-tokens',
			description: 'List all access tokens in an organization.',
		},
		{
			key: 'listResourceAccessTokens',
			method: 'GET',
			path: '/resource/{resourceId}/access-tokens',
			description: 'List all access tokens in an organization.',
		},
		{
			key: 'deleteAccessToken',
			method: 'DELETE',
			path: '/access-token/{accessTokenId}',
			description: 'Delete a access token.',
		},
	],

	// -------------------------------------------------------------------------
	// Identity Provider
	// -------------------------------------------------------------------------
	identityProvider: [
		{
			key: 'createOidcIdp',
			method: 'PUT',
			path: '/idp/oidc',
			description: 'Create an OIDC IdP.',
		},
		{
			key: 'updateOidcIdp',
			method: 'POST',
			path: '/idp/{idpId}/oidc',
			description: 'Update an OIDC IdP.',
		},
		{
			key: 'deleteIdp',
			method: 'DELETE',
			path: '/idp/{idpId}',
			description: 'Delete IDP.',
		},
		{
			key: 'getIdp',
			method: 'GET',
			path: '/idp/{idpId}',
			description: 'Get an IDP by its IDP ID.',
		},
		{
			key: 'listIdps',
			method: 'GET',
			path: '/idp',
			description: 'List all IDP in the system.',
		},
		{
			key: 'createIdpOrgPolicy',
			method: 'PUT',
			path: '/idp/{idpId}/org/{orgId}',
			description: 'Create an IDP policy for an existing IDP on an organization.',
		},
		{
			key: 'deleteIdpOrgPolicy',
			method: 'DELETE',
			path: '/idp/{idpId}/org/{orgId}',
			description: 'Create an OIDC IdP for an organization.',
		},
		{
			key: 'updateIdpOrgPolicy',
			method: 'POST',
			path: '/idp/{idpId}/org/{orgId}',
			description: 'Update an IDP org policy.',
		},
		{
			key: 'listIdpOrgPolicies',
			method: 'GET',
			path: '/idp/{idpId}/org',
			description: 'List all org policies on an IDP.',
		},
	],

	// -------------------------------------------------------------------------
	// Blueprint
	// -------------------------------------------------------------------------
	blueprint: [
		{
			key: 'listBlueprints',
			method: 'GET',
			path: '/org/{orgId}/blueprints',
			description: 'List all blueprints for a organization.',
		},
		{
			key: 'applyBlueprint',
			method: 'PUT',
			path: '/org/{orgId}/blueprint',
			description:
				'Apply a base64 encoded JSON blueprint to an organization',
		},
		{
			key: 'getBlueprint',
			method: 'GET',
			path: '/org/{orgId}/blueprint/{blueprintId}',
			description: 'Get a blueprint by its blueprint ID.',
		},
	],

	// -------------------------------------------------------------------------
	// API Key
	// -------------------------------------------------------------------------
	apiKey: [
		{
			key: 'createApiKey',
			method: 'PUT',
			path: '/org/{orgId}/api-key',
			description: 'Create a new API key scoped to the organization.',
		},
		{
			key: 'listApiKeys',
			method: 'GET',
			path: '/org/{orgId}/api-keys',
			description: 'List all API keys for an organization',
		},
		{
			key: 'deleteApiKey',
			method: 'DELETE',
			path: '/org/{orgId}/api-key/{apiKeyId}',
			description: 'Delete an API key.',
		},
		{
			key: 'listApiKeyActions',
			method: 'GET',
			path: '/org/{orgId}/api-key/{apiKeyId}/actions',
			description: 'List all actions set for an API key.',
		},
		{
			key: 'setApiKeyActions',
			method: 'POST',
			path: '/org/{orgId}/api-key/{apiKeyId}/actions',
			description:
				'Set actions for an API key. This will replace any existing actions.',
		},
		{
			key: 'queryRequestLogs',
			method: 'GET',
			path: '/org/{orgId}/logs/request',
			description: 'Query the request audit log for an organization',
		},
	],

	// -------------------------------------------------------------------------
	// Target
	// -------------------------------------------------------------------------
	target: [
		{
			key: 'getTarget',
			method: 'GET',
			path: '/target/{targetId}',
			description: 'Get a target.',
		},
		{
			key: 'deleteTarget',
			method: 'DELETE',
			path: '/target/{targetId}',
			description: 'Delete a target.',
		},
		{
			key: 'updateTarget',
			method: 'POST',
			path: '/target/{targetId}',
			description: 'Update a target.',
		},
	],
};

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
			// Resource (category)
			// ------------------------------------------------------------------
			{
				displayName: 'Category',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'resource',
				options: [
					{ name: 'Resource', value: 'resource' },
					{ name: 'Role', value: 'role' },
					{ name: 'User', value: 'user' },
					{ name: 'Rule', value: 'rule' },
					{ name: 'Domain', value: 'domain' },
					{ name: 'Invitation', value: 'invitation' },
					{ name: 'Client', value: 'client' },
					{ name: 'Site', value: 'site' },
					{ name: 'Access Token', value: 'accessToken' },
					{ name: 'Identity Provider', value: 'identityProvider' },
					{ name: 'Blueprint', value: 'blueprint' },
					{ name: 'API Key', value: 'apiKey' },
					{ name: 'Target', value: 'target' },
					{ name: 'API (Raw)', value: 'api' },
				],
			},

			// ------------------------------------------------------------------
			// Operations per category (actions)
			// ------------------------------------------------------------------

			// Resource actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listOrgResources',
				displayOptions: {
					show: {
						resource: ['resource'],
					},
				},
				options: PANGOLIN_ACTIONS.resource.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Role actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listRoles',
				displayOptions: {
					show: {
						resource: ['role'],
					},
				},
				options: PANGOLIN_ACTIONS.role.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// User actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listOrgUsers',
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: PANGOLIN_ACTIONS.user.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Rule actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listRules',
				displayOptions: {
					show: {
						resource: ['rule'],
					},
				},
				options: PANGOLIN_ACTIONS.rule.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Domain actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listOrgDomains',
				displayOptions: {
					show: {
						resource: ['domain'],
					},
				},
				options: PANGOLIN_ACTIONS.domain.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Invitation actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listInvitations',
				displayOptions: {
					show: {
						resource: ['invitation'],
					},
				},
				options: PANGOLIN_ACTIONS.invitation.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Client actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listOrgClients',
				displayOptions: {
					show: {
						resource: ['client'],
					},
				},
				options: PANGOLIN_ACTIONS.client.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Site actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listOrgSites',
				displayOptions: {
					show: {
						resource: ['site'],
					},
				},
				options: PANGOLIN_ACTIONS.site.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Access Token actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listOrgAccessTokens',
				displayOptions: {
					show: {
						resource: ['accessToken'],
					},
				},
				options: PANGOLIN_ACTIONS.accessToken.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Identity Provider actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listIdps',
				displayOptions: {
					show: {
						resource: ['identityProvider'],
					},
				},
				options: PANGOLIN_ACTIONS.identityProvider.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Blueprint actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listBlueprints',
				displayOptions: {
					show: {
						resource: ['blueprint'],
					},
				},
				options: PANGOLIN_ACTIONS.blueprint.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// API Key actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listApiKeys',
				displayOptions: {
					show: {
						resource: ['apiKey'],
					},
				},
				options: PANGOLIN_ACTIONS.apiKey.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// Target actions
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'getTarget',
				displayOptions: {
					show: {
						resource: ['target'],
					},
				},
				options: PANGOLIN_ACTIONS.target.map((a) => ({
					name: `${a.method} ${a.path}`,
					value: a.key,
					action: `${a.method} ${a.path}`,
					description: a.description,
				})),
			},

			// ------------------------------------------------------------------
			// API (Raw) actions (kept as before)
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
			// Generic path parameters (used for all mapped endpoints)
			// ------------------------------------------------------------------
			{
				displayName: 'Organization ID',
				name: 'orgId',
				type: 'string',
				default: '',
				description:
					'Organization ID (for example, "homelab"). Used in many endpoints.',
				displayOptions: {
					show: {
						resource: [
							'resource',
							'role',
							'user',
							'rule',
							'domain',
							'invitation',
							'client',
							'site',
							'accessToken',
							'identityProvider',
							'blueprint',
							'apiKey',
						],
					},
				},
			},
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'string',
				default: '',
				description: 'Numeric resourceId from Pangolin.',
				displayOptions: {
					show: {
						resource: ['resource', 'rule', 'user', 'accessToken'],
					},
				},
			},
			{
				displayName: 'Target ID',
				name: 'targetId',
				type: 'string',
				default: '',
				description: 'Target ID from Pangolin.',
				displayOptions: {
					show: {
						resource: ['target'],
					},
				},
			},
			{
				displayName: 'Role ID',
				name: 'roleId',
				type: 'string',
				default: '',
				description: 'Role ID.',
				displayOptions: {
					show: {
						resource: ['role', 'user'],
					},
				},
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'User ID.',
				displayOptions: {
					show: {
						resource: ['user', 'role'],
					},
				},
			},
			{
				displayName: 'Rule ID',
				name: 'ruleId',
				type: 'string',
				default: '',
				description: 'Rule ID.',
				displayOptions: {
					show: {
						resource: ['rule'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'domainId',
				type: 'string',
				default: '',
				description: 'Domain ID.',
				displayOptions: {
					show: {
						resource: ['domain'],
					},
				},
			},
			{
				displayName: 'Client ID',
				name: 'clientId',
				type: 'string',
				default: '',
				description: 'Client ID.',
				displayOptions: {
					show: {
						resource: ['client'],
					},
				},
			},
			{
				displayName: 'Site ID',
				name: 'siteId',
				type: 'string',
				default: '',
				description: 'Site ID.',
				displayOptions: {
					show: {
						resource: ['client', 'site'],
					},
				},
			},
			{
				displayName: 'Site Resource ID',
				name: 'siteResourceId',
				type: 'string',
				default: '',
				description: 'Site resource ID.',
				displayOptions: {
					show: {
						resource: ['client'],
					},
				},
			},
			{
				displayName: 'Nice ID',
				name: 'niceId',
				type: 'string',
				default: '',
				description: 'Nice ID (human-readable identifier).',
				displayOptions: {
					show: {
						resource: ['resource', 'site', 'client'],
					},
				},
			},
			{
				displayName: 'Access Token ID',
				name: 'accessTokenId',
				type: 'string',
				default: '',
				description: 'Access token ID.',
				displayOptions: {
					show: {
						resource: ['accessToken'],
					},
				},
			},
			{
				displayName: 'Identity Provider ID',
				name: 'idpId',
				type: 'string',
				default: '',
				description: 'Identity provider ID.',
				displayOptions: {
					show: {
						resource: ['identityProvider'],
					},
				},
			},
			{
				displayName: 'API Key ID',
				name: 'apiKeyId',
				type: 'string',
				default: '',
				description: 'API key ID.',
				displayOptions: {
					show: {
						resource: ['apiKey'],
					},
				},
			},
			{
				displayName: 'Blueprint ID',
				name: 'blueprintId',
				type: 'string',
				default: '',
				description: 'Blueprint ID.',
				displayOptions: {
					show: {
						resource: ['blueprint'],
					},
				},
			},

			// ------------------------------------------------------------------
			// Generic body for mapped endpoints
			// ------------------------------------------------------------------
			{
				displayName: 'Body (JSON as Text)',
				name: 'body',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				description:
					'Request body for POST/PUT/PATCH operations. If left empty, a built-in example (when available) will be used.',
				displayOptions: {
					show: {
						resource: [
							'resource',
							'role',
							'user',
							'rule',
							'domain',
							'invitation',
							'client',
							'site',
							'accessToken',
							'identityProvider',
							'blueprint',
							'apiKey',
							'target',
						],
					},
				},
			},

			// ------------------------------------------------------------------
			// List-options for mapped endpoints (generic)
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
						description:
							'Whether to return all results or only up to a given limit when the response is an array',
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
						description: 'Max number of results to return when limiting arrays',
					},
				],
				displayOptions: {
					show: {
						resource: [
							'resource',
							'role',
							'user',
							'rule',
							'domain',
							'invitation',
							'client',
							'site',
							'accessToken',
							'identityProvider',
							'blueprint',
							'apiKey',
							'target',
						],
					},
				},
			},

			// ------------------------------------------------------------------
			// RAW API request (as before)
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
						description:
							'Whether to return all results or only up to a given limit',
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
				// RAW API path (unchanged)
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
				// Mapped endpoints from PANGOLIN_ACTIONS
				// --------------------------------------------------------------
				const actionsForResource = PANGOLIN_ACTIONS[resource];
				if (!actionsForResource) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				const action = actionsForResource.find((a) => a.key === operation);
				if (!action) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation "${operation}" for resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				// Replace path params {orgId}, {resourceId}, etc. with node parameters of same name
				let path = action.path.replace(/\{(\w+)\}/g, (_match, paramName: string) => {
					const value = this.getNodeParameter(paramName, i, '') as string;
					if (!value) {
						throw new NodeOperationError(
							this.getNode(),
							`Missing required parameter "${paramName}" for "${action.method} ${action.path}"`,
							{ itemIndex: i },
						);
					}
					return encodeURIComponent(value);
				});

				// Prefix /v1 if not already present
				if (!path.startsWith('/v1')) {
					path = `/v1${path}`;
				}

				let bodyToSend: IDataObject | undefined;
				if (['POST', 'PUT', 'PATCH'].includes(action.method)) {
					const bodyText = this.getNodeParameter('body', i, '') as string;
					const effectiveBodyText = bodyText || action.bodyExample || '';

					if (effectiveBodyText) {
						try {
							bodyToSend = JSON.parse(effectiveBodyText) as IDataObject;
						} catch {
							// Fall back to sending raw text if JSON parse fails
							bodyToSend = { raw: effectiveBodyText };
						}
					} else {
						bodyToSend = {};
					}
				}

				const res = await pangolinApiRequest.call(
					this,
					action.method,
					path,
					bodyToSend,
				);

				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const returnAll = options.returnAll !== false;
				const limit = Number(options.limit ?? 50);

				// Normalise output
				if (Array.isArray(res)) {
					const arr = returnAll ? res : res.slice(0, limit);
					for (const entry of arr) {
						returnData.push({ json: (entry ?? {}) as IDataObject });
					}
				} else if (
					res &&
					typeof res === 'object' &&
					Array.isArray((res as IDataObject).data)
				) {
					const dataArr = (res as IDataObject).data as IDataObject[];
					const arr = returnAll ? dataArr : dataArr.slice(0, limit);
					for (const entry of arr) {
						returnData.push({ json: (entry ?? {}) as IDataObject });
					}
				} else {
					returnData.push({ json: (res ?? {}) as IDataObject });
				}
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
