async function testFreepik() {
    const key = "FPSXb337b5158620ad6d8e613cd8149d85cf"; // FREEPIK_API_KEY from .env.local
    try {
        const response = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-freepik-api-key': key,
            },
            body: JSON.stringify({
                prompt: "A beautiful sunset over the mountains",
                negative_prompt: "",
                num_images: 1,
                image: {
                    size: "square",
                },
            }),
        });
        console.log("Status:", response.status);
        if (!response.ok) {
            const data = await response.text();
            console.log("Error Data:", data);
        } else {
            const data = await response.json();
            console.log("Success Data:", data);
        }
    } catch (e) {
        console.error("Catch Error:", e);
    }
}

testFreepik();
