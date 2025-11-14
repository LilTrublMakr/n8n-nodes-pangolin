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

	return this.helpers.httpRequestWithAuthentication.call(this, 'pangolinApi', options);
}

/** Load Options helpers (used by dropdowns) */
export async function loadOrganizations(this: ILoadOptionsFunctions) {
	const data = (await pangolinApiRequest.call(this, 'GET', '/v1/orgs')) as Array<{
		id?: string;
		name?: string;
	}>;
	return (data ?? []).map((o) => ({ name: o?.name ?? o?.id ?? 'Org', value: o?.id ?? '' }));
}

export async function loadDomains(this: ILoadOptionsFunctions) {
	const orgId = this.getCurrentNodeParameter('orgId') as string;
	if (!orgId) return [];
	const data = (await pangolinApiRequest.call(
		this,
		'GET',
		`/v1/orgs/${orgId}/domains`,
	)) as Array<{ id?: string; domain?: string; name?: string }>;
	return (data ?? []).map((d) => ({
		name: d?.name ?? d?.domain ?? d?.id ?? 'Domain',
		value: d?.id ?? '',
	}));
}

export async function loadResources(this: ILoadOptionsFunctions) {
	const orgId = this.getCurrentNodeParameter('orgId') as string;
	if (!orgId) return [];
	const data = (await pangolinApiRequest.call(
		this,
		'GET',
		`/v1/orgs/${orgId}/resources`,
	)) as Array<{ id?: string; name?: string }>;
	return (data ?? []).map((r) => ({ name: r?.name ?? r?.id ?? 'Resource', value: r?.id ?? '' }));
}
