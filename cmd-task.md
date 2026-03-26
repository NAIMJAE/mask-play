MaskPlay CMD 몰입형 UX 개선 개발 지시서
1. 목표

현재 MaskPlay의 CMD 스킨은 겉모습은 CMD처럼 보이지만, 사용감은 아직 웹 UI에 가깝다.
이 프로젝트의 목표는 단순히 검은 배경과 흰 글씨를 사용하는 것이 아니라,
사용자가 실제 CMD 프로그램을 실행하는 것처럼 느끼게 만드는 것이다.

즉, 이 작업의 핵심은:

CMD처럼 보이는 화면 만들기
CMD처럼 입력하고 조작하게 만들기
CMD처럼 반응하고 에러를 보여주기
CMD처럼 로그가 쌓이게 만들기

이다.

중요:
단순한 체크박스/버튼 UI를 CMD처럼 꾸미는 것이 아니라,
상호작용 방식 자체를 콘솔 방식으로 바꾸는 것이 목표이다.

2. 핵심 방향

현재 UI는 아래와 같은 한계가 있다.

옵션 선택이 체크박스처럼 보임
사용자가 클릭해서 설정하는 웹 폼 느낌이 강함
CMD 테마이지만 실제 콘솔 프로그램을 다루는 느낌이 약함

이걸 아래 방향으로 바꿔야 한다.

바꿔야 할 방향
클릭 중심 UI → 명령어 입력 중심 UI
설정창 느낌 → 콘솔 프로그램 실행 느낌
정적인 화면 → 로그가 누적되는 화면
단순 옵션 표시 → 명령 실행 결과 출력
웹 폼 상호작용 → CLI 상호작용
3. 가장 중요한 변경 사항
3-1. 체크박스형 설정 UI 제거

현재와 같은:

[ ] easy [x] normal [ ] hard
[x] black [ ] white

형태는 너무 웹 UI에 가깝다.

이 부분은 제거하거나 최소화하고,
대신 명령어 기반 설정 방식으로 바꿔야 한다.

예시:

C:\mask_play\cmd> set difficulty normal
Difficulty set to NORMAL.

C:\mask_play\cmd> set stone black
Player stone set to BLACK.

C:\mask_play\cmd> set first black
First move set to BLACK.
3-2. 하단 입력 프롬프트 중심 구조 도입

화면의 중심은 카드나 버튼이 아니라
하단 명령 입력 프롬프트여야 한다.

형태 예시:

C:\mask_play\cmd>

사용자는 여기서 직접 명령을 입력하고,
엔터를 누르면 화면 위쪽 로그 영역에 결과가 누적되어야 한다.

3-3. 로그 누적형 콘솔 화면 구성

CMD처럼 느껴지게 하려면
입력한 명령과 결과가 위에서 아래로 로그처럼 계속 쌓여야 한다.

예시:

C:\mask_play\cmd> help

Available commands:
- set difficulty [easy|normal|hard]
- set stone [black|white]
- set first [black|white]
- status
- run
- clear
- exit

C:\mask_play\cmd> set difficulty hard
Difficulty set to HARD.

즉, 사용자는 페이지를 보는 것이 아니라
콘솔 세션을 진행하는 느낌을 받아야 한다.

4. setup 페이지를 “설치 마법사”처럼 만들기

setup 페이지는 일반 설정 화면이 아니라
콘솔 기반 설치/설정 마법사 프로그램처럼 구성한다.

예시 흐름:

Microsoft Windows [Version 10.0.26200.7840]
(c) Microsoft Corporation. All rights reserved.

C:\Users\dev> cd workspace\mask_play
C:\Users\dev\workspace\mask_play> maskplay --skin cmd --game omok

Initializing MaskPlay Runtime...
Loading omok module .......... OK
Loading cmd skin ............. OK
Checking terminal state ...... OK
Mounting game setup .......... OK

MaskPlay CMD Setup Wizard ready.
Type 'help' to begin.

이후 사용자는 명령어를 입력해 설정을 진행한다.

5. setup 페이지에서 지원해야 할 명령어

다음 명령어들을 기본 지원한다.

필수 명령어
help
set difficulty easy
set difficulty normal
set difficulty hard
set stone black
set stone white
set first black
set first white
status
run
clear
exit
동작 설명
help

사용 가능한 명령어 목록 출력

set difficulty ...

난이도 설정

set stone ...

플레이어 돌 색상 설정

set first ...

선공/후공 설정

status

현재 설정 상태 출력

run

현재 설정으로 게임 시작

clear

로그 영역 지우기

exit

홈 또는 이전 화면으로 이동

6. 잘못된 입력에 대한 에러 처리

CMD 느낌을 살리려면
잘못된 입력에 대해 건조하고 시스템적인 에러 메시지를 출력해야 한다.

예시:

C:\mask_play\cmd> set difficult normal
'difficult' is not recognized as a valid configuration key.
Type 'help' to see available commands.
C:\mask_play\cmd> set stone blue
Invalid value for 'stone'.
Allowed values: black, white
C:\mask_play\cmd> start
'start' is not recognized as an internal MaskPlay command.
Type 'help' to see available commands.

중요:
에러 처리는 단순 alert가 아니라,
반드시 콘솔 로그에 출력되는 방식이어야 한다.

7. 키보드 중심 UX로 바꾸기

CMD 몰입감을 위해 마우스보다 키보드 중심 상호작용을 우선한다.

