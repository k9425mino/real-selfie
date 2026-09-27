# M9. iOS 검증

| 항목 | 내용 |
|---|---|
| 상태 | 대기 |
| PRD | 전체, §9 |
| TECH_SPEC | §2, §4.4, §8, §13 |
| 선행 | M8 |

## 목표

Android 출시 후 iOS 실기기에서 반전·촬영·얼굴 박스를 포함한 전체 동작을 검증한다. Mac이 없으므로 EAS 클라우드 빌드와 TestFlight만 사용한다.

## 작업

- [ ] Apple Developer Program 가입 (개발자)
- [ ] TestFlight 배포용 EAS 프로필 확인 (store 배포 설정, §13)
- [ ] iOS 권한 문구(`Info.plist` 한/영) 결정·추가 (§8). M0에서는 설정하지 않았다. VisionCamera 5는 기본 문구를 제공하지 않으며, 문구가 없으면 카메라 접근 시 앱이 종료되고 심사도 거절된다
- [ ] 첫 TestFlight 빌드에서 §4.4 반전 가정 검증, `docs/SPIKE_MIRRORING.md`에 iOS 섹션 추가 (§15 #4)
- [ ] iOS 차이 수정 (네이티브 커스텀 코드 최소화)
- [ ] 지인 iPhone에서 TEST_PLAN 실행과 결과 기록

## 완료 조건

- [ ] (실기기) iOS 반전 가정 결과가 기록되고 §15 #4가 확정되었다
- [ ] (실기기) iPhone에서 TEST_PLAN 핵심 항목(WYSIWYG, 챌린지, 얼굴 박스, 권한, 중단·복귀)이 통과한다
- [ ] iOS 수정으로 Android 동작이 깨지지 않았다 (Android 회귀 확인)

## 결정할 항목

- §15 #4 반전 가정 (iOS)
