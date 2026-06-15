import SwiftUI

struct ModuleListView: View {
  @Environment(CourseViewModel.self)
  private var viewModel
  let subject: Subject

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: DesignConstants.Spacing.pageSection) {
        header
        moduleList
      }
      .padding(DesignConstants.Padding.group)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  private var header: some View {
    VStack(alignment: .leading, spacing: DesignConstants.Spacing.relatedContent) {
      Text(subject.displayName)
        .font(DesignConstants.Font.title)
        .fontWeight(.bold)

      if !subject.learningObjectives.isEmpty {
        VStack(alignment: .leading, spacing: DesignConstants.Spacing.labelPair) {
          Text("Learning Objectives")
            .font(.subheadline)
            .foregroundStyle(AppColors.secondaryLabel)

          ForEach(subject.learningObjectives, id: \.self) { obj in
            HStack(alignment: .top, spacing: DesignConstants.Spacing.relatedContent) {
              Image(systemName: "checkmark.circle.fill")
                .font(.caption)
                .foregroundStyle(Color.accentColor)
              Text(obj)
                .font(.caption)
                .foregroundStyle(AppColors.secondaryLabel)
            }
          }
        }
        .padding(.top, DesignConstants.Padding.extraCompact)
      }
    }
  }

  private var moduleList: some View {
    LazyVStack(spacing: DesignConstants.Spacing.relatedContent) {
      ForEach(subject.modules) { module in
        ModuleRowView(module: module)
          .onTapGesture {
            viewModel.selectModule(module)
          }
      }
    }
  }
}

struct ModuleRowView: View {
  let module: ModuleMeta

  var body: some View {
    HStack(spacing: DesignConstants.Spacing.sectionGroup) {
      VStack(alignment: .leading, spacing: DesignConstants.Spacing.sectionHeader) {
        HStack(spacing: DesignConstants.Spacing.relatedContent) {
          Text("Module \(module.id)")
            .font(.caption)
            .foregroundStyle(Color.accentColor)
            .fontWeight(.semibold)

          if !module.topics.isEmpty {
            ForEach(module.topics.prefix(3), id: \.self) { topic in
              Text(topic)
                .font(.caption2)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .badgeBackground()
            }
          }
        }

        Text(module.name)
          .font(.headline)
          .fontWeight(.medium)
      }

      Spacer()

      HStack(spacing: DesignConstants.Spacing.labelPair) {
        Image(systemName: "clock")
          .font(.caption)
          .foregroundStyle(AppColors.secondaryLabel)
        Text(String(format: "%.1fh", module.timeHours))
          .font(.caption)
          .foregroundStyle(AppColors.secondaryLabel)
      }

      Image(systemName: "chevron.right")
        .font(.caption)
        .foregroundStyle(AppColors.secondaryLabel)
    }
    .padding(DesignConstants.Padding.card)
    .cardBackground()
  }
}
