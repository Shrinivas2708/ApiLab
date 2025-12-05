const MOCK_ENV_VARIABLES = {
    "baseUrl": "https://echo.hoppscotch.io",
    "token": "12345"
};

export function replaceVariables(text: string, variables: Record<string, string> = MOCK_ENV_VARIABLES): string {
    if (!text) return "";
    return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        return variables[key.trim()] || match;
    });
}