import { IncomingWebhook } from '@slack/webhook'
const url = process.env.SLACK_WEBHOOK_URL

export default class Slack {
    async send(message) {
        console.log(`Sending slack notification with message "${message}"`)
        const webhook = new IncomingWebhook(url)
        return await webhook.send({
            text: message
        })
    }
}