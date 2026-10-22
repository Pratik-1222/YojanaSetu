                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Related Schemes</p>
                      {getUniqueRelatedSchemes(m.schemes).map((s) => {
                        const matchScore = s.match ?? s.baseMatch;
                        const hasMatchScore =
                          Number.isFinite(Number(matchScore)) &&
                          Number(matchScore) > 0;

                        return (
                          <Link
                            key={s.id}
                            to={`/schemes/${s.id}`}
                            className="group flex items-center justify-between rounded-2xl border border-line bg-slate-50/70 hover:bg-white p-3.5 text-left transition-all hover:border-primary/20 hover:shadow-sm outline-none"
                          >
                            <div className="pr-3 flex-1 min-w-0">
                              <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors leading-snug truncate">{s.name}</p>
                              <p className="text-[10px] font-medium text-sub mt-0.5 line-clamp-1">{s.benefit}</p>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5">
                              {hasMatchScore && (
                                <Badge tone="success" variant="tinted" dot>
                                  {matchScore}%
                                </Badge>
                              )}
                              <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </div>

                {/* User Avatar */}
                {m.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary text-white shadow-sm mt-1">
                    <User size={15} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TypingIndicator />
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion chips (shown only on first message) */}
        {messages.length === 1 && (
          <div className="shrink-0 px-4 sm:px-6 pb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info size={11} /> Quick starters
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {SUGGESTIONS.map((s, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => send(s.text)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.07 }}
                  className="flex items-center gap-2 rounded-2xl border border-line/80 bg-white hover:bg-primaryTint/20 hover:border-primary/20 text-left p-3 text-xs font-medium text-ink shadow-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primaryTint border border-primary/10 text-primary">
                    <s.icon size={13} />
                  </div>
                  <span className="line-clamp-1">{s.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="shrink-0 border-t border-line/60 bg-white px-4 sm:px-6 py-3.5">
          <div className="flex gap-2.5 rounded-2xl border border-line/80 bg-slate-50/60 p-2 focus-within:border-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-200 shadow-sm">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="e.g., I am a 25yo female entrepreneur from Maharashtra seeking business loans..."
              className="w-full bg-transparent px-2 text-sm text-ink outline-none placeholder:text-slate-400 font-medium"
              disabled={loading}
              aria-label="Ask YojanaSetu AI Assistant"
            />
            <button
              disabled={!input.trim() || loading}
              onClick={() => send(input)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary hover:bg-primaryDark text-white transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-center text-[10px] font-medium text-slate-400 mt-2">
            AI responses are for guidance only. Always verify on official portals.
          </p>
        </div>
      </div>
    </div>
  );
}
