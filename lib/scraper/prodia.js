const fetch = require('node-fetch');

async function generate(prompt) {
    try {
        const seed = Math.floor(Math.random() * 1e9);
        const params = new URLSearchParams({
            new: "true",
            prompt: prompt,
            model: "absolutereality_v181.safetensors [3d9d4d2b]",
            negative_prompt: "",
            steps: "20",
            cfg: "7",
            seed: seed.toString(),
            sampler: "DPM++ 2M Karras",
            aspect_ratio: "square"
        });

        let res = await fetch(`https://api.prodia.com/generate?${params}`);
        if (!res.ok) return { status: false, msg: 'Failed to initiate image generation' };

        const data = await res.json();
        const jobId = data.job;
        const maxAttempts = 10;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            res = await fetch(`https://api.prodia.com/job/${jobId}`);
            if (!res.ok) {
                return { status: false, msg: 'Failed to check job status' };
            }

            const jobData = await res.json();
            if (jobData.status === 'succeeded') {
                return {
                    status: true,
                    result: {
                        prompt,
                        url: `https://images.prodia.xyz/${jobId}.png?download=1`
                    }
                };
            }

            if (attempt < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return { status: false, msg: 'Image generation timed out' };

    } catch (e) {
        console.error(e);
        return { status: false, msg: e.message };
    }
}

module.exports = { generate };