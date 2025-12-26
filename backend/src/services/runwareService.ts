import { Runware } from "@runware/sdk-js";

export class RunwareService {
    private static instance: RunwareService;
    private client: InstanceType<typeof Runware>;

    private constructor() {
        const apiKey = process.env.RUNWARE_API_KEY;
        if (!apiKey) {
            throw new Error("RUNWARE_API_KEY is not defined in the environment.");
        }
        this.client = new Runware({ apiKey });
    }

    public static getInstance(): RunwareService {
        if (!RunwareService.instance) {
            RunwareService.instance = new RunwareService();
        }
        return RunwareService.instance;
    }

    /**
     * Gets or creates a Runware client.
     * @param apiKey Optional overriding API key
     * @returns Runware client instance
     */
    private getClient(apiKey?: string): InstanceType<typeof Runware> {
        if (apiKey && apiKey !== process.env.RUNWARE_API_KEY) {
            return new Runware({ apiKey });
        }
        return this.client;
    }

    /**
     * Generates images using Runware SDK.
     * Default model is "Nano Banana" (UUID: 1) as per standard Runware IDs or provided by dashboard.
     * @param prompt The image generation prompt
     * @param size The size of the image
     * @param modelId The model ID to use
     * @param runwareApiKey Optional overriding API key
     * @returns Array of image objects with imageURL
     */
    public async generateImage(prompt: string, size: string = "1024x1024", modelId?: string, runwareApiKey?: string) {
        const [width, height] = size.split('x').map(Number);

        // Map frontend model names to Runware model IDs
        // Default to Nano Banana 2 (google:4@2)
        const selectedModel = modelId || "google:4@2";

        console.log(`🤖 Using Runware model: ${selectedModel}`);

        const client = this.getClient(runwareApiKey);
        const images = await client.requestImages({
            positivePrompt: prompt,
            model: selectedModel,
            numberResults: 1,
            width: width || 1024,
            height: height || 1024,
        });

        return images;
    }

    /**
     * Generates video using Runware SDK (Sora model).
     * @param prompt The video generation prompt
     * @param runwareApiKey Optional overriding API key
     * @returns Video inference results
     */
    public async generateVideo(prompt: string, runwareApiKey?: string) {
        const client = this.getClient(runwareApiKey);
        const response = await client.videoInference({
            positivePrompt: prompt,
            model: "sora", // Placeholder for Sora model ID
        });

        return response;
    }
}

export const runwareService = RunwareService.getInstance();
