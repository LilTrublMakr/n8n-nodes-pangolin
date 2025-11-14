import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PangolinApi implements ICredentialType {
	name = 'pangolinApi';
	displayName = 'Pangolin API';
	// icons for credentials resolve from the credentials folder:
	icon = 'file:../icons/pangolin.svg';
	// Optional, helps users discover the right docs page
	documentationUrl = 'https://docs.pangolin.net/manage/integration-api';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.your-domain.com',
			placeholder: 'https://api.your-domain.com',
			description:
				'Root URL of your Pangolin API (self-hosted), without a trailing slash. Example: <code>https://api.example.com</code>',
			required: true,
		},
		{
			displayName: 'API Key (Bearer)',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Pangolin Integration API key. Created in Pangolin under <b>Organization → API Keys</b> (or <b>Server Admin → API Keys</b> for root keys).',
			required: true,
		},
	];

	// Attach Authorization header for every request
	authenticate = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiKey}}',
			},
		},
	};

	// Lightweight connection test – ping Swagger UI (exists on /v1/docs)
	// Works whether docs are public or require auth; we send auth anyway.
	test: ICredentialType['test'] = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/docs',
			method: 'GET',
		},
	};
}
