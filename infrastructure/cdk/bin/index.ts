#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { pascalCase } from '@heythanks/helpers'
import { AnalyticsStack } from '../lib/analytics/analytics-stack'
import { DnsStack } from '../lib/dns/dns-stack'

const defaultEnv = { account: '822723261311', region: 'us-east-2' }

if (!process.env.PROJECT || !process.env.STAGE) {
    console.log('Please specify a project and stage for this CDK stack')
} else {
    const project = pascalCase(process.env.PROJECT)
    const stage = pascalCase(process.env.STAGE)

    const app = new cdk.App()
    const dnsStack = new DnsStack(app, `${project}DnsStack${stage}`, { env: defaultEnv, project, stage })
    const { domain, dnsRecords, hostedZone } = dnsStack
    new AnalyticsStack(app, `${project}AnalyticsStack${stage}`, { env: defaultEnv, project, stage, domain, dnsRecords, hostedZone })
}
