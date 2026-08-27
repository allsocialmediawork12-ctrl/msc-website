MSC MANSION SPACE CREATIVE STUDIO — LIVE CMS BUILD
====================================================

PUBLIC WEBSITE
--------------
index.html + style.css + script.js

The public website uses the light ivory / champagne MSC luxury palette.

LIVE ADMIN CMS
--------------
Open /admin.html on the deployed website.

Initial admin credentials:
- Name: MSC Admin
- Password: MSC-ADMIN-2026

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
TWILIO_WHATSAPP_FROM (approved WhatsApp sender)
OWNER_WHATSAPP_TO (optional; defaults to the two MSC numbers above)
TWILIO_CONTENT_SID (optional, recommended for approved business-initiated WhatsApp templates)
The Admin Panel now includes WhatsApp Connection Check and Send Test WhatsApp buttons.

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

LEAD INBOX — IMPORTANT
-----------------------
Every contact/estimate submission is now persisted in the server-side Customer Enquiries section in Admin Panel BEFORE WhatsApp notification is attempted. This means missing Twilio credentials or a WhatsApp delivery failure will not lose the client details.

To receive private WhatsApp alerts, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM in Render. The configured owner recipients remain +91 70933 28871 and +91 93474 98256 unless OWNER_WHATSAPP_TO is changed.


DIRECT WHATSAPP DELIVERY
- Customer submissions are saved first and then the server automatically sends the complete lead details to both OWNER_WHATSAPP_TO numbers.
- Meta WhatsApp Cloud API is preferred when WHATSAPP_CLOUD_ACCESS_TOKEN and WHATSAPP_CLOUD_PHONE_NUMBER_ID are set.
- Otherwise Twilio WhatsApp is used.
- Numbers alone cannot send WhatsApp messages; an authenticated WhatsApp API sender is required.
