import SwiftUI

enum AppColors {
  static let accent = Color.accentColor
  static let secondaryLabel = Color.secondary
  static let titleText = Color.primary
  static let bodyText = Color.primary
  static let cardBg = Color(nsColor: .windowBackgroundColor).opacity(0.85)
  static let sectionBg = Color(nsColor: .windowBackgroundColor).opacity(0.8)
  static let rowBg = Color(nsColor: .controlBackgroundColor).opacity(0.4)
  static let badgeBg = Color(nsColor: .controlBackgroundColor).opacity(0.6)
  static let highlightBg = Color.yellow.opacity(0.3)
  static let correctGreen = Color.green
  static let incorrectRed = Color.red
  static let quizOptionBorder = Color(nsColor: .separatorColor)
  static let quizOptionSelected = Color.accentColor.opacity(0.15)
  static let quizOptionHover = Color.accentColor.opacity(0.06)
  static let aiBubbleBg = Color(nsColor: .controlBackgroundColor).opacity(0.7)
  static let aiUserBubble = Color.accentColor.opacity(0.12)
}
