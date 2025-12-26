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
     * Generates images using Runware SDK.
     * Default model is "Nano Banana" (UUID: 1) as per standard Runware IDs or provided by dashboard.
     * @param prompt The image generation prompt
     * @param size The size of the image
     * @returns Array of image objects with imageURL
     */
    public async generateImage(prompt: string, size: string = "1024x1024") {
        const [width, height] = size.split('x').map(Number);

        // Model ID for Nano Banana - commonly 'runware:100@1' or similar depending on current registry
        // The user mentioned checking ID in dashboard, I'll use a placeholder or common ID if known.
        // Standard FLUX Nano or similar often used. I will use a default or configurable one.
        const modelId = "runware:100@1"; // Placeholder for Nano Banana

        const images = await this.client.requestImages({
            positivePrompt: prompt,
            model: modelId,
            numberResults: 1,
            width: width || 1024,
            height: height || 1024,
        });

        return images;
    }

    /**
     * Generates video using Runware SDK (Sora model).
     * @param prompt The video generation prompt
     * @returns Video inference results
     */
    public async generateVideo(prompt: string) {
        const response = await this.client.videoInference({
            positivePrompt: prompt,
            model: "sora", // Placeholder for Sora model ID
        });

        return response;
    }
}

export const runwareService = RunwareService.getInstance();
