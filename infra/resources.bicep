param location string
param environmentName string
param resourceToken string
param viteAppBaseUrl string

// Resource prefix (≤ 3 characters)
var resourcePrefix = 'sks'

// Create Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'az-${resourcePrefix}-logs-${resourceToken}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Create Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'az-${resourcePrefix}-ai-${resourceToken}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Create User-assigned Managed Identity
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'az-${resourcePrefix}-id-${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Create Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: 'az-${resourcePrefix}-kv-${resourceToken}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: false
    accessPolicies: []
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Role assignment: Key Vault Secrets Officer for user-assigned identity
resource keyVaultSecretsOfficerRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, userAssignedIdentity.id, 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7') // Key Vault Secrets Officer
    principalId: userAssignedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Create Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'az-${resourcePrefix}-swa-${resourceToken}'
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    allowConfigFileUpdates: true
    enterpriseGradeCdnStatus: 'Disabled'
    stagingEnvironmentPolicy: 'Enabled'
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  tags: {
    'azd-env-name': environmentName
    'azd-service-name': 'smart-krishi-sahayak-frontend'
  }
}

// Configure Static Web App settings
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2022-09-01' = {
  name: 'appsettings'
  parent: staticWebApp
  properties: {
    VITE_APP_BASE_URL: viteAppBaseUrl != '' ? viteAppBaseUrl : staticWebApp.properties.defaultHostname
    APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString
  }
}

// Create Cognitive Services account for Gemini AI (placeholder)
resource cognitiveServices 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: 'az-${resourcePrefix}-cog-${resourceToken}'
  location: location
  kind: 'TextAnalytics'
  sku: {
    name: 'F0' // Free tier
  }
  properties: {
    customSubDomainName: 'az-${resourcePrefix}-cog-${resourceToken}'
    publicNetworkAccess: 'Enabled'
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Store Gemini API key in Key Vault (user needs to add manually)
resource geminiApiKeySecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  name: 'GEMINI-API-KEY'
  parent: keyVault
  properties: {
    value: 'YOUR_GEMINI_API_KEY_HERE' // User needs to update this
  }
}

// Outputs
output STATIC_WEB_APP_URL string = 'https://${staticWebApp.properties.defaultHostname}'
output STATIC_WEB_APP_NAME string = staticWebApp.name
output APPLICATIONINSIGHTS_CONNECTION_STRING string = applicationInsights.properties.ConnectionString
output AZURE_KEY_VAULT_ENDPOINT string = keyVault.properties.vaultUri
output USER_ASSIGNED_IDENTITY_CLIENT_ID string = userAssignedIdentity.properties.clientId
