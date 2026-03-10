import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import useAuth from "../contexts/useAuth";

export default function HomePage() {
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <div className="stack">
      <section className="hero">
        <p className="hero-badge">EIP-7702 Payment Demo</p>
        <h1>Touch ID로 결제 승인하는 웹앱</h1>
      </section>

      <div className="grid-2">
        <Card title="현재 상태">
          <div className="status-list">
            <div>로그인: {isLoggedIn ? "완료" : "미완료"}</div>
            <div>이름: {user?.name ?? "-"}</div>
            <div>이메일: {user?.email ?? "-"}</div>
          </div>

          {isLoggedIn && (
            <div style={{ marginTop: 16 }}>
              <Button onClick={logout}>로그아웃</Button>
            </div>
          )}
        </Card>

        <Card title="빠른 이동">
          <div className="stack-sm">
            <Link to="/login">
              <Button full>로그인 하러 가기</Button>
            </Link>
            <Link to="/register-passkey">
              <Button full>패스키 등록하기</Button>
            </Link>
            <Link to="/payment">
              <Button full>결제 테스트</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
