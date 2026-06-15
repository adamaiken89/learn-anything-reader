import SwiftUI

struct ReviewView: View {
  @Environment(CourseViewModel.self)
  private var viewModel
  let subject: Subject

  var body: some View {
    VStack(spacing: DesignConstants.Spacing.pageSection) {
      Text("Spaced Repetition Review")
        .font(DesignConstants.Font.title2)
        .fontWeight(.bold)

      Text("Coming soon: SM-2 spaced repetition cards for \(subject.displayName)")
        .foregroundStyle(AppColors.secondaryLabel)

      Button("Back") {
        viewModel.goBack()
      }
      .secondaryButton()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(VisualEffectBackground())
  }
}
