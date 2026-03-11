import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Box, Heading, Input, Text, VStack } from "@chakra-ui/react";
import Button from "../components/common/Button";
import { useWallet } from "../contexts/useWallet";

export default function PaymentPage() {
  const { account, isConnected, balance, symbol } = useWallet();

  const [amount, setAmount] = useState("1.00");
  const [merchant, setMerchant] = useState("Demo Store");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!isConnected || !account) {
      alert("지갑을 연결해 주세요.");
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
          account,
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
          account,
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
        setMessage(`결제 승인 완료: ${merchant} / ${amount} ${symbol ?? ""}`);
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
    <Box maxW="560px" mx="auto">
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="2xl"
        p={6}
        boxShadow="sm"
      >
        <VStack align="stretch" gap={5}>
          <Heading size="lg">결제</Heading>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={1}>
              연결된 지갑
            </Text>
            <Text fontSize="sm" wordBreak="break-all">
              {account ?? "-"}
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={1}>
              보유 잔액
            </Text>
            <Text fontSize="sm">
              {balance ?? "-"} {symbol ?? ""}
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              상점명
            </Text>
            <Input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="상점명을 입력하세요"
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              결제 금액
            </Text>

            <Box position="relative">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="금액을 입력하세요"
                pr="4.5rem"
              />
              <Text
                position="absolute"
                right="12px"
                top="50%"
                transform="translateY(-50%)"
                fontSize="sm"
                color="gray.500"
                pointerEvents="none"
              >
                {symbol ?? ""}
              </Text>
            </Box>
          </Box>

          <Button
            full
            onClick={handlePayment}
            disabled={isLoading || !isConnected}
          >
            {isLoading ? "인증 중..." : "Touch ID로 결제하기"}
          </Button>

          {message && (
            <Text fontSize="sm" color="green.600">
              {message}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
