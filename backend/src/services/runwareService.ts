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

        const requestParams: any = {
            positivePrompt: prompt,
            model: selectedModel,
            numberResults: 1,
            width: width || 1024,
            height: height || 1024,
        };

        // Add image input parameters based on the model type
        if (inputImage) {
            // Convert base64 to data URI format that Runware expects
            const dataUri = inputImage.startsWith('data:')
                ? inputImage
                : `data:image/png;base64,${inputImage}`;

            // Nano Banana (google:4@2) uses referenceImages instead of seedImage
            if (selectedModel === "google:4@2") {
                requestParams.referenceImages = [dataUri];
            } else {
                // Other models (RealVis, runware:100@1, SDXL) use seedImage
                requestParams.seedImage = dataUri;
                requestParams.strength = 0.75; // Default strength for img2img
            }
        }

        // Retry logic with timeout handling
        const maxRetries = 3;
        const timeout = 120000; // 120 seconds (2 minutes)
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const images = await this.executeWithTimeout(
                    client.requestImages(requestParams),
                    timeout,
                    `Runware request timed out after ${timeout}ms`
                );
                return images;
            } catch (error) {
                lastError = error as Error;
                console.error(`Attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : error);

                if (attempt < maxRetries) {
                    // Exponential backoff: 2s, 4s, 8s
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));

                    // Re-establish connection before retry
                    await client.ensureConnection();
                }
            }
        }

        throw lastError || new Error('Failed to generate image after retries');
    }

    /**
     * Wraps a promise with a timeout.
     * @param promise The promise to wrap
     * @param ms Timeout in milliseconds
     * @param timeoutMessage Error message for timeout
     * @returns The promise result or throws on timeout
     */
    private executeWithTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
        return Promise.race([
            promise,
            new Promise<T>((_, reject) =>
                setTimeout(() => reject(new Error(timeoutMessage)), ms)
            )
        ]);
    }

    /**
     * Analyzes an image and returns a text description.
     * @param imageBase64 The base64 encoded image
     * @param runwareApiKey Optional overriding API key
     * @param model Optional model to use for image-to-text
     * @returns Description text
     */
    public async requestImageToText(imageBase64: string, runwareApiKey?: string, model?: string): Promise<string> {
        const client = this.getClient(runwareApiKey);

        await client.ensureConnection();

        const requestParams: any = {
            inputImage: imageBase64,
        };

        // Add model if specified
        if (model) {
            requestParams.model = model;
            console.log(`🔍 Using model: ${model} for image-to-text`);
        }

        const response = await client.requestImageToText(requestParams);

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
