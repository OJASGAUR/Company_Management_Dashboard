"use client"

import { useEffect, useRef, useState } from "react"
import { sendDirectMessage } from "./actions"

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(otherUsers[0]?.id ?? null)
  const [inputText, setInputText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedUserId, initialMessages.length])

  const selectedUser = otherUsers.find((user) => user.id === selectedUserId)
  const currentConversation = initialMessages.filter(
    (message) =>
      (message.senderId === currentUser.id && message.receiverId === selectedUserId) ||
      (message.senderId === selectedUserId && message.receiverId === currentUser.id),
  )

  return (
    <>
      <div className="flex w-80 flex-col border-r border-gray-200 bg-gray-50">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Direct Messages</h2>
          <p className="mt-1 text-xs text-gray-500">Messages are saved to your company workspace.</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {otherUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedUserId(user.id)}
              className={`w-full border-l-4 p-4 text-left transition-colors ${
                selectedUserId === user.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-transparent hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{user.name || "Unnamed user"}</p>
                  <p className="truncate text-xs text-gray-500">{user.role.replace(/_/g, " ")}</p>
                </div>
              </div>
            </button>
          ))}
          {otherUsers.length === 0 && <div className="p-6 text-center text-sm text-gray-500">No active users available.</div>}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {selectedUser.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedUser.name || "Unnamed user"}</h3>
                <p className="text-xs text-gray-500">{selectedUser.role.replace(/_/g, " ")}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-6">
              {currentConversation.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  <p>No messages yet.</p>
                  <p className="mt-1 text-sm">Send a message to start the conversation.</p>
                </div>
              ) : (
                currentConversation.map((message) => {
                  const isMe = message.senderId === currentUser.id
                  return (
                    <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          isMe
                            ? "rounded-br-none bg-blue-600 text-white"
                            : "rounded-bl-none border border-gray-200 bg-white text-gray-900 shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                        <p className={`mt-1 text-[10px] text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 bg-white p-4">
              <form
                action={async (formData) => {
                  if (!inputText.trim() || !selectedUserId) return
                  formData.set("receiverId", selectedUserId)
                  formData.set("content", inputText.trim())
                  await sendDirectMessage(formData)
                  setInputText("")
                }}
                className="flex gap-2"
              >
                <input type="hidden" name="receiverId" value={selectedUserId ?? ""} readOnly />
                <input
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  placeholder={`Message ${selectedUser.name || "user"}...`}
                  maxLength={4000}
                  className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50 text-gray-400">
            <div className="text-center">
              <div className="mb-4 text-6xl">💬</div>
              <h3 className="text-xl font-medium text-gray-600">Your Messages</h3>
              <p>Select a colleague to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
