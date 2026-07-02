import SwiftUI

struct DeadlineBadge: View {
    let deadline: Deadline
    var compact: Bool = false

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(deadline.urgencyColor.opacity(0.12))
                    .frame(width: 44, height: 44)
                Image(systemName: deadline.type.iconName)
                    .foregroundColor(deadline.urgencyColor)
                    .font(.system(size: 18))
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(deadline.name)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.rixoTextPrimary)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    Text(deadline.date.czechFormatted)
                        .font(.system(size: 12))
                        .foregroundColor(.rixoTextSecondary)

                    Text("•")
                        .foregroundColor(.rixoTextSecondary)
                        .font(.system(size: 10))

                    Text(deadline.urgencyLabel)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(deadline.urgencyColor)
                }
            }

            Spacer()

            if !compact {
                VStack(alignment: .trailing, spacing: 3) {
                    Text("\(deadline.daysRemaining)")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(deadline.urgencyColor)
                    Text("dní")
                        .font(.system(size: 11))
                        .foregroundColor(.rixoTextSecondary)
                }
                .frame(width: 44)
            }
        }
        .padding(12)
        .background(Color.rixoCard)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(deadline.urgencyColor.opacity(0.2), lineWidth: 1)
        )
    }
}

struct UrgentDeadlineAlert: View {
    let deadline: Deadline

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.rixoWarning)
                .font(.system(size: 20))

            VStack(alignment: .leading, spacing: 2) {
                Text(deadline.name)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.rixoTextPrimary)
                Text(deadline.urgencyLabel)
                    .font(.system(size: 12))
                    .foregroundColor(.rixoWarning)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundColor(.rixoTextSecondary)
                .font(.system(size: 12, weight: .semibold))
        }
        .padding(14)
        .background(Color(hex: "#FF9500").opacity(0.08))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(hex: "#FF9500").opacity(0.3), lineWidth: 1)
        )
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 12) {
            ForEach(Deadline.samples) { deadline in
                DeadlineBadge(deadline: deadline)
            }
            UrgentDeadlineAlert(deadline: Deadline.samples[0])
        }
        .padding()
    }
    .background(Color.rixoBackground)
}
