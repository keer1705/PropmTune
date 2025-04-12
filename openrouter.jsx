// export async function sendMsgToOpenRouter(message) {
//     try {
//       const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer YOUR-OPENROUTER-KEY`, // Replace with your actual API key
//           "Referer": "https://yourapp.com", // Optional: replace with your actual domain
//         },
//         body: JSON.stringify({
//           model: "gpt-3.5-turbo", // Model name
//           messages: [
//             { role: "system", content: "You are a helpful assistant." },
//             { role: "user", content: message },
//           ],
//         }),
//       });
  
//       if (!response.ok) {
//         throw new Error(`API returned status ${response.status}`);
//       }
  
//       const data = await response.json();
//       return data.choices?.[0]?.message?.content || "No meaningful response from the server.";
//     } catch (error) {
//       console.error("Error communicating with OpenRouter API:", error);
//       return "An error occurred while processing your request.";
//     }
//   }