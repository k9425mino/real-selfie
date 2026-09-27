# TECH SPEC: 리얼셀피 (Real Selfie)

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.3 (인터뷰 반영 중) |
| 작성일 | 2026-09-23 |
| 관련 문서 | [PRD.md](./PRD.md), [milestones](./milestones/README.md) |
| 앱 식별자 | `com.k9425mino.realselfie` (iOS Bundle ID / Android package 동일) |

> 요구사항(동작·수치 기준)은 PRD가 단일 출처다. 이 문서는 구현·검증 방법만 다루고 요구사항은 PRD 항목을 링크한다.

---

## PRD 기능 매핑

| PRD | 기능 | 설계 섹션 | 마일스톤 |
|---|---|---|---|
| F1 | 실시간 비반전 프리뷰 | §4.1, §4.2, §5, §8, §9 | M1, M2 |
| F2 | 좌우반전 챌린지 | §4.3 | M5 |
| F3 | 3×3 가이드선 | §3 (`overlay/`), §4.1 | M2 |
| F4 | 얼굴 인식 박스 | §4.1, §4.4, §6 | M1, M4 |
| F5 | 사진 촬영 / 저장 | §4.2, §7, §8 | M3 |
| F6 | 공유 | §7 | M3 |
| F7 | 다국어 | §10 | M0 (기반), M6 (검수) |
| §6 | 비기능 요구사항 (성능·권한·설정 유지) | §5, §6, §8, §9, §11.2 | 각 단계 측정, M6 확정 |

## 1. 결정 요약

| 영역 | 결정 |
|---|---|
| 프레임워크 | Expo (CNG + Development Build), React Native New Architecture |
| 언어 / 패키지 매니저 | TypeScript (`strict: true`) / npm |
| 라우팅 | Expo Router (단일 라우트 `app/index.tsx`) |
| 카메라 | `react-native-vision-camera` (최신, Nitro 기반) |
| 얼굴 인식 | `react-native-vision-camera-face-detector` (ML Kit, 온디바이스) |
| 애니메이션 / 오버레이 | `react-native-reanimated` (shared value) |
| 이미지 후처리 | `expo-image-manipulator` |
| 갤러리 저장 / 공유 | `expo-media-library` / `expo-sharing` |
| 상태 관리 | React 내장 (`useState` + Context) |
| 영구 저장소 | `react-native-mmkv` |
| 다국어 | `i18next` + `react-i18next` + `expo-localization` |
| 스타일링 | `StyleSheet` |
| 화면 테마 | 앱의 카메라 주변 UI는 어두운 테마로 고정. 시스템 테마에 따른 전환 없음 |
| 화면 방향 | 세로 고정 |
| 테스트 | Jest (순수 로직 단위 테스트) + 실기기 수동 체크리스트 |
| 린트 / 포맷 | ESLint (`expo lint`) + Prettier |
| CI | GitHub Actions (lint · typecheck · test), EAS Build는 수동 실행 |
| 모니터링 | 원격 분석·오류 수집 없음. 개발 시 로컬 측정만 사용 |

