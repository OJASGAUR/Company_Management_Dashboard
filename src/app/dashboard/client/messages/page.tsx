import { getClientPortalData } from "@/lib/client-portal"
import { sendClientMessage } from "../actions"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input, Select } from "@/components/ui/FormField"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function ClientMessagesPage() {
  const { client, messages, contacts, user } = await getClientPortalData()
  if (!client) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card className="border-amber-200 bg-amber-50/50 p-6 text-amber-900 text-sm">
          This client account is not linked to a client company profile yet.
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-sans">
      <PageHeader
        category="Client Portal"
        title="Direct Team Communication"
        description="Communicate with your designated account manager, operations leads, and billing contacts."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Messages Stream & Form */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Conversation History</h2>
              <span className="text-xs text-slate-400 font-medium">Auto-updated</span>
            </div>

            <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => {
                const mine = message.senderId === user.id
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                        mine
                          ? "bg-cyan-600 text-white rounded-br-none"
                          : "border border-slate-200/90 bg-white text-slate-800 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`mt-1 text-[10px] text-right font-medium ${
                          mine ? "text-cyan-100" : "text-slate-400"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}

              {messages.length === 0 && (
                <EmptyState
                  icon="💬"
                  title="No Messages Exchanged Yet"
                  description="Choose a team member below and send your first message."
                />
              )}
            </div>
          </div>

          <form action={sendClientMessage} className="mt-6 border-t border-slate-100 pt-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr_auto]">
              <Select name="receiverId" required>
                <option value="">Select Recipient</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name || contact.email} ({contact.role.replace(/_/g, " ")})
                  </option>
                ))}
              </Select>
              <Input name="content" required maxLength={4000} placeholder="Type your message..." />
              <Button type="submit" variant="primary" size="md" className="bg-cyan-600 hover:bg-cyan-700">
                Send Message
              </Button>
            </div>
          </form>
        </Card>

        {/* Contacts Sidebar */}
        <Card className="p-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Your Dedicated Contacts
          </h2>
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 font-bold text-cyan-700 text-xs">
                  {contact.name?.charAt(0).toUpperCase() || "T"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {contact.name || contact.email}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {contact.designation || contact.role.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
