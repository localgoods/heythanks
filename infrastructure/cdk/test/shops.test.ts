import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { DnsStack } from '../lib/dns/dns-stack'
import { ShopsStack } from '../lib/shops/shops-stack'

// Todo actually test something
test('API Created', () => {

  const defaultEnv = { account: '822723261311', region: 'us-east-2' }
  const project = 'HeyThanks'
  const stage = 'Test'

  const app = new cdk.App()
  const dnsStack = new DnsStack(app, `${project}DnsStack${stage}`, { env: defaultEnv, project, stage })
  const { domain, dnsRecords, hostedZone } = dnsStack
  const shopsStack = new ShopsStack(app, `${project}ShopsStack${stage}`, { env: defaultEnv, project, stage, domain, dnsRecords, hostedZone })

  const shopsTemplate = Template.fromStack(shopsStack)
  console.log(shopsTemplate)
  Object.keys(shopsTemplate.findOutputs('*')).forEach(output => {
    console.log(output)
    expect(output).toBeDefined()
  })
})
