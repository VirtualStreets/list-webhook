import { Webhooks } from "@octokit/webhooks";

export default {
    async fetch(req, env): Promise<Response> {
        if (req.method !== "POST") {
            return new Response(null, { status: 405 });
        }
        const signature = req.headers.get("x-hub-signature-256");
        if (!signature) {
            return new Response(null, { status: 401 });
        }
        const body = await req.text();
        const webhooks = new Webhooks({
            secret: env.WEBHOOK_SECRET,
        });

        if (!(await webhooks.verify(body, signature))) {
            return new Response(null, { status: 401 });
        }

        return new Response(null, { status: 204 });
    },
} satisfies ExportedHandler<Env>;