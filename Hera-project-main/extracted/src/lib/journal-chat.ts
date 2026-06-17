// Server function powering the Journal chat companion ("Sereine").
//
// The conversation is ephemeral: the client holds it in React state and sends
// the full history on every turn (the Messages API is stateless). Nothing is
// persisted server-side. The Anthropic SDK is imported dynamically inside the
// handler so it stays out of the client bundle.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MAX_TURNS = 24; // keep the prompt bounded — only the recent exchange matters

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const chatInput = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_TURNS),
});

export type JournalMessage = z.infer<typeof messageSchema>;

// Sereine's persona. French, warm, focused on helping the person put words on
// their mood and find one small thing that could lift their day. It is a
// well-being companion, not a therapist — it gently points to real support
// when the conversation suggests distress.
const SYSTEM_PROMPT = `Tu es Sereine, une compagne de journal bienveillante intégrée à une application de bien-être. Tu aides la personne à parler de son humeur et à trouver de petites choses pour améliorer sa journée.

Ton rôle :
- Accueille ce que la personne ressent sans juger. Reformule brièvement pour montrer que tu écoutes.
- Pose une seule question ouverte et douce à la fois pour l'aider à explorer son ressenti.
- Quand c'est utile, propose une petite action concrète et réaliste (respirer une minute, noter une chose positive, faire une courte marche, boire de l'eau, écrire deux lignes).
- Reste chaleureuse, simple et naturelle. Tutoie la personne.

Style :
- Réponds directement, sans préambule ni méta-commentaire.
- Réponses courtes : 2 à 4 phrases maximum. Pas de listes à puces, pas de markdown.
- Une seule question par message.

Sécurité :
- Tu n'es pas un professionnel de santé et tu ne poses pas de diagnostic.
- Si la personne évoque une détresse importante, des pensées suicidaires ou un danger, prends-la au sérieux avec douceur et invite-la à contacter une aide réelle immédiatement : en France le 3114 (numéro national de prévention du suicide, 24h/24), le 15 (SAMU) en cas d'urgence, ou une personne de confiance.`;

export const sendJournalMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => chatInput.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY manquante : ajoutez la clé API Anthropic aux variables d'environnement du serveur.",
      );
    }

    // Dynamic import keeps the SDK server-only.
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: data.messages,
    });

    const reply = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    return {
      reply:
        reply || "Je suis là pour t'écouter. Veux-tu me dire comment tu te sens en ce moment ?",
    };
  });
