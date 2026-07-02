import SwiftUI

struct InsuranceCategoryButton: View {
    let type: InsuranceType
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(type.color.opacity(0.12))
                        .frame(width: 56, height: 56)

                    Image(systemName: type.iconName)
                        .font(.system(size: 22, weight: .medium))
                        .foregroundColor(type.color)
                }

                Text(type.shortName)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.rixoTextPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(height: 32)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color.rixoCard)
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.05), radius: 6, x: 0, y: 2)
        }
    }
}

struct InsuranceCategoryGrid: View {
    let types: [InsuranceType]
    let onSelect: (InsuranceType) -> Void
    let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(types, id: \.self) { type in
                InsuranceCategoryButton(type: type) {
                    onSelect(type)
                }
            }
        }
    }
}

#Preview {
    ScrollView {
        InsuranceCategoryGrid(types: InsuranceType.allCases, onSelect: { _ in })
            .padding()
    }
    .background(Color.rixoBackground)
}
