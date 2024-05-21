export async function post(endpoint: string, body: any = ""): Promise<any> {
    try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error occurred while making POST request:", error);
        throw error;
    }
}
