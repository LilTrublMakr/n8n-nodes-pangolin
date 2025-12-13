# n8n-nodes-pangolin

This is an n8n community node to connect to the Pangolin API. This was completely vibe coded so I wouldn't be surprised if there are bugs. Please open an issue and I will try to fix it as soon as possible.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)
[Compatibility](#compatibility)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

1. Go to Settings > Community Nodes.
1. Select Install.
1. Enter in `n8n-nodes-pangolin` as the package name.
1. Check the box to accept the risk of installing from a public source.
1. Click on the "Install" button.

## Operations

Every endpoint listed in the [Official Pangolin SWAGGER API](https://pangapi.ltm56.xyz/v1/docs/) is in this node as an operation. They are currently named as the description of the endpoint. I would eventually like to come up with a better naming convention.

## Credentials

Please read the [Pangolin Integration API](https://docs.pangolin.net/manage/integration-api) page to learn how to set up the API. As of November 2025, the integration API is disabled by default. The integration API is different than the internal Pangolin API.

There are multiple types of API keys: organization keys and root keys.

- Organization keys can be made from within the organization.
  - From within an organization, in the left menu, ORGANIZATION > API Keys
  - https://pangolin.example.tld/[organization slug]/settings/api-keys
- Root keys can only be made by a server admin. These keys are able to control the entire Pangolin instance so use and protect these keys with care.
  - These can be created/edited in Server Admin > API Keys
  - https://pangolin.example.tld/admin/api-keys

## Compatibility

This node has been created on N8N version 1.118 and Pangolin 1.12. Prior versions may work but have not been tested.

| Tested | N8N Version | Pangolin Version |
| --- | --- | --- |
| Untested | < 1.118 | < 1.12 |
| ✅ | 1.118-1.121 | 1.12 |

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Pangolin Home Page](https://pangolin.net/)
- [Pangolin Docs](https://docs.pangolin.net/)
- [Pangolin API Documentation](https://api.pangolin.net/v1/docs/)
- [Pangolin Github](https://github.com/fosrl/pangolin)

## Version history

### 1.0.0

- Initial release.
