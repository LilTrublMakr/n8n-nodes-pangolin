// nodes/Pangolin/GenericFunctions.ts

import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';

type ExecCtx = IExecuteFunctions | ILoadOptionsFunctions;

/**
 * Shared HTTP helper for Pangolin requests.
 *
 * - Uses the `pangolinApi` credential.
 * - Respects the configured `baseUrl`.
 * - Normalizes endpoint to start with `/`.
 * - Ensures `/v1` is present in the base URL.
 */
export async function pangolinApiRequest(
	this: ExecCtx,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = (await this.getCredentials('pangolinApi')) as IDataObject;

	const baseUrl = (credentials.baseUrl as string | undefined) ?? '';
	let apiVersion = (credentials.apiVersion as string | undefined) || 'v1';

	if (!baseUrl) {
		throw new Error('Pangolin credential is missing "Base URL".');
	}

	// Normalize version (no leading/trailing slashes)
	apiVersion = apiVersion.replace(/^\/+/, '').replace(/\/+$/, '');

	// Normalize base URL (no trailing slashes)
	let baseRoot = baseUrl.replace(/\/+$/, '');

	// If base URL already ends with the version segment, strip it to avoid "/v1/v1"
	const versionSuffix = apiVersion ? `/${apiVersion}` : '';
	if (versionSuffix && baseRoot.endsWith(versionSuffix)) {
		baseRoot = baseRoot.slice(0, -versionSuffix.length);
	}

	const base = versionSuffix ? `${baseRoot}${versionSuffix}` : baseRoot;
	const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	const options: IHttpRequestOptions = {
		method: method as IHttpRequestMethods,
		url: `${base}${path}`,
		qs,
		headers,
		json: true,
	};

	// Only send a body for non-GET methods when we actually have data
	const hasBody =
		Object.keys(body).length > 0 && method.toUpperCase() !== 'GET';

	if (hasBody) {
		options.body = body;
	}

	const response = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'pangolinApi',
		options,
	);

	return response as IDataObject | IDataObject[];
}

/**
 * Convenience helper for simple offset-based pagination.
 *
 * Not currently used by the node, but kept here for future expansion
 * when mapping specific Pangolin endpoints that support offset/limit.
 */
export async function pangolinApiRequestAllItems(
	this: ExecCtx,
	method: string,
	endpoint: string,
	propertyName: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];

	let offset = 0;
	let hasMore = true;

	while (hasMore) {
		const query: IDataObject = {
			...qs,
			offset,
		};

		const responseData = (await pangolinApiRequest.call(
			this,
			method,
			endpoint,
			body,
			query,
			headers,
		)) as IDataObject;

		const items = responseData[propertyName] as IDataObject[] | undefined;

		if (!Array.isArray(items) || items.length === 0) {
			hasMore = false;
			continue;
		}

		returnData.push(...items);

		offset += items.length;
	}

	return returnData;
}
