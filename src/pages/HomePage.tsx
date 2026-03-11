import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useWallet } from "../contexts/useWallet";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function HomePage() {
  const {
    account,
    chainId,
    isConnected,
    message,
    balance,
    symbol,
    connect,
    terminate,
  } = useWallet();

  return (
    <Box className="stack">
      <Box as="section" className="hero">
        <Text className="hero-badge">EIP-7702 Payment Demo</Text>
        <Heading as="h1" className="hero-title">
          Touch ID로 결제 승인하는 웹앱
        </Heading>
      </Box>

      <Box className="grid-2">
        <Card title="현재 상태">
          <Box className="status-list">
            <Text>지갑 연결: {isConnected ? "완료" : "미완료"}</Text>
            <Text wordBreak="break-all">지갑 주소: {account ?? "-"}</Text>
            <Text>체인 ID: {chainId ?? "-"}</Text>
            <Text>
              토큰 수량: {balance ?? "-"} {symbol ?? ""}
            </Text>
            <Text>상태: {message ?? "-"}</Text>
          </Box>
        </Card>

        <Card title="빠른 이동">
          <Box className="stack-sm">
            {!isConnected ? (
              <Button full onClick={connect}>
                지갑 연결
              </Button>
            ) : (
              <Button full onClick={terminate}>
                지갑 연결 해제
              </Button>
            )}

            <Link to="/register-passkey">
              <Button full disabled={!isConnected}>
                패스키 등록하기
              </Button>
            </Link>

            <Link to="/payment">
              <Button full disabled={!isConnected}>
                결제 테스트
              </Button>
            </Link>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
