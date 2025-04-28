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
        const payload = JSON.parse(body);
        const res = await fetch(env.WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "VirtualStreets",
                avatar_url: "https://avatars.githubusercontent.com/in/15368?v=4",
                content: "<@1366451119525593158>",
                embeds: [{
                    color: 11027200,
                    url: payload.head_commit.url,
                    author: {
                        name: "github-actions[bot]",
                        icon_url: "https://avatars.githubusercontent.com/in/15368?v=4"
                    },
                    description: `[\`${payload.head_commit.id.substring(0, 7)}\`](${payload.head_commit.url}): ${new Date(payload.head_commit.timestamp).toLocaleString("en-GB")}`
                }]
            }),
        });
        if (!res.ok) {
            return new Response(await res.text(), { status: 500 });
        }
        return new Response(null, { status: 204 });
    },
} satisfies ExportedHandler<Env>;