# CONTRIBUTING: 리얼셀피 (Real Selfie)

| 항목 | 내용 |
|---|---|
| 작업자 | 개인 개발자 1인 + AI 에이전트 |
| 관련 문서 | [PRD.md](./PRD.md), [TECH_SPEC.md](./TECH_SPEC.md), [AGENTS.md](../AGENTS.md) |

## 1. 브랜치

- `main`은 항상 배포 가능한 상태로 유지한다. **직접 push하지 않고 PR로만 변경한다.**
- 모든 작업은 `main`에서 새 브랜치를 만들어 진행한다.
- 이름 형식: `<타입>/<설명>` — 타입은 [커밋 타입](#2-커밋-메시지)과 같고, 설명은 영어 kebab-case.
  - 예: `feat/face-box`, `fix/save-orientation`, `docs/contributing`

## 2. 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따른다. **타입은 영어, 내용은 한글**로 쓴다.

```
<타입>: <요약>

<본문 (선택)>
```

| 타입 | 용도 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 |
| `refactor` | 동작 변화 없는 코드 구조 변경 |
| `test` | 테스트 추가·수정 |
| `chore` | 의존성, 설정, 버전 변경 등 기타 |
| `ci` | GitHub Actions 등 CI 설정 |

- 예: `feat: 얼굴 인식 박스 추가`, `fix: 저장 사진 방향 오류 수정`
- 요약은 마침표 없이 한 줄로 쓴다.

## 3. Pull Request

- **제목**은 커밋 메시지와 같은 형식으로 쓴다. squash merge 시 PR 제목이 `main`의 커밋 메시지가 된다.
- **본문**은 한글로 쓰고, 다음 내용을 포함한다.
  - 무엇을 왜 바꿨는지
  - 테스트 방법 (카메라 관련 변경은 실기기 확인 여부 — [TECH_SPEC §11.2](./TECH_SPEC.md#112-실기기-수동-테스트))
  - 관련 문서 항목 (예: PRD F4, TECH_SPEC §6)
- **머지 조건**: CI(`lint` · `typecheck` · `test`, [TECH_SPEC §12](./TECH_SPEC.md#12-개발-도구--ci)) 통과.
- **머지 방식**: squash merge만 사용한다. 머지 후 브랜치는 삭제한다.
- GitHub Issue는 현재 사용하지 않는다.

## 4. 릴리스

버전 정책은 [TECH_SPEC §13](./TECH_SPEC.md#13-빌드--배포)을 따른다(`version`은 SemVer 수동, 빌드 번호는 EAS `autoIncrement`). 여기서는 Git 쪽 절차만 다룬다.

1. 버전 변경 전용 PR을 만든다. `app.json`의 `version`만 바꾼다.
   - 예: `chore: 버전 1.2.0으로 올림`
2. 머지된 `main` 커밋으로 `production` 빌드를 만들고 스토어에 제출한다.
3. 그 커밋에 태그 `v<버전>`을 단다 (예: `v1.2.0`). 플랫폼 구분 없이 버전 하나에 태그 하나를 쓴다. Android 출시 후 iOS가 같은 버전으로 나가면 같은 태그를 사용한다.
4. 태그로 GitHub Release를 만들고, 릴리스 노트는 **Generate release notes**로 자동 생성한다.

태그와 Release는 개발자가 직접 만든다.

## 5. AI 에이전트 권한

| 작업 | 에이전트 |
|---|---|
| 브랜치 생성 · 커밋 · push · PR 생성 | 자율 |
| PR 머지 | 금지 (개발자가 직접) |
| 태그 · GitHub Release | 금지 (개발자가 직접) |
| `main` 직접 push · force push | 금지 |

## 6. GitHub 저장소 설정

위 규칙은 아래 설정으로 강제한다.

- Branch protection (`main`)
  - Require a pull request before merging (승인 수 0)
  - Require status checks to pass — CI 작업 추가 후 해당 체크 지정
  - Block force pushes
- Pull Requests
  - Allow squash merging만 허용, 기본 메시지는 PR 제목
  - Automatically delete head branches
