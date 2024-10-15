// import { useState } from "react";
// import axios from "axios";
// import "./App.css";

// const App = () => {
//   const [link, setLink] = useState("");
//   const [summary, setSummary] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchSummary = async () => {
//     setLoading(true);
//     setError(null);

//     const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

//     if (!apiKey) {
//       setError("API Key is missing.");
//       return;
//     }

//     try {
//       const articleContent = await fetchArticleContent(link);

//       const response = await axios.post(
//         "https://api.openai.com/v1/chat/completions",
//         {
//           model: "gpt-3.5-turbo", // or use "gpt-4"
//           messages: [
//             {
//               role: "user",
//               content: `Summarize the following article: ${articleContent}`,
//             },
//           ],
//           max_tokens: 100,
//           temperature: 0.7,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${apiKey}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const summaryText = response.data.choices[0].message.content.trim();
//       setSummary(summaryText);
//     } catch (err) {
//       if (err.response && err.response.status === 429) {
//         setError("Rate limit exceeded. Please try again later.");
//       } else {
//         console.error("Error fetching summary:", err);
//         setError("Failed to fetch summary. Please try again!");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchArticleContent = async (link) => {
//     return "This is the article content from the provided link.";
//   };

//   return (
//     <div className="p-4 bg-gray-100 min-h-screen">
//       <h1 className="text-xl font-bold mb-4">AI Summarizer</h1>

//       <input
//         type="text"
//         value={link}
//         onChange={(e) => setLink(e.target.value)}
//         placeholder="Enter article link"
//         className="border p-2 w-full mb-4"
//       />

//       <button
//         onClick={fetchSummary}
//         className="bg-blue-500 text-white p-2 rounded"
//         disabled={loading}
//       >
//         {loading ? "Summarizing..." : "Summarize"}
//       </button>

//       {error && <p className="text-red-500 mt-4">{error}</p>}

//       {summary && (
//         <div className="mt-4">
//           <h2 className="font-bold">Summary</h2>
//           <p>{summary}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;

import { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [link, setLink] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      setError("API Key is missing.");
      setLoading(false);
      return;
    }

    const maxRetries = 5;
    let retryCount = 0;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (retryCount < maxRetries) {
      try {
        const articleContent = await fetchArticleContent(link);

        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo", // or "gpt-4"
            messages: [
              {
                role: "user",
                content: `Summarize the following article: ${articleContent}`,
              },
            ],
            max_tokens: 100,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        const summaryText = response.data.choices[0].message.content.trim();
        setSummary(summaryText);
        break; // Exit loop if successful
      } catch (err) {
        if (err.response && err.response.status === 429) {
          retryCount++;
          const waitTime = Math.pow(2, retryCount) * 5000; // Exponential backoff with 5-second base
          console.warn(
            `Rate limit exceeded. Retrying in ${waitTime / 1000} seconds...`
          );
          await delay(waitTime);
        } else {
          setError("Failed to fetch summary. Please try again!");
          console.error("Error fetching summary:", err);
          break; // Exit loop on other errors
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchArticleContent = async (link) => {
    // Mock function to fetch article content. Replace with actual implementation.
    return "This is the article content from the provided link.";
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold mb-4">AI Summarizer</h1>

      <input
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Enter article link"
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={fetchSummary}
        className="bg-blue-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {summary && (
        <div className="mt-4">
          <h2 className="font-bold">Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default App;
