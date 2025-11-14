import type {
	IDataObject,
	ILoadOptionsFunctions,
	IExecuteFunctions,
} from 'n8n-workflow';

type ExecCtx = IExecuteFunctions | ILoadOptionsFunctions;

export async function pangolinApiRequest(
	this: ExecCtx,
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
) {
	const { baseUrl } = (await this.getCredentials('pangolinApi')) as {
		baseUrl: string;
	};

	const base = baseUrl.replace(/\/+$/, '');
	const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	const options = {
		method,
		url: `${base}${path}`,
		qs,
		body,
		headers,
		json: true as const,
	};

	// Relies on credentials to inject Authorization header.
	return this.helpers.httpRequestWithAuthentication.call(this, 'pangolinApi', options);
}
