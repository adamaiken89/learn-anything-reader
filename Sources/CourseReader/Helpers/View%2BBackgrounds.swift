import SwiftUI

extension View {
  func cardBackground(cornerRadius: CGFloat = 10) -> some View {
    self.background(
      AppColors.cardBg,
      in: RoundedRectangle(cornerRadius: cornerRadius)
    )
  }

  func sectionBackground(cornerRadius: CGFloat = 12) -> some View {
    self.background(
      AppColors.sectionBg,
      in: RoundedRectangle(cornerRadius: cornerRadius)
    )
  }

  func rowBackground(cornerRadius: CGFloat = 6) -> some View {
    self.background(
      AppColors.rowBg,
      in: RoundedRectangle(cornerRadius: cornerRadius)
    )
  }

  func badgeBackground() -> some View {
    self.background(
      AppColors.badgeBg,
      in: Capsule()
    )
  }
}
