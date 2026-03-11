import { Box, Text } from "@chakra-ui/react";
import Card from "../components/common/Card";

export default function SettingsPage() {
  return (
    <Box className="page-narrow">
      <Card title="설정">
        <Text>
          나중에 네트워크, 스마트 계정 주소, 세션 상태를 보여줄 페이지
        </Text>
      </Card>
    </Box>
  );
}
