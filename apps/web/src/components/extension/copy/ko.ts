import type { ExtensionCopy } from "./en";

export const ko = {
  seo: {
    title: "Chrome용 Gallery Wall Layout Generator",
    h1: "Gallery Wall Layout Generator 사용 방법",
    description:
      "Chrome 확장 프로그램 Gallery Wall Layout Generator 사용 방법: 사이드 패널에서 벽을 계획하거나 쇼핑몰의 포스터를 실제 크기로 벽에 걸어 보세요.",
  },
  crumbs: { home: "홈", hub: "갤러리 월", page: "Chrome 확장 프로그램" },
  answer:
    "Chrome 툴바에서 확장 프로그램 버튼을 클릭하면 사이드 패널이 열리고 갤러리 월을 계획할 수 있습니다. 어느 쇼핑몰에서든 포스터를 마우스 오른쪽 버튼으로 클릭하고 'Try on my wall'을 선택하면 실제 크기로 내 벽에 걸어 볼 수 있습니다.",
  store: "Chrome 웹 스토어에서 받기",
  noButton: "버튼이 보이지 않나요?",
  showPin: "고정하는 방법 보기",
  pin: {
    title: "툴바에 고정하기",
    text: "Chrome은 새 확장 프로그램을 퍼즐 조각 버튼 뒤에 둡니다. Chrome 오른쪽 위의 퍼즐 조각(1)을 클릭한 다음 Gallery Wall Layout Generator 옆의 핀(2)을 클릭하세요. 그러면 버튼이 툴바에 계속 표시됩니다.",
    picture:
      "Chrome 툴바: 1로 표시된 퍼즐 조각 버튼을 누르면 확장 프로그램 메뉴가 열리고, Gallery Wall Layout Generator 옆의 핀은 2로 표시되어 있습니다",
    pinned: "이미 고정했나요?",
    showUsage: "사용 방법 보기",
  },
  usage: "사이드 패널에서 할 수 있는 일",
  steps: [
    {
      title: "갤러리 월 계획하기",
      figure: "샘플 방의 소파 위에 걸린 액자 다섯 개",
      text: "템플릿 다섯 개 중 하나를 고르고 간격을 정한 뒤 액자를 옮겨 보세요. 샘플 방은 바로 쓸 수 있고, 내 벽 사진은 1분이면 됩니다.",
    },
    {
      title: "쇼핑몰의 포스터 걸어 보기",
      figure: "쇼핑몰 포스터의 오른쪽 클릭 메뉴에서 Try on my wall을 선택한 모습",
      text: "포스터를 마우스 오른쪽 버튼으로 클릭하고 'Try on my wall'을 선택한 다음 쇼핑몰에 나온 크기를 고르세요. 실제 크기로 내 벽에 걸립니다.",
    },
    {
      title: "못 위치 확인하기",
      figure: "번호가 붙은 못이 하나씩 있는 액자 다섯 개",
      text: "고리가 액자 윗면에서 얼마나 아래에 있는지 입력하세요. 모든 못에 번호와 위치가 붙고, 위치는 한 모서리에서 잰 값입니다.",
    },
  ],
  wall: {
    title: "내 벽 사용하기",
    text: "벽을 정면에서 똑바로 찍은 다음, 크기를 아는 물건 하나를 표시하세요. 패널이 그 물건을 기준으로 모든 것의 크기를 맞춥니다.",
    items: [
      "벽의 너비",
      "문(미국 기준 높이 {door})",
      "직접 잰 소파나 침대",
      "벽에 붙인 Letter 또는 A4 용지",
      "신용카드",
    ],
  },
  perm: {
    title: "확장 프로그램이 볼 수 있는 것",
    rows: [
      {
        dt: "오른쪽 클릭 메뉴",
        dd: "이미지를 마우스 오른쪽 버튼으로 클릭하면 'Try on my wall'을 추가합니다.",
      },
      {
        dt: "클릭한 탭",
        dd: "'Try on my wall'을 선택할 때 그 페이지를 한 번 읽습니다. 이미지와 텍스트에 있는 크기만 읽고, 그 사이트의 다른 정보는 읽지 않습니다.",
      },
      {
        dt: "framesizes.app",
        dd: "확장 프로그램이 설치되어 있고 고정되어 있는지 물어볼 수 있습니다. 그 외에는 아무것도 공유되지 않습니다.",
      },
    ],
    tip: "벽 사진은 이 컴퓨터에만 남습니다.",
  },
  faq: {
    title: "자주 묻는 질문",
    items: [
      {
        q: "모든 쇼핑몰에서 작동하나요?",
        a: "마우스 오른쪽 버튼으로 클릭할 수 있는 이미지가 있는 페이지라면 어디서든 작동합니다. 페이지에 크기가 없으면 너비와 높이를 직접 입력하세요.",
      },
      {
        q: "툴바에 버튼이 없는 이유는 무엇인가요?",
        a: "Chrome은 새 확장 프로그램을 퍼즐 조각 버튼 뒤에 둡니다. 한 번 고정하면 툴바에 계속 표시됩니다.",
      },
      {
        q: "어떤 브라우저에서 작동하나요?",
        a: "컴퓨터의 Chrome 116 이상에서 작동합니다. Chrome의 사이드 패널에서 열립니다.",
      },
    ],
  },
  chrome: {
    extensions: "확장 프로그램",
    noAccess: "필요한 액세스 권한 없음",
    noAccessLines: ["이 사이트의 정보를 확인하고 변경할 필요가", "없는 확장 프로그램입니다."],
    manage: "확장 프로그램 관리",
    copyImage: "이미지 복사",
    inspect: "검사",
  },
} satisfies ExtensionCopy;
