import SwiftUI

struct DeadlineMonitorView: View {
    @EnvironmentObject var deadlineService: DeadlineService
    @Environment(\.dismiss) var dismiss
    @State private var showAddDeadline: Bool = false
    @State private var newDeadlineName: String = ""
    @State private var newDeadlineDate: Date = Date()
    @State private var newDeadlineType: DeadlineType = .other

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Summary banner
                    if !deadlineService.urgentDeadlines.isEmpty {
                        urgentBanner
                    }

                    // Deadlines list
                    VStack(spacing: 10) {
                        ForEach(deadlineService.upcomingDeadlines) { deadline in
                            DeadlineBadge(deadline: deadline)
                                .swipeActions(edge: .trailing) {
                                    Button(role: .destructive) {
                                        deadlineService.removeDeadline(id: deadline.id)
                                    } label: {
                                        Label("Smazat", systemImage: "trash")
                                    }

                                    Button {
                                        deadlineService.toggleNotification(id: deadline.id)
                                    } label: {
                                        Label(
                                            deadline.notificationsEnabled ? "Vypnout" : "Zapnout",
                                            systemImage: deadline.notificationsEnabled ? "bell.slash" : "bell"
                                        )
                                    }
                                    .tint(.rixoOrange)
                                }
                        }
                    }
                    .padding(.horizontal, 20)

                    if deadlineService.deadlines.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "calendar.badge.checkmark")
                                .font(.system(size: 40))
                                .foregroundColor(.rixoSuccess)
                            Text("Žádné nadcházející termíny")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.rixoTextSecondary)
                        }
                        .padding(40)
                    }

                    // Add deadline button
                    Button(action: { showAddDeadline = true }) {
                        HStack(spacing: 10) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.rixoOrange)
                            Text("Přidat termín")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(.rixoOrange)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Color.rixoOrange.opacity(0.08))
                        .cornerRadius(14)
                    }
                    .padding(.horizontal, 20)

                    // Legend
                    legendView
                }
                .padding(.vertical, 16)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Hlídač termínů")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Hotovo") { dismiss() }
                        .foregroundColor(.rixoOrange)
                }
            }
            .sheet(isPresented: $showAddDeadline) {
                AddDeadlineSheet(deadlineService: deadlineService)
            }
        }
    }

    private var urgentBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 20))
                .foregroundColor(.rixoWarning)

            VStack(alignment: .leading, spacing: 2) {
                Text("\(deadlineService.urgentDeadlines.count) termín(ů) vyžaduje pozornost")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.rixoTextPrimary)
                Text("Zkontrolujte blížící se termíny")
                    .font(.system(size: 12))
                    .foregroundColor(.rixoTextSecondary)
            }

            Spacer()
        }
        .padding(16)
        .background(Color.rixoWarning.opacity(0.08))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.rixoWarning.opacity(0.3), lineWidth: 1)
        )
        .padding(.horizontal, 20)
    }

    private var legendView: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Barevné označení")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.rixoTextSecondary)

            HStack(spacing: 16) {
                LegendItem(color: .rixoSuccess, label: "Více než 30 dní")
                LegendItem(color: .rixoWarning, label: "10–30 dní")
                LegendItem(color: .rixoDanger, label: "Méně než 10 dní")
            }
        }
        .padding(16)
        .background(Color.rixoCard)
        .cornerRadius(12)
        .padding(.horizontal, 20)
    }
}

struct LegendItem: View {
    let color: Color
    let label: String

    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(color)
                .frame(width: 10, height: 10)
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.rixoTextSecondary)
        }
    }
}

struct AddDeadlineSheet: View {
    let deadlineService: DeadlineService
    @Environment(\.dismiss) var dismiss
    @State private var name: String = ""
    @State private var type: DeadlineType = .other
    @State private var date: Date = Calendar.current.date(byAdding: .month, value: 1, to: Date())!
    @State private var notifications: Bool = true

    var body: some View {
        NavigationStack {
            Form {
                Section("Název termínu") {
                    TextField("Název", text: $name)
                }

                Section("Typ") {
                    Picker("Typ", selection: $type) {
                        ForEach([DeadlineType.stk, .vignette, .payment, .other], id: \.self) { t in
                            Text(t.displayName).tag(t)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Datum") {
                    DatePicker("Datum", selection: $date, displayedComponents: .date)
                        .environment(\.locale, Locale(identifier: "cs_CZ"))
                }

                Section {
                    Toggle("Upozornění", isOn: $notifications)
                }
            }
            .navigationTitle("Nový termín")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Zrušit") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Přidat") {
                        guard !name.isEmpty else { return }
                        deadlineService.addDeadline(name: name, type: type, date: date)
                        dismiss()
                    }
                    .foregroundColor(.rixoOrange)
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}

#Preview {
    DeadlineMonitorView()
        .environmentObject(DeadlineService())
}
