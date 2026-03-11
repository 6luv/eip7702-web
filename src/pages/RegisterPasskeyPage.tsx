import { startRegistration } from "@simplewebauthn/browser";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import Button from "../components/common/Button";
import { useWallet } from "../contexts/useWallet";

export default function RegisterPasskeyPage() {
  const { account, isConnected } = useWallet();

  const handleRegisterPasskey = async () => {
    if (!isConnected || !account) {
      alert("먼저 지갑을 연결해 주세요.");
      return;
    }

    try {
      const optionsRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: account,
        }),
      });

      if (!optionsRes.ok) {
        const text = await optionsRes.text();
        console.error("register options error", optionsRes.status, text);
        alert(`등록 옵션 요청 실패: ${optionsRes.status}`);
        return;
      }

      const options = await optionsRes.json();

      const credential = await startRegistration({
        optionsJSON: options,
      });

      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: account,
          credential,
        }),
      });

      if (!verifyRes.ok) {
        const text = await verifyRes.text();
        console.error("register verify error", verifyRes.status, text);
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
    <Box className="page-narrow">
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="2xl"
        p={6}
        boxShadow="sm"
      >
        <VStack align="stretch" gap={4}>
          <Heading size="md">패스키 등록</Heading>

          <Text fontSize="sm" color="gray.500">
            연결된 지갑
          </Text>
          <Text fontSize="sm" wordBreak="break-all">
            {account ?? "-"}
          </Text>

          <Text fontSize="sm" color="gray.600">
            이 단계에서 Touch ID로 패스키를 등록합니다.
          </Text>

          <Button full onClick={handleRegisterPasskey} disabled={!isConnected}>
            Touch ID로 패스키 등록
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
