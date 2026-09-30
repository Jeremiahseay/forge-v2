# Forge Fitness V2
This build makes the locked V2 architecture active in the browser instead of using dead placeholders.

## Active
- Training logger for current user + fiancée
- Baseline data capture
- Goal engine
- Structural Body Type profile
- Body Shape profile with sex-aware presentation field and proportional measurements
- 3D scan workflow prototype: quality gate, red/clear state, pose silhouette, GO, auto-capture, capture sound, manual-scan path, scan history, quality state, schedule options
- Independent Exercise Knowledge Base with 303 starter records
- Full-library browsing, search, filters, sorting, exercise pages, ratings
- Weekly review decision workflow
- Local persistence

## Scan implementation note
The V2 scan UI implements the specified interaction/quality workflow, but it is not a real 3D reconstruction or body-composition estimator yet. Real camera pose detection, multi-view reconstruction, measurements, and longitudinal regional analysis require a computer-vision backend/model and source-validated implementation. This build does not pretend that a fake camera animation is a real scan.

## Supabase
Not wired in this V2 so the app remains testable immediately. The previously designed Supabase architecture can be connected next without changing the UX contracts.


## Scan Prototype — real camera / pose stage
The scan prototype now uses the device camera through `getUserMedia`, MediaPipe Pose Landmarker for real-time landmarks, frame-quality heuristics, automatic quality-gated captures, four-view capture, and IndexedDB storage for captured JPEG frames.

It intentionally does NOT claim that these frames are a 3D reconstruction. The next engineering stage is multi-view calibration/reconstruction and validation against physical measurements.


### Prototype fix
This build uses the browser ESM version of MediaPipe Tasks Vision and does not require a global script symbol. Four-view orientation is treated as a capture protocol; the live pose gate verifies body visibility/framing/stability rather than incorrectly requiring a frontal pose for side/back views.
