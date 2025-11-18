import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { pangolinApiRequest } from './GenericFunctions';

export class PangolinDomain implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pangolin Domain',
		name: 'pangolinDomain',
		icon: 'file:../../icons/pangolin.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Manage Pangolin domains',
		usableAsTool: true,
		defaults: {
			name: 'Pangolin Domain',
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
					{ name: 'List', value: 'list', action: 'List domains' },
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
						`/v1/org/${orgId}/domains`,
					)) as IDataObject;

					let domains: IDataObject[] = [];

					if (Array.isArray(res)) {
						domains = res;
					} else if (res.data && (res.data as IDataObject).domains) {
						const data = res.data as IDataObject;
						if (Array.isArray(data.domains)) {
							domains = data.domains as IDataObject[];
						}
					} else {
						domains = [res];
					}

					const out =
						options.returnAll === false
							? domains.slice(0, Number(options.limit ?? 50))
							: domains;

					for (const d of out) {
						returnData.push({ json: (d ?? {}) as IDataObject });
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
