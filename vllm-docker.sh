#!/bin/bash

source .env

docker run -d -it --rm --ipc=host \
	-v ~/.cache/huggingface:/root/.cache/huggingface \
  --env "HUGGING_FACE_HUB_TOKEN=$HUGGING_FACE_HUB_TOKEN" \
  -p 8000:8000 \
   vllm-cpu-env \
   --model meta-llama/Llama-3.2-1B-Instruct --dtype half

docker run -d -it --rm --ipc=host --name mistral \
	-v ~/.cache/huggingface:/root/.cache/huggingface \
  --env "HUGGING_FACE_HUB_TOKEN=$HUGGING_FACE_HUB_TOKEN" \
  -p 8000:8000 \
   vllm-cpu-env \
   --model mistralai/Ministral-8B-Instruct-2410 --tokenizer_mode mistral --config_format mistral --load_format mistral
