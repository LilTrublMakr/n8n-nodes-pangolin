import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

type ExecCtx = IExecuteFunctions | ILoadOptionsFunctions;

/**
 * Shared HTTP helper for Pangolin requests.
 *
 * - Uses the `pangolinApi` credential.
 * - Respects the configured `baseUrl`.
 * - Normalizes endpoint to start with `/`.
 */
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

	return this.helpers.httpRequestWithAuthentication.call(this, 'pangolinApi', options);
}
