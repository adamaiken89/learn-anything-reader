import Foundation

@MainActor
final class QuizEngine: ObservableObject {
  @Published var questions: [QuizQuestion] = []
  @Published var currentIndex = 0
  @Published var selectedAnswers: [String: String] = [:]
  @Published var showResults = false
  @Published var isCompleted = false

  var currentQuestion: QuizQuestion? {
    guard currentIndex < questions.count else { return nil }
    return questions[currentIndex]
  }

  var score: (correct: Int, total: Int) {
    let total = questions.count
    let correct = questions.filter { selectedAnswers[$0.id] == $0.correctOption }.count
    return (correct, total)
  }

  var percentage: Double {
    guard score.total > 0 else { return 0 }
    return Double(score.correct) / Double(score.total) * 100
  }

  func load(_ qs: [QuizQuestion]) {
    questions = qs
    currentIndex = 0
    selectedAnswers = [:]
    showResults = false
    isCompleted = false
  }

  func selectAnswer(_ answer: String) {
    guard let q = currentQuestion else { return }
    selectedAnswers[q.id] = answer
  }

  func nextQuestion() {
    guard currentIndex < questions.count - 1 else {
      isCompleted = true
      showResults = true
      return
    }
    currentIndex += 1
  }

  func isCorrect(_ questionId: String) -> Bool? {
    guard let selected = selectedAnswers[questionId],
          let q = questions.first(where: { $0.id == questionId })
    else { return nil }
    return selected == q.correctOption
  }

  func reset() {
    questions = []
    currentIndex = 0
    selectedAnswers = [:]
    showResults = false
    isCompleted = false
  }
}
