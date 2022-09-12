import { IncomingWebhook } from '@slack/webhook'
const defaultWebhookURL = process.env.SLACK_WEBHOOK_URL

export default class Slack {
    #webhookURL

    constructor(webhookURL) {
        webhookURL = webhookURL || defaultWebhookURL
        if (!webhookURL) {
            throw new Error("Please set a default webhook URL or pass a webhook URL in the constructor.")
        }
        this.#webhookURL = webhookURL || defaultWebhookURL
    }

    async send(message) {
        console.log(`Sending slack notification with message: "${message}"`)
        const webhook = new IncomingWebhook(this.#webhookURL)
        return await webhook.send({
            text: message
        })
    }
}