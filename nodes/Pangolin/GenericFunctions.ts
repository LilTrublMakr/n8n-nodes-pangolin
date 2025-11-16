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

/**
 * Helper to extract an array from a Pangolin-style response.
 *
 * Handles shapes like:
 *   [ ... ]
 *   { data: [ ... ] }
 *   { data: { resources: [ ... ] } }
 *   { resources: [ ... ] }
 */
function extractListFromResponse(
	response: IDataObject | IDataObject[] | undefined,
	keys: string[],
): IDataObject[] {
	if (!response) return [];

	// Direct array
	if (Array.isArray(response)) {
		return response as IDataObject[];
	}

	const top = response as IDataObject;

	// If `data` itself is an array
	if (Array.isArray(top.data)) {
		return top.data as IDataObject[];
	}

	// Top-level keys, e.g. { resources: [...] }
	for (const key of keys) {
		const value = top[key];
		if (Array.isArray(value)) {
			return value as IDataObject[];
		}
	}

	// Nested in `data`, e.g. { data: { resources: [...] } }
	if (top.data && typeof top.data === 'object') {
		const dataObj = top.data as IDataObject;

		if (Array.isArray(dataObj)) {
			return dataObj as IDataObject[];
		}

		for (const key of keys) {
			const value = dataObj[key];
			if (Array.isArray(value)) {
				return value as IDataObject[];
			}
		}
	}

	return [];
}

/**
 * Load organizations into a dynamic options list.
 *
 * Matches your real-world example:
 * {
 *   "data": {
 *     "orgs": [
 *       {
 *         "orgId": "homelab",
 *         "name": "Homelab",
 *         ...
 *       }
 *     ],
 *     "pagination": { ... }
 *   },
 *   "success": true,
 *   ...
 * }
 *
 * We use `orgId` as the value for subsequent calls.
 */
export async function loadOrganizations(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const response = (await pangolinApiRequest.call(
			this,
			'GET',
			'/v1/orgs',
		)) as IDataObject;

		const data = (response.data ?? {}) as IDataObject;
		const orgsRaw = Array.isArray(data.orgs) ? (data.orgs as IDataObject[]) : [];

		const options: INodePropertyOptions[] = [];

		for (const org of orgsRaw) {
			const id = org.orgId as string | undefined;
			if (!id) continue;

			const name = (org.name as string | undefined) ?? id;

			options.push({
				name,
				value: id,
			});
		}

		return options;
	} catch {
		// If we can't load orgs, just return empty;
		// the user can still enter an org ID via expression.
		return [];
	}
}

/**
 * Load domains for selected organization.
 * Expected shapes like:
 * { data: { domains: [ ... ] }, ... }
 */
export async function loadDomains(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const orgId = this.getCurrentNodeParameter('orgId') as string;
		if (!orgId) {
			return [];
		}

		const response = (await pangolinApiRequest.call(
			this,
			'GET',
			`/v1/org/${orgId}/domains`,
		)) as IDataObject | IDataObject[];

		const domains = extractListFromResponse(response, ['domains']);

		const options: INodePropertyOptions[] = [];

		for (const domain of domains) {
			const id =
				(domain.domainId as string | number | undefined) ??
				(domain.id as string | number | undefined) ??
				(domain.domain as string | number | undefined) ??
				(domain.hostname as string | number | undefined);

			if (id === undefined || id === null || id === '') {
				continue;
			}

			const idStr = String(id);

			const name =
				(domain.name as string | undefined) ??
				(domain.domain as string | undefined) ??
				(domain.hostname as string | undefined) ??
				idStr;

			options.push({
				name,
				value: idStr,
			});
		}

		return options;
	} catch {
		return [];
	}
}

/**
 * Load resources for selected organization.
 *
 * Matches your real-world example:
 * {
 *   "data": {
 *     "resources": [
 *       { "resourceId": 1, "name": "GIT", ... },
 *       ...
 *     ],
 *     "pagination": { ... }
 *   },
 *   "success": true,
 *   ...
 * }
 *
 * IMPORTANT: the option value is ALWAYS the numeric `resourceId`,
 * so calls to /resource/{resourceId} or /v1/org/{orgId}/resources/{resourceId}
 * use the correct ID.
 *
 * The label now includes the org ID so the dropdown clearly shows
 * "org resources", e.g. "homelab – GIT (#1)".
 */
export async function loadResources(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const orgId = this.getCurrentNodeParameter('orgId') as string;
		if (!orgId) {
			return [];
		}

		const response = (await pangolinApiRequest.call(
			this,
			'GET',
			`/v1/org/${orgId}/resources`,
		)) as IDataObject | IDataObject[];

		const resources = extractListFromResponse(response, ['resources']);

		const options: INodePropertyOptions[] = [];

		for (const resource of resources) {
			// Always use resourceId as the value
			const id = resource.resourceId as number | string | undefined;

			if (id === undefined || id === null || id === '') {
				continue;
			}

			const idStr = String(id);

			const name =
				(resource.name as string | undefined) ??
				(resource.fullDomain as string | undefined) ??
				idStr;

			// 👇 This is the main change: include orgId in the label
			options.push({
				name: `${orgId} – ${name} (#${idStr})`,
				value: idStr,
			});
		}

		return options;
	} catch {
		return [];
	}
}
