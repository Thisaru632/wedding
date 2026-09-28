import cv2
import os

cap = cv2.VideoCapture('tiktok_video.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total_frames / fps
print(f"FPS: {fps}, Total Frames: {total_frames}, Duration: {duration:.2f}s")

os.makedirs('video_frames', exist_ok=True)

# Extract 1 frame per second or every 0.5s
interval = int(fps * 0.5) if fps > 0 else 15
count = 0
frame_idx = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    if frame_idx % interval == 0:
        cv2.imwrite(f'video_frames/frame_{count:03d}_{frame_idx/fps:.1f}s.jpg', frame)
        count += 1
    frame_idx += 1

cap.release()
print(f"Extracted {count} frames to video_frames/")
