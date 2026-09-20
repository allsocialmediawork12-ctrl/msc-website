# MSC WhatsApp Cloud API Webhook — Render Setup

## 1. Deploy the website

Push the updated project to GitHub and deploy the repository as a **Render Web Service**.

Use:

- Build command: `npm install`
- Start command: `npm start`

Your public service URL will look like:

`https://YOUR-SERVICE-NAME.onrender.com`

The webhook endpoint is:

`https://YOUR-SERVICE-NAME.onrender.com/webhook`

## 2. Add Render environment variables

Required for the webhook:

```text
META_WEBHOOK_VERIFY_TOKEN=choose-a-long-random-string
META_APP_SECRET=your-meta-app-secret
```

Optional for sending website enquiry notifications through Meta Cloud API:

```text
META_ACCESS_TOKEN=your-system-user-access-token
META_PHONE_NUMBER_ID=your-whatsapp-phone-number-id
META_GRAPH_API_VERSION=v26.0
META_WHATSAPP_TO=+917093328871,+919347498256
META_WHATSAPP_TEMPLATE_NAME=msc_new_enquiry
META_WHATSAPP_TEMPLATE_LANGUAGE=en_US
```

Do not put secrets in GitHub.

## 3. Configure the Meta webhook

In the Meta Developer App:

1. Open the **WhatsApp** product.
2. Open **Configuration**.
3. Find **Webhooks** and choose **Configure a webhook**.
4. Callback URL:

```text
https://YOUR-SERVICE-NAME.onrender.com/webhook
```

5. Verify Token:

Use exactly the same value you placed in:

```text
META_WEBHOOK_VERIFY_TOKEN
```

6. Click **Verify and Save**.
7. Subscribe to the **messages** webhook field.

Meta first performs a GET verification using `hub.mode`, `hub.verify_token`, and `hub.challenge`. The server returns the challenge only when the verify token matches. Incoming POST deliveries are checked against `X-Hub-Signature-256` using your Meta App Secret.

## 4. Test it

After saving the webhook, send a WhatsApp message to the WhatsApp number connected to your Meta Cloud API setup.

In the Render logs you should see:

```text
[Meta WhatsApp webhook] ...
```

The server also stores the latest incoming WhatsApp message summaries in:

```text
data/site.json
```

## 5. Website enquiry notifications through Meta

The website already sends enquiries to:

```text
POST /api/lead
```

When the Meta outbound variables are configured, the server uses Meta Cloud API for the WhatsApp owner notification.

Create an approved WhatsApp message template in Meta whose body contains one variable:

```text
{{1}}
```

The complete enquiry message is passed into that variable.

If the Meta outbound variables are not configured, the existing Twilio integration remains available as a fallback.

## 6. Important

A webhook and outbound messaging are separate:

- **Webhook:** receives WhatsApp events from Meta.
- **Cloud API send:** sends a message from the business WhatsApp number to a recipient.

You can configure the webhook first without configuring outbound messaging.
