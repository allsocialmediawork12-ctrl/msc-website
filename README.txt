MSC MANSION SPACE CREATIVE STUDIO — LIVE CMS BUILD
====================================================

PUBLIC WEBSITE
--------------
index.html + style.css + script.js

The public website uses the light ivory / champagne MSC luxury palette.

LIVE ADMIN CMS
--------------
Open /admin.html on the deployed website.

Initial admin access:
- Login ID: MSCADMIN
- Admin name: MSC Admin
- Password: Use the password configured by the server environment / existing deployment.

The admin login now requires both Login ID and password. The login screen and Admin Access section include Show/Hide password controls.

Change the admin name and password from the Admin Account section after logging in.

IMPORTANT
---------
This version uses the Node.js backend for real server-side content storage. Admin changes are no longer limited to one browser. Updated content, projects and laminate finishes are loaded from the server and are shown to every visitor.

WHAT THE ADMIN PANEL CAN EDIT
-----------------------------
- Header/navigation labels and buttons
- Home / hero text
- About / studio content
- Services: add, edit, reorder by editing records, or delete services
- Built-in service examples include Full Home Interiors, Modular Kitchens, Custom Wardrobes, False Ceiling & Lighting, Complete Renovation and Commercial Interiors
- Statement section
- Projects heading
- Why MSC section and points
- Process section and steps
- Estimate quotation text, highlights and rate
- Contact section
- Laminate finish section title/intro
- Footer text
- Social media links
- Portfolio project title, location, category, description, image and video
- Add and delete portfolio projects
- Upload, replace and delete portfolio images and videos
- Laminate finish library: upload image + finish name, edit name and delete finish
- Export/import a website data backup

LAMINATE FINISHES
-----------------
The public website includes a dedicated Laminate Finishes section.
The public card displays the laminate image and its name only.

ESTIMATE COSTING
----------------
The estimate quotation is based on:
₹1,000 per sq.ft.

Example:
1,500 sq.ft. × ₹1,000 = ₹15,00,000

The rate can also be edited from the Admin Panel if required later.

WHATSAPP LEAD NOTIFICATIONS
---------------------------
Private owner WhatsApp alert recipients are configured server-side as:
- +91 70933 28871
- +91 93474 98256

For actual WhatsApp delivery on Render, set your Twilio environment variables:
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
OWNER_WHATSAPP_TO (optional; defaults to the two MSC numbers above)

MEDIA
-----
Admin image/video uploads are stored in /uploads on the server.
Maximum individual upload: 25 MB.
Supported images: JPG, JPEG, PNG, WEBP.
Supported videos: MP4, WEBM, MOV.

DEPLOYMENT
----------
Node.js 18+ is supported.
Start command:
npm start

The server creates /data/site.json automatically on first run.
Do not delete the data folder if you want to keep the CMS content and admin account.

SECURITY NOTE
-------------
The admin password is stored as a scrypt hash with a random salt. The private admin session uses an HttpOnly cookie. Media upload/delete and CMS writes require an authenticated admin session.


CLIENT ENQUIRY INBOX
---------------------
All consultation form and estimate quotation submissions are now saved to data/site.json and are visible only after admin login under Client Enquiries. The admin panel shows name, phone/WhatsApp, email, city, property, BHK, area, scope, finish, start timing, estimate, message, photo count/names, source and received date. Leads can be refreshed or deleted from the admin panel.

LIGHT LUXURY ADMIN
------------------
The admin interface uses a light luxury palette with warm ivory, champagne-gold accents and refined cards.


AUTOMATIC OFFICE EMAIL
Client enquiries are saved in Admin > Client Enquiries and emailed automatically when SMTP is configured. Set MAIL_TO=mscinterior1@gmail.com. For Gmail, use a Google App Password in SMTP_PASS, not the normal Gmail password.


AI CHAT ASSISTANT
Set OPENAI_API_KEY on the server to enable the visible 'Ask MSC AI' assistant. Optional: set OPENAI_MODEL (default: gpt-5.6-luna).


AI TROUBLESHOOTING
------------------
If the public chat shows “MSC AI is not connected yet”, the server does not have OPENAI_API_KEY.
Set OPENAI_API_KEY in the deployment environment (for Render: Dashboard > Service > Environment).
Optional: set OPENAI_MODEL=gpt-5.6-luna. Then redeploy/restart the Node service.
The browser chat calls POST /api/ai-chat, so the website must be deployed with the Node server.js backend; a static-only host will not run this endpoint.
For diagnostics, open /api/ai-health on the deployed domain. It reports whether the server sees an API key and which model it is configured to use; it never exposes the key.

AI KEY CONFIGURATION
--------------------
This distribution does NOT include a .env file or an OpenAI secret. Set OPENAI_API_KEY only in your hosting provider's server environment (for Render: Dashboard > Service > Environment). Never put the key in frontend JavaScript or commit it to a repository. If an API key has been shared publicly, rotate/revoke it and replace OPENAI_API_KEY.


AI troubleshooting (fixed build):
- Open /api/ai-health on the deployed domain. The endpoint now validates the configured OpenAI key against the OpenAI API and reports keyValid without exposing the secret.
- If keyValid is false, update OPENAI_API_KEY in the hosting service environment and perform a fresh deploy/restart. Editing only a local .env file will not change an already deployed server.
- The chat now converts OpenAI 401/403 errors into safe, visitor-friendly messages instead of displaying the raw API error.
- The server accepts accidental surrounding quotes or a leading 'Bearer ' prefix in OPENAI_API_KEY and normalizes them before use.
