Next.js(App Router) + React + TypeScript + Tailwind CSS 기반으로 MaskPlay라는 웹 미니게임 서비스를 만들어줘.

MaskPlay는 업무용 프로그램처럼 보이는 UI 스킨을 입힌 웹 미니게임 서비스다.
초기 MVP는 오목 게임 1종만 구현하고, 전체 UI는 Terminal/CMD 스타일로 만들어줘.

요구사항은 아래와 같다.

[프로젝트 목표]
- 홈 페이지, 오목 준비 페이지, 오목 플레이 페이지, 결과 페이지를 만든다.
- 오목 게임 로직(보드 생성, 돌 놓기, 턴 변경, 승리 판정, 무승부 판정)을 구현한다.
- 게임 로직과 UI를 분리한다.
- 이후 지뢰찾기, Excel 스타일 스킨 등을 쉽게 추가할 수 있도록 확장 가능한 구조로 설계한다.

[기술 스택]
- Next.js App Router
- React
- TypeScript
- Tailwind CSS

[페이지]
1. 홈 페이지 (/)
- 서비스명 MaskPlay 표시
- 간단한 소개 문구
- 오목 게임 시작 버튼

2. 오목 준비 페이지 (/games/omok/setup)
- 난이도 선택 (easy / normal / hard)
- 플레이어 돌 색상 선택 (black / white)
- 선공 선택 (black / white)
- 게임 시작 버튼

3. 오목 플레이 페이지 (/games/omok/play)
- 15x15 오목 보드 렌더링
- 클릭 시 돌 놓기
- 현재 턴 표시
- 재시작 버튼
- 홈 이동 버튼
- 승리 또는 무승부 발생 시 결과 페이지로 이동

4. 결과 페이지 (/games/omok/result)
- 승리 / 패배 / 무승부 메시지 표시
- 다시하기 버튼
- 설정으로 돌아가기 버튼
- 홈으로 이동 버튼

[오목 규칙]
- 빈 칸만 클릭 가능
- 흑/백 턴이 번갈아 진행
- 가로, 세로, 대각선 양방향 검사로 5개 이상 연속이면 승리
- 보드가 다 찼고 승자가 없으면 무승부
- 게임 종료 후 추가 클릭 불가

[UI 요구사항]
- Terminal/CMD 느낌의 다크 테마
- 검은색 또는 어두운 배경
- 초록색/흰색 텍스트
- 모노스페이스 느낌
- 과한 게임풍 디자인 금지
- 생산성 프로그램처럼 보이는 패널 중심 레이아웃

[구조 요구사항]
- UI 컴포넌트 / 게임 기능 / 유틸 로직을 분리
- 예: components, features/omok, hooks, utils, types
- 오목 로직은 순수 함수로 분리
- 예: createBoard, placeStone, checkWinner, isBoardFull, useOmokGame

[타입 예시]
- Stone = "black" | "white" | null
- Board = Stone[][]
- Turn = "black" | "white"
- GameResult = "black-win" | "white-win" | "draw" | "playing"

[원하는 결과]
1. 폴더 구조 제안
2. 필요한 파일 목록 제시
3. 각 파일의 코드 작성
4. 핵심 로직 설명
5. 실행 방법 설명

처음부터 너무 많은 부가 기능을 넣지 말고, 프론트엔드 단독 MVP로 완성해줘.
코드는 가독성 좋게 작성하고, 확장 가능한 구조를 우선해줘.
