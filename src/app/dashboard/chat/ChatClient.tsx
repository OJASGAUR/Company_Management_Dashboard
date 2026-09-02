"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { sendDirectMessage } from "./actions"
import { Badge } from "@/components/ui/Badge"

interface User {
  id: string
  name: string | null
  role: string
}

interface Message {
  id: string
  senderId: string
  receiverId: string | null
  content: string
  timestamp: Date
}

export default function ChatClient({
  currentUser,
  otherUsers,
  initialMessages,
}: {
  currentUser: User
  otherUsers: User[]
  initialMessages: Message[]
}) {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(otherUsers[0]?.id ?? null)
  const [inputText, setInputText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 4000)
    return () => window.clearInterval(timer)
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedUserId, initialMessages.length])

  const filteredUsers = otherUsers.filter((u) =>
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedUser = otherUsers.find((user) => user.id === selectedUserId)
  const currentConversation = initialMessages.filter(
    (message) =>
      (message.senderId === currentUser.id && message.receiverId === selectedUserId) ||
      (message.senderId === selectedUserId && message.receiverId === currentUser.id)
  )

  return (
    <>
      {/* Left Sidebar: Contact Directory */}
      <div className="flex w-full md:w-80 flex-col border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 shrink-0">
        <div className="border-b border-slate-200 p-4 bg-white">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleagues..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredUsers.map((user) => {
            const isSelected = selectedUserId === user.id
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className={`flex w-full items-center gap-3 p-3.5 text-left transition-all ${
                  isSelected
                    ? "bg-indigo-50/80 border-l-4 border-indigo-600"
                    : "hover:bg-slate-100/70 border-l-4 border-transparent"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-sm ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{user.name || "Colleague"}</p>
                  <p className="truncate text-[11px] text-slate-500">{user.role.replace(/_/g, " ")}</p>
                </div>
              </button>
            )
          })}
          {filteredUsers.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">No matching colleagues found.</div>
          )}
        </div>
      </div>

      {/* Right Pane: Conversation Area */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700 shadow-sm">
                  {selectedUser.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedUser.name || "Colleague"}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[11px] text-slate-500">{selectedUser.role.replace(/_/g, " ")}</p>
                  </div>
                </div>
              </div>
              <Badge variant="default" size="sm">
                Direct Message
              </Badge>
            </div>

            {/* Message Stream */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-6">
              {currentConversation.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-xl mb-3">
                    💬
                  </div>
                  <p className="font-bold text-slate-700 text-sm">Start a Conversation</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Send a message to {selectedUser.name || "your colleague"} below.
                  </p>
                </div>
              ) : (
                currentConversation.map((message) => {
                  const isMe = message.senderId === currentUser.id
                  return (
                    <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`mt-1 text-[10px] text-right font-medium ${
                            isMe ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="border-t border-slate-200 p-4 bg-white">
              <form
                action={async (formData) => {
                  if (!inputText.trim() || !selectedUserId || isSending) return
                  setIsSending(true)
                  try {
                    formData.set("receiverId", selectedUserId)
                    formData.set("content", inputText.trim())
                    await sendDirectMessage(formData)
                    setInputText("")
                    router.refresh()
                  } finally {
                    setIsSending(false)
                  }
                }}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="receiverId" value={selectedUserId ?? ""} readOnly />
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write a message to ${selectedUser.name || "colleague"}...`}
                  maxLength={4000}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl mb-3">
              💬
            </div>
            <h3 className="font-bold text-slate-700 text-base">Select a Colleague</h3>
            <p className="mt-1 text-xs text-slate-500">
              Pick a contact from the left list to begin messaging.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