> 상호 호환되는 최신 안정 버전 조합을 선정하고 실제 빌드 후 `package.json`과 lockfile에 고정한다. Expo SDK 호환 패키지는 `npx expo install`로 설치한다. 최소 OS는 Expo·카메라·얼굴 인식 등 모든 의존성 요구사항을 만족하는 범위로 정한다. 정확한 버전·최소 OS·네이티브 플러그인 설정은 아직 미확정이다 (§15 #1). 아래 API 이름과 코드는 설계 개념이며 선정 버전의 공식 API와 대조한다.

## 2. 개발 환경 제약

- 개발 PC: **Windows** (Mac 없음) → iOS 빌드는 **EAS 클라우드 빌드만** 가능.
- 주 개발·검증 기기: **갤럭시 S23 / Android 16**. 검증·출시 순서는 [PRD §9](./PRD.md#9-검증-순서-및-성공-지표)를 따른다.
- 카메라 앱이므로 에뮬레이터·시뮬레이터 테스트는 사실상 불가. 모든 카메라 기능은 실기기에서 검증.
- iPhone 검증에는 **Apple Developer Program($99/년) 가입이 먼저 필요**:
  - 방법 A: `eas device:create`로 지인 iPhone 등록 → ad hoc Development Build 설치
  - 방법 B: TestFlight 배포 (기기 등록 불필요, 원격 테스트 용이) ← 지인 기기에는 이 방법이 편함

## 3. 프로젝트 구조

```
app/
  _layout.tsx              # 폰트/i18n 초기화, SettingsProvider
  index.tsx                # 카메라 화면 (유일한 라우트)
src/
  features/
    camera/
      CameraScreen.tsx     # 화면 조립
      useCameraSetup.ts    # device, format(4:3), outputs, isActive
      capture.ts           # 촬영 → (거울이면 flip) → 저장
      MirrorContainer.tsx  # scaleX 변환 컨테이너
    face/
      useFaceDetection.ts  # 감지 결과 → shared value
      FaceBoxes.tsx        # 박스 렌더링
      coords.ts            # 좌표 변환 (순수 함수, 테스트 대상)
    overlay/
      GridOverlay.tsx      # 3×3 격자
    challenge/
      useChallengeFlip.ts  # Reanimated 반복 토글
      PhotosensitivityDialog.tsx
      intervals.ts         # 속도 범위·클램프 (순수 함수)
  shared/
    settings/
      SettingsContext.tsx  # 설정 상태 + MMKV 동기화
      storage.ts           # MMKV 인스턴스, 키 정의
    i18n/
      index.ts
      ko.json
      en.json
    ui/                    # 공용 버튼, 아이콘 버튼 등
__tests__/                 # 또는 각 파일 옆 *.test.ts
```

`ios/`, `android/` 폴더는 `.gitignore`에 추가 (CNG — `npx expo prebuild`로 생성).

## 4. 핵심 설계: 반전 처리

이 앱의 핵심. **카메라 세션은 항상 실물(비반전)로 고정**하고, 거울 효과는 모두 JS/UI 레이어에서 만든다.

### 4.1 파이프라인

```
                 ┌──────────────────── MirrorContainer (scaleX = mirror) ───┐
Camera session   │  Preview (mirrorMode='off')                              │
(front, 4:3)  ───┤  FaceBoxes (프리뷰 좌표계, 같은 컨테이너 안 → 함께 반전)  │
                 └──────────────────────────────────────────────────────────┘
                    GridOverlay (좌우 대칭이라 컨테이너 밖에 둬도 무관)

Photo output (mirrorMode='off') ──▶ 촬영 요청에 고정한 방향·크롭 적용 ──▶ MediaLibrary 저장
```

### 4.2 모드별 동작

| 모드 | 프리뷰 `mirrorMode` | 컨테이너 `scaleX` | 촬영 | 저장 결과 |
|---|---|---|---|---|
| 실물 | `off` | `1` | 가능 | 원본 (비반전) |
| 거울 | `off` | `-1` | 가능 | `expo-image-manipulator`로 좌우 flip |
| 챌린지 | `off` | `1 ↔ -1` 반복 | **불가** (셔터 disabled) | — |

- 모드 전환 시 카메라 세션 재구성 없음 → 즉시 전환, 끊김 없음.
- `scaleX`는 Reanimated `useSharedValue<number>`로 관리 (`mirror`: `1 | -1`).
- 얼굴 박스를 `MirrorContainer` **안**에 두면 반전이 자동으로 적용되어 좌표 반전 로직이 필요 없다.

### 4.3 챌린지 모드

```ts
// useChallengeFlip.ts (개념)
const initialSign = mode === 'mirror' ? -1 : 1;
mirror.value = initialSign;
mirror.value = withRepeat(
  withSequence(
    withDelay(intervalMs, withTiming(-initialSign, { duration: 0 })),
    withDelay(intervalMs, withTiming(initialSign, { duration: 0 })),
  ),
  -1,
);
// 종료 시: cancelAnimation(mirror); mirror.value = mode === 'mirror' ? -1 : 1;
```

동작 규칙(간격 범위·기본값, 경고, 라벨, 허용·차단 조작, 종료 조건)은 [PRD F2](./PRD.md#f2-좌우반전-챌린지-모드--p0)를 따른다. 구현 방식:

- UI 스레드에서 실행해 JS 스레드 부하의 영향을 줄인다. 간격 정확도는 실기기에서 측정하며 무조건 보장하지 않는다 (§15 #8).
- 간격은 ms 정수로 다루고 `intervals.ts`에서 PRD F2 범위·단위로 정규화한다. 슬라이더 값 변경 시 기존 애니메이션을 취소하고 새 간격으로 재시작한다.
- `PhotosensitivityDialog`는 "다시 보지 않기"를 체크하고 확인한 경우에만 MMKV `photosensitivityAck`에 기록한다.
- 시작 전 `mode`를 유지하며 화면만 번갈아 반전한다. 첫 반전은 시작 후 한 간격이 지난 시점이다. 챌린지의 반전 값으로 영구 설정을 갱신하지 않는다.
- 종료·앱 비활성화·카메라 중단 시 `cancelAnimation` 후 시작 전 모드 값으로 되돌린다.
- 진행 중인 촬영 작업은 접수 시 고정한 입력을 사용하므로 챌린지 시작의 영향을 받지 않는다 (§7).

### 4.4 검증이 필요한 가정

1. `mirrorMode: 'off'` 프리뷰가 Android/iOS 모두에서 **실제로 비반전**으로 보이는지.
2. `mirrorMode: 'off'` 사진 출력이 프리뷰와 **좌우 일치**하는지 (EXIF orientation 포함).
3. 얼굴 인식 플러그인의 좌표(`autoMode` 사용 시)가 **미러링된 프리뷰를 가정하고 있는지**. 그렇다면 `coords.ts`에서 x좌표를 다시 뒤집어 비반전 프리뷰 좌표계에 맞춘다.
4. 4:3 포맷 선택 시 프리뷰와 저장 이미지의 **화각이 동일**한지.

→ 네 가지 모두 개발 초기에 S23 실기기로 검증하고, iOS는 iOS 검증 단계의 첫 TestFlight 빌드에서 검증한다. 아직 검증 결과는 없다. 수행 시 `docs/SPIKE_MIRRORING.md`를 작성한다 (§15 #3, #4, [M1](./milestones/M1-mirroring-spike.md)).

추가 확인: 선택 버전의 카메라·얼굴 인식 API 호환성, Android 프리뷰에 컨테이너 transform 적용 여부, 촬영·프리뷰·검출 좌표계의 회전 및 크롭, 최대 사진 해상도와 프리뷰 성능의 동시 충족 여부. 단순히 비율이 같다는 이유로 화각 일치를 판정하지 않는다.

## 5. 카메라 설정

- 기기: `useCameraDevice('front')`. 전면 카메라가 없으면 안내 화면.
- 사진: 선택한 카메라 API가 노출하는 최대 사진 해상도를 사용한다. 제조사 기본 카메라의 전용 고해상도 모드와 동일함을 보장하는 의미는 아니다.
- 프레임률 기준(60fps 필수, 미지원 기기 허용, 저조도·촬영 중 예외)은 [PRD §6](./PRD.md#6-비기능-요구사항)을 따른다. 구현·검증 방법:
  - 실제 카메라 출력과 화면 표시 성능을 측정하며 60fps 설정값만으로 통과 처리하지 않는다.
  - 60fps 미지원 기기는 카메라 기능·포맷 정보로 지원 가능한 프레임률을 선택하고 선택 근거를 검증 결과에 기록한다. 지원 기기에서 발생한 구현상 성능 문제를 미지원으로 분류해 우회하지 않는다.
  - 저조도는 선정 API의 자동 노출·가변 FPS 동작으로 충족 가능한지 실기기에서 검증한다. 화면 밝기를 강제로 올리거나 별도 보정 필터를 추가하지 않는다. 전환 조건과 프레임 하한은 §15 #7.
- 프리뷰: 세로 3:4 범위에 맞춘다. 사진·프리뷰의 실제 화각을 비교하고 동일한 촬영 범위가 되도록 크롭을 계산한다. 비반전 사진의 orientation을 정규화한 뒤 촬영 요청의 크롭·반전을 적용하며, 방향·크롭 순서는 좌표계 테스트로 검증한다.
- 저장 결과는 항상 3:4이며 최대 해상도 원본에서 필요한 크롭만 허용한다. 중앙 크롭만으로 화각이 맞지 않는 기기는 별도 보정 가능성을 검증한다. 해결되지 않은 경우 WYSIWYG 통과로 처리하지 않는다.
- 프리뷰 컨테이너: `aspectRatio: 3 / 4`. 세로 고정, safe area와 큰 글자 설정·조작 영역의 높이를 제외한 공간 안에 맞춘다. 작은 화면에서는 프리뷰를 줄이고 버튼 스크롤을 요구하지 않는다.
- `isActive = 화면 포커스 && AppState === 'active'` → 백그라운드 전환 시 카메라 해제.
- 전화 등으로 세션이 중단되면 준비 상태를 해제하고 챌린지도 종료한다. 사용 가능한 상태로 돌아오면 프리뷰 자동 복구를 시도하고 실패 시 재시도 버튼을 표시한다.
- 화면 켜짐 유지는 앱이 활성 상태이고 프리뷰가 실행 중일 때만 적용한다. 앱 비활성화·카메라 중단·화면 해제 시 정리하고 프리뷰 복구 시 다시 적용한다. 사용자의 직접 잠금은 막지 않는다. 구현 API는 선정 Expo SDK에 맞춰 확인한다 (§15 #11).
- 마이크 사용 안 함 (동영상 없음) → VisionCamera config plugin에서 마이크 권한 비활성화.

## 6. 얼굴 인식

| 옵션 | 값 | 이유 |
|---|---|---|
| `performanceMode` | `'fast'` | 실시간성·발열·배터리 |
| `runLandmarks` / `runContours` / `runClassifications` | `false` | MVP는 박스만 필요 |
| `trackingEnabled` | `true` | 얼굴 추적 ID 활용; 좌표 안정화 보장과는 구분 |
| `cameraFacing` | `'front'` | |

동작 규칙(여러 얼굴 표시, 미감지·오류 시 동작, 고정 스타일·기본 ON)은 [PRD F4](./PRD.md#f4-얼굴-인식-박스--p0)를 따른다. 구현 방식:

- 얼굴 목록의 추가·제거는 React로 관리하고, 기존 박스 위치는 shared value와 `useAnimatedStyle`로 갱신한다. 얼굴 수 변화까지 React 리렌더 없이 처리한다고 가정하지 않는다.
- 박스 위치·크기 갱신에는 떨림을 줄이는 보간을 적용한다. 즉각적인 반응보다 부드러움을 우선하되 지연이 계속 누적되지 않도록 최신 감지 결과를 목표로 갱신한다. 보간 시간은 S23 사용 평가에서 정한다 (§15 #9). 미감지·토글 OFF·오류 시에는 보간과 무관하게 박스를 숨긴다.
- 얼굴박스 토글 OFF 시 얼굴 인식 자체를 중지해 리소스 절약.
- 얼굴 미감지 시 이전 박스를 지운다. 이전 실행·토글 OFF 이전에 시작한 감지의 늦은 결과는 무시한다.
- 인식 기능 오류는 박스만 중지하고 안내한다. 프리뷰·촬영은 유지하며 토글로 재시도한다. 일시적인 오류 상태로 영구 ON/OFF 설정을 덮어쓰지 않는다.
- 프리뷰 성능을 우선한다. 감지 작업을 겹쳐 쌓지 않고 처리 중 프레임은 건너뛰며, 부하가 높으면 감지 빈도를 자동으로 낮춘다. 감지 빈도·하향 및 복원 기준은 성능 검증에서 결정한다 (§15 #10).
- 얼굴을 가리지 않는 박스·격자 선 스타일은 실기기 프리뷰에서 정한다 (§15 #12).
- 좌표 변환(프레임 → 프리뷰 뷰 좌표, 4:3 크롭 보정, 필요 시 x 반전)은 `coords.ts` 순수 함수로 분리해 단위 테스트.

## 7. 촬영 · 저장 · 공유

동작 규칙은 [PRD F5](./PRD.md#f5-사진-촬영--저장--p0), [PRD F6](./PRD.md#f6-공유--p0)을 따른다. 구현 방식:

```
셔터 탭
 → 챌린지·진행 중 작업·카메라 준비 상태 검사 (중복 요청 차단)
 → 필요한 저장 권한 확인/요청 (거부 시 촬영 없이 종료)
 → 준비 상태 재검사, captureMode와 previewCrop을 요청에 고정
 → 사진 촬영 (비반전 출력; 실제 API는 고정 버전에 맞춰 선택)
 → 촬영 순간 짧은 시각 효과 + 햅틱
 → 고정한 촬영 정보로 orientation 정규화·크롭·반전
 → 최근 임시 사진 갱신, '저장 중…' 표시
 → 선정 버전의 MediaLibrary 저장 API로 갤러리 저장
 → 성공: '저장됨' / 실패: 미저장 안내 + 저장 재시도 버튼
```

- 권한 대기·촬영·후처리·저장·재시도 동안 작업 잠금으로 추가 촬영을 막는다. 모드 전환·챌린지 시작은 허용하며, 현재 UI 모드로 진행 중 작업을 다시 해석하지 않는다. 권한 승인 후 챌린지가 시작되었거나 카메라가 중단되었다면 촬영하지 않는다.
- 썸네일은 세션 상태 `lastPhoto`(§9.1)로 관리해 프로세스 재시작 시 초기화되게 한다. 공유용 로컬 파일을 사용하므로 썸네일을 위해 갤러리 읽기 권한을 요청하지 않는다.
- 썸네일 탭 → `Sharing.shareAsync(uri)`로 OS 공유 시트 호출.
- 갤러리 저장 실패 시 후처리된 파일을 유지하고 썸네일 옆에 `저장 재시도` 버튼을 표시한다. 재시도는 재촬영·재반전 없이 같은 파일을 저장하며, 중복 요청을 막는다. 실패한 사진도 공유할 수 있다.
- 새 사진 촬영에 성공하면 기존 임시 사진은 확인 없이 교체한다. 새 촬영 자체가 실패한 경우 기존 사진은 유지한다.
- 앱 비활성화 시 이미 촬영된 사진은 프로세스가 실행 가능한 동안 저장을 계속 시도한다. OS 백그라운드 실행이나 강제 종료 후 완료·복구를 보장하지 않는다.
- 로컬 파일은 캐시에 두고 영구 사진 목록은 저장하지 않는다. 최근 파일과 진행 중 저장·공유가 참조하는 파일은 유지하고, 불필요해진 앱 소유 임시 파일은 정리한다. 프로세스 재시작 후 잔여 캐시는 복구하지 않고 정리하며 갤러리 원본은 삭제하지 않는다.
- 촬영·후처리 실패와 갤러리 저장 실패를 구분한다. 파일 준비에 실패한 경우 저장 재시도를 노출하지 않고 실패를 안내한다. 공유 취소는 저장 실패로 처리하지 않는다.

## 8. 권한

| 권한 | Android | iOS | 요청 시점 |
|---|---|---|---|
| 카메라 | `CAMERA` | `NSCameraUsageDescription` | 실행 직후 상태 확인, 미허용 시 시스템 요청 |
| 갤러리 쓰기 | OS별 저장 전용 권한 필요 여부 확인 (§15 #2) | `NSPhotoLibraryAddUsageDescription` (add-only) | 첫 촬영 전 확인·필요 시 요청 |
| 마이크 | 사용 안 함 | 사용 안 함 | — |

- 카메라 거부 시 안내 화면, 재요청 불가 상태에서는 `Linking.openSettings()` 제공. 설정에서 돌아오면 권한 상태를 다시 확인한다.
- 저장 권한 거부 시 촬영은 진행하지 않고 권한 안내만 제공한다. 프리뷰·격자·얼굴 박스·챌린지는 계속 사용한다. 이후 촬영 시 재확인하며 플랫폼별로 필요한 권한만 요청한다.
- iOS 권한 문구는 한/영 모두 제공 (config plugin의 locales 설정).

## 9. 상태 & 영구 저장

### 9.1 상태 모델

```ts
type MirrorMode = 'real' | 'mirror';

type Settings = {
  mode: MirrorMode;                // 영구 저장, 최초값 'real'
  challengeIntervalMs: number;     // 영구 저장, 범위·기본값은 PRD F2
  showGrid: boolean;               // 영구 저장, 기본 true
  showFaceBoxes: boolean;          // 영구 저장, 기본 true
  photosensitivityAck: boolean;    // 영구 저장, 기본 false
};

type LastPhoto = {
  uri: string;                    // 후처리된 공유용 로컬 파일
  saveStatus: 'saving' | 'saved' | 'failed';
};

// 세션 상태 (프로세스 생존 중 유지, 영구 저장 안 함)
type SessionState = {
  isChallengeActive: boolean;
  lastPhoto: LastPhoto | null;
  isCapturing: boolean;            // 권한 대기·촬영·후처리·저장·재시도 작업 잠금
};

// 비동기 촬영 요청은 접수 시 mode와 크롭 정보를 별도로 고정해 가진다.
// 영구 mode는 일반 모드만 나타내며 챌린지 프레임마다 변경하지 않는다.
```

### 9.2 저장 방식

- `SettingsContext`가 `useState`로 들고, 변경 시 MMKV에 즉시 기록.
- MMKV는 **동기 읽기**이므로 초기 렌더 전에 설정을 로드 → 모드가 잘못 보였다가 바뀌는 깜빡임 없음.
- 키: `settings.v1` 하나에 JSON으로 저장 (스키마 변경 시 버전 키로 마이그레이션).
- 챌린지 모드 on/off 상태 자체는 저장하지 않음 (재실행 시 항상 off).

## 10. 다국어

- `expo-localization`으로 기기 언어 감지 → `ko`면 한국어, 그 외 영어 (fallback `en`).
- 문자열은 `src/shared/i18n/{ko,en}.json`. 키는 TypeScript 타입으로 선언해 오타를 컴파일 단계에서 잡음.
- 앱 표시 이름: 한국어 `리얼셀피`, 영어 `Real Selfie` (config plugin locales).

## 11. 테스트

### 11.1 Jest 단위 테스트 (카메라 없이 가능한 로직)

| 대상 | 검증 내용 |
|---|---|
| `face/coords.ts` | 프레임 → 뷰 좌표 스케일, 3:4 크롭 오프셋, x 반전 |
| `challenge/intervals.ts` | PRD F2 범위 클램프, 단위 정규화, 기본값 |
| `shared/settings/storage.ts` | 저장/로드, 손상된 JSON·누락 필드 시 기본값 폴백 |
| `camera/capture.ts` | 촬영 후 UI 모드가 바뀌어도 고정 모드·크롭 적용, 중복 요청 차단, 저장 실패 후 같은 파일 재시도 |

### 11.2 실기기 수동 테스트
검증 대상 기기와 순서는 [PRD §9](./PRD.md#9-검증-순서-및-성공-지표)를 따른다. 실행 결과는 `docs/TEST_PLAN.md`에 기록한다 ([M6](./milestones/M6-stabilization.md)에서 작성). 현재는 아직 실측 결과가 없다.

| 항목 | 확인할 결과 |
|---|---|
| 기본값·설정 | 첫 실행 실물, 격자·박스 ON, 간격 250ms. 재시작 시 마지막 설정 복원, 챌린지 OFF |
| WYSIWYG | 글자·가장자리 표식으로 양 모드의 좌우·세로 방향·프레임 경계 확인. 3:4 저장 및 오버레이 제외 |
| 촬영 중 조작 | 실물→촬영→거울 전환 또는 챌린지 시작에도 결과는 실물. 반대 방향도 확인. 연타 시 중복 촬영 없음 |
| 챌린지 | 양 모드에서 첫 간격 후 반전, 종료 시 원래 모드, 고정 라벨, 토글 허용, 수동 모드 전환 차단 |
| 경고 | 매 진입 표시, 취소 시 미시작, 다시 보지 않기 저장·복원 |
| 중단·복귀 | 앱 이동·잠금·전화 시 챌린지 종료. 프리뷰 자동 복구, 실패 시 재시도. 썸네일 유지. 활성 프리뷰에서 자동 꺼짐 방지, 직접 잠금 허용, 중단 시 켜짐 유지 해제 |
| 권한 | 카메라 요청·거부·설정 복귀. 저장 거부 시 미촬영 및 프리뷰 유지. 권한 대기 중 상태 변경 |
| 실패 처리 | 저장 실패 안내·재시도·공유. 새 촬영 시 무확인 교체. 프로세스 종료 후 미복구 |
| 얼굴 인식 | 여러 얼굴, 미감지 시 박스 제거, 오류 시 다른 기능 유지·토글 재시도, 오래된 콜백 무시 |
| 화면·접근성 | 작은 화면·큰 글자에서 모든 버튼 표시, 세로 고정, 접근성 라벨, 한/영 문구 |
| 성능 | 박스 ON/OFF, 다중 얼굴, 챌린지, 최대 해상도 저장 중 프리뷰 FPS·검출 지연·전환 오차·발열 측정 |

성능 합격 기준은 [PRD §6](./PRD.md#6-비기능-요구사항)을 따른다. 저조도·촬영 및 저장 중 측정은 일반 프리뷰와 별도 조건으로 기록한다. 조명·얼굴 수 등 측정 조건과 허용 지연·오차는 본 테스트 전에 확정한다 (§15 #5~#10, #14~#17). 아직 미확정인 수치를 통과로 간주하지 않는다.

## 12. 개발 도구 & CI

- ESLint: `expo lint` 기본 설정 + Prettier (`eslint-config-prettier`로 충돌 제거).
- npm scripts: `lint`, `typecheck` (`tsc --noEmit`), `test` (`jest`), `format`.
- GitHub Actions (PR · main push): `npm ci` → `lint` → `typecheck` → `test`.
- EAS Build는 수동: `eas build --profile <profile> --platform <android|ios>`.

## 13. 빌드 & 배포

| EAS 프로필 | 용도 | 배포 |
|---|---|---|
| `development` | Dev Client (핫 리로드) | Android: 로컬 설치 / iOS: 등록 기기(ad hoc) |
| `preview` | 실기기 QA 빌드 | Android: APK 내부 배포 / iOS: TestFlight |
| `production` | 스토어 제출 | `eas submit` |

- 버전: `version`(사용자 표시, SemVer)은 수동, `buildNumber`/`versionCode`는 EAS `autoIncrement`.
- 세부 절차는 `docs/RELEASE.md`에서 관리하며 [M8](./milestones/M8-android-release.md)에서 작성한다. 출시 순서는 [PRD §9](./PRD.md#9-검증-순서-및-성공-지표)를 따른다.
- TestFlight용 iOS 빌드는 store 배포 설정을 사용하도록 실제 EAS 프로필을 확인한다.

## 14. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| 기기·OS별 미러링 동작 차이 | 핵심 기능이 틀어짐 | 4.4 스파이크를 가장 먼저 진행, 결과를 `docs/SPIKE_MIRRORING.md`에 기록 |
| 초기 검증이 S23에 집중 | 다른 기기의 문제를 놓칠 수 있음 | 본인 테스트 완료 후 지인 기기·OS별 검증 결과 기록, iOS는 별도 검증 후 출시 |
| Windows에서 iOS 로컬 빌드 불가 | iOS 네이티브 이슈 디버깅 어려움 | EAS 빌드 로그 활용, 네이티브 커스텀 코드 최소화 |
| 얼굴 인식 플러그인과 VisionCamera 최신 버전 호환 | 빌드 실패·API 변경 | 설치 시 호환 버전 확인 후 고정, 업그레이드는 수동 |
| 저사양 Android에서 얼굴 인식 부하 | 프리뷰 프레임 드랍 | `fast` 모드와 감지 빈도 자동 조절로 추적 유지, 토글 OFF 시 감지 중지 |
| 프리뷰와 사진 출력의 화각 차이 | 저장 범위 불일치 | 실제 좌표계·화각 검증 후 크롭 계산, 중앙 크롭만으로 해결된다고 가정하지 않음 |

## 15. 미결정 항목

아직 확정되지 않은 결정·수치를 모두 여기에 모은다. 본문에서는 `§15 #번호`로 참조한다. 확정하면 상태를 `확정`으로 바꾸고 결과를 기록 위치에 적는다. 번호는 재사용하지 않는다.

| # | 상태 | 항목 | 현재 방침 | 결정 시점 | 기록 위치 |
|---|---|---|---|---|---|
| 1 | 미정 | 버전 조합·최소 OS | Expo SDK·RN·VisionCamera·얼굴 인식 플러그인·Reanimated/worklets·MMKV의 호환 최신 안정 버전을 공식 문서와 실제 빌드로 확정 | M0 | `package.json`, lockfile, §1 |
| 2 | 미정 | 저장 API·Android 저장 권한 | 선정 버전의 MediaLibrary 저장 API와 OS별 권한 필요 여부 확인. 구 API 이름을 그대로 쓰지 않음 | M3 | §7, §8 |
| 3 | 미정 | 반전 가정 1~4 (Android) | §4.4 가정과 추가 확인 항목을 S23에서 검증 | M1 | `docs/SPIKE_MIRRORING.md` |
| 4 | 미정 | 반전 가정 1~4 (iOS) | 첫 TestFlight 빌드에서 동일 항목 검증 | M9 | `docs/SPIKE_MIRRORING.md` |
| 5 | 미정 | 60fps 측정 방법·허용 오차 | 기준은 PRD §6. 설정값이 아닌 실제 출력·표시로 측정 | M2 측정 시작, M6 확정 | `docs/TEST_PLAN.md` |
| 6 | 미정 | 60fps 미지원 기기 프레임률 | 포맷 정보로 선택하고 근거 기록 | M7 | `docs/TEST_PLAN.md` |
| 7 | 미정 | 저조도 전환 조건·프레임 하한 | 자동 노출·가변 FPS로 충족 가능한지 검증 | M6 | §5, `docs/TEST_PLAN.md` |
| 8 | 미정 | 챌린지 간격 정확도 허용 오차 | UI 스레드 실행, 무조건 보장하지 않음 | M5 측정, M6 확정 | `docs/TEST_PLAN.md` |
| 9 | 미정 | 얼굴 박스 보간 시간·지연 허용치 | 떨림 감소 우선, 지연 누적 금지 | M4 | §6 |
| 10 | 미정 | 감지 빈도·하향/복원 기준 | 작업 중첩 금지, 부하 시 자동 하향 | M4 초안, M6 확정 | §6 |
| 11 | 미정 | 화면 켜짐 유지 API | 선정 Expo SDK에서 확인 | M2 | §5 |
| 12 | 미정 | 박스·격자 선 스타일 | 고정 스타일, 얼굴 가림·가독성 실기기 확인 | 격자 M2, 박스 M4 | §6 |
| 13 | 미정 | 광과민성 경고 문구 | 한/영 문구 추가 검토 | M5 | `src/shared/i18n/` |
| 14 | 미정 | 시작 시간 | PRD §6 목표 3초. 권한 허용 상태 S23에서 측정 | M2 측정, M6 판정 | `docs/TEST_PLAN.md` |
| 15 | 미정 | 저장 시간 허용치 | 임의 합격 수치 없음. 직접 사용 후 결정 | M3 측정, M6 결정 | PRD §6, `docs/TEST_PLAN.md` |
| 16 | 미정 | 최대 해상도와 프리뷰 동시 충족 | 잠정: 충돌 시 최대 해상도 우선, 촬영·저장 중 일시 끊김 허용, 자동 해상도 하향 없음 | M3 측정, M6 재평가 | PRD F5, `docs/TEST_PLAN.md` |
| 17 | 미정 | 연속 사용 5분 발열·끊김 | 사용 시간 제한은 두지 않음 | M6 | `docs/TEST_PLAN.md` |
| 18 | 미정 | 중앙 크롭으로 화각이 맞지 않는 기기 보정 | 해결 전에는 WYSIWYG 통과로 처리하지 않음 | M1 발견 시, M7 | `docs/SPIKE_MIRRORING.md` |
| 19 | 미정 | 권한 문구·앱 이름 다국어 설정 | config plugin locales 방식 확인 | M6 | §8, §10 |
| 20 | 미정 | 릴리스 빌드 외부 통신 없음 | 분석·오류 수집·자동 업데이트 등 자체 서버 통신 없음 확인. 사용자 주도 OS 공유만 허용 | M8 | `docs/RELEASE.md` |
| 21 | 미정 | 스토어 요구사항·정책 문구 | Play 비공개 테스트 요건, 개인정보 라벨, 실물 모드 안내 문구(PRD §1)를 출시 시점 공식 자료로 재확인 | Android M8, iOS M10 | `docs/RELEASE.md` |

- 화면 밝기 조절은 MVP 범위에 추가하지 않으며 기기 설정을 따른다.
- 기술 검증에서 요구사항 간 충돌이 발견되면 추가 인터뷰로 결정하고 PRD에 반영한다.
