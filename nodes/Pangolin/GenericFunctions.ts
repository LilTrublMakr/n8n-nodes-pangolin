import type {
	IDataObject,
	ILoadOptionsFunctions,
	IExecuteFunctions,
	INodePropertyOptions,
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

export async function loadOrganizations(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const response = (await pangolinApiRequest.call(
			this,
			'GET',
			'/v1/orgs',
		)) as IDataObject | IDataObject[];

		// Pangolin often wraps arrays in { data: [...] }
		const orgs = Array.isArray(response)
			? response
			: Array.isArray((response as IDataObject).data)
				? ((response as IDataObject).data as IDataObject[])
				: [];

		return orgs.map((org) => {
			const name =
				(org.name as string | undefined) ??
				(org.slug as string | undefined) ??
				(org.id as string | undefined) ??
				'Unnamed Organization';

			const value =
				(org.id as string | undefined) ??
				(org.slug as string | undefined) ??
				(org.name as string | undefined) ??
				name;

			return {
				name,
				value,
			};
		});
	} catch {
		// Swallow errors so the UI doesn't break; user can still enter ID via expression
		return [];
	}
}

export async function loadDomains(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const orgId = this.getCurrentNodeParameter('orgId') as string;
		if (!orgId) return [];

		const response = (await pangolinApiRequest.call(
			this,
			'GET',
			`/v1/orgs/${orgId}/domains`,
		)) as IDataObject | IDataObject[];

		const domains = Array.isArray(response)
			? response
			: Array.isArray((response as IDataObject).data)
				? ((response as IDataObject).data as IDataObject[])
				: [];

		return domains.map((domain) => {
			const name =
				(domain.name as string | undefined) ??
				(domain.domain as string | undefined) ??
				(domain.hostname as string | undefined) ??
				(domain.id as string | undefined) ??
				'Domain';

			const value =
				(domain.id as string | undefined) ??
				(domain.domain as string | undefined) ??
				(domain.name as string | undefined) ??
				name;

			return {
				name,
				value,
			};
		});
	} catch {
		return [];
	}
}

export async function loadResources(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const orgId = this.getCurrentNodeParameter('orgId') as string;
		if (!orgId) return [];

		const response = (await pangolinApiRequest.call(
			this,
			'GET',
			`/v1/orgs/${orgId}/resources`,
		)) as IDataObject | IDataObject[];

		const resources = Array.isArray(response)
			? response
			: Array.isArray((response as IDataObject).data)
				? ((response as IDataObject).data as IDataObject[])
				: [];

		return resources.map((resource) => {
			const name =
				(resource.name as string | undefined) ??
				(resource.id as string | undefined) ??
				'Resource';

			const value =
				(resource.id as string | undefined) ??
				(resource.name as string | undefined) ??
				name;

			return {
				name,
				value,
			};
		});
	} catch {
		return [];
	}
}
