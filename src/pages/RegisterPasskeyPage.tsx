import { startRegistration } from "@simplewebauthn/browser";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import useAuth from "../contexts/useAuth";

export default function RegisterPasskeyPage() {
  const { user } = useAuth();

  const handleRegisterPasskey = async () => {
    if (!user?.email) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    try {
      const optionsRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
        }),
      });

      if (!optionsRes.ok) {
        const text = await optionsRes.text();
        console.error("options error", optionsRes.status, text);
        alert(`등록 옵션 요청 실패: ${optionsRes.status}`);
        return;
      }

      const options = await optionsRes.json();

      const credential = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          credential,
        }),
      });

      if (!verifyRes.ok) {
        const text = await verifyRes.text();
        console.error("verify error", verifyRes.status, text);
        alert(`등록 검증 실패: ${verifyRes.status}`);
        return;
      }

      const verify = await verifyRes.json();

      if (verify.ok) {
        alert("패스키 등록 완료");
      } else {
        alert("패스키 등록 실패");
      }
    } catch (error) {
      console.error(error);
      alert("패스키 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="page-narrow">
      <Card title="패스키 등록">
        <div className="stack-sm">
          <p>로그인한 계정: {user?.email ?? "-"}</p>
          <p>이 단계에서 맥 Touch ID로 패스키를 등록해.</p>

          <Button full onClick={handleRegisterPasskey}>
            Touch ID로 패스키 등록
          </Button>
        </div>
      </Card>
    </div>
  );
}