필수 키보드 UX
Enter: 명령 실행
ArrowUp: 이전 명령 히스토리 불러오기
ArrowDown: 다음 명령 히스토리 이동
Tab: 가능한 경우 자동완성 흉내
입력창은 항상 포커스를 유지

즉 사용자가 페이지 여기저기 클릭하지 않고,
하단 프롬프트만 계속 사용하는 구조로 만든다.

8. “가짜 시스템 명령” 추가

재미와 몰입감을 위해 실제 설정 외에도
분위기를 살리는 콘솔 명령어를 일부 추가한다.

추천 명령어
ver
dir
whoami
cls
help
status
run
exit
예시 응답
C:\mask_play\cmd> ver
MaskPlay CMD Runtime Version 0.1.2
C:\mask_play\cmd> whoami
maskplay-user
C:\mask_play\cmd> dir

 Directory of C:\mask_play\cmd

omok.exe
skin.cmd
config.sys
runtime.dll

이런 명령은 기능적으로 필수는 아니지만
서비스의 개성과 몰입감을 크게 올린다.

9. 플레이 페이지도 CMD처럼 느껴지게 개선

플레이 페이지도 단순히 보드만 보여주는 것이 아니라
콘솔 기반 전략 프로그램처럼 보이게 만들어야 한다.

플레이 페이지 요구사항
상단에 현재 세션 정보 출력
CPU가 생각할 때 로그 메시지 출력
현재 턴 정보가 상태줄처럼 출력
재시작 / 종료도 버튼보다는 명령 느낌으로 노출

예시:

MaskPlay Omok Engine v0.1.2
Session: ACTIVE
Difficulty: NORMAL
Player: BLACK
CPU: WHITE
10. CPU 행동도 로그처럼 보이게 만들기

CPU가 단순히 바로 수를 두는 것보다
분석 로그를 짧게 출력한 후 수를 두는 방식이 더 몰입감 있다.

예시:

CPU analyzing board...
Threat detected near H8.
Evaluating candidate moves...
CPU moved to J10.

또는

AI depth: 4
Top candidate: J10
Defense priority: HIGH
CPU moved to J10.

이 기능은 실제 AI 성능과 별개로
사용자에게 “계산 중인 프로그램” 느낌을 준다.

11. 플레이 방식 확장 아이디어

추가 옵션으로 Command Mode를 넣는다.

기본 모드
사용자는 보드를 클릭해서 수를 둔다
Command Mode
사용자는 좌표를 입력해서 수를 둔다

예시:

C:\mask_play\omok> move H8
Player moved to H8.

또는

Input move > H8

이 기능은 선택형으로 제공한다.
기본은 클릭 기반으로 유지하고,
CMD 몰입을 극대화하고 싶은 사용자만 Command Mode를 사용할 수 있게 한다.

12. 결과 페이지도 콘솔 리포트 형식으로 구성

결과 페이지는 일반 게임 결과 화면이 아니라
세션 종료 리포트처럼 보여야 한다.

예시:

Match completed.
--------------------------------
Result          : WIN
Player stone    : BLACK
Total turns     : 43
CPU difficulty  : NORMAL
Session status  : CLOSED

Type 'restart' to play again.
Type 'setup' to reconfigure.
Type 'exit' to return home.

즉 결과도 UI 카드가 아니라
프로그램 결과 출력물처럼 보여야 한다.

13. 화면 구성 방식

CMD 스킨 페이지는 아래 구조를 따른다.

전체 구조
상단: 경로/세션/화면 제목 표시
중단: 로그 출력 영역
하단: 입력 프롬프트
필요 시 팁 영역 또는 현재 명령 힌트 표시
중요한 점
입력창은 항상 하단 고정
로그 영역은 스크롤 가능
새 로그가 추가되면 자동으로 아래로 이동
사용자가 지금 “페이지를 보는 것”이 아니라 “터미널을 다루는 것”처럼 느껴야 함
14. 디자인 톤 요구사항
유지해야 할 분위기
검은 배경
흰색 / 회색 / 연한 파란색 텍스트
모노스페이스 폰트
지나치게 화려한 효과 금지
진짜 Windows CMD 또는 콘솔 툴 같은 절제된 느낌
추가하면 좋은 요소
타이핑 애니메이션
깜빡이는 커서
로딩 중 점진 출력
얇은 구분선
상태줄 느낌 UI
15. 개발 우선순위

아래 순서대로 구현한다.

STEP 1

현재 setup 페이지의 체크박스형 UI 제거

STEP 2

하단 콘솔 입력 프롬프트 추가

STEP 3

로그 누적형 콘솔 구조 구현

STEP 4

help, set, status, run, clear, exit 명령어 구현

STEP 5

잘못된 입력에 대한 에러 메시지 처리 구현

STEP 6

명령어 히스토리(ArrowUp / ArrowDown) 구현

STEP 7

가짜 부팅 로그 / 초기화 로그 추가

STEP 8

플레이 페이지에 CPU 분석 로그 추가

STEP 9

결과 페이지를 콘솔 리포트 형식으로 변경

STEP 10

추가 명령어(ver, whoami, dir, cls) 구현

STEP 11

선택 기능으로 Command Mode 도입 검토

16. 최종 목표

최종적으로 이 CMD 스킨은
단순히 “CMD처럼 보이는 웹페이지”가 아니라,
브라우저 안에서 실행되는 진짜 콘솔 프로그램처럼 느껴져야 한다.

즉 사용자가 받아야 하는 인상은:

“웹 폼을 꾸민 느낌”이 아니라
“실제 콘솔 프로그램을 실행하고 있다”는 느낌

이어야 한다.