import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PangolinApi implements ICredentialType {
	name = 'pangolinApi';

	displayName = 'Pangolin API';

	documentationUrl = 'https://api.pangolin.net/v1/docs/';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:18080',
			description:
				'Base URL of your Pangolin instance, for example https://pangolin.example.com',
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Pangolin API token used for Authorization header',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				// Sends: Authorization: Bearer <apiToken>
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	/**
	 * Credential test:
	 *
	 * Sends: GET {{baseUrl}}/v1/
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
			url: '/v1/',
			method: 'GET',
		},
	};
}
