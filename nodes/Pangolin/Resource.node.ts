import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { pangolinApiRequest } from './GenericFunctions';

export class PangolinResource implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin Resource',
		name: 'pangolinResource',
		icon: 'file:../../icons/pangolin.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Manage Pangolin resources',
		usableAsTool: true,
		defaults: {
			name: 'Pangolin Resource',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pangolinApi',
				required: true,
			},
		],
		properties: [
			// ------------------------------------------------------------------
			// Operation
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'list',
				options: [
					{ name: 'Create', value: 'create', action: 'Create a resource' },
					{ name: 'Delete', value: 'delete', action: 'Delete a resource' },
					{ name: 'Get', value: 'get', action: 'Get a resource' },
					{ name: 'List', value: 'list', action: 'List resources' },
					{ name: 'Update', value: 'update', action: 'Update a resource' },
				],
			},

			// ------------------------------------------------------------------
			// Common: Organization scope
			// ------------------------------------------------------------------
			{
				displayName: 'Organization ID',
				name: 'orgId',
				type: 'string',
				default: '',
				required: true,
				description:
					'Organization ID from Pangolin (for example, <code>homelab</code>). You can set this from a previous node using an expression.',
			},

			// ------------------------------------------------------------------
			// Resource identifiers
			// ------------------------------------------------------------------
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'string',
				default: '',
				required: true,
				description:
					'Numeric resourceId from Pangolin (for example, <code>1</code>). Typically provided by a previous webhook or node.',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
					},
				},
			},

			// ------------------------------------------------------------------
			// Resource payload
			// ------------------------------------------------------------------
			{
				displayName: 'Target',
				name: 'target',
				type: 'string',
				default: '',
				description:
					'Target for the Pangolin resource (for example, <code>git.example.com:22</code>). You can set this from a previous node using an expression.',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'resourceBody',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				description:
					'JSON body for resource create/update (for example, <code>{ "name": "GIT", "protocol": "tcp", "proxyPort": 22 }</code>).',
			},

			// ------------------------------------------------------------------
			// List options
			// ------------------------------------------------------------------
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				default: {},
				placeholder: 'Add Option',
				options: [
					{
						displayName: 'Return All',
						name: 'returnAll',
						type: 'boolean',
						default: true,
						description: 'Whether to return all results or only up to a given limit',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 100000,
						},
						default: 50,
						description: 'Max number of results to return',
					},
				],
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const orgId = this.getNodeParameter('orgId', i) as string;

				// ---------- List ----------
				if (operation === 'list') {
					const options = this.getNodeParameter('options', i, {}) as IDataObject;
					const res = (await pangolinApiRequest.call(
						this,
						'GET',
						`/v1/org/${orgId}/resources`,
					)) as IDataObject;

					let resources: IDataObject[] = [];

					if (Array.isArray(res)) {
						resources = res;
					} else if (res.data && (res.data as IDataObject).resources) {
						const data = res.data as IDataObject;
						if (Array.isArray(data.resources)) {
							resources = data.resources as IDataObject[];
						}
					} else {
						resources = [res];
					}

					const out =
						options.returnAll === false
							? resources.slice(0, Number(options.limit ?? 50))
							: resources;

					for (const r of out) {
						returnData.push({ json: (r ?? {}) as IDataObject });
					}

					continue;
				}

				// ---------- Get ----------
				if (operation === 'get') {
					const resourceId = this.getNodeParameter('resourceId', i) as string;
					const res = await pangolinApiRequest.call(
						this,
						'GET',
						`/v1/org/${orgId}/resources/${resourceId}`,
					);
					returnData.push({ json: (res ?? {}) as IDataObject });
					continue;
				}

				// ---------- Create ----------
				if (operation === 'create') {
					const body = (this.getNodeParameter('resourceBody', i) as IDataObject) || {};
					const target = this.getNodeParameter('target', i, '') as string;

					if (target && typeof body === 'object') {
						(body as IDataObject).target = target;
					}

					const res = await pangolinApiRequest.call(
						this,
						'POST',
						`/v1/org/${orgId}/resources`,
						body,
					);
					returnData.push({ json: (res ?? {}) as IDataObject });
					continue;
				}

				// ---------- Update ----------
				if (operation === 'update') {
					const resourceId = this.getNodeParameter('resourceId', i) as string;
					const body = (this.getNodeParameter('resourceBody', i) as IDataObject) || {};
					const target = this.getNodeParameter('target', i, '') as string;

					if (target && typeof body === 'object') {
						(body as IDataObject).target = target;
					}

					const res = await pangolinApiRequest.call(
						this,
						'PATCH',
						`/v1/org/${orgId}/resources/${resourceId}`,
						body,
					);
					returnData.push({ json: (res ?? {}) as IDataObject });
					continue;
				}

				// ---------- Delete ----------
				if (operation === 'delete') {
					const resourceId = this.getNodeParameter('resourceId', i) as string;
					const res = await pangolinApiRequest.call(
						this,
						'DELETE',
						`/v1/org/${orgId}/resources/${resourceId}`,
					);
					returnData.push({ json: (res ?? {}) as IDataObject });
					continue;
				}

				throw new NodeOperationError(this.getNode(), 'Unsupported operation', {
					itemIndex: i,
				});
			} catch (err) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (err as Error).message } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), (err as Error).message, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
