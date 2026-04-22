import {
  useState,
  useRef,
  useCallback,
} from "react";

/**
 * useAudioRecorder — custom hook to handle audio recording in the browser.
 *
 * Provides methods for starting and stopping a recording, tracks the current
 * recording state, and manages the generated audio URL.
 *
 * @returns {
 *   recording: boolean,
 *   audioURL: string | null,
 *   startRecording: () => Promise<void>,
 *   stopRecording: () => void
 * }
 */
export function useAudioRecorder() {
  const [recording, setRecording] =
    useState(false);
  const [audioURL, setAudioURL] = useState<
    string | null
  >(null);

  // We use Refs for MediaRecorder and chunks to avoid re-renders during recording data flow
  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * Starts a new recording session.
   * Requests microphone access and sets up the MediaRecorder instance.
   */
  const startRecording = useCallback(async () => {
    audioChunksRef.current = [];

    try {
      // 1. Request microphone access
      const stream =
        await navigator.mediaDevices.getUserMedia(
          { audio: true },
        );

      // 2. Determine optimal MIME type (prioritizing opus for quality/efficiency)
      const mimeType =
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus",
        )
          ? "audio/webm;codecs=opus"
          : "audio/mp4";

      // 3. Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(
        stream,
        { mimeType },
      );
      mediaRecorderRef.current = mediaRecorder;

      // 4. Capture audio data as it arrives
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 5. Finalize the audio blob when recording stops
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          { type: mimeType },
        );
        const url =
          URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Crucial: Stop all microphone tracks to turn off the hardware light/indicator
        stream
          .getTracks()
          .forEach((track) => track.stop());
      };

      // 6. Begin recording
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error(
        "useAudioRecorder: Failed to start recording:",
        err,
      );
      throw err; // Re-throw so the UI can handle the error if needed
    }
  }, []);

  /**
   * Stops the active recording session.
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  return {
    recording,
    audioURL,
    startRecording,
    stopRecording,
  };
}
