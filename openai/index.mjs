import "dotenv/config";

import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
    model: "meta-llama/Llama-3.2-1B-Instruct",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
            role: "user",
            content: "Write a very short poem about coral vine and cat",
        },
    ],
    max_tokens: 1000,
    temperature: 0.7
});

console.log(completion);
console.log(completion.choices[0].message);