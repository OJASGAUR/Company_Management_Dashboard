import nodemailer from "nodemailer"

const smtpHost = process.env.SMTP_HOST
const smtpPort = parseInt(process.env.SMTP_PORT || "587")
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || '"Company Portal" <notifications@company.com>'
const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000"

let transporter: nodemailer.Transporter | null = null

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  })
}

export type EmailPayload = {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailPayload): Promise<{ success: boolean; messageId?: string }> {
  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        text: text || subject,
        html
      })
      console.log(`[EMAIL SENT] To: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } else {
      // In development / fallback mode when SMTP is not configured
      console.log("==================================================================")
      console.log(`📧 [SIMULATED EMAIL DISPATCH]`)
      console.log(`To:        ${to}`)
      console.log(`From:      ${smtpFrom}`)
      console.log(`Subject:   ${subject}`)
      console.log(`Body:      ${text || subject}`)
      console.log("==================================================================")
      return { success: true, messageId: `mock-${Date.now()}` }
    }
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error)
    return { success: false }
  }
}

export async function sendNotificationEmail({
  toEmail,
  recipientName,
  title,
  message,
  type = "INFO",
  link
}: {
  toEmail: string
  recipientName?: string
  title: string
  message: string
  type?: string
  link?: string
}) {
  const fullLink = link ? (link.startsWith("http") ? link : `${appUrl}${link}`) : `${appUrl}/dashboard/notifications`
  
  const typeIcons: Record<string, string> = {
    TASK: "📝",
    LEAVE: "🏖️",
    SUCCESS: "✅",
    ALERT: "⚠️",
    WARNING: "⚠️",
    INFO: "ℹ️"
  }

  const typeColors: Record<string, { bg: string; text: string; border: string }> = {
    TASK: { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
    LEAVE: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
    SUCCESS: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
    ALERT: { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" },
    WARNING: { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" },
    INFO: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" }
  }

  const currentTheme = typeColors[type] || typeColors.INFO
  const icon = typeIcons[type] || "ℹ️"

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #0f172a; padding: 24px 32px; text-align: left;">
                    <span style="font-size: 20px; font-weight: 800; color: #60a5fa; letter-spacing: -0.5px;">Company Portal</span>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px;">
                    <p style="font-size: 15px; color: #64748b; margin-top: 0;">
                      Hello ${recipientName || "Team Member"},
                    </p>

                    <!-- Notification Badge & Title -->
                    <div style="margin: 20px 0 12px 0;">
                      <span style="display: inline-block; background-color: ${currentTheme.bg}; color: ${currentTheme.text}; border: 1px solid ${currentTheme.border}; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px;">
                        ${icon} ${type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; line-height: 1.3;">
                      ${title}
                    </h2>

                    <!-- Message Card -->
                    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 18px 20px; margin: 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                      ${message}
                    </div>

                    <!-- Call To Action Button -->
                    <div style="margin: 32px 0 20px 0; text-align: center;">
                      <a href="${fullLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                        View Notification on Portal &rarr;
                      </a>
                    </div>

                    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px;">
                      Direct Link: <a href="${fullLink}" style="color: #2563eb; text-decoration: underline;">${fullLink}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                    <p style="margin: 0 0 6px 0;">This is an automated notification from your Company Management Portal.</p>
                    <p style="margin: 0; color: #94a3b8;">&copy; ${new Date().getFullYear()} Company Management System. All rights reserved.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return sendEmail({
    to: toEmail,
    subject: `[Company Portal] ${title}`,
    text: `Hello ${recipientName || "Team Member"},\n\n${title}\n\n${message}\n\nView details: ${fullLink}`,
    html
  })
}
