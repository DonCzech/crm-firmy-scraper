import { Navigate, Route, Routes } from 'react-router-dom';
import { SignInPage } from './sign-in-page';

export default function AuthModule() {
  return (
    <Routes>
      <Route index element={<Navigate to="sign-in" replace />} />
      <Route path="sign-in" element={<SignInPage />} />
      <Route path="*" element={<Navigate to="sign-in" replace />} />
    </Routes>
  );
}
