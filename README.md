# Therapy-SAP

You can directly access live web service at: https://she-is-gone-and-never-coming-back-latest.onrender.com/

Therapy-SAP is a web application that simulates a conversation with a cognitive-behavioral therapist using artificial intelligence. The app processes audio input from users, generates conversational responses, and converts them to speech using text-to-speech (TTS) technology. It is designed to help users explore their thoughts and feelings in a structured and supportive manner.

## Features

- **Audio Input**: Users can upload audio files containing their concerns or issues.
- **Conversational AI**: The application utilizes the Gemini model to generate empathetic and supportive responses.
- **Text-to-Speech**: Converts the therapist's responses into audio, allowing users to listen to the guidance.
- **Session Management**: Maintains a history of the conversation for continuity.
- **Reset Functionality**: Users can reset the conversation history whenever needed.

## Technologies Used

- **Flask**: A lightweight web framework for building the application.
- **gTTS (Google Text-to-Speech)**: Converts generated text responses into speech.
- **pydub**: A library for audio manipulation.
- **Google Generative AI**: Powers the conversational AI for generating responses.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Python 3.x
- Flask
- gTTS
- pydub
- google-generativeai (for AI response generation)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/therapy-sap.git
   cd therapy-sap
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

5. Set your Google API key for the Gemini model:
   ```python
   genai.configure(api_key="YOUR_API_KEY_HERE")
   ```

### Running the Application

To run the application, execute the following command:

```bash
python app.py
```

Visit `http://127.0.0.1:5000` in your web browser to access the application.

## Usage

1. Upload your audio file containing your concerns or issues.
2. Listen to the therapist's response generated by the AI.
3. Continue the conversation as needed, exploring your thoughts and feelings.
4. Use the reset button to clear the conversation history at any time.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to the creators of Flask, gTTS, and Google Generative AI for their fantastic libraries and tools.
- Special thanks to the contributors of this project for their valuable input.

```
