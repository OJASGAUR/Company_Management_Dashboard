"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { addGroupMember, createMessageGroup, sendDirectMessage, sendGroupMessage } from "./actions"
import { Badge } from "@/components/ui/Badge"

interface User { id: string; name: string | null; role: string }
interface Message { id: string; senderId: string; receiverId: string | null; groupId: string | null; content: string; attachmentUrl: string | null; attachmentName: string | null; timestamp: Date }
interface Group { id: string; name: string; members: { user: User }[] }

export default function ChatClient({ currentUser, otherUsers, initialMessages, groups }: { currentUser: User; otherUsers: User[]; initialMessages: Message[]; groups: Group[] }) {
  const router = useRouter()
  const [mode, setMode] = useState<"direct" | "group">("direct")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(otherUsers[0]?.id ?? null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups[0]?.id ?? null)
  const [inputText, setInputText] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [attachmentName, setAttachmentName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [memberToAdd, setMemberToAdd] = useState(otherUsers[0]?.id ?? "")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { const timer = window.setInterval(() => router.refresh(), 4000); return () => window.clearInterval(timer) }, [router])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [selectedUserId, selectedGroupId, initialMessages.length])

  const filteredUsers = useMemo(() => otherUsers.filter((u) => (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase())), [otherUsers, searchQuery])
  const selectedUser = otherUsers.find((u) => u.id === selectedUserId)
  const selectedGroup = groups.find((g) => g.id === selectedGroupId)
  const currentMessages = mode === "direct"
    ? initialMessages.filter((m) => !m.groupId && ((m.senderId === currentUser.id && m.receiverId === selectedUserId) || (m.senderId === selectedUserId && m.receiverId === currentUser.id)))
    : initialMessages.filter((m) => m.groupId === selectedGroupId)

  const submitMessage = async () => {
    if (!inputText.trim() || isSending) return
    setIsSending(true)
    try {
      const formData = new FormData()
      formData.set("content", inputText.trim())
      if (mode === "direct") {
        if (!selectedUserId) return
        formData.set("receiverId", selectedUserId)
        if (attachmentUrl.trim()) formData.set("attachmentUrl", attachmentUrl.trim())
        if (attachmentName.trim()) formData.set("attachmentName", attachmentName.trim())
        await sendDirectMessage(formData)
      } else {
        if (!selectedGroupId) return
        formData.set("groupId", selectedGroupId)
        await sendGroupMessage(formData)
      }
      setInputText(""); setAttachmentUrl(""); setAttachmentName(""); router.refresh()
    } finally { setIsSending(false) }
  }

  return <>
    <div className="flex w-full md:w-80 flex-col border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 shrink-0">
      <div className="border-b border-slate-200 p-4 bg-white space-y-3">
        <div className="flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setMode("direct")} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${mode === "direct" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Direct</button><button type="button" onClick={() => setMode("group")} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${mode === "group" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Groups</button></div>
        {mode === "direct" ? <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search colleagues..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white" /> : <form action={async () => { if (!groupName.trim() || isCreatingGroup) return; setIsCreatingGroup(true); try { const fd = new FormData(); fd.set("name", groupName.trim()); await createMessageGroup(fd); setGroupName(""); router.refresh() } finally { setIsCreatingGroup(false) } }} className="flex gap-2"><input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Designers" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-500" /><button type="submit" disabled={!groupName.trim() || isCreatingGroup} className="rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white disabled:opacity-50">+</button></form>}
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {mode === "direct" ? filteredUsers.map((user) => <button key={user.id} type="button" onClick={() => setSelectedUserId(user.id)} className={`flex w-full items-center gap-3 p-3.5 text-left ${selectedUserId === user.id ? "bg-indigo-50/80 border-l-4 border-indigo-600" : "hover:bg-slate-100/70 border-l-4 border-transparent"}`}><div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm ${selectedUserId === user.id ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}>{user.name?.charAt(0).toUpperCase() || "U"}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-900">{user.name || "Colleague"}</p><p className="truncate text-[11px] text-slate-500">{user.role.replace(/_/g, " ")}</p></div></button>) : <>{groups.map((group) => <button key={group.id} type="button" onClick={() => setSelectedGroupId(group.id)} className={`flex w-full items-center gap-3 p-3.5 text-left ${selectedGroupId === group.id ? "bg-indigo-50/80 border-l-4 border-indigo-600" : "hover:bg-slate-100/70 border-l-4 border-transparent"}`}><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">#</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-900">{group.name}</p><p className="truncate text-[11px] text-slate-500">{group.members.length} members</p></div></button>)}{groups.length === 0 && <div className="p-6 text-center text-xs text-slate-400">Create your first team group above.</div>}</>}
      </div>
    </div>

    <div className="flex min-w-0 flex-1 flex-col bg-white">
      {(mode === "direct" && selectedUser) || (mode === "group" && selectedGroup) ? <>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">{mode === "direct" ? selectedUser?.name?.charAt(0).toUpperCase() || "U" : "#"}</div><div><h3 className="text-sm font-bold text-slate-900">{mode === "direct" ? selectedUser?.name || "Colleague" : selectedGroup?.name}</h3><p className="mt-0.5 text-[11px] text-slate-500">{mode === "direct" ? selectedUser?.role.replace(/_/g, " ") : `${selectedGroup?.members.length} members`}</p></div></div><Badge variant="default" size="sm">{mode === "direct" ? "Direct Message" : "Team Group"}</Badge></div>
        {mode === "group" && selectedGroup && <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-6 py-2"><select value={memberToAdd} onChange={(e) => setMemberToAdd(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"><option value="">Add member…</option>{otherUsers.filter((u) => !selectedGroup.members.some((m) => m.user.id === u.id)).map((u) => <option key={u.id} value={u.id}>{u.name || u.email || "User"}</option>)}</select><button type="button" disabled={!memberToAdd} onClick={async () => { const fd = new FormData(); fd.set("groupId", selectedGroup.id); fd.set("userId", memberToAdd); await addGroupMember(fd); setMemberToAdd(""); router.refresh() }} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">Add</button></div>}
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-6">{currentMessages.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center text-slate-400"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-xl">💬</div><p className="font-bold text-slate-700 text-sm">Start a Conversation</p></div> : currentMessages.map((message) => { const isMe = message.senderId === currentUser.id; return <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-none"}`}><p className="whitespace-pre-wrap">{message.content}</p>{message.attachmentUrl && <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className={`mt-2 block rounded-lg px-3 py-2 text-xs font-bold ${isMe ? "bg-indigo-500 text-white" : "bg-indigo-50 text-indigo-700"}`}>📎 {message.attachmentName || "Open attachment"}</a>}<p className={`mt-1 text-[10px] text-right font-medium ${isMe ? "text-indigo-200" : "text-slate-400"}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div></div> })}<div ref={messagesEndRef} /></div>
        <div className="border-t border-slate-200 p-4 bg-white space-y-2"><div className="flex gap-2"><input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submitMessage() } }} placeholder={mode === "direct" ? `Write to ${selectedUser?.name || "colleague"}...` : `Message #${selectedGroup?.name}...`} maxLength={4000} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" /><button type="button" disabled={!inputText.trim() || isSending} onClick={() => void submitMessage()} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">Send</button></div>{mode === "direct" && <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><input value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} placeholder="Attachment name (optional)" className="rounded-lg border border-slate-200 px-3 py-2 text-[11px]" /><input value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} placeholder="Secure file URL (optional)" className="rounded-lg border border-slate-200 px-3 py-2 text-[11px]" /></div>}</div>
      </> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl">💬</div><h3 className="font-bold text-slate-700 text-base">Select a conversation</h3></div>}
    </div>
  </>
}
