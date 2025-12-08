import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PangolinApi implements ICredentialType {
	name = 'pangolinApi';
	displayName = 'Pangolin API';
	documentationUrl = 'https://api.pangolin.net/v1/docs/';
	icon: Icon = 'file:../icons/pangolin.svg';

		properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.pangolin.net',
			placeholder: 'https://api.pangolin.net',
			required: true,
			description:
				'Base URL of your Pangolin API instance, without the trailing slash. For example: https://api.pangolin.net',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'string',
			default: 'v1',
			description:
				'API version path segment to use in requests, for example "v1". Leave empty to call the root without a version segment.',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description:
				'Pangolin API access token. It will be sent as a Bearer token in the Authorization header.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.accessToken}}',
			},
		},
	};

	/**
	 * Credential test:
	 *
	 * Sends a GET request to the Pangolin health endpoint.
	 *
	 * A healthy Pangolin instance is expected to respond with:
	 *   { "message": "Healthy" }
	 *
	 * If Pangolin responds with a non-2xx status, n8n will surface the
	 * error JSON (including any "message" field) in the test dialog.
	 */
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '={{"/" + ($credentials.apiVersion || "v1") + "/"}}',
			method: 'GET',
		},
	};
}
