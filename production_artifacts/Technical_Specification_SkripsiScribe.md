# Technical Specification: SkripsiScribe

## 1. Overview
SkripsiScribe is an AI-powered web application prototype designed to assist university students in transcribing and summarizing interview audio for their theses. It leverages Google's Gemini 2.5 Flash API to process audio files and return structured insights.

## 2. Target Audience
University students conducting qualitative research or interviews who need fast, accurate transcriptions and summaries.

## 3. UI/UX Design (Vibe)
- **Aesthetic**: Clean, modern, academic, and highly professional.
- **Styling**: Tailwind CSS (via CDN) for rapid, responsive design.
- **Components**:
  - Drag-and-drop / File Upload zone restricted to `.mp3` and `.wav` formats.
  - "Process Audio" action button with visual loading indicators.
  - Output sections: "Summary (Top 3 Key Points)" and "Full Transcript".
  - Graceful error states (e.g., API failures, invalid file types).

## 4. Technical Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5.
- **Styling**: Tailwind CSS (CDN).
- **Backend/AI Model**: Google Cloud Vertex AI (Gemini 2.5 Flash API).
- **No Build Tools**: Pure static files to avoid complex setups.

## 5. File Structure
The project will strictly follow this directory structure:
```text
/app_build
  ├── index.html
  ├── app.js
/production_artifacts
  ├── Technical_Specification_SkripsiScribe.md
```

## 6. Functional Requirements

### Frontend (`index.html` & `app.js`)
- **File Input**: Accept `audio/*` via a file input element.
- **File Processing**: Use the `FileReader` API to read the audio file as a Base64 encoded string.
- **API Integration**:
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`
  - Payload Structure: Must use `inlineData` for the audio file with the correct `mimeType` and include a strong prompt requiring a strictly formatted JSON response containing `transcript` (string) and `keyPoints` (array of 3 strings).
- **Response Handling**: Parse the JSON response from Gemini, extract the structured data, and dynamically inject them into the DOM.
- **Configuration**: An easily modifiable constant `const API_KEY = "YOUR_API_KEY_HERE";` for local testing.

## 7. Next Steps
Once this specification is explicitly **Approved** by the user, the Full-Stack Engineer will proceed to implement the `app_build` files.
