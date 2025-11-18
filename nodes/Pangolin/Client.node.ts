import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { pangolinApiRequest } from './GenericFunctions';

export class PangolinClient implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin Client',
		name: 'pangolinClient',
		icon: 'file:../../icons/pangolin.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Manage Pangolin clients',
		usableAsTool: true,
		defaults: {
			name: 'Pangolin Client',
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'list',
				options: [
					{ name: 'List', value: 'list', action: 'List clients' },
				],
			},
			{
				displayName: 'Organization ID',
				name: 'orgId',
				type: 'string',
				default: '',
				required: true,
				description:
					'Organization ID from Pangolin (for example, <code>homelab</code>). You can set this from a previous node using an expression.',
			},
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
			},
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'list') {
					const orgId = this.getNodeParameter('orgId', i) as string;
					const options = this.getNodeParameter('options', i, {}) as IDataObject;

					const res = (await pangolinApiRequest.call(
						this,
						'GET',
						`/v1/org/${orgId}/clients`,
					)) as IDataObject;

					let clients: IDataObject[] = [];

					if (Array.isArray(res)) {
						clients = res;
					} else if (res.data && (res.data as IDataObject).clients) {
						const data = res.data as IDataObject;
						if (Array.isArray(data.clients)) {
							clients = data.clients as IDataObject[];
						}
					} else {
						clients = [res];
					}

					const out =
						options.returnAll === false
							? clients.slice(0, Number(options.limit ?? 50))
							: clients;

					for (const c of out) {
						returnData.push({ json: (c ?? {}) as IDataObject });
					}

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
