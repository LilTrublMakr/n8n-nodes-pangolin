import type {
	ICredentialType,
	INodeProperties,
	Icon,
	IAuthenticateGeneric,
} from 'n8n-workflow';

export class PangolinApi implements ICredentialType {
	name = 'pangolinApi';
	displayName = 'Pangolin API';

	// Type is Icon (not string)
	icon: Icon = 'file:../icons/pangolin.svg';

	// Optional – keep or remove as you like
	documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes/overview/';

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
				'Pangolin Integration API key created in Pangolin.',
			required: true,
		},
	];

	// Make sure `type` is the literal "generic"
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiKey}}',
			},
		},
	};

	test: ICredentialType['test'] = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/',
			method: 'GET',
		},
	};
}
