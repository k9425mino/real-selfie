# AGENTS.md

## 문서

- 제품 요구사항: [docs/PRD.md](./docs/PRD.md)
- 기술 설계: [docs/TECH_SPEC.md](./docs/TECH_SPEC.md)
- Git · GitHub 규칙: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## Git 규칙 (요약)

전체 규칙은 [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)를 따른다.

- `main`에 직접 커밋·push하지 않는다. `main`에서 `<타입>/<설명>` 브랜치를 만든다 (예: `feat/face-box`).
- 커밋과 PR 제목은 `<타입>: <한글 요약>` 형식이다. 타입: `feat` `fix` `docs` `refactor` `test` `chore` `ci`.
- PR 본문은 한글로 쓰고 변경 내용, 테스트 방법, 관련 문서 항목을 적는다.
- 브랜치 생성 · 커밋 · push · PR 생성까지만 한다. **머지, 태그, GitHub Release, force push는 하지 않는다.**
