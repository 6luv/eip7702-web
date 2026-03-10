import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import useAuth from "../contexts/useAuth";

export default function PaymentPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("1.00");
  const [merchant, setMerchant] = useState("Demo Store");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!user?.email) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      const optionsRes = await fetch("/api/webauthn/authenticate/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      if (!optionsRes.ok) {
        const text = await optionsRes.text();
        console.error("authenticate options error", optionsRes.status, text);
        alert(`인증 옵션 요청 실패: ${optionsRes.status}`);
        return;
      }

      const options = await optionsRes.json();

      const credential = await startAuthentication({
        optionsJSON: options,
      });

      const verifyRes = await fetch("/api/webauthn/authenticate/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          credential,
          payment: {
            merchant,
            amount,
          },
        }),
      });

      if (!verifyRes.ok) {
        const text = await verifyRes.text();
        console.error("authenticate verify error", verifyRes.status, text);
        alert(`인증 검증 실패: ${verifyRes.status}`);
        return;
      }

      const verify = await verifyRes.json();

      if (verify.ok) {
        setMessage(`결제 승인 완료: ${merchant} / ${amount}`);
        alert("Touch ID 인증 완료, 결제가 승인되었습니다.");
      } else {
        setMessage("결제 승인 실패");
        alert("결제 승인 실패");
      }
    } catch (error) {
      console.error(error);
      alert("결제 인증 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-narrow">
      <Card title="결제">
        <div className="stack-sm">
          <p>로그인한 계정: {user?.email ?? "-"}</p>

          <label className="field">
            <span>상점명</span>
            <input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="input"
            />
          </label>

          <label className="field">
            <span>결제 금액</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
            />
          </label>

          <Button full onClick={handlePayment} disabled={isLoading}>
            {isLoading ? "인증 중..." : "Touch ID로 결제하기"}
          </Button>

          {message && <p>{message}</p>}
        </div>
      </Card>
    </div>
  );
}
