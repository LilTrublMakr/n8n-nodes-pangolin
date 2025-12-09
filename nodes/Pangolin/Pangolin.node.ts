import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { pangolinApiRequest } from './GenericFunctions';

type EndpointConfig = {
	operation: string;
	displayName: string;
	method: string;
	path: string;
	tags: string[];
	pathParams: string[];
	hasBody: boolean;
	bodyDefault?: string;
};

function toResourceValue(tag: string): string {
	return tag.replace(/\s+/g, '').replace(/^[A-Z]/, (m) => m.toLowerCase());
}

function toParamDisplayName(name: string): string {
	const spaced = name
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/Id\b/i, ' ID');
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const endpointConfigs: EndpointConfig[] = [
	{
		operation: 'getOrgOrgIdSiteNiceId',
		displayName: 'Get a site by orgId and niceId. NiceId is a readable ID for the site and unique on a per org basis.',
		method: 'GET',
		path: '/org/{orgId}/site/{niceId}',
		tags: ['Organization', 'Site'],
		pathParams: ['orgId', 'niceId'],
		hasBody: false
	},
	{
		operation: 'getSiteSiteId',
		displayName: 'Get a site by siteId.',
		method: 'GET',
		path: '/site/{siteId}',
		tags: ['Site'],
		pathParams: ['siteId'],
		hasBody: false
	},
	{
		operation: 'deleteSiteSiteId',
		displayName: 'Delete a site.',
		method: 'DELETE',
		path: '/site/{siteId}',
		tags: ['Site'],
		pathParams: ['siteId'],
		hasBody: false
	},
	{
		operation: 'postSiteSiteId',
		displayName: 'Update a site.',
		method: 'POST',
		path: '/site/{siteId}',
		tags: ['Site'],
		pathParams: ['siteId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string",
  "dockerSocketEnabled": true,
  "remoteSubnets": "string"
}`
	},
	{
		operation: 'putOrgOrgIdSite',
		displayName: 'Create a new site.',
		method: 'PUT',
		path: '/org/{orgId}/site',
		tags: ['Organization', 'Site'],
		pathParams: ['orgId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string" //required,
  "exitNodeId": 1,
  "pubKey": "string",
  "subnet": "string",
  "newtId": "string",
  "secret": "string",
  "address": "string",
  "type": "newt" //required. Options: newt, wireguard, local
}`
	},
	{
		operation: 'getTargetTargetId',
		displayName: 'Get a target.',
		method: 'GET',
		path: '/target/{targetId}',
		tags: ['Target'],
		pathParams: ['targetId'],
		hasBody: false
	},
	{
		operation: 'deleteTargetTargetId',
		displayName: 'Delete a target.',
		method: 'DELETE',
		path: '/target/{targetId}',
		tags: ['Target'],
		pathParams: ['targetId'],
		hasBody: false
	},
	{
		operation: 'postTargetTargetId',
		displayName: 'Update a target.',
		method: 'POST',
		path: '/target/{targetId}',
		tags: ['Target'],
		pathParams: ['targetId'],
		hasBody: true,
		bodyDefault: `{
  "siteId": 1, //required
  "ip": "string", //required
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
		operation: 'putResourceResourceIdTarget',
		displayName: 'Create a target.',
		method: 'PUT',
		path: '/resource/{resourceId}/target',
		tags: ['Resource', 'Target'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "siteId": 1, //required
  "ip": "string", //required
  "method": "string",
  "port": 65535, //required
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
		operation: 'getResourceResourceIdTargets',
		displayName: 'List targets that point to this resource.',
		method: 'GET',
		path: '/resource/{resourceId}/targets',
		tags: ['Resource', 'Target'],
		pathParams: ['resourceId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdSites',
		displayName: 'List sites.',
		method: 'GET',
		path: '/org/{orgId}/sites',
		tags: ['Organization', 'Site'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdPickSiteDefaults',
		displayName: 'Get default values for new sites.',
		method: 'GET',
		path: '/org/{orgId}/pick-site-defaults',
		tags: ['Organization', 'Site'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgId',
		displayName: 'Get an organization.',
		method: 'GET',
		path: '/org/{orgId}',
		tags: ['Organization'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'deleteOrgOrgId',
		displayName: 'Delete an organization.',
		method: 'DELETE',
		path: '/org/{orgId}',
		tags: ['Organization'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'postOrgOrgId',
		displayName: 'Update an organization.',
		method: 'POST',
		path: '/org/{orgId}',
		tags: ['Organization'],
		pathParams: ['orgId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string",
  "requireTwoFactor": true,
  "maxSessionLengthHours": 0,
  "passwordExpiryDays": 0,
  "settingsLogRetentionDaysRequest": -1,
  "settingsLogRetentionDaysAccess": -1,
  "settingsLogRetentionDaysAction": -1
}`
	},
	{
		operation: 'postResourceResourceIdRoles',
		displayName: 'Grant roles access to a resource, replacing any existing ones.',
		method: 'POST',
		path: '/resource/{resourceId}/roles',
		tags: ['Resource', 'Role'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "roleIds": [ //required
    1
  ]
}`
	},
	{
		operation: 'getResourceResourceIdRoles',
		displayName: 'List roles that have access to a resource.',
		method: 'GET',
		path: '/resource/{resourceId}/roles',
		tags: ['Resource', 'Role'],
		pathParams: ['resourceId'],
		hasBody: false
	},
	{
		operation: 'putOrgOrgIdRole',
		displayName: 'Create a role.',
		method: 'PUT',
		path: '/org/{orgId}/role',
		tags: ['Organization', 'Role'],
		pathParams: ['orgId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string", //required
  "description": "string"
}`
	},
	{
		operation: 'deleteRoleRoleId',
		displayName: 'Delete a role.',
		method: 'DELETE',
		path: '/role/{roleId}',
		tags: ['Role'],
		pathParams: ['roleId'],
		hasBody: true,
		bodyDefault: `{
  "roleId": "string" //required
}`
	},
	{
		operation: 'getRoleRoleId',
		displayName: 'Get a role.',
		method: 'GET',
		path: '/role/{roleId}',
		tags: ['Role'],
		pathParams: ['roleId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdRoles',
		displayName: 'List roles.',
		method: 'GET',
		path: '/org/{orgId}/roles',
		tags: ['Organization', 'Role'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'putOrg',
		displayName: 'Create a new organization.',
		method: 'PUT',
		path: '/org',
		tags: ['Organization'],
		pathParams: [],
		hasBody: true,
		bodyDefault: `{
  "orgId": "string", //required
  "name": "string", //required
  "subnet": "string" //required
}`
	},
	{
		operation: 'getOrgs',
		displayName: 'List organizations.',
		method: 'GET',
		path: '/orgs',
		tags: ['Organization'],
		pathParams: [],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdUserUserIdCheck',
		displayName: 'Check that a user belongs to an organization and has the specified role.',
		method: 'GET',
		path: '/org/{orgId}/user/{userId}/check',
		tags: ['Organization', 'User'],
		pathParams: ['orgId', 'userId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdResourceNiceId',
		displayName: 'Get a resource by its niceId.',
		method: 'GET',
		path: '/org/{orgId}/resource/{niceId}',
		tags: ['Organization', 'Resource'],
		pathParams: ['orgId', 'niceId'],
		hasBody: false
	},
	{
		operation: 'putOrgOrgIdResource',
		displayName: 'Create a new resource.',
		method: 'PUT',
		path: '/org/{orgId}/resource',
		tags: ['Organization', 'Resource'],
		pathParams: ['orgId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string", //required
  "subdomain": "string",
  "http": true, //required
  "protocol": "tcp", //required
  "domainId": "string", //required
  "stickySession": true
}`
	},
	{
		operation: 'getOrgOrgIdResources',
		displayName: 'List resources.',
		method: 'GET',
		path: '/org/{orgId}/resources',
		tags: ['Organization', 'Resource'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdDomains',
		displayName: 'List domains.',
		method: 'GET',
		path: '/org/{orgId}/domains',
		tags: ['Organization', 'Domain'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'deleteOrgOrgIdUserUserId',
		displayName: 'Remove a user from an organization.',
		method: 'DELETE',
		path: '/org/{orgId}/user/{userId}',
		tags: ['Organization', 'User'],
		pathParams: ['orgId', 'userId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdUserUserId',
		displayName: 'Get a user in an organization.',
		method: 'GET',
		path: '/org/{orgId}/user/{userId}',
		tags: ['Organization', 'User'],
		pathParams: ['orgId', 'userId'],
		hasBody: false
	},
	{
		operation: 'postOrgOrgIdUserUserId',
		displayName: 'Update a user’s role in an organization.',
		method: 'POST',
		path: '/org/{orgId}/user/{userId}',
		tags: ['Organization', 'User'],
		pathParams: ['orgId', 'userId'],
		hasBody: true,
		bodyDefault: `{
  "autoProvisioned": true
}`
	},
	{
		operation: 'getOrgOrgIdUsers',
		displayName: 'List users.',
		method: 'GET',
		path: '/org/{orgId}/users',
		tags: ['Organization', 'User'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'postOrgOrgIdCreateInvite',
		displayName: 'Create an invite for a user to join an organization.',
		method: 'POST',
		path: '/org/{orgId}/create-invite',
		tags: ['Organization', 'Invite'],
		pathParams: ['orgId'],
		hasBody: true,
		bodyDefault: `{
  "email": "user@example.com", //required
  "roleId": 0, //required
  "validHours": 168, //required
  "sendEmail": true,
  "regenerate": true
}`
	},
	{
		operation: 'getOrgOrgIdInvitations',
		displayName: 'List invitations.',
		method: 'GET',
		path: '/org/{orgId}/invitations',
		tags: ['Organization', 'Invite'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'putOrgOrgIdUser',
		displayName: 'Add a user to an organization.',
		method: 'PUT',
		path: '/org/{orgId}/user',
		tags: ['Organization', 'User'],
		pathParams: ['orgId'],
		hasBody: true,
		bodyDefault: `{
  "email": "string",
  "username": "string", //required
  "name": "string",
  "type": "internal",
  "idpId": 0,
  "roleId": 0 //required
}`
	},
	{
		operation: 'putOrgOrgIdClient',
		displayName: 'Create a client.',
		method: 'PUT',
		path: '/org/{orgId}/client',
		tags: ['Organization', 'Client'],
		pathParams: ['orgId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string", //required
  "siteIds": [ //required
    1
  ],
  "olmId": "string", //required
  "secret": "string", //required
  "subnet": "string", //required
  "type": "olm" //required. Options: olm
}`
	},
	{
		operation: 'getOrgOrgIdClients',
		displayName: 'List clients.',
		method: 'GET',
		path: '/org/{orgId}/clients',
		tags: ['Organization', 'Client'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'putOrgOrgIdSiteSiteIdResource',
		displayName: 'Create a resource for a site.',
		method: 'PUT',
		path: '/org/{orgId}/site/{siteId}/resource',
		tags: ['Organization', 'Site', 'Resource'],
		pathParams: ['orgId', 'siteId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string", //required
  "protocol": "tcp", //required. Options: tcp, udp
  "proxyPort": 1, //required
  "destinationPort": 1, //required
  "destinationIp": "string", //required
  "enabled": true
}`
	},
	{
		operation: 'deleteOrgOrgIdSiteSiteIdResourceSiteResourceId',
		displayName: 'Delete a resource.',
		method: 'DELETE',
		path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
		tags: ['Organization', 'Site', 'Resource'],
		pathParams: ['orgId', 'siteId', 'siteResourceId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdSiteSiteIdResourceSiteResourceId',
		displayName: 'Get a resource.',
		method: 'GET',
		path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
		tags: ['Organization', 'Site', 'Resource'],
		pathParams: ['orgId', 'siteId', 'siteResourceId'],
		hasBody: false
	},
	{
		operation: 'postOrgOrgIdSiteSiteIdResourceSiteResourceId',
		displayName: 'Update a resource.',
		method: 'POST',
		path: '/org/{orgId}/site/{siteId}/resource/{siteResourceId}',
		tags: ['Organization', 'Site', 'Resource'],
		pathParams: ['orgId', 'siteId', 'siteResourceId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string",
  "protocol": "tcp", //Options: tcp, udp
  "proxyPort": 1,
  "destinationPort": 1,
  "destinationIp": "string",
  "enabled": true
}`
	},
	{
		operation: 'getOrgOrgIdSiteSiteIdResourceNiceNiceId',
		displayName: 'Get a resource by its niceId.',
		method: 'GET',
		path: '/org/{orgId}/site/{siteId}/resource/nice/{niceId}',
		tags: ['Organization', 'Site', 'Resource'],
		pathParams: ['orgId', 'siteId', 'niceId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdSiteSiteIdResources',
		displayName: 'List resources.',
		method: 'GET',
		path: '/org/{orgId}/site/{siteId}/resources',
		tags: ['Organization', 'Site', 'Resource'],
		pathParams: ['orgId', 'siteId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdSiteResources',
		displayName: 'List all site resources.',
		method: 'GET',
		path: '/org/{orgId}/site-resources',
		tags: ['Organization', 'Site', 'Resource'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdAccessTokens',
		displayName: 'List access tokens.',
		method: 'GET',
		path: '/org/{orgId}/access-tokens',
		tags: ['Organization', 'Access Token'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdBlueprints',
		displayName: 'List blueprints.',
		method: 'GET',
		path: '/org/{orgId}/blueprints',
		tags: ['Organization', 'Blueprint'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'putOrgOrgIdBlueprint',
		displayName: 'Create a blueprint.',
		method: 'PUT',
		path: '/org/{orgId}/blueprint',
		tags: ['Organization', 'Blueprint'],
		pathParams: ['orgId'],
		hasBody: true,
		bodyDefault: `{
  "blueprint": "string" //required
}`
	},
	{
		operation: 'getOrgOrgIdBlueprintBlueprintId',
		displayName: 'Get a blueprint.',
		method: 'GET',
		path: '/org/{orgId}/blueprint/{blueprintId}',
		tags: ['Organization', 'Blueprint'],
		pathParams: ['orgId', 'blueprintId'],
		hasBody: false
	},
	{
		operation: 'deleteOrgOrgIdApiKeyApiKeyId',
		displayName: 'Delete an API key.',
		method: 'DELETE',
		path: '/org/{orgId}/api-key/{apiKeyId}',
		tags: ['Organization', 'API Key'],
		pathParams: ['orgId', 'apiKeyId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdApiKeyApiKeyIdActions',
		displayName: 'List API key actions.',
		method: 'GET',
		path: '/org/{orgId}/api-key/{apiKeyId}/actions',
		tags: ['Organization', 'API Key'],
		pathParams: ['orgId', 'apiKeyId'],
		hasBody: false
	},
	{
		operation: 'postOrgOrgIdApiKeyApiKeyIdActions',
		displayName: 'Perform an action on an API key.',
		method: 'POST',
		path: '/org/{orgId}/api-key/{apiKeyId}/actions',
		tags: ['Organization', 'API Key'],
		pathParams: ['orgId', 'apiKeyId'],
		hasBody: true,
		bodyDefault: `{
  "actionIds": [ //required
    "string"
  ]
}`
	},
	{
		operation: 'getOrgOrgIdApiKeys',
		displayName: 'List API keys.',
		method: 'GET',
		path: '/org/{orgId}/api-keys',
		tags: ['Organization', 'API Key'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'putOrgOrgIdApiKey',
		displayName: 'Create an API key.',
		method: 'PUT',
		path: '/org/{orgId}/api-key',
		tags: ['Organization', 'API Key'],
		pathParams: ['orgId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string" //required
}`
	},
	{
		operation: 'getOrgOrgIdLogsRequest',
		displayName: 'List request logs.',
		method: 'GET',
		path: '/org/{orgId}/logs/request',
		tags: ['Organization', 'Log'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdPickClientDefaults',
		displayName: 'Get default values for creating a client.',
		method: 'GET',
		path: '/org/{orgId}/pick-client-defaults',
		tags: ['Organization', 'Client'],
		pathParams: ['orgId'],
		hasBody: false
	},
	{
		operation: 'getResourceResourceId',
		displayName: 'Get a resource.',
		method: 'GET',
		path: '/resource/{resourceId}',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: false
	},
	{
		operation: 'deleteResourceResourceId',
		displayName: 'Delete a resource.',
		method: 'DELETE',
		path: '/resource/{resourceId}',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: false
	},
	{
		operation: 'postResourceResourceId',
		displayName: 'Update a resource.',
		method: 'POST',
		path: '/resource/{resourceId}',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string",
  "subdomain": "string",
  "ssl": true,
  "sso": true,
  "blockAccess": true,
  "emailWhitelistEnabled": true,
  "applyRules": true,
  "domainId": "string",
  "enabled": true,
  "stickySession": true,
  "tlsServerName": "string",
  "setHostHeader": "string",
  "skipToIdpId": 1,
  "headers": [
    {
      "name": "string",
      "value": "string"
    }
  ],
  "proxyPort": 65535,
  "proxyProtocol": true,
  "proxyProtocolVersion": 1
}`
	},
	{
		operation: 'postResourceResourceIdUsers',
		displayName: 'Grant users access to a resource, replacing any existing ones.',
		method: 'POST',
		path: '/resource/{resourceId}/users',
		tags: ['Resource', 'User'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "userIds": [ //required
    "string"
  ]
}`
	},
	{
		operation: 'getResourceResourceIdUsers',
		displayName: 'List users that have access to a resource.',
		method: 'GET',
		path: '/resource/{resourceId}/users',
		tags: ['Resource', 'User'],
		pathParams: ['resourceId'],
		hasBody: false
	},
	{
		operation: 'postResourceResourceIdPassword',
		displayName: 'Set the password for a resource.',
		method: 'POST',
		path: '/resource/{resourceId}/password',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "password": "string" //required
}`
	},
	{
		operation: 'postResourceResourceIdPincode',
		displayName: 'Set the pincode for a resource.',
		method: 'POST',
		path: '/resource/{resourceId}/pincode',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "pincode": "string" //required
}`
	},
	{
		operation: 'postResourceResourceIdWhitelist',
		displayName: 'Set the whitelist for a resource.',
		method: 'POST',
		path: '/resource/{resourceId}/whitelist',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "emails": [ //required
    "user@example.com",
    "user2@example.com"
  ]
}`
	},
	{
		operation: 'getResourceResourceIdWhitelist',
		displayName: 'Get the whitelist for a resource.',
		method: 'GET',
		path: '/resource/{resourceId}/whitelist',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: false
	},
	{
		operation: 'putResourceResourceIdRule',
		displayName: 'Apply a rule to a resource.',
		method: 'PUT',
		path: '/resource/{resourceId}/rule',
		tags: ['Resource', 'Rule'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "action": "ACCEPT", //required
  "match": "CIDR", //required
  "value": "string", //required
  "priority": 0, //required
  "enabled": true
}`
	},
	{
		operation: 'deleteResourceResourceIdRuleRuleId',
		displayName: 'Remove a rule from a resource.',
		method: 'DELETE',
		path: '/resource/{resourceId}/rule/{ruleId}',
		tags: ['Resource', 'Rule'],
		pathParams: ['resourceId', 'ruleId'],
		hasBody: false
	},
	{
		operation: 'postResourceResourceIdRuleRuleId',
		displayName: 'Update a rule applied to a resource.',
		method: 'POST',
		path: '/resource/{resourceId}/rule/{ruleId}',
		tags: ['Resource', 'Rule'],
		pathParams: ['resourceId', 'ruleId'],
		hasBody: true,
		bodyDefault: `{
  "action": "ACCEPT",
  "match": "CIDR",
  "value": "string",
  "priority": 0,
  "enabled": true
}`
	},
	{
		operation: 'getResourceResourceIdRules',
		displayName: 'List rules applied to a resource.',
		method: 'GET',
		path: '/resource/{resourceId}/rules',
		tags: ['Resource', 'Rule'],
		pathParams: ['resourceId'],
		hasBody: false
	},
	{
		operation: 'postResourceResourceIdHeaderAuth',
		displayName: 'Set header auth for a resource.',
		method: 'POST',
		path: '/resource/{resourceId}/header-auth',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "user": "string", //required
  "password": "string" //required
}`
	},
	{
		operation: 'postResourceResourceIdWhitelistAdd',
		displayName: 'Add entries to the whitelist for a resource.',
		method: 'POST',
		path: '/resource/{resourceId}/whitelist/add',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "email": "string" //required
}`
	},
	{
		operation: 'postResourceResourceIdWhitelistRemove',
		displayName: 'Remove entries from the whitelist for a resource.',
		method: 'POST',
		path: '/resource/{resourceId}/whitelist/remove',
		tags: ['Resource'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "email": "string"
}`
	},
	{
		operation: 'postResourceResourceIdAccessToken',
		displayName: 'Create an access token for a resource.',
		method: 'POST',
		path: '/resource/{resourceId}/access-token',
		tags: ['Resource', 'Access Token'],
		pathParams: ['resourceId'],
		hasBody: true,
		bodyDefault: `{
  "validForSeconds": 1,
  "title": "string",
  "description": "string"
}`
	},
	{
		operation: 'getResourceResourceIdAccessTokens',
		displayName: 'List access tokens for a resource.',
		method: 'GET',
		path: '/resource/{resourceId}/access-tokens',
		tags: ['Resource', 'Access Token'],
		pathParams: ['resourceId'],
		hasBody: false
	},
	{
		operation: 'postRoleRoleIdAddUserId',
		displayName: 'Assign a role to a user.',
		method: 'POST',
		path: '/role/{roleId}/add/{userId}',
		tags: ['Role', 'User'],
		pathParams: ['roleId', 'userId'],
		hasBody: false
	},
	{
		operation: 'getUserUserId',
		displayName: 'Get a user.',
		method: 'GET',
		path: '/user/{userId}',
		tags: ['User'],
		pathParams: ['userId'],
		hasBody: false
	},
	{
		operation: 'postUserUserId2fa',
		displayName: 'Enable 2FA for a user.',
		method: 'POST',
		path: '/user/{userId}/2fa',
		tags: ['User'],
		pathParams: ['userId'],
		hasBody: true,
		bodyDefault: `{
  "twoFactorSetupRequested": true //required
}`
	},
	{
		operation: 'getOrgOrgIdDomainDomainId',
		displayName: 'Get a domain.',
		method: 'GET',
		path: '/org/{orgId}/domain/{domainId}',
		tags: ['Organization', 'Domain'],
		pathParams: ['orgId', 'domainId'],
		hasBody: false
	},
	{
		operation: 'patchOrgOrgIdDomainDomainId',
		displayName: 'Update a domain.',
		method: 'PATCH',
		path: '/org/{orgId}/domain/{domainId}',
		tags: ['Organization', 'Domain'],
		pathParams: ['orgId', 'domainId'],
		hasBody: false
	},
	{
		operation: 'getOrgOrgIdDomainDomainIdDnsRecords',
		displayName: 'List DNS records for a domain.',
		method: 'GET',
		path: '/org/{orgId}/domain/{domainId}/dns-records',
		tags: ['Organization', 'Domain'],
		pathParams: ['orgId', 'domainId'],
		hasBody: false
	},
	{
		operation: 'deleteClientClientId',
		displayName: 'Delete a client.',
		method: 'DELETE',
		path: '/client/{clientId}',
		tags: ['Client'],
		pathParams: ['clientId'],
		hasBody: false
	},
	{
		operation: 'postClientClientId',
		displayName: 'Update a client.',
		method: 'POST',
		path: '/client/{clientId}',
		tags: ['Client'],
		pathParams: ['clientId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string",
  "siteIds": [
    1
  ]
}`
	},
	{
		operation: 'getClientClientId',
		displayName: 'Get a client.',
		method: 'GET',
		path: '/client/{clientId}',
		tags: ['Client'],
		pathParams: ['clientId'],
		hasBody: false
	},
	{
		operation: 'deleteAccessTokenAccessTokenId',
		displayName: 'Delete an access token.',
		method: 'DELETE',
		path: '/access-token/{accessTokenId}',
		tags: ['Access Token'],
		pathParams: ['accessTokenId'],
		hasBody: false
	},
	{
		operation: 'putIdpOidc',
		displayName: 'Create an OpenID Connect identity provider.',
		method: 'PUT',
		path: '/idp/oidc',
		tags: ['Identity Provider'],
		pathParams: [],
		hasBody: true,
		bodyDefault: `{
  "name": "string", //required
  "clientId": "string", //required
  "clientSecret": "string", //required
  "authUrl": "string", //required
  "tokenUrl": "string", //required
  "identifierPath": "string", //required
  "emailPath": "string",
  "namePath": "string",
  "scopes": "string", //required
  "autoProvision": true
}`
	},
	{
		operation: 'postIdpIdpIdOidc',
		displayName: 'Update an OpenID Connect identity provider.',
		method: 'POST',
		path: '/idp/{idpId}/oidc',
		tags: ['Identity Provider'],
		pathParams: ['idpId'],
		hasBody: true,
		bodyDefault: `{
  "name": "string",
  "clientId": "string",
  "clientSecret": "string",
  "authUrl": "string",
  "tokenUrl": "string",
  "identifierPath": "string",
  "emailPath": "string",
  "namePath": "string",
  "scopes": "string",
  "autoProvision": true,
  "defaultRoleMapping": "string",
  "defaultOrgMapping": "string"
}`
	},
	{
		operation: 'deleteIdpIdpId',
		displayName: 'Delete an identity provider.',
		method: 'DELETE',
		path: '/idp/{idpId}',
		tags: ['Identity Provider'],
		pathParams: ['idpId'],
		hasBody: false
	},
	{
		operation: 'getIdpIdpId',
		displayName: 'Get an identity provider.',
		method: 'GET',
		path: '/idp/{idpId}',
		tags: ['Identity Provider'],
		pathParams: ['idpId'],
		hasBody: false
	},
	{
		operation: 'getIdp',
		displayName: 'List identity providers.',
		method: 'GET',
		path: '/idp',
		tags: ['Identity Provider'],
		pathParams: [],
		hasBody: false
	},
	{
		operation: 'putIdpIdpIdOrgOrgId',
		displayName: 'Attach an identity provider to an organization.',
		method: 'PUT',
		path: '/idp/{idpId}/org/{orgId}',
		tags: ['Identity Provider', 'Organization'],
		pathParams: ['idpId', 'orgId'],
		hasBody: true,
		bodyDefault: `{
  "roleMapping": "string",
  "orgMapping": "string"
}`
	},
	{
		operation: 'deleteIdpIdpIdOrgOrgId',
		displayName: 'Detach an identity provider from an organization.',
		method: 'DELETE',
		path: '/idp/{idpId}/org/{orgId}',
		tags: ['Identity Provider', 'Organization'],
		pathParams: ['idpId', 'orgId'],
		hasBody: false
	},
	{
		operation: 'postIdpIdpIdOrgOrgId',
		displayName: 'Update an identity provider’s configuration for an organization.',
		method: 'POST',
		path: '/idp/{idpId}/org/{orgId}',
		tags: ['Identity Provider', 'Organization'],
		pathParams: ['idpId', 'orgId'],
		hasBody: true,
		bodyDefault: `{
  "roleMapping": "string",
  "orgMapping": "string"
}`
	},
	{
		operation: 'getIdpIdpIdOrg',
		displayName: 'List organizations attached to an identity provider.',
		method: 'GET',
		path: '/idp/{idpId}/org',
		tags: ['Identity Provider', 'Organization'],
		pathParams: ['idpId'],
		hasBody: false
	},
	{
		operation: 'get',
		displayName: 'Health check.',
		method: 'GET',
		path: '/',
		tags: [],
		pathParams: [],
		hasBody: false
	}
];

const resourceTags = Array.from(
	new Set(endpointConfigs.flatMap((cfg) => cfg.tags)),
).sort();

const pathParamNames = Array.from(
	new Set(endpointConfigs.flatMap((cfg) => cfg.pathParams)),
);

const properties: INodeProperties[] = [];

// Body field per operation that accepts a body, with per-operation default JSON
for (const cfg of endpointConfigs.filter((c) => c.hasBody)) {
	const resourceValues = Array.from(
		new Set(cfg.tags.map((tag) => toResourceValue(tag))),
	);

	properties.push({
		displayName: 'Body',
		name: 'body',
		type: 'json',
		default: 'undefined',
		description: `Request body for ${cfg.method} ${cfg.path}`,
		displayOptions: {
			show: {
				resource: resourceValues,
				operation: [cfg.operation],
			},
		},
	});
}

// Resource selector (explicit, alphabetized options to satisfy lint rules)
properties.push({
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	required: true,
	default: 'accessToken',
	options: [
		{
			name: 'Access Token',
			value: 'accessToken',
		},
		{
			name: 'API Key',
			value: 'apiKey',
		},
		{
			name: 'Blueprint',
			value: 'blueprint',
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
			name: 'Identity Provider',
			value: 'identityProvider',
		},
		{
			name: 'Invitation',
			value: 'invitation',
		},
		{
			name: 'Miscellaneous',
			value: 'miscellaneous',
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
			name: 'Role',
			value: 'role',
		},
		{
			name: 'Rule',
			value: 'rule',
		},
		{
			name: 'Site',
			value: 'site',
		},
		{
			name: 'Target',
			value: 'target',
		},
		{
			name: 'User',
			value: 'user',
		},
	],
});

// Operation selector per resource
for (const tag of resourceTags) {
	const resourceValue = toResourceValue(tag);
	const optionsForResource: INodePropertyOptions[] = endpointConfigs
		.filter((cfg) => cfg.tags.includes(tag))
		.map((cfg) => ({
			name: cfg.displayName,
			value: cfg.operation,
			action: cfg.displayName,
			description: `${cfg.method} ${cfg.path}`,
		}));

	if (!optionsForResource.length) continue;

	properties.push({
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [resourceValue],
			},
		},
		options: optionsForResource,
		default: '',
	});
}

// Path parameters – only show for operations that need them
for (const paramName of pathParamNames) {
	const operationsUsingParam = endpointConfigs.filter((cfg) =>
		cfg.pathParams.includes(paramName),
	);
	if (!operationsUsingParam.length) continue;

	const showResources = Array.from(
		new Set(
			operationsUsingParam.flatMap((cfg) =>
				cfg.tags.map((tag) => toResourceValue(tag)),
			),
		),
	);

	const showOperations = operationsUsingParam.map((cfg) => cfg.operation);

	properties.push({
		displayName: toParamDisplayName(paramName),
		name: paramName,
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: showResources,
				operation: showOperations,
			},
		},
	});
}

// Options
properties.push({
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	options: [
		{
			displayName: 'Raw Response',
			name: 'rawResponse',
			type: 'boolean',
			default: false,
			description:
				'Whether to return the full response data instead of splitting arrays into individual items',
		},
	],
});

const endpointConfigMap: { [operation: string]: EndpointConfig } = {};
for (const cfg of endpointConfigs) {
	endpointConfigMap[cfg.operation] = cfg;
}

export class Pangolin implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin',
		name: 'pangolin',
		icon: 'file:../../icons/pangolin.svg',
		group: ['transform'],
		version: 1,
		subtitle:
			'={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with the Pangolin API',
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
			},
		],
		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const cfg = endpointConfigMap[operation];

				if (!cfg) {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation "${operation}".`,
						{ itemIndex: i },
					);
				}

				// Build endpoint path by substituting path parameters
				let endpointPath = cfg.path;
				for (const paramName of cfg.pathParams) {
					const value = this.getNodeParameter(paramName, i) as string;
					if (value === undefined || value === null || value === '') {
						throw new NodeOperationError(
							this.getNode(),
							`Parameter "${paramName}" is required.`,
							{ itemIndex: i },
						);
					}

					endpointPath = endpointPath.replace(
						new RegExp(`{${paramName}}`, 'g'),
						encodeURIComponent(value),
					);
				}

				// Body for endpoints that accept one
				let body: IDataObject = {};
				if (cfg.hasBody) {
					const bodyValue = this.getNodeParameter('body', i, '') as
						| string
						| IDataObject;

					if (typeof bodyValue === 'string') {
						const trimmed = bodyValue.trim();
						if (trimmed) {
							try {
								body = JSON.parse(trimmed) as IDataObject;
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Body must be valid JSON: ${(error as Error).message}`,
									{ itemIndex: i },
								);
							}
						}
					} else if (bodyValue && typeof bodyValue === 'object') {
						body = bodyValue;
					}
				}

				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const rawResponse = options.rawResponse === true;

				const response = await pangolinApiRequest.call(
					this,
					cfg.method,
					endpointPath,
					body,
				);

				if (rawResponse) {
					returnData.push({
						json: response as IDataObject,
						pairedItem: { item: i },
					});
				} else if (Array.isArray(response)) {
					for (const element of response) {
						returnData.push({
							json: element as IDataObject,
							pairedItem: { item: i },
						});
					}
				} else {
					returnData.push({
						json: response as IDataObject,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}

				throw error;
			}
		}

		return [returnData];
	}
}
