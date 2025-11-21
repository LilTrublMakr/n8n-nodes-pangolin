import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

/**
 * Typed catalog entry for a Pangolin API action.
 */
type PangolinAction = {
	name: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	path: string;
	description: string;
	example?: IDataObject;
};

/**
 * Catalog of Pangolin API actions grouped by category (tag).
 * Each action includes the HTTP method, path, description, and
 * an example JSON body when the endpoint defines a requestBody.
 *
 * Paths are relative to /v1.
 */
const PANGOLIN_ACTIONS_BY_CATEGORY: Record<string, PangolinAction[]> = {
	Organization: [
		{
			name: 'List Organizations',
			method: 'GET',
			path: '/orgs',
			description: 'List all organizations in the system.',
		},
		{
			name: 'Create Organization',
			method: 'PUT',
			path: '/org',
			description: 'Create a new organization',
			example: {
				orgId: 'homelab',
				name: 'My Organization',
				subnet: '100.90.128.0/24',
			},
		},
		{
			name: 'Get Organization',
			method: 'GET',
			path: '/org/{orgId}',
			description: 'Get an organization',
		},
		{
			name: 'Delete Organization',
			method: 'DELETE',
			path: '/org/{orgId}',
			description: 'Delete an organization',
		},
		{
			name: 'Update Organization',
			method: 'POST',
			path: '/org/{orgId}',
			description: 'Update an organization',
			example: {
				name: 'My Organization',
				requireTwoFactor: true,
				maxSessionLengthHours: 8,
				passwordExpiryDays: 90,
				settingsLogRetentionDaysRequest: 7,
				settingsLogRetentionDaysAccess: 0,
				settingsLogRetentionDaysAction: 0,
			},
		},
		{
			name: 'List Organization Resources',
			method: 'GET',
			path: '/org/{orgId}/resources',
			description: 'List resources for an organization.',
		},
		{
			name: 'Get Resource by Nice ID',
			method: 'GET',
			path: '/org/{orgId}/resource/{niceId}',
			description:
				'Get a resource by orgId and niceId. NiceId is a readable ID for the resource and unique on a per org basis.',
		},
		{
			name: 'Create Resource',
			method: 'PUT',
			path: '/org/{orgId}/resource',
			description: 'Create a resource.',
			example: {
				name: 'string',
				subdomain: 'string',
				http: true,
				protocol: 'tcp',
				domainId: 'string',
				stickySession: true,
			},
		},
		{
			name: 'List Organization Domains',
			method: 'GET',
			path: '/org/{orgId}/domains',
			description: 'List all domains for a organization.',
		},
		{
			name: 'List Roles',
			method: 'GET',
			path: '/org/{orgId}/roles',
			description: 'List roles.',
		},
		{
			name: 'Create Role',
			method: 'PUT',
			path: '/org/{orgId}/role',
			description: 'Create a role.',
			example: {
				name: 'string',
				description: 'string',
			},
		},
		{
			name: 'List Organization Users',
			method: 'GET',
			path: '/org/{orgId}/users',
			description: 'List users in an organization.',
		},
		{
			name: 'Get Organization User',
			method: 'GET',
			path: '/org/{orgId}/user/{userId}',
			description: 'Get a user in an organization.',
		},
		{
			name: 'Update Organization User',
			method: 'POST',
			path: '/org/{orgId}/user/{userId}',
			description: 'Update a user in an org.',
			example: {
				autoProvisioned: true,
			},
		},
		{
			name: 'Remove Organization User',
			method: 'DELETE',
			path: '/org/{orgId}/user/{userId}',
			description: 'Remove a user from an organization.',
		},
		{
			name: 'Check User Access',
			method: 'GET',
			path: '/org/{orgId}/user/{userId}/check',
			description: "Check a user's access in an organization.",
		},
		{
			name: 'Create Organization User',
			method: 'PUT',
			path: '/org/{orgId}/user',
			description: 'Create an organization user.',
			example: {
				email: 'user@example.com',
				username: 'jdoe',
				name: 'John Doe',
				type: 'internal',
				idpId: 1,
				roleId: 1,
			},
		},
		{
			name: 'Create Invite',
			method: 'POST',
			path: '/org/{orgId}/create-invite',
			description: 'Invite a user to join an organization.',
			example: {
				email: 'user@example.com',
				roleId: 1,
				validHours: 24,
				sendEmail: true,
				regenerate: false,
			},
		},
		{
			name: 'List Invitations',
			method: 'GET',
			path: '/org/{orgId}/invitations',
			description: 'List invitations in an organization.',
		},
		{
			name: 'List Clients',
			method: 'GET',
			path: '/org/{orgId}/clients',
			description: 'List all clients for an organization.',
		},
		{
			name: 'Create Client',
			method: 'PUT',
			path: '/org/{orgId}/client',
			description: 'Create a new client.',
			example: {
				name: 'string',
				siteIds: [1],
				olmId: 'string',
				secret: 'string',
				subnet: '100.90.128.0/24',
				type: 'olm',
			},
		},
		{
			name: 'List Sites',
			method: 'GET',
			path: '/org/{orgId}/sites',
			description: 'List all sites in an organization',
		},
		{
			name: 'Create Site',
			method: 'PUT',
			path: '/org/{orgId}/site',
			description: 'Create a new site.',
			example: {
				name: 'My Site',
				exitNodeId: 1,
				pubKey: 'string',
				subnet: '100.90.129.0/24',
				newtId: 'string',
				secret: 'string',
				address: 'string',
				type: 'newt',
			},
		},
		{
			name: 'Pick Site Defaults',
			method: 'GET',
			path: '/org/{orgId}/pick-site-defaults',
			description:
				'Return pre-requisite data for creating a site, such as the exit node, subnet, Newt credentials, etc.',
		},
		{
			name: 'Pick Client Defaults',
			method: 'GET',
			path: '/org/{orgId}/pick-client-defaults',
			description: 'Return pre-requisite data for creating a client.',
		},
		{
			name: 'Create Site Resource',
			method: 'PUT',
			path: '/org/{orgId}/site/{siteId}/resource',
			description: 'Create a new site resource.',
			example: {
				name: 'string',
				protocol: 'tcp',
				proxyPort: 443,
				destinationPort: 443,
				destinationIp: '10.0.0.10',
				enabled: true,
			},
		},
		{
			name: 'Get Site Resource',
			method: 'GET',
			path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
			description: 'Get a specific site resource by siteResourceId.',
		},
		{
			name: 'Update Site Resource',
			method: 'POST',
			path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
			description: 'Update a site resource.',
			example: {
				name: 'string',
				protocol: 'tcp',
				proxyPort: 443,
				destinationPort: 443,
				destinationIp: '10.0.0.10',
				enabled: true,
			},
		},
		{
			name: 'Delete Site Resource',
			method: 'DELETE',
			path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
			description: 'Delete a site resource.',
		},
		{
			name: 'Get Site Resource by Nice ID',
			method: 'GET',
			path: '/org/{orgId}/site/{siteId}/resource/nice/{niceId}',
			description: 'Get a specific site resource by niceId.',
		},
		{
			name: 'List Site Resources for Site',
			method: 'GET',
			path: '/org/{orgId}/site/{siteId}/resources',
			description: 'List site resources for a site.',
		},
		{
			name: 'List Site Resources for Org',
			method: 'GET',
			path: '/org/{orgId}/site-resources',
			description: 'List all site resources for an organization.',
		},
		{
			name: 'List Blueprints',
			method: 'GET',
			path: '/org/{orgId}/blueprints',
			description: 'List all blueprints for a organization.',
		},
		{
			name: 'Apply Blueprint',
			method: 'PUT',
			path: '/org/{orgId}/blueprint',
			description: 'Apply a base64 encoded JSON blueprint to an organization',
			example: {
				blueprint: 'base64-encoded-json',
			},
		},
		{
			name: 'Get Blueprint',
			method: 'GET',
			path: '/org/{orgId}/blueprint/{blueprintId}',
			description: 'Get a blueprint by its blueprint ID.',
		},
		{
			name: 'List API Keys',
			method: 'GET',
			path: '/org/{orgId}/api-keys',
			description: 'List all API keys for an organization',
		},
		{
			name: 'Create API Key',
			method: 'PUT',
			path: '/org/{orgId}/api-key',
			description: 'Create a new API key scoped to the organization.',
			example: {
				name: 'My API Key',
			},
		},
		{
			name: 'Delete API Key',
			method: 'DELETE',
			path: '/org/{orgId}/api-key/{apiKeyId}',
			description: 'Delete an API key.',
		},
		{
			name: 'List API Key Actions',
			method: 'GET',
			path: '/org/{orgId}/api-key/{apiKeyId}/actions',
			description: 'List all actions set for an API key.',
		},
		{
			name: 'Set API Key Actions',
			method: 'POST',
			path: '/org/{orgId}/api-key/{apiKeyId}/actions',
			description:
				'Set actions for an API key. This will replace any existing actions.',
			example: {
				actionIds: ['string'],
			},
		},
		{
			name: 'List Org Access Tokens',
			method: 'GET',
			path: '/org/{orgId}/access-tokens',
			description: 'List all access tokens in an organization.',
		},
		{
			name: 'Query Request Logs',
			method: 'GET',
			path: '/org/{orgId}/logs/request',
			description: 'Query the request audit log for an organization',
		},
	],

	Site: [
		{
			name: 'Get Site by Nice ID',
			method: 'GET',
			path: '/org/{orgId}/site/{niceId}',
			description:
				'Get a site by orgId and niceId. NiceId is a readable ID for the site and unique on a per org basis.',
		},
		{
			name: 'Get Site',
			method: 'GET',
			path: '/site/{siteId}',
			description: 'Get a site by siteId.',
		},
		{
			name: 'Delete Site',
			method: 'DELETE',
			path: '/site/{siteId}',
			description: 'Delete a site and all its associated data.',
		},
		{
			name: 'Update Site',
			method: 'POST',
			path: '/site/{siteId}',
			description: 'Update a site.',
			example: {
				name: 'My Site',
				dockerSocketEnabled: false,
				remoteSubnets: '100.90.130.0/24',
			},
		},
	],

	Resource: [
		{
			name: 'Get Resource',
			method: 'GET',
			path: '/resource/{resourceId}',
			description: 'Get a resource by resourceId.',
		},
		{
			name: 'Delete Resource',
			method: 'DELETE',
			path: '/resource/{resourceId}',
			description: 'Delete a resource.',
		},
		{
			name: 'Update Resource',
			method: 'POST',
			path: '/resource/{resourceId}',
			description: 'Update a resource.',
			example: {
				name: 'string',
				subdomain: 'string',
				ssl: true,
				sso: true,
				blockAccess: false,
				emailWhitelistEnabled: false,
				applyRules: true,
				domainId: 'string',
				enabled: true,
				stickySession: true,
				tlsServerName: 'string',
				setHostHeader: 'string',
				skipToIdpId: 1,
				headers: [{ name: 'string', value: 'string' }],
				proxyPort: 443,
				proxyProtocol: false,
				proxyProtocolVersion: 1,
			},
		},
		{
			name: 'List Resource Targets',
			method: 'GET',
			path: '/resource/{resourceId}/targets',
			description: 'List targets for a resource.',
		},
		{
			name: 'Create Target for Resource',
			method: 'PUT',
			path: '/resource/{resourceId}/target',
			description: 'Create a target for a resource.',
			example: {
				siteId: 1,
				ip: '10.0.0.10',
				method: 'GET',
				port: 443,
				enabled: true,
			},
		},
		{
			name: 'Set Resource Password',
			method: 'POST',
			path: '/resource/{resourceId}/password',
			description:
				'Set the password for a resource. Setting the password to null will remove it.',
			example: {
				password: 'secret123',
			},
		},
		{
			name: 'Set Resource PIN Code',
			method: 'POST',
			path: '/resource/{resourceId}/pincode',
			description:
				'Set the PIN code for a resource. Setting the PIN code to null will remove it.',
			example: {
				pincode: '123456',
			},
		},
		{
			name: 'Set Email Whitelist',
			method: 'POST',
			path: '/resource/{resourceId}/whitelist',
			description:
				'Set email whitelist for a resource. This will replace all existing emails.',
			example: {
				emails: ['user@example.com', '*@example.com'],
			},
		},
		{
			name: 'Get Email Whitelist',
			method: 'GET',
			path: '/resource/{resourceId}/whitelist',
			description: 'Get the whitelist of emails for a specific resource.',
		},
		{
			name: 'Add Whitelist Email',
			method: 'POST',
			path: '/resource/{resourceId}/whitelist/add',
			description: 'Add a single email to the resource whitelist.',
			example: {
				email: 'user@example.com',
			},
		},
		{
			name: 'Remove Whitelist Email',
			method: 'POST',
			path: '/resource/{resourceId}/whitelist/remove',
			description: 'Remove a single email from the resource whitelist.',
			example: {
				email: 'user@example.com',
			},
		},
		{
			name: 'Create Rule',
			method: 'PUT',
			path: '/resource/{resourceId}/rule',
			description: 'Create a resource rule.',
			example: {
				action: 'ACCEPT',
				match: 'CIDR',
				value: '10.0.0.0/24',
				priority: 100,
				enabled: true,
			},
		},
		{
			name: 'Update Rule',
			method: 'POST',
			path: '/resource/{resourceId}/rule/{ruleId}',
			description: 'Update a resource rule.',
			example: {
				action: 'ACCEPT',
				match: 'CIDR',
				value: '10.0.0.0/24',
				priority: 100,
				enabled: true,
			},
		},
		{
			name: 'Delete Rule',
			method: 'DELETE',
			path: '/resource/{resourceId}/rule/{ruleId}',
			description: 'Delete a resource rule.',
		},
		{
			name: 'List Rules',
			method: 'GET',
			path: '/resource/{resourceId}/rules',
			description: 'List rules for a resource.',
		},
		{
			name: 'Set Header Auth',
			method: 'POST',
			path: '/resource/{resourceId}/header-auth',
			description:
				'Set or update the header authentication for a resource. If user and password is not provided, it will remove the header authentication.',
			example: {
				user: 'proxyuser',
				password: 'proxypass',
			},
		},
		{
			name: 'Set Users for Resource',
			method: 'POST',
			path: '/resource/{resourceId}/users',
			description:
				'Set users for a resource. This will replace all existing users.',
			example: {
				userIds: ['user-1', 'user-2'],
			},
		},
		{
			name: 'List Users for Resource',
			method: 'GET',
			path: '/resource/{resourceId}/users',
			description: 'List all users for a resource.',
		},
		{
			name: 'Set Roles for Resource',
			method: 'POST',
			path: '/resource/{resourceId}/roles',
			description:
				'Set roles for a resource. This will replace all existing roles.',
			example: {
				roleIds: [1, 2, 3],
			},
		},
		{
			name: 'List Roles for Resource',
			method: 'GET',
			path: '/resource/{resourceId}/roles',
			description: 'List all roles for a resource.',
		},
		{
			name: 'Generate Access Token',
			method: 'POST',
			path: '/resource/{resourceId}/access-token',
			description: 'Generate a new access token for a resource.',
			example: {
				validForSeconds: 3600,
				title: 'My Token',
				description: 'Automation access',
			},
		},
		{
			name: 'List Resource Access Tokens',
			method: 'GET',
			path: '/resource/{resourceId}/access-tokens',
			description: 'List all access tokens in an organization.',
		},
	],

	Target: [
		{
			name: 'Get Target',
			method: 'GET',
			path: '/target/{targetId}',
			description: 'Get a target.',
		},
		{
			name: 'Delete Target',
			method: 'DELETE',
			path: '/target/{targetId}',
			description: 'Delete a target.',
		},
		{
			name: 'Update Target',
			method: 'POST',
			path: '/target/{targetId}',
			description: 'Update a target.',
			example: {
				siteId: 1,
				ip: '10.0.0.10',
				method: 'GET',
				port: 443,
				enabled: true,
				hcEnabled: true,
				hcPath: '/health',
				hcScheme: 'https',
				hcMode: 'active',
				hcHostname: 'backend.local',
				hcPort: 443,
				hcInterval: 10,
				hcUnhealthyInterval: 10,
				hcTimeout: 5,
				hcHeaders: [{ name: 'User-Agent', value: 'pangolin-health' }],
				hcFollowRedirects: true,
				hcMethod: 'GET',
				hcStatus: 200,
				path: '/',
				pathMatchType: 'prefix',
				rewritePath: '/',
				rewritePathType: 'stripPrefix',
				priority: 100,
			},
		},
	],

	Domain: [
		{
			name: 'Get Domain',
			method: 'GET',
			path: '/org/{orgId}/domain/{domainId}',
			description: 'Get a domain by domainId.',
		},
		{
			name: 'Update Domain',
			method: 'PATCH',
			path: '/org/{orgId}/domain/{domainId}',
			description: 'Update a domain by domainId.',
		},
		{
			name: 'List Domain DNS Records',
			method: 'GET',
			path: '/org/{orgId}/domain/{domainId}/dns-records',
			description: 'Get all DNS records for a domain by domainId.',
		},
	],

	Role: [
		{
			name: 'Create Role',
			method: 'PUT',
			path: '/org/{orgId}/role',
			description: 'Create a role.',
			example: {
				name: 'string',
				description: 'string',
			},
		},
		{
			name: 'List Roles',
			method: 'GET',
			path: '/org/{orgId}/roles',
			description: 'List roles.',
		},
		{
			name: 'Delete Role',
			method: 'DELETE',
			path: '/role/{roleId}',
			description: 'Delete a role.',
		},
		{
			name: 'Get Role',
			method: 'GET',
			path: '/role/{roleId}',
			description: 'Get a role.',
		},
		{
			name: 'Add Role to User',
			method: 'POST',
			path: '/role/{roleId}/add/{userId}',
			description: 'Add a role to a user.',
		},
	],

	User: [
		{
			name: 'Get User',
			method: 'GET',
			path: '/user/{userId}',
			description: 'Get a user by ID.',
		},
		{
			name: 'Update 2FA',
			method: 'POST',
			path: '/user/{userId}/2fa',
			description: "Update a user's 2FA status.",
			example: {
				twoFactorSetupRequested: true,
			},
		},
	],

	Client: [
		{
			name: 'Create Client',
			method: 'PUT',
			path: '/org/{orgId}/client',
			description: 'Create a new client.',
			example: {
				name: 'string',
				siteIds: [1],
				olmId: 'string',
				secret: 'string',
				subnet: '100.90.128.0/24',
				type: 'olm',
			},
		},
		{
			name: 'Get Client',
			method: 'GET',
			path: '/client/{clientId}',
			description: 'Get a client by its client ID.',
		},
		{
			name: 'Update Client',
			method: 'POST',
			path: '/client/{clientId}',
			description: 'Update a client by its client ID.',
			example: {
				name: 'string',
				siteIds: [1],
			},
		},
		{
			name: 'Delete Client',
			method: 'DELETE',
			path: '/client/{clientId}',
			description: 'Delete a client by its client ID.',
		},
	],

	IdentityProvider: [
		{
			name: 'Create OIDC IdP',
			method: 'PUT',
			path: '/idp/oidc',
			description: 'Create an OIDC IdP.',
			example: {
				name: 'My IdP',
				clientId: 'string',
				clientSecret: 'string',
				authUrl: 'https://idp.example.com/auth',
				tokenUrl: 'https://idp.example.com/token',
				identifierPath: 'sub',
				emailPath: 'email',
				namePath: 'name',
				scopes: 'openid profile email',
				autoProvision: true,
			},
		},
		{
			name: 'Update OIDC IdP',
			method: 'POST',
			path: '/idp/{idpId}/oidc',
			description: 'Update an OIDC IdP.',
			example: {
				name: 'My IdP',
				clientId: 'string',
				clientSecret: 'string',
				authUrl: 'https://idp.example.com/auth',
				tokenUrl: 'https://idp.example.com/token',
				identifierPath: 'sub',
				emailPath: 'email',
				namePath: 'name',
				scopes: 'openid profile email',
				autoProvision: true,
				defaultRoleMapping: 'string',
				defaultOrgMapping: 'string',
			},
		},
		{
			name: 'Delete IdP',
			method: 'DELETE',
			path: '/idp/{idpId}',
			description: 'Delete IDP.',
		},
		{
			name: 'Get IdP',
			method: 'GET',
			path: '/idp/{idpId}',
			description: 'Get an IDP by its IDP ID.',
		},
		{
			name: 'List IdPs',
			method: 'GET',
			path: '/idp',
			description: 'List all IDP in the system.',
		},
		{
			name: 'Create IdP Org Policy',
			method: 'PUT',
			path: '/idp/{idpId}/org/{orgId}',
			description:
				'Create an IDP policy for an existing IDP on an organization.',
			example: {
				roleMapping: 'string',
				orgMapping: 'string',
			},
		},
		{
			name: 'Delete IdP Org Policy',
			method: 'DELETE',
			path: '/idp/{idpId}/org/{orgId}',
			description:
				'Delete an IDP policy for an existing IDP on an organization.',
		},
		{
			name: 'Update IdP Org Policy',
			method: 'POST',
			path: '/idp/{idpId}/org/{orgId}',
			description: 'Update an IDP org policy.',
			example: {
				roleMapping: 'string',
				orgMapping: 'string',
			},
		},
		{
			name: 'List IdP Org Policies',
			method: 'GET',
			path: '/idp/{idpId}/org',
			description: 'List all org policies on an IDP.',
		},
	],

	AccessToken: [
		{
			name: 'Generate Resource Access Token',
			method: 'POST',
			path: '/resource/{resourceId}/access-token',
			description: 'Generate a new access token for a resource.',
			example: {
				validForSeconds: 3600,
				title: 'My Token',
				description: 'Automation access',
			},
		},
		{
			name: 'List Org Access Tokens',
			method: 'GET',
			path: '/org/{orgId}/access-tokens',
			description: 'List all access tokens in an organization.',
		},
		{
			name: 'List Resource Access Tokens',
			method: 'GET',
			path: '/resource/{resourceId}/access-tokens',
			description: 'List all access tokens in an organization.',
		},
		{
			name: 'Delete Access Token',
			method: 'DELETE',
			path: '/access-token/{accessTokenId}',
			description: 'Delete a access token.',
		},
	],

	ApiKey: [
		{
			name: 'List API Keys',
			method: 'GET',
			path: '/org/{orgId}/api-keys',
			description: 'List all API keys for an organization',
		},
		{
			name: 'Create API Key',
			method: 'PUT',
			path: '/org/{orgId}/api-key',
			description: 'Create a new API key scoped to the organization.',
			example: {
				name: 'My API Key',
			},
		},
		{
			name: 'Delete API Key',
			method: 'DELETE',
			path: '/org/{orgId}/api-key/{apiKeyId}',
			description: 'Delete an API key.',
		},
		{
			name: 'List API Key Actions',
			method: 'GET',
			path: '/org/{orgId}/api-key/{apiKeyId}/actions',
			description: 'List all actions set for an API key.',
		},
		{
			name: 'Set API Key Actions',
			method: 'POST',
			path: '/org/{orgId}/api-key/{apiKeyId}/actions',
			description:
				'Set actions for an API key. This will replace any existing actions.',
			example: {
				actionIds: ['string'],
			},
		},
	],

	Blueprint: [
		{
			name: 'List Blueprints',
			method: 'GET',
			path: '/org/{orgId}/blueprints',
			description: 'List all blueprints for a organization.',
		},
		{
			name: 'Apply Blueprint',
			method: 'PUT',
			path: '/org/{orgId}/blueprint',
			description: 'Apply a base64 encoded JSON blueprint to an organization',
			example: {
				blueprint: 'base64-encoded-json',
			},
		},
		{
			name: 'Get Blueprint',
			method: 'GET',
			path: '/org/{orgId}/blueprint/{blueprintId}',
			description: 'Get a blueprint by its blueprint ID.',
		},
	],

	Invitation: [
		{
			name: 'Create Invite',
			method: 'POST',
			path: '/org/{orgId}/create-invite',
			description: 'Invite a user to join an organization.',
			example: {
				email: 'user@example.com',
				roleId: 1,
				validHours: 24,
				sendEmail: true,
				regenerate: false,
			},
		},
		{
			name: 'List Invitations',
			method: 'GET',
			path: '/org/{orgId}/invitations',
			description: 'List invitations in an organization.',
		},
	],

	Health: [
		{
			name: 'Health Check',
			method: 'GET',
			path: '/',
			description: 'Health check',
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
		description: 'Interact with a Pangolin reverse proxy via its REST API',
		defaults: {
			name: 'Pangolin',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'PangolinApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'HTTP Method',
				name: 'httpMethod',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'GET',
						value: 'GET',
						action: 'Send GET request',
					},
					{
						name: 'POST',
						value: 'POST',
						action: 'Send POST request',
					},
					{
						name: 'PUT',
						value: 'PUT',
						action: 'Send PUT request',
					},
					{
						name: 'PATCH',
						value: 'PATCH',
						action: 'Send PATCH request',
					},
					{
						name: 'DELETE',
						value: 'DELETE',
						action: 'Send DELETE request',
					},
				],
				default: 'GET',
				description: 'HTTP method to use for the Pangolin API request',
			},
			{
				displayName: 'Endpoint Path',
				name: 'endpoint',
				type: 'string',
				default: '/orgs',
				placeholder: '/orgs',
				description:
					"Endpoint path relative to /v1 (for example, '/orgs', '/org/{orgId}/resources', '/resource/{resourceId}').",
			},
			{
				displayName: 'Query Parameters',
				name: 'queryParameters',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Query Parameter',
				description: 'Query string parameters to send with the request',
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
								placeholder: 'limit',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								placeholder: '1000',
							},
						],
					},
				],
			},
			{
				displayName: 'Body (JSON)',
				name: 'jsonBody',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				placeholder: '{\n  "name": "string"\n}',
				description:
					'JSON body to send with the request. Leave empty for endpoints without a request body. Example payloads for each endpoint are available inside the node implementation.',
			},
			{
				displayName: 'Raw HTTP Options',
				name: 'rawOptions',
				type: 'collection',
				placeholder: 'Add Option',
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
						displayName: 'Resolve Path Placeholders from Item',
						name: 'resolvePathFromItem',
						type: 'boolean',
						default: false,
						description:
							'Whether to resolve {placeholders} in the endpoint path from the input item fields',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const method = this.getNodeParameter('httpMethod', i) as string;
			let endpoint = this.getNodeParameter('endpoint', i) as string;
			const queryParameters = this.getNodeParameter(
				'queryParameters',
				i,
				{},
			) as IDataObject;
			const jsonBody = this.getNodeParameter('jsonBody', i, '') as string;
			const rawOptions = this.getNodeParameter('rawOptions', i, {}) as IDataObject;

			const qs: IDataObject = {};
			const qpCollection = (queryParameters.parameter as IDataObject[]) || [];

			for (const qp of qpCollection) {
				const name = (qp.name as string) || '';
				if (!name) continue;
				qs[name] = qp.value;
			}

			let body: IDataObject | undefined;
			if (jsonBody && jsonBody.trim() !== '') {
				try {
					body = JSON.parse(jsonBody) as IDataObject;
				} catch (error) {
					throw new NodeOperationError(
						this,
						'Invalid JSON in "Body (JSON)" parameter',
						{ itemIndex: i },
					);
				}
			}

			// Resolve placeholders in the path from the current item, if enabled
			const resolvePathFromItem = rawOptions.resolvePathFromItem === true;
			if (resolvePathFromItem && endpoint.includes('{')) {
				const itemJson = items[i].json as IDataObject;
				endpoint = endpoint.replace(
					/{([^}]+)}/g,
					(match: string, key: string) => {
						const value = itemJson[key];
						return value !== undefined ? String(value) : match;
					},
				);
			}

			// Build full URL from credentials baseUrl + /v1 + endpoint
			const credentials = (await this.getCredentials('PangolinApi')) as IDataObject;
			const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');

			let path = endpoint.trim();
			if (!path.startsWith('/')) {
				path = `/${path}`;
			}

			const url = `${baseUrl}/v1${path}`;

			const options: IHttpRequestOptions = {
				method,
				url,
				qs,
				json: true,
			};

			if (body !== undefined) {
				options.body = body;
			}

			if (rawOptions.ignoreSslIssues === true) {
				options.rejectUnauthorized = false;
			}

			let responseData;
			try {
				responseData = await this.helpers.requestWithAuthentication.call(
					this,
					'PangolinApi',
					options,
				);
			} catch (error) {
				throw new NodeOperationError(this, error as Error, { itemIndex: i });
			}

			const executionData: INodeExecutionData = {
				json: responseData as IDataObject,
			};
			returnData.push(executionData);
		}

		return [returnData];
	}
}
