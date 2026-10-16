# Essay Helper - Run locally

## 1. Download a free local AI model

Open a terminal and run this once:

```powershell
ollama pull llama3.2:3b
```

Ollama must be open while the website is being used. This model runs on your computer and does not use API credits.

## 2. Install the Python packages

Open a terminal in this folder and run:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 3. Start the website

```powershell
python server.py
```

Open http://127.0.0.1:5000 in a browser. Do not open `index.html` directly, because the AI API needs the local Python server.

## What the AI flow does

1. Reads the handwriting with EasyOCR.
2. Uses `best.pt` when it finds one of the classes your YOLO model was trained to recognize.
3. Sends the extracted essay text to your local Ollama model for a Grade 7-friendly improved version.
