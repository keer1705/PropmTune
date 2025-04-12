import { useState, useEffect } from "react";

export default function OpenRouterMiniGPT() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Tech Mini-GPT powered by OpenRouter API. Ask me any tech questions!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null); // prompt-ui response
  const [idleTimer, setIdleTimer] = useState(null); // Timer to track idle time

  // Step 1: Fetch prompt rewrites
  const fetchRewriteSuggestions = async (prompt) => {
    try {
      const res = await fetch("http://localhost:8000/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.error) {
        alert("Error: " + data.error);
        return;
      }

      setSuggestions(data);
    } catch (error) {
      alert("Error connecting to /rewrite");
    }
  };

  // Step 2: Send selected rewritten prompt to GPT
  const sendToGPT = async (finalPrompt) => {
    const newMessages = [
      ...messages,
      { role: 'user', content: finalPrompt }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const assistantResponse = data.response;
      setMessages([...newMessages, {
        role: 'assistant',
        content: assistantResponse
      }]);
      setSuggestions(null); // clear prompt suggestions
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "❌ Failed to fetch response from GPT."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: When user presses Enter the first time
  const handleInitialSubmit = () => {
    if (input.trim() === '') return;
    fetchRewriteSuggestions(input);
    setInput('');
  };

  // Step 4: Choose a rewritten prompt
  const handleSuggestionClick = (text) => {
    setInput(''); // Clear the input field
    setMessages([...messages, { role: 'user', content: text }]); // Add the selected suggestion to the messages
    sendToGPT(text); // Send to /chat
    setSuggestions(null); // Clear the suggestions
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (!suggestions) {
        handleInitialSubmit();
      } else {
        // If user presses enter again with a selected rewrite
        sendToGPT(input.trim());
        setInput('');
      }
    }

    // Reset idle timer on key press
    resetIdleTimer();
  };

  // Reset idle timer when the user types
  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    setIdleTimer(setTimeout(() => {
      if (input.trim()) {
        fetchRewriteSuggestions(input);
      }
    }, 3000)); // 3 seconds of idle time
  };

  // Clear the chat
  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm Tech Mini-GPT powered by OpenRouter API. Ask me any tech questions!"
      }
    ]);
    setInput('');
    setSuggestions(null); // Reset suggestions
  };

  useEffect(() => {
    // Clear idle timer when component is unmounted or when input changes
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [idleTimer]);

  return (
   // Tech Mini-GPT UI Component with Full-Screen Dark Theme
// This assumes you're using the same React component structure as before

<div className="fixed inset-0 flex flex-col w-screen h-screen bg-gray-900 text-gray-200 overflow-hidden">
  {/* Header - full width */}
  <div className="bg-gray-950 p-3 text-white flex items-center justify-between w-full shadow-md">
    <div className="flex items-center">
      <div className="mr-2">💻</div>
      <h1 className="text-xl font-bold">PrompTune</h1>
      <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">OpenRouter</span>
    </div>
    <button 
      onClick={clearChat}
      className="p-2 rounded-full hover:bg-gray-800 transition"
      title="Clear chat"
    >
      🔄
    </button>
  </div>

  {/* Chat Area - Takes all available space */}
  <div className="flex-1 overflow-auto p-4 bg-gray-900 space-y-4 w-full">
    {messages.map((message, index) => (
      <div 
        key={index} 
        className={`p-3 rounded-lg ${
          message.role === 'user' 
            ? 'bg-blue-600 text-white ml-auto max-w-md' 
            : 'bg-gray-800 text-gray-100 max-w-lg'
        }`}
      >
        {message.content}
      </div>
    ))}

    {/* Suggestions UI */}
    {suggestions && (
      <div className="space-y-2 w-full">
        <p className="text-sm text-gray-300">🎯 Prompt Score: <strong>{suggestions.score} / 10</strong></p>
        <p className="text-xs text-gray-400 mb-2">📝 Reason: {suggestions.reason}</p>

        <div className="space-y-2 w-full">
          <button
            onClick={() => handleSuggestionClick(suggestions.specific)}
            className="w-full text-left p-3 bg-gray-800 border-l-4 border-purple-500 rounded hover:bg-gray-700"
          >
            🔍 Specific: {suggestions.specific}
          </button>
          <button
            onClick={() => handleSuggestionClick(suggestions.creative)}
            className="w-full text-left p-3 bg-gray-800 border-l-4 border-pink-500 rounded hover:bg-gray-700"
          >
            🎨 Creative: {suggestions.creative}
          </button>
          <button
            onClick={() => handleSuggestionClick(suggestions.formal)}
            className="w-full text-left p-3 bg-gray-800 border-l-4 border-gray-500 rounded hover:bg-gray-700"
          >
            🧑‍💼 Formal: {suggestions.formal}
          </button>
        </div>

        <p className="text-xs text-yellow-500 mt-2">💡 Tip: {suggestions.tip}</p>
      </div>
    )}

    {/* Loading */}
    {isLoading && (
      <div className="bg-gray-800 text-gray-200 p-3 rounded-lg max-w-md w-full">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    )}
  </div>

  {/* Input Area - full width */}
  <div className="p-3 border-t border-gray-800 bg-gray-950 w-full">
    <div className="flex items-center w-full">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        className="flex-1 border border-gray-700 bg-gray-800 text-gray-100 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder={suggestions ? "Edit or press Enter to send..." : "Type your prompt..."}
        rows={1}
      />
      <button
        onClick={() => {
          if (!suggestions) handleInitialSubmit();
          else sendToGPT(input.trim());
        }}
        disabled={isLoading || input.trim() === ''}
        className={`p-2 bg-blue-600 rounded-r-lg text-white ${
          isLoading || input.trim() === '' 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-blue-700'
        }`}
      >
        📤
      </button>
    </div>
  </div>
</div>
  );
}