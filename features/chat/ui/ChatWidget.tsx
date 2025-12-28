import { useState, useRef, useEffect } from "react";
import { Icons } from "@/shared/ui/icons";
import { sendMessageToGemini } from "../api/chatService";
import type { IChatMessage } from "../model/types";
import styles from "./ChatWidget.module.scss";
import cn from "classnames";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<IChatMessage[]>([
        {
            role: "model",
            text: "Hello. I am YenaAI. I am here to provide clear and structured answers about Yena Lee.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: IChatMessage = { role: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        const responseText = await sendMessageToGemini(messages, userMsg.text);

        setMessages((prev) => [...prev, { role: "model", text: responseText }]);
        setLoading(false);
    };

    return (
        <div className={styles.chatContainer}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.title}>
                            <Icons.Sparkles />
                            <span>YenaAI Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className={styles.messages} ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn(styles.message, styles[msg.role])}>
                                <div className={cn(styles.bubble, styles[msg.role])}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className={styles.loading}>
                                <div className={styles.bubble}>
                                    <div className={styles.dots}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.inputArea}>
                        <div className={styles.inputContainer}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Ask about my philosophy..."
                            />
                            <button onClick={handleSend} disabled={loading}>
                                <Icons.ArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className={styles.toggleButton}>
                {isOpen ? (
                    <span className={styles.closeIcon}>✕</span>
                ) : (
                    <>
                        <Icons.Chat className={styles.chatIcon} />
                        <span className={styles.indicator}></span>
                    </>
                )}
            </button>
        </div>
    );
}
