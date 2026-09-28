# M0. 스캐폴딩

| 항목 | 내용 |
|---|---|
| 상태 | 진행 중 |
| PRD | F7 (기반) |
| TECH_SPEC | §1, §3, §10, §12, §13 |
| 선행 | — |

## 목표

빈 저장소에서 시작해 S23에 Development Build가 설치되어 실행되고, PR마다 CI가 돌며, 모든 문구를 처음부터 i18n 키로 작성할 수 있는 상태.

## 작업

- [x] Expo 프로젝트 생성: TypeScript `strict`, Expo Router 단일 라우트 `src/app/index.tsx`, `ios/`·`android/` gitignore (§3)
- [x] 의존성 설치·버전 고정: `npx expo install`로 호환 버전 선택, 호환 조합과 최소 OS를 §1에 기록 (§15 #1)
- [x] `app.json` 기본 설정: 앱 식별자, 세로 고정, 어두운 배경, 카메라 권한(Android), 마이크 권한 없음 (§5, §8). iOS 권한 문구는 M9에서 결정
- [x] 린트·포맷·테스트: ESLint(`expo lint`)·Prettier·Jest와 npm scripts (§12)
- [x] GitHub Actions CI: PR·main push에서 lint·포맷·typecheck·test·expo-doctor (§12)
- [x] i18n 기반: `expo-localization` + i18next, `ko.json`/`en.json`, 타입이 있는 키 (§10)
- [x] EAS 설정: `eas.json`에 `development`·`preview`·`production` 프로필 (§13)
- [x] `AGENTS.md`의 명령 섹션을 실제 scripts와 일치시킴

폴더는 §3 구조를 따르되 파일이 생길 때 만든다. 빈 폴더를 미리 만들지 않는다.

## 완료 조건

- [x] PR에서 CI `verify`가 통과한다
- [x] branch protection에 CI 체크가 필수로 지정되었다 ([CONTRIBUTING §6](../CONTRIBUTING.md#6-github-저장소-설정))
- [ ] (실기기) S23에 development build를 설치하고, i18n 키로 표시한 문구 한 줄이 기기 언어에 따라 한/영으로 보인다
- [ ] (실기기) 코드 수정 시 핫 리로드가 동작한다

## 결정할 항목

- §15 #1 버전 조합·최소 OS
