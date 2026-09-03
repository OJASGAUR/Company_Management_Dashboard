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

export async function sendOnboardingCredentialsEmail({
  toEmail,
  recipientName,
  employeeId,
  setupLink,
}: {
  toEmail: string
  recipientName: string
  employeeId: string
  setupLink: string
}) {
  const safeName = escapeHtml(recipientName)
  const safeEmail = escapeHtml(toEmail)
  const safeEmployeeId = escapeHtml(employeeId)
  const safeSetupLink = escapeHtml(setupLink)

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your Company Portal account</title></head>
<body style="margin:0;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f8fafc;color:#1e293b">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="100%" style="max-width:620px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
      <tr><td style="background:#0f172a;padding:24px 28px;color:#fff;font-size:20px;font-weight:800">Company Portal</td></tr>
      <tr><td style="padding:30px">
        <p style="margin:0 0 16px;color:#64748b">Hello ${safeName},</p>
        <h1 style="font-size:24px;line-height:1.3;margin:0 0 12px;color:#0f172a">Your account is ready</h1>
        <p style="margin:0 0 24px;line-height:1.6;color:#475569">Your company portal account has been created. Your Employee ID and login email are below. Set your password using the secure one-time link.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
          <tr><td style="padding:14px 16px;background:#f8fafc;color:#64748b;font-size:13px;font-weight:700">LOGIN EMAIL</td><td style="padding:14px 16px;font-size:14px;color:#0f172a">${safeEmail}</td></tr>
          <tr><td style="padding:14px 16px;background:#f8fafc;color:#64748b;font-size:13px;font-weight:700">EMPLOYEE ID</td><td style="padding:14px 16px;font-size:14px;color:#0f172a">${safeEmployeeId}</td></tr>
        </table>
        <p style="margin:20px 0 0;color:#475569;font-size:13px;line-height:1.6">The setup link expires automatically and can be used once. Choose a password you control when you open it.</p>
        <div style="text-align:center;margin-top:28px"><a href="${safeSetupLink}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px">Set My Password</a></div>
      </td></tr>
      <tr><td style="background:#f1f5f9;padding:18px 28px;text-align:center;color:#64748b;font-size:12px">Automated account email from the Company Management Portal.</td></tr>
    </table>
  </td></tr></table>
</body></html>`

  const text = `Hello ${recipientName},\n\nYour Company Portal account is ready.\n\nLogin email: ${toEmail}\nEmployee ID: ${employeeId}\n\nSet your password using this one-time link:\n${setupLink}\n\nThe link expires automatically and can only be used once.`

  if (!transporter) {
    console.log(`[EMAIL SIMULATION] To: ${toEmail} | Subject: Your Company Portal account | Employee ID: ${employeeId} | Setup link: ${setupLink}`)
    return { success: true, simulated: true }
  }

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: toEmail,
      subject: "Your Company Portal account is ready",
      text,
      html,
    })
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("[ONBOARDING EMAIL ERROR]", error)
    return { success: false }
  }
}
