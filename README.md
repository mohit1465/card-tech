# Cart AI - AI-Powered Image Generation

A client-side web application for generating images using Google's Gemini AI API. This application uses the Gemini 2.0 Flash Experimental model to create images based on text prompts.

## Features

- Generate images based on text prompts
- Upload and include reference images in the generation
- Choose from various art styles
- Select different aspect ratios
- Adjust generation temperature
- Download generated images

## Setup Instructions

1. **Get a Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to get your Gemini API key
   - You may need to create an account if you don't have one

2. **Configure the Application**:
   - Open the `config.js` file in your code editor
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key
   - Save the file

3. **Run the Application**:
   - Install dependencies: `npm install`
   - Start the application: `npm start`
   - This will open the application in your default browser

## Client-Side Architecture

This application runs entirely in the browser with no server-side processing. The API key is stored locally in the config.js file and is sent directly to Google's APIs when generating images.

**Note**: This is designed for personal use. In a production environment, you would typically handle API keys on a server to avoid exposing them to clients.

## Browser Compatibility

This application works best in modern browsers:
- Chrome
- Firefox
- Edge
- Safari

## License

This project is available for personal and educational use.