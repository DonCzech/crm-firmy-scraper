import SwiftUI

struct SignaturePadView: View {
    @Binding var paths: [Path]
    @State private var currentPath = Path()
    @State private var isDrawing: Bool = false
    var onChanged: (() -> Void)? = nil

    var hasSignature: Bool {
        !paths.isEmpty
    }

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1.5, style: StrokeStyle(dash: [6, 4]))
                    )

                if !hasSignature {
                    VStack(spacing: 8) {
                        Image(systemName: "signature")
                            .font(.system(size: 32))
                            .foregroundColor(.gray.opacity(0.3))
                        Text("Podepište se prstem")
                            .font(.system(size: 14))
                            .foregroundColor(.gray.opacity(0.5))
                    }
                }

                // Draw existing paths
                ForEach(0..<paths.count, id: \.self) { index in
                    paths[index]
                        .stroke(Color.rixoNavy, style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
                }

                // Draw current path
                currentPath
                    .stroke(Color.rixoNavy, style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
            }
            .frame(height: 160)
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        let point = value.location
                        if !isDrawing {
                            currentPath = Path()
                            currentPath.move(to: point)
                            isDrawing = true
                        } else {
                            currentPath.addLine(to: point)
                        }
                    }
                    .onEnded { _ in
                        paths.append(currentPath)
                        currentPath = Path()
                        isDrawing = false
                        onChanged?()
                    }
            )

            HStack {
                Text("Váš podpis")
                    .font(.system(size: 12))
                    .foregroundColor(.rixoTextSecondary)
                Spacer()
                if hasSignature {
                    Button(action: clearSignature) {
                        Label("Vymazat", systemImage: "trash")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.rixoDanger)
                    }
                }
            }
        }
    }

    func clearSignature() {
        paths.removeAll()
        currentPath = Path()
    }
}

#Preview {
    struct Preview: View {
        @State private var paths: [Path] = []
        var body: some View {
            SignaturePadView(paths: $paths)
                .padding()
        }
    }
    return Preview()
}
