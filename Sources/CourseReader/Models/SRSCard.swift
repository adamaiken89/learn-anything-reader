import Foundation

struct SRSCard: Codable, Identifiable {
  let id: String
  let questionId: String
  let moduleId: Int
  let subjectId: String
  let question: String
  let answer: String
  let explanation: String
  var easeFactor: Double
  var interval: Int
  var repetitions: Int
  var nextReviewDate: Date
  var lastReviewed: Date?

  var isDue: Bool {
    nextReviewDate <= Date()
  }

  static func from(question: QuizQuestion, moduleId: Int, subjectId: String) -> SRSCard {
    SRSCard(
      id: "\(subjectId)-\(moduleId)-\(question.id)",
      questionId: question.id,
      moduleId: moduleId,
      subjectId: subjectId,
      question: question.question,
      answer: question.correctOption + ". " + (question.options[question.correctOption] ?? ""),
      explanation: question.explanation,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: Date(),
      lastReviewed: nil
    )
  }

  mutating func performReview(correct: Bool) {
    if correct {
      repetitions += 1
      switch repetitions {
      case 1: interval = 1
      case 2: interval = 6
      default: interval = Int(Double(interval) * easeFactor)
      }
    } else {
      repetitions = 0
      interval = 1
    }
    easeFactor = max(1.3, easeFactor + (correct ? 0.1 : -0.2))
    nextReviewDate = Calendar.current.date(byAdding: .day, value: interval, to: Date()) ?? Date()
    lastReviewed = Date()
  }
}

struct SRSDeck: Codable {
  var cards: [String: SRSCard]

  var dueCards: [SRSCard] {
    cards.values.filter { $0.isDue }.sorted { $0.nextReviewDate < $1.nextReviewDate }
  }

  func dueCards(for subjectId: String) -> [SRSCard] {
    dueCards.filter { $0.subjectId == subjectId }
  }
}
