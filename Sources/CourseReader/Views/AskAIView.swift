import SwiftUI

struct AskAIView: View {
  @Environment(CourseViewModel.self)
  private var viewModel
  let selectedText: String

  var body: some View {
    VStack(spacing: DesignConstants.Spacing.zero) {
      header
      Divider()
      content
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(VisualEffectBackground())
  }

  private var header: some View {
    HStack {
      Image(systemName: "sparkles")
        .foregroundStyle(Color.accentColor)
      Text("Ask AI")
        .font(.headline)
      Spacer()
    }
    .padding(DesignConstants.Padding.card)
  }

  private var content: some View {
    VStack(spacing: DesignConstants.Spacing.progressContent) {
      if !selectedText.isEmpty {
        highlightedContext
      }

      questionInput

      if viewModel.isAIThinking {
        loadingIndicator
      }

      if !viewModel.aiResponse.isEmpty {
        aiResponseView
      }

      if let error = viewModel.aiError {
        errorView(error)
      }

      if !viewModel.gemini.hasAPIKey {
        apiKeyMissingView
      }

      Spacer()
    }
    .padding(DesignConstants.Padding.card)
  }

  private var highlightedContext: some View {
    VStack(alignment: .leading, spacing: DesignConstants.Spacing.sectionHeader) {
      Text("Selected Text")
        .font(.caption)
        .foregroundStyle(AppColors.secondaryLabel)

      Text(selectedText)
        .font(.subheadline)
        .padding(DesignConstants.Padding.extraCompact)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppColors.highlightBg, in: RoundedRectangle(cornerRadius: 6))
    }
  }

  private var questionInput: some View {
    VStack(spacing: DesignConstants.Spacing.relatedContent) {
      TextField("Ask a question about the content...", text: Bindable(viewModel).aiQuestion)
        .textFieldStyle(.plain)
        .font(.body)
        .padding(DesignConstants.Padding.card)
        .background(AppColors.cardBg, in: RoundedRectangle(cornerRadius: 8))
        .overlay(
          RoundedRectangle(cornerRadius: 8)
            .stroke(Color(nsColor: .separatorColor), lineWidth: 1)
        )

      HStack {
        Spacer()
        Button("Ask") {
          viewModel.highlightedText = selectedText
          viewModel.askAI()
        }
        .primaryButton()
        .disabled(selectedText.isEmpty || viewModel.aiQuestion.isEmpty)
      }
    }
  }

  private var loadingIndicator: some View {
    HStack(spacing: DesignConstants.Spacing.relatedContent) {
      ProgressView()
        .scaleEffect(0.8)
      Text("Thinking...")
        .font(.subheadline)
        .foregroundStyle(AppColors.secondaryLabel)
    }
    .padding()
  }

  private var aiResponseView: some View {
    VStack(alignment: .leading, spacing: DesignConstants.Spacing.sectionHeader) {
      HStack {
        Image(systemName: "sparkles")
          .font(.caption)
          .foregroundStyle(Color.accentColor)
        Text("Response")
          .font(.caption)
          .foregroundStyle(AppColors.secondaryLabel)
      }

      ScrollView {
        Text(viewModel.aiResponse)
          .font(.subheadline)
          .textSelection(.enabled)
          .frame(maxWidth: .infinity, alignment: .leading)
      }
      .padding(DesignConstants.Padding.card)
      .background(AppColors.aiBubbleBg, in: RoundedRectangle(cornerRadius: 8))
    }
  }

  private func errorView(_ error: String) -> some View {
    HStack {
      Image(systemName: "exclamationmark.triangle.fill")
        .foregroundStyle(AppColors.incorrectRed)
      Text(error)
        .font(.caption)
        .foregroundStyle(AppColors.incorrectRed)
    }
    .padding(DesignConstants.Padding.card)
    .background(AppColors.incorrectRed.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
  }

  private var apiKeyMissingView: some View {
    VStack(spacing: DesignConstants.Spacing.relatedContent) {
      Image(systemName: "key.fill")
        .font(.title2)
        .foregroundStyle(AppColors.secondaryLabel)

      Text("Set your Gemini API key in Settings to use AI features")
        .font(.caption)
        .foregroundStyle(AppColors.secondaryLabel)
        .multilineTextAlignment(.center)
    }
    .padding()
    .frame(maxWidth: .infinity)
    .cardBackground()
  }
}
