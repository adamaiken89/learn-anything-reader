import Foundation
import Observation

enum AppScreen: Hashable {
  case subjectList
  case moduleList(Subject)
  case lesson(Subject, ModuleMeta)
  case quiz(Subject, ModuleMeta)
  case askAI(Subject, ModuleMeta)
  case review(Subject)
  case settings
}

@Observable
@MainActor
final class CourseViewModel {
  static let shared = CourseViewModel()

  var subjects: [Subject] = []
  var selectedSubject: Subject?
  var selectedModule: ModuleMeta?
  var lessonContent: String = ""
  var highlightedText: String = ""
  var aiQuestion: String = ""
  var aiResponse: String = ""
  var isAIThinking = false
  var aiError: String?
  var navigationPath: [AppScreen] = [.subjectList]

  let quizEngine = QuizEngine()
  let courseLoader = CourseLoader.shared
  let gemini = GeminiService.shared

  private init() {}

  func loadSubjects() {
    subjects = courseLoader.loadSubjects()
  }

  func selectSubject(_ subject: Subject) {
    selectedSubject = subject
    navigationPath.append(.moduleList(subject))
  }

  func selectModule(_ module: ModuleMeta) {
    guard let subject = selectedSubject else { return }
    selectedModule = module
    lessonContent = courseLoader.loadLesson(subject: subject, module: module)
    navigationPath.append(.lesson(subject, module))
  }

  func startQuiz(subject: Subject, module: ModuleMeta) {
    let questions = courseLoader.loadQuiz(subject: subject, module: module)
    quizEngine.load(questions)
    navigationPath.append(.quiz(subject, module))
  }

  func startReview(subject: Subject) {
    navigationPath.append(.review(subject))
  }

  func askAI() {
    guard !highlightedText.isEmpty, !aiQuestion.isEmpty else { return }
    isAIThinking = true
    aiError = nil
    aiResponse = ""

    Task {
      do {
        let response = try await gemini.askAboutHighlight(
          highlightedText: highlightedText,
          question: aiQuestion
        )
        aiResponse = response
      } catch {
        aiError = error.localizedDescription
      }
      isAIThinking = false
    }
  }

  func goBack() {
    guard navigationPath.count > 1 else { return }
    navigationPath.removeLast()
  }

  func goHome() {
    navigationPath = [.subjectList]
    selectedSubject = nil
    selectedModule = nil
    lessonContent = ""
    highlightedText = ""
    aiQuestion = ""
    aiResponse = ""
    aiError = nil
    quizEngine.reset()
  }
}
