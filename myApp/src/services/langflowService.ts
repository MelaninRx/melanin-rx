export async function queryLangFlow(message: string): Promise<string> {
  const response = await fetch(import.meta.env.VITE_LANGFLOW_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_LANGFLOW_API_KEY}`,
      "x-api-key": import.meta.env.VITE_LANGFLOW_API_KEY,
    },
    body: JSON.stringify({
      input_value: message,
      output_type: "chat",
      input_type: "chat",
    }),
  });

  const data = await response.json();
  return data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text || "No response from LangFlow.";
}