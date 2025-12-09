````markdown
# 🤖 RoboApp — AI-Powered Robotics Quiz (React Native + Expo)

RoboApp is an educational mobile application designed to test and strengthen robotics knowledge through automatically generated quizzes.  
The app uses **OpenRouter** and the **Mistral Large 2407** model to dynamically create 10-question tests based on different robotics domains and difficulty levels.

This project was built with **React Native (Expo)** and is ideal for learning, teaching, or evaluating robotics concepts in an interactive way.

---

## 🚀 Features

- Three difficulty levels: **Easy**, **Medium**, **Hard**
- Fully AI-generated robotics questions  
- 30 randomized robotics domains, including:
  - Humanoid Robotics  
  - Industrial Automation  
  - Autonomous Vehicles  
  - SLAM  
  - Soft Robotics  
  - Machine Learning for Robotics  
- Each quiz has:
  - 10 questions  
  - 5 answer choices  
  - Exactly 1 correct alternative  
- Score calculation and performance screen  
- Elegant UI with gradients and animations  
- Fallback questions if the AI returns invalid data  
- All questions generated on demand via OpenRouter API  

---

## 🧠 How it Works

1. The user selects a difficulty level.  
2. The app randomly selects a robotics topic from the predefined list.  
3. The app sends a structured JSON-only prompt to OpenRouter:
   - Model used: **mistralai/mistral-large-2407**
   - Output required:  
     ```json
     {
       "question": "...",
       "options": ["A","B","C","D","E"],
       "correct_index": 0-4
     }
     ```
4. The app parses the LLM response.  
5. The user answers the 10 questions.  
6. The final score is presented with feedback.  

---

## 📸 Screenshots (placeholders)

> Add screenshots from your device or Expo Go here.

````

/docs/screenshot-menu.png
/docs/screenshot-question.png
/docs/screenshot-result.png

````

---

## 🔧 Technologies Used

- **React Native (Expo)**
- **JavaScript**
- **OpenRouter API**
- **Mistral Large 2407**
- **LinearGradient (expo-linear-gradient)**

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/roboapp.git
cd roboapp
````

### 2. Install dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 3. Create an environment variable file

Create a `.env` file (or manually set the constant in the code):

```
OPENROUTER_KEY=your_api_key_here
```

If running on Expo Snack, place your key directly in the code.

---

## ▶️ Running the App

### With Expo:

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

### On Expo Snack:

Paste the source code into
[https://snack.expo.dev/](https://snack.expo.dev/)

---

## 🔐 API Key Setup (OpenRouter)

This project uses the OpenRouter API:

* Sign up at: [https://openrouter.ai](https://openrouter.ai)
* Generate an API key
* Replace:

```js
const OPENROUTER_KEY = "YOUR_API_KEY";
```

**Important:**
Never commit your personal API key to GitHub.
Use local environment variables when possible.

---

## 🛡️ Error Handling

* If the AI returns malformed JSON → the app falls back to a default question.
* If the network fails → retry recommended.
* All JSON is parsed safely using a regex extractor.

---

## 📘 Project Structure

```
/App.js           # Main application logic
/docs             # Screenshots, images, diagrams
/README.md        # Documentation
```

---

## 🧭 Roadmap

* [ ] Add user ranking and statistics
* [ ] Add sound or haptic feedback
* [ ] Add Portuguese / Spanish language modes
* [ ] Add timed quiz mode
* [ ] Add optional connection to GPT-4o or Claude 3
* [ ] Add "study mode" with explanations
* [ ] Add local history of previous scores

---

## 🤝 Contributions

Contributions, issues, and suggestions are welcome!
Feel free to open a PR or issue.

---

## 📄 License

MIT License © 2025
You are free to use, modify, and distribute this project.

---


Basta pedir!
```
