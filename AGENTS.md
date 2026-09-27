# AGENTS.md

## 문서

- 제품 요구사항: [docs/PRD.md](./docs/PRD.md) — 동작·수치 기준의 단일 출처
- 기술 설계: [docs/TECH_SPEC.md](./docs/TECH_SPEC.md) — 구현 방식, PRD 기능 매핑, 미결정 항목(§15)
- 구현 순서: [docs/milestones/](./docs/milestones/README.md) — 단계별 작업·완료 조건·진행 상태
- Git · GitHub 규칙: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## 작업 시작 전

1. [milestones/README.md](./docs/milestones/README.md)에서 현재 단계를 확인하고 해당 단계 문서를 읽는다.
2. 작업과 관련된 PRD 기능(F1~F7)과 TECH_SPEC 섹션을 [PRD 기능 매핑](./docs/TECH_SPEC.md#prd-기능-매핑)으로 찾아 읽는다.
3. 미확정 값이 필요하면 [TECH_SPEC §15](./docs/TECH_SPEC.md#15-미결정-항목)를 확인한다. 미정인 값을 임의로 정하지 않고 개발자에게 묻는다.

## 명령

M0에서 프로젝트를 만든 뒤 실제 scripts와 일치시킨다.

- `npm run lint` · `npm run typecheck` · `npm run test` · `npm run format`
- 패키지는 `npx expo install <패키지>`로 설치한다 (SDK 호환 버전 선택). 의존성·설정 점검은 `npx expo-doctor`.
- 네이티브 모듈 때문에 Expo Go로 실행할 수 없다. Development Build를 EAS 클라우드로 빌드한다 (`eas build --profile development --platform android`).
- 카메라 기능은 에뮬레이터로 검증할 수 없다. 실기기 확인이 필요한 변경은 PR에 확인 필요 항목을 적는다.

## 핵심 규칙

- 카메라 세션과 사진 출력은 항상 비반전으로 고정하고, 거울 효과는 UI의 `scaleX` 변환과 저장 전 flip으로만 만든다 (TECH_SPEC §4).
- 촬영 요청은 접수 시 모드와 크롭을 고정하며, 이후 UI 상태로 다시 해석하지 않는다 (TECH_SPEC §7).
- 사진·얼굴 인식 결과·사용 기록을 외부로 전송하는 코드를 추가하지 않는다 (PRD §6).
- 사용자에게 보이는 문구는 하드코딩하지 않고 i18n 키(`ko`/`en`)로 작성한다 (TECH_SPEC §10).
- `src/app/`에는 라우트 파일만 둔다. 기능 코드는 `src/features/`, 공용 코드는 `src/shared/`에 둔다 (TECH_SPEC §3).
- `ios/`·`android/`는 CNG로 생성되므로 직접 만들거나 수정하지 않는다. 네이티브 설정은 `app.json`과 config plugin으로 한다.

## Expo 문서

Expo는 SDK마다 API가 바뀐다. Expo·EAS·React Native API를 쓰기 전에 기억에 의존하지 말고, `package.json`의 `expo` 메이저 버전에 맞는 문서(`https://docs.expo.dev/versions/v<메이저>.0.0/`)나 https://docs.expo.dev/llms.txt 를 확인한다.

## 문서 갱신

- 구현 방식이 TECH_SPEC과 달라지면 같은 PR에서 TECH_SPEC을 갱신한다.
- 요구사항(PRD) 변경은 개발자 확인을 받은 뒤에만 반영한다.
- §15 항목을 확정하면 상태·결과·기록 위치를 갱신한다.
- 마일스톤 작업 체크박스는 구현 PR에서 함께 체크한다. `(실기기)` 항목은 개발자가 확인했다고 알려준 뒤에만 체크한다.

## Git 규칙 (요약)

전체 규칙은 [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)를 따른다.

- `main`에 직접 커밋·push하지 않는다. `main`에서 `<타입>/<설명>` 브랜치를 만든다 (예: `feat/face-box`).
- 커밋과 PR 제목은 `<타입>: <한글 요약>` 형식이다. 타입: `feat` `fix` `docs` `refactor` `test` `chore` `ci`.
- PR 본문은 한글로 쓰고 변경 내용, 테스트 방법, 관련 문서 항목을 적는다.
- 브랜치 생성 · 커밋 · push · PR 생성까지만 한다. **머지, 태그, GitHub Release, force push는 하지 않는다.**
