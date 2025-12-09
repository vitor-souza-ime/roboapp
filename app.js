import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const OPENROUTER_KEY = "YOUR_API_KEY";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "mistralai/mistral-large-2407";

const TOPICS = [
  'Industrial Robotics','Mobile Robotics','Collaborative Robotics (Cobots)','Humanoid Robotics',
  'Service Robotics','Assistive Robotics','Medical Robotics','Surgical Robotics','Educational Robotics',
  'Social Robotics','Cognitive Robotics','Autonomous Robotics','Aerial Robotics (Drones)','Space Robotics',
  'Underwater Robotics','Rescue Robotics','Military and Defense Robotics','Agricultural Robotics',
  'Logistics Robotics','Construction Robotics','Soft Robotics','Modular Robotics','Swarm Robotics',
  'Microrobotics','Nanorobotics','Computer Vision for Robotics','SLAM (Mapping and Localization)',
  'Motion Planning and Control','Robotic Mechatronics','Machine Learning for Robotics'
];

export default function App() {
  const [phase, setPhase] = useState("menu");
  const [difficulty, setDifficulty] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  const buildPrompt = (level, topic) => `
You are a robotics question generator.

RETURN ONLY PURE JSON, NO EXTRA TEXT.

Generate exactly 1 (one) multiple choice question IN ENGLISH.
The question must have 5 alternatives, with ONLY 1 correct answer.

Mandatory JSON format:
{
  "question": "question text",
  "options": ["A","B","C","D","E"],
  "correct_index": 0-4
}

Mandatory topic: ${topic}
Level: ${level}

No explanations, comments or markdown allowed.
Return ONLY the JSON, nothing else.
`;

  const requestQuestion = async (prompt) => {
    try {
      const resp = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer": "https://snack.expo.dev",
          "X-Title": "Robotics Quiz App"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "Answer only with valid JSON." },
            { role: "user", content: prompt }
          ],
          max_tokens: 250,
          temperature: 0.2
        })
      });

      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) return null;

      const jsonText = extractJson(content);
      if (!jsonText) return null;

      const parsed = JSON.parse(jsonText);

      if (
        parsed.question &&
        Array.isArray(parsed.options) &&
        parsed.options.length === 5 &&
        typeof parsed.correct_index === "number"
      ) {
        return parsed;
      }

      return null;

    } catch (err) {
      console.log("FETCH ERROR:", err);
      return null;
    }
  };

  const extractJson = (text) => {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
  };

  const fallback = (topic, level, i) => ({
    question: `Fallback question ${i+1} about ${topic}`,
    options: ["A","B","C","D","E"],
    correct_index: 0
  });

  const startQuiz = async (level) => {
    setDifficulty(level);
    setPhase("loading");
    setScore(0);
    setSelectedOption(null);

    let qList = [];

    for (let i = 0; i < 10; i++) {
      setLoadingMessage(`Generating question ${i + 1} of 10...`);

      const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      const prompt = buildPrompt(level, topic);

      const q = await requestQuestion(prompt);
      qList.push(q || fallback(topic, level, i));
    }

    setQuestions(qList);
    setCurrentIndex(0);
    setPhase("quiz");
  };

  const handleSelect = (i) => {
    setSelectedOption(i);

    const correct = questions[currentIndex].correct_index;
    if (i === correct) {
      setScore(score + 1);
    }
  };

  const next = () => {
    if (currentIndex + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
    setSelectedOption(null);
  };

  const reset = () => {
    setPhase("menu");
    setQuestions([]);
    setScore(0);
  };

  // MENU SCREEN
  if (phase === "menu") {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.menuContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>🤖 Robotics Quiz</Text>
            <Text style={styles.subtitle}>Test your robotics knowledge</Text>
          </View>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.difficultyBtn, styles.easyBtn]} 
              onPress={() => startQuiz("Easy")}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>😊</Text>
              <Text style={styles.btnLabel}>Easy</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.difficultyBtn, styles.mediumBtn]} 
              onPress={() => startQuiz("Medium")}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>🤔</Text>
              <Text style={styles.btnLabel}>Medium</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.difficultyBtn, styles.hardBtn]} 
              onPress={() => startQuiz("Hard")}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>🔥</Text>
              <Text style={styles.btnLabel}>Hard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // LOADING SCREEN
  if (phase === "loading") {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingTitle}>Preparing your quiz...</Text>
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      </LinearGradient>
    );
  }

  // QUIZ SCREEN
  if (phase === "quiz") {
    const q = questions[currentIndex];
    const progress = ((currentIndex + 1) / 10) * 100;

    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.quizScroll}>
          <View style={styles.quizContent}>
            <View style={styles.quizHeader}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.questionCounter}>
                <Text style={styles.currentQuestion}>Question {currentIndex + 1}</Text>
                <Text style={styles.totalQuestions}> / 10</Text>
              </View>
            </View>

            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{q.question}</Text>
            </View>

            <View style={styles.optionsContainer}>
              {q.options.map((opt, i) => {
                const correct = q.correct_index === i;
                const sel = selectedOption === i;
                
                let borderColor = '#e0e0e0';
                let bgColor = '#ffffff';

                if (selectedOption !== null) {
                  if (correct) {
                    bgColor = '#d4edda';
                    borderColor = '#28a745';
                  }
                  if (sel && !correct) {
                    bgColor = '#f8d7da';
                    borderColor = '#dc3545';
                  }
                }

                return (
                  <TouchableOpacity
                    key={i}
                    disabled={selectedOption !== null}
                    onPress={() => handleSelect(i)}
                    style={[
                      styles.optionBtn,
                      { backgroundColor: bgColor, borderColor: borderColor }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionLetter}>{String.fromCharCode(65+i)}</Text>
                    <Text style={styles.optionText}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedOption !== null && (
              <TouchableOpacity 
                style={styles.nextBtn} 
                onPress={next}
                activeOpacity={0.8}
              >
                <Text style={styles.nextBtnText}>
                  {currentIndex + 1 >= 10 ? "View Results 🎯" : "Next Question →"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // RESULT SCREEN
  if (phase === "result") {
    const percentage = (score / 10) * 100;
    let emoji = "📚";
    let message = "Keep practicing!";

    if (percentage >= 90) {
      emoji = "🏆";
      message = "Excellent!";
    } else if (percentage >= 70) {
      emoji = "🌟";
      message = "Great job!";
    } else if (percentage >= 50) {
      emoji = "👍";
      message = "Good work!";
    }

    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
          <Text style={styles.resultTitle}>{message}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreDivider}>/</Text>
            <Text style={styles.scoreTotalNumber}>10</Text>
          </View>
          <Text style={styles.percentageText}>{percentage.toFixed(0)}% correct</Text>

          <TouchableOpacity 
            style={styles.restartBtn} 
            onPress={reset}
            activeOpacity={0.8}
          >
            <Text style={styles.restartBtnText}>🔄 Play Again</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#f0f0f0',
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 400,
    gap: 15,
  },
  difficultyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  easyBtn: {
    backgroundColor: '#38ef7d',
  },
  mediumBtn: {
    backgroundColor: '#f5576c',
  },
  hardBtn: {
    backgroundColor: '#fee140',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  btnLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#f0f0f0',
  },
  quizScroll: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  quizContent: {
    paddingHorizontal: 20,
  },
  quizHeader: {
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38ef7d',
  },
  questionCounter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentQuestion: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalQuestions: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  questionText: {
    fontSize: 20,
    color: '#333',
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 3,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionLetter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 12,
    minWidth: 25,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  nextBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  nextBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resultEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  scoreDivider: {
    fontSize: 48,
    color: 'rgba(255,255,255,0.7)',
    marginHorizontal: 10,
  },
  scoreTotalNumber: {
    fontSize: 48,
    color: 'rgba(255,255,255,0.8)',
  },
  percentageText: {
    fontSize: 22,
    color: '#f0f0f0',
    marginBottom: 40,
  },
  restartBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  restartBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
});
