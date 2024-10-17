from flask import Flask, render_template, request, jsonify, send_file, session
from gtts import gTTS
from pydub import AudioSegment
import pathlib
import google.generativeai as genai
import os

app = Flask(__name__, static_url_path='/static')
app.secret_key = os.environ.get('SECRET_KEY', 'supersecretkey')

# Initialize the Gemini model
genai.configure(api_key="AIzaSyC7WPuNSB1dgyHyd_XuU8mfaQ-3_rn4ji4")
model = genai.GenerativeModel('models/gemini-1.5-flash')

@app.route('/')
def index():
    if 'conversation_history' not in session:
        session['conversation_history'] = []
    return render_template('index.html')

@app.route('/process_audio', methods=['POST'])
def process_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400
    
    # Save the audio file
    audio = request.files['audio']
    audio_path = 'samplesmall.mp3'
    audio.save(audio_path)
    
    # Step 1: Transcribe the user's audio input
    transcription_prompt = "Please transcribe the following audio input:"
    transcription_response = model.generate_content([
        transcription_prompt,
        {
            "mime_type": "audio/mp3",
            "data": pathlib.Path(audio_path).read_bytes()
        }
    ])
    user_input = transcription_response.text.strip()
    
    # Base prompt for the therapist response
    base_prompt = """
    Engage with me in a conversation as a cognitive-behavioral therapist, following a structured and iterative process to explore my thoughts, feelings, and experiences.
    1. Begin by asking me about my concerns or the issue I'd like to discuss.
    2. Based on my input, provide:
        - First: A refined focus, clearly stating the topic or concern.
        - Second: Suggestions for deeper exploration, including techniques like cognitive restructuring or identifying cognitive distortions.
        - Third: Further questions to help me reflect on my thoughts, emotions, and behaviors.
    3. After each response, assess whether the issue has been adequately addressed or requires further exploration. Continue refining based on feedback.
    4. Provide empathic responses, guidance, and encouragement while maintaining a supportive and nonjudgmental approach.
    Note: Please ensure the output feels conversational and natural when read aloud, as it will be converted to speech using a TTS system. Avoid symbols or emojis or unnecessary technical details which could read by mistake by texttospeech.
    """

    # Load conversation history from the session
    conversation_history = session.get('conversation_history', [])

    # Append the transcribed user input to the conversation history
    conversation_history.append(f"User: {user_input}")
    
    # Construct the full prompt, adding conversation history for context
    full_prompt = base_prompt + "\n" + "\n".join(conversation_history)
    
    # Step 2: Get the therapist's response
    therapist_response = model.generate_content(full_prompt)
    response_text = therapist_response.text
    
    # Append the model's response to the conversation history
    conversation_history.append(f"Therapist: {response_text}")
    
    # Save updated conversation history back to the session
    session['conversation_history'] = conversation_history
    
    print(conversation_history)

    # Convert the response text to speech using gtts
    def clean_text(response_text):
        if response_text.startswith("Therapist:"):
            response_text = response_text.replace("Therapist:", "", 1).strip()
        return response_text
    
    cleaned_text = clean_text(response_text)
    tts = gTTS(cleaned_text)
    audio_output_path = "response.mp3"
    tts.save(audio_output_path)

    # Send the audio file as a response
    return send_file(audio_output_path, as_attachment=True, mimetype='audio/mp3')

@app.route('/reset_conversation', methods=['POST'])
def reset_conversation():
    session.pop('conversation_history', None)
    return jsonify({'message': 'Conversation history reset'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
