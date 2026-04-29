"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Paperclip, RotateCcw, BookOpen, FileText, Zap } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";

const suggestions = [
  "Quy trình đại tu radar P-18 gồm những bước nào?",
  "Quy trình nộp hồ sơ nghiệm thu khí tài sau sửa chữa?",
  "Danh sách văn bản chỉ đạo tháng 3/2026",
  "Tiêu chuẩn kỹ thuật đầu ra cho radar 36D6 sau đại tu?",
];

const demoMessages = [
  { role: "assistant", text: "Xin chào! Tôi là Trợ lý AI của Nhà máy Z119. Tôi có thể giúp bạn tra cứu tài liệu kỹ thuật, quy trình nội bộ và các tiêu chuẩn sửa chữa khí tài. Bạn cần hỗ trợ gì?" },
  { role: "user", text: "Quy trình đại tu radar P-18 gồm những bước nào?" },
  { role: "assistant", text: "Quy trình đại tu radar P-18 gồm các bước chính:\n• Tiếp nhận và kiểm tra ban đầu (đánh giá tình trạng kỹ thuật)\n• Tháo rời, kiểm tra từng khối chức năng\n• Sửa chữa, thay thế linh kiện hư hỏng\n• Lắp ráp, hiệu chỉnh và kiểm tra tổng thể\n• Chạy thử, nghiệm thu theo tiêu chuẩn kỹ thuật\n\nBạn có muốn tôi tìm tài liệu đầy đủ trong thư viện kỹ thuật không?" },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState(demoMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setMessages((m) => [...m, { role: "assistant", text: "Đây là phiên bản demo — hệ thống Chatbot AI đang được tích hợp. Câu hỏi của bạn đã được ghi nhận: \"" + text + "\"" }]);
    setLoading(false);
  };

  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Hệ thống tích hợp", href: "/he-thong" }, { label: "Chatbot — Trợ lý AI" }]} />

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Chat area */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-[#1B3A5C]">
            <div className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Trợ lý AI — Z119</p>
              <p className="text-white/50 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Đang hoạt động</p>
            </div>
            <button onClick={() => setMessages(demoMessages)} className="ml-auto text-white/50 hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-[#1B3A5C] text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-xl rounded-tl-sm flex gap-1 items-center">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                      animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="px-5 py-2 border-t border-gray-100 flex flex-wrap gap-2">
            {suggestions.slice(0, 2).map((s) => (
              <button key={s} onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#e8eef6] text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white transition-colors">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 text-sm outline-none placeholder:text-gray-300 text-gray-800" />
              <button type="submit" disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-[#1B3A5C] disabled:opacity-40 text-white flex items-center justify-center hover:bg-[#2d5a8e] transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <p className="text-xs font-bold text-[#1B3A5C] uppercase tracking-wide mb-3">Gợi ý câu hỏi</p>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="w-full text-left text-xs text-gray-600 hover:text-[#1B3A5C] py-2 px-3 rounded-lg hover:bg-[#e8eef6] transition-colors border border-gray-100">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#1B3A5C] rounded-xl p-4 text-white space-y-3">
            {[
              { icon: BookOpen, label: "Tài liệu đã tra cứu", value: "1,247" },
              { icon: FileText, label: "Văn bản liên quan", value: "89" },
              { icon: Zap, label: "Thời gian phản hồi TB", value: "0.8s" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-white/60"><Icon className="w-3.5 h-3.5" />{label}</span>
                <span className="text-sm font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
