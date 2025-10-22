importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
importScripts('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');

let ffmpeg = null;

const resolutions = [
  { name: '240p', width: 426, height: 240, bitrate: '400k', audioBitrate: '64k' },
  { name: '480p', width: 854, height: 480, bitrate: '1000k', audioBitrate: '96k' },
  { name: '720p', width: 1280, height: 720, bitrate: '2500k', audioBitrate: '128k' },
];

async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;

  const { FFmpeg } = FFmpegWASM;
  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    postMessage({ type: 'log', message });
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    postMessage({ type: 'progress', progress: progress * 100, time });
  });

  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
  });

  return ffmpeg;
}

async function generateHLS(inputFileName) {
  const ffmpeg = await loadFFmpeg();
  const outputs = [];

  postMessage({ type: 'status', message: 'Generating HLS renditions...' });

  for (let i = 0; i < resolutions.length; i++) {
    const res = resolutions[i];
    const outputName = `output_${res.name}`;
    const playlistName = `${outputName}.m3u8`;

    postMessage({
      type: 'rendition',
      message: `Transcoding ${res.name}...`,
      current: i + 1,
      total: resolutions.length
    });

    await ffmpeg.exec([
      '-i', inputFileName,
      '-vf', `scale=${res.width}:${res.height}`,
      '-c:v', 'libx264',
      '-b:v', res.bitrate,
      '-c:a', 'aac',
      '-b:a', res.audioBitrate,
      '-hls_time', '4',
      '-hls_playlist_type', 'vod',
      '-hls_segment_filename', `${outputName}_%03d.ts`,
      playlistName
    ]);

    outputs.push({
      resolution: res.name,
      playlist: playlistName,
      bandwidth: parseInt(res.bitrate) * 1000,
      width: res.width,
      height: res.height,
    });
  }

  return outputs;
}

async function generateMasterPlaylist(outputs) {
  let masterContent = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

  for (const output of outputs) {
    masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${output.bandwidth},RESOLUTION=${output.width}x${output.height}\n`;
    masterContent += `${output.playlist}\n`;
  }

  return masterContent;
}

async function extractPoster(inputFileName, timestamp) {
  const ffmpeg = await loadFFmpeg();

  postMessage({ type: 'status', message: 'Extracting poster thumbnail...' });

  await ffmpeg.exec([
    '-i', inputFileName,
    '-ss', timestamp.toString(),
    '-vframes', '1',
    '-vf', 'scale=1280:720',
    '-q:v', '2',
    'poster.jpg'
  ]);

  const posterData = await ffmpeg.readFile('poster.jpg');
  return posterData;
}

async function getVideoDuration(inputFileName) {
  const ffmpeg = await loadFFmpeg();

  await ffmpeg.exec([
    '-i', inputFileName,
    '-f', 'null',
    '-'
  ]);

  return 0;
}

self.onmessage = async (e) => {
  const { type, data } = e.data;

  try {
    if (type === 'transcode') {
      const ffmpeg = await loadFFmpeg();

      postMessage({ type: 'status', message: 'Loading video file...' });
      await ffmpeg.writeFile('input.mp4', data.file);

      const duration = data.duration || 60;
      const posterTimestamp = Math.floor(duration * 0.2);

      const outputs = await generateHLS('input.mp4');
      const masterPlaylist = await generateMasterPlaylist(outputs);

      await ffmpeg.writeFile('master.m3u8', masterPlaylist);

      const posterData = await extractPoster('input.mp4', posterTimestamp);

      postMessage({ type: 'status', message: 'Reading output files...' });

      const files = [];

      files.push({
        name: 'master.m3u8',
        data: await ffmpeg.readFile('master.m3u8'),
      });

      for (const output of outputs) {
        const playlistData = await ffmpeg.readFile(output.playlist);
        files.push({
          name: output.playlist,
          data: playlistData,
        });

        const playlistContent = new TextDecoder().decode(playlistData);
        const segmentMatches = playlistContent.matchAll(/output_\w+_\d+\.ts/g);

        for (const match of segmentMatches) {
          const segmentName = match[0];
          try {
            const segmentData = await ffmpeg.readFile(segmentName);
            files.push({
              name: segmentName,
              data: segmentData,
            });
          } catch (err) {
            console.error(`Failed to read segment ${segmentName}:`, err);
          }
        }
      }

      postMessage({
        type: 'complete',
        files,
        poster: posterData,
      });

    }
  } catch (error) {
    postMessage({
      type: 'error',
      message: error.message || 'Transcoding failed'
    });
  }
};
