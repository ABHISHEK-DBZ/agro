targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Azure region where all resources will be deployed')
param location string

@description('Name of the resource group')
param resourceGroupName string = 'rg-${environmentName}'

@description('Base URL for the application')
param viteAppBaseUrl string = ''

// Generate unique resource token
var resourceToken = uniqueString(subscription().id, location, environmentName)

// Create resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Deploy resources to the resource group
module resources 'resources.bicep' = {
  name: 'resources'
  scope: resourceGroup
  params: {
    location: location
    environmentName: environmentName
    resourceToken: resourceToken
    viteAppBaseUrl: viteAppBaseUrl
  }
}

// Outputs
output RESOURCE_GROUP_ID string = resourceGroup.id
output STATIC_WEB_APP_URL string = resources.outputs.STATIC_WEB_APP_URL
output APPLICATIONINSIGHTS_CONNECTION_STRING string = resources.outputs.APPLICATIONINSIGHTS_CONNECTION_STRING
output AZURE_KEY_VAULT_ENDPOINT string = resources.outputs.AZURE_KEY_VAULT_ENDPOINT
