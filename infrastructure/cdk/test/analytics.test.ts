import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { DnsStack } from '../lib/dns/dns-stack'
import { AnalyticsStack } from '../lib/analytics/analytics-stack'

// Todo actually test something
test('API Created', () => {

  const defaultEnv = { account: '822723261311', region: 'us-east-2' }
  const project = 'HeyThanks'
  const stage = 'Test'

  const app = new cdk.App()
  const dnsStack = new DnsStack(app, `${project}DnsStack${stage}`, { env: defaultEnv, project, stage })
  const { domain, dnsRecords, hostedZone } = dnsStack
  const analyticsStack = new AnalyticsStack(app, `${project}AnalyticsStack${stage}`, { env: defaultEnv, project, stage, domain, dnsRecords, hostedZone })

  const analyticsTemplate = Template.fromStack(analyticsStack)
  console.log(analyticsTemplate)
  Object.keys(analyticsTemplate.findOutputs('*')).forEach(output => {
    console.log(output)
    expect(output).toBeDefined()
  })
})
