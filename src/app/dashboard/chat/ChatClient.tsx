"use client"

import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"

export default function ChatClient({ currentUser, otherUsers }: { currentUser: any, otherUsers: any[] }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Connect to custom Socket.io server running on port 3001
    const newSocket = io("http://localhost:3001")
    setSocket(newSocket)

    newSocket.on("connect", () => {
      newSocket.emit("register", currentUser.id)
    })

    newSocket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data])
    })

    return () => {
      newSocket.close()
    }
  }, [currentUser.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, selectedUserId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedUserId || !socket) return

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedUserId,
      content: inputText,
      timestamp: new Date().toISOString()
    }

    socket.emit("send_message", messageData)
    setInputText("")
  }

  // Filter messages for current conversation
  const currentConversation = messages.filter(
    (m) => (m.senderId === currentUser.id && m.receiverId === selectedUserId) ||
           (m.senderId === selectedUserId && m.receiverId === currentUser.id)
  )

  const selectedUser = otherUsers.find(u => u.id === selectedUserId)

  return (
    <>
      {/* Sidebar - User List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Direct Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {otherUsers.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                selectedUserId === user.id ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-100 border-l-4 border-transparent"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.role.replace(/_/g, " ")}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUserId ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {selectedUser?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedUser?.name}</h3>
                <p className="text-xs text-gray-500">{selectedUser?.role.replace(/_/g, " ")}</p>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
              {currentConversation.length === 0 && (
                <div className="text-center text-gray-500 my-10">
                  <p>No messages yet. Send a message to start the conversation!</p>
                </div>
              )}
              {currentConversation.map((msg, idx) => {
                const isMe = msg.senderId === currentUser.id
                return (
                  <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm"
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-blue-600 text-white rounded-full p-2 px-6 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium text-gray-600">Your Messages</h3>
              <p>Select a coworker to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
