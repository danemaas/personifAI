import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs";
import { CallbackManager } from "langchain/callbacks";
import { Replicate } from "langchain/llms/replicate";
import { NextResponse } from "next/server";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await req.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id)
      return new NextResponse("Unauthorized", { status: 401 });

    const identifier = req.url + "-" + user.id;
    const { success } = await rateLimit(identifier);

    if (!success)
      return new NextResponse("Rate limit exceeded", { status: 429 });

    const companion = await prismadb.companion.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      },
    });

    if (!companion)
      return new NextResponse("Companion not found", { status: 404 });

    const name = companion.id;
    const companion_file_name = name + ".txt";

    const companionKey = {
      companionName: name,
      userId: user.id,
      modelName: "llama2-13b",
    };

    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(companionKey);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }

    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    const recentChatHistory = await memoryManager.readLatestHistory(
      companionKey
    );
    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion_file_name
    );

    let relevantHistory = "";

    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    const { handlers } = LangChainStream();

    const model = new Replicate({
      model:
        "meta/llama-2-13b-chat:f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d",
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbacks: CallbackManager.fromHandlers(handlers),
    });

    model.verbose = true;

    const response = String(
      await model
        .call(
          `ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${name}: prefix.
        ${companion.instructions}
        Below are the relevant details about ${name}'s past and the conversation you are in.
        ${relevantHistory}
        ${recentChatHistory}\n${name}`
        )
        .catch(console.error)
    );

    const cleaned = response.replaceAll(",", "");
    const chunks = cleaned.split("\n");

    const cleanedResp = chunks[0];

    await memoryManager.writeToHistory("" + cleanedResp.trim(), companionKey);
    var Readable = require("stream").Readable;

    let s = new Readable();
    s.push(cleanedResp);
    s.push(null);

    if (cleanedResp !== undefined && cleanedResp.length > 1) {
      memoryManager.writeToHistory("" + cleanedResp.trim(), companionKey);

      await prismadb.companion.update({
        where: {
          id: params.chatId,
        },
        data: {
          messages: {
            create: {
              content: cleanedResp.trim(),
              role: "system",
              userId: user.id,
            },
          },
        },
      });
    }

    return new StreamingTextResponse(s);
  } catch (error: any) {
    console.log("CHAT_POST", error);
    return new NextResponse("Internal Error", error.message);
  }
}
