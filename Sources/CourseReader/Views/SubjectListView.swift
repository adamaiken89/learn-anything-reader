import SwiftUI

struct SubjectListView: View {
  @Environment(CourseViewModel.self)
  private var viewModel

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: DesignConstants.Spacing.pageSection) {
        header
        subjectGrid
      }
      .padding(DesignConstants.Padding.group)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  private var header: some View {
    VStack(alignment: .leading, spacing: DesignConstants.Spacing.relatedContent) {
      Text(loc("Course Reader"))
        .font(DesignConstants.Font.title)
        .fontWeight(.bold)

      Text(loc("Select a subject to begin studying"))
        .font(DesignConstants.Font.subheadline)
        .foregroundStyle(AppColors.secondaryLabel)
    }
    .padding(.bottom, DesignConstants.Padding.section)
  }

  private var subjectGrid: some View {
    LazyVGrid(
      columns: [GridItem(.adaptive(minimum: 280, maximum: 400), spacing: 16)],
      spacing: 16
    ) {
      ForEach(viewModel.subjects) { subject in
        SubjectCardView(subject: subject)
          .onTapGesture {
            viewModel.selectSubject(subject)
          }
      }
    }
  }
}

struct SubjectCardView: View {
  let subject: Subject

  var body: some View {
    VStack(alignment: .leading, spacing: DesignConstants.Spacing.sectionHeader) {
      HStack {
        Image(systemName: iconName)
          .font(.title2)
          .foregroundStyle(Color.accentColor)

        Spacer()

        Text(subject.targetLevel.capitalized)
          .font(.caption)
          .padding(.horizontal, 8)
          .padding(.vertical, 3)
          .badgeBackground()
      }

      Text(subject.displayName)
        .font(.headline)
        .fontWeight(.semibold)
        .lineLimit(2)

      if !subject.learningObjectives.isEmpty {
        Text(subject.learningObjectives[0])
          .font(.caption)
          .foregroundStyle(AppColors.secondaryLabel)
          .lineLimit(2)
      }

      HStack(spacing: DesignConstants.Spacing.relatedContent) {
        Label("\(subject.modules.count) modules", systemImage: "book")
          .font(.caption)
          .foregroundStyle(AppColors.secondaryLabel)

        Label("\(subject.timeBudgetHours)h", systemImage: "clock")
          .font(.caption)
          .foregroundStyle(AppColors.secondaryLabel)
      }
    }
    .padding(DesignConstants.Padding.card)
    .cardBackground()
    .overlay(
      RoundedRectangle(cornerRadius: 10)
        .stroke(Color(nsColor: .separatorColor).opacity(0.3), lineWidth: 1)
    )
  }

  private var iconName: String {
    switch subject.domain {
    case "finance": return "dollarsign.circle"
    case "programming", "computer-science": return "chevron.left.forwardslash.chevron.right"
    case "science": return "flask"
    case "language": return "textformat"
    case "mathematics": return "function"
    default: return "book"
    }
  }
}
