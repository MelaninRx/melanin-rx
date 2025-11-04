declare namespace NodeJS {
  interface ProcessEnv {
    LANGFLOW_URL: string;       // required
    LANGFLOW_API_KEY: string;   // required
  }
}