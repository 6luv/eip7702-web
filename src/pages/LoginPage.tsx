import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import useAuth from "../contexts/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleLogin = (user: {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
    credential: string;
  }) => {
    console.log("google user: ", user);
    login(user);
    navigate("/register-passkey");
  };

  const handleAppleLogin = () => {
    alert("여기에 나중에 Apple 로그인 연결");
  };

  return (
    <div className="page-narrow">
      <Card title="로그인">
        <div className="stack-sm">
          <p>
            로그인은 서비스 계정을 만들기 위한 단계이고, 실제 결제 승인은
            패스키와 Touch ID로 처리합니다.
          </p>

          <GoogleLoginButton onLogin={handleGoogleLogin} />
          <Button full onClick={handleAppleLogin}>
            Apple로 시작하기
          </Button>
        </div>
      </Card>
    </div>
  );
}
