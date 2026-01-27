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
     * @param prompt The image generation prompt
     * @param size The size of the image
     * @param modelId The model ID to use
     * @param runwareApiKey Optional overriding API key
     * @param inputImage Optional base64 image for Image-to-Image
     * @returns Array of image objects with imageURL
     */
    public async generateImage(
        prompt: string,
        size: string = "1024x1024",
        modelId?: string,
        runwareApiKey?: string,
        inputImage?: string
    ) {
        const [width, height] = size.split('x').map(Number);

        // Map frontend model names to Runware model IDs
        // Default to Nano Banana 2 (google:4@2)
        const selectedModel = modelId || "google:4@2";

        console.log(`🤖 Using Runware model: ${selectedModel}${inputImage ? ' (Image-to-Image)' : ''}`);

        const client = this.getClient(runwareApiKey);

        // Ensure connection is established before making requests
        await client.ensureConnection();

        const images = await client.requestImages({
            positivePrompt: prompt,
            model: selectedModel,
            numberResults: 1,
            width: width || 1024,
            height: height || 1024,
            // seedImage is the parameter for Image-to-Image in Runware
            seedImage: inputImage,
            // If we have an input image, we usually want some strength
            strength: inputImage ? 0.75 : undefined,
        });

        return images;
    }

    /**
     * Analyzes an image and returns a text description.
     * @param imageBase64 The base64 encoded image
     * @param runwareApiKey Optional overriding API key
     * @returns Description text
     */
    public async requestImageToText(imageBase64: string, runwareApiKey?: string): Promise<string> {
        const client = this.getClient(runwareApiKey);

        await client.ensureConnection();

        const response = await client.requestImageToText({
            inputImage: imageBase64,
        });

        return response.text || "";
    }

    /**
     * Generates video using Runware SDK (Sora model).
     * @param prompt The video generation prompt
     * @param runwareApiKey Optional overriding API key
     * @returns Video inference results
     */
    public async generateVideo(prompt: string, runwareApiKey?: string) {
        const client = this.getClient(runwareApiKey);

        await client.ensureConnection();

        const response = await client.videoInference({
            positivePrompt: prompt,
            model: "sora", // Placeholder for Sora model ID
        });

        return response;
    }
}

export const runwareService = RunwareService.getInstance();
