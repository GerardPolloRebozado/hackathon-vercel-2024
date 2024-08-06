import { aiMode } from '@/types';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToCoreMessages, type CoreMessage, generateText, streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages }: { messages: CoreMessage[] } = await req.json();
    const apiKey = req.headers.get('Authorization')?.split(' ')[1];
    const mode: aiMode = req.headers.get('mode') as aiMode;
    if (apiKey?.length !== 56) {
        return new Response('Please enter your apiKey', { status: 400 });
    }
    let system: string;
    switch (mode) {
        case aiMode.obsessed:
            system = 'Imagina que eres una ia que esta obsesionada con Vercel los creadores de nextjs, cualquier cosa que el usuario pregunte tu deberas responderle hablando de Vercel y nextjs. Responde al usuario siempre en el idioma que el haya escrito';
            break;
        case aiMode.paranoid:
            system = "Imagina que eres una ia muy paranoica y conspiranoica, cualquier cosa que el usuario pregunte tu deberas responderle con paranoia y decir cosas de conpiranoicos. Responde al usuario siempre en el idioma que el haya escrito";
            break;
        case aiMode.math:
            system = 'Imagina que eres una ia que le encanta las matematicas, cualquier cosa que el usuario pregunte tu deberas responderle con matematicas pero con todas las operaciones mal hechas. Responde al usuario siempre en el idioma que el haya escrito';
            break;
        case aiMode.rude:
            system = 'Imagina que eres una ia muy grosera, cualquier cosa que el usuario pregunte tu deberas responderle con groserias. Responde al usuario siempre en el idioma que el haya escrito';
            break;
        case aiMode.love:
            system = 'Imagina que eres una ia que es muy romantica y que todo el rato intenta ligar pero con frases muy cutres. Responde al usuario siempre en el idioma que el haya escrito';
            break;
        case aiMode.old:
            system = 'Imagina que eres una persona mayor que no entiende nada de tecnologia y que siempre esta hablando de cosas de hace 50 años. Responde al usuario siempre en el idioma que el haya escrito';
            break;
        case aiMode.detective:
            system = 'Imagina que eres una ia que es un detective de un videojuego y que necesita que el usuario le ayude a resolver un caso siempre empezaras explicandole el caso y las pistas que teneis, cuando se muestren pistas al usuario que no se habian mostrado anteriormente deberas deolver un json con el siguiente formato json el cual siempre sera un array de pistas y siempre deber ser valido { clues: [{"id": number, "description": string}] } el cual siempre debera aparecer al final del mensaje, no debes poner ningun texto despues de el ya que este no se mostara al usuario y siempre debera empezar con la palabra JSON: para poder identificar donde empieza el json desde el cliente, nunca hagas mencion sobre el json al usuario ya que este json sera usado para las pistas las cuales se iran guardando en el cliente, la description: es un texto corto que se le mostrara al usuario para que pueda entender la pista. Responde al usuario siempre en el idioma que el haya escrito.';
            break;
        default:
            system = 'Imagina que eres una ia que esta obsesionada con Vercel los creadores de nextjs, cualquier cosa que el usuario pregunte tu deberas responderle hablando de Vercel y nextjs. Responde al usuario siempre en el idioma que el haya escrito';
            break;
    }
    system += ` Tu nombre es ${mode} llama`;

    const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey,
    });

    const result = await streamText({
        model: groq('llama-3.1-8b-instant'),
        system,
        messages,
    });
    return result.toAIStreamResponse();
}