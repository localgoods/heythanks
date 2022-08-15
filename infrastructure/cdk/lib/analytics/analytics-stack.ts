import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53targets from 'aws-cdk-lib/aws-route53-targets'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as certmgr from 'aws-cdk-lib/aws-certificatemanager'

export interface AnalyticsStackProps extends StackProps {
    project: string;
    stage: string;
    domain: string;
    dnsRecords: Record<string, string>;
    hostedZone: route53.HostedZone;
}

/**
 * Class representing the analytics stack.
 *
 * Shortest name:  {@link AnalyticsStack}
 * Full name:      {@link (AnalyticsStack:class)}
 */
export class AnalyticsStack extends Stack {

    public readonly service: string = 'Analytics'
    public readonly assetPath: string = '../../services/analytics/dist'

    /**
     * AnalyticsStack class constructor.
     * 
     * Shortest name:  {@link (AnalyticsStack:constructor)}
     * Full name:      {@link (AnalyticsStack:constructor)}
     */
    constructor(scope: Construct, id: string, props: AnalyticsStackProps) {

        /**
         * AnalyticsStack class constructor super method.
         * 
         * Shortest name:  {@link (AnalyticsStack:constructor:super)}
         * Full name:      {@link (AnalyticsStack:constructor:super)}
         */
        super(scope, id, props)

        const { project, stage, domain, dnsRecords, hostedZone } = props

        // Use analytics.heythanks.io for prod and dev.analytics.heythanks.io for dev
        const serviceDomain = stage === 'Prod' ? domain : [stage.toLowerCase(), domain].join('.')
    
        const certificate = new certmgr.DnsValidatedCertificate(this, `${project}${this.service}Cert${stage}`, {
            domainName: serviceDomain,
            subjectAlternativeNames: [
                [dnsRecords.analytics, serviceDomain].join('.')
            ],
            hostedZone,
            region: 'us-east-2'
        })

        const lambdaHandler = new lambda.Function(this, `${project}${this.service}Api${stage}`, {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(this.assetPath),
            environment: {
                PROJECT: project.toLowerCase(),
                STAGE: stage.toLowerCase(),
                SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY as string,
                SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET as string,
                SCOPES: process.env.SCOPES as string,
                DATABASE_URL: process.env.DATABASE_URL as string
            },
            timeout: Duration.seconds(25)
        })

        lambdaHandler.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonAthenaFullAccess'))
        lambdaHandler.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'))

        // Todo update to use new api gateway version when stable
        // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-apigateway-readme.html#apigateway-v2
        const apiGateway = new apigateway.LambdaRestApi(this, `${project}${this.service}ApiGateway${stage}`, {
            restApiName: `${project}${this.service}Gateway${stage}`,
            handler: lambdaHandler,
            domainName: {
                domainName: [dnsRecords.analytics, serviceDomain].join('.'),
                certificate
            },
            defaultCorsPreflightOptions: {
                allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS
            }
        })

        new route53.ARecord(this, `${project}${this.service}DnsARecordApi${stage}`, {
            recordName: [dnsRecords.analytics, serviceDomain].join('.'),
            zone: hostedZone as route53.IHostedZone,
            target: route53.RecordTarget.fromAlias(new route53targets.ApiGateway(apiGateway)),
            ttl: Duration.minutes(1),
        })

    }
}