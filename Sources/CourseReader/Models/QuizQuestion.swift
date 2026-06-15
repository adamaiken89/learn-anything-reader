import Foundation

struct QuizQuestion: Codable, Identifiable {
  let id: String
  let question: String
  let options: [String: String]
  let answer: String
  let explanation: String
  let difficulty: Int
  let tags: [String]

  var correctOption: String { answer }

  var sortedOptions: [(key: String, value: String)] {
    options.sorted { $0.key < $1.key }
  }

  static func load(from url: URL) -> [QuizQuestion] {
    guard let data = try? Data(contentsOf: url),
          let yamlString = String(data: data, encoding: .utf8)
    else { return [] }
    return parseQuizYAML(yamlString)
  }
}

private func parseQuizYAML(_ yaml: String) -> [QuizQuestion] {
  var questions: [QuizQuestion] = []
  var currentId = ""
  var currentQ = ""
  var currentOptions: [String: String] = [:]
  var currentAnswer = ""
  var currentExplanation = ""
  var currentDifficulty = 1
  var currentTags: [String] = []
  var inQuestion = false
  var inOptions = false
  var inTags = false

  let lines = yaml.components(separatedBy: .newlines)
  for line in lines {
    let trimmed = line.trimmingCharacters(in: .whitespaces)

    if trimmed.hasPrefix("- id:") {
      if inQuestion {
        questions.append(QuizQuestion(
          id: currentId, question: currentQ, options: currentOptions,
          answer: currentAnswer, explanation: currentExplanation,
          difficulty: currentDifficulty, tags: currentTags
        ))
      }
      currentId = String(trimmed.dropFirst(5)).trimmingCharacters(in: .whitespaces).trimmingCharacters(in: CharacterSet(charactersIn: "\"'"))
      currentQ = ""; currentOptions = [:]; currentAnswer = ""
      currentExplanation = ""; currentDifficulty = 1; currentTags = []
      inQuestion = true; inOptions = false; inTags = false
      continue
    }

    guard inQuestion else { continue }

    if trimmed.hasPrefix("question:") {
      currentQ = String(trimmed.dropFirst(9)).trimmingCharacters(in: .whitespaces).trimmingCharacters(in: CharacterSet(charactersIn: "\"'"))
      inOptions = false; inTags = false
    } else if trimmed.hasPrefix("options:") {
      inOptions = true; inTags = false
    } else if trimmed.hasPrefix("answer:") {
      currentAnswer = String(trimmed.dropFirst(7)).trimmingCharacters(in: .whitespaces)
      inOptions = false; inTags = false
    } else if trimmed.hasPrefix("explanation:") {
      currentExplanation = String(trimmed.dropFirst(12)).trimmingCharacters(in: .whitespaces).trimmingCharacters(in: CharacterSet(charactersIn: "\"'"))
      inOptions = false; inTags = false
    } else if trimmed.hasPrefix("difficulty:") {
      currentDifficulty = Int(String(trimmed.dropFirst(11)).trimmingCharacters(in: .whitespaces)) ?? 1
      inOptions = false; inTags = false
    } else if trimmed.hasPrefix("tags:") {
      let rest = String(trimmed.dropFirst(5)).trimmingCharacters(in: .whitespaces)
      if rest.hasPrefix("[") {
        let cleaned = rest.trimmingCharacters(in: CharacterSet(charactersIn: "[]"))
        currentTags = cleaned.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespaces).trimmingCharacters(in: CharacterSet(charactersIn: "\"'")) }
        inTags = false
      } else {
        inTags = true
      }
      inOptions = false
    } else if inOptions, let match = try? /^    ([A-Z]):\s*"(.*)"$/.firstMatch(in: line) {
      currentOptions[String(match.1)] = String(match.2)
    } else if inOptions, let match = try? /^    ([A-Z]):\s*(.+)$/.firstMatch(in: line) {
      currentOptions[String(match.1)] = String(match.2).trimmingCharacters(in: .whitespaces)
    } else if inTags, trimmed.hasPrefix("-") {
      currentTags.append(String(trimmed.dropFirst(1)).trimmingCharacters(in: .whitespaces).trimmingCharacters(in: CharacterSet(charactersIn: "\"'")))
    }
  }

  if inQuestion {
    questions.append(QuizQuestion(
      id: currentId, question: currentQ, options: currentOptions,
      answer: currentAnswer, explanation: currentExplanation,
      difficulty: currentDifficulty, tags: currentTags
    ))
  }

  return questions
}
