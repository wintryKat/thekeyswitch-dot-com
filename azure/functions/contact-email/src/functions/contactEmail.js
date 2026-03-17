const { app } = require("@azure/functions");
const { EmailClient } = require("@azure/communication-email");

app.http("contactEmail", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    const origin = request.headers.get("origin") || "";
    const allowed = (process.env.ALLOWED_ORIGINS || "").split(",");
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return { status: 204, headers: corsHeaders };
    }

    // Parse and validate body
    let body;
    try {
      body = await request.json();
    } catch {
      return {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        jsonBody: { error: "Invalid JSON body" },
      };
    }

    const { name, email, message } = body;

    if (!name || !email || !message) {
      return {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        jsonBody: { error: "Missing required fields: name, email, message" },
      };
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        jsonBody: { error: "Invalid email format" },
      };
    }

    // Honeypot check — if the caller sends a "website" field with content, it's a bot
    if (body.website) {
      context.log("Honeypot triggered, silently discarding");
      return {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        jsonBody: { success: true },
      };
    }

    // Send email via Azure Communication Services
    try {
      const connectionString = process.env.ACS_CONNECTION_STRING;
      const senderAddress = process.env.SENDER_ADDRESS;
      const recipientAddress = process.env.RECIPIENT_ADDRESS;

      if (!connectionString || !senderAddress || !recipientAddress) {
        context.error("Missing ACS configuration");
        return {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          jsonBody: { error: "Email service not configured" },
        };
      }

      const emailClient = new EmailClient(connectionString);

      const emailMessage = {
        senderAddress,
        content: {
          subject: `[thekeyswitch.com] Contact from ${name}`,
          plainText: [
            `Name: ${name}`,
            `Email: ${email}`,
            ``,
            `Message:`,
            message,
            ``,
            `---`,
            `Sent from thekeyswitch.com contact form`,
          ].join("\n"),
          html: `
            <h2>Contact Form Submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
            <hr>
            <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
            <hr>
            <p style="color: #999; font-size: 12px;">Sent from thekeyswitch.com contact form</p>
          `,
        },
        recipients: {
          to: [{ address: recipientAddress }],
        },
        replyTo: [{ address: email, displayName: name }],
      };

      const poller = await emailClient.beginSend(emailMessage);
      const result = await poller.pollUntilDone();

      context.log(`Email sent: ${result.id}, status: ${result.status}`);

      return {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        jsonBody: { success: true },
      };
    } catch (err) {
      context.error("Failed to send email:", err.message);
      return {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        jsonBody: { error: "Failed to send email" },
      };
    }
  },
});

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
