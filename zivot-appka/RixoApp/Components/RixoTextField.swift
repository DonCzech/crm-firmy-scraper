import SwiftUI

struct RixoTextField: View {
    let placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default
    var isSecure: Bool = false
    var icon: String? = nil
    var errorMessage: String? = nil
    var isRequired: Bool = false
    var autocapitalization: TextInputAutocapitalization = .sentences

    @State private var isSecureVisible: Bool = false
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 10) {
                if let icon = icon {
                    Image(systemName: icon)
                        .foregroundColor(isFocused ? .rixoOrange : .rixoTextSecondary)
                        .font(.system(size: 16))
                        .frame(width: 20)
                }

                ZStack(alignment: .leading) {
                    if text.isEmpty {
                        Text(placeholder + (isRequired ? " *" : ""))
                            .foregroundColor(.rixoTextSecondary)
                            .font(.system(size: 15))
                    }

                    if isSecure && !isSecureVisible {
                        SecureField("", text: $text)
                            .focused($isFocused)
                            .keyboardType(keyboardType)
                            .autocorrectionDisabled()
                            .textInputAutocapitalization(.never)
                            .font(.system(size: 15))
                            .foregroundColor(.rixoTextPrimary)
                    } else {
                        TextField("", text: $text)
                            .focused($isFocused)
                            .keyboardType(keyboardType)
                            .autocorrectionDisabled(isSecure)
                            .textInputAutocapitalization(isSecure ? .never : autocapitalization)
                            .font(.system(size: 15))
                            .foregroundColor(.rixoTextPrimary)
                    }
                }

                if isSecure {
                    Button(action: { isSecureVisible.toggle() }) {
                        Image(systemName: isSecureVisible ? "eye.slash.fill" : "eye.fill")
                            .foregroundColor(.rixoTextSecondary)
                            .font(.system(size: 15))
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(Color.rixoCard)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        errorMessage != nil ? Color.rixoDanger :
                            (isFocused ? Color.rixoOrange : Color.gray.opacity(0.2)),
                        lineWidth: isFocused || errorMessage != nil ? 2 : 1
                    )
            )

            if let error = errorMessage {
                Text(error)
                    .font(.system(size: 12))
                    .foregroundColor(.rixoDanger)
                    .padding(.horizontal, 4)
            }
        }
    }
}

struct RixoTextArea: View {
    let placeholder: String
    @Binding var text: String
    var minHeight: CGFloat = 100

    @FocusState private var isFocused: Bool

    var body: some View {
        ZStack(alignment: .topLeading) {
            if text.isEmpty {
                Text(placeholder)
                    .foregroundColor(.rixoTextSecondary)
                    .font(.system(size: 15))
                    .padding(.horizontal, 16)
                    .padding(.top, 14)
            }

            TextEditor(text: $text)
                .focused($isFocused)
                .font(.system(size: 15))
                .foregroundColor(.rixoTextPrimary)
                .padding(.horizontal, 12)
                .padding(.top, 10)
                .frame(minHeight: minHeight)
        }
        .background(Color.rixoCard)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(
                    isFocused ? Color.rixoOrange : Color.gray.opacity(0.2),
                    lineWidth: isFocused ? 2 : 1
                )
        )
    }
}

#Preview {
    VStack(spacing: 16) {
        RixoTextField(placeholder: "Email", text: .constant(""), icon: "envelope.fill", isRequired: true)
        RixoTextField(placeholder: "Heslo", text: .constant(""), icon: "lock.fill", isSecure: true)
        RixoTextField(placeholder: "Telefon", text: .constant("+420"), keyboardType: .phonePad, icon: "phone.fill")
        RixoTextField(placeholder: "Email", text: .constant(""), errorMessage: "Neplatný email", isRequired: true)
    }
    .padding()
    .background(Color.rixoBackground)
}
