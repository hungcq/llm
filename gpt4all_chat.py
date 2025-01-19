from gpt4all import GPT4All
import sys

model = GPT4All("Meta-Llama-3-8B-Instruct.Q4_0.gguf")
with model.chat_session():
    while True:
        prompt = input("> ")
        if prompt.lower() == "quit":
            print("Goodbye!")
            sys.exit(0)

        print('Let me think...')
        try:
            output = model.generate(prompt, max_tokens=1024)
            print(output.strip())
        except Exception as e:
            print(f"Error: {e}")