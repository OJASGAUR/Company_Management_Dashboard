import nodemailer from "nodemailer"

const smtpHost = process.env.SMTP_HOST
const smtpPort = Number.parseInt(process.env.SMTP_PORT || "587", 10)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || '"Company Portal" <notifications@company.com>'
const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000"

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function sendNotificationEmail({
  toEmail,
  recipientName,
  title,
  message,
  type = "INFO",
  link,
}: {
  toEmail: string
  recipientName?: string | null
  title: string
  message: string
  type?: string
  link?: string | null
}) {
  const fullLink = link
    ? (link.startsWith("http") ? link : `${appUrl}${link}`)
    : `${appUrl}/dashboard/notifications`

  const typeIcons: Record<string, string> = {
    TASK: "📝",
    LEAVE: "🏖️",
    SUCCESS: "✅",
    ALERT: "⚠️",
    WARNING: "⚠️",
    INFO: "ℹ️",
  }

  const icon = typeIcons[type] || typeIcons.INFO
  const safeName = escapeHtml(recipientName || "Team Member")
  const safeTitle = escapeHtml(title)
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />")
  const safeType = escapeHtml(type.replace(/_/g, " "))
  const safeLink = escapeHtml(fullLink)

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${safeTitle}</title></head>
<body style="margin:0;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f8fafc;color:#1e293b">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="100%" style="max-width:600px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
      <tr><td style="background:#0f172a;padding:24px 28px;color:#fff;font-size:20px;font-weight:800">Company Portal</td></tr>
      <tr><td style="padding:28px">
        <p style="margin:0 0 18px;color:#64748b">Hello ${safeName},</p>
        <div style="font-size:12px;font-weight:700;color:#1d4ed8;text-transform:uppercase;margin-bottom:8px">${icon} ${safeType}</div>
        <h1 style="font-size:24px;line-height:1.3;margin:0 0 16px;color:#0f172a">${safeTitle}</h1>
        <div style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px;padding:16px 18px;line-height:1.6;color:#334155">${safeMessage}</div>
        <div style="text-align:center;margin-top:28px"><a href="${safeLink}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px">View Notification</a></div>
      </td></tr>
      <tr><td style="background:#f1f5f9;padding:18px 28px;text-align:center;color:#64748b;font-size:12px">Automated notification from the Company Management Portal.</td></tr>
    </table>
  </td></tr></table>
</body></html>`

  if (!transporter) {
    console.log(`[EMAIL SIMULATION] To: ${toEmail} | Subject: [Company Portal] ${title}`)
    return { success: true, simulated: true }
  }

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: toEmail,
      subject: `[Company Portal] ${title}`,
      text: `Hello ${recipientName || "Team Member"},\n\n${title}\n\n${message}\n\nView details: ${fullLink}`,
      html,
    })
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("[EMAIL ERROR]", error)
    return { success: false }
  }
}
