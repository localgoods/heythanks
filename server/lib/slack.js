import { IncomingWebhook } from '@slack/webhook'
const url = process.env.SLACK_WEBHOOK_URL

export class SlackNotification {
    constructor() {
        this.webhook = new IncomingWebhook(url)
    }

    async send(message) {
        // Send the notification
        return await this.webhook.send({
            text: message,
        })
    }
}